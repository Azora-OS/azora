import { RoutingTier, QueryComplexity } from '../types';
import { getTestRedisClient, cleanupTestRedis } from '../../../tests/utils/redis';

const redis = getTestRedisClient();

describe('Routing Analytics', () => {
  afterEach(async () => {
    await cleanupTestRedis();
  });

  it('should track routing counts by tier', async () => {
    await redis.incr(`routing:${RoutingTier.LOCAL_LLM}`);
    await redis.incr(`routing:${RoutingTier.LOCAL_LLM}`);
    await redis.incr(`routing:${RoutingTier.RAP_SYSTEM}`);

    const localCount = await redis.get(`routing:${RoutingTier.LOCAL_LLM}`);
    const rapCount = await redis.get(`routing:${RoutingTier.RAP_SYSTEM}`);

    expect(parseInt(localCount!)).toBe(2);
    expect(parseInt(rapCount!)).toBe(1);
  });

  it('should calculate success rates', async () => {
    await redis.hset(`metrics:${RoutingTier.LOCAL_LLM}`, {
      total: 100,
      successful: 95
    });

    const total = await redis.hget(`metrics:${RoutingTier.LOCAL_LLM}`, 'total');
    const successful = await redis.hget(`metrics:${RoutingTier.LOCAL_LLM}`, 'successful');
    const successRate = (parseInt(successful!) / parseInt(total!)) * 100;

    expect(successRate).toBe(95);
  });

  it('should track response times', async () => {
    const times = [100, 150, 200];
    
    for (const time of times) {
      await redis.lpush(`times:${RoutingTier.LOCAL_LLM}`, time.toString());
    }

    const storedTimes = await redis.lrange(`times:${RoutingTier.LOCAL_LLM}`, 0, -1);
    const average = storedTimes.reduce((sum, t) => sum + parseInt(t), 0) / storedTimes.length;

    expect(average).toBe(150);
  });

  it('should track costs per tier', async () => {
    await redis.lpush(`costs:${RoutingTier.LOCAL_LLM}`, '0.001');
    await redis.lpush(`costs:${RoutingTier.LOCAL_LLM}`, '0.002');

    const costs = await redis.lrange(`costs:${RoutingTier.LOCAL_LLM}`, 0, -1);
    const total = costs.reduce((sum, cost) => sum + parseFloat(cost), 0);

    expect(total).toBeCloseTo(0.003, 3);
  });

  it('should track cache hit rates', async () => {
    await redis.incr('cache:hits');
    await redis.incr('cache:hits');
    await redis.incr('cache:misses');

    const hits = await redis.get('cache:hits');
    const misses = await redis.get('cache:misses');
    const hitRate = (parseInt(hits!) / (parseInt(hits!) + parseInt(misses!))) * 100;

    expect(hitRate).toBeCloseTo(66.67, 1);
  });

  it('should track query complexity', async () => {
    await redis.incr(`complexity:${QueryComplexity.SIMPLE}`);
    await redis.incr(`complexity:${QueryComplexity.SIMPLE}`);
    await redis.incr(`complexity:${QueryComplexity.MODERATE}`);

    const simple = await redis.get(`complexity:${QueryComplexity.SIMPLE}`);
    const moderate = await redis.get(`complexity:${QueryComplexity.MODERATE}`);

    expect(parseInt(simple!)).toBe(2);
    expect(parseInt(moderate!)).toBe(1);
  });

  it('should identify slow queries', async () => {
    const queries = [
      { id: 'q1', time: 100 },
      { id: 'q2', time: 2000 },
      { id: 'q3', time: 150 }
    ];

    const slowQueries = queries.filter(q => q.time > 1000);
    
    for (const query of slowQueries) {
      await redis.lpush('slow_queries', JSON.stringify(query));
    }

    const stored = await redis.lrange('slow_queries', 0, -1);
    expect(stored).toHaveLength(1);
  });

  it('should track peak usage hours', async () => {
    await redis.hset('hourly', '9', '50');
    await redis.hset('hourly', '10', '100');
    await redis.hset('hourly', '11', '75');

    const hourly = await redis.hgetall('hourly');
    const entries = Object.entries(hourly);
    let peakHour = '0';
    let peakCount = 0;
    
    for (const [hour, count] of entries) {
      const countNum = parseInt(count);
      if (countNum > peakCount) {
        peakHour = hour;
        peakCount = countNum;
      }
    }

    expect(parseInt(peakHour)).toBe(10);
    expect(peakCount).toBe(100);
  });

  it('should calculate cost savings from cache', async () => {
    const hits = 80;
    const avgCost = 0.01;
    const savings = hits * avgCost;

    await redis.hset('savings', {
      hits: hits.toString(),
      avgCost: avgCost.toString(),
      total: savings.toString()
    });

    const total = await redis.hget('savings', 'total');
    expect(parseFloat(total!)).toBe(0.8);
  });

  it('should track error rates', async () => {
    await redis.incr(`errors:${RoutingTier.LOCAL_LLM}`);
    await redis.incr(`errors:${RoutingTier.EXTERNAL_LLM}`);
    await redis.incr(`errors:${RoutingTier.LOCAL_LLM}`);

    const localErrors = await redis.get(`errors:${RoutingTier.LOCAL_LLM}`);
    const externalErrors = await redis.get(`errors:${RoutingTier.EXTERNAL_LLM}`);

    expect(parseInt(localErrors!)).toBe(2);
    expect(parseInt(externalErrors!)).toBe(1);
  });
});