/**
 * Cost Optimizer
 * Manages cost calculation, tracking, and optimization for AI routing tiers
 * Implements cost-aware routing decisions and budget constraints
 */

import { PrismaClient } from '@prisma/client';
import { RoutingTier, ICostOptimizer } from './types';

/**
 * Cost configuration per tier
 */
export interface TierCostConfig {
  baseCost: number; // Base cost per query
  costPerToken: number; // Cost per output token
  costPerInputToken: number; // Cost per input token
  minCost: number; // Minimum cost per query
  maxCost: number; // Maximum cost per query
}

/**
 * Cost metrics for tracking
 */
export interface CostMetrics {
  tier: RoutingTier;
  totalCost: number;
  totalQueries: number;
  averageCostPerQuery: number;
  minCost: number;
  maxCost: number;
  lastUpdated: Date;
}

/**
 * User spending metrics
 */
export interface UserSpendingMetrics {
  userId: string;
  totalSpent: number;
  spentByTier: Record<RoutingTier, number>;
  queriesByTier: Record<RoutingTier, number>;
  monthlyBudget?: number;
  remainingBudget?: number;
  lastUpdated: Date;
}

/**
 * Cost Optimizer Implementation
 */
export class CostOptimizer implements ICostOptimizer {
  private prisma: PrismaClient;
  private tierCosts: Map<RoutingTier, TierCostConfig> = new Map();
  private costMetrics: Map<RoutingTier, CostMetrics> = new Map();
  private userSpending: Map<string, UserSpendingMetrics> = new Map();

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.initializeTierCosts();
    this.initializeCostMetrics();
  }

  /**
   * Initialize cost configuration for each tier
   * Based on typical API pricing models
   */
  private initializeTierCosts(): void {
    // Local LLM: No API cost, only infrastructure
    this.tierCosts.set(RoutingTier.LOCAL_LLM, {
      baseCost: 0,
      costPerToken: 0,
      costPerInputToken: 0,
      minCost: 0,
      maxCost: 0
    });

    // RAP System: Moderate cost (embedding + retrieval + external LLM)
    // Typical: $0.0001 per input token, $0.0003 per output token
    this.tierCosts.set(RoutingTier.RAP_SYSTEM, {
      baseCost: 0.001, // $0.001 base for retrieval
      costPerToken: 0.0003,
      costPerInputToken: 0.0001,
      minCost: 0.001,
      maxCost: 0.05
    });

    // External LLM: Higher cost (GPT-4 or similar)
    // Typical: $0.0003 per input token, $0.0006 per output token
    this.tierCosts.set(RoutingTier.EXTERNAL_LLM, {
      baseCost: 0.002,
      costPerToken: 0.0006,
      costPerInputToken: 0.0003,
      minCost: 0.002,
      maxCost: 0.10
    });
  }

  /**
   * Initialize cost metrics for each tier
   */
  private initializeCostMetrics(): void {
    const tiers: RoutingTier[] = [
      RoutingTier.LOCAL_LLM,
      RoutingTier.RAP_SYSTEM,
      RoutingTier.EXTERNAL_LLM
    ];

    for (const tier of tiers) {
      this.costMetrics.set(tier, {
        tier,
        totalCost: 0,
        totalQueries: 0,
        averageCostPerQuery: 0,
        minCost: Infinity,
        maxCost: 0,
        lastUpdated: new Date()
      });
    }
  }

  /**
   * Calculate cost for a query based on tier and token counts
   * @param tier - Routing tier
   * @param inputTokens - Number of input tokens
   * @param outputTokens - Number of output tokens
   * @returns Calculated cost in dollars
   */
  async calculateCost(
    tier: RoutingTier,
    inputTokens: number = 0,
    outputTokens: number = 0
  ): Promise<number> {
    const config = this.tierCosts.get(tier);
    if (!config) {
      throw new Error(`Unknown routing tier: ${tier}`);
    }

    // Calculate cost based on tokens
    let cost = config.baseCost;
    cost += inputTokens * config.costPerInputToken;
    cost += outputTokens * config.costPerToken;

    // Apply min/max constraints
    cost = Math.max(config.minCost, Math.min(cost, config.maxCost));

    return Math.round(cost * 10000) / 10000; // Round to 4 decimal places
  }

  /**
   * Track spending for a user
   * @param userId - User ID
   * @param tier - Routing tier used
   * @param cost - Cost of the query
   */
  async trackSpending(
    userId: string,
    tier: RoutingTier,
    cost: number
  ): Promise<void> {
    // Update in-memory metrics
    let userMetrics = this.userSpending.get(userId);
    if (!userMetrics) {
      userMetrics = {
        userId,
        totalSpent: 0,
        spentByTier: {
          [RoutingTier.LOCAL_LLM]: 0,
          [RoutingTier.RAP_SYSTEM]: 0,
          [RoutingTier.EXTERNAL_LLM]: 0
        },
        queriesByTier: {
          [RoutingTier.LOCAL_LLM]: 0,
          [RoutingTier.RAP_SYSTEM]: 0,
          [RoutingTier.EXTERNAL_LLM]: 0
        },
        lastUpdated: new Date()
      };
      this.userSpending.set(userId, userMetrics);
    }

    userMetrics.totalSpent += cost;
    userMetrics.spentByTier[tier] += cost;
    userMetrics.queriesByTier[tier] += 1;
    userMetrics.lastUpdated = new Date();

    // Update tier metrics
    const tierMetrics = this.costMetrics.get(tier);
    if (tierMetrics) {
      tierMetrics.totalCost += cost;
      tierMetrics.totalQueries += 1;
      tierMetrics.averageCostPerQuery = tierMetrics.totalCost / tierMetrics.totalQueries;
      tierMetrics.minCost = Math.min(tierMetrics.minCost, cost);
      tierMetrics.maxCost = Math.max(tierMetrics.maxCost, cost);
      tierMetrics.lastUpdated = new Date();
    }

    // Persist to database periodically (every 50 queries)
    if (userMetrics.queriesByTier[tier] % 50 === 0) {
      await this.persistUserSpending(userId, userMetrics);
    }
  }

  /**
   * Persist user spending to database
   */
  private async persistUserSpending(
    userId: string,
    metrics: UserSpendingMetrics
  ): Promise<void> {
    try {
      // Mock implementation - replace with actual Prisma model when available
      console.log(`Persisting spending for user ${userId}:`, metrics.totalSpent);
    } catch (error) {
      console.error(`Error persisting spending for user ${userId}:`, error);
    }
  }

  /**
   * Get spending metrics for a user
   * @param userId - User ID
   * @returns User spending metrics
   */
  async getUserSpending(userId: string): Promise<UserSpendingMetrics | null> {
    return this.userSpending.get(userId) || null;
  }

  /**
   * Get spending metrics for all tiers
   * @returns Record of tier spending metrics
   */
  async getSpendingMetrics(): Promise<Record<RoutingTier, number>> {
    const result: Record<RoutingTier, number> = {} as any;

    for (const [tier, metrics] of this.costMetrics.entries()) {
      result[tier] = metrics.totalCost;
    }

    return result;
  }

  /**
   * Check if a query should be rejected based on cost
   * @param tier - Routing tier
   * @param cost - Estimated cost
   * @param userBudget - User's remaining budget
   * @returns True if query should be rejected
   */
  async shouldRejectQuery(
    tier: RoutingTier,
    cost: number,
    userBudget?: number
  ): Promise<boolean> {
    // Check tier max cost
    const config = this.tierCosts.get(tier);
    if (!config) return true;

    if (cost > config.maxCost) {
      return true;
    }

    // Check user budget
    if (userBudget !== undefined && cost > userBudget) {
      return true;
    }

    return false;
  }

  /**
   * Get cheapest tier for a query
   * @param inputTokens - Input tokens
   * @param outputTokens - Output tokens
   * @returns Cheapest tier
   */
  async getCheapestTier(
    inputTokens: number = 100,
    outputTokens: number = 200
  ): Promise<RoutingTier> {
    const costs = await this.compareCosts(inputTokens, outputTokens);
    let cheapestTier = RoutingTier.LOCAL_LLM;
    let lowestCost = Infinity;

    for (const [tier, cost] of Object.entries(costs)) {
      if (cost < lowestCost) {
        lowestCost = cost;
        cheapestTier = tier as RoutingTier;
      }
    }

    return cheapestTier;
  }

  /**
   * Get cost comparison across tiers
   * @param inputTokens - Input tokens
   * @param outputTokens - Output tokens
   * @returns Cost for each tier
   */
  async compareCosts(
    inputTokens: number = 100,
    outputTokens: number = 200
  ): Promise<Record<RoutingTier, number>> {
    const result: Record<RoutingTier, number> = {} as any;

    for (const tier of [
      RoutingTier.LOCAL_LLM,
      RoutingTier.RAP_SYSTEM,
      RoutingTier.EXTERNAL_LLM
    ]) {
      result[tier] = await this.calculateCost(tier, inputTokens, outputTokens);
    }

    return result;
  }

  /**
   * Get spending metrics for a specific tier
   * @param tier - Routing tier
   * @returns Cost metrics for the tier
   */
  async getTierSpending(tier: RoutingTier): Promise<CostMetrics | null> {
    return this.costMetrics.get(tier) || null;
  }

  /**
   * Get average cost per query for a tier
   * @param tier - Routing tier
   * @returns Average cost per query
   */
  async getAverageCostPerQuery(tier: RoutingTier): Promise<number> {
    const metrics = this.costMetrics.get(tier);
    return metrics?.averageCostPerQuery || 0;
  }

  /**
   * Get total cost for a tier
   * @param tier - Routing tier
   * @returns Total cost for the tier
   */
  async getTotalCost(tier: RoutingTier): Promise<number> {
    const metrics = this.costMetrics.get(tier);
    return metrics?.totalCost || 0;
  }

  /**
   * Get total queries for a tier
   * @param tier - Routing tier
   * @returns Total queries for the tier
   */
  async getTotalQueries(tier: RoutingTier): Promise<number> {
    const metrics = this.costMetrics.get(tier);
    return metrics?.totalQueries || 0;
  }

  /**
   * Get total spending across all tiers
   * @returns Total spending amount
   */
  async getTotalSpending(): Promise<number> {
    let total = 0;
    for (const metrics of this.costMetrics.values()) {
      total += metrics.totalCost;
    }
    return total;
  }

  /**
   * Reset spending metrics for a tier
   * @param tier - Routing tier to reset
   */
  async resetTierMetrics(tier: RoutingTier): Promise<void> {
    const metrics = this.costMetrics.get(tier);
    if (metrics) {
      metrics.totalCost = 0;
      metrics.totalQueries = 0;
      metrics.averageCostPerQuery = 0;
      metrics.minCost = Infinity;
      metrics.maxCost = 0;
      metrics.lastUpdated = new Date();
    }
  }
}