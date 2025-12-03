/**
 * Cache Middleware
 * Provides automatic caching for GET requests
 */

import { Request, Response, NextFunction } from 'express';
import { getCacheService } from '../services/cache.service';
import { logger } from '../utils/logger';

export interface CacheOptions {
  ttl?: number;
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
}

/**
 * Generate cache key from request
 */
function generateCacheKey(req: Request): string {
  const { method, path, query } = req;
  const queryString = Object.keys(query)
    .sort()
    .map(key => `${key}=${query[key]}`)
    .join('&');
  return `${method}:${path}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Cache middleware for GET requests
 */
export function cacheMiddleware(options: CacheOptions = {}) {
  const {
    ttl = 5 * 60, // 5 minutes default
    keyGenerator = generateCacheKey,
    condition = (req) => req.method === 'GET'
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests by default
    if (!condition(req)) {
      return next();
    }

    const cacheService = getCacheService();
    const cacheKey = keyGenerator(req);

    try {
      // Try to get from cache
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.debug(`Cache hit: ${cacheKey}`);
        return res.json(cached);
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = function(data: any) {
        // Cache the response
        cacheService.set(cacheKey, data, ttl).catch(err => {
          logger.error(`Failed to cache response for ${cacheKey}:`, err);
        });

        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error(`Cache middleware error for ${cacheKey}:`, error);
      next();
    }
  };
}

/**
 * Cache invalidation middleware
 * Invalidates cache for POST, PUT, DELETE requests
 */
export function cacheInvalidationMiddleware(
  getInvalidationKeys: (req: Request) => string[]
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only invalidate for mutation requests
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      return next();
    }

    const cacheService = getCacheService();
    const keysToInvalidate = getInvalidationKeys(req);

    try {
      for (const pattern of keysToInvalidate) {
        if (pattern.includes('*')) {
          // Pattern-based invalidation
          await cacheService.deletePattern(pattern);
        } else {
          // Exact key invalidation
          await cacheService.delete(pattern);
        }
      }

      logger.debug(`Cache invalidated: ${keysToInvalidate.join(', ')}`);
    } catch (error) {
      logger.error('Cache invalidation error:', error);
    }

    next();
  };
}

/**
 * Decorator for caching service methods
 */
export function Cacheable(ttl: number = 5 * 60) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const cacheService = getCacheService();
      const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;

      try {
        // Try to get from cache
        const cached = await cacheService.get(cacheKey);
        if (cached !== null) {
          logger.debug(`Cache hit: ${cacheKey}`);
          return cached;
        }

        // Cache miss - call original method
        const result = await originalMethod.apply(this, args);

        // Store in cache
        await cacheService.set(cacheKey, result, ttl);

        return result;
      } catch (error) {
        logger.error(`Cacheable decorator error for ${cacheKey}:`, error);
        // Fall back to original method on cache error
        return originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}

/**
 * Decorator for cache invalidation
 */
export function InvalidateCache(
  getInvalidationKeys: (args: any[]) => string[]
) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const cacheService = getCacheService();
      const keysToInvalidate = getInvalidationKeys(args);

      try {
        // Call original method first
        const result = await originalMethod.apply(this, args);

        // Then invalidate cache
        for (const pattern of keysToInvalidate) {
          if (pattern.includes('*')) {
            await cacheService.deletePattern(pattern);
          } else {
            await cacheService.delete(pattern);
          }
        }

        logger.debug(`Cache invalidated: ${keysToInvalidate.join(', ')}`);

        return result;
      } catch (error) {
        logger.error(`InvalidateCache decorator error:`, error);
        throw error;
      }
    };

    return descriptor;
  };
}
