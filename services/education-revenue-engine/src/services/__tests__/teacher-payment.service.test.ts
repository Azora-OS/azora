import { teacherPaymentService } from '../teacher-payment.service';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    course: { findMany: jest.fn() },
    payment: { findMany: jest.fn() },
  })),
}));

describe('TeacherPaymentService', () => {
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient();
  });

  describe('calculateRevenue', () => {
    it('should calculate revenue with 70/30 split', async () => {
      mockPrisma.course.findMany.mockResolvedValue([{ id: 'course-1' }]);
      mockPrisma.payment.findMany.mockResolvedValue([
        { amount: 100, status: 'completed' },
        { amount: 200, status: 'completed' },
      ]);

      const revenue = await teacherPaymentService.calculateRevenue('instructor-1', '2024-01');

      expect(revenue.totalRevenue).toBe(300);
      expect(revenue.instructorCut).toBe(210); // 70%
      expect(revenue.azoraCut).toBe(90); // 30%
    });
  });

  describe('processWithdrawal', () => {
    it('should process withdrawal', async () => {
      const result = await teacherPaymentService.processWithdrawal('instructor-1', 100);

      expect(result.success).toBe(true);
      expect(result.amount).toBe(100);
    });
  });

  describe('getPaymentHistory', () => {
    it('should retrieve payment history', async () => {
      mockPrisma.course.findMany.mockResolvedValue([{ id: 'course-1' }]);
      mockPrisma.payment.findMany.mockResolvedValue([
        { id: 'payment-1', amount: 100 },
        { id: 'payment-2', amount: 200 },
      ]);

      const history = await teacherPaymentService.getPaymentHistory('instructor-1');

      expect(history).toHaveLength(2);
    });
  });
});
