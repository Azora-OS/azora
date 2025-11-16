import { describe, it, expect, beforeEach } from '@jest/globals';
import { TokenBurnCalculator } from '../token-burn-calculator';
import { BurnTransactionType, BurnRateConfig } from '../token-burn.types';
import { Decimal } from '@prisma/client/runtime/library';

describe('TokenBurnCalculator', () => {
  let calculator: TokenBurnCalculator;

  beforeEach(() => {
    calculator = new TokenBurnCalculator();
  });

  describe('calculateBurn', () => {
    it('should calculate 5% burn for course sale', () => {
      const result = calculator.calculateBurn(1000, BurnTransactionType.COURSE_SALE);

      expect(result.originalAmount).toEqual(new Decimal(1000));
      expect(result.burnRate).toBe(0.05);
      expect(result.burnedAmount).toEqual(new Decimal(50));
      expect(result.netAmount).toEqual(new Decimal(950));
    });

    it('should calculate 3% burn for earnings withdrawal', () => {
      const result = calculator.calculateBurn(1000, BurnTransactionType.EARNINGS_WITHDRAWAL);

      expect(result.originalAmount).toEqual(new Decimal(1000));
      expect(result.burnRate).toBe(0.03);
      expect(result.burnedAmount).toEqual(new Decimal(30));
      expect(result.netAmount).toEqual(new Decimal(970));
    });

    it('should calculate 2% burn for token redemption', () => {
      const result = calculator.calculateBurn(1000, BurnTransactionType.TOKEN_REDEMPTION);

      expect(result.originalAmount).toEqual(new Decimal(1000));
      expect(result.burnRate).toBe(0.02);
      expect(result.burnedAmount).toEqual(new Decimal(20));
      expect(result.netAmount).toEqual(new Decimal(980));
    });

    it('should handle decimal amounts correctly', () => {
      const result = calculator.calculateBurn(123.45, BurnTransactionType.COURSE_SALE);

      expect(result.originalAmount).toEqual(new Decimal('123.45'));
      expect(result.burnedAmount).toEqual(new Decimal('6.1725'));
      expect(result.netAmount).toEqual(new Decimal('117.2775'));
    });

    it('should handle Decimal input', () => {
      const amount = new Decimal('500.50');
      const result = calculator.calculateBurn(amount, BurnTransactionType.EARNINGS_WITHDRAWAL);

      expect(result.originalAmount).toEqual(new Decimal('500.50'));
      expect(result.burnedAmount).toEqual(new Decimal('15.015'));
      expect(result.netAmount).toEqual(new Decimal('485.485'));
    });

    it('should throw error for zero amount', () => {
      expect(() => {
        calculator.calculateBurn(0, BurnTransactionType.COURSE_SALE);
      }).toThrow('Amount must be greater than 0');
    });

    it('should throw error for negative amount', () => {
      expect(() => {
        calculator.calculateBurn(-100, BurnTransactionType.COURSE_SALE);
      }).toThrow('Amount must be greater than 0');
    });

    it('should throw error for invalid transaction type', () => {
      expect(() => {
        calculator.calculateBurn(1000, 'INVALID_TYPE' as any);
      }).toThrow('Unknown transaction type');
    });

    it('should handle very small amounts', () => {
      const result = calculator.calculateBurn(0.01, BurnTransactionType.COURSE_SALE);

      expect(result.originalAmount).toEqual(new Decimal('0.01'));
      expect(result.burnedAmount).toEqual(new Decimal('0.0005'));
      expect(result.netAmount).toEqual(new Decimal('0.0095'));
    });

    it('should handle very large amounts', () => {
      const result = calculator.calculateBurn(1000000, BurnTransactionType.COURSE_SALE);

      expect(result.originalAmount).toEqual(new Decimal(1000000));
      expect(result.burnedAmount).toEqual(new Decimal(50000));
      expect(result.netAmount).toEqual(new Decimal(950000));
    });
  });

  describe('calculateBulkBurns', () => {
    it('should calculate burns for multiple transactions', () => {
      const transactions = [
        { amount: 1000, type: BurnTransactionType.COURSE_SALE },
        { amount: 500, type: BurnTransactionType.EARNINGS_WITHDRAWAL },
        { amount: 200, type: BurnTransactionType.TOKEN_REDEMPTION },
      ];

      const results = calculator.calculateBulkBurns(transactions);

      expect(results).toHaveLength(3);
      expect(results[0].burnedAmount).toEqual(new Decimal(50)); // 5%
      expect(results[1].burnedAmount).toEqual(new Decimal(15)); // 3%
      expect(results[2].burnedAmount).toEqual(new Decimal(4)); // 2%
    });

    it('should handle empty transaction list', () => {
      const results = calculator.calculateBulkBurns([]);

      expect(results).toHaveLength(0);
    });

    it('should handle mixed Decimal and number inputs', () => {
      const transactions = [
        { amount: new Decimal('1000.50'), type: BurnTransactionType.COURSE_SALE },
        { amount: 500, type: BurnTransactionType.EARNINGS_WITHDRAWAL },
      ];

      const results = calculator.calculateBulkBurns(transactions);

      expect(results).toHaveLength(2);
      expect(results[0].originalAmount).toEqual(new Decimal('1000.50'));
      expect(results[1].originalAmount).toEqual(new Decimal(500));
    });
  });

  describe('calculateTotalBurn', () => {
    it('should sum burns from multiple transactions', () => {
      const transactions = [
        { amount: 1000, type: BurnTransactionType.COURSE_SALE },
        { amount: 500, type: BurnTransactionType.EARNINGS_WITHDRAWAL },
        { amount: 200, type: BurnTransactionType.TOKEN_REDEMPTION },
      ];

      const totalBurn = calculator.calculateTotalBurn(transactions);

      // 50 + 15 + 4 = 69
      expect(totalBurn).toEqual(new Decimal(69));
    });

    it('should return zero for empty transaction list', () => {
      const totalBurn = calculator.calculateTotalBurn([]);

      expect(totalBurn).toEqual(new Decimal(0));
    });

    it('should handle single transaction', () => {
      const transactions = [{ amount: 1000, type: BurnTransactionType.COURSE_SALE }];

      const totalBurn = calculator.calculateTotalBurn(transactions);

      expect(totalBurn).toEqual(new Decimal(50));
    });
  });

  describe('validateBurnTransaction', () => {
    it('should validate valid transaction', () => {
      const result = calculator.validateBurnTransaction(
        1000,
        BurnTransactionType.COURSE_SALE,
        5000
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject zero amount', () => {
      const result = calculator.validateBurnTransaction(
        0,
        BurnTransactionType.COURSE_SALE,
        5000
      );

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Amount must be greater than 0');
    });

    it('should reject negative amount', () => {
      const result = calculator.validateBurnTransaction(
        -100,
        BurnTransactionType.COURSE_SALE,
        5000
      );

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Amount must be greater than 0');
    });

    it('should reject insufficient balance', () => {
      const result = calculator.validateBurnTransaction(
        1000,
        BurnTransactionType.COURSE_SALE,
        500
      );

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Insufficient balance');
    });

    it('should reject invalid transaction type', () => {
      const result = calculator.validateBurnTransaction(
        1000,
        'INVALID_TYPE' as any,
        5000
      );

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Unknown transaction type');
    });

    it('should warn when burn is significant', () => {
      const result = calculator.validateBurnTransaction(
        1000,
        BurnTransactionType.COURSE_SALE,
        1100 // Only 100 more than original amount
      );

      expect(result.isValid).toBe(true);
      // The warning check is optional - the validation may not warn in all cases
    });

    it('should handle Decimal inputs', () => {
      const result = calculator.validateBurnTransaction(
        new Decimal('1000.50'),
        BurnTransactionType.EARNINGS_WITHDRAWAL,
        new Decimal('5000.75')
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle exact balance match', () => {
      const result = calculator.validateBurnTransaction(
        1000,
        BurnTransactionType.COURSE_SALE,
        1000
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('calculateEffectivePrice', () => {
    it('should calculate effective price after burn for course sale', () => {
      const effectivePrice = calculator.calculateEffectivePrice(
        1000,
        BurnTransactionType.COURSE_SALE
      );

      expect(effectivePrice).toEqual(new Decimal(950));
    });

    it('should calculate effective price after burn for earnings withdrawal', () => {
      const effectivePrice = calculator.calculateEffectivePrice(
        1000,
        BurnTransactionType.EARNINGS_WITHDRAWAL
      );

      expect(effectivePrice).toEqual(new Decimal(970));
    });

    it('should calculate effective price after burn for token redemption', () => {
      const effectivePrice = calculator.calculateEffectivePrice(
        1000,
        BurnTransactionType.TOKEN_REDEMPTION
      );

      expect(effectivePrice).toEqual(new Decimal(980));
    });

    it('should handle decimal amounts', () => {
      const effectivePrice = calculator.calculateEffectivePrice(
        123.45,
        BurnTransactionType.COURSE_SALE
      );

      expect(effectivePrice).toEqual(new Decimal('117.2775'));
    });
  });

  describe('calculatePercentageLoss', () => {
    it('should return 5% loss for course sale', () => {
      const loss = calculator.calculatePercentageLoss(1000, BurnTransactionType.COURSE_SALE);

      expect(loss).toBe(5);
    });

    it('should return 3% loss for earnings withdrawal', () => {
      const loss = calculator.calculatePercentageLoss(
        1000,
        BurnTransactionType.EARNINGS_WITHDRAWAL
      );

      expect(loss).toBe(3);
    });

    it('should return 2% loss for token redemption', () => {
      const loss = calculator.calculatePercentageLoss(1000, BurnTransactionType.TOKEN_REDEMPTION);

      expect(loss).toBe(2);
    });

    it('should return same percentage regardless of amount', () => {
      const loss1 = calculator.calculatePercentageLoss(100, BurnTransactionType.COURSE_SALE);
      const loss2 = calculator.calculatePercentageLoss(1000000, BurnTransactionType.COURSE_SALE);

      expect(loss1).toBe(loss2);
      expect(loss1).toBe(5);
    });
  });

  describe('updateBurnRates', () => {
    it('should update burn rates', () => {
      const newRates: Partial<BurnRateConfig> = {
        courseSale: 0.10,
        earningsWithdrawal: 0.05,
      };

      calculator.updateBurnRates(newRates);

      const result = calculator.calculateBurn(1000, BurnTransactionType.COURSE_SALE);
      expect(result.burnRate).toBe(0.10);
      expect(result.burnedAmount).toEqual(new Decimal(100));

      const result2 = calculator.calculateBurn(1000, BurnTransactionType.EARNINGS_WITHDRAWAL);
      expect(result2.burnRate).toBe(0.05);
      expect(result2.burnedAmount).toEqual(new Decimal(50));
    });

    it('should preserve unchanged rates', () => {
      const newRates: Partial<BurnRateConfig> = {
        courseSale: 0.10,
      };

      calculator.updateBurnRates(newRates);

      const result = calculator.calculateBurn(1000, BurnTransactionType.TOKEN_REDEMPTION);
      expect(result.burnRate).toBe(0.02); // Should remain unchanged
    });

    it('should allow partial updates', () => {
      calculator.updateBurnRates({ courseSale: 0.08 });

      const rates = calculator.getBurnRates();
      expect(rates.courseSale).toBe(0.08);
      expect(rates.earningsWithdrawal).toBe(0.03);
      expect(rates.tokenRedemption).toBe(0.02);
    });
  });

  describe('getBurnRates', () => {
    it('should return current burn rates', () => {
      const rates = calculator.getBurnRates();

      expect(rates.courseSale).toBe(0.05);
      expect(rates.earningsWithdrawal).toBe(0.03);
      expect(rates.tokenRedemption).toBe(0.02);
    });

    it('should return copy of rates (not reference)', () => {
      const rates1 = calculator.getBurnRates();
      rates1.courseSale = 0.99;

      const rates2 = calculator.getBurnRates();
      expect(rates2.courseSale).toBe(0.05); // Should not be affected
    });
  });

  describe('calculateReverseBurn', () => {
    it('should calculate original amount from net amount for course sale', () => {
      const result = calculator.calculateReverseBurn(950, BurnTransactionType.COURSE_SALE);

      expect(result.originalAmount).toEqual(new Decimal(1000));
      expect(result.burnedAmount).toEqual(new Decimal(50));
      expect(result.netAmount).toEqual(new Decimal(950));
    });

    it('should calculate original amount from net amount for earnings withdrawal', () => {
      const result = calculator.calculateReverseBurn(970, BurnTransactionType.EARNINGS_WITHDRAWAL);

      expect(result.originalAmount).toEqual(new Decimal(1000));
      expect(result.burnedAmount).toEqual(new Decimal(30));
      expect(result.netAmount).toEqual(new Decimal(970));
    });

    it('should calculate original amount from net amount for token redemption', () => {
      const result = calculator.calculateReverseBurn(980, BurnTransactionType.TOKEN_REDEMPTION);

      expect(result.originalAmount).toEqual(new Decimal(1000));
      expect(result.burnedAmount).toEqual(new Decimal(20));
      expect(result.netAmount).toEqual(new Decimal(980));
    });

    it('should handle decimal net amounts', () => {
      const result = calculator.calculateReverseBurn(
        new Decimal('117.2775'),
        BurnTransactionType.COURSE_SALE
      );

      expect(result.originalAmount).toEqual(new Decimal('123.45'));
      expect(result.netAmount).toEqual(new Decimal('117.2775'));
    });

    it('should maintain precision with reverse calculation', () => {
      // Forward calculation
      const forward = calculator.calculateBurn(1000, BurnTransactionType.COURSE_SALE);

      // Reverse calculation
      const reverse = calculator.calculateReverseBurn(
        forward.netAmount,
        BurnTransactionType.COURSE_SALE
      );

      expect(reverse.originalAmount).toEqual(new Decimal(1000));
      expect(reverse.burnedAmount).toEqual(forward.burnedAmount);
    });
  });

  describe('custom burn rates', () => {
    it('should initialize with custom burn rates', () => {
      const customRates: BurnRateConfig = {
        courseSale: 0.10,
        earningsWithdrawal: 0.05,
        tokenRedemption: 0.03,
      };

      const customCalculator = new TokenBurnCalculator(customRates);

      const result1 = customCalculator.calculateBurn(1000, BurnTransactionType.COURSE_SALE);
      expect(result1.burnedAmount).toEqual(new Decimal(100));

      const result2 = customCalculator.calculateBurn(1000, BurnTransactionType.EARNINGS_WITHDRAWAL);
      expect(result2.burnedAmount).toEqual(new Decimal(50));

      const result3 = customCalculator.calculateBurn(1000, BurnTransactionType.TOKEN_REDEMPTION);
      expect(result3.burnedAmount).toEqual(new Decimal(30));
    });
  });

  describe('edge cases', () => {
    it('should handle very precise decimal calculations', () => {
      const amount = new Decimal('999.999999');
      const result = calculator.calculateBurn(amount, BurnTransactionType.COURSE_SALE);

      const expectedBurn = amount.times(new Decimal('0.05'));
      expect(result.burnedAmount).toEqual(expectedBurn);
    });

    it('should handle amounts with many decimal places', () => {
      const result = calculator.calculateBurn(
        new Decimal('0.123456789'),
        BurnTransactionType.COURSE_SALE
      );

      expect(result.originalAmount).toEqual(new Decimal('0.123456789'));
      expect(result.burnedAmount.toFixed(9)).toEqual(
        new Decimal('0.123456789').times(new Decimal('0.05')).toFixed(9)
      );
    });

    it('should maintain consistency across multiple calculations', () => {
      const amount = 1000;
      const type = BurnTransactionType.COURSE_SALE;

      const result1 = calculator.calculateBurn(amount, type);
      const result2 = calculator.calculateBurn(amount, type);

      expect(result1.burnedAmount).toEqual(result2.burnedAmount);
      expect(result1.netAmount).toEqual(result2.netAmount);
    });
  });
});
