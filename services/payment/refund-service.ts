/**
 * Refund Service
 * Handles refund processing and validation
 */

import { logger } from '../shared/logging';
import PaymentRepository from './payment-repository';
import StripeClientService from './stripe-client';
import { Payment, PaymentStatus, PaymentError } from './types';

export interface RefundRequest {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  amount?: number;
  status?: string;
  error?: PaymentError;
}

export class RefundService {
  constructor(
    private paymentRepository: PaymentRepository,
    private stripeClient: StripeClientService
  ) {}

  /**
   * Validate refund eligibility
   */
  async validateRefundEligibility(paymentId: string): Promise<{
    eligible: boolean;
    reason?: string;
  }> {
    try {
      logger.info('Validating refund eligibility', { paymentId });

      // Get payment
      const payment = await this.paymentRepository.getPaymentById(paymentId);

      if (!payment) {
        return {
          eligible: false,
          reason: 'Payment not found',
        };
      }

      // Check payment status
      if (payment.status === PaymentStatus.REFUNDED) {
        return {
          eligible: false,
          reason: 'Payment already refunded',
        };
      }

      if (payment.status !== PaymentStatus.SUCCEEDED) {
        return {
          eligible: false,
          reason: `Cannot refund payment with status: ${payment.status}`,
        };
      }

      // Check if payment is too old (optional - adjust based on business rules)
      const paymentAge = Date.now() - payment.createdAt.getTime();
      const maxRefundAge = 90 * 24 * 60 * 60 * 1000; // 90 days

      if (paymentAge > maxRefundAge) {
        return {
          eligible: false,
          reason: 'Payment is too old for refund',
        };
      }

      logger.info('Payment is eligible for refund', { paymentId });

      return {
        eligible: true,
      };
    } catch (error) {
      logger.error('Error validating refund eligibility', { error, paymentId });
      throw new PaymentError(
        'Failed to validate refund eligibility',
        'REFUND_VALIDATION_ERROR',
        500
      );
    }
  }

  /**
   * Process refund
   */
  async processRefund(request: RefundRequest): Promise<RefundResult> {
    try {
      logger.info('Processing refund', {
        paymentId: request.paymentId,
        amount: request.amount,
        reason: request.reason,
      });

      // Validate eligibility
      const eligibility = await this.validateRefundEligibility(request.paymentId);

      if (!eligibility.eligible) {
        logger.warn('Refund not eligible', {
          paymentId: request.paymentId,
          reason: eligibility.reason,
        });

        return {
          success: false,
          error: new PaymentError(
            eligibility.reason || 'Refund not eligible',
            'REFUND_NOT_ELIGIBLE',
            400
          ),
        };
      }

      // Get payment
      const payment = await this.paymentRepository.getPaymentById(
        request.paymentId
      );

      if (!payment) {
        return {
          success: false,
          error: new PaymentError('Payment not found', 'NOT_FOUND', 404),
        };
      }

      // Validate refund amount
      const refundAmount = request.amount || payment.amount;

      if (refundAmount > payment.amount) {
        return {
          success: false,
          error: new PaymentError(
            'Refund amount exceeds payment amount',
            'INVALID_REFUND_AMOUNT',
            400
          ),
        };
      }

      if (refundAmount <= 0) {
        return {
          success: false,
          error: new PaymentError(
            'Refund amount must be greater than 0',
            'INVALID_REFUND_AMOUNT',
            400
          ),
        };
      }

      // Create refund in Stripe
      const refundResult = await this.stripeClient.createRefund(
        payment.stripePaymentIntentId,
        refundAmount
      );

      if (!refundResult.success) {
        logger.error('Stripe refund failed', {
          paymentId: request.paymentId,
        });

        return {
          success: false,
          error: new PaymentError('Stripe refund failed', 'STRIPE_REFUND_ERROR', 500),
        };
      }

      // Update payment record
      await this.paymentRepository.updatePayment(request.paymentId, {
        status: PaymentStatus.REFUNDED,
        refundedAmount: refundAmount,
        refundReason: request.reason,
      } as any);

      logger.info('Refund processed successfully', {
        paymentId: request.paymentId,
        refundId: refundResult.refundId,
        amount: refundAmount,
      });

      return {
        success: true,
        refundId: refundResult.refundId,
        amount: refundAmount,
        status: refundResult.status,
      };
    } catch (error) {
      logger.error('Error processing refund', { error, paymentId: request.paymentId });

      return {
        success: false,
        error:
          error instanceof PaymentError
            ? error
            : new PaymentError('Failed to process refund', 'UNKNOWN_ERROR', 500),
      };
    }
  }

  /**
   * Get refund status
   */
  async getRefundStatus(paymentId: string): Promise<{
    refunded: boolean;
    refundedAmount?: number;
    refundReason?: string;
  }> {
    try {
      const payment = await this.paymentRepository.getPaymentById(paymentId);

      if (!payment) {
        throw new PaymentError('Payment not found', 'NOT_FOUND', 404);
      }

      return {
        refunded: payment.status === PaymentStatus.REFUNDED,
        refundedAmount: payment.refundedAmount,
        refundReason: payment.refundReason,
      };
    } catch (error) {
      logger.error('Error getting refund status', { error, paymentId });
      throw error;
    }
  }
}

export default RefundService;
