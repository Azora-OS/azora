/**
 * Tier Selector
 * Implements optimal tier selection logic based on cost, quality, and constraints
 * Handles budget constraints and cost prediction
 */

import { RoutingTier, QueryComplexity } from './types';
import { CostOptimizer, TierCostConfig } from './cost-optimizer';

/**
 * Tier selection criteria
 */
export interface SelectionCriteria {
  complexity: QueryComplexity;
  userBudget?: number;
  preferredTier?: RoutingTier;
  prioritizeSpeed?: boolean;
  prioritizeCost?: boolean;
  prioritizeQuality?: boolean;
  estimatedInputTokens?: number;
  estimatedOutputTokens?: number;
}

/**
 * Tier selection result
 */
export interface TierSelectionResult {
  selectedTier: RoutingTier;
  reason: string;
  estimatedCost: number;
  alternativeTiers: RoutingTier[];
  alternativeCosts: Record<RoutingTier, number>;
  budgetRemaining?: number;
}

/**
 * Tier performance profile
 */
export interface TierProfile {
  tier: RoutingTier;
  averageLatency: number; // milliseconds
  averageCost: number;
  successRate: number; // percentage
  qualityScore: number; // 0-100
  costPerQuality: number; // cost per quality point
}

/**
 * Tier Selector Implementation
 */
export class TierSelector {
  private costOptimizer: CostOptimizer;
  private tierProfiles: Map<RoutingTier, TierProfile> = new Map();

  constructor(costOptimizer: CostOptimizer) {
    this.costOptimizer = costOptimizer;
    this.initializeTierProfiles();
  }

  /**
   * Initialize tier performance profiles
   * These are baseline profiles that can be updated based on actual metrics
   */
  private initializeTierProfiles(): void {
    // Local LLM: Fast, cheap, lower quality
    this.tierProfiles.set(RoutingTier.LOCAL_LLM, {
      tier: RoutingTier.LOCAL_LLM,
      averageLatency: 200, // milliseconds
      averageCost: 0,
      successRate: 85,
      qualityScore: 70,
      costPerQuality: 0
    });

    // RAP System: Moderate latency, moderate cost, good quality
    this.tierProfiles.set(RoutingTier.RAP_SYSTEM, {
      tier: RoutingTier.RAP_SYSTEM,
      averageLatency: 800,
      averageCost: 0.02,
      successRate: 92,
      qualityScore: 85,
      costPerQuality: 0.000235 // 0.02 / 85
    });

    // External LLM: Slower, expensive, highest quality
    this.tierProfiles.set(RoutingTier.EXTERNAL_LLM, {
      tier: RoutingTier.EXTERNAL_LLM,
      averageLatency: 2000,
      averageCost: 0.05,
      successRate: 98,
      qualityScore: 95,
      costPerQuality: 0.000526 // 0.05 / 95
    });
  }

  /**
   * Select optimal tier based on criteria
   * @param criteria - Selection criteria
   * @returns Tier selection result
   */
  async selectTier(criteria: SelectionCriteria): Promise<TierSelectionResult> {
    const inputTokens = criteria.estimatedInputTokens || 100;
    const outputTokens = criteria.estimatedOutputTokens || 200;

    // Get costs for all tiers
    const costs = await this.costOptimizer.compareCosts(inputTokens, outputTokens);

    // If user has preferred tier and can afford it, use it
    if (criteria.preferredTier) {
      const preferredCost = costs[criteria.preferredTier];
      if (
        !criteria.userBudget ||
        preferredCost <= criteria.userBudget
      ) {
        return {
          selectedTier: criteria.preferredTier,
          reason: `User preferred tier: ${criteria.preferredTier}`,
          estimatedCost: preferredCost,
          alternativeTiers: this.getAlternativeTiers(criteria.preferredTier),
          alternativeCosts: costs,
          budgetRemaining: criteria.userBudget
            ? criteria.userBudget - preferredCost
            : undefined
        };
      }
    }

    // Select based on complexity
    let selectedTier = this.selectByComplexity(criteria.complexity);

    // Check budget constraint
    if (criteria.userBudget && costs[selectedTier] > criteria.userBudget) {
      selectedTier = await this.selectWithinBudget(
        criteria.userBudget,
        costs
      );
    }

    // Apply priority overrides
    if (criteria.prioritizeCost) {
      selectedTier = await this.costOptimizer.getCheapestTier(
        inputTokens,
        outputTokens
      );
    } else if (criteria.prioritizeSpeed) {
      selectedTier = this.selectFastestTier();
    } else if (criteria.prioritizeQuality) {
      selectedTier = this.selectHighestQualityTier();
    }

    const selectedCost = costs[selectedTier];
    const reason = this.generateSelectionReason(
      selectedTier,
      criteria,
      selectedCost
    );

    return {
      selectedTier,
      reason,
      estimatedCost: selectedCost,
      alternativeTiers: this.getAlternativeTiers(selectedTier),
      alternativeCosts: costs,
      budgetRemaining: criteria.userBudget
        ? criteria.userBudget - selectedCost
        : undefined
    };
  }

  /**
   * Select tier based on query complexity
   * @param complexity - Query complexity level
   * @returns Selected tier
   */
  private selectByComplexity(complexity: QueryComplexity): RoutingTier {
    switch (complexity) {
      case QueryComplexity.SIMPLE:
        return RoutingTier.LOCAL_LLM;
      case QueryComplexity.MODERATE:
        return RoutingTier.RAP_SYSTEM;
      case QueryComplexity.COMPLEX:
        return RoutingTier.EXTERNAL_LLM;
      default:
        return RoutingTier.RAP_SYSTEM;
    }
  }

  /**
   * Select tier within budget constraint
   * @param budget - Available budget
   * @param costs - Cost for each tier
   * @returns Selected tier within budget
   */
  private async selectWithinBudget(
    budget: number,
    costs: Record<RoutingTier, number>
  ): Promise<RoutingTier> {
    // Try tiers in order of preference: Local -> RAP -> External
    const tierOrder = [
      RoutingTier.LOCAL_LLM,
      RoutingTier.RAP_SYSTEM,
      RoutingTier.EXTERNAL_LLM
    ];

    for (const tier of tierOrder) {
      if (costs[tier] <= budget) {
        return tier;
      }
    }

    // If no tier fits budget, return cheapest
    return RoutingTier.LOCAL_LLM;
  }

  /**
   * Select fastest tier
   * @returns Fastest tier
   */
  private selectFastestTier(): RoutingTier {
    let fastestTier = RoutingTier.LOCAL_LLM;
    let lowestLatency = Infinity;

    for (const [tier, profile] of this.tierProfiles.entries()) {
      if (profile.averageLatency < lowestLatency) {
        lowestLatency = profile.averageLatency;
        fastestTier = tier;
      }
    }

    return fastestTier;
  }

  /**
   * Select highest quality tier
   * @returns Highest quality tier
   */
  private selectHighestQualityTier(): RoutingTier {
    let bestTier = RoutingTier.LOCAL_LLM;
    let highestQuality = 0;

    for (const [tier, profile] of this.tierProfiles.entries()) {
      if (profile.qualityScore > highestQuality) {
        highestQuality = profile.qualityScore;
        bestTier = tier;
      }
    }

    return bestTier;
  }

  /**
   * Get alternative tiers for a selected tier
   * @param selectedTier - Selected tier
   * @returns Array of alternative tiers
   */
  private getAlternativeTiers(selectedTier: RoutingTier): RoutingTier[] {
    const allTiers = [
      RoutingTier.LOCAL_LLM,
      RoutingTier.RAP_SYSTEM,
      RoutingTier.EXTERNAL_LLM
    ];

    return allTiers.filter(tier => tier !== selectedTier);
  }

  /**
   * Generate human-readable reason for tier selection
   * @param tier - Selected tier
   * @param criteria - Selection criteria
   * @param cost - Estimated cost
   * @returns Reason string
   */
  private generateSelectionReason(
    tier: RoutingTier,
    criteria: SelectionCriteria,
    cost: number
  ): string {
    if (criteria.prioritizeCost) {
      return `Selected ${tier} for cost optimization (estimated: $${cost.toFixed(4)})`;
    }

    if (criteria.prioritizeSpeed) {
      return `Selected ${tier} for speed optimization`;
    }

    if (criteria.prioritizeQuality) {
      return `Selected ${tier} for quality optimization`;
    }

    if (criteria.userBudget && cost > criteria.userBudget) {
      return `Selected ${tier} within budget constraint ($${criteria.userBudget})`;
    }

    return `Selected ${tier} for ${criteria.complexity} complexity query`;
  }

  /**
   * Get cost-benefit analysis for all tiers
   * @param inputTokens - Input tokens
   * @param outputTokens - Output tokens
   * @returns Cost-benefit analysis for each tier
   */
  async getCostBenefitAnalysis(
    inputTokens: number = 100,
    outputTokens: number = 200
  ): Promise<Record<RoutingTier, { cost: number; quality: number; ratio: number }>> {
    const costs = await this.costOptimizer.compareCosts(inputTokens, outputTokens);
    const result: Record<RoutingTier, { cost: number; quality: number; ratio: number }> = {} as any;

    for (const [tier, profile] of this.tierProfiles.entries()) {
      const cost = costs[tier];
      const quality = profile.qualityScore;
      const ratio = cost > 0 ? cost / quality : 0;

      result[tier] = {
        cost,
        quality,
        ratio
      };
    }

    return result;
  }

  /**
   * Get best value tier (best quality per cost)
   * @param inputTokens - Input tokens
   * @param outputTokens - Output tokens
   * @returns Best value tier
   */
  async getBestValueTier(
    inputTokens: number = 100,
    outputTokens: number = 200
  ): Promise<RoutingTier> {
    const analysis = await this.getCostBenefitAnalysis(inputTokens, outputTokens);
    let bestTier = RoutingTier.LOCAL_LLM;
    let bestRatio = Infinity;

    for (const [tier, data] of Object.entries(analysis)) {
      if (data.ratio < bestRatio && data.ratio > 0) {
        bestRatio = data.ratio;
        bestTier = tier as RoutingTier;
      }
    }

    return bestTier;
  }

  /**
   * Update tier profile based on actual metrics
   * @param tier - Routing tier
   * @param profile - Updated profile
   */
  updateTierProfile(tier: RoutingTier, profile: Partial<TierProfile>): void {
    const existing = this.tierProfiles.get(tier);
    if (existing) {
      this.tierProfiles.set(tier, { ...existing, ...profile });
    }
  }

  /**
   * Get tier profile
   * @param tier - Routing tier
   * @returns Tier profile
   */
  getTierProfile(tier: RoutingTier): TierProfile | undefined {
    return this.tierProfiles.get(tier);
  }

  /**
   * Get all tier profiles
   * @returns All tier profiles
   */
  getAllTierProfiles(): Record<RoutingTier, TierProfile> {
    const result: Record<RoutingTier, TierProfile> = {} as any;

    for (const [tier, profile] of this.tierProfiles.entries()) {
      result[tier] = profile;
    }

    return result;
  }

  /**
   * Predict tier selection for a query
   * @param complexity - Query complexity
   * @param budget - User budget
   * @returns Predicted tier
   */
  async predictTierSelection(
    complexity: QueryComplexity,
    budget?: number
  ): Promise<RoutingTier> {
    const criteria: SelectionCriteria = {
      complexity,
      userBudget: budget
    };

    const result = await this.selectTier(criteria);
    return result.selectedTier;
  }

  /**
   * Get tier recommendation with explanation
   * @param criteria - Selection criteria
   * @returns Recommendation with explanation
   */
  async getRecommendation(
    criteria: SelectionCriteria
  ): Promise<{
    recommendedTier: RoutingTier;
    explanation: string;
    pros: string[];
    cons: string[];
    estimatedCost: number;
  }> {
    const result = await this.selectTier(criteria);
    const profile = this.tierProfiles.get(result.selectedTier);

    if (!profile) {
      throw new Error(`No profile found for tier ${result.selectedTier}`);
    }

    const pros = this.getTierPros(result.selectedTier);
    const cons = this.getTierCons(result.selectedTier);

    return {
      recommendedTier: result.selectedTier,
      explanation: result.reason,
      pros,
      cons,
      estimatedCost: result.estimatedCost
    };
  }

  /**
   * Get pros for a tier
   * @param tier - Routing tier
   * @returns List of pros
   */
  private getTierPros(tier: RoutingTier): string[] {
    switch (tier) {
      case RoutingTier.LOCAL_LLM:
        return [
          'No API costs',
          'Fastest response time',
          'Works offline',
          'Privacy-preserving'
        ];
      case RoutingTier.RAP_SYSTEM:
        return [
          'Balanced cost and quality',
          'Knowledge-grounded responses',
          'Good for moderate complexity',
          'Moderate latency'
        ];
      case RoutingTier.EXTERNAL_LLM:
        return [
          'Highest quality responses',
          'Best for complex queries',
          'Most reliable',
          'Advanced reasoning'
        ];
      default:
        return [];
    }
  }

  /**
   * Get cons for a tier
   * @param tier - Routing tier
   * @returns List of cons
   */
  private getTierCons(tier: RoutingTier): string[] {
    switch (tier) {
      case RoutingTier.LOCAL_LLM:
        return [
          'Lower quality responses',
          'Limited reasoning capability',
          'Smaller model size',
          'May struggle with complex queries'
        ];
      case RoutingTier.RAP_SYSTEM:
        return [
          'Moderate cost',
          'Depends on knowledge base quality',
          'Moderate latency',
          'May not handle novel topics well'
        ];
      case RoutingTier.EXTERNAL_LLM:
        return [
          'Highest cost',
          'Slowest response time',
          'Requires internet connection',
          'Privacy concerns with external APIs'
        ];
      default:
        return [];
    }
  }
}
