const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');

class StripePaymentGateway {
  constructor() {
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  }

  // Create payment intent
  async createPaymentIntent({ amount, currency = 'usd', customerId, metadata = {} }) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        customer: customerId,
        metadata: {
          ...metadata,
          platform: 'azora-os',
          timestamp: new Date().toISOString()
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Create customer
  async createCustomer({ email, name, metadata = {} }) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          ...metadata,
          platform: 'azora-os'
        }
      });

      return {
        success: true,
        customerId: customer.id,
        customer
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get customer
  async getCustomer(customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      return {
        success: true,
        customer
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create subscription
  async createSubscription({ customerId, priceId, metadata = {} }) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata: {
          ...metadata,
          platform: 'azora-os'
        },
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      return {
        success: true,
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        subscription
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return {
        success: true,
        subscription
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create refund
  async createRefund({ paymentIntentId, amount, reason = 'requested_by_customer' }) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason
      });

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );
      return { success: true, event };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Handle webhook events
  async handleWebhookEvent(event) {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          return await this.handlePaymentSuccess(event.data.object);
        
        case 'payment_intent.payment_failed':
          return await this.handlePaymentFailed(event.data.object);
        
        case 'customer.subscription.created':
          return await this.handleSubscriptionCreated(event.data.object);
        
        case 'customer.subscription.updated':
          return await this.handleSubscriptionUpdated(event.data.object);
        
        case 'customer.subscription.deleted':
          return await this.handleSubscriptionCanceled(event.data.object);
        
        case 'invoice.payment_succeeded':
          return await this.handleInvoicePaymentSucceeded(event.data.object);
        
        case 'invoice.payment_failed':
          return await this.handleInvoicePaymentFailed(event.data.object);
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
          return { success: true, message: 'Event received but not processed' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async handlePaymentSuccess(paymentIntent) {
    console.log('Payment succeeded:', paymentIntent.id);
    return { success: true, action: 'payment_succeeded', paymentIntentId: paymentIntent.id };
  }

  async handlePaymentFailed(paymentIntent) {
    console.log('Payment failed:', paymentIntent.id);
    return { success: true, action: 'payment_failed', paymentIntentId: paymentIntent.id };
  }

  async handleSubscriptionCreated(subscription) {
    console.log('Subscription created:', subscription.id);
    return { success: true, action: 'subscription_created', subscriptionId: subscription.id };
  }

  async handleSubscriptionUpdated(subscription) {
    console.log('Subscription updated:', subscription.id);
    return { success: true, action: 'subscription_updated', subscriptionId: subscription.id };
  }

  async handleSubscriptionCanceled(subscription) {
    console.log('Subscription canceled:', subscription.id);
    return { success: true, action: 'subscription_canceled', subscriptionId: subscription.id };
  }

  async handleInvoicePaymentSucceeded(invoice) {
    console.log('Invoice payment succeeded:', invoice.id);
    return { success: true, action: 'invoice_payment_succeeded', invoiceId: invoice.id };
  }

  async handleInvoicePaymentFailed(invoice) {
    console.log('Invoice payment failed:', invoice.id);
    return { success: true, action: 'invoice_payment_failed', invoiceId: invoice.id };
  }

  // Get payment methods for customer
  async getPaymentMethods(customerId) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return {
        success: true,
        paymentMethods: paymentMethods.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Detach payment method
  async detachPaymentMethod(paymentMethodId) {
    try {
      const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
      return {
        success: true,
        paymentMethod
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create setup intent for saving payment method
  async createSetupIntent(customerId) {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
      });

      return {
        success: true,
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = StripePaymentGateway;