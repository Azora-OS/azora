const express = require('express');
const { createPaymentIntent, handleWebhook } = require('../integrations/stripe');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

router.post('/create-payment', async (req, res) => {
  try {
    const { amount, currency, userId, metadata } = req.body;
    const paymentIntent = await createPaymentIntent(amount, currency, userId, metadata);
    res.json({ clientSecret: paymentIntent.client_secret, id: paymentIntent.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    await handleWebhook(event);
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
