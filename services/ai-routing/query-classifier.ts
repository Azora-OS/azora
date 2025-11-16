/**
 * Query Classifier Service
 * Classifies incoming queries by complexity and determines optimal routing
 */

import { AIQuery, QueryClassificationResult, QueryComplexity, IQueryClassifier, ClassificationThresholds, RoutingTier } from './types';

export class QueryClassifier implements IQueryClassifier {
  private thresholds: ClassificationThresholds;
  private classificationStats: Map<QueryComplexity, number> = new Map();

  constructor(thresholds?: Partial<ClassificationThresholds>) {
    this.thresholds = {
      simpleThreshold: 50,      // queries with score < 50 are SIMPLE
      moderateThreshold: 120,   // queries with score < 120 are MODERATE
      complexThreshold: 120,    // queries with score >= 120 are COMPLEX
      minConfidence: 0.6,       // minimum 60% confidence
      ...thresholds
    };

    // Initialize stats
    this.classificationStats.set(QueryComplexity.SIMPLE, 0);
    this.classificationStats.set(QueryComplexity.MODERATE, 0);
    this.classificationStats.set(QueryComplexity.COMPLEX, 0);
  }

  /**
   * Classify a query by complexity
   */
  async classify(query: AIQuery): Promise<QueryClassificationResult> {
    const score = this.calculateComplexityScore(query.query);
    const complexity = this.determineComplexity(score);
    const confidence = this.calculateConfidence(query.query, complexity);

    // Update stats
    const current = this.classificationStats.get(complexity) || 0;
    this.classificationStats.set(complexity, current + 1);

    return {
      id: `classification-${Date.now()}`,
      query: query.query,
      classifiedAs: complexity,
      confidence,
      routedTo: this.mapComplexityToTier(complexity),
      reasoning: this.generateReasoning(query.query, complexity, score),
      metadata: {
        score,
        queryLength: query.query.length,
        wordCount: query.query.split(/\s+/).length,
        userId: query.userId
      }
    };
  }

  /**
   * Calculate complexity score based on query characteristics
   */
  private calculateComplexityScore(query: string): number {
    let score = 0;

    // Length factor (longer queries tend to be more complex)
    score += query.length / 10;

    // Word count factor
    const wordCount = query.split(/\s+/).length;
    score += wordCount * 2;

    // Complexity indicators
    const complexityPatterns = [
      { pattern: /\b(analyze|compare|evaluate|synthesize|explain|why|how)\b/i, weight: 15 },
      { pattern: /\b(multiple|several|various|different)\b/i, weight: 10 },
      { pattern: /\b(strategic|complex|advanced|sophisticated)\b/i, weight: 20 },
      { pattern: /\b(and|or|but|however|therefore)\b/i, weight: 5 },
      { pattern: /\?/g, weight: 5 }, // Question marks
      { pattern: /[,;:]/g, weight: 3 } // Punctuation
    ];

    for (const { pattern, weight } of complexityPatterns) {
      const matches = query.match(pattern);
      if (matches) {
        score += matches.length * weight;
      }
    }

    return score;
  }

  /**
   * Determine complexity level based on score
   */
  private determineComplexity(score: number): QueryComplexity {
    if (score < this.thresholds.simpleThreshold) {
      return QueryComplexity.SIMPLE;
    } else if (score < this.thresholds.moderateThreshold) {
      return QueryComplexity.MODERATE;
    } else {
      return QueryComplexity.COMPLEX;
    }
  }

  /**
   * Calculate confidence score for classification
   */
  private calculateConfidence(query: string, complexity: QueryComplexity): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence for clear patterns
    const simplePatterns = /^(hello|hi|hey|what|who|when|where|which)\b/i;
    const complexPatterns = /\b(analyze|compare|evaluate|synthesize|strategic)\b/i;

    if (complexity === QueryComplexity.SIMPLE && simplePatterns.test(query)) {
      confidence += 0.2;
    } else if (complexity === QueryComplexity.COMPLEX && complexPatterns.test(query)) {
      confidence += 0.2;
    }

    // Normalize to 0-1 range
    return Math.min(confidence, 1.0);
  }

  /**
   * Map complexity to routing tier
   */
  private mapComplexityToTier(complexity: QueryComplexity): RoutingTier {
    switch (complexity) {
      case QueryComplexity.SIMPLE:
        return RoutingTier.LOCAL_LLM;
      case QueryComplexity.MODERATE:
        return RoutingTier.RAP_SYSTEM;
      case QueryComplexity.COMPLEX:
        return RoutingTier.EXTERNAL_LLM;
    }
  }

  /**
   * Generate reasoning for classification
   */
  private generateReasoning(query: string, complexity: QueryComplexity, score: number): string {
    const reasons: string[] = [];

    if (query.length > 200) {
      reasons.push('Long query');
    }

    const wordCount = query.split(/\s+/).length;
    if (wordCount > 20) {
      reasons.push('Multiple concepts');
    }

    if (/\b(analyze|compare|evaluate|synthesize)\b/i.test(query)) {
      reasons.push('Analytical keywords detected');
    }

    if (/\b(simple|basic|quick|fast)\b/i.test(query)) {
      reasons.push('Simple request indicators');
    }

    return `Classified as ${complexity} (score: ${score.toFixed(1)}). ${reasons.join('. ')}`;
  }

  /**
   * Get classification metrics
   */
  async getClassificationMetrics(): Promise<Record<QueryComplexity, number>> {
    return {
      [QueryComplexity.SIMPLE]: this.classificationStats.get(QueryComplexity.SIMPLE) || 0,
      [QueryComplexity.MODERATE]: this.classificationStats.get(QueryComplexity.MODERATE) || 0,
      [QueryComplexity.COMPLEX]: this.classificationStats.get(QueryComplexity.COMPLEX) || 0
    };
  }

  /**
   * Reset classification statistics
   */
  resetStats(): void {
    this.classificationStats.clear();
    this.classificationStats.set(QueryComplexity.SIMPLE, 0);
    this.classificationStats.set(QueryComplexity.MODERATE, 0);
    this.classificationStats.set(QueryComplexity.COMPLEX, 0);
  }
}
