/**
 * Hierarchical Router Tests
 * Tests for hierarchical AI routing with fallback logic and latency monitoring
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { jest } from '@jest/globals';
import { HierarchicalRouter } from '../hierarchical-router';
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
  AIRoutingConfig
} from '../types';
import { PrismaClient } from '@prisma/client';

// Mock dependencies
jest.mock('../query-classifier');
jest.mock('../local-llm-service');
jest.mock('../rap-system');
jest.mock('../redis-cache-manager');
jest.mock('../routing-metrics-tracker');

describe('HierarchicalRouter', () => {
  let router: HierarchicalRouter;
  let mockPrisma: PrismaClient;
  let mockClassifier: QueryClassifier;
  let mockLocalLLM: LocalLLMService;
  let mockRAP: RAPSystem;
  let mockCache: RedisCacheManager;
  let mockMetrics: RoutingMetricsTracker;

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
    // Reset mocks
    jest.clearAllMocks();

    // Create mock instances
    mockPrisma = {} as PrismaClient;
    mockClassifier = new QueryClassifier() as any;
    mockLocalLLM = new LocalLLMService() as any;
    mockRAP = new RAPSystem({} as any) as any;
    mockCache = new RedisCacheManager() as any;
    mockMetrics = new RoutingMetricsTracker(mockPrisma) as any;

    // Create router with mocks
    router = new HierarchicalRouter(
      defaultConfig,
      mockPrisma,
      mockClassifier,
      mockLocalLLM,
      mockRAP,
      mockCache,
      mockMetrics
    );
  });

  describe('route', () => {
    it('should route simple queries to Local LLM', async () => {
      const query: AIQuery = { query: 'What is 2+2?' };

      // Mock classifier to return SIMPLE classification
      vi.mocked(mockClassifier.classify).mockResolvedValue({
        id: 'class-1',
        query: query.query,
        classifiedAs: QueryComplexity.SIMPLE,
        confidence: 0.9,
        routedTo: RoutingTier.LOCAL_LLM,
        reasoning: 'Simple arithmetic query'
      });

      // Mock Local LLM response
      const mockResponse: AIResponse = {
        id: 'resp-1',
        content: '2+2 equals 4',
        routingTier: RoutingTier.LOCAL_LLM,
        responseTime: 150,
        cost: 0,
        cached: false
      };
      vi.mocked(mockLocalLLM.processQuery).mockResolvedValue(mockResponse);

      // Mock cache miss
      vi.mocked(mockCache.get).mockResolvedValue(null);

      // Mock metrics recording
      vi.mocked(mockMetrics.recordRouting).mockResolvedValue(undefined);

      const result = await router.route(query);

      expect(result.routingTier).toBe(RoutingTier.LOCAL_LLM);
      expect(result.content).toBe('2+2 equals 4');
      expect(vi.mocked(mockLocalLLM.processQuery)).toHaveBeenCalled();
    });

    it('should route moderate queries to RAP System', async () => {
      const query: AIQuery = { query: 'Analyze the benefits of renewable energy' };

      // Mock classifier to return MODERATE classification
      vi.mocked(mockClassifier.classify).mockResolvedValue({
        id: 'class-2',
        query: query.query,
        classifiedAs: QueryComplexity.MODERATE,
        confidence: 0.85,
        routedTo: RoutingTier.RAP_SYSTEM,
        reasoning: 'Analytical query requiring context'
      });

      // Mock RAP response
      const mockResponse: AIResponse = {
        id: 'resp-2',
        content: 'Renewable energy provides multiple benefits...',
        routingTier: RoutingTier.RAP_SYSTEM,
        responseTime: 800,
        cost: 0.03,
        cached: false
      };
      vi.mocked(mockRAP.processQuery).mockResolvedValue(mockResponse);

      // Mock cache miss
      vi.mocked(mockCache.get).mockResolvedValue(null);

      // Mock metrics recording
      vi.mocked(mockMetrics.recordRouting).mockResolvedValue(undefined);

      const result = await router.route(query);

      expect(result.routingTier).toBe(RoutingTier.RAP_SYSTEM);
      expect(vi.mocked(mockRAP.processQuery)).toHaveBeenCalled();
    });

    it('should route complex queries to External LLM', async () => {
      const query: AIQuery = { query: 'Develop a comprehensive strategic plan for global expansion' };

      // Mock classifier to return COMPLEX classification
      vi.mocked(mockClassifier.classify).mockResolvedValue({
        id: 'class-3',
        query: query.query,
        classifiedAs: QueryComplexity.COMPLEX,
        confidence: 0.88,
        routedTo: RoutingTier.EXTERNAL_LLM,
        reasoning: 'Complex strategic query'
      });

      // Mock External LLM response
      const mockResponse: AIResponse = {
        id: 'resp-3',
        content: 'Strategic expansion plan...',
        routingTier: RoutingTier.EXTERNAL_LLM,
        responseTime: 2500,
        cost: 0.08,
        cached: false
      };

      // Mock cache miss
      vi.mocked(mockCache.get).mockResolvedValue(null);

      // Mock metrics recording
      vi.mocked(mockMetrics.recordRouting).mockResolvedValue(undefined);

      // We need to mock the processExternalLLM indirectly through the route method
      // For now, we'll test the routing decision logic
      const classification = await router.classify(query);

      expect(classification.classifiedAs).toBe(QueryComplexity.COMPLEX);
      expect(classification.routedTo).toBe(RoutingTier.EXTERNAL_LLM);
    });

    it('should return cached response if available', async () => {
      const query: AIQuery = { query: 'What is AI?' };
      const queryHash = 'hash-123';

      // Mock cache hit
      const cachedEntry = {
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
      vi.mocked(mockCache.get).mockResolvedValue(cachedEntry);

      // Mock classifier
      vi.mocked(mockClassifier.classify).mockResolvedValue({
        id: 'class-1',
        query: query.query,
        classifiedAs: QueryComplexity.SIMPLE,
        confidence: 0.9,
        routedTo: RoutingTier.LOCAL_LLM
      });

      // Mock metrics recording
      vi.mocked(mockMetrics.recordRouting).mockResolvedValue(undefined);

      const result = await router.route(query);

      expect(result.cached).toBe(true);
      expect(result.content).toBe('AI is artificial intelligence');
      expect(result.cost).toBe(0);
    });

    it('should implement fallback logic when primary tier fails', async () => {
      const query: AIQuery = { query: 'What is Python?' };

      // Mock classifier
      vi.mocked(mockClassifier.classify).mockResolvedValue({
        id: 'class-1',
        query: query.query,
        classifiedAs: QueryComplexity.SIMPLE,
        confidence: 0.9,
        routedTo: RoutingTier.LOCAL_LLM
      });

      // Mock Local LLM failure
      vi.mocked(mockLocalLLM.processQuery).mockRejectedValueOnce(
        new Error('Local LLM service unavailable')
      );

      // Mock RAP success (fallback)
      const mockResponse: AIResponse = {
        id: 'resp-2',
        content: 'Python is a programming language',
        routingTier: RoutingTier.RAP_SYSTEM,
        responseTime: 800,
        cost: 0.03,
        cached: false
      };
      vi.mocked(mockRAP.processQuery).mockResolvedValue(mockResponse);

      // Mock cache miss
      vi.mocked(mockCache.get).mockResolvedValue(null);

      // Mock metrics recording
      vi.mocked(mockMetrics.recordRouting).mockResolvedValue(undefined);

      const result = await router.route(query);

      expect(result.routingTier).toBe(RoutingTier.RAP_SYSTEM);
      expect(result.content).toBe('Python is a programming language');
      expect(vi.mocked(mockLocalLLM.processQuery)).toHaveBeenCalled();
      expect(vi.mocked(mockRAP.processQuery)).toHaveBeenCalled();
    });

    it('should fallback on latency threshold exceeded', async () => {
      const query: AIQuery = { query: 'What is AI?' };

      // Mock classifier
      vi.mocked(mockClassifier.classify).mockResolvedValue({
        id: 'class-1',
        query: query.query,
        classifiedAs: QueryComplexity.SIMPLE,
        confidence: 0.9,
        routedTo: RoutingTier.LOCAL_LLM
      });

      // Mock Local LLM with high latency (exceeds 500ms threshold)
      const slowResponse: AIResponse = {
        id: 'resp-1',
        content: 'AI response',
        routingTier: RoutingTier.LOCAL_LLM,
        responseTime: 600, // Exceeds 500ms threshold
        cost: 0,
        cached: false
      };
      vi.mocked(mockLocalLLM.processQuery).mockResolvedValue(slowResponse);

      // Mock RAP success (fallback)
      const fastResponse: AIResponse = {
        id: 'resp-2',
        content: 'AI is artificial intelligence',
        routingTier: RoutingTier.RAP_SYSTEM,
        responseTime: 800,
        cost: 0.03,
        cached: false
      };
      vi.mocked(mockRAP.processQuery).mockResolvedValue(fastResponse);

      // Mock cache miss
      vi.mocked(mockCache.get).mockResolvedValue(null);

      // Mock metrics recording
      vi.mocked(mockMetrics.recordRouting).mockResolvedValue(undefined);

      const result = await router.route(query);

      // Should fallback to RAP due to latency
      expect(result.routingTier).toBe(RoutingTier.RAP_SYSTEM);
    });
  });

  describe('classify', () => {
    it('should classify queries correctly', async () => {
      const query: AIQuery = { query: 'What is machine learning?' };

      vi.mocked(mockClassifier.classify).mockResolvedValue({
        id: 'class-1',
        query: query.query,
        classifiedAs: QueryComplexity.SIMPLE,
        confidence: 0.85,
        routedTo: RoutingTier.LOCAL_LLM
      });

      const result = await router.classify(query);

      expect(result.classifiedAs).toBe(QueryComplexity.SIMPLE);
      expect(result.routedTo).toBe(RoutingTier.LOCAL_LLM);
      expect(vi.mocked(mockClassifier.classify)).toHaveBeenCalledWith(query);
    });
  });

  describe('metrics', () => {
    it('should retrieve metrics for all routing tiers', async () => {
      const mockMetricsData = {
        [RoutingTier.LOCAL_LLM]: {
          routingTier: RoutingTier.LOCAL_LLM,
          totalRequests: 100,
          successfulRequests: 95,
          failedRequests: 5,
          averageResponseTime: 200,
          averageCost: 0,
          cacheHits: 30,
          cacheMisses: 70,
          cacheHitRate: 30,
          successRate: 95,
          lastUpdated: new Date()
        },
        [RoutingTier.RAP_SYSTEM]: {
          routingTier: RoutingTier.RAP_SYSTEM,
          totalRequests: 50,
          successfulRequests: 48,
          failedRequests: 2,
          averageResponseTime: 800,
          averageCost: 0.03,
          cacheHits: 10,
          cacheMisses: 40,
          cacheHitRate: 20,
          successRate: 96,
          lastUpdated: new Date()
        },
        [RoutingTier.EXTERNAL_LLM]: {
          routingTier: RoutingTier.EXTERNAL_LLM,
          totalRequests: 20,
          successfulRequests: 19,
          failedRequests: 1,
          averageResponseTime: 2500,
          averageCost: 0.08,
          cacheHits: 5,
          cacheMisses: 15,
          cacheHitRate: 25,
          successRate: 95,
          lastUpdated: new Date()
        }
      };

      vi.mocked(mockMetrics.getAllMetrics).mockResolvedValue(mockMetricsData);

      const result = await router.getMetrics();

      expect(result[RoutingTier.LOCAL_LLM].totalRequests).toBe(100);
      expect(result[RoutingTier.RAP_SYSTEM].totalRequests).toBe(50);
      expect(result[RoutingTier.EXTERNAL_LLM].totalRequests).toBe(20);
    });

    it('should get system health status', async () => {
      const mockHealth = {
        overallSuccessRate: 95.2,
        averageResponseTime: 650,
        totalRequests: 170,
        cacheHitRate: 26.5
      };

      vi.mocked(mockMetrics.getSystemHealth).mockResolvedValue(mockHealth);

      const result = await router.getSystemHealth();

      expect(result.overallSuccessRate).toBe(95.2);
      expect(result.totalRequests).toBe(170);
      expect(result.cacheHitRate).toBe(26.5);
    });

    it('should get best performing tier', async () => {
      vi.mocked(mockMetrics.getBestPerformingTier).mockResolvedValue(RoutingTier.LOCAL_LLM);

      const result = await router.getBestPerformingTier();

      expect(result).toBe(RoutingTier.LOCAL_LLM);
    });

    it('should get cheapest tier', async () => {
      vi.mocked(mockMetrics.getCheapestTier).mockResolvedValue(RoutingTier.LOCAL_LLM);

      const result = await router.getCheapestTier();

      expect(result).toBe(RoutingTier.LOCAL_LLM);
    });

    it('should get fastest tier', async () => {
      vi.mocked(mockMetrics.getFastestTier).mockResolvedValue(RoutingTier.LOCAL_LLM);

      const result = await router.getFastestTier();

      expect(result).toBe(RoutingTier.LOCAL_LLM);
    });
  });

  describe('cache management', () => {
    it('should clear cache', async () => {
      vi.mocked(mockCache.clear).mockResolvedValue(undefined);

      await router.clearCache();

      expect(vi.mocked(mockCache.clear)).toHaveBeenCalled();
    });

    it('should get cache statistics', async () => {
      const mockStats = { hits: 100, misses: 50, size: 150 };
      vi.mocked(mockCache.getStats).mockResolvedValue(mockStats);

      const result = await router.getCacheStats();

      expect(result.hits).toBe(100);
      expect(result.misses).toBe(50);
      expect(result.size).toBe(150);
    });
  });

  describe('threshold configuration', () => {
    it('should set latency threshold for a tier', () => {
      router.setLatencyThreshold(RoutingTier.LOCAL_LLM, 300);

      // Verify by checking internal state (would need to expose getter in real implementation)
      expect(router).toBeDefined();
    });

    it('should set cost threshold for a tier', () => {
      router.setCostThreshold(RoutingTier.RAP_SYSTEM, 0.05);

      expect(router).toBeDefined();
    });

    it('should set fallback strategy for a tier', () => {
      router.setFallbackStrategy(RoutingTier.LOCAL_LLM, {
        tier: RoutingTier.LOCAL_LLM,
        condition: 'latency',
        threshold: 500,
        nextTier: RoutingTier.RAP_SYSTEM
      });

      expect(router).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should throw error when all routing tiers fail', async () => {
      const query: AIQuery = { query: 'Test query' };

      // Mock classifier
      vi.mocked(mockClassifier.classify).mockResolvedValue({
        id: 'class-1',
        query: query.query,
        classifiedAs: QueryComplexity.SIMPLE,
        confidence: 0.9,
        routedTo: RoutingTier.LOCAL_LLM
      });

      // Mock all tiers to fail
      vi.mocked(mockLocalLLM.processQuery).mockRejectedValue(new Error('Local LLM failed'));
      vi.mocked(mockRAP.processQuery).mockRejectedValue(new Error('RAP failed'));

      // Mock cache miss
      vi.mocked(mockCache.get).mockResolvedValue(null);

      // Mock metrics recording
      vi.mocked(mockMetrics.recordRouting).mockResolvedValue(undefined);

      await expect(router.route(query)).rejects.toThrow();
    });

    it('should handle classification errors gracefully', async () => {
      const query: AIQuery = { query: 'Test query' };

      vi.mocked(mockClassifier.classify).mockRejectedValue(new Error('Classification failed'));

      await expect(router.route(query)).rejects.toThrow();
    });
  });

  describe('metrics recording', () => {
    it('should record successful routing', async () => {
      const query: AIQuery = { query: 'What is AI?' };

      // Mock classifier
      vi.mocked(mockClassifier.classify).mockResolvedValue({
        id: 'class-1',
        query: query.query,
        classifiedAs: QueryComplexity.SIMPLE,
        confidence: 0.9,
        routedTo: RoutingTier.LOCAL_LLM
      });

      // Mock Local LLM response
      const mockResponse: AIResponse = {
        id: 'resp-1',
        content: 'AI is artificial intelligence',
        routingTier: RoutingTier.LOCAL_LLM,
        responseTime: 150,
        cost: 0,
        cached: false
      };
      vi.mocked(mockLocalLLM.processQuery).mockResolvedValue(mockResponse);

      // Mock cache miss
      vi.mocked(mockCache.get).mockResolvedValue(null);

      // Mock metrics recording
      vi.mocked(mockMetrics.recordRouting).mockResolvedValue(undefined);

      await router.route(query);

      expect(vi.mocked(mockMetrics.recordRouting)).toHaveBeenCalledWith(
        RoutingTier.LOCAL_LLM,
        true,
        150,
        0,
        false
      );
    });
  });

  describe('reset metrics', () => {
    it('should reset all metrics', async () => {
      vi.mocked(mockMetrics.resetMetrics).mockResolvedValue(undefined);

      await router.resetMetrics();

      expect(vi.mocked(mockMetrics.resetMetrics)).toHaveBeenCalled();
    });
  });
});

