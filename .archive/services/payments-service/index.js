const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'payments-service' });
});

// Create payment intent
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', description, userId } = req.body;

    if (!amount || !userId) {
      return res.status(400).json({ error: 'Amount and userId are required' });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      description,
      metadata: { userId }
    });

    // Record payment in database
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        currency: currency.toUpperCase(),
        description,
        providerId: paymentIntent.id,
        status: 'pending'
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Confirm payment
app.post('/confirm-payment/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { paymentIntentId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Update payment status
    const status = paymentIntent.status === 'succeeded' ? 'succeeded' : 'failed';

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        updatedAt: new Date()
      }
    });

    // Create transaction record
    if (status === 'succeeded') {
      await prisma.transaction.create({
        data: {
          userId: payment.userId,
          type: 'payment',
          amount: payment.amount,
          currency: payment.currency,
          description: payment.description,
          balance: 0, // Would calculate actual balance
          providerId: paymentIntentId
        }
      });
    }

    res.json({ success: true, payment });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Add payment method
app.post('/payment-methods', async (req, res) => {
  try {
    const { userId, paymentMethodId } = req.body;

    if (!userId || !paymentMethodId) {
      return res.status(400).json({ error: 'userId and paymentMethodId are required' });
    }

    // Retrieve payment method from Stripe
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Save payment method
    const savedMethod = await prisma.paymentMethod.create({
      data: {
        userId,
        type: paymentMethod.type,
        providerId: paymentMethod.id,
        last4: paymentMethod.card?.last4,
        brand: paymentMethod.card?.brand,
        expiryMonth: paymentMethod.card?.exp_month,
        expiryYear: paymentMethod.card?.exp_year
      }
    });

    res.json({ success: true, paymentMethod: savedMethod });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({ error: 'Failed to add payment method' });
  }
});

// Get user payment methods
app.get('/users/:userId/payment-methods', async (req, res) => {
  try {
    const { userId } = req.params;

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ paymentMethods });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ error: 'Failed to get payment methods' });
  }
});

// Create subscription
app.post('/create-subscription', async (req, res) => {
  try {
    const { userId, planId, paymentMethodId } = req.body;

    if (!userId || !planId || !paymentMethodId) {
      return res.status(400).json({ error: 'userId, planId, and paymentMethodId are required' });
    }

    // Get plan details (would need to be stored in database)
    const plan = await getPlanById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Create subscription with Stripe
    const subscription = await stripe.subscriptions.create({
      customer: await getOrCreateCustomer(userId),
      items: [{
        price_data: {
          currency: plan.currency.toLowerCase(),
          product_data: {
            name: plan.name,
            description: plan.description
          },
          unit_amount: Math.round(plan.price * 100),
          recurring: {
            interval: plan.interval
          }
        }
      }],
      default_payment_method: paymentMethodId,
      metadata: { userId, planId }
    });

    // Save subscription in database
    const savedSubscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        providerId: subscription.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        status: subscription.status
      }
    });

    res.json({ success: true, subscription: savedSubscription });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Cancel subscription
app.post('/subscriptions/:subscriptionId/cancel', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { cancelAtPeriodEnd = true } = req.body;

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Cancel with Stripe
    await stripe.subscriptions.update(subscription.providerId, {
      cancel_at_period_end: cancelAtPeriodEnd
    });

    // Update in database
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd,
        status: cancelAtPeriodEnd ? 'active' : 'canceled',
        updatedAt: new Date()
      }
    });

    res.json({ success: true, subscription: updatedSubscription });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Get user subscriptions
app.get('/users/:userId/subscriptions', async (req, res) => {
  try {
    const { userId } = req.params;

    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ subscriptions });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Failed to get subscriptions' });
  }
});

// Get payment history
app.get('/users/:userId/payments', async (req, res) => {
  try {
    const { userId } = req.params;

    const payments = await prisma.payment.findMany({
      where: { userId },
      include: {
        paymentMethod: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ payments });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to get payments' });
  }
});

// Get transaction history
app.get('/users/:userId/transactions', async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// Get payment reconciliation report
app.get('/reconciliation', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get payments from database
    const dbPayments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      }
    });

    // Get payments from Stripe (in production, you'd paginate through all payments)
    const stripePayments = await stripe.paymentIntents.list({
      created: {
        gte: Math.floor(start.getTime() / 1000),
        lte: Math.floor(end.getTime() / 1000)
      },
      limit: 100
    });

    // Compare and identify discrepancies
    const reconciliation = {
      period: { start, end },
      databasePayments: dbPayments.length,
      stripePayments: stripePayments.data.length,
      discrepancies: [],
      summary: {
        totalAmount: dbPayments.reduce((sum, p) => sum + p.amount, 0),
        successfulPayments: dbPayments.filter(p => p.status === 'succeeded').length,
        failedPayments: dbPayments.filter(p => p.status === 'failed').length
      }
    };

    // Check for missing payments in database
    for (const stripePayment of stripePayments.data) {
      const dbPayment = dbPayments.find(p => p.providerId === stripePayment.id);
      if (!dbPayment) {
        reconciliation.discrepancies.push({
          type: 'missing_in_database',
          stripeId: stripePayment.id,
          amount: stripePayment.amount / 100,
          status: stripePayment.status
        });
      }
    }

    // Check for payments in database not in Stripe
    for (const dbPayment of dbPayments) {
      if (dbPayment.providerId) {
        const stripePayment = stripePayments.data.find(p => p.id === dbPayment.providerId);
        if (!stripePayment) {
          reconciliation.discrepancies.push({
            type: 'missing_in_stripe',
            databaseId: dbPayment.id,
            stripeId: dbPayment.providerId,
            amount: dbPayment.amount,
            status: dbPayment.status
          });
        }
      }
    }

    res.json({ reconciliation });
  } catch (error) {
    console.error('Reconciliation error:', error);
    res.status(500).json({ error: 'Failed to generate reconciliation report' });
  }
});

// Process refunds
app.post('/refunds', async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    // Get original payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'succeeded') {
      return res.status(400).json({ error: 'Can only refund successful payments' });
    }

    const refundAmount = amount || payment.amount;

    // Create refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.providerId,
      amount: Math.round(refundAmount * 100),
      reason: reason || 'requested_by_customer'
    });

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'refunded', updatedAt: new Date() }
    });

    // Create refund transaction
    await prisma.transaction.create({
      data: {
        userId: payment.userId,
        type: 'refund',
        amount: -refundAmount,
        currency: payment.currency,
        description: `Refund for payment ${paymentId}`,
        balance: 0, // Would calculate actual balance
        providerId: refund.id,
        metadata: { originalPaymentId: paymentId, reason }
      }
    });

    res.json({
      success: true,
      refundId: refund.id,
      amount: refundAmount,
      status: refund.status
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

// Get payment analytics
app.get('/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get payment statistics
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const analytics = {
      period: { start: startDate, end: endDate },
      totalPayments: payments.length,
      successfulPayments: payments.filter(p => p.status === 'succeeded').length,
      failedPayments: payments.filter(p => p.status === 'failed').length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      averageAmount: payments.length > 0 ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length : 0,
      paymentMethods: {},
      dailyBreakdown: []
    };

    // Group by payment method
    payments.forEach(payment => {
      const method = payment.paymentMethodId ? 'card' : 'other';
      analytics.paymentMethods[method] = (analytics.paymentMethods[method] || 0) + 1;
    });

    // Daily breakdown (simplified)
    const dailyData = {};
    payments.forEach(payment => {
      const date = payment.createdAt.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { count: 0, amount: 0 };
      }
      dailyData[date].count++;
      dailyData[date].amount += payment.amount;
    });

    analytics.dailyBreakdown = Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data
    }));

    res.json({ analytics });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

// Bulk payment processing
app.post('/bulk-payments', async (req, res) => {
  try {
    const { payments } = req.body;

    if (!Array.isArray(payments) || payments.length === 0) {
      return res.status(400).json({ error: 'Payments array is required' });
    }

    const results = [];

    for (const payment of payments) {
      try {
        // Create payment intent for each payment
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(payment.amount * 100),
          currency: payment.currency || 'usd',
          description: payment.description,
          metadata: {
            userId: payment.userId,
            batchId: req.body.batchId
          }
        });

        // Save to database
        const dbPayment = await prisma.payment.create({
          data: {
            userId: payment.userId,
            amount: payment.amount,
            currency: payment.currency || 'USD',
            description: payment.description,
            providerId: paymentIntent.id,
            status: 'pending'
          }
        });

        results.push({
          success: true,
          paymentId: dbPayment.id,
          clientSecret: paymentIntent.client_secret
        });
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          payment: payment
        });
      }
    }

    res.json({
      batchId: req.body.batchId,
      totalPayments: payments.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    });
  } catch (error) {
    console.error('Bulk payment error:', error);
    res.status(500).json({ error: 'Failed to process bulk payments' });
  }
});

// Webhook endpoint for Stripe events
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Helper functions
async function getOrCreateCustomer(userId) {
  // In a real implementation, you'd store customer IDs in your database
  // For now, create a new customer each time (not recommended for production)
  const customer = await stripe.customers.create({
    metadata: { userId }
  });
  return customer.id;
}

async function getPlanById(planId) {
  // Mock plan data - in production, this would come from your database
  const plans = {
    'basic': { id: 'basic', name: 'Basic Plan', price: 9.99, currency: 'USD', interval: 'month' },
    'pro': { id: 'pro', name: 'Pro Plan', price: 29.99, currency: 'USD', interval: 'month' },
    'enterprise': { id: 'enterprise', name: 'Enterprise Plan', price: 99.99, currency: 'USD', interval: 'month' }
  };
  return plans[planId];
}

async function handlePaymentSucceeded(paymentIntent) {
  const payment = await prisma.payment.updateMany({
    where: { providerId: paymentIntent.id },
    data: { status: 'succeeded', updatedAt: new Date() }
  });
}

async function handleInvoicePaymentSucceeded(invoice) {
  // Handle successful invoice payment
  console.log('Invoice payment succeeded:', invoice.id);
}

async function handleSubscriptionUpdated(subscription) {
  await prisma.subscription.updateMany({
    where: { providerId: subscription.id },
    data: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: new Date()
    }
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 3008;
app.listen(PORT, async () => {
  console.log(`💳 Azora Payments Service running on port ${PORT}`);
  console.log(`💰 Payment Intent: POST http://localhost:${PORT}/create-payment-intent`);
  console.log(`📋 Subscriptions: POST http://localhost:${PORT}/create-subscription`);
  console.log(`🧾 Payments: GET http://localhost:${PORT}/users/:id/payments`);

  try {
    await prisma.$connect();
    console.log('🗄️  Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
});