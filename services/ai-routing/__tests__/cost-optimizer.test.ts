/**
 * Cost Optimizer Tests
 * Tests for cost calculation, tracking, and optimization
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { CostOptimizer, TierCostConfig, CostMetrics, UserSpendingMetrics } from '../cost-optimizer';
import { RoutingTier } from '../types';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    userSpending: {
      upsert: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({})
    },
    costAlert: {
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({})
    }
  }))
}));

describe('CostOptimizer', () => {
  let optimizer: CostOptimizer;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = new PrismaClient();
    optimizer = new CostOptimizer(mockPrisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateCost', () => {
    it('should calculate cost for LOCAL_LLM tier (zero cost)', async () => {
      const cost = await optimizer.calculateCost(RoutingTier.LOCAL_LLM, 100, 200);
      expect(cost).toBe(0);
    });

    it('should calculate cost for RAP_SYSTEM tier', async () => {
      const cost = await optimizer.calculateCost(RoutingTier.RAP_SYSTEM, 100, 200);
      expect(cost).toBeGreaterThan(0);
      expect(cost).toBeLessThanOrEqual(0.05); // Max cost constraint
    });

    it('should calculate cost for EXTERNAL_LLM tier', async () => {
      const cost = await optimizer.calculateCost(RoutingTier.EXTERNAL_LLM, 100, 200);
      expect(cost).toBeGreaterThan(0);
      expect(cost).toBeLessThanOrEqual(0.10); // Max cost constraint
    });

    it('should apply minimum cost constraint', async () => {
      const cost = await optimizer.calculateCost(RoutingTier.RAP_SYSTEM, 0, 0);
      expect(cost).toBeGreaterThanOrEqual(0.001); // Min cost for RAP
    });

    it('should apply maximum cost constraint', async () => {
      const cost = await optimizer.calculateCost(RoutingTier.RAP_SYSTEM, 10000, 10000);
      expect(cost).toBeLessThanOrEqual(0.05); // Max cost for RAP
    });

    it('should calculate cost based on input tokens', async () => {
      const cost1 = await optimizer.calculateCost(RoutingTier.RAP_SYSTEM, 100, 0);
      const cost2 = await optimizer.calculateCost(RoutingTier.RAP_SYSTEM, 200, 0);
      expect(cost2).toBeGreaterThan(cost1);
    });

    it('should calculate cost based on output tokens', async () => {
      const cost1 = await optimizer.calculateCost(RoutingTier.RAP_SYSTEM, 0, 100);
      const cost2 = await optimizer.calculateCost(RoutingTier.RAP_SYSTEM, 0, 200);
      expect(cost2).toBeGreaterThan(cost1);
    });

    it('should round cost to 4 decimal places', async () => {
      const cost = await optimizer.calculateCost(RoutingTier.RAP_SYSTEM, 123, 456);
      const decimalPlaces = (cost.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(4);
    });

    it('should throw error for unknown tier', async () => {
      await expect(
        optimizer.calculateCost('UNKNOWN_TIER' as RoutingTier, 100, 200)
      ).rejects.toThrow('Unknown routing tier');
    });

    it('should handle zero tokens', async () => {
      const cost = await optimizer.calculateCost(RoutingTier.LOCAL_LLM, 0, 0);
      expect(cost).toBe(0);
    });

    it('should handle large token counts', async () => {
      const cost = await optimizer.calculateCost(RoutingTier.EXTERNAL_LLM, 100000, 100000);
      expect(cost).toBeGreaterThan(0);
      expect(cost).toBeLessThanOrEqual(0.10); // Still respects max constraint
    });
  });

  describe('trackSpending', () => {
    it('should track spending for a user', async () => {
      await optimizer.trackSpending('user-1', RoutingTier.RAP_SYSTEM, 0.02);

      const spending = await optimizer.getUserSpending('user-1');
      expect(spending).not.toBeNull();
      expect(spending?.totalSpent).toBe(0.02);
      expect(spending?.spentByTier[RoutingTier.RAP_SYSTEM]).toBe(0.02);
    });

    it('should accumulate spending for multiple queries', async () => {
      await optimizer.trackSpending('user-1', RoutingTier.RAP_SYSTEM, 0.02);
      await optimizer.trackSpending('user-1', RoutingTier.RAP_SYSTEM, 0.03);

      const spending = await optimizer.getUserSpending('user-1');
      expect(spending?.totalSpent).toBe(0.05);
      expect(spending?.queriesByTier[RoutingTier.RAP_SYSTEM]).toBe(2);
    });

    it('should track spending across different tiers', async () => {
      await optimizer.trackSpending('user-1', RoutingTier.LOCAL_LLM, 0);
      await optimizer.trackSpending('user-1', RoutingTier.RAP_SYSTEM, 0.02);
      await optimizer.trackSpending('user-1', RoutingTier.EXTERNAL_LLM, 0.05);

      const spending = await optimizer.getUserSpending('user-1');
      expect(spending?.totalSpent).toBe(0.07);
      expect(spending?.spentByTier[RoutingTier.LOCAL_LLM]).toBe(0);
      expect(spending?.spentByTier[RoutingTier.RAP_SYSTEM]).toBe(0.02);
      expect(spending?.spentByTier[RoutingTier.EXTERNAL_LLM]).toBe(0.05);
    });

    it('should track spending for multiple users independently', async () => {
      await optimizer.trackSpending('user-1', RoutingTier.RAP_SYSTEM, 0.02);
      await optimizer.trackSpending('user-2', RoutingTier.RAP_SYSTEM, 0.03);

      const spending1 = await optimizer.getUserSpending('user-1');
      const spending2 = await optimizer.getUserSpending('user-2');

      expect(spending1?.totalSpent).toBe(0.02);
      expect(spending2?.totalSpent).toBe(0.03);
    });

    it('should update tier metrics when tracking spending', async () => {
      await optimizer.trackSpending('user-1', RoutingTier.RAP_SYSTEM, 0.02);
      await optimizer.trackSpending('user-2', RoutingTier.RAP_SYSTEM, 0.03);

      const tierMetrics = await optimizer.getTierSpending(RoutingTier.RAP_SYSTEM);
      expect(tierMetrics?.totalCost).toBe(0.05);
      expect(tierMetrics?.totalQueries).toBe(2);
      expect(tierMetrics?.averageCostPerQuery).toBe(0.025);
    });

    it('should persist spending to database every 50 queries', async () => {
      for (let i = 0; i < 50; i++) {
        await optimizer.trackSpending('user-1', RoutingTier.RAP_SYSTEM, 0.01);
      }

      expect(mockPrisma.userSpending.upsert).toHaveBeenCalled();
    });
  });

  describe('getUserSpending', () => {
    it('should return null for user with no spending', async () => {
      const spending = await optimizer.getUserSpending('unknown-user');
      expect(spending).toBeNull();
    });

    it('should return spending metrics for tracked user', async () => {
      await optimizer.trackSpending('user-1', RoutingTier.RAP_SYSTEM, 0.02);

      const spending = await optimizer.getUserSpending('user-1');
      expect(spending).not.toBeNull();
      expect(spending?.userId).toBe('user-1');
      expect(spending?.totalSpent).toBe(0.02);
    });

    it('should include all tier spending in result', async () => {
      await optimizer.trackSpending('user-1', RoutingTier.LOCAL_LLM, 0);
      await optimizer.trackSpending('user-1', RoutingTier.RAP_SYSTEM, 0.02);
      await optimizer.trackSpending('user-1', RoutingTier.EXTERNAL_LLM, 0.05);

      const spending = await optimizer.getUserSpending('user-1');
      expect(spending?.spentByTier[RoutingTier.LOCAL_LLM]).toBe(0);
      expect(spending?.spentByTier[RoutingTier.RAP_SYSTEM]).toBe(0.02);
      expect(spending?.spentByTier[RoutingTier.EXTERNAL_LLM]).toBe(0.05);
    });
  });

  describe('getTierSpending', () => {
    it('should return null for tier with no spending', async () => {
      const metrics = await optimizer.getTierSpending(RoutingTier.LOCAL_LLM);
      expect(metrics?.totalCost).toBe(0);
      expect(metrics?.totalQueries).toBe(0);
    });

    it('should return spending metrics for tier', async () => {
      await optimizer.trackSpending('user-1', RoutingTier.RAP_SYSTEM, 0.02);
      await optimizer.trackSpending('user-2', RoutingTier.RAP_SYSTEM, 0.03);

      const metrics = await optimizer.getTierSpending(RoutingTier.RAP_SYSTEM);
      expect(metrics?.totalCost).toBe(0.05);
      expect(metrics?.totalQueries).toBe(2);
      expect(metrics?.averageCostPerQuery).toBe(0.025);
    });

    it('should track min and max cost per query', async () => {
      await optimizer.trackSpending('user-1', RoutingTier.RAP_SYSTEM, 0.01);
      await optimizer.trackSpending('user-2', RoutingTier.RAP_SYSTEM, 0.05);

      const metrics = await optimizer.getTierSpending(RoutingTier.RAP_SYSTEM);
      expect(metrics?.minCost).toBe(0.01);
      expect(metrics?.maxCost).toBe(0.05);
    });
  });

  describe('getSpendingMetrics', () => {
    it('should return spending for all tiers', async () => {
      await optimizer.trackSpending('user-1', RoutingTier.LOCAL_LLM, 0);
      await optimizer.trackSpending('user-1', RoutingTier.RAP_SYSTEM, 0.02);
      await optimizer.trackSpending('user-1', RoutingTier.EXTERNAL_LLM, 0.05);

      const metrics = await optimizer.getSpendingMetrics();
      expect(metrics[RoutingTier.LOCAL_LLM]).toBe(0);
      expect(metrics[RoutingTier.RAP_SYSTEM]).toBe(0.02);
      expect(metrics[RoutingTier.EXTERNAL_LLM]).toBe(0.05);
    });

    it('should return zero for tiers with no spending', async () => {
      const metrics = await optimizer.getSpendingMetrics();
      expect(metrics[RoutingTier.LOCAL_LLM]).toBe(0);
      expect(metrics[RoutingTier.RAP_SYSTEM]).toBe(0);
      expect(metrics[RoutingTier.EXTERNAL_LLM]).toBe(0);
    });
  });

  describe('getAverageCostPerQuery', () => {
    it('should return 0 for tier with no queries', async () => {
      const avg = await optimizer.getAverageCostPerQuery(RoutingTier.RAP_SYSTEM);
      expect(avg).toBe(0);
    });

    it('should calculate average cost per query', async () => {
      await optimizer.trackSpending('user-1', RoutingTier.RAP_SYSTEM, 0.02);
      await optimizer.trackSpending('user-2', RoutingTier.RAP_SYSTEM, 0.04);

      const avg = await optimizer.getAverageCostPerQuery(RoutingTier.RAP_SYSTEM);
      expect(avg).toBe(0.03);
    });
  });

  describe('getTotalCost', () => {
    it('should return 0 for tier with no spending', async () => {
      const total = await optimizer.getTotalCost(RoutingTier.RAP_SYSTEM);
      expect(total).toBe(0);
    });

    it('should return total cost for tier', async () => {
      await optimizer.trackSpending('user-1', RoutingTier.RAP_SYSTEM, 0.02);
      await optimizer.trackSpending('user-2', RoutingTier.RAP_SYSTEM, 0.03);

      const total = await optimizer.getTotalCost(RoutingTier.RAP_SYSTEM);
      expect(total).toBe(0.05);
    });
  });

  describe('getTotalQueries', () => {
    it('should return 0 for tier with no queries', async () => {
      const total = await optimizer.getTotalQueries(RoutingTier.RAP_SYSTEM);
      expect(total).toBe(0);
    });

    it('should return total queries for tier', async () => {
      await optimizer.trackSpending('user-1', RoutingTier.RAP_SYSTEM, 0.02);
      await optimizer.trackSpending('user-2', RoutingTier.RAP_SYSTEM, 0.03);

      const total = await optimizer.getTotalQueries(RoutingTier.RAP_SYSTEM);
      expect(total).toBe(2);
    });
  });

  describe('shouldRejectQuery', () => {
    it('should not reject query within tier max cost', async () => {
      const shouldReject = await optimizer.shouldRejectQuery(RoutingTier.RAP_SYSTEM, 0.02);
      expect(shouldReject).toBe(false);
    });

    it('should reject query exceeding tier max cost', async () => {
      const shouldReject = await optimizer.shouldRejectQuery(RoutingTier.RAP_SYSTEM, 0.10);
      expect(shouldReject).toBe(true);
    });

    it('should reject query exceeding user budget', async () => {
      const shouldReject = await optimizer.shouldRejectQuery(
        RoutingTier.RAP_SYSTEM,
        0.02,
        0.01 // User budget
      );
      expect(shouldReject).toBe(true);
    });

    it('should not reject query within user budget', async () => {
      const shouldReject = await optimizer.shouldRejectQuery(
        RoutingTier.RAP_SYSTEM,
        0.02,
        0.05 // User budget
      );
      expect(shouldReject).toBe(false);
    });

    it('should handle undefined user budget', async () => {
      const shouldReject = await optimizer.shouldRejectQuery(
        RoutingTier.RAP_SYSTEM,
        0.02,
        undefined
      );
      expect(shouldReject).toBe(f