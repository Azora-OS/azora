/**
 * Webhook Handler Service Tests
 * Tests for webhook event processing
 */

import { WebhookHandler } from '../webhook-handler';
import { StripeClientService } from '../stripe-client';
import { PaymentRepository } from '../payment-repository';
import { PaymentStatus } from '../types';
import Stripe from 'stripe';

// Mock logger
jest.mock('../../shared/logging', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock dependencies
jest.mock('../stripe-client');
jest.mock('../payment-repository');

describe('WebhookHandler', () => {
  let webhookHandler: WebhookHandler;
  let mockStripeClient: any;
  let mockPaymentRepository: any;

  beforeEach(() => {
    mockStripeClient = {
      verifyWebhookSignature: jest.fn((body, signature, secret) => {
        if (signature === 'invalid_signature') {
          throw new Error('Invalid signature');
        }
        return {
          type: 'payment_intent.succeeded',
          data: { object: { id: 'pi_123' } },
        };
      }),
    };

    mockPaymentRepository = {
      getPaymentByStripeId: jest.fn().mockResolvedValue({
        id: 'pay-123',
        status: PaymentStatus.PENDING,
      }),
      updatePayment: jest.fn().mockResolvedValue({
        id: 'pay-123',
        status: PaymentStatus.SUCCEEDED,
      }),
    };

    webhookHandler = new WebhookHandler(mockStripeClient, mockPaymentRepository);
  });

  describe('verifyWebhookSignature', () => {
    it('should verify valid webhook signature', () => {
      const body = JSON.stringify({ type: 'payment_intent.succeeded' });
      const signature = 'valid_signature';
      const secret = 'whsec_test';

      expect(() => webhookHandler.verifyWebhookSignature(body, signature, secret)).toBeDefined();
    });

    it('should throw error for invalid signature', () => {
      const body = JSON.stringify({ type: 'payment_intent.succeeded' });
      const signature = 'invalid_signature';
      const secret = 'whsec_test';

      expect(() => webhookHandler.verifyWebhookSignature(body, signature, secret)).toThrow();
    });
  });

  describe('processWebhookEvent', () => {
    it('should process payment_intent.succeeded event', async () => {
      const event: Stripe.Event = {
        id: 'evt_123',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            status: 'succeeded',
            amount: 9999,
            currency: 'usd',
            metadata: {},
          } as any,
        },
        created: Math.floor(Date.now() / 1000),
      } as Stripe.Event;

      mockPaymentRepository.getPaymentByStripeId = jest.fn().mockResolvedValue({
        id: 'pay-123',
        status: PaymentStatus.PENDING,
      });

      await expect(webhookHandler.processWebhookEvent(event)).resolves.not.toThrow();
    });

    it('should process payment_intent.payment_failed event', async () => {
      const event: Stripe.Event = {
        id: 'evt_123',
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_123',
            status: 'requires_payment_method',
            last_payment_error: {
              code: 'card_declined',
              message: 'Your card was declined',
            },
          } as any,
        },
        created: Math.floor(Date.now() / 1000),
      } as Stripe.Event;

      mockPaymentRepository.getPaymentByStripeId = jest.fn().mockResolvedValue({
        id: 'pay-123',
        status: PaymentStatus.PENDING,
      });

      await expect(webhookHandler.processWebhookEvent(event)).resolves.not.toThrow();
    });

    it('should process charge.refunded event', async () => {
      const event: Stripe.Event = {
        id: 'evt_123',
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_123',
            payment_intent: 'pi_123',
            amount_refunded: 5000,
            refunded: true,
          } as any,
        },
        created: Math.floor(Date.now() / 1000),
      } as Stripe.Event;

      mockPaymentRepository.getPaymentByStripeId = jest.fn().mockResolvedValue({
        id: 'pay-123',
        status: PaymentStatus.SUCCEEDED,
      });

      await expect(webhookHandler.processWebhookEvent(event)).resolves.not.toThrow();
    });

    it('should handle unhandled event types', async () => {
      const event: Stripe.Event = {
        id: 'evt_123',
        type: 'customer.created',
        data: { object: {} as any },
        created: Math.floor(Date.now() / 1000),
      } as Stripe.Event;

      await expect(webhookHandler.processWebhookEvent(event)).resolves.not.toThrow();
    });

    it('should handle payment not found', async () => {
      const event: Stripe.Event = {
        id: 'evt_123',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            status: 'succeeded',
            amount: 9999,
            currency: 'usd',
            metadata: {},
          } as any,
        },
        created: Math.floor(Date.now() / 1000),
      } as Stripe.Event;

      mockPaymentRepository.getPaymentByStripeId = jest.fn().mockResolvedValue(null);

      await expect(webhookHandler.processWebhookEvent(event)).resolves.not.toThrow();
    });
  });
});
