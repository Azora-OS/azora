/**
 * Cache Service
 * Provides Redis-based caching for courses, progress, analytics, and sessions
 * Implements TTL management, cache invalidation, and monitoring
 */

import Redis from 'ioredis';
import { logger } from '../utils/logger';

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix: string;
  defaultTTL: number;
  maxRetries: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
  averageResponseTime: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Cache Service
 * Manages all caching operations with TTL, invalidation, and monitoring
 */
export class CacheService {
  private redis: Redis;
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    totalResponseTime: 0,
    requestCount: 0
  };

  constructor(config: CacheConfig) {
    this.config = config;
    this.redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db || 0,
      keyPrefix: config.keyPrefix,
      maxRetriesPerRequest: config.maxRetries,
      enableReadyCheck: true,
      enableOfflineQueue: true,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.setupEventHandlers();
  }

  /**
   * Setup Redis event handlers
   */
  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      logger.info('Cache service connected to Redis');
    });

    this.redis.on('error', (err) => {
      logger.error('Cache service Redis error:', err);
    });

    this.redis.on('reconnecting', () => {
      logger.warn('Cache service reconnecting to Redis');
    });
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();
    try {
      const data = await this.redis.get(key);
      const responseTime = Date.now() - startTime;

      if (!data) {
        this.stats.misses++;
        this.stats.totalResponseTime += responseTime;
        this.stats.requestCount++;
        return null;
      }

      this.stats.hits++;
      this.stats.totalResponseTime += responseTime;
      this.stats.requestCount++;

      return JSON.parse(data) as T;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set<T>(key: string, value: T, ttl: number = this.config.defaultTTL): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(key, ttl, serialized);
      logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.redis.del(key);
      logger.debug(`Cache deleted: ${key}`);
      return result > 0;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) {return 0;}

      const result = await this.redis.del(...keys);
      logger.debug(`Cache deleted ${result} keys matching pattern: ${pattern}`);
      return result;
    } catch (error) {
      logger.error(`Cache delete pattern error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      await this.redis.flushdb();
      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Cache clear error:', error);
    }
  }

  /**
   * Get or set value (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = this.config.defaultTTL
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - compute value
    const value = await fn();

    // Store in cache
    await this.set(key, value, ttl);

    return value;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    const averageResponseTime = this.stats.requestCount > 0 
      ? this.stats.totalResponseTime / this.stats.requestCount 
      : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: 0, // Would need to calculate from Redis
      hitRate,
      averageResponseTime
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      totalResponseTime: 0,
      requestCount: 0
    };
  }

  /**
   * Check if Redis is connected
   */
  isConnected(): boolean {
    return this.redis.status === 'ready';
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
    logger.info('Cache service disconnected');
  }
}

// Singleton instance
let cacheService: CacheService | null = null;

/**
 * Initialize cache service
 */
export function initializeCacheService(config: CacheConfig): CacheService {
  if (!cacheService) {
    cacheService = new CacheService(config);
  }
  return cacheService;
}

/**
 * Get cache service instance
 */
export function getCacheService(): CacheService {
  if (!cacheService) {
    throw new Error('Cache service not initialized. Call initializeCacheService first.');
  }
  return cacheService;
}
