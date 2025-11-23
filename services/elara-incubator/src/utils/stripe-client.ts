import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export class StripeClient {
  /**
   * Create a payment intent
   */
  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<string> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        payment_method_types: ['card'],
      });
      return paymentIntent.id;
    } catch (error) {
      throw new Error(`Failed to create payment intent: ${error}`);
    }
  }

  /**
   * Confirm a payment intent
   */
  async confirmPayment(paymentIntentId: string, paymentMethodId?: string): Promise<boolean> {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });
      return paymentIntent.status === 'succeeded';
    } catch (error) {
      throw new Error(`Failed to confirm payment: ${error}`);
    }
  }

  /**
   * Get payment intent status
   */
  async getPaymentStatus(paymentIntentId: string): Promise<string> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent.status;
    } catch (error) {
      throw new Error(`Failed to get payment status: ${error}`);
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentIntentId: string, amount?: number): Promise<string> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });
      return refund.id;
    } catch (error) {
      throw new Error(`Failed to refund payment: ${error}`);
    }
  }

  /**
   * Create a customer
   */
  async createCustomer(email: string, name?: string): Promise<string> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
      });
      return customer.id;
    } catch (error) {
      throw new Error(`Failed to create customer: ${error}`);
    }
  }

  /**
   * Get customer
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      return await stripe.customers.retrieve(customerId);
    } catch (error) {
      throw new Error(`Failed to get customer: ${error}`);
    }
  }

  /**
   * Create a webhook endpoint
   */
  async createWebhookEndpoint(url: string, events: string[]): Promise<string> {
    try {
      const endpoint = await stripe.webhookEndpoints.create({
        url,
        enabled_events: events,
      });
      return endpoint.id;
    } catch (error) {
      throw new Error(`Failed to create webhook endpoint: ${error}`);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(body: string, signature: string, secret: string): Stripe.Event {
    try {
      return stripe.webhooks.constructEvent(body, signature, secret);
    } catch (error) {
      throw new Error(`Failed to verify webhook signature: ${error}`);
    }
  }
}

export const stripeClient = new StripeClient();
