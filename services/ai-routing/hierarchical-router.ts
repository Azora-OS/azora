/**
 * Hierarchical AI Router
 * Coordinates three routing tiers with intelligent fallback logic and latency monitoring
 * Route A: Local LLM (Llama/Phi quantized) - Simple queries
 * Route B: RAP System (Knowledge Ocean + External LLM) - Moderate queries
 * Route C: External LLM (GPT-4) - Complex queries
 */

import { PrismaClient } from '@prisma/client';
import {
  AIQuery,
  AIResponse,
  QueryClassificationResult,
  QueryComplexity,
  RoutingTier,
  RoutingDecision,
  RoutingMetricsData,
  IHierarchicalRouter,
  AIRoutingConfig,
  FallbackStrategy
} from './types';
import { QueryClassifier } from './query-classifier';
import { LocalLLMService } from './local-llm-service';
import { RAPSystem } from './rap-system';
import { ExternalLLMService } from './external-llm-service';
import { RedisCacheManager } from './redis-cache-manager';
import { RoutingMetricsTracker } from './routing-metrics-tracker';
import { CostOptimizer } from './cost-optimizer';
import { ResponseCache } from './response-cache';

/**
 * Hierarchical AI Router
 * Implements intelligent routing with fallback logic and latency monitoring
 */
export class HierarchicalRouter implements IHierarchicalRouter {
  private queryClassifier: QueryClassifier;
  private localLLMService: LocalLLMService;
  private rapSystem: RAPSystem;
  private externalLLMService: ExternalLLMService;
  private cacheManager: RedisCacheManager;
  private metricsTracker: RoutingMetricsTracker;
  private costOptimizer: CostOptimizer;
  private responseCache: ResponseCache;
  private config: AIRoutingConfig;
  private fallbackStrategies: Map<RoutingTier, FallbackStrategy> = new Map();
  private latencyThresholds: Map<RoutingTier, number> = new Map();
  private costThresholds: Map<RoutingTier, number> = new Map();

  constructor(
    config: AIRoutingConfig,
    prisma: PrismaClient,
    queryClassifier?: QueryClassifier,
    localLLMService?: LocalLLMService,
    rapSystem?: RAPSystem,
    externalLLMService?: ExternalLLMService,
    cacheManager?: RedisCacheManager,
    metricsTracker?: RoutingMetricsTracker,
    costOptimizer?: CostOptimizer,
    responseCache?: ResponseCache
  ) {
    this.config = config;
    this.queryClassifier = queryClassifier || new QueryClassifier();
    this.localLLMService = localLLMService || new LocalLLMService();
    this.rapSystem = rapSystem || new RAPSystem({
      internalSourceWeight: config.internalSourceWeight,
      externalSourceWeight: config.externalSourceWeight,
      maxContextTokens: 2000,
      maxRetrievalResults: 10,
      externalLLMProvider: config.externalLLMProvider as 'openai' | 'anthropic',
      externalLLMModel: config.externalLLMModel,
      externalLLMApiKey: process.env.EXTERNAL_LLM_API_KEY || '',
      embeddingApiKey: process.env.EMBEDDING_API_KEY || '',
      vectorDbApiKey: process.env.VECTOR_DB_API_KEY || ''
    });
    this.externalLLMService = externalLLMService || new ExternalLLMService({
      provider: config.externalLLMProvider as 'openai' | 'anthropic',
      model: config.externalLLMModel,
      apiKey: process.env.EXTERNAL_LLM_API_KEY || '',
      maxTokens: 2000,
      temperature: 0.7,
      topP: 0.9,
      cacheTTL: 3600
    });
    this.cacheManager = cacheManager || new RedisCacheManager(config.redisUrl, config.redisKeyPrefix);
    this.metricsTracker = metricsTracker || new RoutingMetricsTracker(prisma);
    this.costOptimizer = costOptimizer || new CostOptimizer(prisma);
    this.responseCache = responseCache || new ResponseCache({
      keyPrefix: 'ai-routing:response:',
      defaultTTL: config.cacheTTL || 3600,
      maxCacheSize: 100000
    });

    this.initializeFallbackStrategies();
    this.initializeLatencyThresholds();
    this.initializeCostThresholds();
  }

  /**
   * Initialize fallback strategies for each routing tier
   */
  private initializeFallbackStrategies(): void {
    // Route A (Local LLM) fallback to Route B (RAP)
    this.fallbackStrategies.set(RoutingTier.LOCAL_LLM, {
      tier: RoutingTier.LOCAL_LLM,
      condition: 'failure',
      threshold: 0,
      nextTier: RoutingTier.RAP_SYSTEM
    });

    // Route B (RAP) fallback to Route C (External LLM)
    this.fallbackStrategies.set(RoutingTier.RAP_SYSTEM, {
      tier: RoutingTier.RAP_SYSTEM,
      condition: 'failure',
      threshold: 0,
      nextTier: RoutingTier.EXTERNAL_LLM
    });

    // Route C (External LLM) has no fallback
    this.fallbackStrategies.set(RoutingTier.EXTERNAL_LLM, {
      tier: RoutingTier.EXTERNAL_LLM,
      condition: 'failure',
      threshold: 0,
      nextTier: RoutingTier.EXTERNAL_LLM
    });
  }

  /**
   * Initialize latency thresholds for each routing tier
   */
  private initializeLatencyThresholds(): void {
    // Local LLM: 500ms threshold
    this.latencyThresholds.set(RoutingTier.LOCAL_LLM, 500);
    // RAP System: 1000ms threshold
    this.latencyThresholds.set(RoutingTier.RAP_SYSTEM, 1000);
    // External LLM: 3000ms threshold
    this.latencyThresholds.set(RoutingTier.EXTERNAL_LLM, 3000);
  }

  /**
   * Initialize cost thresholds for each routing tier
   */
  private initializeCostThresholds(): void {
    // Local LLM: $0 (no API cost)
    this.costThresholds.set(RoutingTier.LOCAL_LLM, 0);
    // RAP System: $0.05 per query
    this.costThresholds.set(RoutingTier.RAP_SYSTEM, 0.05);
    // External LLM: $0.10 per query
    this.costThresholds.set(RoutingTier.EXTERNAL_LLM, 0.10);
  }

  /**
   * Route a query through the hierarchical system
   * Implements intelligent routing with fallback logic, cost optimization, and response caching
   */
  async route(query: AIQuery): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Step 0: Check response cache first
      const queryHash = this.hashQuery(query.query);
      const cachedResponse = await this.responseCache.get(queryHash);
      if (cachedResponse) {
        console.log(`Cache hit for query: ${query.query.substring(0, 50)}...`);
        return {
          id: `response-${Date.now()}`,
          content: cachedResponse.response,
          routingTier: cachedResponse.routingTier,
          responseTime: Date.now() - startTime,
          cost: 0,
          cached: true,
          metadata: {
            cacheHit: true,
            cachedAt: cachedResponse.expiresAt
          }
        };
      }

      // Step 1: Classify the query
      const classification = await this.classify(query);

      // Step 2: Make routing decision with cost optimization
      const userBudget = query.context?.budget as number | undefined;
      const routingDecision = await this.makeRoutingDecision(classification, userBudget);

      // Step 3: Try primary routing tier with fallback logic
      let response: AIResponse | null = null;
      let currentTier = routingDecision.tier;
      let attemptCount = 0;
      const maxAttempts = 3; // Try up to 3 tiers

      while (!response && attemptCount < maxAttempts) {
        try {
          response = await this.processWithTier(query, currentTier);

          // Check if response meets latency threshold
          if (this.config.fallbackOnLatency && response.responseTime > (this.latencyThresholds.get(currentTier) || 3000)) {
            const nextTier = this.getNextFallbackTier(currentTier);
            if (nextTier !== currentTier) {
              console.warn(
                `Latency threshold exceeded for ${currentTier} (${response.responseTime}ms). Falling back to ${nextTier}`
              );
              
              // Record fallback event
              this.metricsTracker.recordFallback(currentTier, nextTier);
              
              response = null;
              currentTier = nextTier;
              attemptCount++;
              continue;
            }
          }

          // Track spending with cost optimizer
          if (query.userId) {
            await this.costOptimizer.trackSpending(query.userId, currentTier, response.cost);
          }

          // Cache the response
          await this.responseCache.set({
            id: response.id,
            queryHash,
            query: query.query,
            response: response.content,
            routingTier: currentTier,
            cost: response.cost,
            ttl: this.config.cacheTTL || 3600,
            expiresAt: new Date(Date.now() + (this.config.cacheTTL || 3600) * 1000),
            hitCount: 0
          });

          // Record successful routing
          await this.metricsTracker.recordRouting(
            currentTier,
            true,
            response.responseTime,
            response.cost,
            response.cached
          );

          return response;
        } catch (error) {
          console.error(`Error routing with tier ${currentTier}:`, error);

          // Try next fallback tier
          const nextTier = this.getNextFallbackTier(currentTier);
          if (nextTier === currentTier) {
            // No more fallback tiers available
            throw error;
          }

          console.warn(`Tier ${currentTier} failed. Falling back to ${nextTier}`);
          
          // Record fallback event
          this.metricsTracker.recordFallback(currentTier, nextTier);
          
          currentTier = nextTier;
          attemptCount++;

          // Record failed routing
          await this.metricsTracker.recordRouting(currentTier, false, 0, 0, false);
        }
      }

      throw new Error('All routing tiers exhausted');
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error('Hierarchical routing failed:', error);

      throw new Error(
        `Hierarchical routing failed after ${totalTime}ms: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Classify a query by complexity
   */
  async classify(query: AIQuery): Promise<QueryClassificationResult> {
    return this.queryClassifier.classify(query);
  }

  /**
   * Make routing decision based on query classification
   * Integrates cost optimization to select optimal tier
   */
  private async makeRoutingDecision(
    classification: QueryClassificationResult,
    userBudget?: number
  ): Promise<RoutingDecision> {
    let tier = classification.routedTo;
    const metrics = await this.metricsTracker.getMetrics(tier);

    // Estimate tokens for cost calculation
    const estimatedInputTokens = Math.ceil(classification.query.length / 4);
    const estimatedOutputTokens = Math.ceil(estimatedInputTokens * 1.5);

    // Calculate cost for primary tier
    let estimatedCost = await this.costOptimizer.calculateCost(
      tier,
      estimatedInputTokens,
      estimatedOutputTokens
    );

    // Check if cost exceeds budget or tier max cost
    if (await this.costOptimizer.shouldRejectQuery(tier, estimatedCost, userBudget)) {
      // Try to find a cheaper tier
      const cheapestTier = await this.costOptimizer.getCheapestTier(
        estimatedInputTokens,
        estimatedOutputTokens
      );

      if (cheapestTier !== tier) {
        console.warn(
          `Cost ${estimatedCost} exceeds budget/threshold for ${tier}. Downgrading to ${cheapestTier}`
        );
        tier = cheapestTier;
        estimatedCost = await this.costOptimizer.calculateCost(
          tier,
          estimatedInputTokens,
          estimatedOutputTokens
        );
      }
    }

    return {
      tier,
      confidence: classification.confidence,
      estimatedCost,
      estimatedLatency: metrics?.averageResponseTime || 0,
      fallbackTier: this.getNextFallbackTier(tier),
      reason: `Query classified as ${classification.classifiedAs}, routing to ${tier} (cost: $${estimatedCost.toFixed(4)})`
    };
  }

  /**
   * Process query with a specific routing tier
   */
  private async processWithTier(query: AIQuery, tier: RoutingTier): Promise<AIResponse> {
    const startTime = Date.now();

    // Check cache first
    const queryHash = this.hashQuery(query.query);
    const cached = await this.cacheManager.get(queryHash);
    if (cached) {
      return {
        id: `response-${Date.now()}`,
        content: cached.response,
        routingTier: cached.routingTier,
        responseTime: Date.now() - startTime,
        cost: 0,
        cached: true,
        metadata: {
          cacheHit: true,
          cachedAt: cached.expiresAt
        }
      };
    }

    // Route to appropriate tier
    let response: AIResponse;

    switch (tier) {
      case RoutingTier.LOCAL_LLM:
        response = await this.localLLMService.processQuery(query);
        break;

      case RoutingTier.RAP_SYSTEM:
        response = await this.rapSystem.processQuery(query);
        break;

      case RoutingTier.EXTERNAL_LLM:
        response = await this.processExternalLLM(query);
        break;

      default:
        throw new Error(`Unknown routing tier: ${tier}`);
    }

    // Cache the response
    await this.cacheManager.cacheRoutingDecision(
      query.query,
      response.content,
      tier,
      response.cost,
      this.config.cacheTTL
    );

    return response;
  }

  /**
   * Process query with external LLM (Route C)
   */
  private async processExternalLLM(query: AIQuery): Promise<AIResponse> {
    return this.externalLLMService.processQuery(query);
  }

  /**
   * Get next fallback tier
   */
  private getNextFallbackTier(currentTier: RoutingTier): RoutingTier {
    const strategy = this.fallbackStrategies.get(currentTier);
    return strategy?.nextTier || currentTier;
  }

  /**
   * Get fallback chain for a tier
   * Returns the complete chain of tiers to try in order
   */
  private getFallbackChain(startTier: RoutingTier): RoutingTier[] {
    const chain: RoutingTier[] = [startTier];
    let currentTier = startTier;

    while (true) {
      const nextTier = this.getNextFallbackTier(currentTier);
      if (nextTier === currentTier || chain.includes(nextTier)) {
        break;
      }
      chain.push(nextTier);
      currentTier = nextTier;
    }

    return chain;
  }

  /**
   * Estimate cost for a routing tier
   */
  private estimateCost(tier: RoutingTier): number {
    return this.costThresholds.get(tier) || 0;
  }

  /**
   * Hash query for caching
   */
  private hashQuery(query: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(query).digest('hex');
  }

  /**
   * Get metrics for all routing tiers
   */
  async getMetrics(): Promise<Record<RoutingTier, RoutingMetricsData>> {
    return this.metricsTracker.getAllMetrics();
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<{
    overallSuccessRate: number;
    averageResponseTime: number;
    totalRequests: number;
    cacheHitRate: number;
  }> {
    return this.metricsTracker.getSystemHealth();
  }

  /**
   * Get best performing tier
   */
  async getBestPerformingTier(): Promise<RoutingTier> {
    return this.metricsTracker.getBestPerformingTier();
  }

  /**
   * Get cheapest tier
   */
  async getCheapestTier(): Promise<RoutingTier> {
    return this.metricsTracker.getCheapestTier();
  }

  /**
   * Get fastest tier
   */
  async getFastestTier(): Promise<RoutingTier> {
    return this.metricsTracker.getFastestTier();
  }

  /**
   * Update latency threshold for a tier
   */
  setLatencyThreshold(tier: RoutingTier, threshold: number): void {
    this.latencyThresholds.set(tier, threshold);
  }

  /**
   * Update cost threshold for a tier
   */
  setCostThreshold(tier: RoutingTier, threshold: number): void {
    this.costThresholds.set(tier, threshold);
  }

  /**
   * Update fallback strategy for a tier
   */
  setFallbackStrategy(tier: RoutingTier, strategy: FallbackStrategy): void {
    this.fallbackStrategies.set(tier, strategy);
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    await this.cacheManager.clear();
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{ hits: number; misses: number; size: number }> {
    return this.cacheManager.getStats();
  }

  /**
   * Reset all metrics
   */
  async resetMetrics(): Promise<void> {
    await this.metricsTracker.resetMetrics();
  }

  /**
   * Get cost metrics for all tiers
   */
  async getCostMetrics(): Promise<Record<RoutingTier, number>> {
    return this.costOptimizer.getSpendingMetrics();
  }

  /**
   * Get user spending metrics
   */
  async getUserSpending(userId: string) {
    return this.costOptimizer.getUserSpending(userId);
  }

  /**
   * Get response cache statistics
   */
  async getResponseCacheStats() {
    return this.responseCache.getStats();
  }

  /**
   * Get response cache hit rate
   */
  async getResponseCacheHitRate(): Promise<number> {
    return this.responseCache.getCacheHitRate();
  }

  /**
   * Clear response cache
   */
  async clearResponseCache(): Promise<number> {
    return this.responseCache.clear();
  }

  /**
   * Get cost comparison across tiers
   */
  async compareCosts(inputTokens: number = 100, outputTokens: number = 200) {
    return this.costOptimizer.compareCosts(inputTokens, outputTokens);
  }

  /**
   * Get cheapest tier for a query
   */
  async getCheapestTierForQuery(inputTokens: number = 100, outputTokens: number = 200): Promise<RoutingTier> {
    return this.costOptimizer.getCheapestTier(inputTokens, outputTokens);
  }

  /**
   * Get fallback chain for a tier
   * Returns the complete chain of tiers to try in order
   */
  getFallbackChainForTier(tier: RoutingTier): RoutingTier[] {
    return this.getFallbackChain(tier);
  }

  /**
   * Get all fallback strategies
   */
  getFallbackStrategies(): Map<RoutingTier, FallbackStrategy> {
    return this.fallbackStrategies;
  }

  /**
   * Get tier usage metrics
   */
  getTierUsageMetrics() {
    return this.metricsTracker.getTierUsageMetrics();
  }

  /**
   * Get fallback rate for a tier
   */
  getFallbackRate(tier: RoutingTier): number {
    return this.metricsTracker.getFallbackRate(tier);
  }

  /**
   * Get overall fallback rate
   */
  getOverallFallbackRate(): number {
    return this.metricsTracker.getOverallFallbackRate();
  }

  /**
   * Get fallback events
   */
  getFallbackEvents(limit?: number) {
    return this.metricsTracker.getFallbackEvents(limit);
  }

  /**
   * Get tier usage distribution
   */
  getTierUsageDistribution(): Record<RoutingTier, number> {
    return this.metricsTracker.getTierUsageDistribution();
  }
}
