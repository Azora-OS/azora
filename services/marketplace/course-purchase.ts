/**
 * Course Purchase Service
 * Handles course purchases, enrollment, and revenue split
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../shared/logging';
import { ErrorHandler } from '../payment/error-handler';
import { SubscriptionService } from '../subscription/subscription-service';

const prisma = new PrismaClient();

export interface PurchaseInput {
  userId: string;
  courseId: string;
  paymentId: string;
}

export interface PurchaseResponse {
  id: string;
  courseId: string;
  userId: string;
  price: number;
  currency: string;
  purchasedAt: Date;
}

export interface RevenueSplit {
  instructorEarnings: number;
  platformEarnings: number;
  instructorPercentage: number;
  platformPercentage: number;
}

export class CoursePurchaseService {
  private readonly DEFAULT_REVENUE_SPLIT = 0.7; // 70% to instructor, 30% to platform

  /**
   * Calculate revenue split based on subscription tier
   */
  private async getRevenueSplit(instructorId: string): Promise<RevenueSplit> {
    try {
      const subscriptionService = new SubscriptionService();
      const subscription = await subscriptionService.getSubscription(instructorId);

      let instructorPercentage = this.DEFAULT_REVENUE_SPLIT;

      // Enterprise tier gets 75% instead of 70%
      if (subscription?.tier === 'ENTERPRISE') {
        instructorPercentage = 0.75;
      }

      return {
        instructorPercentage,
        platformPercentage: 1 - instructorPercentage,
        instructorEarnings: 0, // Will be calculated with amount
        platformEarnings: 0, // Will be calculated with amount
      };
    } catch (error) {
      logger.warn('Failed to get subscription tier, using default split', { error, instructorId });
      return {
        instructorPercentage: this.DEFAULT_REVENUE_SPLIT,
        platformPercentage: 1 - this.DEFAULT_REVENUE_SPLIT,
        instructorEarnings: 0,
        platformEarnings: 0,
      };
    }
  }

  /**
   * Purchase a course
   */
  async purchaseCourse(input: PurchaseInput): Promise<PurchaseResponse> {
    try {
      logger.info('Processing course purchase', {
        userId: input.userId,
        courseId: input.courseId,
      });

      // Get course
      const course = await prisma.course.findUnique({
        where: { id: input.courseId },
      });

      if (!course) {
        throw new Error(`Course ${input.courseId} not found`);
      }

      if (course.status !== 'PUBLISHED') {
        throw new Error(`Course is not published (status: ${course.status})`);
      }

      // Check if user already purchased
      const existingPurchase = await prisma.coursePurchase.findUnique({
        where: {
          courseId_userId: {
            courseId: input.courseId,
            userId: input.userId,
          },
        },
      });

      if (existingPurchase) {
        throw new Error('User has already purchased this course');
      }

      // Create purchase record
      const purchase = await prisma.coursePurchase.create({
        data: {
          courseId: input.courseId,
          userId: input.userId,
          paymentId: input.paymentId,
          price: course.price,
          currency: course.currency,
        },
      });

      // Create enrollment
      await prisma.enrollment.create({
        data: {
          userId: input.userId,
          courseId: input.courseId,
          status: 'ACTIVE',
        },
      });

      // Update course enrollment count
      await prisma.course.update({
        where: { id: input.courseId },
        data: {
          enrollmentCount: { increment: 1 },
        },
      });

      // Calculate and record earnings
      const revenueSplit = await this.getRevenueSplit(course.instructorId);
      const instructorEarnings = course.price * revenueSplit.instructorPercentage;

      await prisma.instructorEarnings.update({
        where: {
          courseId_instructorId: {
            courseId: input.courseId,
            instructorId: course.instructorId,
          },
        },
        data: {
          totalEarnings: { increment: instructorEarnings },
          pendingEarnings: { increment: instructorEarnings },
        },
      });

      logger.info('Course purchase completed', {
        purchaseId: purchase.id,
        instructorEarnings,
      });

      return {
        id: purchase.id,
        courseId: purchase.courseId,
        userId: purchase.userId,
        price: purchase.price,
        currency: purchase.currency,
        purchasedAt: purchase.purchasedAt,
      };
    } catch (error) {
      logger.error('Failed to purchase course', { error, ...input });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get user's purchased courses
   */
  async getUserPurchases(userId: string): Promise<any[]> {
    try {
      const purchases = await prisma.coursePurchase.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              instructor: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { purchasedAt: 'desc' },
      });

      return purchases;
    } catch (error) {
      logger.error('Failed to get user purchases', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Check if user has purchased a course
   */
  async hasPurchased(userId: string, courseId: string): Promise<boolean> {
    try {
      const purchase = await prisma.coursePurchase.findUnique({
        where: {
          courseId_userId: {
            courseId,
            userId,
          },
        },
      });

      return !!purchase;
    } catch (error) {
      logger.error('Failed to check purchase', { error, userId, courseId });
      return false;
    }
  }

  /**
   * Get purchase details
   */
  async getPurchase(purchaseId: string): Promise<any | null> {
    try {
      const purchase = await prisma.coursePurchase.findUnique({
        where: { id: purchaseId },
        include: {
          course: {
            include: {
              instructor: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return purchase;
    } catch (error) {
      logger.error('Failed to get purchase', { error, purchaseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get course purchase statistics
   */
  async getCoursePurchaseStats(courseId: string): Promise<{
    totalPurchases: number;
    totalRevenue: number;
    averagePrice: number;
  }> {
    try {
      const stats = await prisma.coursePurchase.aggregate({
        where: { courseId },
        _count: true,
        _sum: { price: true },
        _avg: { price: true },
      });

      return {
        totalPurchases: stats._count,
        totalRevenue: stats._sum.price || 0,
        averagePrice: stats._avg.price || 0,
      };
    } catch (error) {
      logger.error('Failed to get purchase stats', { error, courseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Refund a purchase
   */
  async refundPurchase(purchaseId: string, reason: string): Promise<void> {
    try {
      logger.info('Refunding purchase', { purchaseId, reason });

      const purchase = await prisma.coursePurchase.findUnique({
        where: { id: purchaseId },
      });

      if (!purchase) {
        throw new Error(`Purchase ${purchaseId} not found`);
      }

      // Remove enrollment
      await prisma.enrollment.deleteMany({
        where: {
          userId: purchase.userId,
          courseId: purchase.courseId,
        },
      });

      // Update course enrollment count
      await prisma.course.update({
        where: { id: purchase.courseId },
        data: {
          enrollmentCount: { decrement: 1 },
        },
      });

      // Reverse earnings
      const course = await prisma.course.findUnique({
        where: { id: purchase.courseId },
      });

      if (course) {
        const revenueSplit = await this.getRevenueSplit(course.instructorId);
        const instructorEarnings = purchase.price * revenueSplit.instructorPercentage;

        await prisma.instructorEarnings.update({
          where: {
            courseId_instructorId: {
              courseId: purchase.courseId,
              instructorId: course.instructorId,
            },
          },
          data: {
            totalEarnings: { decrement: instructorEarnings },
            pendingEarnings: { decrement: instructorEarnings },
          },
        });
      }

      // Delete purchase
      await prisma.coursePurchase.delete({
        where: { id: purchaseId },
      });

      logger.info('Purchase refunded successfully', { purchaseId });
    } catch (error) {
      logger.error('Failed to refund purchase', { error, purchaseId });
      throw ErrorHandler.handle(error);
    }
  }
}

export default new CoursePurchaseService();
