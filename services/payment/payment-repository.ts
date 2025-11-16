/**
 * Payment Repository Service
 * Handles all database operations for payments
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../shared/logging';
import {
  Payment,
  PaymentData,
  PaymentStatus,
  PaginatedPayments,
  PaymentError,
} from './types';

export class PaymentRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new payment record
   */
  async createPayment(data: PaymentData): Promise<Payment> {
    try {
      logger.info('Creating payment record', {
        userId: data.userId,
        amount: data.amount,
      });

      const payment = await this.prisma.payment.create({
        data: {
          userId: data.userId,
          stripePaymentIntentId: data.stripePaymentIntentId,
          amount: data.amount,
          currency: data.currency,
          status: data.status,
          paymentMethodId: data.paymentMethodId,
          courseId: data.courseId,
          subscriptionTierId: data.subscriptionTierId,
          metadata: data.metadata,
          idempotencyKey: data.idempotencyKey,
          errorCode: data.errorCode,
          errorMessage: data.errorMessage,
        },
      });

      logger.info('Payment record created', { paymentId: payment.id });
      return payment as Payment;
    } catch (error) {
      logger.error('Failed to create payment record', { error, data });
      throw new PaymentError('Failed to create payment record', 'DB_ERROR', 500);
    }
  }

  /**
   * Update a payment record
   */
  async updatePayment(
    paymentId: string,
    updates: Partial<Payment>
  ): Promise<Payment> {
    try {
      logger.info('Updating payment record', { paymentId, updates });

      const payment = await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: updates.status,
          receiptId: updates.receiptId,
          refundedAmount: updates.refundedAmount,
          refundReason: updates.refundReason,
          errorCode: updates.errorCode,
          errorMessage: updates.errorMessage,
        },
      });

      logger.info('Payment record updated', { paymentId });
      return payment as Payment;
    } catch (error) {
      logger.error('Failed to update payment record', { error, paymentId });
      throw new PaymentError('Failed to update payment record', 'DB_ERROR', 500);
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<Payment | null> {
    try {
      logger.info('Fetching payment by ID', { paymentId });

      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
      });

      return payment as Payment | null;
    } catch (error) {
      logger.error('Failed to fetch payment', { error, paymentId });
      throw new PaymentError('Failed to fetch payment', 'DB_ERROR', 500);
    }
  }

  /**
   * Get payment by Stripe Payment Intent ID
   */
  async getPaymentByStripeId(stripePaymentIntentId: string): Promise<Payment | null> {
    try {
      logger.info('Fetching payment by Stripe ID', { stripePaymentIntentId });

      const payment = await this.prisma.payment.findUnique({
        where: { stripePaymentIntentId },
      });

      return payment as Payment | null;
    } catch (error) {
      logger.error('Failed to fetch payment by Stripe ID', {
        error,
        stripePaymentIntentId,
      });
      throw new PaymentError('Failed to fetch payment', 'DB_ERROR', 500);
    }
  }

  /**
   * Get payment history for a user with pagination
   */
  async getPaymentHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedPayments> {
    try {
      logger.info('Fetching payment history', { userId, limit, offset });

      const [payments, total] = await Promise.all([
        this.prisma.payment.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.payment.count({ where: { userId } }),
      ]);

      logger.info('Payment history fetched', { userId, count: payments.length, total });

      return {
        payments: payments as Payment[],
        total,
        limit,
        offset,
      };
    } catch (error) {
      logger.error('Failed to fetch payment history', { error, userId });
      throw new PaymentError('Failed to fetch payment history', 'DB_ERROR', 500);
    }
  }

  /**
   * Get payments by status
   */
  async getPaymentsByStatus(
    status: PaymentStatus,
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedPayments> {
    try {
      logger.info('Fetching payments by status', { status, limit, offset });

      const [payments, total] = await Promise.all([
        this.prisma.payment.findMany({
          where: { status },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.payment.count({ where: { status } }),
      ]);

      return {
        payments: payments as Payment[],
        total,
        limit,
        offset,
      };
    } catch (error) {
      logger.error('Failed to fetch payments by status', { error, status });
      throw new PaymentError('Failed to fetch payments', 'DB_ERROR', 500);
    }
  }

  /**
   * Get payments by date range
   */
  async getPaymentsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    limit: number = 20,
    offset: number = 0
  ): Promise<PaginatedPayments> {
    try {
      logger.info('Fetching payments by date range', {
        userId,
        startDate,
        endDate,
        limit,
        offset,
      });

      const [payments, total] = await Promise.all([
        this.prisma.payment.findMany({
          where: {
            userId,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.payment.count({
          where: {
            userId,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
      ]);

      return {
        payments: payments as Payment[],
        total,
        limit,
        offset,
      };
    } catch (error) {
      logger.error('Failed to fetch payments by date range', { error, userId });
      throw new PaymentError('Failed to fetch payments', 'DB_ERROR', 500);
    }
  }

  /**
   * Store idempotency key result
   */
  async storeIdempotencyKey(
    key: string,
    userId: string,
    result: any,
    expiresAt: Date
  ): Promise<void> {
    try {
      logger.info('Storing idempotency key', { key, userId });

      await this.prisma.idempotencyKey.create({
        data: {
          key,
          userId,
          paymentResult: result,
          expiresAt,
        },
      });

      logger.info('Idempotency key stored', { key });
    } catch (error) {
      logger.error('Failed to store idempotency key', { error, key });
      throw new PaymentError('Failed to store idempotency key', 'DB_ERROR', 500);
    }
  }

  /**
   * Get idempotency key result
   */
  async getIdempotencyResult(key: string): Promise<any | null> {
    try {
      logger.info('Fetching idempotency key result', { key });

      const idempotencyKey = await this.prisma.idempotencyKey.findUnique({
        where: { key },
      });

      if (!idempotencyKey) {
        return null;
      }

      // Check if key has expired
      if (new Date() > idempotencyKey.expiresAt) {
        logger.info('Idempotency key expired', { key });
        await this.prisma.idempotencyKey.delete({ where: { key } });
        return null;
      }

      return idempotencyKey.paymentResult;
    } catch (error) {
      logger.error('Failed to fetch idempotency result', { error, key });
      throw new PaymentError('Failed to fetch idempotency result', 'DB_ERROR', 500);
    }
  }

  /**
   * Clean up expired idempotency keys
   */
  async cleanupExpiredKeys(): Promise<number> {
    try {
      logger.info('Cleaning up expired idempotency keys');

      const result = await this.prisma.idempotencyKey.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      logger.info('Expired idempotency keys cleaned up', { count: result.count });
      return result.count;
    } catch (error) {
      logger.error('Failed to clean up expired keys', { error });
      throw new PaymentError('Failed to clean up expired keys', 'DB_ERROR', 500);
    }
  }
}

export default PaymentRepository;
