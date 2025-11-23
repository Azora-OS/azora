import { generateUUID } from '../utils/uuid.js';
import { revenueService } from './revenue.service.js';
import { paymentService } from './payment.service.js';
import { fundService } from './fund.service.js';
import { businessService } from './business.service.js';

/**
 * Reporting Service
 * Generates financial reports, exports, and analytics
 * Requirements: 6.3, 6.4
 */

interface FinancialReport {
  id: string;
  businessId: string;
  period: { startDate: Date; endDate: Date };
  totalRevenue: number;
  businessOwnerShare: number;
  citadelFundShare: number;
  totalPayments: number;
  paymentStats: {
    completed: number;
    pending: number;
    failed: number;
  };
  generatedAt: Date;
}

export class ReportingService {
  /**
   * Generate financial report for a business
   * Requirements: 6.3, 6.4
   */
  async generateFinancialReport(
    businessId: string,
    startDate: Date,
    endDate: Date
  ): Promise<FinancialReport> {
    const reportId = generateUUID();
    const now = new Date();

    // Get revenue data
    const revenueBreakdown = await revenueService.getBreakdown(businessId, startDate, endDate);

    // Get payment data
    const paymentHistory = await paymentService.getPaymentHistory(businessId);

    // Count payments by status
    const paymentStats = {
      completed: paymentHistory.payments.filter((p) => p.status === 'completed').length,
      pending: paymentHistory.payments.filter((p) => p.status === 'pending').length,
      failed: paymentHistory.payments.filter((p) => p.status === 'failed').length,
    };

    const report: FinancialReport = {
      id: reportId,
      businessId,
      period: { startDate, endDate },
      totalRevenue: revenueBreakdown.totalRevenue,
      businessOwnerShare: revenueBreakdown.businessOwnerShare,
      citadelFundShare: revenueBreakdown.citadelFundShare,
      totalPayments: paymentHistory.totalCount,
      paymentStats,
      generatedAt: now,
    };

    return report;
  }

  /**
   * Export report as CSV
   * Requirements: 6.3, 6.4
   */
  async exportReportAsCSV(report: FinancialReport): Promise<string> {
    const headers = [
      'Report ID',
      'Business ID',
      'Period Start',
      'Period End',
      'Total Revenue',
      'Business Owner Share',
      'Citadel Fund Share',
      'Total Payments',
      'Completed Payments',
      'Pending Payments',
      'Failed Payments',
      'Generated At',
    ];

    const row = [
      report.id,
      report.businessId,
      report.period.startDate.toISOString(),
      report.period.endDate.toISOString(),
      report.totalRevenue.toFixed(2),
      report.businessOwnerShare.toFixed(2),
      report.citadelFundShare.toFixed(2),
      report.totalPayments,
      report.paymentStats.completed,
      report.paymentStats.pending,
      report.paymentStats.failed,
      report.generatedAt.toISOString(),
    ];

    const csv = [headers, row].map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n');

    return csv;
  }

  /**
   * Export report as JSON
   * Requirements: 6.3, 6.4
   */
  async exportReportAsJSON(report: FinancialReport): Promise<string> {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Generate fund report
   * Requirements: 6.3, 6.4
   */
  async generateFundReport(startDate: Date, endDate: Date): Promise<{
    period: { startDate: Date; endDate: Date };
    fundStatus: {
      balance: number;
      totalContributions: number;
      totalDistributions: number;
    };
    distributionStats: {
      totalDistributions: number;
      byType: Record<string, { count: number; amount: number }>;
      byStatus: Record<string, number>;
    };
    impactMetrics: {
      scholarshipsAwarded: number;
      projectsFunded: number;
      communityBeneficiaries: number;
      totalImpactAmount: number;
    };
    generatedAt: Date;
  }> {
    const fundStatus = await fundService.getFundStatus();
    const distributionStats = await fundService.getDistributionStats();
    const impactMetrics = await fundService.getImpactMetrics();

    return {
      period: { startDate, endDate },
      fundStatus: {
        balance: fundStatus.balance,
        totalContributions: fundStatus.totalContributions,
        totalDistributions: fundStatus.totalDistributions,
      },
      distributionStats,
      impactMetrics,
      generatedAt: new Date(),
    };
  }

  /**
   * Generate business summary report
   * Requirements: 6.3, 6.4
   */
  async generateBusinessSummaryReport(businessId: string): Promise<{
    businessId: string;
    businessInfo: {
      name: string;
      type: string;
      status: string;
      createdAt: Date;
    };
    metrics: {
      wizardProgress: number;
      totalRevenue: number;
      totalPayments: number;
      citadelFundContribution: number;
    };
    generatedAt: Date;
  }> {
    const business = await businessService.getBusinessById(businessId, '');
    const wizardProgress = await businessService.getWizardProgress(businessId, '');
    const revenueStats = await revenueService.getStatistics(businessId);
    const paymentHistory = await paymentService.getPaymentHistory(businessId);

    return {
      businessId,
      businessInfo: {
        name: business.businessName,
        type: business.businessType,
        status: business.status,
        createdAt: business.createdAt,
      },
      metrics: {
        wizardProgress: wizardProgress.progress,
        totalRevenue: revenueStats.totalRevenue,
        totalPayments: paymentHistory.totalCount,
        citadelFundContribution: revenueStats.citadelFundTotal,
      },
      generatedAt: new Date(),
    };
  }

  /**
   * Generate compliance report
   * Requirements: 6.3, 6.4
   */
  async generateComplianceReport(startDate: Date, endDate: Date): Promise<{
    period: { startDate: Date; endDate: Date };
    totalTransactions: number;
    totalAmount: number;
    complianceScore: number;
    flaggedTransactions: number;
    auditTrail: {
      totalActions: number;
      actionsByType: Record<string, number>;
    };
    generatedAt: Date;
  }> {
    const paymentStats = await paymentService.getPaymentStats(startDate, endDate);

    // Calculate compliance score
    const complianceScore = Math.max(0, 100 - paymentStats.failureRate * 2);

    return {
      period: { startDate, endDate },
      totalTransactions: paymentStats.totalPayments,
      totalAmount: paymentStats.totalAmount,
      complianceScore,
      flaggedTransactions: Math.round(paymentStats.totalPayments * (paymentStats.failureRate / 100)),
      auditTrail: {
        totalActions: paymentStats.totalPayments,
        actionsByType: {
          completed: Math.round(paymentStats.totalPayments * (paymentStats.successRate / 100)),
          failed: Math.round(paymentStats.totalPayments * (paymentStats.failureRate / 100)),
          pending: paymentStats.pendingCount,
        },
      },
      generatedAt: new Date(),
    };
  }

  /**
   * Generate revenue trend report
   * Requirements: 6.3, 6.4
   */
  async generateRevenueTrendReport(businessId: string, days: number = 30): Promise<{
    businessId: string;
    period: number;
    trend: Array<{
      date: string;
      revenue: number;
      businessOwnerShare: number;
      citadelFundShare: number;
    }>;
    summary: {
      totalRevenue: number;
      averageDailyRevenue: number;
      highestDay: { date: string; revenue: number };
      lowestDay: { date: string; revenue: number };
    };
    generatedAt: Date;
  }> {
    const trend = await revenueService.getRevenueTrend(businessId, days);

    const totalRevenue = trend.reduce((sum, t) => sum + t.revenue, 0);
    const averageDailyRevenue = trend.length > 0 ? totalRevenue / trend.length : 0;

    const highestDay = trend.reduce((max, t) => (t.revenue > max.revenue ? t : max), trend[0] || {
      date: '',
      revenue: 0,
    });
    const lowestDay = trend.reduce((min, t) => (t.revenue < min.revenue ? t : min), trend[0] || {
      date: '',
      revenue: 0,
    });

    return {
      businessId,
      period: days,
      trend,
      summary: {
        totalRevenue,
        averageDailyRevenue,
        highestDay: { date: highestDay.date, revenue: highestDay.revenue },
        lowestDay: { date: lowestDay.date, revenue: lowestDay.revenue },
      },
      generatedAt: new Date(),
    };
  }

  /**
   * Schedule report delivery
   * Requirements: 6.3, 6.4
   */
  async scheduleReportDelivery(
    businessId: string,
    reportType: string,
    frequency: 'daily' | 'weekly' | 'monthly',
    email: string
  ): Promise<{
    scheduled: boolean;
    reportType: string;
    frequency: string;
    nextDelivery: Date;
  }> {
    // Mock implementation - in production, integrate with email service and job queue
    const nextDelivery = this.calculateNextDelivery(frequency);

    console.log(
      `[Reporting] Scheduled ${reportType} report for ${businessId} to ${email} (${frequency})`
    );

    return {
      scheduled: true,
      reportType,
      frequency,
      nextDelivery,
    };
  }

  /**
   * Calculate next delivery date
   * Requirements: 6.3, 6.4
   */
  private calculateNextDelivery(frequency: 'daily' | 'weekly' | 'monthly'): Date {
    const now = new Date();

    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return now;
    }
  }

  /**
   * Get report statistics
   * Requirements: 6.3, 6.4
   */
  async getReportStatistics(): Promise<{
    totalReportsGenerated: number;
    reportsByType: Record<string, number>;
    averageGenerationTime: number;
  }> {
    // Mock implementation - in production, track actual report generation
    return {
      totalReportsGenerated: 0,
      reportsByType: {
        financial: 0,
        fund: 0,
        business_summary: 0,
        compliance: 0,
        revenue_trend: 0,
      },
      averageGenerationTime: 0,
    };
  }
}

export const reportingService = new ReportingService();
