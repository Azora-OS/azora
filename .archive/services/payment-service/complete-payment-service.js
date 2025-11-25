const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import our payment modules
const StripePaymentGateway = require('./stripe-integration');
const AZRTokenSystem = require('./azr-token-system');
const KYCComplianceSystem = require('./kyc-compliance');
const paymentUIRouter = require('./payment-ui-api');

const app = express();
const PORT = process.env.PORT || 3039;

// Initialize systems
const stripeGateway = new StripePaymentGateway();
const azrTokens = new AZRTokenSystem();
const kycSystem = new KYCComplianceSystem();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Raw body for webhooks
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json());

// Use payment UI router
app.use(paymentUIRouter);

// Health check
app.get('/health', (req, res) => {
  const systemStats = azrTokens.getSystemStats();
  res.json({ 
    status: 'healthy', 
    service: 'complete-payment-service', 
    timestamp: new Date().toISOString(),
    features: [
      'stripe-integration',
      'azr-tokens',
      'kyc-compliance',
      'payment-ui',
      'webhooks',
      'staking',
      'multi-currency'
    ],
    stats: {
      azrSupply: systemStats.totalSupply,
      totalWallets: systemStats.totalWallets,
      stripeEnabled: !!process.env.STRIPE_SECRET_KEY
    }
  });
});

// === KYC ENDPOINTS ===

// Initialize KYC for user
app.post('/api/kyc/initialize', async (req, res) => {
  try {
    const { userId, userType = 'individual' } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const kycRecord = kycSystem.initializeKYC(userId, userType);
    res.json({ success: true, kyc: kycRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit KYC document
app.post('/api/kyc/documents', async (req, res) => {
  try {
    const { userId, documentType, documentData } = req.body;
    
    if (!userId || !documentType || !documentData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = kycSystem.submitDocument(userId, documentType, documentData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get KYC status
app.get('/api/kyc/status/:userId', async (req, res) => {
  try {
    const status = kycSystem.getKYCStatus(req.params.userId);
    res.json({ success: true, ...status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get required documents for next level
app.get('/api/kyc/requirements/:userId', async (req, res) => {
  try {
    const requirements = kycSystem.getRequiredDocuments(req.params.userId);
    res.json(requirements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === AZR TOKEN ENDPOINTS ===

// Create AZR wallet
app.post('/api/azr/wallet', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const wallet = azrTokens.createWallet(userId);
    res.json({ success: true, wallet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AZR balance
app.get('/api/azr/balance/:userId', async (req, res) => {
  try {
    const balance = azrTokens.getBalance(req.params.userId);
    if (!balance) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    res.json({ success: true, balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reward learning activity
app.post('/api/azr/reward', async (req, res) => {
  try {
    const { userId, activityType, points } = req.body;
    
    if (!userId || !activityType) {
      return res.status(400).json({ error: 'userId and activityType are required' });
    }

    // Check KYC compliance
    const complianceCheck = kycSystem.checkTransactionAllowed(userId, points || 100, 'reward');
    if (!complianceCheck.allowed) {
      return res.status(403).json({ error: complianceCheck.error, compliance: complianceCheck });
    }

    const result = azrTokens.rewardLearning(userId, activityType, points);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transfer AZR tokens
app.post('/api/azr/transfer', async (req, res) => {
  try {
    const { fromUserId, toUserId, amount, description } = req.body;
    
    if (!fromUserId || !toUserId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid transfer data' });
    }

    // Check KYC compliance for sender
    const complianceCheck = kycSystem.checkTransactionAllowed(fromUserId, amount, 'transfer');
    if (!complianceCheck.allowed) {
      return res.status(403).json({ error: complianceCheck.error, compliance: complianceCheck });
    }

    const result = azrTokens.transferTokens(fromUserId, toUserId, amount, description);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stake AZR tokens
app.post('/api/azr/stake', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid staking data' });
    }

    const result = azrTokens.stakeTokens(userId, amount);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculate staking rewards
app.get('/api/azr/staking-reward/:userId', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const result = azrTokens.calculateStakingReward(req.params.userId, parseInt(days));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Purchase AZR with fiat
app.post('/api/azr/purchase', async (req, res) => {
  try {
    const { userId, fiatAmount, currency = 'USD', paymentMethod = 'stripe' } = req.body;
    
    if (!userId || !fiatAmount || fiatAmount <= 0) {
      return res.status(400).json({ error: 'Invalid purchase data' });
    }

    // Check KYC compliance
    const complianceCheck = kycSystem.checkTransactionAllowed(userId, fiatAmount, 'purchase');
    if (!complianceCheck.allowed) {
      return res.status(403).json({ error: complianceCheck.error, compliance: complianceCheck });
    }

    const result = azrTokens.purchaseAZR(userId, fiatAmount, currency, paymentMethod);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AZR transaction history
app.get('/api/azr/transactions/:userId', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const result = azrTokens.getTransactionHistory(req.params.userId, parseInt(limit));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === STRIPE PAYMENT ENDPOINTS ===

// Create Stripe customer
app.post('/api/stripe/customers', async (req, res) => {
  try {
    const { userId, email, name } = req.body;
    
    if (!userId || !email) {
      return res.status(400).json({ error: 'userId and email are required' });
    }

    // Check KYC status
    const kycStatus = kycSystem.getKYCStatus(userId);
    if (!kycStatus.exists) {
      return res.status(400).json({ error: 'KYC verification required before creating payment account' });
    }

    const result = await stripeGateway.createCustomer({ email, name, metadata: { userId } });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create payment intent
app.post('/api/stripe/payment-intents', async (req, res) => {
  try {
    const { userId, amount, currency = 'usd', customerId, description } = req.body;
    
    if (!userId || !amount || amount <= 0 || !customerId) {
      return res.status(400).json({ error: 'Invalid payment intent data' });
    }

    // Check KYC compliance
    const complianceCheck = kycSystem.checkTransactionAllowed(userId, amount, 'payment');
    if (!complianceCheck.allowed) {
      return res.status(403).json({ error: complianceCheck.error, compliance: complianceCheck });
    }

    const result = await stripeGateway.createPaymentIntent({
      amount,
      currency,
      customerId,
      metadata: { userId, description }
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create subscription
app.post('/api/stripe/subscriptions', async (req, res) => {
  try {
    const { userId, customerId, priceId, planName } = req.body;
    
    if (!userId || !customerId || !priceId) {
      return res.status(400).json({ error: 'Missing required subscription data' });
    }

    // Check KYC compliance for recurring payments
    const complianceCheck = kycSystem.checkTransactionAllowed(userId, 100, 'subscription'); // Assume $100 for compliance check
    if (!complianceCheck.allowed) {
      return res.status(403).json({ error: complianceCheck.error, compliance: complianceCheck });
    }

    const result = await stripeGateway.createSubscription({
      customerId,
      priceId,
      metadata: { userId, planName }
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stripe webhooks
app.post('/api/webhooks/stripe', async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const payload = req.body;

    const verification = stripeGateway.verifyWebhookSignature(payload, signature);
    if (!verification.success) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const result = await stripeGateway.handleWebhookEvent(verification.event);
    
    // Handle successful payments by minting AZR tokens
    if (verification.event.type === 'payment_intent.succeeded') {
      const paymentIntent = verification.event.data.object;
      const userId = paymentIntent.metadata.userId;
      
      if (userId) {
        // Convert payment to AZR tokens (example: $1 = 10 AZR)
        const azrAmount = (paymentIntent.amount / 100) * 10;
        azrTokens.mintTokens(userId, azrAmount, 'fiat_purchase');
      }
    }

    res.json({ success: true, received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// === ADMIN ENDPOINTS ===

// Admin: Verify KYC document
app.post('/api/admin/kyc/verify', async (req, res) => {
  try {
    const { userId, documentType, approved, reason } = req.body;
    
    // In production, add admin authentication here
    
    const result = kycSystem.verifyDocument(userId, documentType, approved, reason);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Add compliance flag
app.post('/api/admin/kyc/flag', async (req, res) => {
  try {
    const { userId, flagType, reason, severity } = req.body;
    
    const result = kycSystem.addFlag(userId, flagType, reason, severity);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get compliance report
app.get('/api/admin/compliance-report', async (req, res) => {
  try {
    const report = kycSystem.generateComplianceReport();
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get system statistics
app.get('/api/admin/system-stats', async (req, res) => {
  try {
    const azrStats = azrTokens.getSystemStats();
    const complianceReport = kycSystem.generateComplianceReport();
    
    res.json({
      success: true,
      stats: {
        azr: azrStats,
        compliance: complianceReport,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === UTILITY ENDPOINTS ===

// Convert currencies
app.post('/api/convert', async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;
    
    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({ error: 'Missing conversion parameters' });
    }

    let result;
    if (fromCurrency.toUpperCase() === 'AZR') {
      result = azrTokens.convertToFiat(amount, toCurrency);
    } else if (toCurrency.toUpperCase() === 'AZR') {
      result = azrTokens.convertFromFiat(amount, fromCurrency);
    } else {
      return res.status(400).json({ error: 'At least one currency must be AZR' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Payment service error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'POST /api/kyc/initialize',
      'POST /api/azr/wallet',
      'POST /api/stripe/customers',
      'GET /api/ui/payment-config'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`💳 Complete Payment Service running on port ${PORT}`);
  console.log(`🔗 Stripe integration: ${process.env.STRIPE_SECRET_KEY ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🪙 AZR Token System: ENABLED`);
  console.log(`🛡️ KYC Compliance: ENABLED`);
  console.log(`📱 Payment UI API: ENABLED`);
  console.log(`📡 Webhook endpoint: /api/webhooks/stripe`);
  console.log(`🎯 Features: Real payments, AZR tokens, KYC compliance, Staking, Multi-currency`);
});

module.exports = app;