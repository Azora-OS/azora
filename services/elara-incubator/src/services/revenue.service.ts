import { generateUUID } from '../utils/uuid.js';
import {
  RevenueTransaction,
  RevenueAllocation,
  RevenueTransactionRequest,
  RevenueBreakdown,
} from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

// Mock database - replace with actual database calls
const transactions: Map<string, RevenueTransaction> = new Map();
const allocations: Map<string, RevenueAllocation> = new Map();

export class RevenueService {
  /**
   * Record a revenue transaction
   * Requirements: 4.1, 4.2
   */
  async recordTransaction(
    businessId: string,
    data: RevenueTransactionRequest
  ): Promise<RevenueTransaction> {
    const transactionId = generateUUID();
    const now = new Date();

    const transaction: RevenueTransaction = {
      id: transactionId,
      businessId,
      amount: data.amount,
      currency: data.currency || 'USD',
      source: data.source,
      receivedAt: data.receivedAt || now,
      status: 'completed',
      createdAt: now,
    };

    transactions.set(transactionId, transaction);

    // Automatically create allocation (90/10 split)
    await this.createAllocation(transactionId, data.amount);

    return transaction;
  }

  /**
   * Get revenue transactions for a business
   * Requirements: 4.1, 4.2
   */
  async getTransactions(
    businessId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{
    transactions: RevenueTransaction[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const businessTransactions = Array.from(transactions.values()).filter(
      (t) => t.businessId === businessId
    );

    const total = businessTransactions.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      transactions: businessTransactions.slice(start, end),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Get revenue breakdown for a business
   * Requirements: 4.1, 4.2
   */
  async getBreakdown(
    businessId: string,
    startDate?: Date | string,
    endDate?: Date | string
  ): Promise<RevenueBreakdown> {
    const businessTransactions = Array.from(transactions.values()).filter(
      (t) => t.businessId === businessId
    );

    let filtered = businessTransactions;

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();

      filtered = businessTransactions.filter((t) => {
        const txDate = new Date(t.receivedAt);
        return txDate >= start && txDate <= end;
      });
    }

    const totalRevenue = filtered.reduce((sum, t) => sum + t.amount, 0);
    const businessOwnerShare = totalRevenue * 0.9;
    const citadelFundShare = totalRevenue * 0.1;

    return {
      totalRevenue,
      businessOwnerShare,
      citadelFundShare,
      currency: 'USD',
      period: {
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(),
      },
    };
  }

  /**
   * Get transaction by ID
   * Requirements: 4.1, 4.2
   */
  async getTransactionById(transactionId: string): Promise<RevenueTransaction> {
    const transaction = transactions.get(transactionId);

    if (!transaction) {
      throw new AppError(404, 'Revenue transaction not found');
    }

    return transaction;
  }

  /**
   * Get allocation for a transaction
   * Requirements: 2.1, 2.2, 4.1
   */
  async getAllocation(transactionId: string): Promise<RevenueAllocation | null> {
    const allocation = Array.from(allocations.values()).find(
      (a) => a.transactionId === transactionId
    );
    return allocation || null;
  }

  /**
   * Create allocation for a transaction (90/10 split)
   * Requirements: 2.1, 2.2, 4.1
   */
  private async createAllocation(transactionId: string, amount: number): Promise<RevenueAllocation> {
    const allocationId = generateUUID();
    const now = new Date();

    const businessOwnerAmount = amount * 0.9;
    const citadelFundAmount = amount * 0.1;

    const allocation: RevenueAllocation = {
      id: allocationId,
      transactionId,
      businessOwnerAmount,
      citadelFundAmount,
      allocatedAt: now,
    };

    allocations.set(allocationId, allocation);

    return allocation;
  }

  /**
   * Get all allocations for a business
   * Requirements: 2.1, 2.2, 4.1
   */
  async getAllocations(businessId: string): Promise<RevenueAllocation[]> {
    const businessTransactions = Array.from(transactions.values()).filter(
      (t) => t.businessId === businessId
    );

    const transactionIds = new Set(businessTransactions.map((t) => t.id));

    return Array.from(allocations.values()).filter((a) => transactionIds.has(a.transactionId));
  }

  /**
   * Get total allocated amounts for a business
   * Requirements: 2.1, 2.2, 4.1
   */
  async getTotalAllocations(businessId: string): Promise<{
    totalBusinessOwnerAmount: number;
    totalCitadelFundAmount: number;
    totalTransactions: number;
  }> {
    const businessAllocations = await this.getAllocations(businessId);

    const totalBusinessOwnerAmount = businessAllocations.reduce(
      (sum, a) => sum + a.businessOwnerAmount,
      0
    );
    const totalCitadelFundAmount = businessAllocations.reduce(
      (sum, a) => sum + a.citadelFundAmount,
      0
    );

    return {
      totalBusinessOwnerAmount,
      totalCitadelFundAmount,
      totalTransactions: businessAllocations.length,
    };
  }

  /**
   * Update transaction status
   * Requirements: 4.1, 4.2
   */
  async updateTransactionStatus(
    transactionId: string,
    status: 'pending' | 'completed' | 'failed'
  ): Promise<RevenueTransaction> {
    const transaction = await this.getTransactionById(transactionId);

    transaction.status = status;

    transactions.set(transactionId, transaction);

    return transaction;
  }

  /**
   * Get revenue statistics for a business
   * Requirements: 4.1, 4.2
   */
  async getStatistics(
    businessId: string,
    startDate?: Date | string,
    endDate?: Date | string
  ): Promise<{
    totalRevenue: number;
    transactionCount: number;
    averageTransaction: number;
    largestTransaction: number;
    smallestTransaction: number;
    businessOwnerTotal: number;
    citadelFundTotal: number;
    currency: string;
  }> {
    const breakdown = await this.getBreakdown(businessId, startDate, endDate);
    const allocations = await this.getAllocations(businessId);

    let filtered = allocations;

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();

      filtered = allocations.filter((a) => {
        const txDate = new Date(a.allocatedAt);
        return txDate >= start && txDate <= end;
      });
    }

    const businessTransactions = Array.from(transactions.values()).filter(
      (t) => t.businessId === businessId
    );

    const amounts = businessTransactions.map((t) => t.amount);

    return {
      totalRevenue: breakdown.totalRevenue,
      transactionCount: filtered.length,
      averageTransaction: filtered.length > 0 ? breakdown.totalRevenue / filtered.length : 0,
      largestTransaction: amounts.length > 0 ? Math.max(...amounts) : 0,
      smallestTransaction: amounts.length > 0 ? Math.min(...amounts) : 0,
      businessOwnerTotal: breakdown.businessOwnerShare,
      citadelFundTotal: breakdown.citadelFundShare,
      currency: 'USD',
    };
  }

  /**
   * Validate revenue transaction
   * Requirements: 4.1, 4.2
   */
  validateTransaction(data: RevenueTransactionRequest): boolean {
    if (data.amount <= 0) {
      throw new AppError(400, 'Amount must be positive');
    }

    if (!data.source || data.source.trim().length === 0) {
      throw new AppError(400, 'Revenue source is required');
    }

    if (data.currency && !this.isValidCurrency(data.currency)) {
      throw new AppError(400, 'Invalid currency code');
    }

    return true;
  }

  /**
   * Check if currency is valid
   * Requirements: 4.1, 4.2
   */
  private isValidCurrency(currency: string): boolean {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'];
    return validCurrencies.includes(currency.toUpperCase());
  }

  /**
   * Get revenue trend for a business
   * Requirements: 4.1, 4.2
   */
  async getRevenueTrend(
    businessId: string,
    days: number = 30
  ): Promise<
    Array<{
      date: string;
      revenue: number;
      businessOwnerShare: number;
      citadelFundShare: number;
    }>
  > {
    const businessTransactions = Array.from(transactions.values()).filter(
      (t) => t.businessId === businessId
    );

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const filtered = businessTransactions.filter((t) => {
      const txDate = new Date(t.receivedAt);
      return txDate >= startDate && txDate <= now;
    });

    // Group by date
    const grouped: Record<string, number> = {};

    filtered.forEach((t) => {
      const date = new Date(t.receivedAt).toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + t.amount;
    });

    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, revenue]) => ({
        date,
        revenue,
        businessOwnerShare: revenue * 0.9,
        citadelFundShare: revenue * 0.1,
      }));
  }
}

export const revenueService = new RevenueService();
