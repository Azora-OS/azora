const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createPaymentIntent(amount, currency, userId, metadata = {}) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: currency.toLowerCase(),
    metadata: { userId, ...metadata },
  });

  await prisma.transaction.create({
    data: {
      userId,
      amount,
      currency,
      type: 'PAYMENT',
      status: 'PENDING',
      provider: 'STRIPE',
      externalId: paymentIntent.id,
      metadata: JSON.stringify(metadata),
    },
  });

  return paymentIntent;
}

async function handleWebhook(event) {
  switch (event.type) {
    case 'payment_intent.succeeded':
      await prisma.transaction.updateMany({
        where: { externalId: event.data.object.id },
        data: { status: 'COMPLETED' },
      });
      break;
    case 'payment_intent.payment_failed':
      await prisma.transaction.updateMany({
        where: { externalId: event.data.object.id },
        data: { status: 'FAILED' },
      });
      break;
  }
}

module.exports = { createPaymentIntent, handleWebhook };
