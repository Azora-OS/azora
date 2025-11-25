const express = require('express');
const compression = require('compression');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { helmetConfig, corsConfig, rateLimiters, errorHandler } = require('../shared/middleware');

const app = express();

// Security middleware stack
app.use(helmetConfig);
app.use(corsConfig);
app.use(compression());
app.use(express.json());
app.use(rateLimiters.financial); // Payment service - strict rate limiting

const PORT = process.env.PORT || 3010;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'azora-pay', timestamp: new Date().toISOString() });
});

// Create payment intent
app.post('/api/payments/intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', userId } = req.body;

    // 1. Record to Blockchain (using existing azora-mint/blockchain-ledger)
    // In production, import and use: const { azoraBlockchain } = require('../azora-mint/blockchain-ledger');
    const mutationRecord = {
      id: require('crypto').randomUUID(),
      timestamp: new Date().toISOString(),
      actorId: userId,
      actionType: 'PAYMENT_INTENT',
      payloadHash: require('crypto').createHash('sha256').update(JSON.stringify({ amount, currency, userId })).digest('hex'),
      previousHash: '0',
      signature: 'MOCK_SIGNATURE',
      metadata: { amount, currency }
    };

    // Record to Blockchain via azora-mint service
    // TODO: Replace with direct blockchain.createTransaction() call
    try {
      const blockchainResponse = await fetch('http://localhost:3011/api/blockchain/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: userId,
          to: 'stripe-gateway',
          amount: amount,
          currency: 'AZR', // Convert to AZR in production
          type: 'Transfer',
          data: { paymentIntent: true, fiatCurrency: currency }
        })
      }).catch(() => null);

      if (!blockchainResponse || !blockchainResponse.ok) {
        console.warn('Blockchain recording failed, proceeding with payment');
        // Fail-open for now (in production, decide based on criticality)
      }
    } catch (blockchainError) {
      console.error('Blockchain recording error:', blockchainError);
    }

    // 2. Contribute to CitadelFund (10% of payment)
    try {
      await fetch('http://localhost:3011/api/citadel/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: userId,
          amount: amount * 0.10, // 10% contribution
          metadata: { paymentId: mutationRecord.id, currency }
        })
      }).catch(() => console.warn('CitadelFund contribution failed'));
    } catch (citadelError) {
      console.warn('CitadelFund error:', citadelError);
    }

    // 3. Proceed with Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: { userId, blockchainRecordId: mutationRecord.id }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      blockchainRecordId: mutationRecord.id,
      citadelContribution: amount * 0.10
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process payment
app.post('/api/payments/process', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook handler
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'payment_intent.succeeded') {
      console.log('Payment succeeded:', event.data.object.id);
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`💰 Azora Pay running on port ${PORT}`);
});

module.exports = app;
