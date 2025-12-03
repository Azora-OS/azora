import { generateUUID } from '../utils/uuid.js';
import { Payment, PaymentRequest, PaymentHistory } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { stripeClient } from '../utils/stripe-client.js';

// Mock database - replace with actual database calls
const payments: Map<string, Payment> = new Map();

export class PaymentService {
  /**
   * Create payment
   * Requirements: 4.2, 4.3
   */
  async createPayment(
    businessId: string,
    userId: string,
    data: PaymentRequest
  ): Promise<Payment> {
    if (data.amount <= 0) {
      throw new AppError(400, 'Payment amount must be positive');
    }

    const paymentId = generateUUID();
    const now = new Date();

    // Create payment intent with Stripe
    const paymentIntentId = await stripeClient.createPaymentIntent(data.amount, 'usd');

    const payment: Payment = {
      id: paymentId,
      businessId,
      userId,
      amount: data.amount,
      type: data.type,
      status: 'pending',
      paymentMethod: data.paymentMethod,
      transactionId: paymentIntentId,
      createdAt: now,
      updatedAt: now,
    };

    payments.set(paymentId, payment);

    return payment;
  }

  /**
   * Get payment by ID
   * Requirements: 4.2, 4.3
   */
  async getPaymentById(paymentId: string, userId: string): Promise<Payment> {
    const payment = payments.get(paymentId);

    if (!payment) {
      throw new AppError(404, 'Payment not found');
    }

    if (payment.userId !== userId) {
      throw new AppError(403, 'Unauthorized access to this payment');
    }

    return payment;
  }

  /**
   * Get payments for a business
   * Requirements: 4.2, 4.3
   */
  async getBusinessPayments(
    businessId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{
    payments: Payment[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const businessPayments = Array.from(payments.values()).filter(
      (p) => p.businessId === businessId
    );

    const total = businessPayments.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      payments: businessPayments.slice(start, end),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Confirm payment
   * Requirements: 4.2, 4.3
   */
  async confirmPayment(paymentId: string, userId: string): Promise<Payment> {
    const payment = await this.getPaymentById(paymentId, userId);

    if (payment.status !== 'pending') {
      throw new AppError(400, 'Only pending payments can be confirmed');
    }

    if (!payment.transactionId) {
      throw new AppError(400, 'Payment transaction ID is missing');
    }

    // Confirm with Stripe
    const confirmed = await stripeClient.confirmPayment(payment.transactionId);

    if (!confirmed) {
      payment.status = 'failed';
      payment.updatedAt = new Date();
      payments.set(paymentId, payment);
      throw new AppError(400, 'Payment confirmation failed');
    }

    payment.status = 'completed';
    payment.completedAt = new Date();
    payment.updatedAt = new Date();

    payments.set(paymentId, payment);

    return payment;
  }

  /**
   * Update payment status
   * Requirements: 4.2, 4.3
   */
  async updatePaymentStatus(
    paymentId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed'
  ): Promise<Payment> {
    const payment = payments.get(paymentId);

    if (!payment) {
      throw new AppError(404, 'Payment not found');
    }

    payment.status = status;
    payment.updatedAt = new Date();

    if (status === 'completed') {
      payment.completedAt = new Date();
    }

    payments.set(paymentId, payment);

    return payment;
  }

  /**
   * Refund payment
   * Requirements: 4.2, 4.3
   */
  async refundPayment(paymentId: string, amount?: number): Promise<Payment> {
    const payment = payments.get(paymentId);

    if (!payment) {
      throw new AppError(404, 'Payment not found');
    }

    if (payment.status !== 'completed') {
      throw new AppError(400, 'Only completed payments can be refunded');
    }

    if (!payment.transactionId) {
      throw new AppError(400, 'Payment transaction ID is missing');
    }

    const refundAmount = amount || payment.amount;

    if (refundAmount > payment.amount) {
      throw new AppError(400, 'Refund amount cannot exceed payment amount');
    }

    // Refund with Stripe
    const refundId = await stripeClient.refundPayment(payment.transactionId, refundAmount);

    payment.status = 'failed'; // Mark as refunded
    payment.updatedAt = new Date();
    payments.set(paymentId, payment);

    return payment;
  }

  /**
   * Retry failed payment
   * Requirements: 4.2, 4.3
   */
  async retryPayment(paymentId: string, userId: string): Promise<Payment> {
    const payment = await this.getPaymentById(paymentId, userId);

    if (payment.status !== 'failed') {
      throw new AppError(400, 'Only failed payments can be retried');
    }

    // Create new payment intent
    const newPaymentIntentId = await stripeClient.createPaymentIntent(payment.amount, 'usd');

    payment.transactionId = newPaymentIntentId;
    payment.status = 'pending';
    payment.updatedAt = new Date();

    payments.set(paymentId, payment);

    return payment;
  }

  /**
   * Get payment history for a business
   * Requirements: 4.2, 4.3
   */
  async getPaymentHistory(businessId: string): Promise<PaymentHistory> {
    const businessPayments = Array.from(payments.values()).filter(
      (p) => p.businessId === businessId
    );

    const statusBreakdown = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    };

    let totalAmount = 0;

    businessPayments.forEach((p) => {
      statusBreakdown[p.status as keyof typeof statusBreakdown]++;
      if (p.status === 'completed') {
        totalAmount += p.amount;
      }
    });

    const averageAmount = businessPayments.length > 0 ? totalAmount / businessPayments.length : 0;

    return {
      payments: businessPayments,
      totalAmount,
      totalCount: businessPayments.length,
      averageAmount,
      statusBreakdown,
    };
  }

  /**
   * Get payment statistics
   * Requirements: 4.2, 4.3
   */
  async getPaymentStats(startDate?: Date, endDate?: Date): Promise<{
    totalPayments: number;
    totalAmount: number;
    averageAmount: number;
    successRate: number;
    failureRate: number;
    pendingCount: number;
  }> {
    let allPayments = Array.from(payments.values());

    if (startDate || endDate) {
      const start = startDate || new Date(0);
      const end = endDate || new Date();

      allPayments = allPayments.filter((p) => {
        const payDate = new Date(p.createdAt);
        return payDate >= start && payDate <= end;
      });
    }

    const completedPayments = allPayments.filter((p) => p.status === 'completed');
    const failedPayments = allPayments.filter((p) => p.status === 'failed');
    const pendingPayments = allPayments.filter((p) => p.status === 'pending');

    const totalAmount = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const averageAmount = allPayments.length > 0 ? totalAmount / allPayments.length : 0;
    const successRate = allPayments.length > 0 ? (completedPayments.length / allPayments.length) * 100 : 0;
    const failureRate = allPayments.length > 0 ? (failedPayments.length / allPayments.length) * 100 : 0;

    return {
      totalPayments: allPayments.length,
      totalAmount,
      averageAmount,
      successRate,
      failureRate,
      pendingCount: pendingPayments.length,
    };
  }

  /**
   * Validate payment
   * Requirements: 4.2, 4.3
   */
  validatePayment(data: PaymentRequest): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (data.amount <= 0) {
      errors.push('Payment amount must be positive');
    }

    const validTypes = ['revenue', 'refund', 'fund_distribution'];
    if (!validTypes.includes(data.type)) {
      errors.push(`Invalid payment type. Must be one of: ${validTypes.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const paymentService = new PaymentService();
