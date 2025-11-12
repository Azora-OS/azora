/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

DESIGN DATA ACCESS LAYER
Provides real data access for Head of Design (Sonnet Claude) and UI components
*/

import { prisma } from '@azora/shared-database/prisma';
import { getCacheService } from '@azora/shared-database/redis';

/**
 * Design Data Service
 * Provides real data for UI components and design system
 */
export class DesignDataService {
  /**
   * Get user wallet balance (for UI display)
   */
  async getUserWalletBalance(userId: string): Promise<{
    balance: number;
    currency: string;
    change: number;
    changePercent: number;
  }> {
    try {
      const wallets = await prisma.wallet.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });

      const primaryWallet = wallets.find(w => w.currency === 'AZR') || wallets[0];
      if (!primaryWallet) {
        return {
          balance: 0,
          currency: 'AZR',
          change: 0,
          changePercent: 0,
        };
      }

      // Get recent transactions for change calculation
      const recentTransactions = await prisma.transaction.findMany({
        where: {
          walletId: primaryWallet.id,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const change = recentTransactions
        .filter(t => t.type === 'DEPOSIT' || t.type === 'MINING_REWARD')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const balance = Number(primaryWallet.balance);
      const changePercent = balance > 0 ? (change / balance) * 100 : 0;

      return {
        balance,
        currency: primaryWallet.currency,
        change,
        changePercent,
      };
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return {
        balance: 0,
        currency: 'AZR',
        change: 0,
        changePercent: 0,
      };
    }
  }

  /**
   * Get student progress (for UI display)
   */
  async getStudentProgress(userId: string): Promise<{
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    averageProgress: number;
    recentActivity: Array<{
      courseId: string;
      courseTitle: string;
      progress: number;
      lastActivity: Date;
    }>;
  }> {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      const completedCourses = enrollments.filter(e => e.completed).length;
      const inProgressCourses = enrollments.filter(e => !e.completed && e.progress > 0).length;
      const averageProgress =
        enrollments.length > 0
          ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length
          : 0;

      const recentActivity = enrollments.slice(0, 5).map(e => ({
        courseId: e.courseId,
        courseTitle: e.course.title,
        progress: e.progress,
        lastActivity: e.updatedAt,
      }));

      return {
        totalCourses: enrollments.length,
        completedCourses,
        inProgressCourses,
        averageProgress,
        recentActivity,
      };
    } catch (error) {
      console.error('Error getting student progress:', error);
      return {
        totalCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        averageProgress: 0,
        recentActivity: [],
      };
    }
  }

  /**
   * Get health check data (for UI display)
   */
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    services: Array<{
      name: string;
      status: 'healthy' | 'degraded' | 'down';
      latency?: number;
    }>;
    timestamp: Date;
  }> {
    try {
      // Check database health
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const dbLatency = Date.now() - dbStart;

      // Check Redis health
      const cache = await getCacheService();
      const redisStart = Date.now();
      await cache.exists('health-check');
      const redisLatency = Date.now() - redisStart;

      const services = [
        {
          name: 'database',
          status: dbLatency < 100 ? 'healthy' : dbLatency < 500 ? 'degraded' : 'down',
          latency: dbLatency,
        },
        {
          name: 'redis',
          status: redisLatency < 50 ? 'healthy' : redisLatency < 200 ? 'degraded' : 'down',
          latency: redisLatency,
        },
      ];

      const overallStatus =
        services.every(s => s.status === 'healthy')
          ? 'healthy'
          : services.some(s => s.status === 'down')
          ? 'down'
          : 'degraded';

      return {
        status: overallStatus,
        services,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error getting system health:', error);
      return {
        status: 'down',
        services: [],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get user dashboard data (comprehensive)
   */
  async getUserDashboardData(userId: string): Promise<{
    wallet: Awaited<ReturnType<typeof this.getUserWalletBalance>>;
    progress: Awaited<ReturnType<typeof this.getStudentProgress>>;
    health: Awaited<ReturnType<typeof this.getSystemHealth>>;
    recentActivity: Array<{
      type: 'enrollment' | 'transaction' | 'course_completion';
      title: string;
      timestamp: Date;
    }>;
  }> {
    const [wallet, progress, health] = await Promise.all([
      this.getUserWalletBalance(userId),
      this.getStudentProgress(userId),
      this.getSystemHealth(),
    ]);

    // Get recent activity
    const [recentEnrollments, recentTransactions] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId },
        include: { course: true },
        orderBy: { enrolledAt: 'desc' },
        take: 5,
      }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const recentActivity = [
      ...recentEnrollments.map(e => ({
        type: 'enrollment' as const,
        title: `Enrolled in ${e.course.title}`,
        timestamp: e.enrolledAt,
      })),
      ...recentTransactions.map(t => ({
        type: 'transaction' as const,
        title: `${t.type} ${t.amount} ${t.currency}`,
        timestamp: t.createdAt,
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      wallet,
      progress,
      health,
      recentActivity,
    };
  }

  /**
   * Get cached dashboard data
   */
  async getCachedDashboardData(userId: string, ttlSeconds: number = 60): Promise<any> {
    const cache = await getCacheService();
    const cacheKey = `design:dashboard:${userId}`;

    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.getUserDashboardData(userId);
    await cache.set(cacheKey, data, ttlSeconds);

    return data;
  }

  /**
   * Invalidate cached dashboard data
   */
  async invalidateDashboardCache(userId: string): Promise<void> {
    const cache = await getCacheService();
    await cache.delete(`design:dashboard:${userId}`);
  }
}

// Export singleton instance
export const designDataService = new DesignDataService();

export default designDataService;
