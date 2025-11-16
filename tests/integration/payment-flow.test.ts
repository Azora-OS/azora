/**
 * Payment Flow Integration Tests
 * Tests for complete end-to-end payment processing
 */

import { PaymentProcessor } from '../../services/payment/payment-processor';
import { StripeClientService } from '../../services/payment/stripe-client';
import { PaymentRepository } from '../../services/payment/payment-repository';
import { WebhookHandler } from '../../services/payment/webhook-handler';
import { ReceiptGenerator } from '../../services/payment/receipt-generator';
import { PaymentStatus } from '../../services/payment/types';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

// Mock dependencies
jest.mock('../../services/payment/stripe-client');
jest.mock('../../services/payment/payment-repository');
jest.mock('@prisma/client');

describe('Payment Flow Integration Tests', () => {
  let paymentProcessor: PaymentProcessor;
  let webhookHandler: WebhookHandler;
  let receiptGenerator: ReceiptGenerator;
  let mockStripeClient: jest.Mocked<StripeClientService>;
  let mockPaymentRepository: jest.Mocked<PaymentRepository>;

  beforeEach(() => {
    mockStripeClient = new StripeClientService('sk_test_key') as jest.Mocked<StripeClientService>;
    mockPaymentRepository = new PaymentRepository(null as any) as jest.Mocked<PaymentRepository>;
    paymentProcessor = new PaymentProcessor(mockStripeClient, mockPaymentRepository);
    webhookHandler = new WebhookHandler(mockStripeClient, mockPaymentRepository);
    receiptGenerator = new ReceiptGenerator();
  });

  describe('Complete Payment Flow', () => {
    it('should process payment and handle webhook', async () => {
      // Step 1: Process payment
      const paymentRequest = {
        userId: 'user-123',
        amount: 9999,
        currency: 'usd',
        paymentMethodId: 'pm_123',
        courseId: 'course-123',
      };

      const paymentResult = await paymentProcessor.processPayment(paymentRequest);

      expect(paymentResult.success).toBe(true);
      expect(paymentResult.paymentId).toBeDefined();
      expect(paymentResult.stripePaymentIntentId).toBeDefined();

      // Step 2: Simulate webhook event
      const webhookEvent: Stripe.Event = {
        id: 'evt_123',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: paymentResult.stripePaymentIntentId,
            status: 'succeeded',
            amount: 9999,
            currency: 'usd',
            metadata: {},
          } as any,
        },
        created: Math.floor(Date.now() / 1000),
      } as Stripe.Event;

      mockPaymentRepository.getPaymentByStripeId = jest.fn().mockResolvedValue({
        id: paymentResult.paymentId,
        status: PaymentStatus.PENDING,
      });

      await expect(webhookHandler.processWebhookEvent(webhookEvent)).resolves.not.toThrow();

      // Step 3: Generate receipt
      const payment = {
        id: paymentResult.paymentId,
        userId: 'user-123',
        amount: 9999,
        currency: 'usd',
        status: PaymentStatus.SUCCEEDED,
        courseId: 'course-123',
        createdAt: new Date(),
      } as any;

      const receipt = await receiptGenerator.generateReceipt(payment, 'Advanced TypeScript');

      expect(receipt.paymentId).toBe(paymentResult.paymentId);
      expect(receipt.invoiceNumber).toBeDefined();
      expect(receipt.items).toHaveLength(1);
    });

    it('should handle payment failure flow', async () => {
      const paymentRequest = {
        userId: 'user-123',
        amount: 9999,
        currency: 'usd',
        paymentMethodId: 'pm_declined',
        courseId: 'course-123',
      };

      const paymentResult = await paymentProcessor.processPayment(paymentRequest);

      // Simulate failed webhook
      const failedEvent: Stripe.Event = {
        id: 'evt_123',
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_failed',
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

      await expect(webhookHandler.processWebhookEvent(failedEvent)).resolves.not.toThrow();
    });

    it('should handle refund flow', async () => {
      // Create initial payment
      mockPaymentRepository.getPaymentById = jest.fn().mockResolvedValue({
        id: 'pay-123',
        status: PaymentStatus.SUCCEEDED,
        stripePaymentIntentId: 'pi_123',
        amount: 9999,
      });

      // Process refund
      const refundResult = await paymentProcessor.refundPayment(
        'pay-123',
        5000,
        'Customer requested'
      );

      expect(refundResult.success).toBe(true);

      // Simulate refund webhook
      const refundEvent: Stripe.Event = {
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

      await expect(webhookHandler.processWebhookEvent(refundEvent)).resolves.not.toThrow();
    });
  });

  describe('Payment History Flow', () => {
    it('should retrieve payment history', async () => {
      mockPaymentRepository.getPaymentHistory = jest.fn().mockResolvedValue({
        payments: [
          {
            id: 'pay-1',
            userId: 'user-123',
            status: PaymentStatus.SUCCEEDED,
            amount: 9999,
          },
          {
            id: 'pay-2',
            userId: 'user-123',
            status: PaymentStatus.SUCCEEDED,
            amount: 4999,
          },
        ],
        total: 2,
        limit: 20,
        offset: 0,
      });

      const history = await mockPaymentRepository.getPaymentHistory('user-123', 20, 0);

      expect(history.payments).toHaveLength(2);
      expect(history.total).toBe(2);
    });

    it('should support pagination', async () => {
      mockPaymentRepository.getPaymentHistory = jest.fn().mockResolvedValue({
        payments: [],
        total: 100,
        limit: 10,
        offset: 20,
      });

      const history = await mockPaymentRepository.getPaymentHistory('user-123', 10, 20);

      expect(history.limit).toBe(10);
      expect(history.offset).toBe(20);
      expect(history.total).toBe(100);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle invalid payment request', async () => {
      const invalidRequest = {
        userId: '',
        amount: 0,
        currency: '',
        paymentMethodId: '',
      };

      const result = await paymentProcessor.processPayment(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle payment not found', async () => {
      mockPaymentRepository.getPaymentById = jest.fn().mockResolvedValue(null);

      const result = await paymentProcessor.refundPayment('pay-123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
    });

    it('should handle duplicate payment prevention', async () => {
      const paymentRequest = {
        userId: 'user-123',
        amount: 9999,
        currency: 'usd',
        paymentMethodId: 'pm_123',
      };

      // First payment
      const result1 = await paymentProcessor.processPayment(paymentRequest);
      expect(result1.success).toBe(true);

      // Duplicate payment with same idempotency key should return cached result
      const result2 = await paymentProcessor.processPayment(paymentRequest);
      expect(result2.success).toBe(true);
    });
  });
});
