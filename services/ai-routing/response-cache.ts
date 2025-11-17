/**
 * Response Cache Service for AI Routing
 * Implements get/set operations, TTL management, and cache invalidation
 */

import Redis from 'ioredis';
import { CacheEntry, RoutingTier } from './types';
import { getRedisConnectionManager } from './redis-connection';

export interface CacheServiceConfig {
  keyPrefix: string;
  defaultTTL: number;
  maxCacheSize: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
  averageResponseTime: number;
}

export class ResponseCache {
  private redis: Redis | Redis.Cluster;
  private config: CacheServiceConfig;

  constructor(config: Partial<CacheServiceConfig> = {}) {
    const manager = getRedisConnectionManager();
    this.redis = manager.getInstance();

    this.config = {
      keyPrefix: 'ai-routing:cache:',
      defaultTTL: 3600,
      maxCacheSize: 100000,
      ...config
    };
  }

  /**
   * Generate cache key
   */
  private getCacheKey(queryHash: string): string {
    return `${this.config.keyPrefix}${queryHash}`;
  }

  /**
   * Get stats key
   */
  private getStatsKey(): string {
    return `${this.config.keyPrefix}stats`;
  }

  /**
   * Get cache entry by query hash
   */
  async get(queryHash: string): Promise<CacheEntry | null> {
    try {
      const key = this.getCacheKey(queryHash);
      const data = await this.redis.get(key);

      if (!data) {
        await this.redis.hincrby(this.getStatsKey(), 'misses', 1);
        return null;
      }

      await this.redis.hincrby(this.getStatsKey(), 'hits', 1);
      const entry = JSON.parse(data) as CacheEntry;

      entry.hitCount += 1;
      const ttl = entry.ttl || this.config.defaultTTL;
      await this.redis.expire(key, ttl);

      return entry;
    } catch (error) {
      console.error('Error retrieving from cache:', error);
      return null;
    }
  }

  /**
   * Store cache entry
   */
  async set(entry: CacheEntry): Promise<void> {
    try {
      const currentSize = await this.getCacheSize();
      if (currentSize >= this.config.maxCacheSize) {
        await this.evictOldest();
      }

      const key = this.getCacheKey(entry.queryHash);
      const ttl = entry.ttl || this.config.defaultTTL;

      await this.redis.set(
        key,
        JSON.stringify(entry),
        'EX',
        ttl
      );

      await this.redis.hincrby(this.getStatsKey(), 'size', 1);
    } catch (error) {
      console.error('Error storing in cache:', error);
    }
  }

  /**
   * Delete cache entry
   */
  async delete(queryHash: string): Promise<boolean> {
    try {
      const key = this.getCacheKey(queryHash);
      const deleted = await this.redis.del(key);

      if (deleted > 0) {
        await this.redis.hincrby(this.getStatsKey(), 'size', -1);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error deleting from cache:', error);
      return false;
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<number> {
    try {
      const pattern = `${this.config.keyPrefix}*`;
      const keys = await this.redis.keys(pattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
      }

      await this.redis.del(this.getStatsKey());
      return keys.length;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return 0;
    }
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidate(pattern: string): Promise<number> {
    try {
      const fullPattern = `${this.config.keyPrefix}${pattern}`;
      const keys = await this.redis.keys(fullPattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
        await this.redis.hincrby(this.getStatsKey(), 'size', -keys.length);
      }

      return keys.length;
    } catch (error) {
      console.error('Error invalidating cache:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      const redisStats = await this.redis.hgetall(this.getStatsKey());
      const hits = parseInt(redisStats.hits || '0', 10);
      const misses = parseInt(redisStats.misses || '0', 10);
      const size = parseInt(redisStats.size || '0', 10);
      const totalResponseTime = parseInt(redisStats.totalResponseTime || '0', 10);
      const requestCount = parseInt(redisStats.requestCount || '0', 10);

      const total = hits + misses;
      const hitRate = total > 0 ? (hits / total) * 100 : 0;
      const averageResponseTime = requestCount > 0 ? totalResponseTime / requestCount : 0;

      return {
        hits,
        misses,
        size,
        hitRate,
        averageResponseTime
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        hits: 0,
        misses: 0,
        size: 0,
        hitRate: 0,
        averageResponseTime: 0
      };
    }
  }

  /**
   * Get cache hit rate
   */
  async getCacheHitRate(): Promise<number> {
    const stats = await this.getStats();
    return stats.hitRate;
  }

  /**
   * Get current cache size
   */
  async getCacheSize(): Promise<number> {
    try {
      const pattern = `${this.config.keyPrefix}*`;
      const keys = await this.redis.keys(pattern);
      return keys.length;
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  }

  /**
   * Evict oldest entries when cache is full
   */
  private async evictOldest(): Promise<void> {
    try {
      const pattern = `${this.config.keyPrefix}*`;
      const keys = await this.redis.keys(pattern);

      if (keys.length === 0) return;

      let oldestKey = keys[0];
      let minTTL = await this.redis.ttl(oldestKey);

      for (const key of keys.slice(1)) {
        const ttl = await this.redis.ttl(key);
        if (ttl < minTTL) {
          minTTL = ttl;
          oldestKey = key;
        }
      }

      await this.redis.del(oldestKey);
      await this.redis.hincrby(this.getStatsKey(), 'size', -1);
    } catch (error) {
      console.error('Error evicting oldest cache entry:', error);
    }
  }

  /**
   * Cleanup expired entries
   */
  async cleanup(): Promise<number> {
    try {
      const pattern = `${this.config.keyPrefix}*`;
      const keys = await this.redis.keys(pattern);
      let cleaned = 0;

      for (const key of keys) {
        const ttl = await this.redis.ttl(key);
        if (ttl === -1) {
          await this.redis.del(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        await this.redis.hincrby(this.getStatsKey(), 'size', -cleaned);
      }

      return cleaned;
    } catch (error) {
      console.error('Error during cache cleanup:', error);
      return 0;
    }
  }

  /**
   * Export cache metrics
   */
  async exportMetrics(): Promise<Record<string, any>> {
    const stats = await this.getStats();
    const size = await this.getCacheSize();

    return {
      timestamp: new Date().toISOString(),
      cache: {
        hits: stats.hits,
        misses: stats.misses,
        hitRate: stats.hitRate.toFixed(2) + '%',
        size,
        averageResponseTime: stats.averageResponseTime.toFixed(2) + 'ms'
      }
    };
  }
}

let cacheService: ResponseCache | null = null;

/**
 * Get or create response cache service
 */
export function getResponseCache(config?: Partial<CacheServiceConfig>): ResponseCache {
  if (!cacheService) {
    cacheService = new ResponseCache(config);
  }
  return cacheService;
}
