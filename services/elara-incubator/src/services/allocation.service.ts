import { generateUUID } from '../utils/uuid.js';
import { RevenueAllocation } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { auditService } from './audit.service.js';

// Mock database - replace with actual database calls
const allocations: Map<string, RevenueAllocation> = new Map();
const allocationRules: Map<string, { businessShare: number; fundShare: number }> = new Map();
const allocationAuditTrail: Map<string, Array<{
  timestamp: Date;
  action: string;
  details: string;
  userId?: string;
  ipAddress?: string;
}>> = new Map();
// Track which allocations belong to which business
const businessAllocations: Map<string, Set<string>> = new Map();

export class AllocationService {
  /**
   * Create allocation for a transaction (90/10 split by default)
   * Requirements: 2.1, 2.2, 4.1
   */
  async createAllocation(
    transactionId: string,
    amount: number,
    businessShare: number = 90,
    fundShare: number = 10,
    userId?: string,
    ipAddress?: string,
    businessId?: string
  ): Promise<RevenueAllocation> {
    // Validate shares add up to 100
    if (Math.abs(businessShare + fundShare - 100) > 0.01) {
      throw new AppError(400, 'Business share and fund share must add up to 100%');
    }

    // Validate amount
    if (amount <= 0) {
      throw new AppError(400, 'Amount must be positive');
    }

    const allocationId = generateUUID();
    const now = new Date();

    const businessOwnerAmount = (amount * businessShare) / 100;
    const citadelFundAmount = (amount * fundShare) / 100;

    const allocation: RevenueAllocation = {
      id: allocationId,
      transactionId,
      businessOwnerAmount,
      citadelFundAmount,
      allocatedAt: now,
    };

    allocations.set(allocationId, allocation);

    // Store allocation rule for this transaction
    allocationRules.set(transactionId, {
      businessShare,
      fundShare,
    });

    // Track business allocation if businessId provided
    if (businessId) {
      if (!businessAllocations.has(businessId)) {
        businessAllocations.set(businessId, new Set());
      }
      businessAllocations.get(businessId)!.add(allocationId);
    }

    // Log allocation creation
    await this.logAllocationAction(
      allocationId,
      'allocation_created',
      `Created allocation for transaction ${transactionId}: Business ${businessOwnerAmount.toFixed(2)}, Fund ${citadelFundAmount.toFixed(2)}`,
      userId,
      ipAddress
    );

    return allocation;
  }

  /**
   * Get allocation by transaction ID
   * Requirements: 2.1, 2.2, 4.1
   */
  async getAllocationByTransaction(transactionId: string): Promise<RevenueAllocation | null> {
    const allocation = Array.from(allocations.values()).find(
      (a) => a.transactionId === transactionId
    );
    return allocation || null;
  }

  /**
   * Get all allocations for a business
   * Requirements: 2.1, 2.2, 4.1
   */
  async getBusinessAllocations(businessId: string): Promise<RevenueAllocation[]> {
    const allocationIds = businessAllocations.get(businessId) || new Set();
    const result: RevenueAllocation[] = [];
    
    for (const allocationId of allocationIds) {
      const allocation = allocations.get(allocationId);
      if (allocation) {
        result.push(allocation);
      }
    }
    
    return result;
  }

  /**
   * Calculate total allocations for a business
   * Requirements: 2.1, 2.2, 4.1
   */
  async calculateTotalAllocations(businessId: string): Promise<{
    totalRevenue: number;
    businessOwnerTotal: number;
    citadelFundTotal: number;
    allocationCount: number;
  }> {
    const businessAllocations = await this.getBusinessAllocations(businessId);

    const totalRevenue = businessAllocations.reduce(
      (sum, a) => sum + a.businessOwnerAmount + a.citadelFundAmount,
      0
    );
    const businessOwnerTotal = businessAllocations.reduce(
      (sum, a) => sum + a.businessOwnerAmount,
      0
    );
    const citadelFundTotal = businessAllocations.reduce(
      (sum, a) => sum + a.citadelFundAmount,
      0
    );

    return {
      totalRevenue,
      businessOwnerTotal,
      citadelFundTotal,
      allocationCount: businessAllocations.length,
    };
  }

  /**
   * Get allocation rule for a transaction
   * Requirements: 2.1, 2.2, 4.1
   */
  async getAllocationRule(transactionId: string): Promise<{
    businessShare: number;
    fundShare: number;
  } | null> {
    return allocationRules.get(transactionId) || null;
  }

  /**
   * Update allocation rule (for future transactions)
   * Requirements: 2.1, 2.2, 4.1
   */
  async updateAllocationRule(
    businessId: string,
    businessShare: number,
    fundShare: number,
    userId?: string,
    ipAddress?: string
  ): Promise<{
    businessShare: number;
    fundShare: number;
  }> {
    // Validate shares
    if (Math.abs(businessShare + fundShare - 100) > 0.01) {
      throw new AppError(400, 'Business share and fund share must add up to 100%');
    }

    if (businessShare < 0 || businessShare > 100 || fundShare < 0 || fundShare > 100) {
      throw new AppError(400, 'Shares must be between 0 and 100');
    }

    // Store rule (would be stored per business in real implementation)
    const ruleKey = `business_${businessId}`;
    allocationRules.set(ruleKey, {
      businessShare,
      fundShare,
    });

    // Log rule update
    await this.logAllocationAction(
      ruleKey,
      'allocation_rule_updated',
      `Updated allocation rule for business ${businessId}: Business ${businessShare}%, Fund ${fundShare}%`,
      userId,
      ipAddress
    );

    return {
      businessShare,
      fundShare,
    };
  }

  /**
   * Get allocation breakdown by period
   * Requirements: 2.1, 2.2, 4.1
   */
  async getAllocationBreakdown(
    businessId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    period: { startDate: Date; endDate: Date };
    totalRevenue: number;
    businessOwnerShare: number;
    citadelFundShare: number;
    businessOwnerPercentage: number;
    citadelFundPercentage: number;
    allocationCount: number;
  }> {
    const allocations = await this.getBusinessAllocations(businessId);

    let filtered = allocations;

    if (startDate || endDate) {
      const start = startDate || new Date(0);
      const end = endDate || new Date();

      filtered = allocations.filter((a) => {
        const allocDate = new Date(a.allocatedAt);
        return allocDate >= start && allocDate <= end;
      });
    }

    const totalRevenue = filtered.reduce(
      (sum, a) => sum + a.businessOwnerAmount + a.citadelFundAmount,
      0
    );
    const businessOwnerShare = filtered.reduce((sum, a) => sum + a.businessOwnerAmount, 0);
    const citadelFundShare = filtered.reduce((sum, a) => sum + a.citadelFundAmount, 0);

    const businessOwnerPercentage =
      totalRevenue > 0 ? (businessOwnerShare / totalRevenue) * 100 : 0;
    const citadelFundPercentage = totalRevenue > 0 ? (citadelFundShare / totalRevenue) * 100 : 0;

    return {
      period: {
        startDate: startDate || new Date(),
        endDate: endDate || new Date(),
      },
      totalRevenue,
      businessOwnerShare,
      citadelFundShare,
      businessOwnerPercentage,
      citadelFundPercentage,
      allocationCount: filtered.length,
    };
  }

  /**
   * Validate allocation amounts
   * Requirements: 2.1, 2.2, 4.1
   */
  validateAllocation(
    amount: number,
    businessOwnerAmount: number,
    citadelFundAmount: number
  ): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (amount <= 0) {
      errors.push('Amount must be positive');
    }

    if (businessOwnerAmount < 0 || citadelFundAmount < 0) {
      errors.push('Allocated amounts cannot be negative');
    }

    const total = businessOwnerAmount + citadelFundAmount;
    if (Math.abs(total - amount) > 0.01) {
      errors.push(
        `Allocated amounts (${total}) do not match transaction amount (${amount})`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get allocation statistics
   * Requirements: 2.1, 2.2, 4.1
   */
  async getAllocationStats(businessId: string): Promise<{
    totalAllocations: number;
    averageAllocation: number;
    largestAllocation: number;
    smallestAllocation: number;
    totalBusinessOwnerAmount: number;
    totalCitadelFundAmount: number;
    averageBusinessShare: number;
    averageFundShare: number;
  }> {
    const allocations = await this.getBusinessAllocations(businessId);

    if (allocations.length === 0) {
      return {
        totalAllocations: 0,
        averageAllocation: 0,
        largestAllocation: 0,
        smallestAllocation: 0,
        totalBusinessOwnerAmount: 0,
        totalCitadelFundAmount: 0,
        averageBusinessShare: 0,
        averageFundShare: 0,
      };
    }

    const amounts = allocations.map((a) => a.businessOwnerAmount + a.citadelFundAmount);
    const totalBusinessOwnerAmount = allocations.reduce((sum, a) => sum + a.businessOwnerAmount, 0);
    const totalCitadelFundAmount = allocations.reduce((sum, a) => sum + a.citadelFundAmount, 0);
    const totalAmount = totalBusinessOwnerAmount + totalCitadelFundAmount;

    return {
      totalAllocations: allocations.length,
      averageAllocation: totalAmount / allocations.length,
      largestAllocation: Math.max(...amounts),
      smallestAllocation: Math.min(...amounts),
      totalBusinessOwnerAmount,
      totalCitadelFundAmount,
      averageBusinessShare: (totalBusinessOwnerAmount / totalAmount) * 100,
      averageFundShare: (totalCitadelFundAmount / totalAmount) * 100,
    };
  }

  /**
   * Recalculate allocations for a business (for rule changes)
   * Requirements: 2.1, 2.2, 4.1
   */
  async recalculateAllocations(
    businessId: string,
    newBusinessShare: number,
    newFundShare: number,
    userId?: string,
    ipAddress?: string
  ): Promise<{
    recalculated: number;
    totalNewBusinessOwnerAmount: number;
    totalNewCitadelFundAmount: number;
  }> {
    // Validate new shares
    if (Math.abs(newBusinessShare + newFundShare - 100) > 0.01) {
      throw new AppError(400, 'Business share and fund share must add up to 100%');
    }

    const businessAllocations = await this.getBusinessAllocations(businessId);
    let totalNewBusinessOwnerAmount = 0;
    let totalNewCitadelFundAmount = 0;
    const oldTotalBusinessOwnerAmount = businessAllocations.reduce((sum, a) => sum + a.businessOwnerAmount, 0);
    const oldTotalCitadelFundAmount = businessAllocations.reduce((sum, a) => sum + a.citadelFundAmount, 0);

    // Recalculate each allocation
    businessAllocations.forEach((allocation) => {
      const totalAmount = allocation.businessOwnerAmount + allocation.citadelFundAmount;
      allocation.businessOwnerAmount = (totalAmount * newBusinessShare) / 100;
      allocation.citadelFundAmount = (totalAmount * newFundShare) / 100;

      totalNewBusinessOwnerAmount += allocation.businessOwnerAmount;
      totalNewCitadelFundAmount += allocation.citadelFundAmount;

      allocations.set(allocation.id, allocation);
    });

    // Log recalculation
    await this.logAllocationAction(
      `recalc_${businessId}`,
      'allocation_recalculated',
      `Recalculated ${businessAllocations.length} allocations. Old: Business ${oldTotalBusinessOwnerAmount.toFixed(2)}, Fund ${oldTotalCitadelFundAmount.toFixed(2)}. New: Business ${totalNewBusinessOwnerAmount.toFixed(2)}, Fund ${totalNewCitadelFundAmount.toFixed(2)}`,
      userId,
      ipAddress
    );

    return {
      recalculated: businessAllocations.length,
      totalNewBusinessOwnerAmount,
      totalNewCitadelFundAmount,
    };
  }

  /**
   * Log allocation action
   * Requirements: 7.1, 7.2, 7.3, 7.4
   */
  private async logAllocationAction(
    allocationId: string,
    action: string,
    details: string,
    userId?: string,
    ipAddress?: string
  ): Promise<void> {
    // Store in local audit trail
    if (!allocationAuditTrail.has(allocationId)) {
      allocationAuditTrail.set(allocationId, []);
    }

    const trail = allocationAuditTrail.get(allocationId)!;
    trail.push({
      timestamp: new Date(),
      action,
      details,
      userId,
      ipAddress,
    });

    // Also log to global audit service
    await auditService.logAllocationAction(allocationId, action, details, userId, ipAddress);
  }

  /**
   * Get allocation audit trail
   * Requirements: 7.1, 7.2, 7.3, 7.4
   */
  async getAllocationAuditTrail(allocationId: string): Promise<Array<{
    timestamp: Date;
    action: string;
    details: string;
    userId?: string;
    ipAddress?: string;
  }>> {
    return allocationAuditTrail.get(allocationId) || [];
  }

  /**
   * Get all allocation audit trails
   * Requirements: 7.1, 7.2, 7.3, 7.4
   */
  async getAllAllocationAuditTrails(): Promise<Record<string, Array<{
    timestamp: Date;
    action: string;
    details: string;
    userId?: string;
    ipAddress?: string;
  }>>> {
    const result: Record<string, Array<{
      timestamp: Date;
      action: string;
      details: string;
      userId?: string;
      ipAddress?: string;
    }>> = {};

    for (const [allocationId, trail] of allocationAuditTrail.entries()) {
      result[allocationId] = trail;
    }

    return result;
  }

  /**
   * Export allocation audit trail as CSV
   * Requirements: 7.1, 7.2, 7.3, 7.4
   */
  async exportAllocationAuditTrailAsCSV(allocationId: string): Promise<string> {
    const trail = await this.getAllocationAuditTrail(allocationId);

    const headers = ['Timestamp', 'Action', 'Details', 'User ID', 'IP Address'];
    const rows = trail.map((entry) => [
      entry.timestamp.toISOString(),
      entry.action,
      entry.details,
      entry.userId || 'N/A',
      entry.ipAddress || 'N/A',
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    return csv;
  }
}

export const allocationService = new AllocationService();
