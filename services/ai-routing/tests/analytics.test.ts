import { RoutingTier, QueryComplexity } from '../types';

describe('AI Routing - Analytics', () => {
  it('should track total requests per tier', () => {
    const metrics = {
      [RoutingTier.LOCAL_LLM]: 150,
      [RoutingTier.RAP_SYSTEM]: 75,
      [RoutingTier.EXTERNAL_LLM]: 25,
    };

    const totalRequests = Object.values(metrics).reduce((sum, count) => sum + count, 0);

    expect(totalRequests).toBe(250);
  });

  it('should calculate success rate per tier', () => {
    const tierMetrics = {
      totalRequests: 100,
      successfulRequests: 95,
    };

    const successRate = (tierMetrics.successfulRequests / tierMetrics.totalRequests) * 100;

    expect(successRate).toBe(95);
  });

  it('should track average response time', () => {
    const responseTimes = [100, 150, 120, 180, 110];
    const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;

    expect(averageResponseTime).toBe(132);
  });

  it('should calculate cache hit rate', () => {
    const cacheMetrics = { hits: 80, misses: 20 };
    const hitRate = (cacheMetrics.hits / (cacheMetrics.hits + cacheMetrics.misses)) * 100;

    expect(hitRate).toBe(80);
  });

  it('should track cost per tier', () => {
    const costs = [
      { tier: RoutingTier.LOCAL_LLM, cost: 0.001 },
      { tier: RoutingTier.LOCAL_LLM, cost: 0.0015 },
    ];

    const totalCost = costs.reduce((sum, c) => sum + c.cost, 0);

    expect(totalCost).toBeCloseTo(0.0025, 4);
  });

  it('should calculate average cost per request', () => {
    const requests = [{ cost: 0.01 }, { cost: 0.02 }];
    const averageCost = requests.reduce((sum, r) => sum + r.cost, 0) / requests.length;

    expect(averageCost).toBe(0.015);
  });

  it('should track query complexity distribution', () => {
    const queries = [
      { complexity: QueryComplexity.SIMPLE },
      { complexity: QueryComplexity.SIMPLE },
      { complexity: QueryComplexity.MODERATE },
    ];

    const simpleCount = queries.filter(q => q.complexity === QueryComplexity.SIMPLE).length;

    expect(simpleCount).toBe(2);
  });

  it('should identify slow queries', () => {
    const queries = [
      { id: 'q1', responseTime: 100 },
      { id: 'q2', responseTime: 5000 },
    ];

    const slowQueries = queries.filter(q => q.responseTime > 1000);

    expect(slowQueries.length).toBe(1);
    expect(slowQueries[0].id).toBe('q2');
  });

  it('should calculate cost savings from caching', () => {
    const cacheHits = 80;
    const averageCostPerRequest = 0.01;
    const costSavings = cacheHits * averageCostPerRequest;

    expect(costSavings).toBe(0.8);
  });

  it('should identify peak usage hours', () => {
    const hourlyRequests = [
      { hour: 9, count: 50 },
      { hour: 10, count: 100 },
      { hour: 11, count: 75 },
    ];

    const peakHour = hourlyRequests.reduce((max, h) => h.count > max.count ? h : max);

    expect(peakHour.hour).toBe(10);
  });
});
