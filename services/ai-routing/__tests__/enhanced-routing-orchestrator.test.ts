/**
 * Enhanced Routing Orchestrator Tests
 * Tests for cost optimization, response caching, and fallback logic integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HierarchicalRouter } from '../hierarchical-router';
import { CostOptimizer } from '../cost-optimizer';
import { ResponseCache } from '../response-cache';
import { QueryClassifier } from '../query-classifier';
import { LocalLLMService } from '../local-llm-service';
import { RAPSystem } from '../rap-system';
import { RedisCacheManager } from '../redis-cache-manager';
import { RoutingMetricsTracker } from '../routing-metrics-tracker';
import {
  AIQuery,
  AIResponse,
  QueryComplexity,
  RoutingTier,
  AIRoutingConfig,
  CacheEntry
} from '../types';
import { PrismaClient } from '@prisma/client';

// Mock dependencies
vi.mock('../query-classifier');
vi.mock('../local-llm-service');
vi.mock('../rap-system');
vi.mock('../redis-cache-manager');
vi.mock('../routing-metrics-tracker');
vi.mock('../cost-optimizer');
vi.mock('../response-cache');

describe('Enhanced Routing Orchestrator', () => {
  let router: HierarchicalRouter;
  let mockPrisma: PrismaClient;
  let mockClassifier: QueryClassifier;
  let mockLocalLLM: LocalLLMService;
  let mockRAP: RAPSystem;
  let mockCache: RedisCacheManager;
  let mockMetrics: RoutingMetricsTracker;
  let mockCostOptimizer: CostOptimizer;
  let mockResponseCache: ResponseCache;

  const defaultConfig: AIRoutingConfig = {
    localLLMEnabled: true,
    localLLMModel: 'llama',
    localLLMQuantization: 'q4',
    rapEnabled: true,
    knowledgeOceanUrl: 'http://localhost:8000',
    internalSourceWeight: 0.7,
    externalSourceWeight: 0.3,
    externalLLMEnabled: true,
    externalLLMProvider: 'openai',
    externalLLMModel: 'gpt-4',
    cacheEnabled: true,
    cacheTTL: 3600,
    cacheMaxSize: 1000,
    costTrackingEnabled: true,
    costThreshold: 0.10,
    latencyThreshold: 3000,
    fallbackOnLatency: true,
    redisUrl: 'redis://localhost:6379',
    redisKeyPrefix: 'ai-routing:'
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockPrisma = {} as PrismaClient;
    mockClassifier = new QueryClassifier() as any;
    mockLocalLLM = new LocalLLMService() as any;
    mockRAP = new RAPSystem({} as any) as any;
    mockCache = new RedisCacheManager() as any;
    mockMetrics = new RoutingMetricsTracker(mockPrisma) as any;
    mockCostOptimizer = new CostOptimizer(mockPrisma) as any;
    mockResponseCache = new ResponseCache() as any;

    router = new HierarchicalRouter(
      defaultConfig,
      mockPrisma,
      mockClassifier,
      mockLocalLLM,
      mockRAP,
      undefined,
      mockCache,
      mockMetrics,
      mockCostOptimizer,
      mockResponseCache
    );
  });

  describe('Cost Optimizer Integration', () => {
    it('should calculate cost for routing decision', async () => {
      const query: AIQuery = { query: 'What is AI?', userId: 'user-1' };

      vi.mocked(mockClassifier.classify).mockResolvedValue({
        id: 'class-1',
        query: query.query,
        classifiedAs: QueryComplexity.SIMPLE,
        confidence: 0.9,
        routedTo: RoutingTier.LOCAL_LLM
      });

      vi.mocked(mockCostOptimizer.calculateCost).mockResolvedValue(0);
      vi.mocked(mockCostOptimizer.shouldRejectQuery).mockResolvedValue(false);
      vi.mocked(mockCostOptimizer.getCheapestTier).mockResolvedValue(RoutingTier.LOCAL_LLM);

      const mockResponse: AIResponse = {
        id: 'resp-1',
        content: 'AI is artificial intelligence',
        routingTier: RoutingTier.LOCAL_LLM,
        responseTime: 150,
        cost: 0,
        cached: false
      };
      vi.mocked(mockLocalLLM.processQuery).mockResolvedValue(mockResponse);
      vi.mocked(mockCache.get).mockResolvedValue(null);
      vi.mocked(mockMetrics.recordRouting).mockResolvedValue(undefined);
      vi.mocked(mockResponseCache.set).mockResolvedValue(undefined);

      await router.route(query);

      expect(vi.mocked(mockCostOptimizer.calculateCost)).toHaveBeenCalled();
    });

    it('should track spending for user', async () => {
      const query: AIQuery = { query: 'What is AI?', userId: 'user-1' };

      vi.mocked(mockClassifier.classify).mockResolvedValue({
        id: 'class-1',
        query: query.query,
        classifiedAs: QueryComplexity.SIMPLE,
        confidence: 0.9,
        routedTo: RoutingTier.LOCAL_LLM
      });

      vi.mocked(mockCostOptimizer.calculateCost).mockResolvedValue(0);
      vi.mocked(mockCostOptimizer.shouldRejectQuery).mockResolvedValue(false);
      vi.mocked(mockCostOptimizer.getCheapestTier).mockResolvedValue(RoutingTier.LOCAL_LLM);
      vi.mocked(mockCostOptimizer.trackSpending).mockResolvedValue(undefined);

      const mockResponse: AIResponse = {
        id: 'resp-1',
        content: 'AI is artificial intelligence',
        routingTier: RoutingTier.LOCAL_LLM,
        responseTime: 150,
        cost: 0,
        cached: false
      };
      vi.mocked(mockLocalLLM.processQuery).mockResolvedValue(mockResponse);
      vi.mocked(mockCache.get).mockResolvedValue(null);
      vi.mocked(mockMetrics.recordRouting).mockResolvedValue(undefined);
      vi.mocked(mockResponseCache.set).mockResolvedValue(undefined);

      await router.route(query);

      expect(vi.mocked(mockCostOptimizer.trackSpending)).toHaveBeenCalledWith(
        'user-1',
        RoutingTier.LOCAL_LLM,
        0
      );
    });

    it('should downgrade tier when cost exceeds budget', async () => {
      const query: AIQuery = {
        query: 'Complex query',
        userId: 'user-1',
        context: { budget: 0.02 }
      };

      vi.mocked(mockClassifier.classify).mockResolvedValue({
        id: 'class-1',
        query: query.query,
        classifiedAs: QueryComplexity.COMPLEX,
        confidence: 0.9,
        routedTo: RoutingTier.EXTERNAL_LLM
      });

      // External LLM cost exceeds budget
      vi.mocked(mockCostOptimizer.calculateCost)
        .mockResolvedValueOnce(0.08) // External LLM cost
        .mockResolvedValueOnce(0.01); // RAP cost

      vi.mocked(mockCostOptimizer.shouldRejectQuery)
        .mockResolvedValueOnce(true) // Reject External LLM
        .mockResolvedValueOnce(false); // Accept RAP

      vi.mocked(mockCostOptimizer.getCheapestTier).mockResolvedValue(RoutingTier.RAP_SYSTEM);

      const mockResponse: AIResponse = {
        id: 'resp-1',
        content: 'Response',
        routingTier: RoutingTier.RAP_SYSTEM,
        responseTime: 800,
        cost: 0.01,
        cached: false
      };
      vi.mocked(mockRAP.processQuery).mockResolvedValue(mockResponse);
      vi.mocked(mockCache.get).mockResolvedValue(null);
      vi.mocked(mockMetrics.recordRouting).mockResolvedValue(undefined);
      vi.mocked(mockResponseCache.set).mockResolvedValue(undefined);

      const result = await router.route(query);

      expect(result.routingTier).toBe(RoutingTier.RAP_SYSTEM);
      expect(result.cost).toBe(0.01);
    });

    it('should get cost metrics', async () => {
      const mockCostMetrics = {
        [RoutingTier.LOCAL_LLM]: 0,
        [RoutingTier.RAP_SYSTEM]: 5.5,
        [RoutingTier.EXTERNAL_LLM]: 12.3
      };

      vi.mocked(mockCostOptimizer.getSpendingMetrics).mockResolvedValue(mockCostMetrics);

      const result = await router.getCostMetrics();

      expect(result[RoutingTier.LOCAL_LLM]).toBe(0);
      expect(result[RoutingTier.RAP_SYSTEM]).toBe(5.5);
      expect(result[RoutingTier.EXTERNAL_LLM]).toBe(12.3);
    });

    it('should get user spending', async () => {
      const mockUserSpending = {
        userId: 'user-1',
        totalSpent: 10.5,
        spentByTier: {
          [RoutingTier.LOCAL_LLM]: 0,
          [RoutingTier.RAP_SYSTEM]: 5.5,
          [RoutingTier.EXTERNAL_LLM]: 5.0
        },
        queriesByTier: {
          [RoutingTier.LOCAL_LLM]: 50,
          [RoutingTier.RAP_SYSTEM]: 100,
          [RoutingTier.EXTERNAL_LLM]: 20
        },
        lastUpdated: new Date()
      };

      vi.mocked(mockCostOptimizer.getUserSpending).mockResolvedValue(mockUserSpending);

      const result = await router.getUserSpending('user-1');

      expect(result?.totalSpent).toBe(10.5);
      expect(result?.spentByTier[RoutingTier.RAP_SYSTEM]).toBe(5.5);
    });

    it('should compare costs across tiers', async () => {
      const mockCostComparison = {
        [RoutingTier.LOCAL_LLM]: 0,
        [RoutingTier.RAP_SYSTEM]: 0.03,
        [RoutingTier.EXTERNAL_LLM]: 0.08
      };

      vi.mocked(mockCostOptimizer.compareCosts).mockResolvedValue(mockCostComparison);

      const result = await router.compareCosts(100, 200);

      expect(result[RoutingTier.LOCAL_LLM]).toBe(0);
      expect(result[RoutingTier.RAP_SYSTEM]).toBe(0.03);
      expect(result[RoutingTier.EXTERNAL_LLM]).toBe(0.08);
    });

    it('should get cheapest tier', async () => {
      vi.mocked(mockCostOptimizer.getCheapestTier).mockResolvedValue(RoutingTier.LOCAL_LLM);

      const result = await router.getCheapestTier();

      expect(result).toBe(RoutingTier.LOCAL_LLM);
    });
  });

  describe('Response Cache Integration', () => {
    it('should return cached response on cache hit', async () => {
      const query: AIQuery = { query: 'What is AI?' };
      const queryHash = 'hash-123';

      const cachedEntry: CacheEntry = {
        id: 'cache-1',
        queryHash,
        query: query.query,
        response: 'AI is artificial intelligence',
        routingTier: RoutingTier.LOCAL_LLM,
        cost: 0,
        ttl: 3600,
        expiresAt: new Date(Date.now() + 3600000),
        hitCount: 5
      };

      vi.mocked(mockResponseCache.get).mockResolvedValue(cachedEntry);

      const result = await router.route(query);

      expect(result.cached).toBe(true);
      expect(result.content).toBe('AI is artificial intelligence');
      expect(result.cost).toBe(0);
    });

    it('should cache response after successful routing', async () => {
      const query: AIQuery = { query: 'What is AI?' };

      vi.mocked(mockClassifier.classify).mockResolvedValue({
        id: 'class-1',
        query: query.query,
        classifiedAs: QueryComplexity.SIMPLE,
        confidence: 0.9,
        routedTo: RoutingTier.LOCAL_LLM
      });

      vi.mocked(mockCostOptimizer.calculateCost).mockResolvedValue(0);
      vi.mocked(mockCostOptimizer.shouldRejectQuery).mockResolvedValue(false);
      vi.mocked(mockCostOptimizer.getCheapestTier).mockResolvedValue(RoutingTier.LOCAL_LLM);

      const mockResponse: AIResponse = {
        id: 'resp-1',
        content: 'AI is artificial intelligence',
        routingTier: RoutingTier.LOCAL_LLM,
        responseTime: 150,
        cost: 0,
        cached: false
      };
      vi.mocked(mockLocalLLM.processQuery).mockResolvedValue(mockResponse);
      vi.mocked(mockResponseCache.get).mockResolvedValue(null);
      vi.mocked(mockMetrics.recordRouting).mockResolvedValue(undefined);
      vi.mocked(mockResponseCache.set).mockResolvedValue(undefined);

      await router.route(query);

      expect(vi.mocked(mockResponseCache.set)).toHaveBeenCalled();
      const callArgs = vi.mocked(mockResponseCache.set).mock.calls[0][0];
      expect(callArgs.response).toBe('AI is artificial intelligence');
      expect(callArgs.routingTier).toBe(RoutingTier.LOCAL_LLM);
    });

    it('should get response cache statistics', async () => {
      const mockStats = {
        hits: 100,
        misses: 50,
        size: 150,
        hitRate: 66.67,
        averageResponseTime: 250
      };

      vi.mocked(mockResponseCache.getStats).mockResolvedValue(mockStats);

      const result = await router.getResponseCacheStats();

      expect(result.hits).toBe(100);
      expect(result.misses).toBe(50);
      expect(result.hitRate).toBe(66.67);
    });

    it('should get response cache hit rate', async () => {
      vi.mocked(mockResponseCache.getCacheHitRate).mockResolvedValue(66.67);

      const result = await router.getResponseCacheHitRate();

      expect(result).toBe(66.67);
    });

    it('should clear response cache', async () => {
      vi.mocked(mockResponseCache.clear).mockResolvedValue(150);

      const result = await router.clearResponseCache();

      expect(result).toBe(150);
    });
  });

  describe('Fallback Logic', () => {
    it('should record fallback event when tier fails', async () => {
      const query: AIQuery = { query: 'What is Python?' };

      vi.mocked(mockClassifier.classify).mockResolvedValue({
        id: 'class-1',
        query: query.query,
        classifiedAs: QueryComplexity.SIMPLE,
        confidence: 0.9,
        routedTo: RoutingTier.LOCAL_LLM
      });

      vi.mocked(mockCostOptimizer.calculateCost).mockResolvedValue(0);
      vi.mocked(mockCostOptimizer.shouldRejectQuery).mockResolvedValue(false);
      vi.mocked(mockCostOptimizer.getCheapestTier).mockResolvedValue(RoutingTier.LOCAL_LLM);

      // Local LLM fails
      vi.mocked(mockLocalLLM.processQuery).mockRejectedValueOnce(
        new Error('Local LLM unavailable')
      );

      // RAP succeeds
      const mockResponse: AIResponse = {
        id: 'resp-2',
        content: 'Python is a programming language',
        routingTier: RoutingTier.RAP_SYSTEM,
        responseTime: 800,
        cost: 0.03,
        cached: false
      };
      vi.mocked(mockRAP.processQuery).mockResolvedValue(mockResponse);
      vi.mocked(mockResponseCache.get).mockResolvedValue(null);
      vi.mocked(mockMetrics.recordRouting).mockResolvedValue(undefined);
      vi.mocked(mockMetrics.recordFallback).mockReturnValue(undefined);
      vi.mocked(mockResponseCache.set).mockResolvedValue(undefined);

      const result = await router.route(query);

      expect(result.routingTier).toBe(RoutingTier.RAP_SYSTEM);
      expect(vi.mocked(mockMetrics.recordFallback)).toHaveBeenCalledWith(
        RoutingTier.LOCAL_LLM,
        RoutingTier.RAP_SYSTEM
      );
    });

    it('should get fallback chain for tier', () => {
      const chain = router.getFallbackChainForTier(RoutingTier.LOCAL_LLM);

      expect(chain).toContain(RoutingTier.LOCAL_LLM);
      expect(chain).toContain(RoutingTier.RAP_SYSTEM);
      expect(chain).toContain(RoutingTier.EXTERNAL_LLM);
    });

    it('should get tier usage metrics', () => {
      const mockUsageMetrics = {
        [RoutingTier.LOCAL_LLM]: {
          tier: RoutingTier.LOCAL_LLM,
          usageCount: 100,
          usagePercentage: 50,
          fallbackCount: 5,
          fallbackRate: 5
        },
        [RoutingTier.RAP_SYSTEM]: {
          tier: RoutingTier.RAP_SYSTEM,
          usageCount: 80,
          usagePercentage: 40,
          fallbackCount: 2,
          fallbackRate: 2.5
        },
        [RoutingTier.EXTERNAL_LLM]: {
          tier: RoutingTier.EXTERNAL_LLM,
          usageCount: 20,
          usagePercentage: 10,
          fallbackCount: 0,
          fallbackRate: 0
        }
      };

      vi.mocked(mockMetrics.getTierUsageMetrics).mockReturnValue(mockUsageMetrics);

      const result = router.getTierUsageMetrics();

      expect(result[RoutingTier.LOCAL_LLM].usagePercentage).toBe(50);
      expect(result[RoutingTier.RAP_SYSTEM].fallbackRate).toBe(2.5);
    });

    it('should get fallback rate for tier', () => {
      vi.mocked(mockMetrics.getFallbackRate).mockReturnValue(5);

      const result = router.getFallbackRate(RoutingTier.LOCAL_LLM);

      expect(result).toBe(5);
    });

    it('should get overall fallback rate', () => {
      vi.mocked(mockMetrics.getOverallFallbackRate).mockReturnValue(3.2);

      const result = router.getOverallFallbackRate();

      expect(result).toBe(3.2);
    });

    it('should get tier usage distribution', () => {
      const mockDistribution = {
        [RoutingTier.LOCAL_LLM]: 50,
        [RoutingTier.RAP_SYSTEM]: 40,
        [RoutingTier.EXTERNAL_LLM]: 10
      };

      vi.mocked(mockMetrics.getTierUsageDistribution).mockReturnValue(mockDistribution);

      const result = router.getTierUsageDistribution();

      expect(result[RoutingTier.LOCAL_LLM]).toBe(50);
      expect(result[RoutingTier.RAP_SYSTEM]).toBe(40);
      expect(result[RoutingTier.EXTERNAL_LLM]).toBe(10);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete routing flow with cost optimization and caching', async () => {
      const query: AIQuery = { query: 'What is AI?', userId: 'user-1' };

      // Step 1: Cache miss
      vi.mocked(mockResponseCache.get).mockResolvedValue(null);

      // Step 2: Classify query
      vi.mocked(mockClassifier.classify).mockResolvedValue({
        id: 'class-1',
        query: query.query,
        classifiedAs: QueryComplexity.SIMPLE,
        confidence: 0.9,
        routedTo: RoutingTier.LOCAL_LLM
      });

      // Step 3: Cost optimization
      vi.mocked(mockCostOptimizer.calculateCost).mockResolvedValue(0);
      vi.mocked(mockCostOptimizer.shouldRejectQuery).mockResolvedValue(false);
      vi.mocked(mockCostOptimizer.getCheapestTier).mockResolvedValue(RoutingTier.LOCAL_LLM);

      // Step 4: Route to Local LLM
      const mockResponse: AIResponse = {
        id: 'resp-1',
        content: 'AI is artificial intelligence',
        routingTier: RoutingTier.LOCAL_LLM,
        responseTime: 150,
        cost: 0,
        cached: false
      };
      vi.mocked(mockLocalLLM.processQuery).mockResolvedValue(mockResponse);

      // Step 5: Track spending
      vi.mocked(mockCostOptimizer.trackSpending).mockResolvedValue(undefined);

      // Step 6: Cache response
      vi.mocked(mockResponseCache.set).mockResolvedValue(undefined);

      // Step 7: Record metrics
      vi.mocked(mockMetrics.recordRouting).mockResolvedValue(undefined);

      const result = await router.route(query);

      expect(result.content).toBe('AI is artificial intelligence');
      expect(result.routingTier).toBe(RoutingTier.LOCAL_LLM);
      expect(result.cost).toBe(0);
      expect(vi.mocked(mockCostOptimizer.trackSpending)).toHaveBeenCalled();
      expect(vi.mocked(mockResponseCache.set)).toHaveBeenCalled();
    });

    it('should handle fallback with cost optimization', async () => {
      const query: AIQuery = { query: 'Complex query', userId: 'user-1' };

      vi.mocked(mockResponseCache.get).mockResolvedValue(null);

      vi.mocked(mockClassifier.classify).mockResolvedValue({
        id: 'class-1',
        query: query.query,
        classifiedAs: QueryComplexity.COMPLEX,
        confidence: 0.9,
        routedTo: RoutingTier.EXTERNAL_LLM
      });

      // External LLM fails
      vi.mocked(mockCostOptimizer.calculateCost).mockResolvedValue(0.08);
      vi.mocked(mockCostOptimizer.shouldRejectQuery).mockResolvedValue(false);
      vi.mocked(mockCostOptimizer.getCheapestTier).mockResolvedValue(RoutingTier.EXTERNAL_LLM);

      // Simulate failure and fallback
      vi.mocked(mockLocalLLM.processQuery).mockRejectedValueOnce(new Error('Failed'));

      // RAP succeeds
      const mockResponse: AIResponse = {
        id: 'resp-2',
        content: 'Response from RAP',
        routingTier: RoutingTier.RAP_SYSTEM,
        responseTime: 800,
        cost: 0.03,
        cached: false
      };
      vi.mocked(mockRAP.processQuery).mockResolvedValue(mockResponse);
      vi.mocked(mockMetrics.recordRouting).mockResolvedValue(undefined);
      vi.mocked(mockMetrics.recordFallback).mockReturnValue(undefined);
      vi.mocked(mockCostOptimizer.trackSpending).mockResolvedValue(undefined);
      vi.mocked(mockResponseCache.set).mockResolvedValue(undefined);

      const result = await router.route(query);

      expect(result.routingTier).toBe(RoutingTier.RAP_SYSTEM);
      expect(result.cost).toBe(0.03);
    });
  });
});
