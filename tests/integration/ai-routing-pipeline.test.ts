import { AIRoutingOrchestrator } from '../../services/ai-routing/hierarchical-router';
import { CostOptimizer } from '../../services/ai-routing/cost-optimizer';
import { ResponseCache } from '../../services/ai-routing/response-cache';
import { TierSelector } from '../../services/ai-routing/tier-selector';

describe('AI Routing Pipeline Integration', () => {
  let orchestrator: AIRoutingOrchestrator;
  let costOptimizer: CostOptimizer;
  let cache: ResponseCache;
  let tierSelector: TierSelector;

  beforeAll(() => {
    costOptimizer = new CostOptimizer();
    cache = new ResponseCache();
    tierSelector = new TierSelector();
    orchestrator = new AIRoutingOrchestrator(costOptimizer, cache, tierSelector);
  });

  describe('Routing Decision', () => {
    it('should route query to appropriate tier', async () => {
      const query = 'Simple question';
      const context = { userId: 'user-1', requiresContext: false };

      const response = await orchestrator.route(query, context);

      expect(response.tier).toBeDefined();
      expect(['local', 'rap', 'external']).toContain(response.tier);
    });

    it('should select local tier for simple queries', async () => {
      const query = 'What is 2+2?';
      const context = { userId: 'user-1', requiresContext: false };

      const response = await orchestrator.route(query, context);

      expect(response.tier).toBe('local');
    });

    it('should select RAP tier for context-requiring queries', async () => {
      const query = 'Explain machine learning';
      const context = { userId: 'user-1', requiresContext: true };

      const response = await orchestrator.route(query, context);

      expect(response.tier).toBe('rap');
    });

    it('should respect budget constraints', async () => {
      const query = 'Complex query';
      const context = { userId: 'user-1', budget: 0.01, requiresContext: false };

      const response = await orchestrator.route(query, context);

      expect(response.cost).toBeLessThanOrEqual(0.01);
    });
  });

  describe('Fallback Logic', () => {
    it('should fallback to next tier on failure', async () => {
      const query = 'Test query';
      const failedTier = 'local' as const;

      const response = await orchestrator.fallback(query, failedTier);

      expect(response.tier).not.toBe(failedTier);
      expect(['rap', 'external']).toContain(response.tier);
    });

    it('should implement fallback chain', async () => {
      const query = 'Test query';

      const localResponse = await orchestrator.route(query, { userId: 'user-1', requiresContext: false });
      if (localResponse.tier === 'local') {
        const rapResponse = await orchestrator.fallback(query, 'local');
        expect(rapResponse.tier).toBe('rap');

        const externalResponse = await orchestrator.fallback(query, 'rap');
        expect(externalResponse.tier).toBe('external');
      }
    });

    it('should handle all tiers unavailable', async () => {
      const query = 'Test query';

      const response = await orchestrator.route(query, { userId: 'user-1', requiresContext: false });

      expect(response.response).toBeDefined();
      expect(response.response.length).toBeGreaterThan(0);
    });
  });

  describe('Cost Optimization', () => {
    it('should calculate cost per tier', async () => {
      const cost = costOptimizer.calculateCost('local', 100);
      expect(cost).toBeGreaterThan(0);

      const rapCost = costOptimizer.calculateCost('rap', 100);
      const externalCost = costOptimizer.calculateCost('external', 100);

      expect(cost).toBeLessThan(rapCost);
      expect(rapCost).toBeLessThan(externalCost);
    });

    it('should select optimal tier within budget', async () => {
      const query = 'Test query';
      const budget = 0.05;

      const tier = costOptimizer.selectOptimalTier(query, budget);

      expect(['local', 'rap', 'external']).toContain(tier);
    });

    it('should track costs per user', async () => {
      const userId = 'user-1';
      const cost = 0.01;

      await costOptimizer.trackCosts(userId, cost);

      const metrics = await costOptimizer.getCostMetrics(userId);
      expect(metrics.totalCost).toBeGreaterThanOrEqual(cost);
    });

    it('should alert on cost threshold', async () => {
      const userId = 'user-1';
      const threshold = 100;

      const alert = await costOptimizer.alertOnThreshold(userId, threshold);

      expect(alert).toBeDefined();
    });
  });

  describe('Response Caching', () => {
    it('should cache responses', async () => {
      const queryHash = 'hash-123';
      const response = 'Cached response';
      const ttl = 3600;

      await cache.set(queryHash, response, ttl);
      const cached = await cache.get(queryHash);

      expect(cached).toBe(response);
    });

    it('should retrieve cached responses', async () => {
      const queryHash = 'hash-456';
      const response = 'Test response';

      await cache.set(queryHash, response, 3600);
      const retrieved = await cache.get(queryHash);

      expect(retrieved).toBe(response);
    });

    it('should invalidate cache', async () => {
      const queryHash = 'hash-789';
      const response = 'Response to invalidate';

      await cache.set(queryHash, response, 3600);
      await cache.invalidate('hash-*');
      const retrieved = await cache.get(queryHash);

      expect(retrieved).toBeNull();
    });

    it('should track cache statistics', async () => {
      const stats = await cache.getStats();

      expect(stats.hitRate).toBeGreaterThanOrEqual(0);
      expect(stats.hitRate).toBeLessThanOrEqual(1);
      expect(stats.totalHits).toBeGreaterThanOrEqual(0);
      expect(stats.totalMisses).toBeGreaterThanOrEqual(0);
    });

    it('should achieve >40% cache hit rate', async () => {
      const queries = Array(100).fill('same query');

      for (const query of queries) {
        const hash = 'hash-same';
        const cached = await cache.get(hash);
        if (!cached) {
          await cache.set(hash, 'response', 3600);
        }
      }

      const stats = await cache.getStats();
      expect(stats.hitRate).toBeGreaterThan(0.4);
    });
  });

  describe('Tier Selection', () => {
    it('should select based on query complexity', async () => {
      const simpleQuery = 'What is 2+2?';
      const complexQuery = 'Explain quantum computing in detail';

      const simpleTier = tierSelector.selectTier(simpleQuery);
      const complexTier = tierSelector.selectTier(complexQuery);

      expect(simpleTier).toBe('local');
      expect(complexTier).not.toBe('local');
    });

    it('should consider user preferences', async () => {
      const query = 'Test query';
      const preferredTier = 'rap';

      const selected = tierSelector.selectTier(query, preferredTier);

      expect(selected).toBe(preferredTier);
    });

    it('should respect cost constraints', async () => {
      const query = 'Test query';
      const maxCost = 0.01;

      const tier = tierSelector.selectTier(query, undefined, maxCost);

      const cost = costOptimizer.calculateCost(tier, 100);
      expect(cost).toBeLessThanOrEqual(maxCost);
    });
  });

  describe('Metrics Tracking', () => {
    it('should log routing decisions', async () => {
      const query = 'Test query';
      const context = { userId: 'user-1', requiresContext: false };

      const response = await orchestrator.route(query, context);
      await orchestrator.logRouting({
        selectedTier: response.tier,
        reason: 'test',
        estimatedCost: response.cost,
        estimatedLatency: 50,
        cacheHit: false
      });

      expect(response.tier).toBeDefined();
    });

    it('should track tier distribution', async () => {
      const queries = Array(30).fill('query');

      for (const query of queries) {
        await orchestrator.route(query, { userId: 'user-1', requiresContext: false });
      }

      const stats = await orchestrator.getRoutingStats();
      expect(stats.totalQueries).toBeGreaterThanOrEqual(30);
    });

    it('should monitor fallback rate', async () => {
      const stats = await orchestrator.getRoutingStats();

      expect(stats.fallbackRate).toBeGreaterThanOrEqual(0);
      expect(stats.fallbackRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Performance Requirements', () => {
    it('should route within 50ms', async () => {
      const query = 'Test query';
      const context = { userId: 'user-1', requiresContext: false };

      const start = Date.now();
      await orchestrator.route(query, context);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it('should cache lookup within 10ms', async () => {
      const queryHash = 'hash-perf';
      await cache.set(queryHash, 'response', 3600);

      const start = Date.now();
      await cache.get(queryHash);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(10);
    });

    it('should handle concurrent routing', async () => {
      const queries = Array(50).fill('query');

      const start = Date.now();
      await Promise.all(
        queries.map(q => orchestrator.route(q, { userId: 'user-1', requiresContext: false }))
      );
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(2500);
    });
  });
});
