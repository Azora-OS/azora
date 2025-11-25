const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const StripePaymentGateway = require('./stripe-integration');

const app = express();
const PORT = process.env.PORT || 3039;

// Initialize Stripe gateway
const stripeGateway = new StripePaymentGateway();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Raw body for webhooks
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json());

// In-memory storage (replace with database in production)
const transactions = new Map();
const customers = new Map();
const subscriptions = new Map();

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'payment-service-enhanced', 
    timestamp: new Date().toISOString(),
    features: ['stripe', 'azr-tokens', 'subscriptions', 'webhooks']
  });
});

// Customer Management
app.post('/api/customers', async (req, res) => {
  try {
    const { userId, email, name } = req.body;
    
    if (!userId || !email) {
      return res.status(400).json({ error: 'userId and email are required' });
    }

    // Check if customer already exists
    if (customers.has(userId)) {
      return res.json({ success: true, customer: customers.get(userId) });
    }

    // Create Stripe customer
    const result = await stripeGateway.createCustomer({
      email,
      name,
      metadata: { userId, platform: 'azora-os' }
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const customer = {
      userId,
      stripeCustomerId: result.customerId,
      email,
      name,
      createdAt: new Date()
    };

    customers.set(userId, customer);
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/customers/:userId', async (req, res) => {
  try {
    const customer = customers.get(req.params.userId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get latest data from Stripe
    const stripeResult = await stripeGateway.getCustomer(customer.stripeCustomerId);
    if (stripeResult.success) {
      customer.stripeData = stripeResult.customer;
    }

    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Payment Intent Creation
app.post('/api/payment-intents', async (req, res) => {
  try {
    const { userId, amount, currency = 'usd', description, courseId } = req.body;
    
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment data' });
    }

    const customer = customers.get(userId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found. Create customer first.' });
    }

    const result = await stripeGateway.createPaymentIntent({
      amount,
      currency,
      customerId: customer.stripeCustomerId,
      metadata: {
        userId,
        description,
        courseId: courseId || '',
        type: 'course_enrollment'
      }
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Store transaction locally
    const transactionId = `TXN-${crypto.randomUUID()}`;
    const transaction = {
      transactionId,
      userId,
      stripePaymentIntentId: result.paymentIntentId,
      amount,
      currency,
      description,
      courseId,
      status: 'pending',
      createdAt: new Date()
    };

    transactions.set(transactionId, transaction);

    res.json({
      success: true,
      clientSecret: result.clientSecret,
      transactionId,
      amount: result.amount,
      currency: result.currency
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subscription Management
app.post('/api/subscriptions', async (req, res) => {
  try {
    const { userId, priceId, planName } = req.body;
    
    if (!userId || !priceId) {
      return res.status(400).json({ error: 'userId and priceId are required' });
    }

    const customer = customers.get(userId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found. Create customer first.' });
    }

    const result = await stripeGateway.createSubscription({
      customerId: customer.stripeCustomerId,
      priceId,
      metadata: {
        userId,
        planName: planName || 'Premium Plan'
      }
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Store subscription locally
    const subscription = {
      userId,
      stripeSubscriptionId: result.subscriptionId,
      priceId,
      planName,
      status: 'incomplete',
      createdAt: new Date()
    };

    subscriptions.set(result.subscriptionId, subscription);

    res.json({
      success: true,
      subscriptionId: result.subscriptionId,
      clientSecret: result.clientSecret
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/subscriptions/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    
    const subscription = subscriptions.get(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const result = await stripeGateway.cancelSubscription(subscriptionId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    subscription.status = 'canceled';
    subscription.canceledAt = new Date();

    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refunds
app.post('/api/refunds', async (req, res) => {
  try {
    const { transactionId, amount, reason } = req.body;
    
    const transaction = transactions.get(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status === 'refunded') {
      return res.status(400).json({ error: 'Transaction already refunded' });
    }

    const result = await stripeGateway.createRefund({
      paymentIntentId: transaction.stripePaymentIntentId,
      amount,
      reason
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    transaction.status = 'refunded';
    transaction.refundedAt = new Date();
    transaction.refundAmount = result.amount;

    res.json({
      success: true,
      refundId: result.refundId,
      amount: result.amount,
      status: result.status
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Payment Methods
app.get('/api/customers/:userId/payment-methods', async (req, res) => {
  try {
    const customer = customers.get(req.params.userId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const result = await stripeGateway.getPaymentMethods(customer.stripeCustomerId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, paymentMethods: result.paymentMethods });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customers/:userId/setup-intent', async (req, res) => {
  try {
    const customer = customers.get(req.params.userId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const result = await stripeGateway.createSetupIntent(customer.stripeCustomerId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      clientSecret: result.clientSecret,
      setupIntentId: result.setupIntentId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stripe Webhooks
app.post('/api/webhooks/stripe', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const payload = req.body;

    const verification = stripeGateway.verifyWebhookSignature(payload, signature);
    if (!verification.success) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const result = await stripeGateway.handleWebhookEvent(verification.event);
    
    // Update local data based on webhook
    await updateLocalDataFromWebhook(verification.event);

    res.json({ success: true, received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update local data from webhook events
async function updateLocalDataFromWebhook(event) {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Update transaction status
        for (const [id, transaction] of transactions) {
          if (transaction.stripePaymentIntentId === event.data.object.id) {
            transaction.status = 'completed';
            transaction.completedAt = new Date();
            break;
          }
        }
        break;
      
      case 'payment_intent.payment_failed':
        // Update transaction status
        for (const [id, transaction] of transactions) {
          if (transaction.stripePaymentIntentId === event.data.object.id) {
            transaction.status = 'failed';
            transaction.failedAt = new Date();
            break;
          }
        }
        break;
      
      case 'customer.subscription.updated':
        // Update subscription status
        const subscription = subscriptions.get(event.data.object.id);
        if (subscription) {
          subscription.status = event.data.object.status;
          subscription.updatedAt = new Date();
        }
        break;
    }
  } catch (error) {
    console.error('Error updating local data from webhook:', error);
  }
}

// Transaction History
app.get('/api/transactions', (req, res) => {
  const { userId, status, limit = 50 } = req.query;
  
  let userTransactions = Array.from(transactions.values());
  
  if (userId) {
    userTransactions = userTransactions.filter(t => t.userId === userId);
  }
  
  if (status) {
    userTransactions = userTransactions.filter(t => t.status === status);
  }
  
  userTransactions = userTransactions
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, parseInt(limit));
  
  res.json({ success: true, transactions: userTransactions });
});

app.get('/api/transactions/:transactionId', (req, res) => {
  const transaction = transactions.get(req.params.transactionId);
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  res.json({ success: true, transaction });
});

// AZR Token Integration (existing functionality)
app.get('/api/wallet/:userId/balance', (req, res) => {
  // Calculate AZR balance from completed transactions
  const userTransactions = Array.from(transactions.values())
    .filter(t => t.userId === req.params.userId && t.status === 'completed');
  
  const azrBalance = userTransactions.reduce((sum, t) => {
    if (t.currency === 'azr') {
      return sum + t.amount;
    }
    return sum;
  }, 0);
  
  res.json({
    success: true,
    wallet: {
      userId: req.params.userId,
      balance: azrBalance,
      currency: 'AZR',
      transactionCount: userTransactions.length
    }
  });
});

// Legacy routes for compatibility
app.use(require('./routes'));

app.listen(PORT, () => {
  console.log(`💳 Enhanced Payment Service running on port ${PORT}`);
  console.log(`🔗 Stripe integration: ${process.env.STRIPE_SECRET_KEY ? 'ENABLED' : 'DISABLED'}`);
  console.log(`📡 Webhook endpoint: /api/webhooks/stripe`);
});

module.exports = app;