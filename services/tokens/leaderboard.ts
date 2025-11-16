/**
 * Leaderboard Service
 * Manages global, friend, and class leaderboards
 */

import { PrismaClient, LeaderboardType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { logger } from '../shared/logging';
import { ErrorHandler } from '../payment/error-handler';

const prisma = new PrismaClient();

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  score: Decimal;
  position: number; // Current position
}

export interface LeaderboardResponse {
  type: LeaderboardType;
  period: string;
  entries: LeaderboardEntry[];
  userRank?: number;
  userScore?: Decimal;
}

export class LeaderboardService {
  /**
   * Update leaderboard for a user
   */
  async updateLeaderboard(
    userId: string,
    score: Decimal,
    leaderboardType: LeaderboardType = 'GLOBAL',
    period: string = 'global'
  ): Promise<void> {
    try {
      logger.info('Updating leaderboard', { userId, score: score.toString(), leaderboardType });

      // Upsert leaderboard entry
      await prisma.leaderboardEntry.upsert({
        where: {
          userId_leaderboardType_period: {
            userId,
            leaderboardType,
            period,
          },
        },
        update: { score },
        create: {
          userId,
          score,
          leaderboardType,
          period,
          rank: 0, // Will be updated by recalculation
        },
      });

      // Recalculate ranks
      await this.recalculateRanks(leaderboardType, period);
    } catch (error) {
      logger.error('Failed to update leaderboard', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Recalculate ranks for a leaderboard
   */
  private async recalculateRanks(leaderboardType: LeaderboardType, period: string): Promise<void> {
    try {
      const entries = await prisma.leaderboardEntry.findMany({
        where: { leaderboardType, period },
        orderBy: { score: 'desc' },
      });

      // Update ranks
      for (let i = 0; i < entries.length; i++) {
        await prisma.leaderboardEntry.update({
          where: { id: entries[i].id },
          data: { rank: i + 1 },
        });
      }

      logger.debug('Leaderboard ranks recalculated', { leaderboardType, period, count: entries.length });
    } catch (error) {
      logger.error('Failed to recalculate ranks', { error, leaderboardType, period });
    }
  }

  /**
   * Get global leaderboard
   */
  async getGlobalLeaderboard(limit: number = 100): Promise<LeaderboardResponse> {
    try {
      logger.info('Getting global leaderboard', { limit });

      const entries = await prisma.leaderboardEntry.findMany({
        where: {
          leaderboardType: 'GLOBAL',
          period: 'global',
        },
        orderBy: { rank: 'asc' },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        type: 'GLOBAL',
        period: 'global',
        entries: entries.map((e) => ({
          rank: e.rank,
          userId: e.userId,
          userName: e.user.name,
          score: e.score,
          position: e.rank,
        })),
      };
    } catch (error) {
      logger.error('Failed to get global leaderboard', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get friend leaderboard
   */
  async getFriendLeaderboard(userId: string, limit: number = 50): Promise<LeaderboardResponse> {
    try {
      logger.info('Getting friend leaderboard', { userId, limit });

      // Get user's friends (simplified - in real app would use a friends table)
      // For now, return top users as "friends"
      const entries = await prisma.leaderboardEntry.findMany({
        where: {
          leaderboardType: 'FRIENDS',
          period: 'global',
        },
        orderBy: { rank: 'asc' },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Get user's rank
      const userEntry = await prisma.leaderboardEntry.findFirst({
        where: {
          userId,
          leaderboardType: 'FRIENDS',
          period: 'global',
        },
      });

      return {
        type: 'FRIENDS',
        period: 'global',
        entries: entries.map((e) => ({
          rank: e.rank,
          userId: e.userId,
          userName: e.user.name,
          score: e.score,
          position: e.rank,
        })),
        userRank: userEntry?.rank,
        userScore: userEntry?.score,
      };
    } catch (error) {
      logger.error('Failed to get friend leaderboard', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get class leaderboard
   */
  async getClassLeaderboard(classId: string, limit: number = 50): Promise<LeaderboardResponse> {
    try {
      logger.info('Getting class leaderboard', { classId, limit });

      const entries = await prisma.leaderboardEntry.findMany({
        where: {
          leaderboardType: 'CLASS',
          period: classId,
        },
        orderBy: { rank: 'asc' },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        type: 'CLASS',
        period: classId,
        entries: entries.map((e) => ({
          rank: e.rank,
          userId: e.userId,
          userName: e.user.name,
          score: e.score,
          position: e.rank,
        })),
      };
    } catch (error) {
      logger.error('Failed to get class leaderboard', { error, classId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get user's rank
   */
  async getUserRank(
    userId: string,
    leaderboardType: LeaderboardType = 'GLOBAL',
    period: string = 'global'
  ): Promise<{ rank: number; score: Decimal } | null> {
    try {
      const entry = await prisma.leaderboardEntry.findFirst({
        where: {
          userId,
          leaderboardType,
          period,
        },
      });

      if (!entry) {
        return null;
      }

      return {
        rank: entry.rank,
        score: entry.score,
      };
    } catch (error) {
      logger.error('Failed to get user rank', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get top users
   */
  async getTopUsers(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const entries = await prisma.leaderboardEntry.findMany({
        where: {
          leaderboardType: 'GLOBAL',
          period: 'global',
        },
        orderBy: { rank: 'asc' },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return entries.map((e) => ({
        rank: e.rank,
        userId: e.userId,
        userName: e.user.name,
        score: e.score,
        position: e.rank,
      }));
    } catch (error) {
      logger.error('Failed to get top users', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get leaderboard statistics
   */
  async getLeaderboardStats(): Promise<{
    totalUsers: number;
    topScore: Decimal;
    averageScore: Decimal;
    medianScore: Decimal;
  }> {
    try {
      const entries = await prisma.leaderboardEntry.findMany({
        where: {
          leaderboardType: 'GLOBAL',
          period: 'global',
        },
        select: { score: true },
        orderBy: { score: 'desc' },
      });

      if (entries.length === 0) {
        return {
          totalUsers: 0,
          topScore: new Decimal(0),
          averageScore: new Decimal(0),
          medianScore: new Decimal(0),
        };
      }

      const scores = entries.map((e) => e.score);
      const topScore = scores[0];
      const averageScore = scores.reduce((sum, s) => sum.plus(s), new Decimal(0)).dividedBy(scores.length);
      const medianScore = scores[Math.floor(scores.length / 2)];

      return {
        totalUsers: entries.length,
        topScore,
        averageScore,
        medianScore,
      };
    } catch (error) {
      logger.error('Failed to get leaderboard stats', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Clear leaderboard (for testing or reset)
   */
  async clearLeaderboard(leaderboardType: LeaderboardType, period: string): Promise<void> {
    try {
      logger.warn('Clearing leaderboard', { leaderboardType, period });

      await prisma.leaderboardEntry.deleteMany({
        where: { leaderboardType, period },
      });

      logger.info('Leaderboard cleared', { leaderboardType, period });
    } catch (error) {
      logger.error('Failed to clear leaderboard', { error });
      throw ErrorHandler.handle(error);
    }
  }
}

export default new LeaderboardService();
