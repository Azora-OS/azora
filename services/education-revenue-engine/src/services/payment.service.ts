import { prisma } from '../index';
import { Payment } from '../types';
import { logger } from '../utils/logger';
import Stripe from 'stripe';
import { NotFoundError, BadRequestError, InternalServerError, BusinessLogicError } from '../utils/errors';
import Joi from 'joi';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-08-16',
});

// Validation schemas
const processPaymentSchema = Joi.object({
  studentId: Joi.string().required(),
  courseId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  tier: Joi.string().valid('free', 'premium', 'pro').required(),
  period: Joi.string().pattern(/^\d{4}-\d{2}$/).required(), // YYYY-MM format
  paymentMethodId: Joi.string().required(),
});

const refundPaymentSchema = Joi.object({
  reason: Joi.string().optional(),
  amount: Joi.number().positive().optional(),
});

export class PaymentService {
  /**
   * Process a payment using Stripe
   * Requirements: 1.2, 5.1
   */
  async processPayment(data: {
    studentId: string;
    courseId: string;
    amount: number;
    tier: string;
    period: string;
    paymentMethodId: string;
  }): Promise<Payment> {
    try {
      // Validate input
      const { error, value } = processPaymentSchema.validate(data);
      if (error) {
        throw new BadRequestError(error.details[0].message, 'INVALID_PAYMENT_DATA');
      }

      // Verify student exists
      const student = await prisma.user.findUnique({
        where: { id: value.studentId },
      });
      if (!student) {
        throw new NotFoundError('Student', value.studentId);
      }

      // Verify course exists
      const course = await prisma.course.findUnique({
        where: { id: value.courseId },
      });
      if (!course) {
        throw new NotFoundError('Course', value.courseId);
      }

      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(value.amount * 100), // Convert to cents
        currency: 'usd',
        payment_method: value.paymentMethodId,
        confirm: true,
        metadata: {
          studentId: value.studentId,
          courseId: value.courseId,
          tier: value.tier,
          period: value.period,
        },
      });

      // Check if payment was successful
      if (paymentIntent.status !== 'succeeded') {
        throw new BusinessLogicError(
          `Payment failed with status: ${paymentIntent.status}`,
          'PAYMENT_FAILED',
          { stripeStatus: paymentIntent.status }
        );
      }

      // Record payment in database
      const payment = await prisma.payment.create({
        data: {
          studentId: value.studentId,
          courseId: value.courseId,
          amount: value.amount,
          tier: value.tier,
          period: value.period,
          status: 'completed',
          stripePaymentId: paymentIntent.id,
        },
      });

      logger.info(`Payment processed successfully: ${payment.id}`, {
        studentId: value.studentId,
        courseId: value.courseId,
        amount: value.amount,
        stripePaymentId: paymentIntent.id,
      });

      return {
        ...payment,
        amount: Number(payment.amount),
      } as Payment;
    } catch (error) {
      logger.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Get payments for a student
   * Requirements: 1.2, 5.1
   */
  async getStudentPayments(studentId: string): Promise<Payment[]> {
    try {
      // Verify student exists
      const student = await prisma.user.findUnique({
        where: { id: studentId },
      });
      if (!student) {
        throw new NotFoundError('Student', studentId);
      }

      const payments = await prisma.payment.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
      });

      return payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
      })) as Payment[];
    } catch (error) {
      logger.error('Error fetching student payments:', error);
      throw error;
    }
  }

  /**
   * Get a specific payment by ID
   * Requirements: 1.2, 5.1
   */
  async getPaymentById(paymentId: string): Promise<Payment> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new NotFoundError('Payment', paymentId);
      }

      return {
        ...payment,
        amount: Number(payment.amount),
      } as Payment;
    } catch (error) {
      logger.error('Error fetching payment:', error);
      throw error;
    }
  }

  /**
   * Refund a payment
   * Requirements: 1.2, 5.1
   */
  async refundPayment(
    paymentId: string,
    options?: {
      reason?: string;
      amount?: number;
    }
  ): Promise<Payment> {
    try {
      // Validate input
      if (options) {
        const { error } = refundPaymentSchema.validate(options);
        if (error) {
          throw new BadRequestError(error.details[0].message, 'INVALID_REFUND_DATA');
        }
      }

      // Get payment
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new NotFoundError('Payment', paymentId);
      }

      // Check if payment can be refunded
      if (payment.status === 'refunded') {
        throw new BusinessLogicError(
          'Payment has already been refunded',
          'PAYMENT_ALREADY_REFUNDED'
        );
      }

      if (payment.status === 'pending') {
        throw new BusinessLogicError(
          'Cannot refund a pending payment',
          'CANNOT_REFUND_PENDING'
        );
      }

      if (!payment.stripePaymentId) {
        throw new InternalServerError('Payment has no Stripe ID for refund');
      }

      // Create refund with Stripe
      const refundAmount = options?.amount ? Math.round(options.amount * 100) : undefined;
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentId,
        amount: refundAmount,
        reason: (options?.reason as any) || 'requested_by_customer',
        metadata: {
          paymentId,
          originalAmount: Number(payment.amount).toString(),
        },
      });

      // Check if refund was successful
      if (refund.status !== 'succeeded') {
        throw new BusinessLogicError(
          `Refund failed with status: ${refund.status}`,
          'REFUND_FAILED',
          { stripeStatus: refund.status }
        );
      }

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'refunded',
        },
      });

      logger.info(`Payment refunded successfully: ${paymentId}`, {
        stripeRefundId: refund.id,
        amount: refund.amount ? refund.amount / 100 : Number(payment.amount),
      });

      return {
        ...updatedPayment,
        amount: Number(updatedPayment.amount),
      } as Payment;
    } catch (error) {
      logger.error('Error refunding payment:', error);
      throw error;
    }
  }

  /**
   * Get payment statistics for a period
   * Requirements: 5.1
   */
  async getPaymentStats(period: string): Promise<{
    totalPayments: number;
    totalAmount: number;
    completedPayments: number;
    refundedPayments: number;
    pendingPayments: number;
  }> {
    try {
      const payments = await prisma.payment.findMany({
        where: { period },
      });

      const stats = {
        totalPayments: payments.length,
        totalAmount: payments.reduce((sum, p) => sum + Number(p.amount), 0),
        completedPayments: payments.filter((p) => p.status === 'completed').length,
        refundedPayments: payments.filter((p) => p.status === 'refunded').length,
        pendingPayments: payments.filter((p) => p.status === 'pending').length,
      };

      return stats;
    } catch (error) {
      logger.error('Error fetching payment statistics:', error);
      throw error;
    }
  }

  /**
   * Get payment history for a course
   * Requirements: 5.1
   */
  async getCoursePaymentHistory(courseId: string): Promise<Payment[]> {
    try {
      // Verify course exists
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!course) {
        throw new NotFoundError('Course', courseId);
      }

      const payments = await prisma.payment.findMany({
        where: { courseId },
        orderBy: { createdAt: 'desc' },
      });

      return payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
      })) as Payment[];
    } catch (error) {
      logger.error('Error fetching course payment history:', error);
      throw error;
    }
  }

  /**
   * Validate payment amount against course pricing
   * Requirements: 1.2, 5.1
   */
  async validatePaymentAmount(courseId: string, amount: number, tier: string): Promise<boolean> {
    try {
      // Get course
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });
      if (!course) {
        throw new NotFoundError('Course', courseId);
      }

      // Get pricing tier
      const pricingTier = await prisma.pricingTier.findUnique({
        where: { name: tier },
      });
      if (!pricingTier) {
        throw new NotFoundError('Pricing tier', tier);
      }

      // Validate amount is within acceptable range (allow 1% variance for currency conversion)
      const expectedAmount = Number(pricingTier.monthlyPrice);
      const variance = expectedAmount * 0.01;
      const isValid = Math.abs(amount - expectedAmount) <= variance;

      return isValid;
    } catch (error) {
      logger.error('Error validating payment amount:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
