/**
 * Stripe Configuration
 */

module.exports = {
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_...',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_...',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...',
  currency: 'usd',
  paymentMethods: ['card', 'us_bank_account'],
  webhookEvents: [
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
    'charge.succeeded',
    'charge.failed'
  ],
  fees: { percentage: 2.9, fixed: 0.30 }
};
