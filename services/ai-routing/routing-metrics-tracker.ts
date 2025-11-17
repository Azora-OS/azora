/**
 * Routing Metrics Tracker
 * Tracks performance metrics for each routing tier
 */

import { PrismaClient } from '@prisma/client';
import { RoutingTier, RoutingMetricsData } from './types';

export interface TierUsageMetrics {
  tier: RoutingTier;
  usageCount: number;
  usagePercentage: number;
  fallbackCount: number;
  fallbackRate: number;
}

export class RoutingMetricsTracker {
  private prisma: PrismaClient;
  private inMemoryMetrics: Map<RoutingTier, RoutingMetricsData> = new Map();
  private tierUsage: Map<RoutingTier, TierUsageMetrics> = new Map();
  private fallbackEvents: Array<{ from: RoutingTier; to: RoutingTier; timestamp: Date }> = [];

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.initializeMetrics();
    this.initializeTierUsage();
  }

  /**
   * Initialize metrics for all routing tiers
   */
  private initializeMetrics(): void {
    const tiers: RoutingTier[] = [
      RoutingTier.LOCAL_LLM,
      RoutingTier.RAP_SYSTEM,
      RoutingTier.EXTERNAL_LLM
    ];

    for (const tier of tiers) {
      this.inMemoryMetrics.set(tier, {
        routingTier: tier,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        averageCost: 0,
        cacheHits: 0,
        cacheMisses: 0,
        cacheHitRate: 0,
        successRate: 0,
        lastUpdated: new Date()
      });
    }
  }

  /**
   * Initialize tier usage metrics
   */
  private initializeTierUsage(): void {
    const tiers: RoutingTier[] = [
      RoutingTier.LOCAL_LLM,
      RoutingTier.RAP_SYSTEM,
      RoutingTier.EXTERNAL_LLM
    ];

    for (const tier of tiers) {
      this.tierUsage.set(tier, {
        tier,
        usageCount: 0,
        usagePercentage: 0,
        fallbackCount: 0,
        fallbackRate: 0
      });
    }
  }

  /**
   * Record a routing decision
   */
  async recordRouting(
    tier: RoutingTier,
    success: boolean,
    responseTime: number,
    cost: number,
    cached: boolean = false
  ): Promise<void> {
    const metrics = this.inMemoryMetrics.get(tier);
    if (!metrics) return;

    // Update in-memory metrics
    metrics.totalRequests += 1;
    if (success) {
      metrics.successfulRequests += 1;
    } else {
      metrics.failedRequests += 1;
    }

    // Update average response time
    metrics.averageResponseTime =
      (metrics.averageResponseTime * (metrics.totalRequests - 1) + responseTime) /
      metrics.totalRequests;

    // Update average cost
    metrics.averageCost =
      (metrics.averageCost * (metrics.totalRequests - 1) + cost) /
      metrics.totalRequests;

    // Update cache metrics
    if (cached) {
      metrics.cacheHits += 1;
    } else {
      metrics.cacheMisses += 1;
    }

    // Calculate rates
    metrics.successRate = (metrics.successfulRequests / metrics.totalRequests) * 100;
    const totalCacheRequests = metrics.cacheHits + metrics.cacheMisses;
    metrics.cacheHitRate = totalCacheRequests > 0 ? (metrics.cacheHits / totalCacheRequests) * 100 : 0;

    metrics.lastUpdated = new Date();

    // Persist to database periodically (every 100 requests)
    if (metrics.totalRequests % 100 === 0) {
      await this.persistMetrics(tier, metrics);
    }
  }

  /**
   * Persist metrics to database
   */
  private async persistMetrics(tier: RoutingTier, metrics: RoutingMetricsData): Promise<void> {
    try {
      await this.prisma.routingMetrics.upsert({
        where: { routingTier: tier },
        update: {
          totalRequests: metrics.totalRequests,
          successfulRequests: metrics.successfulRequests,
          failedRequests: metrics.failedRequests,
          averageResponseTime: Math.round(metrics.averageResponseTime),
          averageCost: metrics.averageCost,
          cacheHits: metrics.cacheHits,
          cacheMisses: metrics.cacheMisses,
          lastUpdated: new Date()
        },
        create: {
          routingTier: tier,
          totalRequests: metrics.totalRequests,
          successfulRequests: metrics.successfulRequests,
          failedRequests: metrics.failedRequests,
          averageResponseTime: Math.round(metrics.averageResponseTime),
          averageCost: metrics.averageCost,
          cacheHits: metrics.cacheHits,
          cacheMisses: metrics.cacheMisses
        }
      });
    } catch (error) {
      console.error(`Error persisting metrics for tier ${tier}:`, error);
    }
  }

  /**
   * Get metrics for a specific tier
   */
  async getMetrics(tier: RoutingTier): Promise<RoutingMetricsData | null> {
    return this.inMemoryMetrics.get(tier) || null;
  }

  /**
   * Get metrics for all tiers
   */
  async getAllMetrics(): Promise<Record<RoutingTier, RoutingMetricsData>> {
    const result: Record<RoutingTier, RoutingMetricsData> = {} as any;

    for (const [tier, metrics] of this.inMemoryMetrics.entries()) {
      result[tier] = metrics;
    }

    return result;
  }

  /**
   * Get tier with best success rate
   */
  async getBestPerformingTier(): Promise<RoutingTier> {
    let bestTier = RoutingTier.LOCAL_LLM;
    let bestSuccessRate = 0;

    for (const [tier, metrics] of this.inMemoryMetrics.entries()) {
      if (metrics.successRate > bestSuccessRate) {
        bestSuccessRate = metrics.successRate;
        bestTier = tier;
      }
    }

    return bestTier;
  }

  /**
   * Get tier with lowest average cost
   */
  async getCheapestTier(): Promise<RoutingTier> {
    let cheapestTier = RoutingTier.LOCAL_LLM;
    let lowestCost = Infinity;

    for (const [tier, metrics] of this.inMemoryMetrics.entries()) {
      if (metrics.averageCost < lowestCost) {
        lowestCost = metrics.averageCost;
        cheapestTier = tier;
      }
    }

    return cheapestTier;
  }

  /**
   * Get tier with fastest response time
   */
  async getFastestTier(): Promise<RoutingTier> {
    let fastestTier = RoutingTier.LOCAL_LLM;
    let lowestLatency = Infinity;

    for (const [tier, metrics] of this.inMemoryMetrics.entries()) {
      if (metrics.averageResponseTime < lowestLatency) {
        lowestLatency = metrics.averageResponseTime;
        fastestTier = tier;
      }
    }

    return fastestTier;
  }

  /**
   * Get overall system health
   */
  async getSystemHealth(): Promise<{
    overallSuccessRate: number;
    averageResponseTime: number;
    totalRequests: number;
    cacheHitRate: number;
  }> {
    let totalRequests = 0;
    let totalSuccessful = 0;
    let totalResponseTime = 0;
    let totalCacheHits = 0;
    let totalCacheMisses = 0;

    for (const metrics of this.inMemoryMetrics.values()) {
      totalRequests += metrics.totalRequests;
      totalSuccessful += metrics.successfulRequests;
      totalResponseTime += metrics.averageResponseTime * metrics.totalRequests;
      totalCacheHits += metrics.cacheHits;
      totalCacheMisses += metrics.cacheMisses;
    }

    const overallSuccessRate = totalRequests > 0 ? (totalSuccessful / totalRequests) * 100 : 0;
    const averageResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;
    const totalCacheRequests = totalCacheHits + totalCacheMisses;
    const cacheHitRate = totalCacheRequests > 0 ? (totalCacheHits / totalCacheRequests) * 100 : 0;

    return {
      overallSuccessRate,
      averageResponseTime,
      totalRequests,
      cacheHitRate
    };
  }

  /**
   * Reset all metrics
   */
  async resetMetrics(): Promise<void> {
    this.initializeMetrics();

    try {
      await this.prisma.routingMetrics.deleteMany({});
    } catch (error) {
      console.error('Error resetting metrics in database:', error);
    }
  }

  /**
   * Persist all metrics to database
   */
  async persistAllMetrics(): Promise<void> {
    for (const [tier, metrics] of this.inMemoryMetrics.entries()) {
      await this.persistMetrics(tier, metrics);
    }
  }

  /**
   * Record a fallback event
   */
  recordFallback(fromTier: RoutingTier, toTier: RoutingTier): void {
    this.fallbackEvents.push({
      from: fromTier,
      to: toTier,
      timestamp: new Date()
    });

    // Update tier usage
    const usage = this.tierUsage.get(fromTier);
    if (usage) {
      usage.fallbackCount += 1;
    }
  }

  /**
   * Get tier usage metrics
   */
  getTierUsageMetrics(): Record<RoutingTier, TierUsageMetrics> {
    const result: Record<RoutingTier, TierUsageMetrics> = {} as any;
    let totalUsage = 0;

    // Calculate total usage
    for (const metrics of this.inMemoryMetrics.values()) {
      totalUsage += metrics.totalRequests;
    }

    // Calculate usage percentages
    for (const [tier, usage] of this.tierUsage.entries()) {
      const metrics = this.inMemoryMetrics.get(tier);
      if (metrics) {
        usage.usageCount = metrics.totalRequests;
        usage.usagePercentage = totalUsage > 0 ? (metrics.totalRequests / totalUsage) * 100 : 0;
        usage.fallbackRate = metrics.totalRequests > 0 ? (usage.fallbackCount / metrics.totalRequests) * 100 : 0;
      }
      result[tier] = usage;
    }

    return result;
  }

  /**
   * Get fallback rate for a tier
   */
  getFallbackRate(tier: RoutingTier): number {
    const usage = this.tierUsage.get(tier);
    return usage?.fallbackRate || 0;
  }

  /**
   * Get overall fallback rate
   */
  getOverallFallbackRate(): number {
    let totalFallbacks = 0;
    let totalRequests = 0;

    for (const metrics of this.inMemoryMetrics.values()) {
      totalRequests += metrics.totalRequests;
    }

    for (const usage of this.tierUsage.values()) {
      totalFallbacks += usage.fallbackCount;
    }

    return totalRequests > 0 ? (totalFallbacks / totalRequests) * 100 : 0;
  }

  /**
   * Get fallback events
   */
  getFallbackEvents(limit: number = 100): Array<{ from: RoutingTier; to: RoutingTier; timestamp: Date }> {
    return this.fallbackEvents.slice(-limit);
  }

  /**
   * Get tier usage distribution
   */
  getTierUsageDistribution(): Record<RoutingTier, number> {
    const result: Record<RoutingTier, number> = {} as any;
    let totalUsage = 0;

    for (const metrics of this.inMemoryMetrics.values()) {
      totalUsage += metrics.totalRequests;
    }

    for (const [tier, metrics] of this.inMemoryMetrics.entries()) {
      result[tier] = totalUsage > 0 ? (metrics.totalRequests / totalUsage) * 100 : 0;
    }

    return result;
  }
}
