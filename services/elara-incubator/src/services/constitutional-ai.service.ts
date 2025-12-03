import { AppError } from '../middleware/errorHandler.js';

/**
 * Constitutional AI Governance Service
 * Ensures all recommendations and content comply with ethical guidelines
 * Requirements: 7.5
 */

interface ComplianceCheck {
  passed: boolean;
  issues: string[];
  suggestions: string[];
  score: number; // 0-100
}

interface EthicalGuideline {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  rules: string[];
}

// Define ethical guidelines
const ethicalGuidelines: EthicalGuideline[] = [
  {
    id: 'harm-prevention',
    name: 'Harm Prevention',
    description: 'Ensure recommendations do not cause harm to individuals or communities',
    severity: 'critical',
    rules: [
      'No illegal activities',
      'No dangerous practices',
      'No exploitation',
      'No discrimination',
    ],
  },
  {
    id: 'privacy-protection',
    name: 'Privacy Protection',
    description: 'Protect user privacy and personal data',
    severity: 'critical',
    rules: [
      'No unauthorized data collection',
      'No personal data exposure',
      'Comply with data protection laws',
      'Secure data handling',
    ],
  },
  {
    id: 'fairness-equity',
    name: 'Fairness & Equity',
    description: 'Ensure fair and equitable treatment',
    severity: 'high',
    rules: [
      'No bias or discrimination',
      'Equal opportunity',
      'Fair pricing',
      'Transparent practices',
    ],
  },
  {
    id: 'transparency-honesty',
    name: 'Transparency & Honesty',
    description: 'Be transparent and honest in all dealings',
    severity: 'high',
    rules: [
      'Clear communication',
      'Honest representations',
      'Disclose conflicts of interest',
      'Accurate information',
    ],
  },
  {
    id: 'accountability',
    name: 'Accountability',
    description: 'Take responsibility for actions and decisions',
    severity: 'medium',
    rules: [
      'Clear responsibility',
      'Audit trails',
      'Error correction',
      'Feedback mechanisms',
    ],
  },
];

export class ConstitutionalAIService {
  /**
   * Check recommendation compliance
   * Requirements: 7.5
   */
  async checkRecommendationCompliance(
    recommendation: {
      title: string;
      description: string;
      actionItems: string[];
    }
  ): Promise<ComplianceCheck> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check for harmful content
    if (this.containsHarmfulContent(recommendation.description)) {
      issues.push('Recommendation contains potentially harmful content');
      score -= 30;
    }

    // Check for privacy concerns
    if (this.containsPrivacyConcerns(recommendation.description)) {
      issues.push('Recommendation may violate privacy guidelines');
      score -= 25;
    }

    // Check for bias
    if (this.containsBias(recommendation.description)) {
      suggestions.push('Review recommendation for potential bias');
      score -= 10;
    }

    // Check for transparency
    if (!this.isTransparent(recommendation.description)) {
      suggestions.push('Ensure clear and transparent communication');
      score -= 5;
    }

    // Check action items
    for (const item of recommendation.actionItems) {
      if (this.containsHarmfulContent(item)) {
        issues.push(`Action item contains harmful content: "${item}"`);
        score -= 15;
      }
    }

    return {
      passed: issues.length === 0,
      issues,
      suggestions,
      score: Math.max(0, score),
    };
  }

  /**
   * Validate business recommendation
   * Requirements: 7.5
   */
  async validateBusinessRecommendation(
    businessType: string,
    recommendation: string
  ): Promise<ComplianceCheck> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check for illegal business practices
    if (this.isIllegalBusiness(businessType)) {
      issues.push(`Business type "${businessType}" may involve illegal activities`);
      score -= 50;
    }

    // Check for exploitative practices
    if (this.isExploitative(recommendation)) {
      issues.push('Recommendation contains exploitative practices');
      score -= 40;
    }

    // Check for fair labor practices
    if (!this.hasFairLaborPractices(recommendation)) {
      suggestions.push('Ensure fair labor practices and worker protections');
      score -= 15;
    }

    // Check for environmental concerns
    if (this.hasEnvironmentalConcerns(recommendation)) {
      suggestions.push('Consider environmental impact and sustainability');
      score -= 10;
    }

    return {
      passed: issues.length === 0,
      issues,
      suggestions,
      score: Math.max(0, score),
    };
  }

  /**
   * Validate payment recommendation
   * Requirements: 7.5
   */
  async validatePaymentRecommendation(
    paymentType: string,
    amount: number,
    recipient: string
  ): Promise<ComplianceCheck> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check for suspicious patterns
    if (this.isSuspiciousPayment(amount, paymentType)) {
      issues.push('Payment pattern appears suspicious');
      score -= 30;
    }

    // Check for sanctions compliance
    if (await this.violatesSanctions(recipient)) {
      issues.push('Recipient may be subject to sanctions');
      score -= 50;
    }

    // Check for money laundering risks
    if (this.hasMoneyLaunderingRisk(amount, paymentType)) {
      suggestions.push('Enhanced due diligence recommended');
      score -= 20;
    }

    return {
      passed: issues.length === 0,
      issues,
      suggestions,
      score: Math.max(0, score),
    };
  }

  /**
   * Get ethical guidelines
   * Requirements: 7.5
   */
  getEthicalGuidelines(): EthicalGuideline[] {
    return ethicalGuidelines;
  }

  /**
   * Get guideline by ID
   * Requirements: 7.5
   */
  getGuidelineById(id: string): EthicalGuideline | null {
    return ethicalGuidelines.find((g) => g.id === id) || null;
  }

  /**
   * Check if content contains harmful content
   * Requirements: 7.5
   */
  private containsHarmfulContent(text: string): boolean {
    const harmfulKeywords = [
      'illegal',
      'dangerous',
      'harmful',
      'unethical',
      'exploit',
      'abuse',
      'violence',
      'discrimination',
      'harassment',
      'fraud',
      'scam',
    ];

    const lowerText = text.toLowerCase();
    return harmfulKeywords.some((keyword) => lowerText.includes(keyword));
  }

  /**
   * Check if content contains privacy concerns
   * Requirements: 7.5
   */
  private containsPrivacyConcerns(text: string): boolean {
    const privacyKeywords = [
      'personal data',
      'private information',
      'confidential',
      'ssn',
      'credit card',
      'password',
      'medical',
      'health information',
      'financial records',
    ];

    const lowerText = text.toLowerCase();
    return privacyKeywords.some((keyword) => lowerText.includes(keyword));
  }

  /**
   * Check if content contains bias
   * Requirements: 7.5
   */
  private containsBias(text: string): boolean {
    const biasKeywords = [
      'always',
      'never',
      'everyone',
      'nobody',
      'all',
      'none',
      'obviously',
      'clearly',
      'naturally',
    ];

    const lowerText = text.toLowerCase();
    return biasKeywords.some((keyword) => lowerText.includes(keyword));
  }

  /**
   * Check if content is transparent
   * Requirements: 7.5
   */
  private isTransparent(text: string): boolean {
    const transparencyKeywords = [
      'clearly',
      'transparent',
      'disclose',
      'explain',
      'understand',
      'reason',
      'because',
      'why',
    ];

    const lowerText = text.toLowerCase();
    return transparencyKeywords.some((keyword) => lowerText.includes(keyword));
  }

  /**
   * Check if business type is illegal
   * Requirements: 7.5
   */
  private isIllegalBusiness(businessType: string): boolean {
    const illegalTypes = [
      'drug',
      'weapons',
      'counterfeit',
      'stolen',
      'gambling',
      'prostitution',
      'money laundering',
    ];

    const lowerType = businessType.toLowerCase();
    return illegalTypes.some((type) => lowerType.includes(type));
  }

  /**
   * Check if recommendation is exploitative
   * Requirements: 7.5
   */
  private isExploitative(text: string): boolean {
    const exploitativeKeywords = [
      'child labor',
      'forced labor',
      'sweatshop',
      'exploitation',
      'abuse',
      'underpay',
      'unsafe conditions',
    ];

    const lowerText = text.toLowerCase();
    return exploitativeKeywords.some((keyword) => lowerText.includes(keyword));
  }

  /**
   * Check for fair labor practices
   * Requirements: 7.5
   */
  private hasFairLaborPractices(text: string): boolean {
    const fairKeywords = [
      'fair wage',
      'living wage',
      'benefits',
      'safe',
      'union',
      'rights',
      'protection',
    ];

    const lowerText = text.toLowerCase();
    return fairKeywords.some((keyword) => lowerText.includes(keyword));
  }

  /**
   * Check for environmental concerns
   * Requirements: 7.5
   */
  private hasEnvironmentalConcerns(text: string): boolean {
    const environmentalKeywords = [
      'pollution',
      'waste',
      'carbon',
      'emissions',
      'toxic',
      'environmental',
      'sustainability',
    ];

    const lowerText = text.toLowerCase();
    return environmentalKeywords.some((keyword) => lowerText.includes(keyword));
  }

  /**
   * Check for suspicious payment patterns
   * Requirements: 7.5
   */
  private isSuspiciousPayment(amount: number, paymentType: string): boolean {
    // Flag unusually large amounts
    if (amount > 1000000) {
      return true;
    }

    // Flag unusual patterns
    if (paymentType === 'cash' && amount > 10000) {
      return true;
    }

    return false;
  }

  /**
   * Check for sanctions violations
   * Requirements: 7.5
   */
  private async violatesSanctions(recipient: string): Promise<boolean> {
    // Mock implementation - in production, check against OFAC list
    const sanctionedEntities = ['north korea', 'iran', 'syria', 'cuba'];
    const lowerRecipient = recipient.toLowerCase();
    return sanctionedEntities.some((entity) => lowerRecipient.includes(entity));
  }

  /**
   * Check for money laundering risk
   * Requirements: 7.5
   */
  private hasMoneyLaunderingRisk(amount: number, paymentType: string): boolean {
    // Flag structuring (multiple payments just below threshold)
    if (amount > 9000 && amount < 10000) {
      return true;
    }

    // Flag cash-heavy transactions
    if (paymentType === 'cash' && amount > 5000) {
      return true;
    }

    return false;
  }

  /**
   * Generate compliance report
   * Requirements: 7.5
   */
  async generateComplianceReport(
    recommendations: Array<{
      id: string;
      title: string;
      description: string;
      actionItems: string[];
    }>
  ): Promise<{
    totalRecommendations: number;
    compliantRecommendations: number;
    nonCompliantRecommendations: number;
    averageScore: number;
    issues: Array<{ recommendationId: string; issues: string[] }>;
    suggestions: Array<{ recommendationId: string; suggestions: string[] }>;
  }> {
    const results = [];
    let totalScore = 0;
    let compliantCount = 0;

    for (const rec of recommendations) {
      const check = await this.checkRecommendationCompliance(rec);
      results.push(check);
      totalScore += check.score;

      if (check.passed) {
        compliantCount++;
      }
    }

    const issues = results
      .map((r, i) => ({
        recommendationId: recommendations[i].id,
        issues: r.issues,
      }))
      .filter((r) => r.issues.length > 0);

    const suggestions = results
      .map((r, i) => ({
        recommendationId: recommendations[i].id,
        suggestions: r.suggestions,
      }))
      .filter((r) => r.suggestions.length > 0);

    return {
      totalRecommendations: recommendations.length,
      compliantRecommendations: compliantCount,
      nonCompliantRecommendations: recommendations.length - compliantCount,
      averageScore: recommendations.length > 0 ? totalScore / recommendations.length : 0,
      issues,
      suggestions,
    };
  }
}

export const constitutionalAIService = new ConstitutionalAIService();
