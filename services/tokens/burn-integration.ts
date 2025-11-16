/**
 * Burn Integration Service
 * Integrates token burn mechanism into payment and transaction flows
 */

import { Decimal } from '@prisma/client/runtime/library';
import { createLogger } from '../shared/logging';
import { TokenBurnCalculator } from './token-burn-calculator';
import { BlockchainBurnService } from './blockchain-burn-service';
import { BurnTracker } from './burn-tracker';
import { LeaderboardUpdater } from './leaderboard-updater';
import {
  BurnTransactionType,
  BlockchainBurnRequest,
  BlockchainBurnResult,
  BurnTransactionRecord,
} from './token-burn.types';

const logger = createLogger('BurnIntegrationService');

/**
 * Result of a burn integration operation
 */
export interface BurnIntegrationResult {
  success: boolean;
  burnTransactionId?: string;
  burnedAmount: Decimal;
  netAmount: Decimal;
  blockchainResult?: BlockchainBurnResult;
  error?: string;
}

export class BurnIntegrationService {
  private calculator: TokenBurnCalculator;
  private blockchainService: BlockchainBurnService;
  private burnTracker: BurnTracker;
  private leaderboardUpdater: LeaderboardUpdater;

  constructor(
    calculator: TokenBurnCalculator,
    blockchainService: BlockchainBurnService,
    burnTracker: BurnTracker,
    leaderboardUpdater: LeaderboardUpdater
  ) {
    this.calculator = calculator;
    this.blockchainService = blockchainService;
    this.burnTracker = burnTracker;
    this.leaderboardUpdater = leaderboardUpdater;
  }

  /**
   * Process burn on course sale
   */
  async processSaleBurn(
    userId: string,
    saleAmount: Decimal,
    courseId: string
  ): Promise<BurnIntegrationResult> {
    try {
      logger.info('Processing sale burn', {
        userId,
        saleAmount: saleAmount.toString(),
        courseId,
      });

      // Calculate burn
      const calculation = this.calculator.calculateBurn(
        saleAmount,
        BurnTransactionType.COURSE_SALE
      );

      // Log burn transaction
      const burnTx = await this.burnTracker.logBurnTransaction(
        userId,
        calculation.originalAmount,
        calculation.burnRate,
        calculation.burnedAmount,
        BurnTransactionType.COURSE_SALE,
        `Course sale: ${courseId}`,
        { courseId }
      );

      // Execute blockchain burn
      const blockchainRequest: BlockchainBurnRequest = {
        userId,
        burnAmount: calculation.burnedAmount,
        transactionType: BurnTransactionType.COURSE_SALE,
        reason: `Course sale: ${courseId}`,
        metadata: { courseId, transactionId: burnTx.id },
      };

      const blockchainResult = await this.blockchainService.executeBurn(blockchainRequest);

      // Update burn transaction with blockchain result
      if (blockchainResult.success && blockchainResult.transactionHash) {
        await this.burnTracker.confirmBurnTransaction(
          burnTx.id,
          blockchainResult.transactionHash,
          blockchainResult.status
        );

        // Update leaderboard rankings after successful burn
        try {
          await this.leaderboardUpdater.updateLeaderboardRankings();
        } catch (leaderboardError) {
          logger.error('Failed to update leaderboard after burn', {
            error: leaderboardError,
            userId,
          });
          // Don't fail the burn operation if leaderboard update fails
        }
      }

      logger.info('Sale burn processed successfully', {
        userId,
        burnedAmount: calculation.burnedAmount.toString(),
        netAmount: calculation.netAmount.toString(),
      });

      return {
        success: blockchainResult.success,
        burnTransactionId: burnTx.id,
        burnedAmount: calculation.burnedAmount,
        netAmount: calculation.netAmount,
        blockchainResult,
      };
    } catch (error) {
      logger.error('Failed to process sale burn', { error, userId, saleAmount: saleAmount.toString() });
      return {
        success: false,
        burnedAmount: new Decimal(0),
        netAmount: saleAmount,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Process burn on earnings withdrawal
   */
  async processWithdrawalBurn(
    userId: string,
    withdrawalAmount: Decimal,
    withdrawalId: string
  ): Promise<BurnIntegrationResult> {
    try {
      logger.info('Processing withdrawal burn', {
        userId,
        withdrawalAmount: withdrawalAmount.toString(),
        withdrawalId,
      });

      // Calculate burn
      const calculation = this.calculator.calculateBurn(
        withdrawalAmount,
        BurnTransactionType.EARNINGS_WITHDRAWAL
      );

      // Log burn transaction
      const burnTx = await this.burnTracker.logBurnTransaction(
        userId,
        calculation.originalAmount,
        calculation.burnRate,
        calculation.burnedAmount,
        BurnTransactionType.EARNINGS_WITHDRAWAL,
        `Earnings withdrawal: ${withdrawalId}`,
        { withdrawalId }
      );

      // Execute blockchain burn
      const blockchainRequest: BlockchainBurnRequest = {
        userId,
        burnAmount: calculation.burnedAmount,
        transactionType: BurnTransactionType.EARNINGS_WITHDRAWAL,
        reason: `Earnings withdrawal: ${withdrawalId}`,
        metadata: { withdrawalId, transactionId: burnTx.id },
      };

      const blockchainResult = await this.blockchainService.executeBurn(blockchainRequest);

      // Update burn transaction with blockchain result
      if (blockchainResult.success && blockchainResult.transactionHash) {
        await this.burnTracker.confirmBurnTransaction(
          burnTx.id,
          blockchainResult.transactionHash,
          blockchainResult.status
        );

        // Update leaderboard rankings after successful burn
        try {
          await this.leaderboardUpdater.updateLeaderboardRankings();
        } catch (leaderboardError) {
          logger.error('Failed to update leaderboard after burn', {
            error: leaderboardError,
            userId,
          });
          // Don't fail the burn operation if leaderboard update fails
        }
      }

      logger.info('Withdrawal burn processed successfully', {
        userId,
        burnedAmount: calculation.burnedAmount.toString(),
        netAmount: calculation.netAmount.toString(),
      });

      return {
        success: blockchainResult.success,
        burnTransactionId: burnTx.id,
        burnedAmount: calculation.burnedAmount,
        netAmount: calculation.netAmount,
        blockchainResult,
      };
    } catch (error) {
      logger.error('Failed to process withdrawal burn', {
        error,
        userId,
        withdrawalAmount: withdrawalAmount.toString(),
      });
      return {
        success: false,
        burnedAmount: new Decimal(0),
        netAmount: withdrawalAmount,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Process burn on token redemption
   */
  async processRedemptionBurn(
    userId: string,
    redemptionAmount: Decimal,
    redemptionId: string
  ): Promise<BurnIntegrationResult> {
    try {
      logger.info('Processing redemption burn', {
        userId,
        redemptionAmount: redemptionAmount.toString(),
        redemptionId,
      });

      // Calculate burn
      const calculation = this.calculator.calculateBurn(
        redemptionAmount,
        BurnTransactionType.TOKEN_REDEMPTION
      );

      // Log burn transaction
      const burnTx = await this.burnTracker.logBurnTransaction(
        userId,
        calculation.originalAmount,
        calculation.burnRate,
        calculation.burnedAmount,
        BurnTransactionType.TOKEN_REDEMPTION,
        `Token redemption: ${redemptionId}`,
        { redemptionId }
      );

      // Execute blockchain burn
      const blockchainRequest: BlockchainBurnRequest = {
        userId,
        burnAmount: calculation.burnedAmount,
        transactionType: BurnTransactionType.TOKEN_REDEMPTION,
        reason: `Token redemption: ${redemptionId}`,
        metadata: { redemptionId, transactionId: burnTx.id },
      };

      const blockchainResult = await this.blockchainService.executeBurn(blockchainRequest);

      // Update burn transaction with blockchain result
      if (blockchainResult.success && blockchainResult.transactionHash) {
        await this.burnTracker.confirmBurnTransaction(
          burnTx.id,
          blockchainResult.transactionHash,
          blockchainResult.status
        );

        // Update leaderboard rankings after successful burn
        try {
          await this.leaderboardUpdater.updateLeaderboardRankings();
        } catch (leaderboardError) {
          logger.error('Failed to update leaderboard after burn', {
            error: leaderboardError,
            userId,
          });
          // Don't fail the burn operation if leaderboard update fails
        }
      }

      logger.info('Redemption burn processed successfully', {
        userId,
        burnedAmount: calculation.burnedAmount.toString(),
        netAmount: calculation.netAmount.toString(),
      });

      return {
        success: blockchainResult.success,
        burnTransactionId: burnTx.id,
        burnedAmount: calculation.burnedAmount,
        netAmount: calculation.netAmount,
        blockchainResult,
      };
    } catch (error) {
      logger.error('Failed to process redemption burn', {
        error,
        userId,
        redemptionAmount: redemptionAmount.toString(),
      });
      return {
        success: false,
        burnedAmount: new Decimal(0),
        netAmount: redemptionAmount,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get burn impact for a transaction
   */
  async getBurnImpact(
    amount: Decimal,
    transactionType: BurnTransactionType
  ): Promise<{
    originalAmount: Decimal;
    burnedAmount: Decimal;
    netAmount: Decimal;
    burnPercentage: number;
  }> {
    try {
      const calculation = this.calculator.calculateBurn(amount, transactionType);
      const burnPercentage = this.calculator.calculatePercentageLoss(amount, transactionType);

      return {
        originalAmount: calculation.originalAmount,
        burnedAmount: calculation.burnedAmount,
        netAmount: calculation.netAmount,
        burnPercentage,
      };
    } catch (error) {
      logger.error('Failed to get burn impact', { error, amount: amount.toString() });
      throw error;
    }
  }

  /**
   * Get user's total burn impact
   */
  async getUserBurnImpact(userId: string): Promise<{
    totalBurned: Decimal;
    burnsByType: {
      courseSale: Decimal;
      earningsWithdrawal: Decimal;
      tokenRedemption: Decimal;
    };
    averageBurnPerTransaction: Decimal;
  }> {
    try {
      logger.info('Calculating user burn impact', { userId });

      // Get user-specific stats
      const userHistory = await this.burnTracker.getBurnHistory({ userId });

      const userBurnsByType = {
        courseSale: new Decimal(0),
        earningsWithdrawal: new Decimal(0),
        tokenRedemption: new Decimal(0),
      };

      userHistory.transactions.forEach((tx: BurnTransactionRecord) => {
        if (tx.transactionType === BurnTransactionType.COURSE_SALE) {
          userBurnsByType.courseSale = userBurnsByType.courseSale.plus(tx.burnedAmount);
        } else if (tx.transactionType === BurnTransactionType.EARNINGS_WITHDRAWAL) {
          userBurnsByType.earningsWithdrawal = userBurnsByType.earningsWithdrawal.plus(
            tx.burnedAmount
          );
        } else if (tx.transactionType === BurnTransactionType.TOKEN_REDEMPTION) {
          userBurnsByType.tokenRedemption = userBurnsByType.tokenRedemption.plus(
            tx.burnedAmount
          );
        }
      });

      const averageBurn =
        userHistory.transactions.length > 0
          ? userHistory.totalBurned.dividedBy(userHistory.transactions.length)
          : new Decimal(0);

      return {
        totalBurned: userHistory.totalBurned,
        burnsByType: userBurnsByType,
        averageBurnPerTransaction: averageBurn,
      };
    } catch (error) {
      logger.error('Failed to get user burn impact', { error, userId });
      throw error;
    }
  }

  /**
   * Validate burn transaction before execution
   */
  async validateBurnTransaction(
    userId: string,
    amount: Decimal,
    transactionType: BurnTransactionType,
    userBalance: Decimal
  ): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      return this.calculator.validateBurnTransaction(amount, transactionType, userBalance);
    } catch (error) {
      logger.error('Failed to validate burn transaction', { error, userId });
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed'],
        warnings: [],
      };
    }
  }
}

// Export factory function for creating instances
export function createBurnIntegrationService(): BurnIntegrationService {
  return new BurnIntegrationService(
    new TokenBurnCalculator(),
    new BlockchainBurnService(),
    new BurnTracker(new (require('./token-burn-repository').TokenBurnRepository)()),
    new LeaderboardUpdater()
  );
}
