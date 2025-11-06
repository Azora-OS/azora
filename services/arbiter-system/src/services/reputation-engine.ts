/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { EventEmitter } from 'events';
import type { Arbiter, ArbiterReputation, ArbiterReview, ReputationBadge } from '../interfaces';

/**
 * REPUTATION ENGINE
 * 
 * Manages arbiter reputation with:
 * - Performance tracking
 * - Review aggregation
 * - Badge awarding
 * - Reputation-based case assignment
 */
export class ReputationEngine extends EventEmitter {
  private reputations: Map<string, ArbiterReputation> = new Map();

  constructor() {
    super();
  }

  /**
   * Initialize reputation for new arbiter
   */
  async initializeReputation(arbiterId: string): Promise<ArbiterReputation> {
    const reputation: ArbiterReputation = {
      overall: 50, // Start at neutral
      casesCompleted: 0,
      averageDecisionTime: 0,
      appealRate: 0,
      satisfactionScore: 0,
      fairnessScore: 50,
      consistencyScore: 50,
      reviews: [],
      badges: []
    };

    this.reputations.set(arbiterId, reputation);
    return reputation;
  }

  /**
   * Update reputation after case completion
   */
  async updateAfterCase(
    arbiterId: string,
    caseData: {
      decisionTime: number;
      appealed: boolean;
      review?: ArbiterReview;
    }
  ): Promise<ArbiterReputation> {
    const reputation = this.reputations.get(arbiterId);
    if (!reputation) {
      throw new Error('Reputation not initialized');
    }

    // Update case count
    reputation.casesCompleted++;

    // Update average decision time
    reputation.averageDecisionTime =
      (reputation.averageDecisionTime * (reputation.casesCompleted - 1) + caseData.decisionTime) /
      reputation.casesCompleted;

    // Update appeal rate
    if (caseData.appealed) {
      reputation.appealRate =
        ((reputation.appealRate * (reputation.casesCompleted - 1)) / reputation.casesCompleted) * 100;
    }

    // Add review if provided
    if (caseData.review) {
      reputation.reviews.push(caseData.review);
      await this.recalculateScores(arbiterId);
    }

    // Check for badge eligibility
    await this.awardBadgesIfEligible(arbiterId);

    // Recalculate overall reputation
    reputation.overall = this.calculateOverallReputation(reputation);

    this.emit('reputationUpdated', { arbiterId, reputation });

    return reputation;
  }

  /**
   * Add review for arbiter
   */
  async addReview(arbiterId: string, review: ArbiterReview): Promise<void> {
    const reputation = this.reputations.get(arbiterId);
    if (!reputation) {
      throw new Error('Reputation not initialized');
    }

    reputation.reviews.push(review);
    await this.recalculateScores(arbiterId);
    
    reputation.overall = this.calculateOverallReputation(reputation);

    this.emit('reviewAdded', { arbiterId, review });
  }

  /**
   * Get arbiter reputation
   */
  async getReputation(arbiterId: string): Promise<ArbiterReputation | null> {
    return this.reputations.get(arbiterId) || null;
  }

  /**
   * Get top arbiters by reputation
   */
  async getTopArbiters(limit: number = 10): Promise<Array<{ arbiterId: string; reputation: ArbiterReputation }>> {
    const arbiters = Array.from(this.reputations.entries())
      .map(([arbiterId, reputation]) => ({ arbiterId, reputation }))
      .sort((a, b) => b.reputation.overall - a.reputation.overall)
      .slice(0, limit);

    return arbiters;
  }

  /**
   * Find arbiters by expertise and minimum reputation
   */
  async findQualifiedArbiters(criteria: {
    minReputation: number;
    minCases?: number;
    maxAppealRate?: number;
  }): Promise<string[]> {
    const qualified: string[] = [];

    for (const [arbiterId, reputation] of this.reputations.entries()) {
      if (reputation.overall < criteria.minReputation) continue;
      if (criteria.minCases && reputation.casesCompleted < criteria.minCases) continue;
      if (criteria.maxAppealRate && reputation.appealRate > criteria.maxAppealRate) continue;

      qualified.push(arbiterId);
    }

    return qualified;
  }

  // Private methods

  private async recalculateScores(arbiterId: string): Promise<void> {
    const reputation = this.reputations.get(arbiterId);
    if (!reputation) return;

    const reviews = reputation.reviews;
    if (reviews.length === 0) return;

    // Calculate satisfaction score
    reputation.satisfactionScore =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    // Calculate fairness score
    reputation.fairnessScore =
      reviews.reduce((sum, r) => sum + r.aspects.fairness, 0) / reviews.length * 20; // Convert to 0-100

    // Calculate consistency score (inverse of standard deviation)
    const ratings = reviews.map(r => r.rating);
    const mean = reputation.satisfactionScore;
    const variance = ratings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / ratings.length;
    const stdDev = Math.sqrt(variance);
    reputation.consistencyScore = Math.max(0, 100 - (stdDev * 30)); // Penalize high variance
  }

  private calculateOverallReputation(reputation: ArbiterReputation): number {
    // Weighted calculation
    const weights = {
      satisfaction: 0.3,
      fairness: 0.25,
      consistency: 0.2,
      experience: 0.15,
      appealRate: 0.1
    };

    const experienceScore = Math.min(100, (reputation.casesCompleted / 50) * 100);
    const appealScore = Math.max(0, 100 - reputation.appealRate * 2);

    const overall =
      reputation.satisfactionScore * 20 * weights.satisfaction +
      reputation.fairnessScore * weights.fairness +
      reputation.consistencyScore * weights.consistency +
      experienceScore * weights.experience +
      appealScore * weights.appealRate;

    return Math.round(Math.max(0, Math.min(100, overall)));
  }

  private async awardBadgesIfEligible(arbiterId: string): Promise<void> {
    const reputation = this.reputations.get(arbiterId);
    if (!reputation) return;

    const badges: ReputationBadge[] = [];

    // Expert badge (100+ cases, high satisfaction)
    if (reputation.casesCompleted >= 100 && reputation.satisfactionScore >= 4.5) {
      if (!reputation.badges.some(b => b.type === 'expert')) {
        badges.push({
          type: 'expert',
          earnedAt: new Date(),
          criteria: '100+ cases with 4.5+ satisfaction'
        });
      }
    }

    // Fast resolver (average decision time < 24 hours)
    if (reputation.casesCompleted >= 20 && reputation.averageDecisionTime < 24) {
      if (!reputation.badges.some(b => b.type === 'fast_resolver')) {
        badges.push({
          type: 'fast_resolver',
          earnedAt: new Date(),
          criteria: '20+ cases with <24h average decision time'
        });
      }
    }

    // Fair judge (fairness score > 90)
    if (reputation.fairnessScore >= 90 && reputation.casesCompleted >= 30) {
      if (!reputation.badges.some(b => b.type === 'fair_judge')) {
        badges.push({
          type: 'fair_judge',
          earnedAt: new Date(),
          criteria: '30+ cases with 90+ fairness score'
        });
      }
    }

    // Trusted (low appeal rate)
    if (reputation.casesCompleted >= 50 && reputation.appealRate < 10) {
      if (!reputation.badges.some(b => b.type === 'trusted')) {
        badges.push({
          type: 'trusted',
          earnedAt: new Date(),
          criteria: '50+ cases with <10% appeal rate'
        });
      }
    }

    // Consistent (high consistency score)
    if (reputation.consistencyScore >= 85 && reputation.casesCompleted >= 40) {
      if (!reputation.badges.some(b => b.type === 'consistent')) {
        badges.push({
          type: 'consistent',
          earnedAt: new Date(),
          criteria: '40+ cases with 85+ consistency score'
        });
      }
    }

    if (badges.length > 0) {
      reputation.badges.push(...badges);
      this.emit('badgesAwarded', { arbiterId, badges });
    }
  }
}

export const reputationEngine = new ReputationEngine();
