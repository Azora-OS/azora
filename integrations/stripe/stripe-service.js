const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class UbuntuStripeService {
  constructor() {
    this.ubuntu = 'I process payments because we prosper together';
  }

  async createUbuntuPayment(amount, currency = 'usd', metadata = {}) {
    return await stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
      metadata: {
        ...metadata,
        ubuntu: 'Ubuntu prosperity payment',
        philosophy: 'My success enables your success'
      }
    });
  }

  async createUbuntuSubscription(customerId, priceId) {
    return await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata: {
        ubuntu: 'Ubuntu recurring prosperity',
        type: 'constitutional_ai_subscription'
      }
    });
  }
}

module.exports = UbuntuStripeService;