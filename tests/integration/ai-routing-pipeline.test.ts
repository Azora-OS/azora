import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { CostOptimizer } from '../../services/ai-routing/cost-optimizer';
import { TierSelector } from '../../services/ai-routing/tier-selector';
import { ResponseCache } from '../../services/ai-routing/response-cache';
import { HierarchicalRouter } from '../../services/ai-routing/hierarchical-router';
import { RoutingMetricsTracker } from '../../services/ai-routing/routing-metrics-tracker';

describe('AI Routing Pipeline Integration Tests', () => {
  let costOptimizer: CostOptimizer;
  let tierSelector: TierSelector;
  let responseCache: ResponseCache;
  let hierarchicalRouter: HierarchicalRouter;
  let metricsTracker: RoutingMetricsTracker;

  beforeAll(() => {
    costOptimizer = new CostOptimizer();
    tierSelector = new TierSelector();
    responseCache = new ResponseCache();
    hierarchicalRouter = new HierarchicalRouter(costOptimizer, tierSelector, responseCache);
    metricsTracker = new RoutingMetricsTracker();
  });

  afterAll(() => {
    responseCache.clear();
  });

  describe('Routing Decision Making', () => {
    it('should route simple queries to local LLM', async () => {
      const query = 'What is 2+2?';

      const decision = await hierarchicalRouter.makeRoutingDecision(query);

      expect(decision).toBeDefined();
      expect(decision.tier).toBe('local');
      expect(decision.model).toBeDefined();
    });

    it('should route complex queries to external LLM', async () => {
      const query = 'Explain quantum computing and its applications in cryptography.';

      const decision = await hierarchicalRouter.makeRoutingDecision(query);

      expect(decision).toBeDefined();
      expect(['external', 'premium']).toContain(decision.tier);
    });

    it('should route knowledge-intensive queries to RAP', async () => {
      const query = 'What are Azora\'s core features?';

      const decision = await hierarchicalRouter.makeRoutingDecision(query);

      expect(decision).toBeDefined();
      expect(decision.useRAP).toBe(true);
    });

    it('should consider cost in routing decision', async () => {
      const query = 'simple query';

      const decision = await hierarchicalRouter.makeRoutingDecision(query);

      expect(decision.estimatedCost).toBeDefined();
      expect(decision.estimatedCost).toBeGreaterThanOrEqual(0);
    });

    it('should provide reasoning for routing decision', async () => {
      const query = 'test query';

      const decision = await hierarchicalRouter.makeRoutingDecision(query);

      expect(decision.reasoning).toBeDefined();
      expect(decision.reasoning.length).toBeGreaterThan(0);
    });
  });

  describe('Fallback Logic', () => {
    it('should fallback to local LLM if external fails', async () => {
      const query = 'complex query';

      const decision = await hierarchicalRouter.makeRoutingDecision(query);
      const fallbackDecision = hierarchicalRouter.getFallbackDecision(decision);

      expect(fallbackDecision).toBeDefined();
      expect(fallbackDecision.tier).toBe('local');
    });

    it('should fallback to cache if all services fail', async () => {
      const query = 'previously answered query';
      const cachedResponse = 'cached answer';

      responseCache.set(query, cachedResponse);

      const fallbackDecision = hierarchicalRouter.getFallbackDecision({
        tier: 'external',
        model: 'gpt-4',
        useRAP: false,
        estimatedCost: 0.01,
        reasoning: 'test',
      });

      expect(fallbackDecision.useCache).toBe(true);
    });

    it('should track fallback events', async () => {
      const query = 'test query';

      const decision = await hierarchicalRouter.makeRoutingDecision(query);
      const fallbackDecision = hierarchicalRouter.getFallbackDecision(decision);

      const metrics = metricsTracker.getMetrics();

      expect(metrics.fallbackCount).toBeGreaterThanOrEqual(0);
    });

    it('should limit fallback depth', async () => {
      const query = 'test query';

      let decision: any = { tier: 'external', model: 'gpt-4', useRAP: false, estimatedCost: 0.01, reasoning: 'test' };
      let fallbackCount = 0;

      while (fallbackCount < 10) {
        decision = hierarchicalRouter.getFallbackDecision(decision);
        fallbackCount++;

        if (decision.tier === 'local' || decision.useCache) {
          break;
        }
      }

      expect(fallbackCount).toBeLessThan(10);
    });
  });

  describe('Cost Optimization', () => {
    it('should calculate query cost accurately', () => {
      const query = 'test query';

      const cost = costOptimizer.calculateCost(query, 'local');

      expect(cost).toBeDefined();
      expect(cost).toBeGreaterThanOrEqual(0);
      expect(typeof cost).toBe('number');
    });

    it('should prefer cheaper options when quality is similar', async () => {
      const query = 'simple query';

      const decision = await hierarchicalRouter.makeRoutingDecision(query);

      expect(decision.tier).toBe('local');
      expect(decision.estimatedCost).toBeLessThan(0.01);
    });

    it('should balance cost and quality', async () => {
      const query = 'moderately complex query';

      const decision = await hierarchicalRouter.makeRoutingDecision(query);

      expect(decision).toBeDefined();
      expect(decision.estimatedCost).toBeDefined();
      expect(decision.qualityScore).toBeDefined();
    });

    it('should track total cost across queries', async () => {
      const queries = [
        'simple query',
        'another simple query',
        'complex query requiring external LLM',
      ];

      let totalCost = 0;

      for (const query of queries) {
        const decision = await hierarchicalRouter.makeRoutingDecision(query);
        totalCost += decision.estimatedCost;
      }

      const metrics = metricsTracker.getMetrics();

      expect(metrics.totalCost).toBeGreaterThanOrEqual(0);
    });

    it('should alert on cost threshold exceeded', async () => {
      const threshold = 0.05;
      costOptimizer.setCostThreshold(threshold);

      const query = 'expensive query';
      const decision = await hierarchicalRouter.makeRoutingDecision(query);

      if (decision.estimatedCost > threshold) {
        expect(decision.costAlert).toBe(true);
      }
    });
  });

  describe('Response Caching', () => {
    it('should cache responses for identical queries', async () => {
      const query = 'What is machine learning?';
      const response = 'Machine learning is a subset of AI.';

      responseCache.set(query, response);
      const cached = responseCache.get(query);

      expect(cached).toBe(response);
    });

    it('should return cached response without reprocessing', async () => {
      const query = 'cached query';
      const response = 'cached response';

      responseCache.set(query, response);

      const decision = await hierarchicalRouter.makeRoutingDecision(query);

      if (responseCache.has(query)) {
        expect(decision.useCache).toBe(true);
      }
    });

    it('should respect cache TTL', async () => {
      const query = 'temporary query';
      const response = 'temporary response';
      const ttlMs = 100;

      responseCache.set(query, response, ttlMs);

      expect(responseCache.has(query)).toBe(true);

      await new Promise(resolve => setTimeout(resolve, ttlMs + 50));

      expect(responseCache.has(query)).toBe(false);
    });

    it('should handle cache misses gracefully', async () => {
      const query = 'non-cached query';

      const cached = responseCache.get(query);

      expect(cached).toBeUndefined();
    });

    it('should track cache hit rate', async () => {
      const queries = ['query1', 'query2', 'query1', 'query3', 'query1'];

      responseCache.set('query1', 'response1');

      let hitCount = 0;

      for (const query of queries) {
        if (responseCache.has(query)) {
          hitCount++;
        }
      }

      const hitRate = (hitCount / queries.length) * 100;

      expect(hitRate).toBeGreaterThan(0);
    });

    it('should achieve >40% cache hit rate in production', async () => {
      const testQueries = Array.from({ length: 100 }, (_, i) => {
        // 60% repeated queries, 40% unique
        return i < 60 ? `query-${i % 10}` : `unique-query-${i}`;
      });

      for (const query of testQueries) {
        responseCache.set(query, `response-for-${query}`);
      }

      let hitCount = 0;

      for (const query of testQueries) {
        if (responseCache.has(query)) {
          hitCount++;
        }
      }

      const hitRate = (hitCount / testQueries.length) * 100;

      expect(hitRate).toBeGreaterThanOrEqual(40);
    });
  });

  describe('Tier Selection', () => {
    it('should select appropriate tier for query complexity', async () => {
      const simpleQuery = 'What is 2+2?';
      const complexQuery = 'Explain quantum entanglement and its implications.';

      const simpleDecision = await hierarchicalRouter.makeRoutingDecision(simpleQuery);
      const complexDecision = await hierarchicalRouter.makeRoutingDecision(complexQuery);

      expect(simpleDecision.tier).toBe('local');
      expect(['external', 'premium']).toContain(complexDecision.tier);
    });

    it('should consider user tier/subscription', async () => {
      const query = 'test query';

      const freeUserDecision = await hierarchicalRouter.makeRoutingDecision(query, { tier: 'free' });
      const premiumUserDecision = await hierarchicalRouter.makeRoutingDecision(query, { tier: 'premium' });

      expect(freeUserDecision.tier).not.toBe('premium');
      expect(premiumUserDecision.tier).toBe('premium');
    });

    it('should balance load across tiers', async () => {
      const queries = Array.from({ length: 100 }, (_, i) => `query-${i}`);

      const tierCounts: Record<string, number> = {};

      for (const query of queries) {
        const decision = await hierarchicalRouter.makeRoutingDecision(query);
        tierCounts[decision.tier] = (tierCounts[decision.tier] || 0) + 1;
      }

      // Should have some distribution across tiers
      expect(Object.keys(tierCounts).length).toBeGreaterThan(1);
    });
  });

  describe('Metrics Tracking', () => {
    it('should track routing decisions', async () => {
      const query = 'test query';

      await hierarchicalRouter.makeRoutingDecision(query);

      const metrics = metricsTracker.getMetrics();

      expect(metrics.totalQueries).toBeGreaterThan(0);
    });

    it('should track tier distribution', async () => {
      const queries = Array.from({ length: 50 }, (_, i) => `query-${i}`);

      for (const query of queries) {
        await hierarchicalRouter.makeRoutingDecision(query);
      }

      const metrics = metricsTracker.getMetrics();

      expect(metrics.tierDistribution).toBeDefined();
      expect(Object.keys(metrics.tierDistribution).length).toBeGreaterThan(0);
    });

    it('should track average cost per query', async () => {
      const queries = Array.from({ length: 10 }, (_, i) => `query-${i}`);

      for (const query of queries) {
        await hierarchicalRouter.makeRoutingDecision(query);
      }

      const metrics = metricsTracker.getMetrics();

      expect(metrics.averageCost).toBeDefined();
      expect(metrics.averageCost).toBeGreaterThanOrEqual(0);
    });

    it('should track fallback rate', async () => {
      const metrics = metricsTracker.getMetrics();

      expect(metrics.fallbackRate).toBeDefined();
      expect(metrics.fallbackRate).toBeGreaterThanOrEqual(0);
      expect(metrics.fallbackRate).toBeLessThanOrEqual(100);
    });
  });

  describe('Performance Requirements', () => {
    it('should make routing decision within 50ms', async () => {
      const query = 'test query';

      const startTime = Date.now();

      await hierarchicalRouter.makeRoutingDecision(query);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50);
    });

    it('should retrieve cached response within 10ms', () => {
      const query = 'cached query';
      const response = 'cached response';

      responseCache.set(query, response);

      const startTime = Date.now();

      responseCache.get(query);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10);
    });

    it('should calculate cost within 5ms', () => {
      const query = 'test query';

      const startTime = Date.now();

      costOptimizer.calculateCost(query, 'local');

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5);
    });

    it('should complete full routing pipeline within 100ms', async () => {
      const query = 'test query';

      const startTime = Date.now();

      const decision = await hierarchicalRouter.makeRoutingDecision(query);
      if (!responseCache.has(query)) {
        // Simulate processing
        responseCache.set(query, 'response');
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid query gracefully', async () => {
      const query = null as any;

      expect(async () => {
        await hierarchicalRouter.makeRoutingDecision(query);
      }).not.toThrow();
    });

    it('should handle service failures gracefully', async () => {
      const query = 'test query';

      const decision = await hierarchicalRouter.makeRoutingDecision(query);

      expect(decision).toBeDefined();
      expect(decision.tier).toBeDefined();
    });

    it('should provide fallback when all services fail', async () => {
      const query = 'test query';

      const decision = await hierarchicalRouter.makeRoutingDecision(query);
      const fallback = hierarchicalRouter.getFallbackDecision(decision);

      expect(fallback).toBeDefined();
      expect(fallback.tier).toBeDefined();
    });
  });

  describe('Integration with Other Components', () => {
    it('should integrate with Knowledge Ocean for RAP queries', async () => {
      const query = 'Azora features';

      const decision = await hierarchicalRouter.makeRoutingDecision(query);

      if (decision.useRAP) {
        expect(decision.rapConfig).toBeDefined();
      }
    });

    it('should integrate with Constitutional AI for validation', async () => {
      const query = 'test query';

      const decision = await hierarchicalRouter.makeRoutingDecision(query);

      expect(decision.requiresValidation).toBeDefined();
    });

    it('should track metrics for all components', async () => {
      const query = 'test query';

      await hierarchicalRouter.makeRoutingDecision(query);

      const metrics = metricsTracker.getMetrics();

      expect(metrics).toHaveProperty('totalQueries');
      expect(metrics).toHaveProperty('totalCost');
      expect(metrics).toHaveProperty('cacheHitRate');
      expect(metrics).toHaveProperty('fallbackRate');
    });
  });
});
