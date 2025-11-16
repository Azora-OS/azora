/**
 * Redis Cache Manager for AI Routing
 * Manages caching of routing decisions and responses
 */

import Redis from 'ioredis';
import { createHash } from 'crypto';
import { CacheEntry, ICacheManager, RoutingTier } from './types';

export class RedisCacheManager implements ICacheManager {
  private redis: Redis;
  private keyPrefix: string;
  private defaultTTL: number; // seconds

  constructor(redisUrl: string = 'redis://localhost:6379', keyPrefix: string = 'ai-routing:', defaultTTL: number = 3600) {
    this.redis = new Redis(redisUrl);
    this.keyPrefix = keyPrefix;
    this.defaultTTL = defaultTTL;
  }

  /**
   * Generate hash for query to use as cache key
   */
  private generateQueryHash(query: string): string {
    return createHash('sha256').update(query).digest('hex');
  }

  /**
   * Get cache key with prefix
   */
  private getCacheKey(queryHash: string): string {
    return `${this.keyPrefix}cache:${queryHash}`;
  }

  /**
   * Get stats key
   */
  private getStatsKey(): string {
    return `${this.keyPrefix}stats`;
  }

  /**
   * Retrieve cached entry by query hash
   */
  async get(queryHash: string): Promise<CacheEntry | null> {
    try {
      const key = this.getCacheKey(queryHash);
      const data = await this.redis.get(key);

      if (!data) {
        // Record cache miss
        await this.redis.hincrby(this.getStatsKey(), 'misses', 1);
        return null;
      }

      // Record cache hit
      await this.redis.hincrby(this.getStatsKey(), 'hits', 1);

      // Increment hit count
      const entry = JSON.parse(data) as CacheEntry;
      entry.hitCount += 1;
      await this.redis.set(key, JSON.stringify(entry), 'EX', entry.ttl);

      return entry;
    } catch (error) {
      console.error('Error retrieving from cache:', error);
      return null;
    }
  }

  /**
   * Store entry in cache
   */
  async set(entry: CacheEntry): Promise<void> {
    try {
      const key = this.getCacheKey(entry.queryHash);
      const ttl = entry.ttl || this.defaultTTL;

      await this.redis.set(
        key,
        JSON.stringify(entry),
        'EX',
        ttl
      );

      // Update cache size
      await this.redis.hincrby(this.getStatsKey(), 'size', 1);
    } catch (error) {
      console.error('Error storing in cache:', error);
    }
  }

  /**
   * Delete entry from cache
   */
  async delete(queryHash: string): Promise<void> {
    try {
      const key = this.getCacheKey(queryHash);
      const deleted = await this.redis.del(key);

      if (deleted > 0) {
        await this.redis.hincrby(this.getStatsKey(), 'size', -1);
      }
    } catch (error) {
      console.error('Error deleting from cache:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      const pattern = `${this.keyPrefix}cache:*`;
      const keys = await this.redis.keys(pattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
      }

      // Reset stats
      await this.redis.del(this.getStatsKey());
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ hits: number; misses: number; size: number }> {
    try {
      const stats = await this.redis.hgetall(this.getStatsKey());

      return {
        hits: parseInt(stats.hits || '0', 10),
        misses: parseInt(stats.misses || '0', 10),
        size: parseInt(stats.size || '0', 10)
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { hits: 0, misses: 0, size: 0 };
    }
  }

  /**
   * Store routing decision in cache
   */
  async cacheRoutingDecision(
    query: string,
    response: string,
    tier: RoutingTier,
    cost: number,
    ttl?: number
  ): Promise<string> {
    const queryHash = this.generateQueryHash(query);
    const entry: CacheEntry = {
      id: `cache-${Date.now()}`,
      queryHash,
      query,
      response,
      routingTier: tier,
      cost,
      ttl: ttl || this.defaultTTL,
      expiresAt: new Date(Date.now() + (ttl || this.defaultTTL) * 1000),
      hitCount: 0
    };

    await this.set(entry);
    return queryHash;
  }

  /**
   * Get cache hit rate
   */
  async getCacheHitRate(): Promise<number> {
    try {
      const stats = await this.getStats();
      const total = stats.hits + stats.misses;

      if (total === 0) return 0;
      return (stats.hits / total) * 100;
    } catch (error) {
      console.error('Error calculating cache hit rate:', error);
      return 0;
    }
  }

  /**
   * Cleanup expired entries (optional maintenance)
   */
  async cleanup(): Promise<number> {
    try {
      const pattern = `${this.keyPrefix}cache:*`;
      const keys = await this.redis.keys(pattern);
      let cleaned = 0;

      for (const key of keys) {
        const ttl = await this.redis.ttl(key);
        if (ttl === -1) {
          // Key has no expiration, delete it
          await this.redis.del(key);
          cleaned++;
        }
      }

      return cleaned;
    } catch (error) {
      console.error('Error during cache cleanup:', error);
      return 0;
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    try {
      await this.redis.quit();
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    }
  }
}
