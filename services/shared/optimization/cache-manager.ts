import Redis from 'ioredis';
import winston from 'winston';

const logger = winston.createLogger({
  defaultMeta: { service: 'cache-manager' },
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${timestamp} [CACHE] ${level}: ${message} ${metaStr}`;
        })
      ),
    }),
  ],
});

/**
 * Cache Manager for Redis-based caching
 * Implements caching strategies to reduce database queries and API latency
 */
export class CacheManager {
  private redis: Redis;
  private defaultTTL: number = 300; // 5 minutes default

  constructor(redisUrl?: string) {
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379');
    
    this.redis.on('error', (err) => {
      logger.error('Redis connection error', { error: err.message });
    });

    this.redis.on('connect', () => {
      logger.info('Redis connected');
    });
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (value) {
        logger.debug('Cache hit', { key });
        return JSON.parse(value);
      }
      logger.debug('Cache miss', { key });
      return null;
    } catch (error) {
      logger.error('Cache get error', { key, error: (error as Error).message });
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl: number = this.defaultTTL): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
      logger.debug('Cache set', { key, ttl });
    } catch (error) {
      logger.error('Cache set error', { key, error: (error as Error).message });
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      logger.debug('Cache delete', { key });
    } catch (error) {
      logger.error('Cache delete error', { key, error: (error as Error).message });
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
      logger.error('Cache clear error', { error: (error as Error).message });
    }
  }

  /**
   * Get or set cache (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached) {
      return cached;
    }

    // Fetch from source
    const value = await fetchFn();

    // Store in cache
    await this.set(key, value, ttl);

    return value;
  }

  /**
   * Invalidate cache pattern (e.g., "courses:*")
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.info('Cache pattern invalidated', { pattern, count: keys.length });
      }
    } catch (error) {
      logger.error('Cache pattern invalidation error', { pattern, error: (error as Error).message });
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    try {
      const info = await this.redis.info('stats');
      const dbSize = await this.redis.dbsize();
      return {
        info,
        dbSize,
        status: 'connected'
      };
    } catch (error) {
      logger.error('Cache stats error', { error: (error as Error).message });
      return { status: 'error', error: (error as Error).message };
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
    logger.info('Redis connection closed');
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

/**
 * Cache key generators for common entities
 */
export const cacheKeys = {
  course: (id: string) => `courses:${id}`,
  courseList: (page: number, limit: number) => `courses:list:${page}:${limit}`,
  coursesByCategory: (category: string, page: number) => `courses:category:${category}:${page}`,
  userProfile: (userId: string) => `users:${userId}:profile`,
  walletBalance: (userId: string) => `wallet:${userId}:balance`,
  walletTransactions: (userId: string, page: number) => `wallet:${userId}:transactions:${page}`,
  jobList: (page: number, limit: number) => `jobs:list:${page}:${limit}`,
  jobsByCategory: (category: string, page: number) => `jobs:category:${category}:${page}`,
  jobDetail: (id: string) => `jobs:${id}`,
};

/**
 * Cache TTL configurations
 */
export const cacheTTL = {
  SHORT: 60,        // 1 minute - for frequently changing data
  MEDIUM: 300,      // 5 minutes - for moderately changing data
  LONG: 3600,       // 1 hour - for stable data
  VERY_LONG: 86400, // 24 hours - for rarely changing data
};
