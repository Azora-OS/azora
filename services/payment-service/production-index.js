const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const StripeGateway = require('./stripe-integration');

const app = express();
const prisma = new PrismaClient();
const stripe = new StripeGateway();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'payment-service', stripe: !!process.env.STRIPE_SECRET_KEY });
});

// Create payment
app.post('/api/payments', async (req, res) => {
  try {
    const { userId, amount, currency = 'usd', description } = req.body;
    
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment data' });
    }

    // Get or create Stripe customer
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user.stripeCustomerId) {
      const { success, customerId } = await stripe.createCustomer({
        email: user.email,
        name: user.name,
        metadata: { userId }
      });
      if (success) {
        user = await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: customerId }
        });
      }
    }

    // Create payment intent
    const result = await stripe.createPaymentIntent({
      amount,
      currency,
      customerId: user.stripeCustomerId,
      metadata: { userId, description }
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Save to database
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        currency,
        status: 'pending',
        stripePaymentIntentId: result.paymentIntentId,
        description
      }
    });

    res.json({ 
      payment,
      clientSecret: result.clientSecret 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stripe webhook
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const { success, event, error } = stripe.verifyWebhookSignature(req.body, sig);
  
  if (!success) {
    return res.status(400).json({ error });
  }

  await stripe.handleWebhookEvent(event);
  
  // Update payment status
  if (event.type === 'payment_intent.succeeded') {
    await prisma.payment.updateMany({
      where: { stripePaymentIntentId: event.data.object.id },
      data: { status: 'completed', completedAt: new Date() }
    });
  }

  res.json({ received: true });
});

// Get user payments
app.get('/api/payments/user/:userId', async (req, res) => {
  const payments = await prisma.payment.findMany({
    where: { userId: req.params.userId },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ payments });
});

const PORT = process.env.PORT || 3039;
app.listen(PORT, () => console.log(`💳 Payment service (PRODUCTION) on ${PORT}`));

module.exports = app;
