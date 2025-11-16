/**
 * System Buy-Order Service Tests
 * Tests for revenue tracking and automated token purchasing
 */

import { Decimal } from '@prisma/client/runtime/library';
import { SystemBuyOrderService } from '../system-buy-order';
import { BlockchainBurnService } from '../blockchain-burn-service';

// Mock Prisma client
const mockPrisma = {
  systemBuyOrderRevenue: {
    create: jest.fn(),
    aggregate: jest.fn(),
  },
  systemBuyOrderHistory: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    findFirst: jest.fn(),
  },
};

// Mock blockchain service
const mockBlockchainService = {
  executeBurn: jest.fn(),
} as unknown as BlockchainBurnService;

describe('SystemBuyOrderService', () => {
  let service: SystemBuyOrderService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SystemBuyOrderService(
      mockPrisma as any,
      mockBlockchainService,
      {
        revenuePercentage: 0.1,
        executionSchedule: 'daily',
        minBuyAmount: new Decimal(100),
        maxBuyAmount: new Decimal(1000000),
      }
    );
  });

  describe('trackRevenue', () => {
    it('should track revenue from course sales', async () => {
      const mockRecord = {
        id: 'rev-1',
        source: 'course_sale',
        amount: new Decimal(1000),
        currency: 'ZAR',
        recordedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.systemBuyOrderRevenue.create.mockResolvedValue(mockRecord);

      const result = await service.trackRevenue('course_sale', 1000, 'ZAR');

      expect(result).toEqual(mockRecord);
      expect(mockPrisma.systemBuyOrderRevenue.create).toHaveBeenCalledWith({
        data: {
          source: 'course_sale',
          amount: new Decimal(1000),
          currency: 'ZAR',
        },
      });
    });

    it('should track revenue from subscriptions', async () => {
      const mockRecord = {
        id: 'rev-2',
        source: 'subscription',
        amount: new Decimal(500),
        currency: 'ZAR',
        recordedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.systemBuyOrderRevenue.create.mockResolvedValue(mockRecord);

      const result = await service.trackRevenue('subscription', 500, 'ZAR');

      expect(result).toEqual(mockRecord);
      expect(mockPrisma.systemBuyOrderRevenue.create).toHaveBeenCalled();
    });

    it('should reject negative revenue amounts', async () => {
      await expect(service.trackRevenue('course_sale', -100, 'ZAR')).rejects.toThrow(
        'Revenue amount must be greater than 0'
      );
    });

    it('should reject zero revenue amounts', async () => {
      await expect(service.trackRevenue('course_sale', 0, 'ZAR')).rejects.toThrow(
        'Revenue amount must be greater than 0'
      );
    });
  });

  describe('calculateAvailableRevenue', () => {
    it('should calculate available revenue correctly', async () => {
      mockPrisma.systemBuyOrderRevenue.aggregate.mockResolvedValue({
        _sum: { amount: new Decimal(10000) },
      });

      mockPrisma.systemBuyOrderHistory.aggregate.mockResolvedValue({
        _sum: { revenueUsed: new Decimal(2000) },
      });

      const result = await service.calculateAvailableRevenue();

      // Available = (10000 - 2000) * 0.1 = 800
      expect(result).toEqual(new Decimal(800));
    });

    it('should handle zero revenue', async () => {
      mockPrisma.systemBuyOrderRevenue.aggregate.mockResolvedValue({
        _sum: { amount: null },
      });

      mockPrisma.systemBuyOrderHistory.aggregate.mockResolvedValue({
        _sum: { revenueUsed: null },
      });

      const result = await service.calculateAvailableRevenue();

      expect(result).toEqual(new Decimal(0));
    });

    it('should apply 10% revenue percentage', async () => {
      mockPrisma.systemBuyOrderRevenue.aggregate.mockResolvedValue({
        _sum: { amount: new Decimal(5000) },
      });

      mockPrisma.systemBuyOrderHistory.aggregate.mockResolvedValue({
        _sum: { revenueUsed: new Decimal(0) },
      });

      const result = await service.calculateAvailableRevenue();

      // 5000 * 0.1 = 500
      expect(result).toEqual(new Decimal(500));
    });
  });

  describe('executeBuyOrder', () => {
    it('should execute buy-order successfully', async () => {
      mockPrisma.systemBuyOrderRevenue.aggregate.mockResolvedValue({
        _sum: { amount: new Decimal(10000) },
      });

      mockPrisma.systemBuyOrderHistory.aggregate.mockResolvedValue({
        _sum: { revenueUsed: new Decimal(0) },
      });

      const mockHistoryRecord = {
        id: 'history-1',
        revenueUsed: new Decimal(1000),
        tokensAcquired: new Decimal(100),
        pricePerToken: new Decimal(10),
        executionTime: new Date(),
        blockchainTxHash: '0xabc123',
        status: 'completed',
        error: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.systemBuyOrderHistory.create.mockResolvedValue(mockHistoryRecord);

      (mockBlockchainService.executeBurn as jest.Mock).mockResolvedValue({
        success: true,
        transactionHash: '0xabc123',
        status: 'CONFIRMED',
        timestamp: new Date(),
      });

      const result = await service.executeBuyOrder(10);

      expect(result.success).toBe(true);
      expect(result.tokensAcquired).toEqual(new Decimal(100));
      expect(result.randSpent).toEqual(new Decimal(1000));
      expect(mockPrisma.systemBuyOrderHistory.create).toHaveBeenCalled();
    });

    it('should reject invalid price per token', async () => {
      const result = await service.executeBuyOrder(0);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Price per token must be greater than 0');
    });

    it('should reject negative price per token', async () => {
      const result = await service.executeBuyOrder(-10);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Price per token must be greater than 0');
    });

    it('should reject buy amount below minimum', async () => {
      mockPrisma.systemBuyOrderRevenue.aggregate.mockResolvedValue({
        _sum: { amount: new Decimal(50) }, // Less than minBuyAmount of 100
      });

      mockPrisma.systemBuyOrderHistory.aggregate.mockResolvedValue({
        _sum: { revenueUsed: new Decimal(0) },
      });

      const result = await service.executeBuyOrder(10);

      expect(result.success).toBe(false);
      expect(result.error).toContain('below minimum');
    });

    it('should cap buy amount at maximum', async () => {
      mockPrisma.systemBuyOrderRevenue.aggregate.mockResolvedValue({
        _sum: { amount: new Decimal(20000000) }, // Exceeds maxBuyAmount
      });

      mockPrisma.systemBuyOrderHistory.aggregate.mockResolvedValue({
        _sum: { revenueUsed: new Decimal(0) },
      });

      const mockHistoryRecord = {
        id: 'history-2',
        revenueUsed: new Decimal(1000000), // Capped at maxBuyAmount
        tokensAcquired: new Decimal(100000),
        pricePerToken: new Decimal(10),
        executionTime: new Date(),
        blockchainTxHash: '0xdef456',
        status: 'completed',
        error: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.systemBuyOrderHistory.create.mockResolvedValue(mockHistoryRecord);

      (mockBlockchainService.executeBurn as jest.Mock).mockResolvedValue({
        success: true,
        transactionHash: '0xdef456',
        status: 'CONFIRMED',
        timestamp: new Date(),
      });

      const result = await service.executeBuyOrder(10);

      expect(result.success).toBe(true);
      expect(result.randSpent).toEqual(new Decimal(1000000));
    });

    it('should handle blockchain execution failure', async () => {
      mockPrisma.systemBuyOrderRevenue.aggregate.mockResolvedValue({
        _sum: { amount: new Decimal(10000) },
      });

      mockPrisma.systemBuyOrderHistory.aggregate.mockResolvedValue({
        _sum: { revenueUsed: new Decimal(0) },
      });

      const mockHistoryRecord = {
        id: 'history-3',
        revenueUsed: new Decimal(1000),
        tokensAcquired: new Decimal(100),
        pricePerToken: new Decimal(10),
        executionTime: new Date(),
        blockchainTxHash: null,
        status: 'failed',
        error: 'Blockchain error',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.systemBuyOrderHistory.create.mockResolvedValue(mockHistoryRecord);

      (mockBlockchainService.executeBurn as jest.Mock).mockResolvedValue({
        success: false,
        status: 'FAILED',
        error: 'Blockchain error',
        timestamp: new Date(),
      });

      const result = await service.executeBuyOrder(10);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Blockchain error');
    });
  });

  describe('getBuyOrderHistory', () => {
    it('should fetch buy-order history with pagination', async () => {
      const mockHistory = [
        {
          id: 'history-1',
          revenueUsed: new Decimal(1000),
          tokensAcquired: new Decimal(100),
          pricePerToken: new Decimal(10),
          executionTime: new Date(),
          blockchainTxHash: '0xabc123',
          status: 'completed',
          error: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.systemBuyOrderHistory.findMany.mockResolvedValue(mockHistory);
      mockPrisma.systemBuyOrderHistory.count.mockResolvedValue(1);

      const result = await service.getBuyOrderHistory(50, 0);

      expect(result.history).toEqual(mockHistory);
      expect(result.total).toBe(1);
      expect(mockPrisma.systemBuyOrderHistory.findMany).toHaveBeenCalledWith({
        orderBy: { executionTime: 'desc' },
        take: 50,
        skip: 0,
      });
    });

    it('should handle empty history', async () => {
      mockPrisma.systemBuyOrderHistory.findMany.mockResolvedValue([]);
      mockPrisma.systemBuyOrderHistory.count.mockResolvedValue(0);

      const result = await service.getBuyOrderHistory(50, 0);

      expect(result.history).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getMetrics', () => {
    it('should calculate metrics correctly', async () => {
      mockPrisma.systemBuyOrderRevenue.aggregate.mockResolvedValue({
        _sum: { amount: new Decimal(10000) },
      });

      mockPrisma.systemBuyOrderHistory.aggregate.mockResolvedValue({
        _sum: {
          tokensAcquired: new Decimal(1000),
          revenueUsed: new Decimal(5000),
        },
      });

      mockPrisma.systemBuyOrderHistory.count
        .mockResolvedValueOnce(8) // completed count
        .mockResolvedValueOnce(10); // total count

      mockPrisma.systemBuyOrderHistory.findFirst.mockResolvedValue({
        executionTime: new Date(),
      });

      const result = await service.getMetrics();

      expect(result.totalRevenueTracked).toEqual(new Decimal(10000));
      expect(result.totalTokensAcquired).toEqual(new Decimal(1000));
      expect(result.totalRandSpent).toEqual(new Decimal(5000));
      expect(result.averagePricePerToken).toEqual(new Decimal(5)); // 5000 / 1000
      expect(result.executionCount).toBe(10);
      expect(result.successRate).toBe(0.8); // 8/10
    });

    it('should handle zero tokens acquired', async () => {
      mockPrisma.systemBuyOrderRevenue.aggregate.mockResolvedValue({
        _sum: { amount: new Decimal(10000) },
      });

      mockPrisma.systemBuyOrderHistory.aggregate.mockResolvedValue({
        _sum: {
          tokensAcquired: new Decimal(0),
          revenueUsed: new Decimal(0),
        },
      });

      mockPrisma.systemBuyOrderHistory.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      mockPrisma.systemBuyOrderHistory.findFirst.mockResolvedValue(null);

      const result = await service.getMetrics();

      expect(result.averagePricePerToken).toEqual(new Decimal(0));
      expect(result.successRate).toBe(0);
    });
  });

  describe('configuration', () => {
    it('should update configuration', () => {
      const newConfig = {
        revenuePercentage: 0.15,
        executionSchedule: 'weekly' as const,
      };

      service.updateConfig(newConfig);

      const config = service.getConfig();
      expect(config.revenuePercentage).toBe(0.15);
      expect(config.executionSchedule).toBe('weekly');
    });

    it('should get current configuration', () => {
      const config = service.getConfig();

      expect(config.revenuePercentage).toBe(0.1);
      expect(config.executionSchedule).toBe('daily');
      expect(config.minBuyAmount).toEqual(new Decimal(100));
      expect(config.maxBuyAmount).toEqual(new Decimal(1000000));
    });
  });
});
