/**
 * Test Execution Optimization Examples
 * Demonstrates how to use the various optimization features
 */

import {
  TestExecutionOptimizer,
  DatabaseTransactionManager,
  RedisPipelineManager,
  MockResponseCache,
  TestResultCache,
  setupOptimizedTest,
  cleanupOptimizedTest,
  getTestOptimizer,
} from './test-execution-optimizer';
import { getTestRedisClient } from './redis';

describe('Test Execution Optimization Examples', () => {
  describe('Database Transaction Rollback', () => {
    let dbManager: DatabaseTransactionManager;

    beforeEach(() => {
      dbManager = new DatabaseTransactionManager();
    });

    afterEach(async () => {
      await dbManager.rollbackTransaction();
    });

    it('should use transaction for fast cleanup', async () => {
      const client = await dbManager.beginTransaction();
      const user = await client.user.create({
        data: { 
          email: 'test@example.com', 
          name: 'Test User', 
          password: 'hashedpassword123',
          role: 'STUDENT' 
        },
      });
      expect(user.id).toBeDefined();
      // Transaction will be rolled back in afterEach, so no cleanup needed
    });
  });

  describe('Redis Pipeline Operations', () => {
    let redisManager: RedisPipelineManager;

    beforeEach(() => {
      redisManager = new RedisPipelineManager();
    });

    afterEach(async () => {
      await redisManager.batchDeleteByPattern('test:*');
    });

    it('should batch Redis operations with pipeline', async () => {
      redisManager.startPipeline();
      redisManager.set('user:1', 'John Doe');
      redisManager.set('user:2', 'Jane Smith');
      const results = await redisManager.executePipeline();
      expect(results.length).toBe(2);
    });
  });

  describe('Mock Response Caching', () => {
    let mockCache: MockResponseCache;

    beforeEach(() => {
      mockCache = new MockResponseCache();
    });

    it('should cache mock responses', () => {
      const response = { id: 'pi_123', status: 'succeeded' };
      mockCache.set('stripe', 'createPaymentIntent', [{ amount: 1000 }], response);
      const cached = mockCache.get('stripe', 'createPaymentIntent', [{ amount: 1000 }]);
      expect(cached).toEqual(response);
    });
  });

  describe('Complete Optimization Workflow', () => {
    beforeEach(async () => {
      await setupOptimizedTest();
    });

    afterEach(async () => {
      await cleanupOptimizedTest();
    });

    it('should use all optimizations together', async () => {
      const optimizer = getTestOptimizer();
      const stats = optimizer.getStats();
      expect(stats).toHaveProperty('database');
      expect(stats).toHaveProperty('redis');
      expect(stats).toHaveProperty('mockCache');
      expect(stats).toHaveProperty('resultCache');
    });
  });
});
