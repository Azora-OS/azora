/**
 * Enterprise Usage Tracking Service
 * Tracks usage metrics for enterprise licenses
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../shared/logging';
import { ErrorHandler } from '../payment/error-handler';

const prisma = new PrismaClient();

export interface UsageMetrics {
  activeUsers: number;
  coursesCreated: number;
  apiCallsUsed: number;
  storageUsed: number; // in GB
}

export interface UsageReport {
  licenseId: string;
  date: Date;
  metrics: UsageMetrics;
  percentageUsed: {
    users: number;
    courses: number;
    apiCalls: number;
  };
}

export class UsageTrackingService {
  /**
   * Track usage for a license
   */
  async trackUsage(licenseId: string, metrics: UsageMetrics): Promise<void> {
    try {
      logger.info('Tracking usage', { licenseId, ...metrics });

      const license = await prisma.enterpriseLicense.findUnique({
        where: { id: licenseId },
      });

      if (!license) {
        throw new Error(`License ${licenseId} not found`);
      }

      // Create usage record
      await prisma.enterpriseUsageTracking.create({
        data: {
          licenseId,
          activeUsers: metrics.activeUsers,
          coursesCreated: metrics.coursesCreated,
          apiCallsUsed: metrics.apiCallsUsed,
          storageUsed: metrics.storageUsed,
        },
      });

      // Check if usage exceeds limits
      if (metrics.activeUsers > license.maxUsers) {
        logger.warn('User limit exceeded', {
          licenseId,
          limit: license.maxUsers,
          current: metrics.activeUsers,
        });
      }

      if (license.maxCourses && metrics.coursesCreated > license.maxCourses) {
        logger.warn('Course limit exceeded', {
          licenseId,
          limit: license.maxCourses,
          current: metrics.coursesCreated,
        });
      }

      if (license.maxApiCalls && metrics.apiCallsUsed > license.maxApiCalls) {
        logger.warn('API call limit exceeded', {
          licenseId,
          limit: license.maxApiCalls,
          current: metrics.apiCallsUsed,
        });
      }
    } catch (error) {
      logger.error('Failed to track usage', { error, licenseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get current usage for license
   */
  async getCurrentUsage(licenseId: string): Promise<UsageMetrics | null> {
    try {
      const latestUsage = await prisma.enterpriseUsageTracking.findFirst({
        where: { licenseId },
        orderBy: { date: 'desc' },
      });

      if (!latestUsage) {
        return null;
      }

      return {
        activeUsers: latestUsage.activeUsers,
        coursesCreated: latestUsage.coursesCreated,
        apiCallsUsed: latestUsage.apiCallsUsed,
        storageUsed: latestUsage.storageUsed,
      };
    } catch (error) {
      logger.error('Failed to get current usage', { error, licenseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get usage report for date range
   */
  async getUsageReport(
    licenseId: string,
    startDate: Date,
    endDate: Date
  ): Promise<UsageReport[]> {
    try {
      logger.info('Getting usage report', { licenseId, startDate, endDate });

      const license = await prisma.enterpriseLicense.findUnique({
        where: { id: licenseId },
      });

      if (!license) {
        throw new Error(`License ${licenseId} not found`);
      }

      const usageRecords = await prisma.enterpriseUsageTracking.findMany({
        where: {
          licenseId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: 'asc' },
      });

      return usageRecords.map((record) => ({
        licenseId: record.licenseId,
        date: record.date,
        metrics: {
          activeUsers: record.activeUsers,
          coursesCreated: record.coursesCreated,
          apiCallsUsed: record.apiCallsUsed,
          storageUsed: record.storageUsed,
        },
        percentageUsed: {
          users: (record.activeUsers / license.maxUsers) * 100,
          courses: license.maxCourses ? (record.coursesCreated / license.maxCourses) * 100 : 0,
          apiCalls: license.maxApiCalls ? (record.apiCallsUsed / license.maxApiCalls) * 100 : 0,
        },
      }));
    } catch (error) {
      logger.error('Failed to get usage report', { error, licenseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(licenseId: string): Promise<{
    averageActiveUsers: number;
    maxActiveUsers: number;
    totalCoursesCreated: number;
    totalApiCalls: number;
    totalStorageUsed: number;
    recordCount: number;
  }> {
    try {
      const stats = await prisma.enterpriseUsageTracking.aggregate({
        where: { licenseId },
        _avg: { activeUsers: true },
        _max: { activeUsers: true },
        _sum: {
          coursesCreated: true,
          apiCallsUsed: true,
          storageUsed: true,
        },
        _count: true,
      });

      return {
        averageActiveUsers: Math.round(stats._avg.activeUsers || 0),
        maxActiveUsers: stats._max.activeUsers || 0,
        totalCoursesCreated: stats._sum.coursesCreated || 0,
        totalApiCalls: stats._sum.apiCallsUsed || 0,
        totalStorageUsed: stats._sum.storageUsed || 0,
        recordCount: stats._count,
      };
    } catch (error) {
      logger.error('Failed to get usage stats', { error, licenseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Check if license has exceeded limits
   */
  async checkLimits(licenseId: string): Promise<{
    usersExceeded: boolean;
    coursesExceeded: boolean;
    apiCallsExceeded: boolean;
  }> {
    try {
      const license = await prisma.enterpriseLicense.findUnique({
        where: { id: licenseId },
      });

      if (!license) {
        throw new Error(`License ${licenseId} not found`);
      }

      const currentUsage = await this.getCurrentUsage(licenseId);

      if (!currentUsage) {
        return {
          usersExceeded: false,
          coursesExceeded: false,
          apiCallsExceeded: false,
        };
      }

      return {
        usersExceeded: currentUsage.activeUsers > license.maxUsers,
        coursesExceeded: license.maxCourses ? currentUsage.coursesCreated > license.maxCourses : false,
        apiCallsExceeded: license.maxApiCalls ? currentUsage.apiCallsUsed > license.maxApiCalls : false,
      };
    } catch (error) {
      logger.error('Failed to check limits', { error, licenseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get usage alerts
   */
  async getUsageAlerts(licenseId: string, thresholdPercent: number = 80): Promise<string[]> {
    try {
      const license = await prisma.enterpriseLicense.findUnique({
        where: { id: licenseId },
      });

      if (!license) {
        throw new Error(`License ${licenseId} not found`);
      }

      const currentUsage = await this.getCurrentUsage(licenseId);
      const alerts: string[] = [];

      if (!currentUsage) {
        return alerts;
      }

      const userPercent = (currentUsage.activeUsers / license.maxUsers) * 100;
      if (userPercent >= thresholdPercent) {
        alerts.push(
          `User limit approaching: ${currentUsage.activeUsers}/${license.maxUsers} (${Math.round(userPercent)}%)`
        );
      }

      if (license.maxCourses) {
        const coursePercent = (currentUsage.coursesCreated / license.maxCourses) * 100;
        if (coursePercent >= thresholdPercent) {
          alerts.push(
            `Course limit approaching: ${currentUsage.coursesCreated}/${license.maxCourses} (${Math.round(coursePercent)}%)`
          );
        }
      }

      if (license.maxApiCalls) {
        const apiPercent = (currentUsage.apiCallsUsed / license.maxApiCalls) * 100;
        if (apiPercent >= thresholdPercent) {
          alerts.push(
            `API call limit approaching: ${currentUsage.apiCallsUsed}/${license.maxApiCalls} (${Math.round(apiPercent)}%)`
          );
        }
      }

      return alerts;
    } catch (error) {
      logger.error('Failed to get usage alerts', { error, licenseId });
      throw ErrorHandler.handle(error);
    }
  }
}

export default new UsageTrackingService();
