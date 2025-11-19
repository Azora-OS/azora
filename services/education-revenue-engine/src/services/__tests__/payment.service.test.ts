// Mock Prisma and Stripe before importing the service
jest.mock('../../index', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    course: {
      findUnique: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    pricingTier: {
      findUnique: jest.fn(),
    },
  },
}));

const mockStripeInstance = {
  paymentIntents: {
    create: jest.fn(),
  },
  refunds: {
    create: jest.fn(),
  },
};

jest.mock('stripe', () => {
  return jest.fn(() => mockStripeInstance);
});

import { paymentService } from '../payment.service';
import { prisma } from '../../index';

describe('PaymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processPayment', () => {
    it('should process a payment successfully', async () => {
      const mockStudent = { id: 'student-1', email: 'student@example.com' };
      const mockCourse = { id: 'course-1', title: 'Test Course' };
      const mockPaymentIntent = {
        id: 'pi_123',
        status: 'succeeded',
        amount: 2999,
      };
      const mockPayment = {
        id: 'payment-1',
        studentId: 'student-1',
        courseId: 'course-1',
        amount: 29.99,
        tier: 'premium',
        period: '2024-01',
        status: 'completed',
        stripePaymentId: 'pi_123',
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockStudent);
      (prisma.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (mockStripeInstance.paymentIntents.create as jest.Mock).mockResolvedValue(mockPaymentIntent);
      (prisma.payment.create as jest.Mock).mockResolvedValue(mockPayment);

      const result = await paymentService.processPayment({
        studentId: 'student-1',
        courseId: 'course-1',
        amount: 29.99,
        tier: 'premium',
        period: '2024-01',
        paymentMethodId: 'pm_123',
      });

      expect(result).toEqual(mockPayment);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'student-1' },
      });
      expect(prisma.course.findUnique).toHaveBeenCalledWith({
        where: { id: 'course-1' },
      });
      expect(prisma.payment.create).toHaveBeenCalled();
    });

    it('should throw error if student not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        paymentService.processPayment({
          studentId: 'invalid-student',
          courseId: 'course-1',
          amount: 29.99,
          tier: 'premium',
          period: '2024-01',
          paymentMethodId: 'pm_123',
        })
      ).rejects.toThrow('Student with ID invalid-student not found');
    });

    it('should throw error if course not found', async () => {
      const mockStudent = { id: 'student-1', email: 'student@example.com' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockStudent);
      (prisma.course.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        paymentService.processPayment({
          studentId: 'student-1',
          courseId: 'invalid-course',
          amount: 29.99,
          tier: 'premium',
          period: '2024-01',
          paymentMethodId: 'pm_123',
        })
      ).rejects.toThrow('Course with ID invalid-course not found');
    });

    it('should throw error if payment intent fails', async () => {
      const mockStudent = { id: 'student-1', email: 'student@example.com' };
      const mockCourse = { id: 'course-1', title: 'Test Course' };
      const mockPaymentIntent = {
        id: 'pi_123',
        status: 'requires_payment_method',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockStudent);
      (prisma.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (mockStripeInstance.paymentIntents.create as jest.Mock).mockResolvedValue(mockPaymentIntent);

      await expect(
        paymentService.processPayment({
          studentId: 'student-1',
          courseId: 'course-1',
          amount: 29.99,
          tier: 'premium',
          period: '2024-01',
          paymentMethodId: 'pm_123',
        })
      ).rejects.toThrow('Payment failed with status: requires_payment_method');
    });

    it('should validate required fields', async () => {
      await expect(
        paymentService.processPayment({
          studentId: '',
          courseId: 'course-1',
          amount: 29.99,
          tier: 'premium',
          period: '2024-01',
          paymentMethodId: 'pm_123',
        })
      ).rejects.toThrow();
    });
  });

  describe('getStudentPayments', () => {
    it('should return all payments for a student', async () => {
      const mockStudent = { id: 'student-1', email: 'student@example.com' };
      const mockPayments = [
        {
          id: 'payment-1',
          studentId: 'student-1',
          courseId: 'course-1',
          amount: 29.99,
          tier: 'premium',
          period: '2024-01',
          status: 'completed',
          stripePaymentId: 'pi_123',
          createdAt: new Date(),
        },
        {
          id: 'payment-2',
          studentId: 'student-1',
          courseId: 'course-2',
          amount: 99.99,
          tier: 'pro',
          period: '2024-02',
          status: 'completed',
          stripePaymentId: 'pi_124',
          createdAt: new Date(),
        },
      ];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockStudent);
      (prisma.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

      const result = await paymentService.getStudentPayments('student-1');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('payment-1');
      expect(prisma.payment.findMany).toHaveBeenCalledWith({
        where: { studentId: 'student-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should throw error if student not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(paymentService.getStudentPayments('invalid-student')).rejects.toThrow(
        'Student with ID invalid-student not found'
      );
    });
  });

  describe('getPaymentById', () => {
    it('should return a specific payment', async () => {
      const mockPayment = {
        id: 'payment-1',
        studentId: 'student-1',
        courseId: 'course-1',
        amount: 29.99,
        tier: 'premium',
        period: '2024-01',
        status: 'completed',
        stripePaymentId: 'pi_123',
        createdAt: new Date(),
      };

      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);

      const result = await paymentService.getPaymentById('payment-1');

      expect(result).toEqual(mockPayment);
      expect(prisma.payment.findUnique).toHaveBeenCalledWith({
        where: { id: 'payment-1' },
      });
    });

    it('should throw error if payment not found', async () => {
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(paymentService.getPaymentById('invalid-payment')).rejects.toThrow(
        'Payment with ID invalid-payment not found'
      );
    });
  });

  describe('refundPayment', () => {
    it('should refund a completed payment', async () => {
      const mockPayment = {
        id: 'payment-1',
        studentId: 'student-1',
        courseId: 'course-1',
        amount: 29.99,
        tier: 'premium',
        period: '2024-01',
        status: 'completed',
        stripePaymentId: 'pi_123',
        createdAt: new Date(),
      };
      const mockRefund = {
        id: 'ref_123',
        status: 'succeeded',
        amount: 2999,
      };
      const mockUpdatedPayment = {
        ...mockPayment,
        status: 'refunded',
      };

      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);
      (mockStripeInstance.refunds.create as jest.Mock).mockResolvedValue(mockRefund);
      (prisma.payment.update as jest.Mock).mockResolvedValue(mockUpdatedPayment);

      const result = await paymentService.refundPayment('payment-1', {
        reason: 'customer_request',
      });

      expect(result.status).toBe('refunded');
      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment-1' },
        data: { status: 'refunded' },
      });
    });

    it('should throw error if payment already refunded', async () => {
      const mockPayment = {
        id: 'payment-1',
        studentId: 'student-1',
        courseId: 'course-1',
        amount: 29.99,
        tier: 'premium',
        period: '2024-01',
        status: 'refunded',
        stripePaymentId: 'pi_123',
        createdAt: new Date(),
      };

      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);

      await expect(paymentService.refundPayment('payment-1')).rejects.toThrow(
        'Payment has already been refunded'
      );
    });

    it('should throw error if payment is pending', async () => {
      const mockPayment = {
        id: 'payment-1',
        studentId: 'student-1',
        courseId: 'course-1',
        amount: 29.99,
        tier: 'premium',
        period: '2024-01',
        status: 'pending',
        stripePaymentId: 'pi_123',
        createdAt: new Date(),
      };

      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);

      await expect(paymentService.refundPayment('payment-1')).rejects.toThrow(
        'Cannot refund a pending payment'
      );
    });

    it('should throw error if payment not found', async () => {
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(paymentService.refundPayment('invalid-payment')).rejects.toThrow(
        'Payment with ID invalid-payment not found'
      );
    });
  });

  describe('getPaymentStats', () => {
    it('should return payment statistics for a period', async () => {
      const mockPayments = [
        {
          id: 'payment-1',
          studentId: 'student-1',
          courseId: 'course-1',
          amount: 29.99,
          tier: 'premium',
          period: '2024-01',
          status: 'completed',
          stripePaymentId: 'pi_123',
          createdAt: new Date(),
        },
        {
          id: 'payment-2',
          studentId: 'student-2',
          courseId: 'course-2',
          amount: 99.99,
          tier: 'pro',
          period: '2024-01',
          status: 'completed',
          stripePaymentId: 'pi_124',
          createdAt: new Date(),
        },
        {
          id: 'payment-3',
          studentId: 'student-3',
          courseId: 'course-3',
          amount: 29.99,
          tier: 'premium',
          period: '2024-01',
          status: 'refunded',
          stripePaymentId: 'pi_125',
          createdAt: new Date(),
        },
      ];

      (prisma.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

      const result = await paymentService.getPaymentStats('2024-01');

      expect(result.totalPayments).toBe(3);
      expect(result.completedPayments).toBe(2);
      expect(result.refundedPayments).toBe(1);
      expect(result.pendingPayments).toBe(0);
      expect(result.totalAmount).toBe(159.97);
    });
  });

  describe('getCoursePaymentHistory', () => {
    it('should return payment history for a course', async () => {
      const mockCourse = { id: 'course-1', title: 'Test Course' };
      const mockPayments = [
        {
          id: 'payment-1',
          studentId: 'student-1',
          courseId: 'course-1',
          amount: 29.99,
          tier: 'premium',
          period: '2024-01',
          status: 'completed',
          stripePaymentId: 'pi_123',
          createdAt: new Date(),
        },
      ];

      (prisma.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (prisma.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

      const result = await paymentService.getCoursePaymentHistory('course-1');

      expect(result).toHaveLength(1);
      expect(result[0].courseId).toBe('course-1');
      expect(prisma.payment.findMany).toHaveBeenCalledWith({
        where: { courseId: 'course-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should throw error if course not found', async () => {
      (prisma.course.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(paymentService.getCoursePaymentHistory('invalid-course')).rejects.toThrow(
        'Course with ID invalid-course not found'
      );
    });
  });

  describe('validatePaymentAmount', () => {
    it('should validate payment amount within acceptable range', async () => {
      const mockCourse = { id: 'course-1', title: 'Test Course' };
      const mockTier = {
        id: 'tier-1',
        name: 'premium',
        monthlyPrice: 29.99,
      };

      (prisma.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (prisma.pricingTier.findUnique as jest.Mock).mockResolvedValue(mockTier);

      const result = await paymentService.validatePaymentAmount('course-1', 29.99, 'premium');

      expect(result).toBe(true);
    });

    it('should reject payment amount outside acceptable range', async () => {
      const mockCourse = { id: 'course-1', title: 'Test Course' };
      const mockTier = {
        id: 'tier-1',
        name: 'premium',
        monthlyPrice: 29.99,
      };

      (prisma.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (prisma.pricingTier.findUnique as jest.Mock).mockResolvedValue(mockTier);

      const result = await paymentService.validatePaymentAmount('course-1', 50.0, 'premium');

      expect(result).toBe(false);
    });

    it('should throw error if course not found', async () => {
      (prisma.course.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        paymentService.validatePaymentAmount('invalid-course', 29.99, 'premium')
      ).rejects.toThrow('Course with ID invalid-course not found');
    });

    it('should throw error if tier not found', async () => {
      const mockCourse = { id: 'course-1', title: 'Test Course' };
      (prisma.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (prisma.pricingTier.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        paymentService.validatePaymentAmount('course-1', 29.99, 'invalid-tier')
      ).rejects.toThrow('Pricing tier with ID invalid-tier not found');
    });
  });
});
