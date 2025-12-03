import { BaseMock } from './base.mock';

export interface MockPaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  client_secret: string;
  customer?: string;
  metadata?: Record<string, any>;
}

export interface MockCustomer {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, any>;
}

export interface MockWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

/**
 * Mock Stripe service for testing
 */
export class MockStripeService extends BaseMock {
  private paymentIntents: Map<string, MockPaymentIntent> = new Map();
  private customers: Map<string, MockCustomer> = new Map();
  private webhookEvents: MockWebhookEvent[] = [];

  /**
   * Create a payment intent
   */
  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    customer?: string;
    metadata?: Record<string, any>;
  }): Promise<MockPaymentIntent> {
    this.trackCall('createPaymentIntent', [params]);

    const paymentIntent: MockPaymentIntent = {
      id: `pi_test_${this.generateId()}`,
      amount: params.amount,
      currency: params.currency,
      status: 'requires_payment_method',
      client_secret: `pi_test_${this.generateId()}_secret_${this.generateId()}`,
      customer: params.customer,
      metadata: params.metadata,
    };

    this.paymentIntents.set(paymentIntent.id, paymentIntent);
    return paymentIntent;
  }

  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(paymentIntentId: string): Promise<MockPaymentIntent> {
    this.trackCall('confirmPaymentIntent', [paymentIntentId]);

    const paymentIntent = this.paymentIntents.get(paymentIntentId);
    if (!paymentIntent) {
      throw new Error(`Payment intent ${paymentIntentId} not found`);
    }

    paymentIntent.status = 'succeeded';
    return paymentIntent;
  }

  /**
   * Cancel a payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<MockPaymentIntent> {
    this.trackCall('cancelPaymentIntent', [paymentIntentId]);

    const paymentIntent = this.paymentIntents.get(paymentIntentId);
    if (!paymentIntent) {
      throw new Error(`Payment intent ${paymentIntentId} not found`);
    }

    paymentIntent.status = 'canceled';
    return paymentIntent;
  }

  /**
   * Create a customer
   */
  async createCustomer(params: {
    email: string;
    name?: string;
    metadata?: Record<string, any>;
  }): Promise<MockCustomer> {
    this.trackCall('createCustomer', [params]);

    const customer: MockCustomer = {
      id: `cus_test_${this.generateId()}`,
      email: params.email,
      name: params.name,
      metadata: params.metadata,
    };

    this.customers.set(customer.id, customer);
    return customer;
  }

  /**
   * Get a customer
   */
  async getCustomer(customerId: string): Promise<MockCustomer> {
    this.trackCall('getCustomer', [customerId]);

    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error(`Customer ${customerId} not found`);
    }

    return customer;
  }

  /**
   * Create a refund
   */
  async createRefund(params: {
    paymentIntent: string;
    amount?: number;
  }): Promise<any> {
    this.trackCall('createRefund', [params]);

    const paymentIntent = this.paymentIntents.get(params.paymentIntent);
    if (!paymentIntent) {
      throw new Error(`Payment intent ${params.paymentIntent} not found`);
    }

    return {
      id: `re_test_${this.generateId()}`,
      amount: params.amount || paymentIntent.amount,
      currency: paymentIntent.currency,
      payment_intent: params.paymentIntent,
      status: 'succeeded',
    };
  }

  /**
   * Simulate a webhook event
   */
  simulateWebhook(type: string, data: any): MockWebhookEvent {
    this.trackCall('simulateWebhook', [type, data]);

    const event: MockWebhookEvent = {
      id: `evt_test_${this.generateId()}`,
      type,
      data: {
        object: data,
      },
    };

    this.webhookEvents.push(event);
    return event;
  }

  /**
   * Verify webhook signature (always returns true in tests)
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    this.trackCall('verifyWebhookSignature', [payload, signature, secret]);
    return true;
  }

  /**
   * Get all webhook events
   */
  getWebhookEvents(): MockWebhookEvent[] {
    return this.webhookEvents;
  }

  /**
   * Get payment intent by ID
   */
  getPaymentIntent(id: string): MockPaymentIntent | undefined {
    return this.paymentIntents.get(id);
  }

  /**
   * Reset mock state
   */
  reset(): void {
    super.reset();
    this.paymentIntents.clear();
    this.customers.clear();
    this.webhookEvents = [];
  }

  /**
   * Generate a random ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

// Export singleton instance
export const mockStripe = new MockStripeService();
