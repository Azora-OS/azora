import { conversionMetricsService } from '../conversion-metrics.service';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    user: {
      groupBy: jest.fn(),
      count: jest.fn(),
    },
    payment: {
      aggregate: jest.fn(),
    },
  })),
}));

describe('ConversionMetricsService', () => {
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient();
  });

  describe('getConversionMetrics', () => {
    it('should calculate conversion metrics for a given period', async () => {
      // Mock user counts by tier
      mockPrisma.user.groupBy.mockResolvedValue([
        { tier: 'free', _count: { id: 100 } },
        { tier: 'premium', _count: { id: 30 } },
        { tier: 'pro', _count: { id: 5 } },
      ]);

      mockPrisma.user.count.mockResolvedValue(135);
      mockPrisma.payment.aggregate.mockResolvedValue({
        _avg: { amount: 50 },
        _sum: { amount: 6750 },
        _count: { id: 135 },
      });

      const metrics = await conversionMetricsService.getConversionMetrics('2024-01');

      expect(metrics).toHaveProperty('period', '2024-01');
      expect(metrics).toHaveProperty('freeUsers', 100);
      expect(metrics).toHaveProperty('premiumUsers', 30);
      expect(metrics).toHaveProperty('proUsers', 5);
      expect(metrics).toHaveProperty('conversionRate');
      expect(metrics).toHaveProperty('churnRate');
      expect(metrics).toHaveProperty('lifetimeValue');
      expect(metrics).toHaveProperty('customerAcquisitionCost');
      expect(metrics).toHaveProperty('paybackPeriod');
    });

    it('should handle quarter format period', async () => {
      mockPrisma.user.groupBy.mockResolvedValue([
        { tier: 'free', _count: { id: 100 } },
        { tier: 'premium', _count: { id: 30 } },
      ]);

      mockPrisma.user.count.mockResolvedValue(130);
      mockPrisma.payment.aggregate.mockResolvedValue({
        _avg: { amount: 50 },
        _sum: { amount: 6500 },
        _count: { id: 130 },
      });

      const metrics = await conversionMetricsService.getConversionMetrics('2024-Q1');

      expect(metrics.period).toBe('2024-Q1');
    });

    it('should handle year format period', async () => {
      mockPrisma.user.groupBy.mockResolvedValue([
        { tier: 'free', _count: { id: 1000 } },
        { tier: 'premium', _count: { id: 300 } },
      ]);

      mockPrisma.user.count.mockResolvedValue(1300);
      mockPrisma.payment.aggregate.mockResolvedValue({
        _avg: { amount: 50 },
        _sum: { amount: 65000 },
        _count: { id: 1300 },
      });

      const metrics = await conversionMetricsService.getConversionMetrics('2024');

      expect(metrics.period).toBe('2024');
    });

    it('should calculate conversion rate correctly', async () => {
      mockPrisma.user.groupBy.mockResolvedValue([
        { tier: 'free', _count: { id: 70 } },
        { tier: 'premium', _count: { id: 30 } },
      ]);

      mockPrisma.user.count.mockResolvedValue(100);
      mockPrisma.payment.aggregate.mockResolvedValue({
        _avg: { amount: 50 },
        _sum: { amount: 5000 },
        _count: { id: 100 },
      });

      const metrics = await conversionMetricsService.getConversionMetrics('2024-01');

      // Conversion rate should be 30 / (70 + 30) * 100 = 30%
      expect(metrics.conversionRate).toBeCloseTo(30, 1);
    });

    it('should return 0 for conversion rate when no users', async () => {
      mockPrisma.user.groupBy.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);
      mockPrisma.payment.aggregate.mockResolvedValue({
        _avg: { amount: 0 },
        _sum: { amount: 0 },
        _count: { id: 0 },
      });

      const metrics = await conversionMetricsService.getConversionMetrics('2024-01');

      expect(metrics.conversionRate).toBe(0);
      expect(metrics.lifetimeValue).toBe(0);
    });
  });

  describe('Period parsing', () => {
    it('should parse month format correctly', async () => {
      mockPrisma.user.groupBy.mockResolvedValue([
        { tier: 'free', _count: { id: 100 } },
      ]);

      mockPrisma.user.count.mockResolvedValue(100);
      mockPrisma.payment.aggregate.mockResolvedValue({
        _avg: { amount: 0 },
        _sum: { amount: 0 },
        _count: { id: 0 },
      });

      const metrics = await conversionMetricsService.getConversionMetrics('2024-01');
      expect(metrics.period).toBe('2024-01');
    });

    it('should parse quarter format correctly', async () => {
      mockPrisma.user.groupBy.mockResolvedValue([
        { tier: 'free', _count: { id: 100 } },
      ]);

      mockPrisma.user.count.mockResolvedValue(100);
      mockPrisma.payment.aggregate.mockResolvedValue({
        _avg: { amount: 0 },
        _sum: { amount: 0 },
        _count: { id: 0 },
      });

      const metrics = await conversionMetricsService.getConversionMetrics('2024-Q2');
      expect(metrics.period).toBe('2024-Q2');
    });

    it('should parse year format correctly', async () => {
      mockPrisma.user.groupBy.mockResolvedValue([
        { tier: 'free', _count: { id: 100 } },
      ]);

      mockPrisma.user.count.mockResolvedValue(100);
      mockPrisma.payment.aggregate.mockResolvedValue({
        _avg: { amount: 0 },
        _sum: { amount: 0 },
        _count: { id: 0 },
      });

      const metrics = await conversionMetricsService.getConversionMetrics('2024');
      expect(metrics.period).toBe('2024');
    });
  });
});
