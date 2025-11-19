import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class TeacherAnalyticsService {
  async getCourseAnalytics(courseId: string) {
    try {
      const enrollments = await prisma.enrollment.findMany({ where: { courseId } });
      const completedCount = enrollments.filter(e => e.status === 'completed').length;
      const completionRate = enrollments.length > 0 ? (completedCount / enrollments.length) * 100 : 0;

      const outcomes = await prisma.learningOutcome.findMany({
        where: { courseId },
      });

      const avgScore = outcomes.length > 0 
        ? outcomes.reduce((sum, o) => sum + o.assessmentScore, 0) / outcomes.length 
        : 0;

      logger.info('Course analytics retrieved', { courseId });
      return { courseId, enrollmentCount: enrollments.length, completionRate, averageScore: avgScore };
    } catch (error) {
      logger.error('Error getting course analytics', { error, courseId });
      throw error;
    }
  }

  async getStudentAnalytics(courseId: string) {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId },
        include: { student: true, outcomes: true },
      });

      const studentData = enrollments.map(e => ({
        studentId: e.studentId,
        studentName: e.student.firstName + ' ' + e.student.lastName,
        progress: e.progress,
        status: e.status,
        averageScore: e.outcomes.length > 0 
          ? e.outcomes.reduce((sum, o) => sum + o.assessmentScore, 0) / e.outcomes.length 
          : 0,
      }));

      logger.info('Student analytics retrieved', { courseId });
      return studentData;
    } catch (error) {
      logger.error('Error getting student analytics', { error, courseId });
      throw error;
    }
  }

  async getRevenueReport(instructorId: string) {
    try {
      const courses = await prisma.course.findMany({ where: { instructorId } });
      const courseIds = courses.map(c => c.id);

      const payments = await prisma.payment.findMany({
        where: { courseId: { in: courseIds } },
      });

      const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const instructorShare = totalRevenue * 0.7; // 70% to instructor

      logger.info('Revenue report generated', { instructorId });
      return { totalRevenue, instructorShare, paymentCount: payments.length };
    } catch (error) {
      logger.error('Error generating revenue report', { error, instructorId });
      throw error;
    }
  }
}

export const teacherAnalyticsService = new TeacherAnalyticsService();
