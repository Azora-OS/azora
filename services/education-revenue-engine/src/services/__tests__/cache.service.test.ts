/**
 * Cache Service Tests
 * Tests for Redis caching functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CacheService } from '../cache.service';
import Redis from 'ioredis';

// Mock Redis
vi.mock('ioredis', () => {
  const mockRedis = {
    get: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
    flushdb: vi.fn(),
    quit: vi.fn(),
    on: vi.fn(),
    status: 'ready'
  };
  return { default: vi.fn(() => mockRedis) };
});

describe('CacheService', () => {
  let cacheService: CacheService;
  let mockRedis: any;

  beforeEach(() => {
    mockRedis = new Redis();
    cacheService = new CacheService({
      host: 'localhost',
      port: 6379,
      keyPrefix: 'test:',
      defaultTTL: 300,
      maxRetries: 3
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('get', () => {
    it('should retrieve value from cache', async () => {
      const testData = { id: 1, name: 'Test' };
      mockRedis.get.mockResolvedValue(JSON.stringify(testData));

      const result = await cacheService.get('test-key');

      expect(result).toEqual(testData);
      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null for missing key', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await cacheService.get('missing-key');

      expect(result).toBeNull();
    });

    it('should handle JSON parsing errors', async () => {
      mockRedis.get.mockResolvedValue('invalid json');

      const result = await cacheService.get('bad-key');

      expect(result).toBeNull();
    });

    it('should track cache hits', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ data: 'test' }));

      await cacheService.get('key1');
      await cacheService.get('key2');

      const stats = cacheService.getStats();
      expect(stats.hits).toBe(2);
    });

    it('should track cache misses', async () => {
      mockRedis.get.mockResolvedValue(null);

      await cacheService.get('key1');
      await cacheService.get('key2');

      const stats = cacheService.getStats();
      expect(stats.misses).toBe(2);
    });

    it('should calculate hit rate', async () => {
      mockRedis.get
        .mockResolvedValueOnce(JSON.stringify({ data: 'test' }))
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(JSON.stringify({ data: 'test' }));

      await cacheService.get('key1');
      await cacheService.get('key2');
      await cacheService.get('key3');

      const stats = cacheService.getStats();
      expect(stats.hitRate).toBe(66.66666666666666);
    });
  });

  describe('set', () => {
    it('should store value in cache with default TTL', async () => {
      const testData = { id: 1, name: 'Test' };
      mockRedis.setex.mockResolvedValue('OK');

      await cacheService.set('test-key', testData);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'test-key',
        300,
        JSON.stringify(testData)
      );
    });

    it('should store value with custom TTL', async () => {
      const testData = { id: 1, name: 'Test' };
      mockRedis.setex.mockResolvedValue('OK');

      await cacheService.set('test-key', testData, 600);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'test-key',
        600,
        JSON.stringify(testData)
      );
    });

    it('should handle serialization errors', async () => {
      const circularObj: any = { a: 1 };
      circularObj.self = circularObj;

      // Should not throw
      await cacheService.set('circular-key', circularObj);
    });
  });

  describe('delete', () => {
    it('should delete key from cache', async () => {
      mockRedis.del.mockResolvedValue(1);

      const result = await cacheService.delete('test-key');

      expect(result).toBe(true);
      expect(mockRedis.del).toHaveBeenCalledWith('test-key');
    });

    it('should return false if key does not exist', async () => {
      mockRedis.del.mockResolvedValue(0);

      const result = await cacheService.delete('missing-key');

      expect(result).toBe(false);
    });
  });

  describe('deletePattern', () => {
    it('should delete keys matching pattern', async () => {
      mockRedis.keys.mockResolvedValue(['key1', 'key2', 'key3']);
      mockRedis.del.mockResolvedValue(3);

      const result = await cacheService.deletePattern('key*');

      expect(result).toBe(3);
      expect(mockRedis.keys).toHaveBeenCalledWith('key*');
      expect(mockRedis.del).toHaveBeenCalledWith('key1', 'key2', 'key3');
    });

    it('should return 0 if no keys match pattern', async () => {
      mockRedis.keys.mockResolvedValue([]);

      const result = await cacheService.deletePattern('nonexistent*');

      expect(result).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear all cache', async () => {
      mockRedis.flushdb.mockResolvedValue('OK');

      await cacheService.clear();

      expect(mockRedis.flushdb).toHaveBeenCalled();
    });
  });

  describe('getOrSet', () => {
    it('should return cached value if exists', async () => {
      const testData = { id: 1, name: 'Test' };
      mockRedis.get.mockResolvedValue(JSON.stringify(testData));
      const fn = vi.fn();

      const result = await cacheService.getOrSet('test-key', fn);

      expect(result).toEqual(testData);
      expect(fn).not.toHaveBeenCalled();
    });

    it('should compute and cache value if not exists', async () => {
      const testData = { id: 1, name: 'Test' };
      mockRedis.get.mockResolvedValue(null);
      mockRedis.setex.mockResolvedValue('OK');
      const fn = vi.fn().mockResolvedValue(testData);

      const result = await cacheService.getOrSet('test-key', fn);

      expect(result).toEqual(testData);
      expect(fn).toHaveBeenCalled();
      expect(mockRedis.setex).toHaveBeenCalled();
    });

    it('should use custom TTL', async () => {
      const testData = { id: 1, name: 'Test' };
      mockRedis.get.mockResolvedValue(null);
      mockRedis.setex.mockResolvedValue('OK');
      const fn = vi.fn().mockResolvedValue(testData);

      await cacheService.getOrSet('test-key', fn, 600);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'test-key',
        600,
        JSON.stringify(testData)
      );
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      mockRedis.get
        .mockResolvedValueOnce(JSON.stringify({ data: 'test' }))
        .mockResolvedValueOnce(null);

      await cacheService.get('key1');
      await cacheService.get('key2');

      const stats = cacheService.getStats();

      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(50);
      expect(stats.averageResponseTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle zero requests', () => {
      const stats = cacheService.getStats();

      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(0);
      expect(stats.averageResponseTime).toBe(0);
    });
  });

  describe('resetStats', () => {
    it('should reset statistics', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ data: 'test' }));

      await cacheService.get('key1');
      cacheService.resetStats();

      const stats = cacheService.getStats();

      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('isConnected', () => {
    it('should return connection status', () => {
      const isConnected = cacheService.isConnected();
      expect(typeof isConnected).toBe('boolean');
    });
  });

  describe('close', () => {
    it('should close Redis connection', async () => {
      mockRedis.quit.mockResolvedValue('OK');

      await cacheService.close();

      expect(mockRedis.quit).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle Redis errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      const result = await cacheService.get('test-key');

      expect(result).toBeNull();
    });

    it('should handle set errors gracefully', async () => {
      mockRedis.setex.mockRejectedValue(new Error('Redis error'));

      // Should not throw
      await cacheService.set('test-key', { data: 'test' });
    });

    it('should handle delete errors gracefully', async () => {
      mockRedis.del.mockRejectedValue(new Error('Redis error'));

      const result = await cacheService.delete('test-key');

      expect(result).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should track response times', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ data: 'test' }));

      await cacheService.get('key1');
      await cacheService.get('key2');

      const stats = cacheService.getStats();

      expect(stats.averageResponseTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle concurrent requests', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify({ data: 'test' }));

      const promises = Array(10)
        .fill(null)
        .map((_, i) => cacheService.get(`key${i}`));

      await Promise.all(promises);

      const stats = cacheService.getStats();
      expect(stats.hits).toBe(10);
    });
  });
});
