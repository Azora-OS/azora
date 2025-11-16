/**
 * Psychological Reluctance-to-Sell Messaging Service
 * Calculates effective sell prices and generates messaging to discourage token sales
 */

import { Decimal } from '@prisma/client/runtime/library';
import { createLogger } from '../shared/logging';
import { TokenBurnCalculator } from './token-burn-calculator';
import { BurnTransactionType, ReluctanceMessage } from './token-burn.types';

const logger = createLogger('ReluctanceMessaging');

/**
 * Educational content about token economics
 */
const EDUCATIONAL_CONTENT = {
  tokenEconomics: `
    <h3>Understanding AZR Token Economics</h3>
    <p>AZR tokens are designed to appreciate over time through a deflationary mechanism:</p>
    <ul>
      <li><strong>Scarcity:</strong> Every transaction burns tokens, reducing total supply</li>
      <li><strong>Appreciation:</strong> As supply decreases, your remaining tokens become more valuable</li>
      <li><strong>Long-term Value:</strong> Holding tokens positions you to benefit from platform growth</li>
    </ul>
  `,
  burnMechanism: `
    <h3>How Token Burns Work</h3>
    <p>When you sell or withdraw earnings, a portion of tokens are permanently removed from circulation:</p>
    <ul>
      <li><strong>Course Sales:</strong> 5% burn rate - incentivizes quality content creation</li>
      <li><strong>Earnings Withdrawal:</strong> 3% burn rate - encourages long-term holding</li>
      <li><strong>Token Redemption:</strong> 2% burn rate - maintains token scarcity</li>
    </ul>
  `,
  holdingBenefits: `
    <h3>Benefits of Holding AZR Tokens</h3>
    <ul>
      <li><strong>Ownership Stake:</strong> Your percentage ownership increases as total supply decreases</li>
      <li><strong>Leaderboard Ranking:</strong> Higher ownership percentage improves your ranking</li>
      <li><strong>Governance Rights:</strong> Token holders have voting power on platform decisions</li>
      <li><strong>Appreciation Potential:</strong> Historical data shows deflationary tokens appreciate 2-5x annually</li>
    </ul>
  `,
  alternativeUses: `
    <h3>Alternative Uses for Your Tokens</h3>
    <p>Instead of selling, consider these alternatives:</p>
    <ul>
      <li><strong>Redeem for Premium Features:</strong> Unlock exclusive content and tools</li>
      <li><strong>Stake for Rewards:</strong> Earn additional tokens through staking</li>
      <li><strong>Donate to Causes:</strong> Support educational initiatives in your community</li>
      <li><strong>Hold for Growth:</strong> Let your tokens appreciate as the platform scales</li>
    </ul>
  `,
};

export class ReluctanceMessagingService {
  private burnCalculator: TokenBurnCalculator;

  constructor(burnCalculator?: TokenBurnCalculator) {
    this.burnCalculator = burnCalculator || new TokenBurnCalculator();
  }

  /**
   * Calculate effective sell price after burn
   */
  calculateEffectiveSellPrice(
    originalPrice: number | Decimal,
    transactionType: BurnTransactionType
  ): Decimal {
    return this.burnCalculator.calculateEffectivePrice(originalPrice, transactionType);
  }

  /**
   * Calculate burn impact for a transaction
   */
  calculateBurnImpact(
    amount: number | Decimal,
    transactionType: BurnTransactionType
  ): { burnedAmount: Decimal; netAmount: Decimal; percentageLoss: number } {
    const calculation = this.burnCalculator.calculateBurn(amount, transactionType);
    const percentageLoss = this.burnCalculator.calculatePercentageLoss(amount, transactionType);

    return {
      burnedAmount: calculation.burnedAmount,
      netAmount: calculation.netAmount,
      percentageLoss,
    };
  }

  /**
   * Generate reluctance message for a sell transaction
   */
  generateReluctanceMessage(
    amount: number | Decimal,
    transactionType: BurnTransactionType,
    userTokenBalance: number | Decimal
  ): ReluctanceMessage {
    try {
      const amountDecimal = new Decimal(amount);
      const calculation = this.burnCalculator.calculateBurn(amountDecimal, transactionType);
      const percentageLoss = this.burnCalculator.calculatePercentageLoss(amountDecimal, transactionType);

      // Calculate ownership impact
      const balanceDecimal = new Decimal(userTokenBalance);
      const ownershipLoss = amountDecimal.dividedBy(balanceDecimal).times(100);

      // Generate message based on transaction type and loss percentage
      const message = this.generateMessage(
        transactionType,
        percentageLoss,
        calculation.netAmount,
        ownershipLoss
      );

      // Select educational content based on context
      const educationalContent = this.selectEducationalContent(transactionType, percentageLoss);

      logger.debug('Reluctance message generated', {
        amount: amountDecimal.toString(),
        transactionType,
        percentageLoss,
        netAmount: calculation.netAmount.toString(),
      });

      return {
        effectiveSellPrice: calculation.netAmount,
        burnImpact: calculation.burnedAmount,
        percentageLoss,
        message,
        educationalContent,
      };
    } catch (error) {
      logger.error('Failed to generate reluctance message', { error, amount, transactionType });
      throw error;
    }
  }

  /**
   * Generate warning message for significant losses
   */
  generateWarningMessage(
    amount: number | Decimal,
    transactionType: BurnTransactionType
  ): string | null {
    const percentageLoss = this.burnCalculator.calculatePercentageLoss(amount, transactionType);

    // Only warn for significant losses (>2%)
    if (percentageLoss <= 0.02) {
      return null;
    }

    const amountDecimal = new Decimal(amount);
    const calculation = this.burnCalculator.calculateBurn(amountDecimal, transactionType);

    if (percentageLoss >= 0.05) {
      return `⚠️ <strong>Significant Loss Warning:</strong> You will lose ${(percentageLoss * 100).toFixed(1)}% (${calculation.burnedAmount.toString()} tokens) due to burn. Your effective proceeds will be ${calculation.netAmount.toString()} tokens.`;
    }

    return null;
  }

  /**
   * Generate message based on transaction type and loss
   */
  private generateMessage(
    transactionType: BurnTransactionType,
    percentageLoss: number,
    netAmount: Decimal,
    ownershipLoss: Decimal
  ): string {
    const lossPercentage = (percentageLoss * 100).toFixed(1);

    switch (transactionType) {
      case BurnTransactionType.COURSE_SALE:
        return `
          <p>You're about to sell course content. This will burn <strong>${lossPercentage}%</strong> of your proceeds.</p>
          <p>Instead of receiving the full amount, you'll receive <strong>${netAmount.toString()} tokens</strong>.</p>
          <p>Your ownership percentage will decrease by approximately <strong>${ownershipLoss.toFixed(2)}%</strong>.</p>
          <p>Consider: Would you rather keep this content and continue earning from it?</p>
        `;

      case BurnTransactionType.EARNINGS_WITHDRAWAL:
        return `
          <p>You're about to withdraw your earnings. This will burn <strong>${lossPercentage}%</strong> of your withdrawal.</p>
          <p>Instead of receiving the full amount, you'll receive <strong>${netAmount.toString()} tokens</strong>.</p>
          <p>Your ownership percentage will decrease by approximately <strong>${ownershipLoss.toFixed(2)}%</strong>.</p>
          <p>Consider: Your tokens are appreciating. Holding longer could yield better returns.</p>
        `;

      case BurnTransactionType.TOKEN_REDEMPTION:
        return `
          <p>You're about to redeem tokens for features. This will burn <strong>${lossPercentage}%</strong> of your tokens.</p>
          <p>Instead of redeeming the full amount, you'll redeem <strong>${netAmount.toString()} tokens</strong>.</p>
          <p>Your ownership percentage will decrease by approximately <strong>${ownershipLoss.toFixed(2)}%</strong>.</p>
          <p>Consider: Are there alternative ways to access these features?</p>
        `;

      default:
        return `You're about to perform a transaction that will burn ${lossPercentage}% of your tokens.`;
    }
  }

  /**
   * Select educational content based on context
   */
  private selectEducationalContent(
    transactionType: BurnTransactionType,
    percentageLoss: number
  ): string {
    // For high-loss transactions, emphasize holding benefits
    if (percentageLoss >= 0.05) {
      return EDUCATIONAL_CONTENT.holdingBenefits;
    }

    // For withdrawals, emphasize token economics
    if (transactionType === BurnTransactionType.EARNINGS_WITHDRAWAL) {
      return EDUCATIONAL_CONTENT.tokenEconomics;
    }

    // For redemptions, suggest alternatives
    if (transactionType === BurnTransactionType.TOKEN_REDEMPTION) {
      return EDUCATIONAL_CONTENT.alternativeUses;
    }

    // Default to burn mechanism explanation
    return EDUCATIONAL_CONTENT.burnMechanism;
  }

  /**
   * Calculate effective price for a given net amount (reverse calculation)
   */
  calculateOriginalPriceFromNet(
    netAmount: number | Decimal,
    transactionType: BurnTransactionType
  ): Decimal {
    const calculation = this.burnCalculator.calculateReverseBurn(netAmount, transactionType);
    return calculation.originalAmount;
  }

  /**
   * Get all educational content
   */
  getEducationalContent(): Record<string, string> {
    return EDUCATIONAL_CONTENT;
  }

  /**
   * Generate comprehensive reluctance report
   */
  generateComprehensiveReport(
    amount: number | Decimal,
    transactionType: BurnTransactionType,
    userTokenBalance: number | Decimal,
    currentTokenPrice: number | Decimal
  ): {
    reluctanceMessage: ReluctanceMessage;
    warningMessage: string | null;
    financialImpact: {
      burnedTokens: Decimal;
      netTokens: Decimal;
      burnedUSD: Decimal;
      netUSD: Decimal;
      percentageLoss: number;
    };
    recommendations: string[];
  } {
    const reluctanceMessage = this.generateReluctanceMessage(amount, transactionType, userTokenBalance);
    const warningMessage = this.generateWarningMessage(amount, transactionType);

    const amountDecimal = new Decimal(amount);
    const priceDecimal = new Decimal(currentTokenPrice);
    const burnedUSD = reluctanceMessage.burnImpact.times(priceDecimal);
    const netUSD = reluctanceMessage.effectiveSellPrice.times(priceDecimal);

    const recommendations = this.generateRecommendations(
      transactionType,
      reluctanceMessage.percentageLoss,
      userTokenBalance
    );

    return {
      reluctanceMessage,
      warningMessage,
      financialImpact: {
        burnedTokens: reluctanceMessage.burnImpact,
        netTokens: reluctanceMessage.effectiveSellPrice,
        burnedUSD,
        netUSD,
        percentageLoss: reluctanceMessage.percentageLoss,
      },
      recommendations,
    };
  }

  /**
   * Generate recommendations based on transaction context
   */
  private generateRecommendations(
    transactionType: BurnTransactionType,
    percentageLoss: number,
    userTokenBalance: number | Decimal
  ): string[] {
    const recommendations: string[] = [];

    if (percentageLoss >= 0.05) {
      recommendations.push('Consider reducing the transaction amount to minimize burn impact');
    }

    if (transactionType === BurnTransactionType.EARNINGS_WITHDRAWAL) {
      recommendations.push('Your tokens are appreciating. Consider holding for 30+ days for better returns');
      recommendations.push('Explore staking options to earn additional tokens without selling');
    }

    if (transactionType === BurnTransactionType.TOKEN_REDEMPTION) {
      recommendations.push('Check if you can earn the required tokens through course completion instead');
      recommendations.push('Consider waiting for promotional periods when redemption costs are lower');
    }

    if (transactionType === BurnTransactionType.COURSE_SALE) {
      recommendations.push('Your course content continues to generate revenue. Keep it active longer');
      recommendations.push('Update your course to increase sales and offset the burn cost');
    }

    // General recommendations
    const balanceDecimal = new Decimal(userTokenBalance);
    if (balanceDecimal.greaterThan(1000)) {
      recommendations.push('You have a substantial token balance. Holding could position you for governance voting');
    }

    recommendations.push('Review the token economics guide to understand long-term appreciation potential');

    return recommendations;
  }
}

export default new ReluctanceMessagingService();
