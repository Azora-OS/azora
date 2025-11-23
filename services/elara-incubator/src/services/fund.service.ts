import { generateUUID } from '../utils/uuid.js';
import { CitadelFund, FundDistribution, FundDistributionRequest } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { auditService } from './audit.service.js';

// Mock database - replace with actual database calls
const fund: CitadelFund = {
  id: generateUUID(),
  balance: 0,
  totalContributions: 0,
  totalDistributions: 0,
  updatedAt: new Date(),
};

const distributions: Map<string, FundDistribution> = new Map();

// Audit trail for fund operations
const fundAuditTrail: Array<{
  timestamp: Date;
  action: string;
  details: string;
  userId?: string;
  ipAddress?: string;
}> = [];

export class FundService {
  /**
   * Get Citadel Fund status
   * Requirements: 2.1, 2.2, 2.3
   */
  async getFundStatus(): Promise<CitadelFund> {
    return { ...fund };
  }

  /**
   * Get fund balance
   * Requirements: 2.1, 2.2, 2.3
   */
  async getBalance(): Promise<number> {
    return fund.balance;
  }

  /**
   * Add contribution to fund
   * Requirements: 2.1, 2.2, 2.3
   */
  async addContribution(amount: number, source: string, userId?: string, ipAddress?: string): Promise<CitadelFund> {
    if (amount <= 0) {
      throw new AppError(400, 'Contribution amount must be positive');
    }

    fund.balance += amount;
    fund.totalContributions += amount;
    fund.updatedAt = new Date();

    // Log to audit trail
    fundAuditTrail.push({
      timestamp: new Date(),
      action: 'contribution_added',
      details: `Added contribution of ${amount} from ${source}`,
      userId,
      ipAddress,
    });

    // Also log to global audit service
    await auditService.logFundAction(
      'contribution_added',
      `Added contribution of ${amount} from ${source}`,
      userId,
      ipAddress
    );

    console.log(`[Fund] Added contribution of ${amount} from ${source}`);

    return { ...fund };
  }

  /**
   * Create fund distribution
   * Requirements: 2.1, 2.2, 2.3
   */
  async createDistribution(data: FundDistributionRequest): Promise<FundDistribution> {
    if (data.amount <= 0) {
      throw new AppError(400, 'Distribution amount must be positive');
    }

    if (data.amount > fund.balance) {
      throw new AppError(400, 'Insufficient fund balance for distribution');
    }

    const distributionId = generateUUID();
    const now = new Date();

    const distribution: FundDistribution = {
      id: distributionId,
      fundId: fund.id,
      amount: data.amount,
      type: data.type,
      description: data.description,
      distributedAt: now,
      status: 'pending',
    };

    distributions.set(distributionId, distribution);

    // Log to audit trail
    fundAuditTrail.push({
      timestamp: now,
      action: 'distribution_created',
      details: `Created ${data.type} distribution for ${data.amount}: ${data.description}`,
    });

    return distribution;
  }

  /**
   * Get distribution by ID
   * Requirements: 2.1, 2.2, 2.3
   */
  async getDistributionById(distributionId: string): Promise<FundDistribution> {
    const distribution = distributions.get(distributionId);

    if (!distribution) {
      throw new AppError(404, 'Fund distribution not found');
    }

    return distribution;
  }

  /**
   * Get all distributions
   * Requirements: 2.1, 2.2, 2.3
   */
  async getDistributions(
    page: number = 1,
    pageSize: number = 10,
    type?: string
  ): Promise<{
    distributions: FundDistribution[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    let allDistributions = Array.from(distributions.values());

    if (type) {
      allDistributions = allDistributions.filter((d) => d.type === type);
    }

    // Sort by date (newest first)
    allDistributions.sort((a, b) => b.distributedAt.getTime() - a.distributedAt.getTime());

    const total = allDistributions.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      distributions: allDistributions.slice(start, end),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Update distribution status
   * Requirements: 2.1, 2.2, 2.3
   */
  async updateDistributionStatus(
    distributionId: string,
    status: 'pending' | 'completed' | 'failed'
  ): Promise<FundDistribution> {
    const distribution = await this.getDistributionById(distributionId);

    if (status === 'completed' && distribution.status !== 'pending') {
      throw new AppError(400, 'Only pending distributions can be completed');
    }

    if (status === 'completed') {
      // Deduct from fund balance
      fund.balance -= distribution.amount;
      fund.totalDistributions += distribution.amount;
      fund.updatedAt = new Date();

      // Log to audit trail
      fundAuditTrail.push({
        timestamp: new Date(),
        action: 'distribution_completed',
        details: `Completed ${distribution.type} distribution for ${distribution.amount}`,
      });
    }

    distribution.status = status;
    distributions.set(distributionId, distribution);

    return distribution;
  }

  /**
   * Get distribution statistics
   * Requirements: 2.1, 2.2, 2.3
   */
  async getDistributionStats(): Promise<{
    totalDistributions: number;
    totalDistributedAmount: number;
    averageDistribution: number;
    byType: Record<string, { count: number; amount: number }>;
    byStatus: Record<string, number>;
  }> {
    const allDistributions = Array.from(distributions.values());

    const byType: Record<string, { count: number; amount: number }> = {};
    const byStatus: Record<string, number> = {};
    let totalAmount = 0;

    allDistributions.forEach((d) => {
      // By type
      if (!byType[d.type]) {
        byType[d.type] = { count: 0, amount: 0 };
      }
      byType[d.type].count++;
      byType[d.type].amount += d.amount;

      // By status
      byStatus[d.status] = (byStatus[d.status] || 0) + 1;

      // Total
      if (d.status === 'completed') {
        totalAmount += d.amount;
      }
    });

    return {
      totalDistributions: allDistributions.length,
      totalDistributedAmount: totalAmount,
      averageDistribution: allDistributions.length > 0 ? totalAmount / allDistributions.length : 0,
      byType,
      byStatus,
    };
  }

  /**
   * Get impact metrics
   * Requirements: 2.1, 2.2, 2.3
   */
  async getImpactMetrics(): Promise<{
    scholarshipsAwarded: number;
    projectsFunded: number;
    communityBeneficiaries: number;
    totalImpactAmount: number;
  }> {
    const allDistributions = Array.from(distributions.values()).filter(
      (d) => d.status === 'completed'
    );

    let scholarshipsAwarded = 0;
    let projectsFunded = 0;
    let communityBeneficiaries = 0;
    let totalImpactAmount = 0;

    allDistributions.forEach((d) => {
      totalImpactAmount += d.amount;

      switch (d.type) {
        case 'scholarship':
          scholarshipsAwarded++;
          break;
        case 'project':
          projectsFunded++;
          break;
        case 'community':
          communityBeneficiaries++;
          break;
      }
    });

    return {
      scholarshipsAwarded,
      projectsFunded,
      communityBeneficiaries,
      totalImpactAmount,
    };
  }

  /**
   * Get fund analytics
   * Requirements: 2.1, 2.2, 2.3
   */
  async getAnalytics(startDate?: Date, endDate?: Date): Promise<{
    currentBalance: number;
    totalContributions: number;
    totalDistributions: number;
    contributionTrend: Array<{ date: string; amount: number }>;
    distributionTrend: Array<{ date: string; amount: number }>;
    topDistributionTypes: Array<{ type: string; amount: number; count: number }>;
  }> {
    const allDistributions = Array.from(distributions.values());

    let filtered = allDistributions;

    if (startDate || endDate) {
      const start = startDate || new Date(0);
      const end = endDate || new Date();

      filtered = allDistributions.filter((d) => {
        const distDate = new Date(d.distributedAt);
        return distDate >= start && distDate <= end;
      });
    }

    // Calculate trends
    const distributionTrend: Record<string, number> = {};
    filtered.forEach((d) => {
      const date = new Date(d.distributedAt).toISOString().split('T')[0];
      if (d.status === 'completed') {
        distributionTrend[date] = (distributionTrend[date] || 0) + d.amount;
      }
    });

    // Top distribution types
    const typeStats: Record<string, { amount: number; count: number }> = {};
    filtered.forEach((d) => {
      if (!typeStats[d.type]) {
        typeStats[d.type] = { amount: 0, count: 0 };
      }
      typeStats[d.type].amount += d.amount;
      typeStats[d.type].count++;
    });

    const topDistributionTypes = Object.entries(typeStats)
      .map(([type, stats]) => ({
        type,
        amount: stats.amount,
        count: stats.count,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      currentBalance: fund.balance,
      totalContributions: fund.totalContributions,
      totalDistributions: fund.totalDistributions,
      contributionTrend: [],
      distributionTrend: Object.entries(distributionTrend)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, amount]) => ({ date, amount })),
      topDistributionTypes,
    };
  }

  /**
   * Get fund audit trail
   * Requirements: 2.1, 2.2, 2.3
   */
  async getAuditTrail(
    page: number = 1,
    pageSize: number = 10
  ): Promise<{
    entries: Array<{
      action: string;
      amount?: number;
      timestamp: Date;
      details: string;
    }>;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const entries: Array<{
      action: string;
      amount?: number;
      timestamp: Date;
      details: string;
    }> = [];

    // Add fund audit trail entries
    fundAuditTrail.forEach((entry) => {
      entries.push({
        action: entry.action,
        timestamp: entry.timestamp,
        details: entry.details,
      });
    });

    // Add distribution entries
    Array.from(distributions.values()).forEach((d) => {
      entries.push({
        action: 'distribution_created',
        amount: d.amount,
        timestamp: d.distributedAt,
        details: `${d.type} distribution created: ${d.description}`,
      });

      if (d.status === 'completed') {
        entries.push({
          action: 'distribution_completed',
          amount: d.amount,
          timestamp: d.distributedAt,
          details: `${d.type} distribution completed`,
        });
      }
    });

    // Sort by timestamp (newest first)
    entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const total = entries.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      entries: entries.slice(start, end),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Validate distribution
   * Requirements: 2.1, 2.2, 2.3
   */
  validateDistribution(data: FundDistributionRequest): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (data.amount <= 0) {
      errors.push('Distribution amount must be positive');
    }

    if (data.amount > fund.balance) {
      errors.push(`Insufficient fund balance. Available: ${fund.balance}`);
    }

    const validTypes = ['scholarship', 'project', 'community'];
    if (!validTypes.includes(data.type)) {
      errors.push(`Invalid distribution type. Must be one of: ${validTypes.join(', ')}`);
    }

    if (!data.description || data.description.trim().length === 0) {
      errors.push('Distribution description is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const fundService = new FundService();
