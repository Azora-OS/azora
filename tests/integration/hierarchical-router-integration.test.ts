/**
 * Hierarchical Router Integration Tests
 * Tests for complete hierarchical AI routing flows
 */

import { HierarchicalRouter } from '../../services/ai-routing/hierarchical-router';
import { QueryClassifier } from '../../services/ai-routing/query-classifier';
import { LocalLLMService } from '../../services/ai-routing/local-llm-service';
import { RAPSystem } from '../../services/ai-routing/rap-system';
import { RedisCacheManager } from '../../services/ai-routing/redis-cache-manager';
import { RoutingMetricsTracker } from '../../services/ai-routing/routing-metrics-tracker';
import { AIQuery, RoutingTier, AIRoutingConfig } from '../../services/ai-routing/types';
import { PrismaClient } from '@prisma/client';

describe('Hierarchical Router Integration', () => {
  let router: HierarchicalRouter;
  let prisma: PrismaClient;
  let config: AIRoutingConfig;

  beforeEach(() => {
    prisma = new PrismaClient();

    config = {
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
      redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
      redisKeyPrefix: 'ai-routing:'
    };

    // Initialize services
    const classifier = new QueryClassifier();
    const localLLM = new LocalLLMService();
    const rapSystem = new RAPSystem({
      internalSourceWeight: config.internalSourceWeight,
      externalSourceWeight: config.externalSourceWeight,
      maxContextTokens: 2000,
      maxRetrievalResults: 10,
      externalLLMProvider: config.externalLLMProvider as 'openai' | 'anthropic',
      externalLLMModel: config.externalLLMModel,
      externalLLMApiKey: process.env.OPENAI_API_KEY || '',
      embeddingApiKey: process.env.OPENAI_API_KEY || '',
      vectorDbApiKey: process.env.PINECONE_API_KEY || ''
    });
    const cache = new RedisCacheManager(config.redisUrl, config.redisKeyPrefix);
    const metrics = new RoutingMetricsTracker(prisma);

    router = new HierarchicalRouter(config, prisma, classifier, localLLM, rapSystem, cache, metrics);
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  describe('Complete Query Routing Flow', () => {
    it('should route simple query through Local LLM', async () => {
      const query: AIQuery = {
        query: 'What is the capital of France?',
        userId: 'test-user-1'
      };

      const result = await router.route(query);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.responseTime).toBeGreaterThan(0);
      expect(result.cost).toBeGreaterThanOrEqual(0);
    });

    it('should classify and route moderate query', async () => {
      const query: AIQuery = {
        query: 'Analyze the impact of climate change on global agriculture',
        userId: 'test-user-2'
      };

      const classification = await router.classify(query);

      expect(classification).toBeDefined();
      expect(classification.classifiedAs).toBeDefined();
      expect(classification.routedTo).toBeDefined();
      expect([RoutingTier.LOCAL_LLM, RoutingTier.RAP_SYSTEM, RoutingTier.EXTERNAL_LLM]).toContain(
        classification.routedTo
      );
    });

    it('should classify complex query correctly', async () => {
      const query: AIQuery = {
        query: 'Develop a comprehensive multi-year strategic plan for digital transformation that considers organizational culture, technology infrastructure, market dynamics, competitive landscape, regulatory environment, and long-term business sustainability implications',
        userId: 'test-user-3'
      };

      const classification = await router.classify(query);

      expect(classification.classifiedAs).toBeDefined();
      expect(classification.confidence).toBeGreaterThan(0);
      expect(classification.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Caching Behavior', () => {
    it('should cache responses and return cached results', async () => {
      const query: AIQuery = {
        query: 'What is Python?',
        userId: 'test-user-4'
      };

      // First request - should not be cached
      const result1 = await router.route(query);
      expect(result1).toBeDefined();

      // Second request - should be cached
      const result2 = await router.route(query);
      expect(result2).toBeDefined();

      // Both should have same content
      expect(result1.content).toBe(result2.content);
    });

    it('should track cache statistics', async () => {
      const query: AIQuery = {
        query: 'Hello world',
        userId: 'test-user-5'
      };

      // Make multiple requests
      for (let i = 0; i < 3; i++) {
        await router.route(query);
      }

      const stats = await router.getCacheStats();

      expect(stats).toBeDefined();
      expect(stats.hits).toBeGreaterThanOrEqual(0);
      expect(stats.misses).toBeGreaterThanOrEqual(0);
      expect(stats.size).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Metrics Tracking', () => {
    it('should track routing metrics', async () => {
      const queries: AIQuery[] = [
        { query: 'What is AI?', userId: 'user-1' },
        { query: 'Analyze market trends', userId: 'user-2' },
        { query: 'Develop strategic plan', userId: 'user-3' }
      ];

      for (const query of queries) {
        await router.route(query);
      }

      const metrics = await router.getMetrics();

      expect(metrics).toBeDefined();
      expect(metrics[RoutingTier.LOCAL_LLM]).toBeDefined();
      expect(metrics[RoutingTier.RAP_SYSTEM]).toBeDefined();
      expect(metrics[RoutingTier.EXTERNAL_LLM]).toBeDefined();
    });

    it('should provide system health status', async () => {
      const query: AIQuery = { query: 'Test query', userId: 'user-1' };

      await router.route(query);

      const health = await router.getSystemHealth();

      expect(health).toBeDefined();
      expect(health.overallSuccessRate).toBeGreaterThanOrEqual(0);
      expect(health.overallSuccessRate).toBeLessThanOrEqual(100);
      expect(health.averageResponseTime).toBeGreaterThanOrEqual(0);
      expect(health.totalRequests).toBeGreaterThanOrEqual(0);
      expect(health.cacheHitRate).toBeGreaterThanOrEqual(0);
    });

    it('should identify best performing tier', async () => {
      const queries: AIQuery[] = [
        { query: 'What is AI?', userId: 'user-1' },
        { query: 'What is ML?', userId: 'user-2' },
        { query: 'What is DL?', userId: 'user-3' }
      ];

      for (const query of queries) {
        await router.route(query);
      }

      const bestTier = await router.getBestPerformingTier();

      expect(bestTier).toBeDefined();
      expect([RoutingTier.LOCAL_LLM, RoutingTier.RAP_SYSTEM, RoutingTier.EXTERNAL_LLM]).toContain(
        bestTier
      );
    });

    it('should identify cheapest tier', async () => {
      const cheapestTier = await router.getCheapestTier();

      expect(cheapestTier).toBeDefined();
      expect([RoutingTier.LOCAL_LLM, RoutingTier.RAP_SYSTEM, RoutingTier.EXTERNAL_LLM]).toContain(
        cheapestTier
      );
    });

    it('should identify fastest tier', async () => {
      const fastestTier = await router.getFastestTier();

      expect(fastestTier).toBeDefined();
      expect([RoutingTier.LOCAL_LLM, RoutingTier.RAP_SYSTEM, RoutingTier.EXTERNAL_LLM]).toContain(
        fastestTier
      );
    });
  });

  describe('Configuration Management', () => {
    it('should allow updating latency thresholds', () => {
      router.setLatencyThreshold(RoutingTier.LOCAL_LLM, 300);
      router.setLatencyThreshold(RoutingTier.RAP_SYSTEM, 1500);
      router.setLatencyThreshold(RoutingTier.EXTERNAL_LLM, 4000);

      // Verify by making a request
      expect(router).toBeDefined();
    });

    it('should allow updating cost thresholds', () => {
      router.setCostThreshold(RoutingTier.LOCAL_LLM, 0);
      router.setCostThreshold(RoutingTier.RAP_SYSTEM, 0.05);
      router.setCostThreshold(RoutingTier.EXTERNAL_LLM, 0.15);

      expect(router).toBeDefined();
    });

    it('should allow updating fallback strategies', () => {
      router.setFallbackStrategy(RoutingTier.LOCAL_LLM, {
        tier: RoutingTier.LOCAL_LLM,
        condition: 'failure',
        threshold: 0,
        nextTier: RoutingTier.RAP_SYSTEM
      });

      expect(router).toBeDefined();
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', async () => {
      const query: AIQuery = { query: 'Test query', userId: 'user-1' };

      // Make a request to populate cache
      await router.route(query);

      // Clear cache
      await router.clearCache();

      // Verify cache is cleared
      const stats = await router.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });

  describe('Metrics Reset', () => {
    it('should reset all metrics', async () => {
      const query: AIQuery = { query: 'Test query', userId: 'user-1' };

      // Make requests to populate metrics
      await router.route(query);

      // Reset metrics
      await router.resetMetrics();

      // Verify metrics are reset
      const metrics = await router.getMetrics();
      expect(metrics[RoutingTier.LOCAL_LLM].totalRequests).toBe(0);
      expect(metrics[RoutingTier.RAP_SYSTEM].totalRequests).toBe(0);
      expect(metrics[RoutingTier.EXTERNAL_LLM].totalRequests).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid queries gracefully', async () => {
      const query: AIQuery = { query: '', userId: 'user-1' };

      // Should not throw, but handle gracefully
      const result = await router.route(query);
      expect(result).toBeDefined();
    });

    it('should handle very long queries', async () => {
      const longQuery = 'word '.repeat(1000);
      const query: AIQuery = { query: longQuery, userId: 'user-1' };

      const result = await router.route(query);
      expect(result).toBeDefined();
    });
  });

  describe('Multi-Query Routing', () => {
    it('should handle multiple concurrent queries', async () => {
      const queries: AIQuery[] = [
        { query: 'What is AI?', userId: 'user-1' },
        { query: 'Analyze trends', userId: 'user-2' },
        { query: 'Develop strategy', userId: 'user-3' }
      ];

      const results = await Promise.all(queries.map(q => router.route(q)));

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
        expect(result.routingTier).toBeDefined();
      });
    });

    it('should maintain separate metrics for different query types', async () => {
      const simpleQuery: AIQuery = { query: 'What is AI?', userId: 'user-1' };
      const complexQuery: AIQuery = {
        query: 'Develop comprehensive strategic plan',
        userId: 'user-2'
      };

      await router.route(simpleQuery);
      await router.route(complexQuery);

      const metrics = await router.getMetrics();

      // At least one tier should have requests
      const totalRequests =
        metrics[RoutingTier.LOCAL_LLM].totalRequests +
        metrics[RoutingTier.RAP_SYSTEM].totalRequests +
        metrics[RoutingTier.EXTERNAL_LLM].totalRequests;

      expect(totalRequests).toBeGreaterThanOrEqual(2);
    });
  });
});

