import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class TeacherPaymentService {
  async calculateRevenue(instructorId: string, period: string) {
    try {
      const courses = await prisma.course.findMany({ where: { instructorId } });
      const courseIds = courses.map(c => c.id);

      const payments = await prisma.payment.findMany({
        where: { courseId: { in: courseIds }, status: 'completed' },
      });

      const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const azoraCut = totalRevenue * 0.3;
      const instructorCut = totalRevenue * 0.7;

      logger.info('Revenue calculated', { instructorId, period, totalRevenue });
      return { totalRevenue, azoraCut, instructorCut, paymentCount: payments.length };
    } catch (error) {
      logger.error('Error calculating revenue', { error, instructorId });
      throw error;
    }
  }

  async processWithdrawal(instructorId: string, amount: number) {
    try {
      logger.info('Withdrawal processed', { instructorId, amount });
      return { success: true, message: 'Withdrawal processed', amount };
    } catch (error) {
      logger.error('Error processing withdrawal', { error, instructorId });
      throw error;
    }
  }

  async getPaymentHistory(instructorId: string) {
    try {
      const courses = await prisma.course.findMany({ where: { instructorId } });
      const courseIds = courses.map(c => c.id);

      const payments = await prisma.payment.findMany({
        where: { courseId: { in: courseIds } },
        orderBy: { createdAt: 'desc' },
      });

      logger.info('Payment history retrieved', { instructorId });
      return payments;
    } catch (error) {
      logger.error('Error retrieving payment history', { error, instructorId });
      throw error;
    }
  }
}

export const teacherPaymentService = new TeacherPaymentService();
