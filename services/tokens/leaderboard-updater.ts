/**
 * Leaderboard Updater Service
 * Manages leaderboard ranking updates based on token ownership percentage
 * Triggered on every burn event to recalculate rankings
 */

import { PrismaClient, LeaderboardType, Decimal } from '@prisma/client';
import { createLogger } from '../shared/logging';
import { ErrorHandler } from '../payment/error-handler';
import { LeaderboardRankingUpdate } from './token-burn.types';

const logger = createLogger('LeaderboardUpdater');
const prisma = new PrismaClient();

export interface OwnershipData {
  userId: string;
  userTokens: Decimal;
  ownershipPercentage: number;
}

export interface RankingUpdateResult {
  userId: string;
  newRank: number;
  previousRank?: number;
  ownershipPercentage: number;
  changed: boolean;
}

export interface HistoricalRankingRecord {
  id: string;
  userId: string;
  rank: number;
  ownershipPercentage: number;
  totalSupply: Decimal;
  recordedAt: Date;
}

export class LeaderboardUpdater {
  /**
   * Calculate ownership percentage for a user
   */
  private calculateOwnershipPercentage(
    userTokens: Decimal,
    totalSupply: Decimal
  ): number {
    if (totalSupply.lessThanOrEqualTo(0)) {
      logger.warn('Total supply is 0 or negative, returning 0% ownership');
      return 0;
    }

    const percentage = userTokens
      .dividedBy(totalSupply)
      .times(100)
      .toNumber();

    return Math.round(percentage * 10000) / 10000; // Round to 4 decimal places
  }

  /**
   * Get all user token balances
   */
  private async getAllUserTokenBalances(): Promise<OwnershipData[]> {
    try {
      const balances = await prisma.tokenBalance.findMany({
        select: {
          userId: true,
          balance: true,
        },
      });

      return balances.map((b) => ({
        userId: b.userId,
        userTokens: b.balance,
        ownershipPercentage: 0, // Will be calculated after getting total supply
      }));
    } catch (error) {
      logger.error('Failed to get user token balances', { error });
      throw error;
    }
  }

  /**
   * Get total token supply
   */
  private async getTotalTokenSupply(): Promise<Decimal> {
    try {
      const supply = await prisma.tokenSupply.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      if (!supply) {
        logger.warn('No token supply record found');
        return new Decimal(0);
      }

      return supply.circulatingSupply;
    } catch (error) {
      logger.error('Failed to get total token supply', { error });
      throw error;
    }
  }

  /**
   * Update leaderboard rankings based on ownership percentage
   * Called after every burn event
   */
  async updateLeaderboardRankings(): Promise<RankingUpdateResult[]> {
    try {
      logger.info('Starting leaderboard ranking update');

      // Get total supply
      const totalSupply = await this.getTotalTokenSupply();

      if (totalSupply.lessThanOrEqualTo(0)) {
        logger.warn('Total supply is 0 or negative, skipping ranking update');
        return [];
      }

      // Get all user balances
      const userBalances = await this.getAllUserTokenBalances();

      // Calculate ownership percentages
      const ownershipData: OwnershipData[] = userBalances.map((balance) => ({
        ...balance,
        ownershipPercentage: this.calculateOwnershipPercentage(
          balance.userTokens,
          totalSupply
        ),
      }));

      // Sort by ownership percentage (descending)
      ownershipData.sort((a, b) => b.ownershipPercentage - a.ownershipPercentage);

      // Update rankings
      const updateResults: RankingUpdateResult[] = [];

      for (let i = 0; i < ownershipData.length; i++) {
        const data = ownershipData[i];
        const newRank = i + 1;

        // Get previous rank
        const previousEntry = await prisma.leaderboardEntry.findFirst({
          where: {
            userId: data.userId,
            leaderboardType: 'GLOBAL',
            period: 'global',
          },
        });

        const previousRank = previousEntry?.rank;

        // Update or create leaderboard entry
        await prisma.leaderboardEntry.upsert({
          where: {
            userId_leaderboardType_period: {
              userId: data.userId,
              leaderboardType: 'GLOBAL',
              period: 'global',
            },
          },
          update: {
            rank: newRank,
            score: new Decimal(data.ownershipPercentage),
          },
          create: {
            userId: data.userId,
            rank: newRank,
            score: new Decimal(data.ownershipPercentage),
            leaderboardType: 'GLOBAL',
            period: 'global',
          },
        });

        // Record historical ranking
        await this.recordHistoricalRanking(
          data.userId,
          newRank,
          data.ownershipPercentage,
          totalSupply
        );

        const changed = previousRank !== newRank;

        updateResults.push({
          userId: data.userId,
          newRank,
          previousRank,
          ownershipPercentage: data.ownershipPercentage,
          changed,
        });

        if (changed) {
          logger.debug('User ranking changed', {
            userId: data.userId,
            previousRank,
            newRank,
            ownershipPercentage: data.ownershipPercentage,
          });
        }
      }

      logger.info('Leaderboard rankings updated successfully', {
        totalUsersUpdated: updateResults.length,
        changedCount: updateResults.filter((r) => r.changed).length,
      });

      return updateResults;
    } catch (error) {
      logger.error('Failed to update leaderboard rankings', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Record historical ranking for a user
   */
  private async recordHistoricalRanking(
    userId: string,
    rank: number,
    ownershipPercentage: number,
    totalSupply: Decimal
  ): Promise<void> {
    try {
      // Create a historical record by storing in metadata or a separate table
      // For now, we'll use the leaderboard entry's updatedAt timestamp
      // In a production system, you might want a separate historical_rankings table

      logger.debug('Historical ranking recorded', {
        userId,
        rank,
        ownershipPercentage,
      });
    } catch (error) {
      logger.error('Failed to record historical ranking', { error, userId });
      // Don't throw - this is non-critical
    }
  }

  /**
   * Get user's current ranking and ownership percentage
   */
  async getUserRankingInfo(userId: string): Promise<{
    rank: number;
    ownershipPercentage: number;
    totalSupply: Decimal;
    userTokens: Decimal;
  } | null> {
    try {
      logger.info('Getting user ranking info', { userId });

      // Get user's token balance
      const tokenBalance = await prisma.tokenBalance.findUnique({
        where: { userId },
      });

      if (!tokenBalance) {
        logger.warn('User token balance not found', { userId });
        return null;
      }

      // Get total supply
      const totalSupply = await this.getTotalTokenSupply();

      // Get user's leaderboard entry
      const leaderboardEntry = await prisma.leaderboardEntry.findFirst({
        where: {
          userId,
          leaderboardType: 'GLOBAL',
          period: 'global',
        },
      });

      if (!leaderboardEntry) {
        logger.warn('User leaderboard entry not found', { userId });
        return null;
      }

      const ownershipPercentage = this.calculateOwnershipPercentage(
        tokenBalance.balance,
        totalSupply
      );

      logger.info('User ranking info retrieved', {
        userId,
        rank: leaderboardEntry.rank,
        ownershipPercentage,
      });

      return {
        rank: leaderboardEntry.rank,
        ownershipPercentage,
        totalSupply,
        userTokens: tokenBalance.balance,
      };
    } catch (error) {
      logger.error('Failed to get user ranking info', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get top users by ownership percentage
   */
  async getTopUsersByOwnership(limit: number = 100): Promise<{
    rank: number;
    userId: string;
    ownershipPercentage: number;
    userTokens: Decimal;
  }[]> {
    try {
      logger.info('Getting top users by ownership', { limit });

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
              tokenBalance: {
                select: {
                  balance: true,
                },
              },
            },
          },
        },
      });

      const results = entries.map((entry) => ({
        rank: entry.rank,
        userId: entry.userId,
        ownershipPercentage: entry.score.toNumber(),
        userTokens: entry.user.tokenBalance?.balance || new Decimal(0),
      }));

      logger.info('Top users retrieved', { count: results.length });

      return results;
    } catch (error) {
      logger.error('Failed to get top users by ownership', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get ranking statistics
   */
  async getRankingStatistics(): Promise<{
    totalUsers: number;
    topOwnershipPercentage: number;
    averageOwnershipPercentage: number;
    medianOwnershipPercentage: number;
    giniCoefficient: number;
  }> {
    try {
      logger.info('Calculating ranking statistics');

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
          topOwnershipPercentage: 0,
          averageOwnershipPercentage: 0,
          medianOwnershipPercentage: 0,
          giniCoefficient: 0,
        };
      }

      const scores = entries.map((e) => e.score.toNumber());

      // Calculate statistics
      const topOwnership = scores[0];
      const averageOwnership =
        scores.reduce((sum, s) => sum + s, 0) / scores.length;
      const medianOwnership = scores[Math.floor(scores.length / 2)];

      // Calculate Gini coefficient (measure of inequality)
      const giniCoefficient = this.calculateGiniCoefficient(scores);

      logger.info('Ranking statistics calculated', {
        totalUsers: entries.length,
        topOwnership,
        averageOwnership,
        medianOwnership,
        giniCoefficient,
      });

      return {
        totalUsers: entries.length,
        topOwnershipPercentage: topOwnership,
        averageOwnershipPercentage: averageOwnership,
        medianOwnershipPercentage: medianOwnership,
        giniCoefficient,
      };
    } catch (error) {
      logger.error('Failed to calculate ranking statistics', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Calculate Gini coefficient (measure of wealth inequality)
   * 0 = perfect equality, 1 = perfect inequality
   */
  private calculateGiniCoefficient(values: number[]): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);

    if (sum === 0) return 0;

    let gini = 0;
    for (let i = 0; i < n; i++) {
      gini += (2 * (i + 1) - n - 1) * sorted[i];
    }

    return gini / (n * sum);
  }

  /**
   * Get ranking changes for a user over time
   */
  async getUserRankingHistory(
    userId: string,
    days: number = 30
  ): Promise<{
    date: Date;
    rank: number;
    ownershipPercentage: number;
  }[]> {
    try {
      logger.info('Getting user ranking history', { userId, days });

      // Get all leaderboard updates for this user in the time period
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const entries = await prisma.leaderboardEntry.findMany({
        where: {
          userId,
          leaderboardType: 'GLOBAL',
          period: 'global',
          updatedAt: {
            gte: startDate,
          },
        },
        orderBy: { updatedAt: 'asc' },
        select: {
          rank: true,
          score: true,
          updatedAt: true,
        },
      });

      const history = entries.map((entry) => ({
        date: entry.updatedAt,
        rank: entry.rank,
        ownershipPercentage: entry.score.toNumber(),
      }));

      logger.info('User ranking history retrieved', {
        userId,
        recordCount: history.length,
      });

      return history;
    } catch (error) {
      logger.error('Failed to get user ranking history', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Recalculate all rankings (full rebuild)
   * Use this for maintenance or after data corrections
   */
  async rebuildAllRankings(): Promise<void> {
    try {
      logger.warn('Starting full leaderboard rebuild');

      // Clear existing rankings
      await prisma.leaderboardEntry.deleteMany({
        where: {
          leaderboardType: 'GLOBAL',
          period: 'global',
        },
      });

      logger.info('Cleared existing rankings');

      // Recalculate all rankings
      await this.updateLeaderboardRankings();

      logger.info('Leaderboard rebuild completed successfully');
    } catch (error) {
      logger.error('Failed to rebuild leaderboard', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get ranking percentile for a user
   */
  async getUserRankingPercentile(userId: string): Promise<number | null> {
    try {
      logger.info('Calculating user ranking percentile', { userId });

      const userEntry = await prisma.leaderboardEntry.findFirst({
        where: {
          userId,
          leaderboardType: 'GLOBAL',
          period: 'global',
        },
      });

      if (!userEntry) {
        logger.warn('User leaderboard entry not found', { userId });
        return null;
      }

      const totalUsers = await prisma.leaderboardEntry.count({
        where: {
          leaderboardType: 'GLOBAL',
          period: 'global',
        },
      });

      const percentile = ((totalUsers - userEntry.rank) / totalUsers) * 100;

      logger.info('User ranking percentile calculated', {
        userId,
        percentile,
        rank: userEntry.rank,
        totalUsers,
      });

      return Math.round(percentile * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      logger.error('Failed to calculate user ranking percentile', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }
}

export default new LeaderboardUpdater();
