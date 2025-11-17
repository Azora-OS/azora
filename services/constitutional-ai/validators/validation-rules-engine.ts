/**
 * Validation Rules Engine
 * Defines and manages Ubuntu principle patterns and pattern matching logic
 */

import { UBUNTU_PRINCIPLES, UBUNTU_KEYWORDS } from '../utils/constants';

/**
 * Rule types for validation
 */
export enum RuleType {
  KEYWORD_MATCH = 'keyword_match',
  PATTERN_MATCH = 'pattern_match',
  SENTIMENT_ANALYSIS = 'sentiment_analysis',
  CONTEXT_ANALYSIS = 'context_analysis'
}

/**
 * Rule severity levels
 */
export enum RuleSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Validation rule definition
 */
export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  principle: string; // Ubuntu principle this rule validates
  type: RuleType;
  pattern?: RegExp | string[] | readonly string[];
  weight: number; // Impact on score (0-1)
  severity: RuleSeverity;
  enabled: boolean;
}

/**
 * Rule match result
 */
export interface RuleMatch {
  rule: ValidationRule;
  matched: boolean;
  matchCount: number;
  locations: Array<{ start: number; end: number; text: string }>;
  score: number; // Contribution to overall score
  confidence: number; // 0-1
}

/**
 * Pattern matching result
 */
export interface PatternMatchResult {
  matches: RuleMatch[];
  totalScore: number;
  averageConfidence: number;
  principleScores: Record<string, number>;
}

/**
 * Validation Rules Engine
 */
export class ValidationRulesEngine {
  private rules: Map<string, ValidationRule>;

  constructor() {
    this.rules = new Map();
    this.initializeDefaultRules();
  }

  /**
   * Initialize default Ubuntu principle rules
   */
  private initializeDefaultRules(): void {
    // Collective Benefit Rules
    this.addRule({
      id: 'cb-001',
      name: 'Community Language',
      description: 'Detects language promoting community and collective benefit',
      principle: UBUNTU_PRINCIPLES.COLLECTIVE_BENEFIT,
      type: RuleType.KEYWORD_MATCH,
      pattern: UBUNTU_KEYWORDS.COLLECTIVE_BENEFIT,
      weight: 0.8,
      severity: RuleSeverity.WARNING,
      enabled: true
    });

    this.addRule({
      id: 'cb-002',
      name: 'Selfish Language Detection',
      description: 'Detects individualistic or selfish language patterns',
      principle: UBUNTU_PRINCIPLES.COLLECTIVE_BENEFIT,
      type: RuleType.PATTERN_MATCH,
      pattern: /\b(only for me|just for myself|exclusively mine|personal gain only|ignore others)\b/gi,
      weight: -0.5, // Negative weight (penalty)
      severity: RuleSeverity.ERROR,
      enabled: true
    });

    this.addRule({
      id: 'cb-003',
      name: 'Collaborative Action',
      description: 'Detects collaborative and cooperative language',
      principle: UBUNTU_PRINCIPLES.COLLECTIVE_BENEFIT,
      type: RuleType.PATTERN_MATCH,
      pattern: /\b(work together|collaborate|cooperate|team effort|joint|partnership)\b/gi,
      weight: 0.9,
      severity: RuleSeverity.INFO,
      enabled: true
    });

    // Knowledge Sharing Rules
    this.addRule({
      id: 'ks-001',
      name: 'Educational Content',
      description: 'Detects educational and knowledge-sharing language',
      principle: UBUNTU_PRINCIPLES.KNOWLEDGE_SHARING,
      type: RuleType.KEYWORD_MATCH,
      pattern: UBUNTU_KEYWORDS.KNOWLEDGE_SHARING,
      weight: 0.8,
      severity: RuleSeverity.WARNING,
      enabled: true
    });

    this.addRule({
      id: 'ks-002',
      name: 'Knowledge Hoarding Detection',
      description: 'Detects patterns of withholding or restricting knowledge',
      principle: UBUNTU_PRINCIPLES.KNOWLEDGE_SHARING,
      type: RuleType.PATTERN_MATCH,
      pattern: /\b(keep secret|don't tell|hide information|proprietary only|gatekeep|withhold)\b/gi,
      weight: -0.6, // Negative weight (penalty)
      severity: RuleSeverity.ERROR,
      enabled: true
    });

    this.addRule({
      id: 'ks-003',
      name: 'Teaching Indicators',
      description: 'Detects teaching and explanatory language',
      principle: UBUNTU_PRINCIPLES.KNOWLEDGE_SHARING,
      type: RuleType.PATTERN_MATCH,
      pattern: /\b(how to|step by step|tutorial|guide|let me explain|here's how|you can learn)\b/gi,
      weight: 0.9,
      severity: RuleSeverity.INFO,
      enabled: true
    });

    // Inclusive Design Rules
    this.addRule({
      id: 'id-001',
      name: 'Inclusive Language',
      description: 'Detects inclusive and accessible language',
      principle: UBUNTU_PRINCIPLES.INCLUSIVE_DESIGN,
      type: RuleType.KEYWORD_MATCH,
      pattern: UBUNTU_KEYWORDS.INCLUSIVE_DESIGN,
      weight: 0.8,
      severity: RuleSeverity.WARNING,
      enabled: true
    });

    this.addRule({
      id: 'id-002',
      name: 'Exclusionary Language Detection',
      description: 'Detects exclusionary or discriminatory language',
      principle: UBUNTU_PRINCIPLES.INCLUSIVE_DESIGN,
      type: RuleType.PATTERN_MATCH,
      pattern: /\b(only for|exclusively for|not for everyone|limited to|exclude|discriminate)\b/gi,
      weight: -0.7, // Negative weight (penalty)
      severity: RuleSeverity.ERROR,
      enabled: true
    });

    this.addRule({
      id: 'id-003',
      name: 'Universal Access',
      description: 'Detects language promoting universal access and inclusion',
      principle: UBUNTU_PRINCIPLES.INCLUSIVE_DESIGN,
      type: RuleType.PATTERN_MATCH,
      pattern: /\b(everyone can|all people|regardless of|no matter|accessible to all|open to everyone|universal)\b/gi,
      weight: 0.9,
      severity: RuleSeverity.INFO,
      enabled: true
    });
  }

  /**
   * Add a new validation rule
   */
  addRule(rule: ValidationRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove a validation rule
   */
  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  /**
   * Get a specific rule
   */
  getRule(ruleId: string): ValidationRule | undefined {
    return this.rules.get(ruleId);
  }

  /**
   * Get all rules
   */
  getAllRules(): ValidationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get rules for a specific principle
   */
  getRulesByPrinciple(principle: string): ValidationRule[] {
    return Array.from(this.rules.values()).filter(
      rule => rule.principle === principle && rule.enabled
    );
  }

  /**
   * Enable or disable a rule
   */
  setRuleEnabled(ruleId: string, enabled: boolean): boolean {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
      return true;
    }
    return false;
  }

  /**
   * Match text against all enabled rules
   */
  matchRules(text: string): PatternMatchResult {
    const matches: RuleMatch[] = [];
    const principleScores: Record<string, number> = {};

    // Initialize principle scores
    for (const principle of Object.values(UBUNTU_PRINCIPLES)) {
      principleScores[principle] = 0;
    }

    // Match against each enabled rule
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      const match = this.matchRule(rule, text);
      matches.push(match);

      // Accumulate scores by principle
      if (match.matched) {
        principleScores[rule.principle] =
          (principleScores[rule.principle] || 0) + match.score;
      }
    }

    // Calculate total score and average confidence
    const totalScore = matches.reduce((sum, match) => sum + match.score, 0);
    const matchedRules = matches.filter(m => m.matched);
    const averageConfidence = matchedRules.length > 0
      ? matchedRules.reduce((sum, match) => sum + match.confidence, 0) / matchedRules.length
      : 0;

    return {
      matches,
      totalScore,
      averageConfidence,
      principleScores
    };
  }

  /**
   * Match text against a specific rule
   */
  private matchRule(rule: ValidationRule, text: string): RuleMatch {
    const locations: Array<{ start: number; end: number; text: string }> = [];
    let matchCount = 0;

    if (rule.type === RuleType.KEYWORD_MATCH && Array.isArray(rule.pattern)) {
      // Keyword matching
      for (const keyword of rule.pattern) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        let match;
        while ((match = regex.exec(text)) !== null) {
          matchCount++;
          locations.push({
            start: match.index,
            end: match.index + match[0].length,
            text: match[0]
          });
        }
      }
    } else if (rule.type === RuleType.PATTERN_MATCH && rule.pattern instanceof RegExp) {
      // Pattern matching
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
      let match;
      while ((match = regex.exec(text)) !== null) {
        matchCount++;
        locations.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0]
        });
      }
    }

    const matched = matchCount > 0;
    const score = matched ? matchCount * rule.weight * 10 : 0;
    const confidence = this.calculateConfidence(matchCount, rule);

    return {
      rule,
      matched,
      matchCount,
      locations,
      score,
      confidence
    };
  }

  /**
   * Calculate confidence score for a match
   */
  private calculateConfidence(matchCount: number, rule: ValidationRule): number {
    if (matchCount === 0) return 0;

    // Base confidence on match count and rule weight
    const baseConfidence = Math.min(1.0, matchCount * 0.2);
    const weightFactor = Math.abs(rule.weight);
    
    return Math.min(1.0, baseConfidence * weightFactor);
  }

  /**
   * Get rules summary
   */
  getRulesSummary(): {
    total: number;
    enabled: number;
    byPrinciple: Record<string, number>;
    bySeverity: Record<string, number>;
  } {
    const allRules = Array.from(this.rules.values());
    const enabled = allRules.filter(r => r.enabled);

    const byPrinciple: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    for (const rule of allRules) {
      byPrinciple[rule.principle] = (byPrinciple[rule.principle] || 0) + 1;
      bySeverity[rule.severity] = (bySeverity[rule.severity] || 0) + 1;
    }

    return {
      total: allRules.length,
      enabled: enabled.length,
      byPrinciple,
      bySeverity
    };
  }

  /**
   * Export rules to JSON
   */
  exportRules(): string {
    const rules = Array.from(this.rules.values()).map(rule => ({
      ...rule,
      pattern: rule.pattern instanceof RegExp 
        ? { source: rule.pattern.source, flags: rule.pattern.flags }
        : rule.pattern
    }));
    return JSON.stringify(rules, null, 2);
  }

  /**
   * Import rules from JSON
   */
  importRules(json: string): void {
    try {
      const rules = JSON.parse(json);
      for (const rule of rules) {
        // Reconstruct RegExp if needed
        if (rule.pattern && typeof rule.pattern === 'object' && rule.pattern.source) {
          rule.pattern = new RegExp(rule.pattern.source, rule.pattern.flags);
        }
        this.addRule(rule);
      }
    } catch (error) {
      throw new Error(`Failed to import rules: ${error}`);
    }
  }

  /**
   * Clear all rules
   */
  clearRules(): void {
    this.rules.clear();
  }

  /**
   * Reset to default rules
   */
  resetToDefaults(): void {
    this.clearRules();
    this.initializeDefaultRules();
  }
}
