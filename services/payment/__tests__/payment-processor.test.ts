/**
 * Payment Processor Service Tests
 * Tests for payment processing orchestration
 */

import { PaymentProcessor } from '../payment-processor';
import { StripeClientService } from '../stripe-client';
import { PaymentRepository } from '../payment-repository';
import { PaymentStatus } from '../types';

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

describe('PaymentProcessor', () => {
  let paymentProcessor: PaymentProcessor;
  let mockStripeClient: jest.Mocked<StripeClientService>;
  let mockPaymentRepository: jest.Mocked<PaymentRepository>;

  beforeEach(() => {
    // Create mock instances
    mockStripeClient = {
      createPaymentIntent: jest.fn().mockResolvedValue({
        success: true,
        paymentIntentId: 'pi_123',
        clientSecret: 'pi_123_secret',
        status: 'requires_payment_method',
        amount: 9999,
        currency: 'usd',
      }),
      retrievePaymentIntent: jest.fn().mockResolvedValue({
        success: true,
        paymentIntentId: 'pi_123',
        status: 'succeeded',
      }),
      createRefund: jest.fn().mockResolvedValue({
        success: true,
        refundId: 're_123',
        status: 'succeeded',
      }),
    } as any;

    mockPaymentRepository = {
      createPayment: jest.fn().mockResolvedValue({
        id: 'pay-123',
        status: PaymentStatus.PENDING,
      }),
      getPaymentById: jest.fn().mockResolvedValue({
        id: 'pay-123',
        status: PaymentStatus.SUCCEEDED,
        stripePaymentIntentId: 'pi_123',
        amount: 9999,
      }),
      updatePaymentStatus: jest.fn().mockResolvedValue({
        id: 'pay-123',
        status: PaymentStatus.SUCCEEDED,
      }),
      updatePayment: jest.fn().mockResolvedValue({
        id: 'pay-123',
        status: PaymentStatus.REFUNDED,
      }),
      getIdempotencyResult: jest.fn().mockResolvedValue(null),
      storeIdempotencyKey: jest.fn().mockResolvedValue(true),
    } as any;

    paymentProcessor = new PaymentProcessor(mockStripeClient, mockPaymentRepository);
  });

  describe('processPayment', () => {
    it('should process a valid payment', async () => {
      const request = {
        userId: 'user-123',
        amount: 9999,
        currency: 'usd',
        paymentMethodId: 'pm_123',
        courseId: 'course-123',
      };

      const result = await paymentProcessor.processPayment(request);

      expect(result.success).toBe(true);
      expect(result.paymentId).toBeDefined();
      expect(result.stripePaymentIntentId).toBeDefined();
    });

    it('should reject invalid payment request', async () => {
      const request = {
        userId: '',
        amount: 0,
        currency: 'usd',
        paymentMethodId: 'pm_123',
      };

      const result = await paymentProcessor.processPayment(request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate amount is positive', async () => {
      const request = {
        userId: 'user-123',
        amount: -100,
        currency: 'usd',
        paymentMethodId: 'pm_123',
      };

      const result = await paymentProcessor.processPayment(request);

      expect(result.success).toBe(false);
    });

    it('should validate currency is provided', async () => {
      const request = {
        userId: 'user-123',
        amount: 9999,
        currency: '',
        paymentMethodId: 'pm_123',
      };

      const result = await paymentProcessor.processPayment(request);

      expect(result.success).toBe(false);
    });
  });

  describe('validatePaymentRequest', () => {
    it('should validate correct payment request', () => {
      const request = {
        userId: 'user-123',
        amount: 9999,
        currency: 'usd',
        paymentMethodId: 'pm_123',
      };

      const result = paymentProcessor.validatePaymentRequest(request);

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject request with missing userId', () => {
      const request = {
        userId: '',
        amount: 9999,
        currency: 'usd',
        paymentMethodId: 'pm_123',
      };

      const result = paymentProcessor.validatePaymentRequest(request);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('User ID is required');
    });

    it('should reject request with invalid amount', () => {
      const request = {
        userId: 'user-123',
        amount: 0,
        currency: 'usd',
        paymentMethodId: 'pm_123',
      };

      const result = paymentProcessor.validatePaymentRequest(request);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Amount must be greater than 0');
    });

    it('should reject request with missing currency', () => {
      const request = {
        userId: 'user-123',
        amount: 9999,
        currency: '',
        paymentMethodId: 'pm_123',
      };

      const result = paymentProcessor.validatePaymentRequest(request);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Currency is required');
    });

    it('should reject request with missing payment method', () => {
      const request = {
        userId: 'user-123',
        amount: 9999,
        currency: 'usd',
        paymentMethodId: '',
      };

      const result = paymentProcessor.validatePaymentRequest(request);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Payment method ID is required');
    });
  });

  describe('generateIdempotencyKey', () => {
    it('should generate unique idempotency keys', () => {
      const key1 = paymentProcessor.generateIdempotencyKey('user-123', 9999);
      const key2 = paymentProcessor.generateIdempotencyKey('user-123', 9999);

      expect(key1).toBeDefined();
      expect(key2).toBeDefined();
      expect(key1).not.toBe(key2);
    });

    it('should generate 64-character hex string', () => {
      const key = paymentProcessor.generateIdempotencyKey('user-123', 9999);

      expect(key).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('getPaymentStatus', () => {
    it('should return payment status', async () => {
      mockPaymentRepository.getPaymentById = jest.fn().mockResolvedValue({
        id: 'pay-123',
        status: PaymentStatus.SUCCEEDED,
      });

      const status = await paymentProcessor.getPaymentStatus('pay-123');

      expect(status).toBe(PaymentStatus.SUCCEEDED);
    });

    it('should return null if payment not found', async () => {
      mockPaymentRepository.getPaymentById = jest.fn().mockResolvedValue(null);

      const status = await paymentProcessor.getPaymentStatus('pay-123');

      expect(status).toBeNull();
    });
  });

  describe('refundPayment', () => {
    it('should refund a succeeded payment', async () => {
      mockPaymentRepository.getPaymentById = jest.fn().mockResolvedValue({
        id: 'pay-123',
        status: PaymentStatus.SUCCEEDED,
        stripePaymentIntentId: 'pi_123',
        amount: 9999,
      });

      const result = await paymentProcessor.refundPayment('pay-123', 5000, 'Customer requested');

      expect(result.success).toBe(true);
    });

    it('should reject refund for non-existent payment', async () => {
      mockPaymentRepository.getPaymentById = jest.fn().mockResolvedValue(null);

      const result = await paymentProcessor.refundPayment('pay-123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
    });

    it('should reject refund for already refunded payment', async () => {
      mockPaymentRepository.getPaymentById = jest.fn().mockResolvedValue({
        id: 'pay-123',
        status: PaymentStatus.REFUNDED,
      });

      const result = await paymentProcessor.refundPayment('pay-123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ALREADY_REFUNDED');
    });

    it('should reject refund for failed payment', async () => {
      mockPaymentRepository.getPaymentById = jest.fn().mockResolvedValue({
        id: 'pay-123',
        status: PaymentStatus.FAILED,
      });

      const result = await paymentProcessor.refundPayment('pay-123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_STATUS');
    });
  });
});
