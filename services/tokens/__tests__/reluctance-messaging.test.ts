/**
 * Tests for Reluctance Messaging Service
 */

import { Decimal } from '@prisma/client/runtime/library';
import { ReluctanceMessagingService } from '../reluctance-messaging';
import { TokenBurnCalculator } from '../token-burn-calculator';
import { BurnTransactionType } from '../token-burn.types';

describe('ReluctanceMessagingService', () => {
  let reluctanceService: ReluctanceMessagingService;
  let burnCalculator: TokenBurnCalculator;

  beforeEach(() => {
    burnCalculator = new TokenBurnCalculator();
    reluctanceService = new ReluctanceMessagingService(burnCalculator);
  });

  describe('calculateEffectiveSellPrice', () => {
    it('should calculate effective price after burn for course sale', () => {
      const originalPrice = new Decimal(100);
      const effectivePrice = reluctanceService.calculateEffectiveSellPrice(
        originalPrice,
        BurnTransactionType.COURSE_SALE
      );

      // 5% burn = 95 net
      expect(effectivePrice.toString()).toBe('95');
    });

    it('should calculate effective price after burn for withdrawal', () => {
      const originalPrice = new Decimal(100);
      const effectivePrice = reluctanceService.calculateEffectiveSellPrice(
        originalPrice,
        BurnTransactionType.EARNINGS_WITHDRAWAL
      );

      // 3% burn = 97 net
      expect(effectivePrice.toString()).toBe('97');
    });

    it('should calculate effective price after burn for redemption', () => {
      const originalPrice = new Decimal(100);
      const effectivePrice = reluctanceService.calculateEffectiveSellPrice(
        originalPrice,
        BurnTransactionType.TOKEN_REDEMPTION
      );

      // 2% burn = 98 net
      expect(effectivePrice.toString()).toBe('98');
    });
  });

  describe('calculateBurnImpact', () => {
    it('should calculate burn impact correctly', () => {
      const impact = reluctanceService.calculateBurnImpact(
        100,
        BurnTransactionType.EARNINGS_WITHDRAWAL
      );

      expect(impact.burnedAmount.toString()).toBe('3');
      expect(impact.netAmount.toString()).toBe('97');
      expect(impact.percentageLoss).toBe(0.03);
    });

    it('should handle decimal amounts', () => {
      const impact = reluctanceService.calculateBurnImpact(
        new Decimal('123.45'),
        BurnTransactionType.COURSE_SALE
      );

      expect(impact.burnedAmount.toString()).toBe('6.1725');
      expect(impact.netAmount.toString()).toBe('117.2775');
      expect(impact.percentageLoss).toBe(0.05);
    });
  });

  describe('generateReluctanceMessage', () => {
    it('should generate message for withdrawal', () => {
      const message = reluctanceService.generateReluctanceMessage(
        100,
        BurnTransactionType.EARNINGS_WITHDRAWAL,
        5000
      );

      expect(message.effectiveSellPrice.toString()).toBe('97');
      expect(message.burnImpact.toString()).toBe('3');
      expect(message.percentageLoss).toBe(0.03);
      expect(message.message).toContain('withdraw');
      expect(message.educationalContent).toBeTruthy();
    });

    it('should generate message for course sale', () => {
      const message = reluctanceService.generateReluctanceMessage(
        100,
        BurnTransactionType.COURSE_SALE,
        5000
      );

      expect(message.effectiveSellPrice.toString()).toBe('95');
      expect(message.burnImpact.toString()).toBe('5');
      expect(message.percentageLoss).toBe(0.05);
      expect(message.message).toContain('sell');
    });

    it('should generate message for redemption', () => {
      const message = reluctanceService.generateReluctanceMessage(
        100,
        BurnTransactionType.TOKEN_REDEMPTION,
        5000
      );

      expect(message.effectiveSellPrice.toString()).toBe('98');
      expect(message.burnImpact.toString()).toBe('2');
      expect(message.percentageLoss).toBe(0.02);
      expect(message.message).toContain('redeem');
    });

    it('should include ownership loss in message', () => {
      const message = reluctanceService.generateReluctanceMessage(
        500,
        BurnTransactionType.EARNINGS_WITHDRAWAL,
        5000
      );

      // 500 out of 5000 = 10% ownership loss
      expect(message.message).toContain('10');
    });
  });

  describe('generateWarningMessage', () => {
    it('should not generate warning for small burns', () => {
      const warning = reluctanceService.generateWarningMessage(
        100,
        BurnTransactionType.TOKEN_REDEMPTION
      );

      // 2% burn is at threshold, should not warn
      expect(warning).toBeNull();
    });

    it('should generate warning for significant burns', () => {
      const warning = reluctanceService.generateWarningMessage(
        100,
        BurnTransactionType.COURSE_SALE
      );

      // 5% burn should warn
      expect(warning).toBeTruthy();
      expect(warning).toContain('Significant Loss Warning');
      expect(warning).toContain('5');
    });

    it('should generate strong warning for very significant burns', () => {
      const warning = reluctanceService.generateWarningMessage(
        1000,
        BurnTransactionType.COURSE_SALE
      );

      // 5% burn on large amount
      expect(warning).toBeTruthy();
      expect(warning).toContain('Significant Loss Warning');
    });
  });

  describe('calculateOriginalPriceFromNet', () => {
    it('should reverse calculate original price from net', () => {
      const netAmount = new Decimal(97);
      const originalPrice = reluctanceService.calculateOriginalPriceFromNet(
        netAmount,
        BurnTransactionType.EARNINGS_WITHDRAWAL
      );

      // Should be approximately 100
      expect(originalPrice.toFixed(2)).toBe('100.00');
    });

    it('should handle decimal precision', () => {
      const netAmount = new Decimal('97.5');
      const originalPrice = reluctanceService.calculateOriginalPriceFromNet(
        netAmount,
        BurnTransactionType.EARNINGS_WITHDRAWAL
      );

      // Verify round-trip calculation
      const backToNet = reluctanceService.calculateEffectiveSellPrice(
        originalPrice,
        BurnTransactionType.EARNINGS_WITHDRAWAL
      );

      expect(backToNet.toFixed(2)).toBe(netAmount.toFixed(2));
    });
  });

  describe('getEducationalContent', () => {
    it('should return all educational content', () => {
      const content = reluctanceService.getEducationalContent();

      expect(content.tokenEconomics).toBeTruthy();
      expect(content.burnMechanism).toBeTruthy();
      expect(content.holdingBenefits).toBeTruthy();
      expect(content.alternativeUses).toBeTruthy();
    });

    it('should contain HTML formatting', () => {
      const content = reluctanceService.getEducationalContent();

      expect(content.tokenEconomics).toContain('<h3>');
      expect(content.tokenEconomics).toContain('<ul>');
      expect(content.tokenEconomics).toContain('<li>');
    });
  });

  describe('generateComprehensiveReport', () => {
    it('should generate complete report with financial impact', () => {
      const report = reluctanceService.generateComprehensiveReport(
        100,
        BurnTransactionType.EARNINGS_WITHDRAWAL,
        5000,
        0.50 // $0.50 per token
      );

      expect(report.reluctanceMessage).toBeTruthy();
      expect(report.warningMessage).toBeNull(); // 3% is not significant
      expect(report.financialImpact).toBeTruthy();
      expect(report.recommendations).toBeTruthy();

      // Verify financial calculations
      expect(report.financialImpact.burnedTokens.toString()).toBe('3');
      expect(report.financialImpact.netTokens.toString()).toBe('97');
      expect(report.financialImpact.burnedUSD.toString()).toBe('1.5');
      expect(report.financialImpact.netUSD.toString()).toBe('48.5');
    });

    it('should include warning in comprehensive report for significant burns', () => {
      const report = reluctanceService.generateComprehensiveReport(
        100,
        BurnTransactionType.COURSE_SALE,
        5000,
        0.50
      );

      expect(report.warningMessage).toBeTruthy();
      expect(report.warningMessage).toContain('Significant Loss Warning');
    });

    it('should generate personalized recommendations', () => {
      const report = reluctanceService.generateComprehensiveReport(
        100,
        BurnTransactionType.EARNINGS_WITHDRAWAL,
        5000,
        0.50
      );

      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.recommendations[0]).toContain('holding');
    });

    it('should include course-specific recommendations for course sales', () => {
      const report = reluctanceService.generateComprehensiveReport(
        100,
        BurnTransactionType.COURSE_SALE,
        5000,
        0.50
      );

      const courseRecommendations = report.recommendations.filter((r) =>
        r.toLowerCase().includes('course')
      );
      expect(courseRecommendations.length).toBeGreaterThan(0);
    });

    it('should include redemption-specific recommendations for redemptions', () => {
      const report = reluctanceService.generateComprehensiveReport(
        100,
        BurnTransactionType.TOKEN_REDEMPTION,
        5000,
        0.50
      );

      const redemptionRecommendations = report.recommendations.filter((r) =>
        r.toLowerCase().includes('alternative')
      );
      expect(redemptionRecommendations.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle very small amounts', () => {
      const message = reluctanceService.generateReluctanceMessage(
        new Decimal('0.01'),
        BurnTransactionType.TOKEN_REDEMPTION,
        100
      );

      expect(message.effectiveSellPrice).toBeTruthy();
      expect(message.burnImpact).toBeTruthy();
    });

    it('should handle very large amounts', () => {
      const message = reluctanceService.generateReluctanceMessage(
        new Decimal('1000000'),
        BurnTransactionType.EARNINGS_WITHDRAWAL,
        5000000
      );

      expect(message.effectiveSellPrice).toBeTruthy();
      expect(message.burnImpact).toBeTruthy();
    });

    it('should handle user balance equal to transaction amount', () => {
      const message = reluctanceService.generateReluctanceMessage(
        100,
        BurnTransactionType.EARNINGS_WITHDRAWAL,
        100
      );

      expect(message.message).toContain('100'); // 100% ownership loss
    });

    it('should handle user balance much larger than transaction', () => {
      const message = reluctanceService.generateReluctanceMessage(
        100,
        BurnTransactionType.EARNINGS_WITHDRAWAL,
        1000000
      );

      expect(message.message).toBeTruthy();
      expect(message.percentageLoss).toBe(0.03);
    });
  });

  describe('message content quality', () => {
    it('should include specific burn percentage in message', () => {
      const message = reluctanceService.generateReluctanceMessage(
        100,
        BurnTransactionType.COURSE_SALE,
        5000
      );

      expect(message.message).toContain('5');
    });

    it('should include effective price in message', () => {
      const message = reluctanceService.generateReluctanceMessage(
        100,
        BurnTransactionType.EARNINGS_WITHDRAWAL,
        5000
      );

      expect(message.message).toContain('97');
    });

    it('should include educational content reference', () => {
      const message = reluctanceService.generateReluctanceMessage(
        100,
        BurnTransactionType.EARNINGS_WITHDRAWAL,
        5000
      );

      expect(message.educationalContent).toContain('<h3>');
    });
  });
});
