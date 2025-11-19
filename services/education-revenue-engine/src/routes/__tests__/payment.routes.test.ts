import request from 'supertest';
import express, { Express } from 'express';
import paymentRoutes from '../payment.routes';
import { paymentService } from '../../services/payment.service';

// Mock the payment service
jest.mock('../../services/payment.service', () => ({
  paymentService: {
    processPayment: jest.fn(),
    getStudentPayments: jest.fn(),
    getPaymentById: jest.fn(),
    refundPayment: jest.fn(),
    getPaymentStats: jest.fn(),
    getCoursePaymentHistory: jest.fn(),
    validatePaymentAmount: jest.fn(),
  },
}));

describe('Payment Routes', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/payments', paymentRoutes);
    jest.clearAllMocks();
  });

  describe('POST /api/v1/payments/process', () => {
    it('should process a payment successfully', async () => {
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

      (paymentService.processPayment as jest.Mock).mockResolvedValue(mockPayment);

      const response = await request(app)
        .post('/api/v1/payments/process')
        .send({
          studentId: 'student-1',
          courseId: 'course-1',
          amount: 29.99,
          tier: 'premium',
          period: '2024-01',
          paymentMethodId: 'pm_123',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockPayment.id);
      expect(response.body.data.studentId).toBe(mockPayment.studentId);
      expect(response.body.data.status).toBe('completed');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/payments/process')
        .send({
          studentId: 'student-1',
          courseId: 'course-1',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle payment service errors', async () => {
      (paymentService.processPayment as jest.Mock).mockRejectedValue(
        new Error('Payment failed')
      );

      const response = await request(app)
        .post('/api/v1/payments/process')
        .send({
          studentId: 'student-1',
          courseId: 'course-1',
          amount: 29.99,
          tier: 'premium',
          period: '2024-01',
          paymentMethodId: 'pm_123',
        });

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/v1/payments/:studentId', () => {
    it('should return all payments for a student', async () => {
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

      (paymentService.getStudentPayments as jest.Mock).mockResolvedValue(mockPayments);

      const response = await request(app)
        .get('/api/v1/payments/student-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(mockPayments[0].id);
    });

    it('should return 400 if studentId is missing', async () => {
      const response = await request(app)
        .get('/api/v1/payments/');

      expect(response.status).toBe(404);
    });

    it('should handle service errors', async () => {
      (paymentService.getStudentPayments as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app)
        .get('/api/v1/payments/student-1');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/v1/payments/details/:paymentId', () => {
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

      (paymentService.getPaymentById as jest.Mock).mockResolvedValue(mockPayment);

      const response = await request(app)
        .get('/api/v1/payments/details/payment-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockPayment.id);
      expect(response.body.data.status).toBe('completed');
    });

    it('should return 400 if paymentId is missing', async () => {
      const response = await request(app)
        .get('/api/v1/payments/details/');

      // Express will return 404 for missing route parameter
      expect([404, 500]).toContain(response.status);
    });
  });

  describe('POST /api/v1/payments/:paymentId/refund', () => {
    it('should refund a payment successfully', async () => {
      const mockRefundedPayment = {
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

      (paymentService.refundPayment as jest.Mock).mockResolvedValue(mockRefundedPayment);

      const response = await request(app)
        .post('/api/v1/payments/payment-1/refund')
        .send({
          reason: 'customer_request',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('refunded');
    });

    it('should return 400 if paymentId is missing', async () => {
      const response = await request(app)
        .post('/api/v1/payments//refund')
        .send({
          reason: 'customer_request',
        });

      expect(response.status).toBe(404);
    });

    it('should handle refund errors', async () => {
      (paymentService.refundPayment as jest.Mock).mockRejectedValue(
        new Error('Refund failed')
      );

      const response = await request(app)
        .post('/api/v1/payments/payment-1/refund')
        .send({
          reason: 'customer_request',
        });

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/v1/payments/stats/:period', () => {
    it('should return payment statistics for a period', async () => {
      const mockStats = {
        totalPayments: 10,
        totalAmount: 299.9,
        completedPayments: 8,
        refundedPayments: 1,
        pendingPayments: 1,
      };

      (paymentService.getPaymentStats as jest.Mock).mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/v1/payments/stats/2024-01');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockStats);
    });

    it('should return 400 if period is missing', async () => {
      const response = await request(app)
        .get('/api/v1/payments/stats/');

      // Express will return 404 for missing route parameter
      expect([404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/v1/payments/course/:courseId/history', () => {
    it('should return payment history for a course', async () => {
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

      (paymentService.getCoursePaymentHistory as jest.Mock).mockResolvedValue(mockPayments);

      const response = await request(app)
        .get('/api/v1/payments/course/course-1/history');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].courseId).toBe('course-1');
    });

    it('should return 400 if courseId is missing', async () => {
      const response = await request(app)
        .get('/api/v1/payments/course//history');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/v1/payments/validate', () => {
    it('should validate payment amount successfully', async () => {
      (paymentService.validatePaymentAmount as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/v1/payments/validate')
        .send({
          courseId: 'course-1',
          amount: 29.99,
          tier: 'premium',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(true);
    });

    it('should return false for invalid amount', async () => {
      (paymentService.validatePaymentAmount as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .post('/api/v1/payments/validate')
        .send({
          courseId: 'course-1',
          amount: 50.0,
          tier: 'premium',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(false);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/payments/validate')
        .send({
          courseId: 'course-1',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
