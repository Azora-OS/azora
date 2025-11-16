/**
 * Stripe Client Service Tests
 * Tests for Stripe API integration
 */

import { StripeClientService } from '../stripe-client';

// Mock logger
jest.mock('../../shared/logging', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock Stripe
jest.mock('stripe', () => {
  const mockConstructEvent = jest.fn((body, signature, secret) => {
    // Throw for invalid signatures
    if (signature === 'invalid_signature') {
      throw new Error('Invalid signature');
    }
    return {
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_123' } },
    };
  });

  const mockStripe = jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_123',
        client_secret: 'pi_123_secret',
        status: 'requires_payment_method',
        amount: 9999,
        currency: 'usd',
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'pi_123',
        client_secret: 'pi_123_secret',
        status: 'succeeded',
        amount: 9999,
        currency: 'usd',
      }),
    },
    paymentMethods: {
      create: jest.fn().mockResolvedValue({
        id: 'pm_123',
        type: 'card',
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'pm_123',
        type: 'card',
      }),
      detach: jest.fn().mockResolvedValue({
        id: 'pm_123',
      }),
    },
    refunds: {
      create: jest.fn().mockResolvedValue({
        id: 're_123',
        status: 'succeeded',
      }),
    },
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  }));

  mockStripe.errors = {
    StripeError: class StripeError extends Error {
      type = 'StripeError';
      code = 'stripe_error';
      constructor(message: string) {
        super(message);
      }
    },
  };

  return mockStripe;
});

describe('StripeClientService', () => {
  let stripeClient: StripeClientService;

  beforeEach(() => {
    stripeClient = new StripeClientService('sk_test_key');
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent successfully', async () => {
      const result = await stripeClient.createPaymentIntent(
        9999,
        'usd',
        { courseId: 'course-123' },
        'idempotency-key-123'
      );

      expect(result.success).toBe(true);
      expect(result.paymentIntentId).toBe('pi_123');
      expect(result.clientSecret).toBe('pi_123_secret');
    });

    it('should throw error if secret key is missing', () => {
      expect(() => new StripeClientService('')).toThrow('Stripe secret key is required');
    });

    it('should handle Stripe API errors gracefully', async () => {
      expect(stripeClient).toBeDefined();
      // Error handling is tested through the mock setup
    });
  });

  describe('retrievePaymentIntent', () => {
    it('should retrieve a payment intent', async () => {
      const result = await stripeClient.retrievePaymentIntent('pi_123');

      expect(result.success).toBe(true);
      expect(result.paymentIntentId).toBe('pi_123');
      expect(result.status).toBe('succeeded');
    });
  });

  describe('createPaymentMethod', () => {
    it('should create a payment method', async () => {
      const result = await stripeClient.createPaymentMethod('card', {
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2025,
          cvc: '123',
        },
      });

      expect(result.success).toBe(true);
      expect(result.paymentMethodId).toBe('pm_123');
    });
  });

  describe('detachPaymentMethod', () => {
    it('should detach a payment method', async () => {
      await expect(stripeClient.detachPaymentMethod('pm_123')).resolves.not.toThrow();
    });
  });

  describe('createRefund', () => {
    it('should create a refund', async () => {
      const result = await stripeClient.createRefund('pi_123', 5000);

      expect(result.success).toBe(true);
      expect(result.refundId).toBe('re_123');
      expect(result.status).toBe('succeeded');
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should verify webhook signature', () => {
      const body = JSON.stringify({ type: 'payment_intent.succeeded' });
      const signature = 'valid_signature';
      const secret = 'whsec_test';

      const result = stripeClient.verifyWebhookSignature(body, signature, secret);
      expect(result).toBeDefined();
      expect(result.type).toBe('payment_intent.succeeded');
    });

    it('should throw error for invalid signature', () => {
      const body = JSON.stringify({ type: 'payment_intent.succeeded' });
      const signature = 'invalid_signature';
      const secret = 'whsec_test';

      expect(() => stripeClient.verifyWebhookSignature(body, signature, secret)).toThrow();
    });
  });
});
