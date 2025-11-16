/**
 * System Buy-Order Integration Examples
 * Shows how to integrate System Buy-Order into payment and subscription flows
 */

import { PrismaClient } from '@prisma/client';
import { SystemBuyOrderService } from './system-buy-order';
import { createLogger } from '../shared/logging';

const logger = createLogger('SystemBuyOrderIntegration');

/**
 * Integration with course purchase flow
 * Call this after successful course payment
 */
export async function integrateCoursePurchaseFlow(
  prisma: PrismaClient,
  buyOrderService: SystemBuyOrderService,
  coursePrice: number,
  currency: string = 'ZAR'
): Promise<void> {
  try {
    logger.info('Integrating course purchase with buy-order', {
      coursePrice,
      currency,
    });

    // Track revenue from course sale
    await buyOrderService.trackRevenue('course_sale', coursePrice, currency);

    logger.info('Course purchase revenue tracked for buy-order');
  } catch (error) {
    logger.error('Failed to integrate course purchase with buy-order', { error });
    throw error;
  }
}

/**
 * Integration with subscription payment flow
 * Call this after successful subscription payment
 */
export async function integrateSubscriptionPaymentFlow(
  prisma: PrismaClient,
  buyOrderService: SystemBuyOrderService,
  subscriptionAmount: number,
  currency: string = 'ZAR'
): Promise<void> {
  try {
    logger.info('Integrating subscription payment with buy-order', {
      subscriptionAmount,
      currency,
    });

    // Track revenue from subscription
    await buyOrderService.trackRevenue('subscription', subscriptionAmount, currency);

    logger.info('Subscription revenue tracked for buy-order');
  } catch (error) {
    logger.error('Failed to integrate subscription payment with buy-order', { error });
    throw error;
  }
}

/**
 * Scheduled job for automated daily buy-order execution
 * This would be called by a scheduler like Bull or node-cron
 */
export async function scheduledDailyBuyOrderExecution(
  buyOrderService: SystemBuyOrderService,
  currentTokenPrice: number
): Promise<void> {
  try {
    logger.info('Starting scheduled daily buy-order execution', {
      tokenPrice: currentTokenPrice,
    });

    // Execute buy-order
    const result = await buyOrderService.executeBuyOrder(currentTokenPrice);

    if (result.success) {
      logger.info('Scheduled buy-order executed successfully', {
        tokensAcquired: result.tokensAcquired.toString(),
        randSpent: result.randSpent.toString(),
        transactionHash: result.transactionHash,
      });

      // Emit event for other services to react to
      // e.g., update leaderboard, notify users, etc.
      await emitBuyOrderExecutedEvent({
        tokensAcquired: result.tokensAcquired,
        randSpent: result.randSpent,
        transactionHash: result.transactionHash,
        executionTime: result.executionTime,
      });
    } else {
      logger.warn('Scheduled buy-order execution failed', {
        error: result.error,
      });

      // Emit event for monitoring/alerting
      await emitBuyOrderFailedEvent({
        error: result.error,
        executionTime: result.executionTime,
      });
    }
  } catch (error) {
    logger.error('Failed to execute scheduled buy-order', { error });
    throw error;
  }
}

/**
 * API endpoint to manually trigger buy-order execution
 * Useful for admin/operator control
 */
export async function manualBuyOrderTrigger(
  buyOrderService: SystemBuyOrderService,
  currentTokenPrice: number,
  overrideAmount?: number
): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  try {
    logger.info('Manual buy-order trigger initiated', {
      tokenPrice: currentTokenPrice,
      overrideAmount,
    });

    // Execute buy-order with optional override amount
    const result = await buyOrderService.executeBuyOrder(
      currentTokenPrice,
      overrideAmount
    );

    if (result.success) {
      logger.info('Manual buy-order executed successfully', {
        tokensAcquired: result.tokensAcquired.toString(),
        randSpent: result.randSpent.toString(),
      });

      return {
        success: true,
        message: 'Buy-order executed successfully',
        data: {
          tokensAcquired: result.tokensAcquired.toString(),
          randSpent: result.randSpent.toString(),
          transactionHash: result.transactionHash,
          executionTime: result.executionTime,
        },
      };
    } else {
      logger.warn('Manual buy-order execution failed', {
        error: result.error,
      });

      return {
        success: false,
        message: `Buy-order failed: ${result.error}`,
      };
    }
  } catch (error) {
    logger.error('Failed to execute manual buy-order', { error });
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * API endpoint to get buy-order metrics and status
 */
export async function getBuyOrderStatus(
  buyOrderService: SystemBuyOrderService
): Promise<{
  metrics: any;
  config: any;
  availableRevenue: string;
}> {
  try {
    logger.info('Fetching buy-order status');

    const [metrics, config, availableRevenue] = await Promise.all([
      buyOrderService.getMetrics(),
      buyOrderService.getConfig(),
      buyOrderService.calculateAvailableRevenue(),
    ]);

    return {
      metrics: {
        totalRevenueTracked: metrics.totalRevenueTracked.toString(),
        totalTokensAcquired: metrics.totalTokensAcquired.toString(),
        totalRandSpent: metrics.totalRandSpent.toString(),
        averagePricePerToken: metrics.averagePricePerToken.toString(),
        executionCount: metrics.executionCount,
        successRate: (metrics.successRate * 100).toFixed(2) + '%',
        lastExecutionTime: metrics.lastExecutionTime,
      },
      config: {
        revenuePercentage: (config.revenuePercentage * 100).toFixed(1) + '%',
        executionSchedule: config.executionSchedule,
        minBuyAmount: config.minBuyAmount.toString(),
        maxBuyAmount: config.maxBuyAmount.toString(),
      },
      availableRevenue: availableRevenue.toString(),
    };
  } catch (error) {
    logger.error('Failed to fetch buy-order status', { error });
    throw error;
  }
}

/**
 * API endpoint to get buy-order history
 */
export async function getBuyOrderHistoryEndpoint(
  buyOrderService: SystemBuyOrderService,
  limit: number = 50,
  offset: number = 0
): Promise<{
  history: any[];
  total: number;
  limit: number;
  offset: number;
}> {
  try {
    logger.info('Fetching buy-order history', { limit, offset });

    const { history, total } = await buyOrderService.getBuyOrderHistory(limit, offset);

    return {
      history: history.map((record) => ({
        id: record.id,
        revenueUsed: record.revenueUsed.toString(),
        tokensAcquired: record.tokensAcquired.toString(),
        pricePerToken: record.pricePerToken.toString(),
        executionTime: record.executionTime,
        blockchainTxHash: record.blockchainTxHash,
        status: record.status,
        error: record.error,
        createdAt: record.createdAt,
      })),
      total,
      limit,
      offset,
    };
  } catch (error) {
    logger.error('Failed to fetch buy-order history', { error });
    throw error;
  }
}

/**
 * Event emitter for buy-order execution
 * This would integrate with your event system (e.g., EventEmitter, message queue)
 */
async function emitBuyOrderExecutedEvent(data: {
  tokensAcquired: any;
  randSpent: any;
  transactionHash?: string;
  executionTime: Date;
}): Promise<void> {
  try {
    logger.info('Emitting buy-order executed event', data);

    // TODO: Integrate with your event system
    // Examples:
    // - EventEmitter: eventBus.emit('buyOrderExecuted', data)
    // - Message Queue: await queue.add('buyOrderExecuted', data)
    // - Webhook: await sendWebhook('buyOrderExecuted', data)
    // - Database Event: await prisma.event.create({ data: { type: 'buyOrderExecuted', payload: data } })
  } catch (error) {
    logger.error('Failed to emit buy-order executed event', { error });
  }
}

/**
 * Event emitter for buy-order failure
 */
async function emitBuyOrderFailedEvent(data: {
  error?: string;
  executionTime: Date;
}): Promise<void> {
  try {
    logger.info('Emitting buy-order failed event', data);

    // TODO: Integrate with your event system
    // Examples:
    // - Send alert to monitoring system
    // - Log to error tracking service
    // - Notify admins
  } catch (error) {
    logger.error('Failed to emit buy-order failed event', { error });
  }
}

/**
 * Example: Complete integration setup
 */
export async function setupSystemBuyOrderIntegration(
  prisma: PrismaClient
): Promise<SystemBuyOrderService> {
  try {
    logger.info('Setting up System Buy-Order integration');

    // Initialize service
    const buyOrderService = new SystemBuyOrderService(prisma);

    // Configure service
    buyOrderService.updateConfig({
      revenuePercentage: 0.1, // 10%
      executionSchedule: 'daily',
      minBuyAmount: 100,
      maxBuyAmount: 1000000,
    });

    logger.info('System Buy-Order integration setup complete');

    return buyOrderService;
  } catch (error) {
    logger.error('Failed to setup System Buy-Order integration', { error });
    throw error;
  }
}

export default {
  integrateCoursePurchaseFlow,
  integrateSubscriptionPaymentFlow,
  scheduledDailyBuyOrderExecution,
  manualBuyOrderTrigger,
  getBuyOrderStatus,
  getBuyOrderHistoryEndpoint,
  setupSystemBuyOrderIntegration,
};
