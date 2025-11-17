/**
 * Leaderboard Updater Service Tests
 * Tests for leaderboard ranking updates based on ownership percentage
 */

import { Decimal } from '@prisma/client/runtime/library';
import { PrismaClient } from '@prisma/client';
import { LeaderboardUpdater } from '../leaderboard-updater';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    tokenBalance: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    tokenSupply: {
      findFirst: jest.fn(),
    },
    leaderboardEntry: {
      upsert: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

describe('LeaderboardUpdater', () => {
  let leaderboardUpdater: LeaderboardUpdater;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient();
    leaderboardUpdater = new LeaderboardUpdater();
  });

  describe('updateLeaderboardRankings', () => {
    it('should update leaderboard rankings based on ownership percentage', async () => {
      const totalSupply = new Decimal('1000000');

      // Mock token balances
      mockPrisma.tokenBalance.findMany.mockResolvedValue([
        { userId: 'user-1', balance: new Decimal('500000') },
        { userId: 'user-2', balance: new Decimal('300000') },
        { userId: 'user-3', balance: new Decimal('200000') },
      ]);

      // Mock token supply
      mockPrisma.tokenSupply.findFirst.mockResolvedValue({
        circulatingSupply: totalSupply,
      });

      // Mock leaderboard entries
      mockPrisma.leaderboardEntry.findFirst.mockResolvedValue(null);
      mockPrisma.leaderboardEntry.upsert.mockResolvedValue({
        id: 'entry-1',
        userId: 'user-1',
        rank: 1,
        score: new Decimal('50'),
      });

      const results = await leaderboardUpdater.updateLeaderboardRankings();

      expect(results).toHaveLength(3);
      expect(results[0].userId).toBe('user-1');
      expect(results[0].newRank).toBe(1);
      expect(results[0].ownershipPercentage).toBe(50);
      expect(results[1].userId).toBe('user-2');
      expect(results[1].newRank).toBe(2);
      expect(results[1].ownershipPercentage).toBe(30);
      expect(results[2].userId).toBe('user-3');
      expect(results[2].newRank).toBe(3);
      expect(results[2].ownershipPercentage).toBe(20);
    });

    it('should detect ranking changes', async () => {
      const totalSupply = new Decimal('1000000');

      mockPrisma.tokenBalance.findMany.mockResolvedValue([
        { userId: 'user-1', balance: new Decimal('600000') },
        { userId: 'user-2', balance: new Decimal('400000') },
      ]);

      mockPrisma.tokenSupply.findFirst.mockResolvedValue({
        circulatingSupply: totalSupply,
      });

      // Mock previous rankings
      mockPrisma.leaderboardEntry.findFirst
        .mockResolvedValueOnce({ rank: 2 }) // user-1 was rank 2
        .mockResolvedValueOnce({ rank: 1 }); // user-2 was rank 1

      mockPrisma.leaderboardEntry.upsert.mockResolvedValue({
        id: 'entry-1',
        userId: 'user-1',
        rank: 1,
        score: new Decimal('60'),
      });

      const results = await leaderboardUpdater.updateLeaderboardRankings();

      expect(results[0].changed).toBe(true);
      expect(results[0].previousRank).toBe(2);
      expect(results[0].newRank).toBe(1);
      expect(results[1].changed).toBe(true);
      expect(results[1].previousRank).toBe(1);
      expect(results[1].newRank).toBe(2);
    });

    it('should handle zero total supply gracefully', async () => {
      mockPrisma.tokenSupply.findFirst.mockResolvedValue({
        circulatingSupply: new Decimal('0'),
      });

      const results = await leaderboardUpdater.updateLeaderboardRankings();

      expect(results).toHaveLength(0);
    });

    it('should handle no token balances', async () => {
      mockPrisma.tokenBalance.findMany.mockResolvedValue([]);
      mockPrisma.tokenSupply.findFirst.mockResolvedValue({
        circulatingSupply: new Decimal('1000000'),
      });

      const results = await leaderboardUpdater.updateLeaderboardRankings();

      expect(results).toHaveLength(0);
    });
  });

  describe('getUserRankingInfo', () => {
    it('should return user ranking info with ownership percentage', async () => {
      const userId = 'user-1';
      const userTokens = new Decimal('500000');
      const totalSupply = new Decimal('1000000');

      mockPrisma.tokenBalance.findUnique.mockResolvedValue({
        userId,
        balance: userTokens,
      });

      mockPrisma.tokenSupply.findFirst.mockResolvedValue({
        circulatingSupply: totalSupply,
      });

      mockPrisma.leaderboardEntry.findFirst.mockResolvedValue({
        userId,
        rank: 1,
        score: new Decimal('50'),
      });

      const result = await leaderboardUpdater.getUserRankingInfo(userId);

      expect(result).not.toBeNull();
      expect(result?.rank).toBe(1);
      expect(result?.ownershipPercentage).toBe(50);
      expect(result?.userTokens).toEqual(userTokens);
      expect(result?.totalSupply).toEqual(totalSupply);
    });

    it('should return null if user has no token balance', async () => {
      mockPrisma.tokenBalance.findUnique.mockResolvedValue(null);

      const result = await leaderboardUpdater.getUserRankingInfo('user-1');

      expect(result).toBeNull();
    });

    it('should return null if user has no leaderboard entry', async () => {
      mockPrisma.tokenBalance.findUnique.mockResolvedValue({
        userId: 'user-1',
        balance: new Decimal('100000'),
      });

      mockPrisma.tokenSupply.findFirst.mockResolvedValue({
        circulatingSupply: new Decimal('1000000'),
      });

      mockPrisma.leaderboardEntry.findFirst.mockResolvedValue(null);

      const result = await leaderboardUpdater.getUserRankingInfo('user-1');

      expect(result).toBeNull();
    });
  });

  describe('getTopUsersByOwnership', () => {
    it('should return top users sorted by ownership percentage', async () => {
      mockPrisma.leaderboardEntry.findMany.mockResolvedValue([
        {
          rank: 1,
          userId: 'user-1',
          score: new Decimal('50'),
          user: { tokenBalance: { balance: new Decimal('500000') } },
        },
        {
          rank: 2,
          userId: 'user-2',
          score: new Decimal('30'),
          user: { tokenBalance: { balance: new Decimal('300000') } },
        },
        {
          rank: 3,
          userId: 'user-3',
          score: new Decimal('20'),
          user: { tokenBalance: { balance: new Decimal('200000') } },
        },
      ]);

      const results = await leaderboardUpdater.getTopUsersByOwnership(3);

      expect(results).toHaveLength(3);
      expect(results[0].rank).toBe(1);
      expect(results[0].ownershipPercentage).toBe(50);
      expect(results[1].rank).toBe(2);
      expect(results[1].ownershipPercentage).toBe(30);
    });

    it('should respect limit parameter', async () => {
      mockPrisma.leaderboardEntry.findMany.mockResolvedValue([
        {
          rank: 1,
          userId: 'user-1',
          score: new Decimal('50'),
          user: { tokenBalance: { balance: new Decimal('500000') } },
        },
      ]);

      const results = await leaderboardUpdater.getTopUsersByOwnership(1);

      expect(results).toHaveLength(1);
      expect(mockPrisma.leaderboardEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 1 })
      );
    });
  });

  describe('getRankingStatistics', () => {
    it('should calculate ranking statistics correctly', async () => {
      mockPrisma.leaderboardEntry.findMany.mockResolvedValue([
        { score: new Decimal('50') },
        { score: new Decimal('30') },
        { score: new Decimal('20') },
      ]);

      const stats = await leaderboardUpdater.getRankingStatistics();

      expect(stats.totalUsers).toBe(3);
      expect(stats.topOwnershipPercentage).toBe(50);
      expect(stats.averageOwnershipPercentage).toBeCloseTo(33.33, 1);
      expect(stats.medianOwnershipPercentage).toBe(30);
      expect(stats.giniCoefficient).toBeGreaterThan(0);
      expect(stats.giniCoefficient).toBeLessThan(1);
    });

    it('should handle empty leaderboard', async () => {
      mockPrisma.leaderboardEntry.findMany.mockResolvedValue([]);

      const stats = await leaderboardUpdater.getRankingStatistics();

      expect(stats.totalUsers).toBe(0);
      expect(stats.topOwnershipPercentage).toBe(0);
      expect(stats.averageOwnershipPercentage).toBe(0);
      expect(stats.medianOwnershipPercentage).toBe(0);
      expect(stats.giniCoefficient).toBe(0);
    });

    it('should calculate Gini coefficient for inequality measurement', async () => {
      // Perfect equality: all have same ownership
      mockPrisma.leaderboardEntry.findMany.mockResolvedValue([
        { score: new Decimal('25') },
        { score: new Decimal('25') },
        { score: new Decimal('25') },
        { score: new Decimal('25') },
      ]);

      const stats = await leaderboardUpdater.getRankingStatistics();

      expect(stats.giniCoefficient).toBe(0);
    });
  });

  describe('getUserRankingPercentile', () => {
    it('should calculate user ranking percentile correctly', async () => {
      mockPrisma.leaderboardEntry.findFirst.mockResolvedValue({
        userId: 'user-1',
        rank: 10,
      });

      mockPrisma.leaderboardEntry.count.mockResolvedValue(100);

      const percentile = await leaderboardUpdater.getUserRankingPercentile('user-1');

      expect(percentile).toBe(90); // (100 - 10) / 100 * 100 = 90%
    });

    it('should return null if user not found', async () => {
      mockPrisma.leaderboardEntry.findFirst.mockResolvedValue(null);

      const percentile = await leaderboardUpdater.getUserRankingPercentile('user-1');

      expect(percentile).toBeNull();
    });

    it('should handle top ranked user', async () => {
      mockPrisma.leaderboardEntry.findFirst.mockResolvedValue({
        userId: 'user-1',
        rank: 1,
      });

      mockPrisma.leaderboardEntry.count.mockResolvedValue(100);

      const percentile = await leaderboardUpdater.getUserRankingPercentile('user-1');

      expect(percentile).toBe(99); // (100 - 1) / 100 * 100 = 99%
    });
  });

  describe('getUserRankingHistory', () => {
    it('should retrieve user ranking history for specified period', async () => {
      const userId = 'user-1';
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      mockPrisma.leaderboardEntry.findMany.mockResolvedValue([
        {
          rank: 5,
          score: new Decimal('20'),
          updatedAt: thirtyDaysAgo,
        },
        {
          rank: 3,
          score: new Decimal('30'),
          updatedAt: new Date(thirtyDaysAgo.getTime() + 15 * 24 * 60 * 60 * 1000),
        },
        {
          rank: 1,
          score: new Decimal('50'),
          updatedAt: now,
        },
      ]);

      const history = await leaderboardUpdater.getUserRankingHistory(userId, 30);

      expect(history).toHaveLength(3);
      expect(history[0].rank).toBe(5);
      expect(history[1].rank).toBe(3);
      expect(history[2].rank).toBe(1);
      expect(history[2].ownershipPercentage).toBe(50);
    });

    it('should handle empty history', async () => {
      mockPrisma.leaderboardEntry.findMany.mockResolvedValue([]);

      const history = await leaderboardUpdater.getUserRankingHistory('user-1', 30);

      expect(history).toHaveLength(0);
    });
  });

  describe('rebuildAllRankings', () => {
    it('should clear and rebuild all rankings', async () => {
      mockPrisma.leaderboardEntry.deleteMany.mockResolvedValue({ count: 100 });
      mockPrisma.tokenBalance.findMany.mockResolvedValue([
        { userId: 'user-1', balance: new Decimal('500000') },
        { userId: 'user-2', balance: new Decimal('300000') },
      ]);
      mockPrisma.tokenSupply.findFirst.mockResolvedValue({
        circulatingSupply: new Decimal('1000000'),
      });
      mockPrisma.leaderboardEntry.findFirst.mockResolvedValue(null);
      mockPrisma.leaderboardEntry.upsert.mockResolvedValue({
        id: 'entry-1',
        userId: 'user-1',
        rank: 1,
      });

      await leaderboardUpdater.rebuildAllRankings();

      expect(mockPrisma.leaderboardEntry.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.leaderboardEntry.upsert).toHaveBeenCalled();
    });
  });

  describe('Ownership percentage calculation', () => {
    it('should calculate ownership percentage with high precision', async () => {
      const userTokens = new Decimal('123456.789');
      const totalSupply = new Decimal('1000000');

      mockPrisma.tokenBalance.findMany.mockResolvedValue([
        { userId: 'user-1', balance: userTokens },
      ]);

      mockPrisma.tokenSupply.findFirst.mockResolvedValue({
        circulatingSupply: totalSupply,
      });

      mockPrisma.leaderboardEntry.findFirst.mockResolvedValue(null);
      mockPrisma.leaderboardEntry.upsert.mockResolvedValue({
        id: 'entry-1',
        userId: 'user-1',
        rank: 1,
        score: new Decimal('12.3456789'),
      });

      const results = await leaderboardUpdater.updateLeaderboardRankings();

      expect(results[0].ownershipPercentage).toBeCloseTo(12.3456789, 4);
    });

    it('should handle very small ownership percentages', async () => {
      const userTokens = new Decimal('1');
      const totalSupply = new Decimal('1000000');

      mockPrisma.tokenBalance.findMany.mockResolvedValue([
        { userId: 'user-1', balance: userTokens },
      ]);

      mockPrisma.tokenSupply.findFirst.mockResolvedValue({
        circulatingSupply: totalSupply,
      });

      mockPrisma.leaderboardEntry.findFirst.mockResolvedValue(null);
      mockPrisma.leaderboardEntry.upsert.mockResolvedValue({
        id: 'entry-1',
        userId: 'user-1',
        rank: 1,
        score: new Decimal('0.0001'),
      });

      const results = await leaderboardUpdater.updateLeaderboardRankings();

      expect(results[0].ownershipPercentage).toBeCloseTo(0.0001, 4);
    });
  });

  describe('Ranking stability', () => {
    it('should maintain stable rankings when no changes occur', async () => {
      const totalSupply = new Decimal('1000000');

      mockPrisma.tokenBalance.findMany.mockResolvedValue([
        { userId: 'user-1', balance: new Decimal('500000') },
        { userId: 'user-2', balance: new Decimal('300000') },
        { userId: 'user-3', balance: new Decimal('200000') },
      ]);

      mockPrisma.tokenSupply.findFirst.mockResolvedValue({
        circulatingSupply: totalSupply,
      });

      // All users already have correct rankings
      mockPrisma.leaderboardEntry.findFirst
        .mockResolvedValueOnce({ rank: 1 })
        .mockResolvedValueOnce({ rank: 2 })
        .mockResolvedValueOnce({ rank: 3 });

      mockPrisma.leaderboardEntry.upsert.mockResolvedValue({
        id: 'entry-1',
        userId: 'user-1',
        rank: 1,
      });

      const results = await leaderboardUpdater.updateLeaderboardRankings();

      expect(results[0].changed).toBe(false);
      expect(results[1].changed).toBe(false);
      expect(results[2].changed).toBe(false);
    });
  });
});
