/**
 * Redis Caching Strategy
 * Ubuntu Philosophy: "My security ensures our freedom"
 */

import Redis from 'ioredis';
import { getLogger } from '../monitoring/logger';
import { metrics } from '../monitoring/metrics';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
  compress?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}

export class RedisCache {
  private redis: Redis;
  private logger = getLogger('redis-cache');
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0
  };

  constructor(redisConfig: any) {
    this.redis = new Redis(redisConfig);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      this.logger.info('Redis connected');
      metrics.incrementCounter('redis_connections_total', 1, { status: 'connected' });
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error', { error });
      metrics.incrementCounter('redis_errors_total', 1, { type: 'connection' });
    });

    this.redis.on('close', () => {
      this.logger.warn('Redis connection closed');
      metrics.incrementCounter('redis_connections_total', 1, { status: 'disconnected' });
    });
  }

  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key, options.prefix);
      const value = await this.redis.get(fullKey);
      
      if (value === null) {
        this.stats.misses++;
        metrics.incrementCounter('cache_operations_total', 1, { operation: 'miss' });
        return null;
      }

      this.stats.hits++;
      metrics.incrementCounter('cache_operations_total', 1, { operation: 'hit' });
      
      const parsed = JSON.parse(value);
      this.logger.debug('Cache hit', { key: fullKey });
      
      return parsed;
    } catch (error) {
      this.logger.error('Cache get error', { key, error });
      metrics.incrementCounter('cache_errors_total', 1, { operation: 'get' });
      return null;
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      const fullKey = this.buildKey(key, options.prefix);
      const serialized = JSON.stringify(value);
      
      if (options.ttl) {
        await this.redis.setex(fullKey, options.ttl, serialized);
      } else {
        await this.redis.set(fullKey, serialized);
      }
      
      this.stats.sets++;
      metrics.incrementCounter('cache_operations_total', 1, { operation: 'set' });
      metrics.incrementCounter('cache_size_bytes', serialized.length);
      
      this.logger.debug('Cache set', { key: fullKey, ttl: options.ttl });
    } catch (error) {
      this.logger.error('Cache set error', { key, error });
      metrics.incrementCounter('cache_errors_total', 1, { operation: 'set' });
      throw error;
    }
  }

  async del(key: string, options: CacheOptions = {}): Promise<void> {
    try {
      const fullKey = this.buildKey(key, options.prefix);
      await this.redis.del(fullKey);
      
      this.stats.deletes++;
      metrics.incrementCounter('cache_operations_total', 1, { operation: 'delete' });
      
      this.logger.debug('Cache delete', { key: fullKey });
    } catch (error) {
      this.logger.error('Cache delete error', { key, error });
      metrics.incrementCounter('cache_errors_total', 1, { operation: 'delete' });
      throw error;
    }
  }

  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options.prefix);
      const result = await this.redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      this.logger.error('Cache exists error', { key, error });
      return false;
    }
  }

  async increment(key: string, amount = 1, options: CacheOptions = {}): Promise<number> {
    try {
      const fullKey = this.buildKey(key, options.prefix);
      const result = await this.redis.incrby(fullKey, amount);
      
      if (options.ttl) {
        await this.redis.expire(fullKey, options.ttl);
      }
      
      metrics.incrementCounter('cache_operations_total', 1, { operation: 'increment' });
      return result;
    } catch (error) {
      this.logger.error('Cache increment error', { key, error });
      throw error;
    }
  }

  async getMultiple<T>(keys: string[], options: CacheOptions = {}): Promise<Map<string, T | null>> {
    try {
      const fullKeys = keys.map(key => this.buildKey(key, options.prefix));
      const values = await this.redis.mget(...fullKeys);
      
      const result = new Map<string, T | null>();
      
      keys.forEach((key, index) => {
        const value = values[index];
        if (value === null) {
          this.stats.misses++;
          result.set(key, null);
        } else {
          this.stats.hits++;
          result.set(key, JSON.parse(value));
        }
      });
      
      metrics.incrementCounter('cache_operations_total', keys.length, { operation: 'mget' });
      return result;
    } catch (error) {
      this.logger.error('Cache mget error', { keys, error });
      throw error;
    }
  }

  async setMultiple<T>(entries: Map<string, T>, options: CacheOptions = {}): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();
      
      for (const [key, value] of entries) {
        const fullKey = this.buildKey(key, options.prefix);
        const serialized = JSON.stringify(value);
        
        if (options.ttl) {
          pipeline.setex(fullKey, options.ttl, serialized);
        } else {
          pipeline.set(fullKey, serialized);
        }
      }
      
      await pipeline.exec();
      
      this.stats.sets += entries.size;
      metrics.incrementCounter('cache_operations_total', entries.size, { operation: 'mset' });
      
      this.logger.debug('Cache mset', { count: entries.size });
    } catch (error) {
      this.logger.error('Cache mset error', { error });
      throw error;
    }
  }

  async clearPattern(pattern: string, options: CacheOptions = {}): Promise<number> {
    try {
      const fullPattern = this.buildKey(pattern, options.prefix);
      const keys = await this.redis.keys(fullPattern);
      
      if (keys.length === 0) {
        return 0;
      }
      
      await this.redis.del(...keys);
      
      this.stats.deletes += keys.length;
      metrics.incrementCounter('cache_operations_total', keys.length, { operation: 'clear_pattern' });
      
      this.logger.info('Cache pattern cleared', { pattern: fullPattern, count: keys.length });
      return keys.length;
    } catch (error) {
      this.logger.error('Cache clear pattern error', { pattern, error });
      throw error;
    }
  }

  async getTtl(key: string, options: CacheOptions = {}): Promise<number> {
    try {
      const fullKey = this.buildKey(key, options.prefix);
      return await this.redis.ttl(fullKey);
    } catch (error) {
      this.logger.error('Cache TTL error', { key, error });
      return -1;
    }
  }

  async expire(key: string, ttl: number, options: CacheOptions = {}): Promise<void> {
    try {
      const fullKey = this.buildKey(key, options.prefix);
      await this.redis.expire(fullKey, ttl);
    } catch (error) {
      this.logger.error('Cache expire error', { key, ttl, error });
      throw error;
    }
  }

  private buildKey(key: string, prefix?: string): string {
    const basePrefix = prefix || 'azora';
    return `${basePrefix}:${key}`;
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  async disconnect(): Promise<void> {
    await this.redis.disconnect();
    this.logger.info('Redis disconnected');
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Redis health check failed', { error });
      return false;
    }
  }
}

// Cache decorators for methods
export function cached(options: CacheOptions = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const cache = new RedisCache({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    });

    descriptor.value = async function (...args: any[]) {
      const key = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cached = await cache.get(key, options);
      if (cached !== null) {
        return cached;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      await cache.set(key, result, options);
      
      return result;
    };
  };
}

// Singleton instance
let redisCacheInstance: RedisCache | null = null;

export function getRedisCache(): RedisCache {
  if (!redisCacheInstance) {
    redisCacheInstance = new RedisCache({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });
  }
  return redisCacheInstance;
}

export default RedisCache;
