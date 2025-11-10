/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

AI DATA ACCESS LAYER
Provides real data access for Claude/AI services with proper authentication and context
*/

import { prisma } from '@azora/shared-database/prisma';
import { getCacheService } from '@azora/shared-database/redis';
import { authenticateSession, AuthRequest } from '@azora/shared-auth/middleware';

/**
 * User context for AI services
 */
export interface UserContext {
  userId: string;
  email: string;
  role: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    preferences?: any;
  };
}

/**
 * AI Data Access Service
 * Provides real data access for AI services
 */
export class AIDataAccessService {
  /**
   * Get user context for AI processing
   */
  async getUserContext(userId: string): Promise<UserContext | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
        },
      });

      if (!user) {
        return null;
      }

      return {
        userId: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile ? {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          preferences: {},
        } : undefined,
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return null;
    }
  }

  /**
   * Get user's learning data for AI recommendations
   */
  async getUserLearningData(userId: string): Promise<any> {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              lessons: true,
            },
          },
        },
      });

      const completedCourses = enrollments.filter(e => e.completed).length;
      const inProgressCourses = enrollments.filter(e => !e.completed && e.progress > 0).length;
      const totalProgress = enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length || 0;

      return {
        enrollments,
        completedCourses,
        inProgressCourses,
        totalProgress,
        courses: enrollments.map(e => ({
          id: e.course.id,
          title: e.course.title,
          progress: e.progress,
          completed: e.completed,
        })),
      };
    } catch (error) {
      console.error('Error getting user learning data:', error);
      return null;
    }
  }

  /**
   * Get user's transaction/wallet data for AI insights
   */
  async getUserFinancialData(userId: string): Promise<any> {
    try {
      const wallets = await prisma.wallet.findMany({
        where: { userId },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 50,
          },
        },
      });

      const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
      const recentTransactions = wallets.flatMap(w => w.transactions).slice(0, 20);

      return {
        wallets,
        totalBalance,
        recentTransactions,
        transactionCount: recentTransactions.length,
      };
    } catch (error) {
      console.error('Error getting user financial data:', error);
      return null;
    }
  }

  /**
   * Get user's job/marketplace activity
   */
  async getUserMarketplaceData(userId: string): Promise<any> {
    try {
      const jobs = await prisma.job.findMany({
        where: { userId },
        include: {
          applications: true,
        },
      });

      const applications = await prisma.application.findMany({
        where: { userId },
        include: {
          job: true,
        },
      });

      return {
        postedJobs: jobs.length,
        activeJobs: jobs.filter(j => j.status === 'OPEN').length,
        applications: applications.length,
        acceptedApplications: applications.filter(a => a.status === 'ACCEPTED').length,
        jobs,
        applications,
      };
    } catch (error) {
      console.error('Error getting user marketplace data:', error);
      return null;
    }
  }

  /**
   * Get comprehensive user context for AI
   */
  async getFullUserContext(userId: string): Promise<any> {
    const [userContext, learningData, financialData, marketplaceData] = await Promise.all([
      this.getUserContext(userId),
      this.getUserLearningData(userId),
      this.getUserFinancialData(userId),
      this.getUserMarketplaceData(userId),
    ]);

    return {
      user: userContext,
      learning: learningData,
      financial: financialData,
      marketplace: marketplaceData,
      timestamp: new Date(),
    };
  }

  /**
   * Get inventory data for Retail AI
   */
  async getInventoryData(businessId?: string): Promise<any[]> {
    try {
      // This would query actual inventory data
      // For now, we'll use a placeholder that can be extended
      // In production, this would query a products/inventory table
      
      // Example: If you have a Product model
      // const products = await prisma.product.findMany({
      //   where: businessId ? { businessId } : {},
      //   include: { inventory: true },
      // });
      
      // For now, return empty array - services should implement their own data models
      return [];
    } catch (error) {
      console.error('Error getting inventory data:', error);
      return [];
    }
  }

  /**
   * Get course data for LMS AI
   */
  async getCourseData(filters?: any): Promise<any[]> {
    try {
      const courses = await prisma.course.findMany({
        where: filters || {},
        include: {
          lessons: true,
          enrollments: true,
        },
      });

      return courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        published: course.published,
        lessonCount: course.lessons.length,
        enrollmentCount: course.enrollments.length,
      }));
    } catch (error) {
      console.error('Error getting course data:', error);
      return [];
    }
  }

  /**
   * Get student data for Institutional AI
   */
  async getStudentData(filters?: any): Promise<any[]> {
    try {
      const users = await prisma.user.findMany({
        where: {
          role: 'STUDENT',
          ...filters,
        },
        include: {
          profile: true,
          enrollments: {
            include: {
              course: true,
            },
          },
        },
      });

      return users.map(user => ({
        id: user.id,
        email: user.email,
        profile: user.profile,
        enrollments: user.enrollments.map(e => ({
          courseId: e.courseId,
          courseTitle: e.course.title,
          progress: e.progress,
          completed: e.completed,
        })),
      }));
    } catch (error) {
      console.error('Error getting student data:', error);
      return [];
    }
  }

  /**
   * Cache AI context for performance
   */
  async getCachedUserContext(userId: string, ttlSeconds: number = 300): Promise<any | null> {
    const cache = await getCacheService();
    const cacheKey = `ai:context:${userId}`;
    
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const context = await this.getFullUserContext(userId);
    await cache.set(cacheKey, context, ttlSeconds);
    
    return context;
  }

  /**
   * Invalidate cached context
   */
  async invalidateUserContext(userId: string): Promise<void> {
    const cache = await getCacheService();
    await cache.delete(`ai:context:${userId}`);
  }
}

// Export singleton instance
export const aiDataAccess = new AIDataAccessService();

export default aiDataAccess;
