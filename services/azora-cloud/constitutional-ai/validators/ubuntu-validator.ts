/**
 * Ubuntu Principles Validator
 * Validates AI outputs against Ubuntu principles: collective benefit, knowledge sharing, and inclusive design
 */

import {
  IUbuntuValidator,
  UbuntuValidationResult
} from '../types';
import {
  UBUNTU_KEYWORDS,
  DEFAULT_CONFIG
} from '../utils/constants';

/**
 * Ubuntu Validator Configuration
 */
export interface UbuntuValidatorConfig {
  collectiveBenefitWeight: number; // 0-1
  knowledgeSharingWeight: number; // 0-1
  inclusiveDesignWeight: number; // 0-1
  minScore: number; // 0-100
  strictMode: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_UBUNTU_CONFIG: UbuntuValidatorConfig = {
  collectiveBenefitWeight: 0.4,
  knowledgeSharingWeight: 0.3,
  inclusiveDesignWeight: 0.3,
  minScore: DEFAULT_CONFIG.UBUNTU_THRESHOLD,
  strictMode: false
};

/**
 * Ubuntu Validator Implementation
 */
export class UbuntuValidator implements IUbuntuValidator {
  private config: UbuntuValidatorConfig;

  constructor(config: Partial<UbuntuValidatorConfig> = {}) {
    this.config = { ...DEFAULT_UBUNTU_CONFIG, ...config };
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    const totalWeight = 
      this.config.collectiveBenefitWeight +
      this.config.knowledgeSharingWeight +
      this.config.inclusiveDesignWeight;

    if (Math.abs(totalWeight - 1.0) > 0.01) {
      throw new Error('Ubuntu validator weights must sum to 1.0');
    }
  }

  /**
   * Validate output against all Ubuntu principles
   */
  async validate(output: string): Promise<UbuntuValidationResult> {
    if (!output || output.trim().length === 0) {
      return this.createEmptyResult();
    }

    const [collectiveBenefitScore, knowledgeSharingScore, inclusiveDesignScore] = await Promise.all([
      this.checkCollectiveBenefit(output),
      this.checkKnowledgeSharing(output),
      this.checkInclusiveDesign(output)
    ]);

    const score = this.calculateOverallScore(
      collectiveBenefitScore,
      knowledgeSharingScore,
      inclusiveDesignScore
    );

    const isValid = score >= this.config.minScore;
    const violations = this.identifyViolations(
      collectiveBenefitScore,
      knowledgeSharingScore,
      inclusiveDesignScore
    );
    const suggestions = this.generateSuggestions(violations);

    return {
      isValid,
      violations,
      score,
      suggestions,
      collectiveBenefitScore,
      knowledgeSharingScore,
      inclusiveDesignScore
    };
  }

  /**
   * Check collective benefit principle
   * Evaluates if the output promotes community welfare and shared benefits
   */
  async checkCollectiveBenefit(output: string): Promise<number> {
    const normalizedOutput = output.toLowerCase();
    const keywords = UBUNTU_KEYWORDS.COLLECTIVE_BENEFIT;

    // Count keyword matches
    let matchCount = 0;
    let totalRelevance = 0;

    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = normalizedOutput.match(regex);
      if (matches) {
        matchCount += matches.length;
        totalRelevance += matches.length * this.getKeywordWeight(keyword);
      }
    }

    // Check for individualistic or selfish language (negative indicators)
    const negativePatterns = [
      /\b(only for me|just for myself|exclusively mine|personal gain only)\b/gi,
      /\b(ignore others|don't share|keep to yourself)\b/gi
    ];

    let negativeScore = 0;
    for (const pattern of negativePatterns) {
      const matches = normalizedOutput.match(pattern);
      if (matches) {
        negativeScore += matches.length * 10;
      }
    }

    // Calculate base score from positive indicators
    const baseScore = Math.min(100, (totalRelevance / keywords.length) * 100);
    
    // Apply negative penalty
    const finalScore = Math.max(0, baseScore - negativeScore);

    return Math.round(finalScore);
  }

  /**
   * Check knowledge sharing principle
   * Evaluates if the output promotes learning, teaching, and information sharing
   */
  async checkKnowledgeSharing(output: string): Promise<number> {
    const normalizedOutput = output.toLowerCase();
    const keywords = UBUNTU_KEYWORDS.KNOWLEDGE_SHARING;

    let matchCount = 0;
    let totalRelevance = 0;

    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = normalizedOutput.match(regex);
      if (matches) {
        matchCount += matches.length;
        totalRelevance += matches.length * this.getKeywordWeight(keyword);
      }
    }

    // Check for knowledge hoarding patterns (negative indicators)
    const negativePatterns = [
      /\b(keep secret|don't tell|hide information|proprietary only)\b/gi,
      /\b(gatekeep|withhold knowledge|restrict access)\b/gi
    ];

    let negativeScore = 0;
    for (const pattern of negativePatterns) {
      const matches = normalizedOutput.match(pattern);
      if (matches) {
        negativeScore += matches.length * 10;
      }
    }

    // Check for educational content indicators
    const educationalPatterns = [
      /\b(how to|step by step|tutorial|guide|explanation)\b/gi,
      /\b(let me explain|here's how|you can learn)\b/gi
    ];

    let educationalBonus = 0;
    for (const pattern of educationalPatterns) {
      const matches = normalizedOutput.match(pattern);
      if (matches) {
        educationalBonus += matches.length * 5;
      }
    }

    const baseScore = Math.min(100, (totalRelevance / keywords.length) * 100);
    const finalScore = Math.max(0, Math.min(100, baseScore + educationalBonus - negativeScore));

    return Math.round(finalScore);
  }

  /**
   * Check inclusive design principle
   * Evaluates if the output is accessible, equitable, and considers diverse perspectives
   */
  async checkInclusiveDesign(output: string): Promise<number> {
    const normalizedOutput = output.toLowerCase();
    const keywords = UBUNTU_KEYWORDS.INCLUSIVE_DESIGN;

    let matchCount = 0;
    let totalRelevance = 0;

    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = normalizedOutput.match(regex);
      if (matches) {
        matchCount += matches.length;
        totalRelevance += matches.length * this.getKeywordWeight(keyword);
      }
    }

    // Check for exclusionary language (negative indicators)
    const negativePatterns = [
      /\b(only for|exclusively for|not for everyone|limited to)\b/gi,
      /\b(exclude|discriminate|restrict to|barrier)\b/gi
    ];

    let negativeScore = 0;
    for (const pattern of negativePatterns) {
      const matches = normalizedOutput.match(pattern);
      if (matches) {
        negativeScore += matches.length * 10;
      }
    }

    // Check for inclusive language patterns (positive indicators)
    const inclusivePatterns = [
      /\b(everyone can|all people|regardless of|no matter)\b/gi,
      /\b(accessible to all|open to everyone|universal)\b/gi
    ];

    let inclusiveBonus = 0;
    for (const pattern of inclusivePatterns) {
      const matches = normalizedOutput.match(pattern);
      if (matches) {
        inclusiveBonus += matches.length * 5;
      }
    }

    const baseScore = Math.min(100, (totalRelevance / keywords.length) * 100);
    const finalScore = Math.max(0, Math.min(100, baseScore + inclusiveBonus - negativeScore));

    return Math.round(finalScore);
  }

  /**
   * Calculate overall Ubuntu score from individual principle scores
   */
  private calculateOverallScore(
    collectiveBenefit: number,
    knowledgeSharing: number,
    inclusiveDesign: number
  ): number {
    const weightedScore =
      collectiveBenefit * this.config.collectiveBenefitWeight +
      knowledgeSharing * this.config.knowledgeSharingWeight +
      inclusiveDesign * this.config.inclusiveDesignWeight;

    return Math.round(weightedScore);
  }

  /**
   * Identify which principles are violated
   */
  private identifyViolations(
    collectiveBenefit: number,
    knowledgeSharing: number,
    inclusiveDesign: number
  ): string[] {
    const violations: string[] = [];
    const threshold = this.config.minScore;

    if (collectiveBenefit < threshold) {
      violations.push(
        `Collective benefit score (${collectiveBenefit}) below threshold (${threshold})`
      );
    }

    if (knowledgeSharing < threshold) {
      violations.push(
        `Knowledge sharing score (${knowledgeSharing}) below threshold (${threshold})`
      );
    }

    if (inclusiveDesign < threshold) {
      violations.push(
        `Inclusive design score (${inclusiveDesign}) below threshold (${threshold})`
      );
    }

    return violations;
  }

  /**
   * Generate suggestions for improving Ubuntu compliance
   */
  private generateSuggestions(violations: string[]): string[] {
    const suggestions: string[] = [];

    for (const violation of violations) {
      if (violation.includes('Collective benefit')) {
        suggestions.push(
          'Consider emphasizing community benefits and shared value',
          'Highlight how this helps the collective rather than individuals alone'
        );
      }

      if (violation.includes('Knowledge sharing')) {
        suggestions.push(
          'Add educational content or explanations',
          'Encourage learning and information sharing',
          'Make knowledge more accessible and transparent'
        );
      }

      if (violation.includes('Inclusive design')) {
        suggestions.push(
          'Use more inclusive language that considers diverse perspectives',
          'Ensure accessibility for all users',
          'Remove barriers and exclusionary terms'
        );
      }
    }

    return suggestions;
  }

  /**
   * Get weight for a keyword based on its importance
   */
  private getKeywordWeight(keyword: string): number {
    // High-impact keywords
    const highImpact = ['community', 'collective', 'shared', 'inclusive', 'accessible', 'learn', 'teach'];
    if (highImpact.includes(keyword.toLowerCase())) {
      return 1.5;
    }

    // Medium-impact keywords
    return 1.0;
  }

  /**
   * Create empty result for invalid input
   */
  private createEmptyResult(): UbuntuValidationResult {
    return {
      isValid: false,
      violations: ['Empty or invalid output provided'],
      score: 0,
      suggestions: ['Provide valid output text for validation'],
      collectiveBenefitScore: 0,
      knowledgeSharingScore: 0,
      inclusiveDesignScore: 0
    };
  }

  /**
   * Update validator configuration
   */
  updateConfig(config: Partial<UbuntuValidatorConfig>): void {
    this.config = { ...this.config, ...config };
    this.validateConfig();
  }

  /**
   * Get current configuration
   */
  getConfig(): UbuntuValidatorConfig {
    return { ...this.config };
  }
}
