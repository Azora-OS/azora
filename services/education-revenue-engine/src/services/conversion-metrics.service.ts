import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface ConversionMetricsResponse {
  period: string;
  freeUsers: number;
  premiumUsers: number;
  proUsers: number;
  conversionRate: number;
  churnRate: number;
  lifetimeValue: number;
  customerAcquisitionCost: number;
  paybackPeriod: number;
}

export class ConversionMetricsService {
  /**
   * Calculate conversion metrics for a given period
   * Requirements: 5.1, 5.2
   */
  async getConversionMetrics(period: string): Promise<ConversionMetricsResponse> {
    try {
      const [startDate, endDate] = this.parsePeriod(period);

      // Get user counts by tier
      const usersByTier = await prisma.user.groupBy({
        by: ['tier'],
        _count: {
          id: true,
        },
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const tierCounts = {
        free: 0,
        premium: 0,
        pro: 0,
      };

      usersByTier.forEach((group: any) => {
        tierCounts[group.tier as keyof typeof tierCounts] = group._count.id;
      });

      // Calculate conversion rate (free to premium)
      const conversionRate = this.calculateConversionRate(tierCounts);

      // Calculate churn rate
      const churnRate = await this.calculateChurnRate(startDate, endDate);

      // Calculate lifetime value
      const lifetimeValue = await this.calculateLifetimeValue();

      // Calculate customer acquisition cost
      const customerAcquisitionCost = await this.calculateCAC(startDate, endDate);

      // Calculate payback period
      const paybackPeriod = this.calculatePaybackPeriod(customerAcquisitionCost, lifetimeValue);

      return {
        period,
        freeUsers: tierCounts.free,
        premiumUsers: tierCounts.premium,
        proUsers: tierCounts.pro,
        conversionRate,
        churnRate,
        lifetimeValue,
        customerAcquisitionCost,
        paybackPeriod,
      };
    } catch (error) {
      logger.error('Error calculating conversion metrics', { error, period });
      throw error;
    }
  }

  /**
   * Calculate free to premium conversion rate
   * Requirements: 5.1, 5.2
   */
  private calculateConversionRate(tierCounts: Record<string, number>): number {
    const totalFreeAndPremium = tierCounts.free + tierCounts.premium;
    if (totalFreeAndPremium === 0) return 0;
    return (tierCounts.premium / totalFreeAndPremium) * 100;
  }

  /**
   * Calculate churn rate (users who downgraded or became inactive)
   * Requirements: 5.1, 5.2
   */
  private async calculateChurnRate(startDate: Date, endDate: Date): Promise<number> {
    try {
      // Get users who were premium at start of period
      const premiumAtStart = await prisma.user.count({
        where: {
          tier: 'premium',
          createdAt: {
            lt: startDate,
          },
        },
      });

      if (premiumAtStart === 0) return 0;

      // Get users who downgraded to free during period
      const downgraded = await prisma.user.count({
        where: {
          tier: 'free',
          updatedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      return (downgraded / premiumAtStart) * 100;
    } catch (error) {
      logger.error('Error calculating churn rate', { error });
      return 0;
    }
  }

  /**
   * Calculate average lifetime value per student
   * Requirements: 5.1, 5.2
   */
  private async calculateLifetimeValue(): Promise<number> {
    try {
      const result = await prisma.payment.aggregate({
        _avg: {
          amount: true,
        },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
      });

      if (!result._count.id || result._count.id === 0) return 0;

      // Calculate average revenue per user
      const totalRevenue = result._sum.amount || 0;
      const totalUsers = await prisma.user.count();

      if (totalUsers === 0) return 0;

      return Number(totalRevenue) / totalUsers;
    } catch (error) {
      logger.error('Error calculating lifetime value', { error });
      return 0;
    }
  }

  /**
   * Calculate customer acquisition cost
   * Requirements: 5.1, 5.2
   */
  private async calculateCAC(startDate: Date, endDate: Date): Promise<number> {
    try {
      // Estimate marketing spend (this would come from actual marketing data)
      // For now, we'll use a simplified calculation based on conversion events
      const newUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      if (newUsers === 0) return 0;

      // Assume average marketing spend per user acquisition
      // This should be replaced with actual marketing spend data
      const estimatedMarketingSpend = newUsers * 10; // $10 per user estimate

      return estimatedMarketingSpend / newUsers;
    } catch (error) {
      logger.error('Error calculating CAC', { error });
      return 0;
    }
  }

  /**
   * Calculate payback period in months
   * Requirements: 5.1, 5.2
   */
  private calculatePaybackPeriod(cac: number, ltv: number): number {
    if (ltv === 0) return 0;
    return cac / (ltv / 12); // Convert annual LTV to monthly
  }

  /**
   * Parse period string (e.g., "2024-01" or "2024-Q1")
   */
  private parsePeriod(period: string): [Date, Date] {
    const now = new Date();

    if (period.includes('-Q')) {
      // Quarter format: 2024-Q1
      const [year, quarter] = period.split('-Q');
      const q = parseInt(quarter);
      const startMonth = (q - 1) * 3;
      const startDate = new Date(parseInt(year), startMonth, 1);
      const endDate = new Date(parseInt(year), startMonth + 3, 0, 23, 59, 59);
      return [startDate, endDate];
    } else if (period.includes('-')) {
      // Month format: 2024-01
      const [year, month] = period.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      return [startDate, endDate];
    } else {
      // Year format: 2024
      const year = parseInt(period);
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      return [startDate, endDate];
    }
  }
}

export const conversionMetricsService = new ConversionMetricsService();
