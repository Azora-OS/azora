/**
 * Instructor Earnings Service
 * Tracks instructor earnings and manages payouts
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../shared/logging';
import { ErrorHandler } from '../payment/error-handler';

const prisma = new PrismaClient();

export interface EarningsResponse {
  courseId: string;
  courseName: string;
  totalEarnings: number;
  paidEarnings: number;
  pendingEarnings: number;
  lastPaidAt: Date | null;
}

export interface InstructorEarningsResponse {
  instructorId: string;
  totalEarnings: number;
  paidEarnings: number;
  pendingEarnings: number;
  courses: EarningsResponse[];
}

export class InstructorEarningsService {
  /**
   * Get earnings for a specific course
   */
  async getCourseEarnings(courseId: string): Promise<EarningsResponse | null> {
    try {
      const earnings = await prisma.instructorEarnings.findFirst({
        where: { courseId },
        include: {
          course: {
            select: {
              title: true,
            },
          },
        },
      });

      if (!earnings) {
        return null;
      }

      return {
        courseId: earnings.courseId,
        courseName: earnings.course.title,
        totalEarnings: earnings.totalEarnings,
        paidEarnings: earnings.paidEarnings,
        pendingEarnings: earnings.pendingEarnings,
        lastPaidAt: earnings.lastPaidAt,
      };
    } catch (error) {
      logger.error('Failed to get course earnings', { error, courseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get all earnings for an instructor
   */
  async getInstructorEarnings(instructorId: string): Promise<InstructorEarningsResponse> {
    try {
      logger.info('Getting instructor earnings', { instructorId });

      const earnings = await prisma.instructorEarnings.findMany({
        where: { instructorId },
        include: {
          course: {
            select: {
              title: true,
            },
          },
        },
      });

      const totalEarnings = earnings.reduce((sum, e) => sum + e.totalEarnings, 0);
      const paidEarnings = earnings.reduce((sum, e) => sum + e.paidEarnings, 0);
      const pendingEarnings = earnings.reduce((sum, e) => sum + e.pendingEarnings, 0);

      return {
        instructorId,
        totalEarnings,
        paidEarnings,
        pendingEarnings,
        courses: earnings.map((e) => ({
          courseId: e.courseId,
          courseName: e.course.title,
          totalEarnings: e.totalEarnings,
          paidEarnings: e.paidEarnings,
          pendingEarnings: e.pendingEarnings,
          lastPaidAt: e.lastPaidAt,
        })),
      };
    } catch (error) {
      logger.error('Failed to get instructor earnings', { error, instructorId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Mark earnings as paid
   */
  async markAsPaid(courseId: string, instructorId: string, amount: number): Promise<void> {
    try {
      logger.info('Marking earnings as paid', { courseId, instructorId, amount });

      const earnings = await prisma.instructorEarnings.findUnique({
        where: {
          courseId_instructorId: {
            courseId,
            instructorId,
          },
        },
      });

      if (!earnings) {
        throw new Error(`Earnings not found for course ${courseId}`);
      }

      if (earnings.pendingEarnings < amount) {
        throw new Error(
          `Cannot pay ${amount}, only ${earnings.pendingEarnings} pending`
        );
      }

      await prisma.instructorEarnings.update({
        where: {
          courseId_instructorId: {
            courseId,
            instructorId,
          },
        },
        data: {
          paidEarnings: { increment: amount },
          pendingEarnings: { decrement: amount },
          lastPaidAt: new Date(),
        },
      });

      logger.info('Earnings marked as paid', { courseId, instructorId, amount });
    } catch (error) {
      logger.error('Failed to mark earnings as paid', { error, courseId, instructorId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get pending payouts for all instructors
   */
  async getPendingPayouts(minAmount: number = 0): Promise<any[]> {
    try {
      logger.info('Getting pending payouts', { minAmount });

      const payouts = await prisma.instructorEarnings.findMany({
        where: {
          pendingEarnings: { gt: minAmount },
        },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          course: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { pendingEarnings: 'desc' },
      });

      return payouts;
    } catch (error) {
      logger.error('Failed to get pending payouts', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get earnings statistics
   */
  async getEarningsStats(): Promise<{
    totalEarnings: number;
    totalPaid: number;
    totalPending: number;
    instructorCount: number;
    courseCount: number;
    averageEarningsPerCourse: number;
  }> {
    try {
      const stats = await prisma.instructorEarnings.aggregate({
        _sum: {
          totalEarnings: true,
          paidEarnings: true,
          pendingEarnings: true,
        },
        _count: true,
      });

      const courseCount = await prisma.instructorEarnings.findMany({
        distinct: ['courseId'],
      });

      const instructorCount = await prisma.instructorEarnings.findMany({
        distinct: ['instructorId'],
      });

      const totalEarnings = stats._sum.totalEarnings || 0;
      const courseCountValue = courseCount.length;

      return {
        totalEarnings,
        totalPaid: stats._sum.paidEarnings || 0,
        totalPending: stats._sum.pendingEarnings || 0,
        instructorCount: instructorCount.length,
        courseCount: courseCountValue,
        averageEarningsPerCourse: courseCountValue > 0 ? totalEarnings / courseCountValue : 0,
      };
    } catch (error) {
      logger.error('Failed to get earnings stats', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get top earning instructors
   */
  async getTopInstructors(limit: number = 10): Promise<any[]> {
    try {
      logger.info('Getting top instructors', { limit });

      const instructors = await prisma.instructorEarnings.groupBy({
        by: ['instructorId'],
        _sum: {
          totalEarnings: true,
        },
        orderBy: {
          _sum: {
            totalEarnings: 'desc',
          },
        },
        take: limit,
      });

      const result = await Promise.all(
        instructors.map(async (instructor) => {
          const user = await prisma.user.findUnique({
            where: { id: instructor.instructorId },
            select: { id: true, name: true, email: true },
          });

          return {
            instructor: user,
            totalEarnings: instructor._sum.totalEarnings || 0,
          };
        })
      );

      return result;
    } catch (error) {
      logger.error('Failed to get top instructors', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get top earning courses
   */
  async getTopCourses(limit: number = 10): Promise<any[]> {
    try {
      logger.info('Getting top courses', { limit });

      const courses = await prisma.instructorEarnings.findMany({
        orderBy: { totalEarnings: 'desc' },
        take: limit,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              price: true,
              enrollmentCount: true,
            },
          },
          instructor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return courses;
    } catch (error) {
      logger.error('Failed to get top courses', { error });
      throw ErrorHandler.handle(error);
    }
  }
}

export default new InstructorEarningsService();
