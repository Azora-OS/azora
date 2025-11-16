/**
 * Burn Integration Tests
 * Tests for token burn mechanism integration into payment flows
 */

import { Decimal } from '@prisma/client/runtime/library';
import { BurnIntegrationService, createBurnIntegrationService } from '../../services/tokens/burn-integration';
import { TokenBurnCalculator } from '../../services/tokens/token-burn-calculator';
import { BurnTransactionType } from '../../services/tokens/token-burn.types';

describe('Burn Integration Tests', () => {
  let burnService: BurnIntegrationService;
  let calculator: TokenBurnCalculator;

  beforeEach(() => {
    calculator = new TokenBurnCalculator();
    burnService = createBurnIntegrationService();
  });

  describe('Course Sale Burn', () => {
    it('should calculate 5% burn on course sale', () => {
      const saleAmount = new Decimal(100);
      const calculation = calculator.calculateBurn(saleAmount, BurnTransactionType.COURSE_SALE);

      expect(calculation.originalAmount.toString()).toBe('100');
      expect(calculation.burnRate).toBe(0.05);
      expect(calculation.burnedAmount.toString()).toBe('5');
      expect(calculation.netAmount.toString()).toBe('95');
    });

    it('should handle decimal amounts correctly', () => {
      const saleAmount = new Decimal('99.99');
      const calculation = calculator.calculateBurn(saleAmount, BurnTransactionType.COURSE_SALE);

      expect(calculation.burnedAmount.toNumber()).toBeCloseTo(4.9995, 4);
      expect(calculation.netAmount.toNumber()).toBeCloseTo(94.9905, 4);
    });

    it('should validate burn transaction before execution', () => {
      const amount = new Decimal(100);
      const userBalance = new Decimal(50);

      const validation = calculator.validateBurnTransaction(
        amount,
        BurnTransactionType.COURSE_SALE,
        userBalance
      );

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        'Insufficient balance. Required: 100, Available: 50'
      );
    });

    it('should pass validation with sufficient balance', () => {
      const amount = new Decimal(100);
      const userBalance = new Decimal(150);

      const validation = calculator.validateBurnTransaction(
        amount,
        BurnTransactionType.COURSE_SALE,
        userBalance
      );

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Earnings Withdrawal Burn', () => {
    it('should calculate 3% burn on earnings withdrawal', () => {
      const withdrawalAmount = new Decimal(1000);
      const calculation = calculator.calculateBurn(
        withdrawalAmount,
        BurnTransactionType.EARNINGS_WITHDRAWAL
      );

      expect(calculation.originalAmount.toString()).toBe('1000');
      expect(calculation.burnRate).toBe(0.03);
      expect(calculation.burnedAmount.toString()).toBe('30');
      expect(calculation.netAmount.toString()).toBe('970');
    });

    it('should handle large withdrawal amounts', () => {
      const withdrawalAmount = new Decimal('50000');
      const calculation = calculator.calculateBurn(
        withdrawalAmount,
        BurnTransactionType.EARNINGS_WITHDRAWAL
      );

      expect(calculation.burnedAmount.toString()).toBe('1500');
      expect(calculation.netAmount.toString()).toBe('48500');
    });

    it('should calculate percentage loss correctly', () => {
      const percentageLoss = calculator.calculatePercentageLoss(
        new Decimal(1000),
        BurnTransactionType.EARNINGS_WITHDRAWAL
      );

      expect(percentageLoss).toBe(3);
    });
  });

  describe('Token Redemption Burn', () => {
    it('should calculate 2% burn on token redemption', () => {
      const redemptionAmount = new Decimal(500);
      const calculation = calculator.calculateBurn(
        redemptionAmount,
        BurnTransactionType.TOKEN_REDEMPTION
      );

      expect(calculation.originalAmount.toString()).toBe('500');
      expect(calculation.burnRate).toBe(0.02);
      expect(calculation.burnedAmount.toString()).toBe('10');
      expect(calculation.netAmount.toString()).toBe('490');
    });

    it('should handle small redemption amounts', () => {
      const redemptionAmount = new Decimal('10');
      const calculation = calculator.calculateBurn(
        redemptionAmount,
        BurnTransactionType.TOKEN_REDEMPTION
      );

      expect(calculation.burnedAmount.toString()).toBe('0.2');
      expect(calculation.netAmount.toString()).toBe('9.8');
    });
  });

  describe('Bulk Burn Calculations', () => {
    it('should calculate multiple burns', () => {
      const transactions = [
        { amount: new Decimal(100), type: BurnTransactionType.COURSE_SALE },
        { amount: new Decimal(1000), type: BurnTransactionType.EARNINGS_WITHDRAWAL },
        { amount: new Decimal(500), type: BurnTransactionType.TOKEN_REDEMPTION },
      ];

      const calculations = calculator.calculateBulkBurns(transactions);

      expect(calculations).toHaveLength(3);
      expect(calculations[0].burnedAmount.toString()).toBe('5'); // 5%
      expect(calculations[1].burnedAmount.toString()).toBe('30'); // 3%
      expect(calculations[2].burnedAmount.toString()).toBe('10'); // 2%
    });

    it('should calculate total burn from multiple transactions', () => {
      const transactions = [
        { amount: new Decimal(100), type: BurnTransactionType.COURSE_SALE },
        { amount: new Decimal(1000), type: BurnTransactionType.EARNINGS_WITHDRAWAL },
        { amount: new Decimal(500), type: BurnTransactionType.TOKEN_REDEMPTION },
      ];

      const totalBurn = calculator.calculateTotalBurn(transactions);

      expect(totalBurn.toString()).toBe('45'); // 5 + 30 + 10
    });
  });

  describe('Effective Price Calculations', () => {
    it('should calculate effective price after burn for course sale', () => {
      const originalPrice = new Decimal(100);
      const effectivePrice = calculator.calculateEffectivePrice(
        originalPrice,
        BurnTransactionType.COURSE_SALE
      );

      expect(effectivePrice.toString()).toBe('95');
    });

    it('should calculate effective price after burn for withdrawal', () => {
      const originalAmount = new Decimal(1000);
      const effectiveAmount = calculator.calculateEffectivePrice(
        originalAmount,
        BurnTransactionType.EARNINGS_WITHDRAWAL
      );

      expect(effectiveAmount.toString()).toBe('970');
    });

    it('should calculate reverse burn correctly', () => {
      const netAmount = new Decimal(95);
      const calculation = calculator.calculateReverseBurn(
        netAmount,
        BurnTransactionType.COURSE_SALE
      );

      expect(calculation.originalAmount.toString()).toBe('100');
      expect(calculation.burnedAmount.toString()).toBe('5');
      expect(calculation.netAmount.toString()).toBe('95');
    });
  });

  describe('Burn Rate Configuration', () => {
    it('should allow custom burn rates', () => {
      const customCalculator = new TokenBurnCalculator({
        courseSale: 0.1, // 10%
        earningsWithdrawal: 0.05, // 5%
        tokenRedemption: 0.03, // 3%
      });

      const calculation = customCalculator.calculateBurn(
        new Decimal(100),
        BurnTransactionType.COURSE_SALE
      );

      expect(calculation.burnedAmount.toString()).toBe('10');
    });

    it('should update burn rates dynamically', () => {
      calculator.updateBurnRates({
        courseSale: 0.08,
      });

      const rates = calculator.getBurnRates();
      expect(rates.courseSale).toBe(0.08);
      expect(rates.earningsWithdrawal).toBe(0.03); // Unchanged
    });

    it('should get current burn rates', () => {
      const rates = calculator.getBurnRates();

      expect(rates.courseSale).toBe(0.05);
      expect(rates.earningsWithdrawal).toBe(0.03);
      expect(rates.tokenRedemption).toBe(0.02);
    });
  });

  describe('Error Handling', () => {
    it('should reject zero amount', () => {
      expect(() => {
        calculator.calculateBurn(new Decimal(0), BurnTransactionType.COURSE_SALE);
      }).toThrow('Amount must be greater than 0');
    });

    it('should reject negative amount', () => {
      expect(() => {
        calculator.calculateBurn(new Decimal(-100), BurnTransactionType.COURSE_SALE);
      }).toThrow('Amount must be greater than 0');
    });

    it('should reject invalid transaction type', () => {
      const validation = calculator.validateBurnTransaction(
        new Decimal(100),
        'INVALID_TYPE' as any,
        new Decimal(200)
      );

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should handle validation with zero balance', () => {
      const validation = calculator.validateBurnTransaction(
        new Decimal(100),
        BurnTransactionType.COURSE_SALE,
        new Decimal(0)
      );

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        'Insufficient balance. Required: 100, Available: 0'
      );
    });
  });

  describe('Burn Impact Analysis', () => {
    it('should calculate burn impact for course sale', async () => {
      const impact = await burnService.getBurnImpact(
        new Decimal(100),
        BurnTransactionType.COURSE_SALE
      );

      expect(impact.originalAmount.toString()).toBe('100');
      expect(impact.burnedAmount.toString()).toBe('5');
      expect(impact.netAmount.toString()).toBe('95');
      expect(impact.burnPercentage).toBe(5);
    });

    it('should calculate burn impact for withdrawal', async () => {
      const impact = await burnService.getBurnImpact(
        new Decimal(1000),
        BurnTransactionType.EARNINGS_WITHDRAWAL
      );

      expect(impact.originalAmount.toString()).toBe('1000');
      expect(impact.burnedAmount.toString()).toBe('30');
      expect(impact.netAmount.toString()).toBe('970');
      expect(impact.burnPercentage).toBe(3);
    });

    it('should calculate burn impact for redemption', async () => {
      const impact = await burnService.getBurnImpact(
        new Decimal(500),
        BurnTransactionType.TOKEN_REDEMPTION
      );

      expect(impact.originalAmount.toString()).toBe('500');
      expect(impact.burnedAmount.toString()).toBe('10');
      expect(impact.netAmount.toString()).toBe('490');
      expect(impact.burnPercentage).toBe(2);
    });
  });

  describe('Burn Validation', () => {
    it('should validate burn transaction with sufficient balance', async () => {
      const validation = await burnService.validateBurnTransaction(
        'user-123',
        new Decimal(100),
        BurnTransactionType.COURSE_SALE,
        new Decimal(500)
      );

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject burn transaction with insufficient balance', async () => {
      const validation = await burnService.validateBurnTransaction(
        'user-123',
        new Decimal(100),
        BurnTransactionType.COURSE_SALE,
        new Decimal(50)
      );

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should warn on significant burn relative to balance', async () => {
      const validation = await burnService.validateBurnTransaction(
        'user-123',
        new Decimal(100),
        BurnTransactionType.COURSE_SALE,
        new Decimal(5) // Only 5 tokens, burn is 5 tokens (100% of balance)
      );

      expect(validation.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Burn Rate Comparison', () => {
    it('should show course sale has highest burn rate', () => {
      const rates = calculator.getBurnRates();

      expect(rates.courseSale).toBeGreaterThan(rates.earningsWithdrawal);
      expect(rates.earningsWithdrawal).toBeGreaterThan(rates.tokenRedemption);
    });

    it('should calculate burn impact differences across transaction types', () => {
      const amount = new Decimal(1000);

      const saleBurn = calculator.calculateBurn(amount, BurnTransactionType.COURSE_SALE);
      const withdrawalBurn = calculator.calculateBurn(
        amount,
        BurnTransactionType.EARNINGS_WITHDRAWAL
      );
      const redemptionBurn = calculator.calculateBurn(
        amount,
        BurnTransactionType.TOKEN_REDEMPTION
      );

      expect(saleBurn.burnedAmount.toNumber()).toBeGreaterThan(
        withdrawalBurn.burnedAmount.toNumber()
      );
      expect(withdrawalBurn.burnedAmount.toNumber()).toBeGreaterThan(
        redemptionBurn.burnedAmount.toNumber()
      );
    });
  });
});
