import { revenueService } from '../services/revenue.service.js';
import { RevenueTransaction, RevenueAllocation } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

describe('Revenue Service', () => {
  const businessId = '550e8400-e29b-41d4-a716-446655440001';
  const businessId2 = '550e8400-e29b-41d4-a716-446655440002';

  beforeEach(() => {
    // Clear any previous test data
    jest.clearAllMocks();
  });

  describe('recordTransaction', () => {
    it('should record a revenue transaction successfully', async () => {
      const transactionData = {
        amount: 1000.50,
        source: 'Direct Sales',
        currency: 'USD',
      };

      const transaction = await revenueService.recordTransaction(businessId, transactionData);

      expect(transaction).toBeDefined();
      expect(transaction.id).toBeDefined();
      expect(transaction.businessId).toBe(businessId);
      expect(transaction.amount).toBe(1000.50);
      expect(transaction.source).toBe('Direct Sales');
      expect(transaction.currency).toBe('USD');
      expect(transaction.status).toBe('completed');
      expect(transaction.createdAt).toBeDefined();
    });

    it('should record transaction with default currency USD', async () => {
      const transactionData = {
        amount: 500,
        source: 'Online Payment',
      };

      const transaction = await revenueService.recordTransaction(businessId, transactionData);

      expect(transaction.currency).toBe('USD');
    });

    it('should record transaction with provided receivedAt date', async () => {
      const receivedDate = new Date('2024-01-15');
      const transactionData = {
        amount: 750,
        source: 'Service Fee',
        receivedAt: receivedDate,
      };

      const transaction = await revenueService.recordTransaction(businessId, transactionData);

      expect(transaction.receivedAt).toEqual(receivedDate);
    });

    it('should automatically create allocation for recorded transaction', async () => {
      const transactionData = {
        amount: 1000,
        source: 'Direct Sales',
      };

      const transaction = await revenueService.recordTransaction(businessId, transactionData);
      const allocation = await revenueService.getAllocation(transaction.id);

      expect(allocation).toBeDefined();
      expect(allocation?.businessOwnerAmount).toBe(900); // 90%
      expect(allocation?.citadelFundAmount).toBe(100); // 10%
    });
  });

  describe('getTransactions', () => {
    it('should retrieve transactions for a business', async () => {
      // Record multiple transactions
      await revenueService.recordTransaction(businessId, {
        amount: 1000,
        source: 'Sales 1',
      });
      await revenueService.recordTransaction(businessId, {
        amount: 2000,
        source: 'Sales 2',
      });

      const result = await revenueService.getTransactions(businessId);

      expect(result.transactions).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should support pagination', async () => {
      // Record 15 transactions
      for (let i = 0; i < 15; i++) {
        await revenueService.recordTransaction(businessId, {
          amount: 100 * (i + 1),
          source: `Sales ${i + 1}`,
        });
      }

      const page1 = await revenueService.getTransactions(businessId, 1, 10);
      const page2 = await revenueService.getTransactions(businessId, 2, 10);

      expect(page1.transactions).toHaveLength(10);
      expect(page2.transactions).toHaveLength(5);
      expect(page1.totalPages).toBe(2);
    });

    it('should return empty array for business with no transactions', async () => {
      const result = await revenueService.getTransactions(businessId2);

      expect(result.transactions).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should only return transactions for specified business', async () => {
      await revenueService.recordTransaction(businessId, {
        amount: 1000,
        source: 'Sales',
      });
      await revenueService.recordTransaction(businessId2, {
        amount: 2000,
        source: 'Sales',
      });

      const result1 = await revenueService.getTransactions(businessId);
      const result2 = await revenueService.getTransactions(businessId2);

      expect(result1.transactions).toHaveLength(1);
      expect(result2.transactions).toHaveLength(1);
      expect(result1.transactions[0].businessId).toBe(businessId);
      expect(result2.transactions[0].businessId).toBe(businessId2);
    });
  });

  describe('getTransactionById', () => {
    it('should retrieve a transaction by ID', async () => {
      const transactionData = {
        amount: 1500,
        source: 'Direct Sales',
      };

      const recorded = await revenueService.recordTransaction(businessId, transactionData);
      const retrieved = await revenueService.getTransactionById(recorded.id);

      expect(retrieved.id).toBe(recorded.id);
      expect(retrieved.amount).toBe(1500);
      expect(retrieved.source).toBe('Direct Sales');
    });

    it('should throw error for non-existent transaction', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440099';

      await expect(revenueService.getTransactionById(fakeId)).rejects.toThrow(AppError);
    });
  });

  describe('getBreakdown', () => {
    it('should calculate revenue breakdown correctly', async () => {
      await revenueService.recordTransaction(businessId, {
        amount: 1000,
        source: 'Sales 1',
      });
      await revenueService.recordTransaction(businessId, {
        amount: 2000,
        source: 'Sales 2',
      });

      const breakdown = await revenueService.getBreakdown(businessId);

      expect(breakdown.totalRevenue).toBe(3000);
      expect(breakdown.businessOwnerShare).toBe(2700); // 90%
      expect(breakdown.citadelFundShare).toBe(300); // 10%
      expect(breakdown.currency).toBe('USD');
    });

    it('should filter transactions by date range', async () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-02-01');
      const date3 = new Date('2024-03-01');

      await revenueService.recordTransaction(businessId, {
        amount: 1000,
        source: 'Sales 1',
        receivedAt: date1,
      });
      await revenueService.recordTransaction(businessId, {
        amount: 2000,
        source: 'Sales 2',
        receivedAt: date2,
      });
      await revenueService.recordTransaction(businessId, {
        amount: 3000,
        source: 'Sales 3',
        receivedAt: date3,
      });

      const breakdown = await revenueService.getBreakdown(
        businessId,
        new Date('2024-01-15'),
        new Date('2024-02-15')
      );

      expect(breakdown.totalRevenue).toBe(2000);
      expect(breakdown.businessOwnerShare).toBe(1800);
      expect(breakdown.citadelFundShare).toBe(200);
    });

    it('should return zero breakdown for business with no transactions', async () => {
      const breakdown = await revenueService.getBreakdown(businessId2);

      expect(breakdown.totalRevenue).toBe(0);
      expect(breakdown.businessOwnerShare).toBe(0);
      expect(breakdown.citadelFundShare).toBe(0);
    });
  });

  describe('getAllocation', () => {
    it('should retrieve allocation for a transaction', async () => {
      const transaction = await revenueService.recordTransaction(businessId, {
        amount: 1000,
        source: 'Sales',
      });

      const allocation = await revenueService.getAllocation(transaction.id);

      expect(allocation).toBeDefined();
      expect(allocation?.transactionId).toBe(transaction.id);
      expect(allocation?.businessOwnerAmount).toBe(900);
      expect(allocation?.citadelFundAmount).toBe(100);
    });

    it('should return null for non-existent allocation', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440099';
      const allocation = await revenueService.getAllocation(fakeId);

      expect(allocation).toBeNull();
    });
  });

  describe('getAllocations', () => {
    it('should retrieve all allocations for a business', async () => {
      await revenueService.recordTransaction(businessId, {
        amount: 1000,
        source: 'Sales 1',
      });
      await revenueService.recordTransaction(businessId, {
        amount: 2000,
        source: 'Sales 2',
      });

      const allocations = await revenueService.getAllocations(businessId);

      expect(allocations).toHaveLength(2);
      expect(allocations[0].businessOwnerAmount).toBe(900);
      expect(allocations[1].businessOwnerAmount).toBe(1800);
    });

    it('should return empty array for business with no allocations', async () => {
      const allocations = await revenueService.getAllocations(businessId2);

      expect(allocations).toHaveLength(0);
    });
  });

  describe('getTotalAllocations', () => {
    it('should calculate total allocations for a business', async () => {
      await revenueService.recordTransaction(businessId, {
        amount: 1000,
        source: 'Sales 1',
      });
      await revenueService.recordTransaction(businessId, {
        amount: 2000,
        source: 'Sales 2',
      });

      const totals = await revenueService.getTotalAllocations(businessId);

      expect(totals.totalBusinessOwnerAmount).toBe(2700); // (1000 + 2000) * 0.9
      expect(totals.totalCitadelFundAmount).toBe(300); // (1000 + 2000) * 0.1
      expect(totals.totalTransactions).toBe(2);
    });

    it('should return zero totals for business with no transactions', async () => {
      const totals = await revenueService.getTotalAllocations(businessId2);

      expect(totals.totalBusinessOwnerAmount).toBe(0);
      expect(totals.totalCitadelFundAmount).toBe(0);
      expect(totals.totalTransactions).toBe(0);
    });
  });

  describe('updateTransactionStatus', () => {
    it('should update transaction status to pending', async () => {
      const transaction = await revenueService.recordTransaction(businessId, {
        amount: 1000,
        source: 'Sales',
      });

      const updated = await revenueService.updateTransactionStatus(transaction.id, 'pending');

      expect(updated.status).toBe('pending');
    });

    it('should update transaction status to failed', async () => {
      const transaction = await revenueService.recordTransaction(businessId, {
        amount: 1000,
        source: 'Sales',
      });

      const updated = await revenueService.updateTransactionStatus(transaction.id, 'failed');

      expect(updated.status).toBe('failed');
    });

    it('should throw error for non-existent transaction', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440099';

      await expect(
        revenueService.updateTransactionStatus(fakeId, 'pending')
      ).rejects.toThrow(AppError);
    });
  });

  describe('getStatistics', () => {
    it('should calculate revenue statistics correctly', async () => {
      await revenueService.recordTransaction(businessId, {
        amount: 1000,
        source: 'Sales 1',
      });
      await revenueService.recordTransaction(businessId, {
        amount: 2000,
        source: 'Sales 2',
      });
      await revenueService.recordTransaction(businessId, {
        amount: 500,
        source: 'Sales 3',
      });

      const stats = await revenueService.getStatistics(businessId);

      expect(stats.totalRevenue).toBe(3500);
      expect(stats.transactionCount).toBe(3);
      expect(stats.averageTransaction).toBeCloseTo(1166.67, 1);
      expect(stats.largestTransaction).toBe(2000);
      expect(stats.smallestTransaction).toBe(500);
      expect(stats.businessOwnerTotal).toBe(3150); // 3500 * 0.9
      expect(stats.citadelFundTotal).toBe(350); // 3500 * 0.1
    });

    it('should filter statistics by date range', async () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-02-01');
      const date3 = new Date('2024-03-01');

      await revenueService.recordTransaction(businessId, {
        amount: 1000,
        source: 'Sales 1',
        receivedAt: date1,
      });
      await revenueService.recordTransaction(businessId, {
        amount: 2000,
        source: 'Sales 2',
        receivedAt: date2,
      });
      await revenueService.recordTransaction(businessId, {
        amount: 3000,
        source: 'Sales 3',
        receivedAt: date3,
      });

      const stats = await revenueService.getStatistics(
        businessId,
        new Date('2024-01-15'),
        new Date('2024-02-15')
      );

      expect(stats.totalRevenue).toBe(2000);
      expect(stats.transactionCount).toBe(1);
    });

    it('should return zero statistics for business with no transactions', async () => {
      const stats = await revenueService.getStatistics(businessId2);

      expect(stats.totalRevenue).toBe(0);
      expect(stats.transactionCount).toBe(0);
      expect(stats.averageTransaction).toBe(0);
    });
  });

  describe('validateTransaction', () => {
    it('should validate correct transaction data', () => {
      const validData = {
        amount: 1000,
        source: 'Direct Sales',
        currency: 'USD',
      };

      expect(revenueService.validateTransaction(validData)).toBe(true);
    });

    it('should throw error for negative amount', () => {
      const invalidData = {
        amount: -100,
        source: 'Direct Sales',
      };

      expect(() => revenueService.validateTransaction(invalidData)).toThrow(AppError);
    });

    it('should throw error for zero amount', () => {
      const invalidData = {
        amount: 0,
        source: 'Direct Sales',
      };

      expect(() => revenueService.validateTransaction(invalidData)).toThrow(AppError);
    });

    it('should throw error for missing source', () => {
      const invalidData = {
        amount: 1000,
        source: '',
      };

      expect(() => revenueService.validateTransaction(invalidData)).toThrow(AppError);
    });

    it('should throw error for invalid currency', () => {
      const invalidData = {
        amount: 1000,
        source: 'Direct Sales',
        currency: 'INVALID',
      };

      expect(() => revenueService.validateTransaction(invalidData)).toThrow(AppError);
    });

    it('should accept valid currencies', () => {
      const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR'];

      validCurrencies.forEach((currency) => {
        const data = {
          amount: 1000,
          source: 'Direct Sales',
          currency,
        };
        expect(revenueService.validateTransaction(data)).toBe(true);
      });
    });
  });

  describe('getRevenueTrend', () => {
    it('should calculate revenue trend for last 30 days', async () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);

      await revenueService.recordTransaction(businessId, {
        amount: 1000,
        source: 'Sales',
        receivedAt: twoDaysAgo,
      });
      await revenueService.recordTransaction(businessId, {
        amount: 2000,
        source: 'Sales',
        receivedAt: yesterday,
      });
      await revenueService.recordTransaction(businessId, {
        amount: 1500,
        source: 'Sales',
        receivedAt: today,
      });

      const trend = await revenueService.getRevenueTrend(businessId, 30);

      expect(trend.length).toBeGreaterThan(0);
      expect(trend[trend.length - 1].revenue).toBe(1500);
      expect(trend[trend.length - 1].businessOwnerShare).toBe(1350);
      expect(trend[trend.length - 1].citadelFundShare).toBe(150);
    });

    it('should return empty trend for business with no transactions', async () => {
      const trend = await revenueService.getRevenueTrend(businessId2, 30);

      expect(trend).toHaveLength(0);
    });

    it('should group transactions by date', async () => {
      const date1 = new Date('2024-01-01');
      const date1Later = new Date('2024-01-01T12:00:00');

      await revenueService.recordTransaction(businessId, {
        amount: 1000,
        source: 'Sales 1',
        receivedAt: date1,
      });
      await revenueService.recordTransaction(businessId, {
        amount: 500,
        source: 'Sales 2',
        receivedAt: date1Later,
      });

      const trend = await revenueService.getRevenueTrend(businessId, 30);

      // Should have one entry for 2024-01-01 with combined revenue
      const jan1Entry = trend.find((t) => t.date === '2024-01-01');
      expect(jan1Entry?.revenue).toBe(1500);
    });
  });

  describe('Transaction History Tracking', () => {
    it('should maintain transaction history with timestamps', async () => {
      const before = new Date();
      const transaction = await revenueService.recordTransaction(businessId, {
        amount: 1000,
        source: 'Sales',
      });
      const after = new Date();

      expect(transaction.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(transaction.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should track allocation timestamps', async () => {
      const transaction = await revenueService.recordTransaction(businessId, {
        amount: 1000,
        source: 'Sales',
      });
      const allocation = await revenueService.getAllocation(transaction.id);

      expect(allocation?.allocatedAt).toBeDefined();
      expect(allocation?.allocatedAt instanceof Date).toBe(true);
    });
  });

  describe('Revenue Allocation Accuracy', () => {
    it('should maintain 90/10 split across multiple transactions', async () => {
      const amounts = [100, 250, 1000, 5000];

      for (const amount of amounts) {
        await revenueService.recordTransaction(businessId, {
          amount,
          source: 'Sales',
        });
      }

      const totals = await revenueService.getTotalAllocations(businessId);
      const expectedTotal = amounts.reduce((a, b) => a + b, 0);

      expect(totals.totalBusinessOwnerAmount).toBe(expectedTotal * 0.9);
      expect(totals.totalCitadelFundAmount).toBe(expectedTotal * 0.1);
      expect(totals.totalBusinessOwnerAmount + totals.totalCitadelFundAmount).toBe(expectedTotal);
    });
  });
});
