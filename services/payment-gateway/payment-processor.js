const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentProcessor {
  // Stripe payment intent
  async createStripePayment(amount, currency, userId, metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: { userId, ...metadata },
        automatic_payment_methods: { enabled: true }
      });
      
      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Verify Stripe webhook
  verifyStripeWebhook(payload, signature) {
    try {
      return stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      throw new Error(`Webhook verification failed: ${error.message}`);
    }
  }

  // Mock PayPal (placeholder)
  async createPayPalPayment(amount, currency, userId) {
    return {
      success: true,
      orderId: `PAYPAL_${Date.now()}`,
      approvalUrl: `https://paypal.com/checkout?token=mock_${userId}`
    };
  }

  // Mock crypto payment (placeholder)
  async createCryptoPayment(amount, currency, userId, cryptoType = 'BTC') {
    return {
      success: true,
      address: `mock_${cryptoType}_address_${userId}`,
      amount,
      currency: cryptoType,
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    };
  }
}

module.exports = new PaymentProcessor();
