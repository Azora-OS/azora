/**
 * Burn Tracker Service
 * Handles tracking of all burn transactions and supply management
 */

import { Decimal } from '@prisma/client/runtime/library';
import { createLogger } from '../shared/logging';
import {
  BurnTransactionRecord,
  BurnHistoryResult,
  BurnStatistics,
  TokenSupplyData,
  BurnTransactionFilter,
  BurnTransactionType,
  BlockchainStatus,
} from './token-burn.types';
import { TokenBurnRepository } from './token-burn-repository';

const logger = createLogger('BurnTracker');

export class BurnTracker {
  private repository: TokenBurnRepository;

  constructor(repository: TokenBurnRepository) {
    this.repository = repository;
  }

  /**
   * Log a burn transaction
   */
  async logBurnTransaction(
    userId: string,
    amount: Decimal,
    burnRate: number,
    burnedAmount: Decimal,
    transactionType: BurnTransactionType,
    reason: string,
    metadata?: Record<string, any>
  ): Promise<BurnTransactionRecord> {
    try {
      logger.info('Logging burn transaction', {
        userId,
        amount: amount.toString(),
        burnedAmount: burnedAmount.toString(),
        transactionType,
      });

      const transaction = await this.repository.createBurnTransaction(
        userId,
        amount,
        burnRate,
        burnedAmount,
        transactionType,
        reason,
        metadata
      );

      logger.info('Burn transaction logged successfully', {
        transactionId: transaction.id,
        userId,
      });

      return transaction;
    } catch (error) {
      logger.error('Failed to log burn transaction', { error, userId });
      throw error;
    }
  }

  /**
   * Update burn transaction with blockchain confirmation
   */
  async confirmBurnTransaction(
    transactionId: string,
    txHash: string,
    status: BlockchainStatus
  ): Promise<BurnTransactionRecord> {
    try {
      logger.info('Confirming burn transaction', {
        transactionId,
        txHash,
        status,
      });

      const transaction = await this.repository.updateBurnTransactionHash(
        transactionId,
        txHash,
        status
      );

      logger.info('Burn transaction confirmed', {
        transactionId,
        status: transaction.blockchainStatus,
      });

      return transaction;
    } catch (error) {
      logger.error('Failed to confirm burn transaction', { error, transactionId });
      throw error;
    }
  }

  /**
   * Get total burned supply
   */
  async getTotalBurnedSupply(): Promise<Decimal> {
    try {
      logger.info('Calculating total burned supply');

      const supply = await this.repository.getTokenSupply();

      if (!supply) {
        logger.warn('No token supply record found, returning 0');
        return new Decimal(0);
      }

      logger.info('Total burned supply calculated', {
        burnedSupply: supply.burnedSupply.toString(),
      });

      return supply.burnedSupply;
    } catch (error) {
      logger.error('Failed to get total burned supply', { error });
      throw error;
    }
  }

  /**
   * Get cumulative burn amount for a user
   */
  async getUserCumulativeBurn(userId: string): Promise<Decimal> {
    try {
      logger.info('Calculating user cumulative burn', { userId });

      const filter: BurnTransactionFilter = {
        userId,
        blockchainStatus: BlockchainStatus.CONFIRMED,
      };

      const history = await this.repository.getBurnHistory(filter);

      const totalBurned = history.transactions.reduce(
        (sum: Decimal, tx: BurnTransactionRecord): Decimal => sum.plus(tx.burnedAmount),
        new Decimal(0)
      );

      logger.info('User cumulative burn calculated', {
        userId,
        totalBurned: totalBurned.toString(),
      });

      return totalBurned;
    } catch (error) {
      logger.error('Failed to get user cumulative burn', { error, userId });
      throw error;
    }
  }

  /**
   * Update token supply after burn
   */
  async updateSupplyAfterBurn(
    totalSupply: Decimal,
    circulatingSupply: Decimal,
    burnedAmount: Decimal
  ): Promise<TokenSupplyData> {
    try {
      logger.info('Updating token supply after burn', {
        totalSupply: totalSupply.toString(),
        circulatingSupply: circulatingSupply.toString(),
        burnedAmount: burnedAmount.toString(),
      });

      // Get current supply
      const currentSupply = await this.repository.getTokenSupply();

      // Calculate new burned supply
      const newBurnedSupply = currentSupply
        ? currentSupply.burnedSupply.plus(burnedAmount)
        : burnedAmount;

      // Calculate new circulating supply (total - burned)
      const newCirculatingSupply = totalSupply.minus(newBurnedSupply);

      // Update supply
      const updatedSupply = await this.repository.updateTokenSupply(
        totalSupply,
        newCirculatingSupply,
        newBurnedSupply
      );

      logger.info('Token supply updated successfully', {
        totalSupply: updatedSupply.totalSupply.toString(),
        circulatingSupply: updatedSupply.circulatingSupply.toString(),
        burnedSupply: updatedSupply.burnedSupply.toString(),
      });

      return updatedSupply;
    } catch (error) {
      logger.error('Failed to update token supply', { error });
      throw error;
    }
  }

  /**
   * Get burn history with filtering
   */
  async getBurnHistory(filter: BurnTransactionFilter): Promise<BurnHistoryResult> {
    try {
      logger.info('Retrieving burn history', { filter });

      const history = await this.repository.getBurnHistory(filter);

      logger.info('Burn history retrieved', {
        count: history.transactions.length,
        total: history.total,
        totalBurned: history.totalBurned.toString(),
      });

      return history;
    } catch (error) {
      logger.error('Failed to get burn history', { error, filter });
      throw error;
    }
  }

  /**
   * Get burn statistics
   */
  async getBurnStatistics(): Promise<BurnStatistics> {
    try {
      logger.info('Calculating burn statistics');

      const stats = await this.repository.getBurnStatistics();

      logger.info('Burn statistics calculated', {
        totalBurned: stats.totalBurned.toString(),
        transactionCount: stats.transactionCount,
        successRate: stats.successRate,
      });

      return stats;
    } catch (error) {
      logger.error('Failed to get burn statistics', { error });
      throw error;
    }
  }

  /**
   * Get burn statistics by transaction type
   */
  async getBurnStatisticsByType(
    transactionType: BurnTransactionType
  ): Promise<{
    totalBurned: Decimal;
    transactionCount: number;
    averageBurn: Decimal;
  }> {
    try {
      logger.info('Calculating burn statistics by type', { transactionType });

      const filter: BurnTransactionFilter = {
        transactionType,
        blockchainStatus: BlockchainStatus.CONFIRMED,
      };

      const history = await this.repository.getBurnHistory(filter);

      const totalBurned = history.totalBurned;
      const transactionCount = history.transactions.length;
      const averageBurn =
        transactionCount > 0
          ? totalBurned.dividedBy(transactionCount)
          : new Decimal(0);

      logger.info('Burn statistics by type calculated', {
        transactionType,
        totalBurned: totalBurned.toString(),
        transactionCount,
        averageBurn: averageBurn.toString(),
      });

      return {
        totalBurned,
        transactionCount,
        averageBurn,
      };
    } catch (error) {
      logger.error('Failed to get burn statistics by type', { error, transactionType });
      throw error;
    }
  }

  /**
   * Get historical burn data for a date range
   */
  async getHistoricalBurnData(
    startDate: Date,
    endDate: Date
  ): Promise<{
    transactions: BurnTransactionRecord[];
    totalBurned: Decimal;
    dailyBreakdown: Record<string, Decimal>;
  }> {
    try {
      logger.info('Retrieving historical burn data', { startDate, endDate });

      const filter: BurnTransactionFilter = {
        startDate,
        endDate,
        blockchainStatus: BlockchainStatus.CONFIRMED,
        limit: 10000, // Get all records
      };

      const history = await this.repository.getBurnHistory(filter);

      // Calculate daily breakdown
      const dailyBreakdown: Record<string, Decimal> = {};

      history.transactions.forEach((tx: BurnTransactionRecord) => {
        const date = tx.createdAt.toISOString().split('T')[0] || ''; // YYYY-MM-DD
        if (date && !dailyBreakdown[date]) {
          dailyBreakdown[date] = new Decimal(0);
        }
        if (date) {
          dailyBreakdown[date] = (dailyBreakdown[date] || new Decimal(0)).plus(tx.burnedAmount);
        }
      });

      logger.info('Historical burn data retrieved', {
        transactionCount: history.transactions.length,
        totalBurned: history.totalBurned.toString(),
        daysWithBurns: Object.keys(dailyBreakdown).length,
      });

      return {
        transactions: history.transactions,
        totalBurned: history.totalBurned,
        dailyBreakdown,
      };
    } catch (error) {
      logger.error('Failed to get historical burn data', { error, startDate, endDate });
      throw error;
    }
  }

  /**
   * Get burn transaction by ID
   */
  async getBurnTransaction(transactionId: string): Promise<BurnTransactionRecord | null> {
    try {
      logger.info('Retrieving burn transaction', { transactionId });

      const transaction = await this.repository.getBurnTransaction(transactionId);

      if (transaction) {
        logger.info('Burn transaction retrieved', { transactionId });
      } else {
        logger.warn('Burn transaction not found', { transactionId });
      }

      return transaction;
    } catch (error) {
      logger.error('Failed to get burn transaction', { error, transactionId });
      throw error;
    }
  }

  /**
   * Get pending burn transactions (not yet confirmed on blockchain)
   */
  async getPendingBurnTransactions(): Promise<BurnTransactionRecord[]> {
    try {
      logger.info('Retrieving pending burn transactions');

      const filter: BurnTransactionFilter = {
        blockchainStatus: BlockchainStatus.PENDING,
        limit: 10000,
      };

      const history = await this.repository.getBurnHistory(filter);

      logger.info('Pending burn transactions retrieved', {
        count: history.transactions.length,
      });

      return history.transactions;
    } catch (error) {
      logger.error('Failed to get pending burn transactions', { error });
      throw error;
    }
  }

  /**
   * Get failed burn transactions
   */
  async getFailedBurnTransactions(): Promise<BurnTransactionRecord[]> {
    try {
      logger.info('Retrieving failed burn transactions');

      const filter: BurnTransactionFilter = {
        blockchainStatus: BlockchainStatus.FAILED,
        limit: 10000,
      };

      const history = await this.repository.getBurnHistory(filter);

      logger.info('Failed burn transactions retrieved', {
        count: history.transactions.length,
      });

      return history.transactions;
    } catch (error) {
      logger.error('Failed to get failed burn transactions', { error });
      throw error;
    }
  }

  /**
   * Calculate burn impact on user's ownership percentage
   */
  async calculateOwnershipPercentage(
    userTokens: Decimal,
    totalSupply: Decimal
  ): Promise<number> {
    try {
      if (totalSupply.lessThanOrEqualTo(0)) {
        logger.warn('Total supply is 0 or negative');
        return 0;
      }

      const percentage = userTokens
        .dividedBy(totalSupply)
        .times(100)
        .toNumber();

      logger.debug('Ownership percentage calculated', {
        userTokens: userTokens.toString(),
        totalSupply: totalSupply.toString(),
        percentage,
      });

      return percentage;
    } catch (error) {
      logger.error('Failed to calculate ownership percentage', { error });
      throw error;
    }
  }

  /**
   * Get supply trend data
   */
  async getSupplyTrendData(days: number = 30): Promise<{
    dates: string[];
    totalSupply: number[];
    circulatingSupply: number[];
    burnedSupply: number[];
  }> {
    try {
      logger.info('Retrieving supply trend data', { days });

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      const historicalData = await this.getHistoricalBurnData(startDate, endDate);

      // Get current supply
      const currentSupply = await this.repository.getTokenSupply();

      if (!currentSupply) {
        logger.warn('No token supply record found');
        return {
          dates: [],
          totalSupply: [],
          circulatingSupply: [],
          burnedSupply: [],
        };
      }

      // Build trend data
      const dates: string[] = [];
      const totalSupplyTrend: number[] = [];
      const circulatingSupplyTrend: number[] = [];
      const burnedSupplyTrend: number[] = [];

      let cumulativeBurn = new Decimal(0);

      for (let i = 0; i < days; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0] || '';

        dates.push(dateStr);

        // Add daily burn to cumulative
        const dailyBurn = historicalData.dailyBreakdown[dateStr];
        if (dailyBurn) {
          cumulativeBurn = cumulativeBurn.plus(dailyBurn);
        }

        // Calculate supply at this point
        const totalSupplyAtDate = currentSupply.totalSupply;
        const burnedSupplyAtDate = cumulativeBurn;
        const circulatingSupplyAtDate = totalSupplyAtDate.minus(burnedSupplyAtDate);

        totalSupplyTrend.push(totalSupplyAtDate.toNumber());
        circulatingSupplyTrend.push(circulatingSupplyAtDate.toNumber());
        burnedSupplyTrend.push(burnedSupplyAtDate.toNumber());
      }

      logger.info('Supply trend data retrieved', {
        days,
        dataPoints: dates.length,
      });

      return {
        dates,
        totalSupply: totalSupplyTrend,
        circulatingSupply: circulatingSupplyTrend,
        burnedSupply: burnedSupplyTrend,
      };
    } catch (error) {
      logger.error('Failed to get supply trend data', { error, days });
      throw error;
    }
  }
}

export default new BurnTracker(new TokenBurnRepository());
