/**
 * Payment Repository Service Tests
 * Tests for database operations
 */

import { PaymentRepository } from '../payment-repository';
import { PaymentStatus } from '../types';
import { PrismaClient } from '@prisma/client';

// Mock logger
jest.mock('../../shared/logging', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock Prisma
jest.mock('@prisma/client');

describe('PaymentRepository', () => {
  let paymentRepository: PaymentRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = {
      payment: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        delete: jest.fn(),
      },
      idempotencyKey: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    } as any;

    paymentRepository = new PaymentRepository(mockPrisma);
  });

  describe('createPayment', () => {
    it('should create a payment record', async () => {
      const paymentData = {
        userId: 'user-123',
        stripePaymentIntentId: 'pi_123',
        amount: 9999,
        currency: 'usd',
        status: PaymentStatus.PENDING,
        metadata: {},
        idempotencyKey: 'key-123',
      };

      mockPrisma.payment.create = jest.fn().mockResolvedValue({
        id: 'pay-123',
        ...paymentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await paymentRepository.createPayment(paymentData);

      expect(result.id).toBe('pay-123');
      expect(result.userId).toBe('user-123');
      expect(mockPrisma.payment.create).toHaveBeenCalled();
    });
  });

  describe('updatePayment', () => {
    it('should update a payment record', async () => {
      mockPrisma.payment.update = jest.fn().mockResolvedValue({
        id: 'pay-123',
        status: PaymentStatus.SUCCEEDED,
        updatedAt: new Date(),
      });

      const result = await paymentRepository.updatePayment('pay-123', {
        status: PaymentStatus.SUCCEEDED,
      } as any);

      expect(result.status).toBe(PaymentStatus.SUCCEEDED);
      expect(mockPrisma.payment.update).toHaveBeenCalled();
    });
  });

  describe('getPaymentById', () => {
    it('should retrieve a payment by ID', async () => {
      mockPrisma.payment.findUnique = jest.fn().mockResolvedValue({
        id: 'pay-123',
        userId: 'user-123',
        status: PaymentStatus.SUCCEEDED,
      });

      const result = await paymentRepository.getPaymentById('pay-123');

      expect(result?.id).toBe('pay-123');
      expect(mockPrisma.payment.findUnique).toHaveBeenCalledWith({
        where: { id: 'pay-123' },
      });
    });

    it('should return null if payment not found', async () => {
      mockPrisma.payment.findUnique = jest.fn().mockResolvedValue(null);

      const result = await paymentRepository.getPaymentById('pay-123');

      expect(result).toBeNull();
    });
  });

  describe('getPaymentByStripeId', () => {
    it('should retrieve a payment by Stripe ID', async () => {
      mockPrisma.payment.findUnique = jest.fn().mockResolvedValue({
        id: 'pay-123',
        stripePaymentIntentId: 'pi_123',
      });

      const result = await paymentRepository.getPaymentByStripeId('pi_123');

      expect(result?.stripePaymentIntentId).toBe('pi_123');
      expect(mockPrisma.payment.findUnique).toHaveBeenCalledWith({
        where: { stripePaymentIntentId: 'pi_123' },
      });
    });
  });

  describe('getPaymentHistory', () => {
    it('should retrieve payment history with pagination', async () => {
      mockPrisma.payment.findMany = jest.fn().mockResolvedValue([
        { id: 'pay-1', userId: 'user-123', status: PaymentStatus.SUCCEEDED },
        { id: 'pay-2', userId: 'user-123', status: PaymentStatus.SUCCEEDED },
      ]);

      mockPrisma.payment.count = jest.fn().mockResolvedValue(2);

      const result = await paymentRepository.getPaymentHistory('user-123', 20, 0);

      expect(result.payments).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
    });

    it('should support pagination', async () => {
      mockPrisma.payment.findMany = jest.fn().mockResolvedValue([]);
      mockPrisma.payment.count = jest.fn().mockResolvedValue(100);

      await paymentRepository.getPaymentHistory('user-123', 10, 20);

      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 20,
        })
      );
    });
  });

  describe('getPaymentsByStatus', () => {
    it('should retrieve payments by status', async () => {
      mockPrisma.payment.findMany = jest.fn().mockResolvedValue([
        { id: 'pay-1', status: PaymentStatus.SUCCEEDED },
      ]);

      mockPrisma.payment.count = jest.fn().mockResolvedValue(1);

      const result = await paymentRepository.getPaymentsByStatus(PaymentStatus.SUCCEEDED);

      expect(result.payments).toHaveLength(1);
      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: PaymentStatus.SUCCEEDED },
        })
      );
    });
  });

  describe('storeIdempotencyKey', () => {
    it('should store idempotency key', async () => {
      mockPrisma.idempotencyKey.create = jest.fn().mockResolvedValue({
        id: 'key-123',
        key: 'idempotency-key',
      });

      await paymentRepository.storeIdempotencyKey(
        'idempotency-key',
        'user-123',
        { success: true },
        new Date()
      );

      expect(mockPrisma.idempotencyKey.create).toHaveBeenCalled();
    });
  });

  describe('getIdempotencyResult', () => {
    it('should retrieve idempotency result', async () => {
      mockPrisma.idempotencyKey.findUnique = jest.fn().mockResolvedValue({
        id: 'key-123',
        paymentResult: { success: true },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const result = await paymentRepository.getIdempotencyResult('idempotency-key');

      expect(result).toEqual({ success: true });
    });

    it('should return null if key expired', async () => {
      mockPrisma.idempotencyKey.findUnique = jest.fn().mockResolvedValue({
        id: 'key-123',
        paymentResult: { success: true },
        expiresAt: new Date(Date.now() - 1000), // Expired
      });

      mockPrisma.idempotencyKey.delete = jest.fn();

      const result = await paymentRepository.getIdempotencyResult('idempotency-key');

      expect(result).toBeNull();
      expect(mockPrisma.idempotencyKey.delete).toHaveBeenCalled();
    });

    it('should return null if key not found', async () => {
      mockPrisma.idempotencyKey.findUnique = jest.fn().mockResolvedValue(null);

      const result = await paymentRepository.getIdempotencyResult('idempotency-key');

      expect(result).toBeNull();
    });
  });

  describe('cleanupExpiredKeys', () => {
    it('should clean up expired keys', async () => {
      mockPrisma.idempotencyKey.deleteMany = jest.fn().mockResolvedValue({ count: 5 });

      const count = await paymentRepository.cleanupExpiredKeys();

      expect(count).toBe(5);
      expect(mockPrisma.idempotencyKey.deleteMany).toHaveBeenCalled();
    });
  });
});
