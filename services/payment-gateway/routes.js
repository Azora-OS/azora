const express = require('express');
const router = express.Router();
const processor = require('./payment-processor');

router.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Create Stripe payment
router.post('/api/payments/stripe', async (req, res) => {
  try {
    const { amount, currency, userId, metadata } = req.body;
    const result = await processor.createStripePayment(amount, currency, userId, metadata);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create PayPal payment
router.post('/api/payments/paypal', async (req, res) => {
  try {
    const { amount, currency, userId } = req.body;
    const result = await processor.createPayPalPayment(amount, currency, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create crypto payment
router.post('/api/payments/crypto', async (req, res) => {
  try {
    const { amount, currency, userId, cryptoType } = req.body;
    const result = await processor.createCryptoPayment(amount, currency, userId, cryptoType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stripe webhook
router.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const event = processor.verifyStripeWebhook(req.body, signature);
    
    // Handle event
    console.log('Stripe webhook:', event.type);
    
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
