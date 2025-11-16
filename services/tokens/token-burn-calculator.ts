/**
 * Token Burn Calculator Service
 * Handles burn amount calculations for different transaction types
 */

import { Decimal } from '@prisma/client/runtime/library';
import { createLogger } from '../shared/logging';
import {
  BurnCalculation,
  BurnRateConfig,
  BurnTransactionType,
  BurnValidationResult,
} from './token-burn.types';

const logger = createLogger('TokenBurnCalculator');

/**
 * Default burn rate configuration
 */
const DEFAULT_BURN_RATES: BurnRateConfig = {
  courseSale: 0.05, // 5%
  earningsWithdrawal: 0.03, // 3%
  tokenRedemption: 0.02, // 2%
};

export class TokenBurnCalculator {
  private burnRates: BurnRateConfig;

  constructor(burnRates: BurnRateConfig = DEFAULT_BURN_RATES) {
    this.burnRates = burnRates;
  }

  /**
   * Calculate burn amount for a transaction
   */
  calculateBurn(
    amount: number | Decimal,
    transactionType: BurnTransactionType
  ): BurnCalculation {
    try {
      const originalAmount = new Decimal(amount);

      // Validate amount
      if (originalAmount.lessThanOrEqualTo(0)) {
        throw new Error('Amount must be greater than 0');
      }

      // Get burn rate based on transaction type
      const burnRate = this.getBurnRate(transactionType);

      // Calculate burned amount
      const burnedAmount = originalAmount.times(new Decimal(burnRate));

      // Calculate net amount (after burn)
      const netAmount = originalAmount.minus(burnedAmount);

      logger.debug('Burn calculated', {
        originalAmount: originalAmount.toString(),
        burnRate,
        burnedAmount: burnedAmount.toString(),
        netAmount: netAmount.toString(),
        transactionType,
      });

      return {
        originalAmount,
        burnRate,
        burnedAmount,
        netAmount,
      };
    } catch (error) {
      logger.error('Failed to calculate burn', { error, amount, transactionType });
      throw error;
    }
  }

  /**
   * Get burn rate for transaction type
   */
  private getBurnRate(transactionType: BurnTransactionType): number {
    switch (transactionType) {
      case BurnTransactionType.COURSE_SALE:
        return this.burnRates.courseSale;
      case BurnTransactionType.EARNINGS_WITHDRAWAL:
        return this.burnRates.earningsWithdrawal;
      case BurnTransactionType.TOKEN_REDEMPTION:
        return this.burnRates.tokenRedemption;
      default:
        throw new Error(`Unknown transaction type: ${transactionType}`);
    }
  }

  /**
   * Calculate multiple burns
   */
  calculateBulkBurns(
    transactions: Array<{ amount: number | Decimal; type: BurnTransactionType }>
  ): BurnCalculation[] {
    return transactions.map((tx) => this.calculateBurn(tx.amount, tx.type));
  }

  /**
   * Calculate total burn from multiple transactions
   */
  calculateTotalBurn(
    transactions: Array<{ amount: number | Decimal; type: BurnTransactionType }>
  ): Decimal {
    return transactions.reduce((total, tx) => {
      const calculation = this.calculateBurn(tx.amount, tx.type);
      return total.plus(calculation.burnedAmount);
    }, new Decimal(0));
  }

  /**
   * Validate burn transaction
   */
  validateBurnTransaction(
    amount: number | Decimal,
    transactionType: BurnTransactionType,
    userBalance: number | Decimal
  ): BurnValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const amountDecimal = new Decimal(amount);
      const balanceDecimal = new Decimal(userBalance);

      // Validate amount
      if (amountDecimal.lessThanOrEqualTo(0)) {
        errors.push('Amount must be greater than 0');
      }

      // Validate user has sufficient balance
      if (balanceDecimal.lessThan(amountDecimal)) {
        errors.push(
          `Insufficient balance. Required: ${amountDecimal.toString()}, Available: ${balanceDecimal.toString()}`
        );
      }

      // Validate transaction type
      if (!Object.values(BurnTransactionType).includes(transactionType)) {
        errors.push(`Invalid transaction type: ${transactionType}`);
      }

      // Calculate burn and check if user will have enough after burn
      const calculation = this.calculateBurn(amountDecimal, transactionType);
      if (balanceDecimal.lessThan(calculation.burnedAmount)) {
        warnings.push(
          `Burn amount (${calculation.burnedAmount.toString()}) is significant relative to balance`
        );
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      logger.error('Validation error', { error, amount, transactionType });
      return {
        isValid: false,
        errors: ['Validation failed: ' + (error instanceof Error ? error.message : 'Unknown error')],
        warnings,
      };
    }
  }

  /**
   * Calculate effective price after burn
   */
  calculateEffectivePrice(
    originalPrice: number | Decimal,
    transactionType: BurnTransactionType
  ): Decimal {
    const calculation = this.calculateBurn(originalPrice, transactionType);
    return calculation.netAmount;
  }

  /**
   * Calculate percentage loss due to burn
   */
  calculatePercentageLoss(
    _originalAmount: number | Decimal,
    transactionType: BurnTransactionType
  ): number {
    const burnRate = this.getBurnRate(transactionType);
    return burnRate * 100; // Convert to percentage
  }

  /**
   * Update burn rates
   */
  updateBurnRates(newRates: Partial<BurnRateConfig>): void {
    this.burnRates = {
      ...this.burnRates,
      ...newRates,
    };

    logger.info('Burn rates updated', { burnRates: this.burnRates });
  }

  /**
   * Get current burn rates
   */
  getBurnRates(): BurnRateConfig {
    return { ...this.burnRates };
  }

  /**
   * Calculate reverse burn (given net amount, calculate original)
   */
  calculateReverseBurn(
    netAmount: number | Decimal,
    transactionType: BurnTransactionType
  ): BurnCalculation {
    const burnRate = this.getBurnRate(transactionType);
    const netDecimal = new Decimal(netAmount);

    // originalAmount * (1 - burnRate) = netAmount
    // originalAmount = netAmount / (1 - burnRate)
    const divisor = new Decimal(1).minus(new Decimal(burnRate));
    const originalAmount = netDecimal.dividedBy(divisor);
    const burnedAmount = originalAmount.times(new Decimal(burnRate));

    return {
      originalAmount,
      burnRate,
      burnedAmount,
      netAmount: netDecimal,
    };
  }
}

export default new TokenBurnCalculator();
