/**
 * System Buy-Order Service
 * Manages automated token purchases using Rand-based revenue
 */

import { Decimal } from '@prisma/client/runtime/library';
import { PrismaClient } from '@prisma/client';
import { createLogger } from '../shared/logging';
import {
  SystemBuyOrderConfig,
  SystemBuyOrderResult,
  SystemBuyOrderMetrics,
  RevenueTrackingRecord,
  SystemBuyOrderHistoryRecord,
} from './token-burn.types';
import { BlockchainBurnService } from './blockchain-burn-service';

const logger = createLogger('SystemBuyOrder');

/**
 * Default buy-order configuration
 */
const DEFAULT_CONFIG: SystemBuyOrderConfig = {
  revenuePercentage: 0.1, // 10%
  executionSchedule: 'daily',
  minBuyAmount: new Decimal(100), // Minimum 100 Rand
  maxBuyAmount: new Decimal(1000000), // Maximum 1M Rand
};

export class SystemBuyOrderService {
  private config: SystemBuyOrderConfig;
  private blockchainService: BlockchainBurnService;

  constructor(
    private prisma: PrismaClient,
    blockchainService?: BlockchainBurnService,
    config?: Partial<SystemBuyOrderConfig>
  ) {
    this.blockchainService = blockchainService || new BlockchainBurnService();
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
  }

  /**
   * Track revenue from course sales and subscriptions
   */
  async trackRevenue(
    source: 'course_sale' | 'subscription' | 'other',
    amount: number | Decimal,
    currency: string = 'ZAR'
  ): Promise<RevenueTrackingRecord> {
    try {
      const amountDecimal = new Decimal(amount);

      if (amountDecimal.lessThanOrEqualTo(0)) {
        throw new Error('Revenue amount must be greater than 0');
      }

      logger.info('Tracking revenue', {
        source,
        amount: amountDecimal.toString(),
        currency,
      });

      const record = await this.prisma.systemBuyOrderRevenue.create({
        data: {
          source,
          amount: amountDecimal,
          currency,
        },
      });

      logger.info('Revenue tracked successfully', {
        recordId: record.id,
        amount: amountDecimal.toString(),
      });

      return record as RevenueTrackingRecord;
    } catch (error) {
      logger.error('Failed to track revenue', { error, source, amount });
      throw error;
    }
  }

  /**
   * Calculate available revenue for buy-order
   */
  async calculateAvailableRevenue(): Promise<Decimal> {
    try {
      logger.info('Calculating available revenue for buy-order');

      // Get total revenue tracked
      const result = await this.prisma.systemBuyOrderRevenue.aggregate({
        _sum: {
          amount: true,
        },
      });

      const totalRevenue = result._sum.amount || new Decimal(0);

      // Get total revenue already used in buy-orders
      const usedResult = await this.prisma.systemBuyOrderHistory.aggregate({
        _sum: {
          revenueUsed: true,
        },
        where: {
          status: 'completed',
        },
      });

      const usedRevenue = usedResult._sum.revenueUsed || new Decimal(0);

      // Calculate available revenue
      const availableRevenue = totalRevenue.minus(usedRevenue);

      // Calculate 10% of available revenue
      const buyOrderAmount = availableRevenue.times(new Decimal(this.config.revenuePercentage));

      logger.info('Available revenue calculated', {
        totalRevenue: totalRevenue.toString(),
        usedRevenue: usedRevenue.toString(),
        availableRevenue: availableRevenue.toString(),
        buyOrderAmount: buyOrderAmount.toString(),
      });

      return buyOrderAmount;
    } catch (error) {
      logger.error('Failed to calculate available revenue', { error });
      throw error;
    }
  }

  /**
   * Execute buy-order to purchase tokens
   */
  async executeBuyOrder(
    pricePerToken: number | Decimal,
    randAmount?: number | Decimal
  ): Promise<SystemBuyOrderResult> {
    try {
      const priceDecimal = new Decimal(pricePerToken);

      if (priceDecimal.lessThanOrEqualTo(0)) {
        throw new Error('Price per token must be greater than 0');
      }

      logger.info('Executing system buy-order', {
        pricePerToken: priceDecimal.toString(),
        randAmount: randAmount?.toString(),
      });

      // Calculate available revenue if not specified
      let buyAmount = randAmount ? new Decimal(randAmount) : await this.calculateAvailableRevenue();

      // Validate buy amount
      if (buyAmount.lessThan(this.config.minBuyAmount)) {
        logger.warn('Buy amount below minimum threshold', {
          buyAmount: buyAmount.toString(),
          minAmount: this.config.minBuyAmount.toString(),
        });
        return {
          success: false,
          tokensAcquired: new Decimal(0),
          randSpent: new Decimal(0),
          executionTime: new Date(),
          error: `Buy amount ${buyAmount.toString()} is below minimum ${this.config.minBuyAmount.toString()}`,
        };
      }

      // Cap buy amount at maximum
      if (buyAmount.greaterThan(this.config.maxBuyAmount)) {
        logger.warn('Buy amount exceeds maximum threshold, capping', {
          requestedAmount: buyAmount.toString(),
          maxAmount: this.config.maxBuyAmount.toString(),
        });
        buyAmount = this.config.maxBuyAmount;
      }

      // Calculate tokens to acquire
      const tokensToAcquire = buyAmount.dividedBy(priceDecimal);

      logger.info('Buy-order calculation', {
        randAmount: buyAmount.toString(),
        pricePerToken: priceDecimal.toString(),
        tokensToAcquire: tokensToAcquire.toString(),
      });

      // Execute blockchain transaction
      const blockchainResult = await this.blockchainService.executeBurn({
        userId: 'SYSTEM',
        burnAmount: tokensToAcquire,
        transactionType: 'COURSE_SALE' as any, // Using as placeholder for system transaction
        reason: 'System buy-order: purchasing tokens with Rand revenue',
        metadata: {
          randSpent: buyAmount.toString(),
          pricePerToken: priceDecimal.toString(),
        },
      });

      // Record buy-order in history
      const historyRecord = await this.prisma.systemBuyOrderHistory.create({
        data: {
          revenueUsed: buyAmount,
          tokensAcquired: tokensToAcquire,
          pricePerToken: priceDecimal,
          executionTime: new Date(),
          blockchainTxHash: blockchainResult.transactionHash,
          status: blockchainResult.success ? 'completed' : 'failed',
          error: blockchainResult.error,
        },
      });

      logger.info('Buy-order executed', {
        historyId: historyRecord.id,
        success: blockchainResult.success,
        tokensAcquired: tokensToAcquire.toString(),
        randSpent: buyAmount.toString(),
      });

      return {
        success: blockchainResult.success,
        tokensAcquired: tokensToAcquire,
        randSpent: buyAmount,
        executionTime: new Date(),
        transactionHash: blockchainResult.transactionHash,
        error: blockchainResult.error,
      };
    } catch (error) {
      logger.error('Failed to execute buy-order', { error, pricePerToken });
      return {
        success: false,
        tokensAcquired: new Decimal(0),
        randSpent: new Decimal(0),
        executionTime: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get buy-order history
   */
  async getBuyOrderHistory(
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    history: SystemBuyOrderHistoryRecord[];
    total: number;
  }> {
    try {
      logger.info('Fetching buy-order history', { limit, offset });

      const [history, total] = await Promise.all([
        this.prisma.systemBuyOrderHistory.findMany({
          orderBy: { executionTime: 'desc' },
          take: limit,
          skip: offset,
        }),
        this.prisma.systemBuyOrderHistory.count(),
      ]);

      logger.info('Buy-order history fetched', { count: history.length, total });

      return {
        history: history as SystemBuyOrderHistoryRecord[],
        total,
      };
    } catch (error) {
      logger.error('Failed to fetch buy-order history', { error });
      throw error;
    }
  }

  /**
   * Get system buy-order metrics
   */
  async getMetrics(): Promise<SystemBuyOrderMetrics> {
    try {
      logger.info('Calculating system buy-order metrics');

      // Get total revenue tracked
      const revenueResult = await this.prisma.systemBuyOrderRevenue.aggregate({
        _sum: {
          amount: true,
        },
      });

      const totalRevenueTracked = revenueResult._sum.amount || new Decimal(0);

      // Get buy-order statistics
      const historyResult = await this.prisma.systemBuyOrderHistory.aggregate({
        _sum: {
          tokensAcquired: true,
          revenueUsed: true,
        },
        where: {
          status: 'completed',
        },
      });

      const totalTokensAcquired = historyResult._sum.tokensAcquired || new Decimal(0);
      const totalRandSpent = historyResult._sum.revenueUsed || new Decimal(0);

      // Calculate average price per token
      let averagePricePerToken = new Decimal(0);
      if (totalTokensAcquired.greaterThan(0)) {
        averagePricePerToken = totalRandSpent.dividedBy(totalTokensAcquired);
      }

      // Get execution count and success rate
      const completedCount = await this.prisma.systemBuyOrderHistory.count({
        where: { status: 'completed' },
      });

      const totalCount = await this.prisma.systemBuyOrderHistory.count();

      const successRate = totalCount > 0 ? completedCount / totalCount : 0;

      // Get last execution time
      const lastExecution = await this.prisma.systemBuyOrderHistory.findFirst({
        orderBy: { executionTime: 'desc' },
      });

      const metrics: SystemBuyOrderMetrics = {
        totalRevenueTracked,
        totalTokensAcquired,
        totalRandSpent,
        averagePricePerToken,
        executionCount: totalCount,
        successRate,
        lastExecutionTime: lastExecution?.executionTime,
      };

      logger.info('System buy-order metrics calculated', {
        totalRevenueTracked: metrics.totalRevenueTracked.toString(),
        totalTokensAcquired: metrics.totalTokensAcquired.toString(),
        successRate: metrics.successRate,
      });

      return metrics;
    } catch (error) {
      logger.error('Failed to calculate metrics', { error });
      throw error;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<SystemBuyOrderConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
    };

    logger.info('System buy-order configuration updated', { config: this.config });
  }

  /**
   * Get current configuration
   */
  getConfig(): SystemBuyOrderConfig {
    return { ...this.config };
  }

  /**
   * Schedule automated buy-order execution
   * This would typically be called by a scheduler service
   */
  async scheduleAutomatedExecution(pricePerToken: number | Decimal): Promise<void> {
    try {
      logger.info('Scheduling automated buy-order execution', {
        schedule: this.config.executionSchedule,
        pricePerToken: pricePerToken.toString(),
      });

      // This is a placeholder for scheduler integration
      // In production, this would be integrated with a job scheduler like Bull or node-cron
      const result = await this.executeBuyOrder(pricePerToken);

      if (result.success) {
        logger.info('Automated buy-order executed successfully', {
          tokensAcquired: result.tokensAcquired.toString(),
          randSpent: result.randSpent.toString(),
        });
      } else {
        logger.warn('Automated buy-order execution failed', {
          error: result.error,
        });
      }
    } catch (error) {
      logger.error('Failed to schedule automated execution', { error });
      throw error;
    }
  }
}

export default SystemBuyOrderService;
