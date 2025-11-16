/**
 * Payment Processor Service
 * Orchestrates payment processing workflow
 */

import { createHash, randomBytes } from 'crypto';
import { logger } from '../shared/logging';
import StripeClientService from './stripe-client';
import PaymentRepository from './payment-repository';
import {
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
  PaymentError,
  ValidationResult,
} from './types';

export class PaymentProcessor {
  constructor(
    private stripeClient: StripeClientService,
    private paymentRepository: PaymentRepository
  ) {}

  /**
   * Process a payment
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Validate request
      const validation = this.validatePaymentRequest(request);
      if (!validation.valid) {
        logger.warn('Invalid payment request', { errors: validation.errors });
        return {
          success: false,
          error: new PaymentError(
            validation.errors?.join(', ') || 'Invalid payment request',
            'VALIDATION_ERROR'
          ),
        };
      }

      // Generate idempotency key
      const idempotencyKey = this.generateIdempotencyKey(
        request.userId,
        request.amount
      );

      // Check for duplicate payment
      const cachedResult = await this.paymentRepository.getIdempotencyResult(
        idempotencyKey
      );
      if (cachedResult) {
        logger.info('Returning cached payment result', { idempotencyKey });
        return cachedResult;
      }

      // Create Stripe Payment Intent
      const paymentIntentResult = await this.stripeClient.createPaymentIntent(
        request.amount,
        request.currency,
        request.metadata || {},
        idempotencyKey
      );

      if (!paymentIntentResult.success) {
        logger.error('Failed to create payment intent', { request });
        return {
          success: false,
          error: new PaymentError(
            'Failed to create payment intent',
            'STRIPE_ERROR'
          ),
        };
      }

      // Store payment record
      const payment = await this.paymentRepository.createPayment({
        userId: request.userId,
        stripePaymentIntentId: paymentIntentResult.paymentIntentId,
        amount: request.amount,
        currency: request.currency,
        status: PaymentStatus.PENDING,
        paymentMethodId: request.paymentMethodId,
        courseId: request.courseId,
        subscriptionTierId: request.subscriptionTierId,
        metadata: request.metadata || {},
        idempotencyKey,
      });

      // Cache result
      const result: PaymentResult = {
        success: true,
        paymentId: payment.id,
        stripePaymentIntentId: paymentIntentResult.paymentIntentId,
        status: PaymentStatus.PENDING,
        clientSecret: paymentIntentResult.clientSecret,
      };

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await this.paymentRepository.storeIdempotencyKey(
        idempotencyKey,
        request.userId,
        result,
        expiresAt
      );

      logger.info('Payment processed successfully', {
        paymentId: payment.id,
        stripePaymentIntentId: paymentIntentResult.paymentIntentId,
      });

      return result;
    } catch (error) {
      logger.error('Payment processing failed', { error, request });
      return {
        success: false,
        error:
          error instanceof PaymentError
            ? error
            : new PaymentError('Payment processing failed', 'UNKNOWN_ERROR'),
      };
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus | null> {
    try {
      const payment = await this.paymentRepository.getPaymentById(paymentId);
      if (!payment) {
        return null;
      }
      return payment.status;
    } catch (error) {
      logger.error('Failed to get payment status', { error, paymentId });
      throw error;
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<PaymentResult> {
    try {
      logger.info('Processing refund', { paymentId, amount, reason });

      // Get payment
      const payment = await this.paymentRepository.getPaymentById(paymentId);
      if (!payment) {
        return {
          success: false,
          error: new PaymentError('Payment not found', 'NOT_FOUND', 404),
        };
      }

      // Check if payment can be refunded
      if (payment.status === PaymentStatus.REFUNDED) {
        return {
          success: false,
          error: new PaymentError(
            'Payment already refunded',
            'ALREADY_REFUNDED'
          ),
        };
      }

      if (payment.status !== PaymentStatus.SUCCEEDED) {
        return {
          success: false,
          error: new PaymentError(
            'Only succeeded payments can be refunded',
            'INVALID_STATUS'
          ),
        };
      }

      // Create refund in Stripe
      const refundResult = await this.stripeClient.createRefund(
        payment.stripePaymentIntentId,
        amount
      );

      if (!refundResult.success) {
        return {
          success: false,
          error: new PaymentError('Failed to create refund', 'STRIPE_ERROR'),
        };
      }

      // Update payment record
      await this.paymentRepository.updatePayment(paymentId, {
        status: PaymentStatus.REFUNDED,
        refundedAmount: amount || payment.amount,
        refundReason: reason,
      } as any);

      logger.info('Refund processed successfully', {
        paymentId,
        refundId: refundResult.refundId,
      });

      return {
        success: true,
        paymentId,
      };
    } catch (error) {
      logger.error('Refund processing failed', { error, paymentId });
      return {
        success: false,
        error:
          error instanceof PaymentError
            ? error
            : new PaymentError('Refund processing failed', 'UNKNOWN_ERROR'),
      };
    }
  }

  /**
   * Validate payment request
   */
  validatePaymentRequest(request: PaymentRequest): ValidationResult {
    const errors: string[] = [];

    if (!request.userId) {
      errors.push('User ID is required');
    }

    if (!request.amount || request.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (!request.currency) {
      errors.push('Currency is required');
    }

    if (!request.paymentMethodId) {
      errors.push('Payment method ID is required');
    }

    if (request.amount > 999999999) {
      errors.push('Amount exceeds maximum allowed');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Generate idempotency key
   */
  generateIdempotencyKey(userId: string, amount: number): string {
    const timestamp = Date.now();
    const random = randomBytes(16).toString('hex');
    const data = `${userId}-${amount}-${timestamp}-${random}`;

    return createHash('sha256').update(data).digest('hex');
  }
}

export default PaymentProcessor;
