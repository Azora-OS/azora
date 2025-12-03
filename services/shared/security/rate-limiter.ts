/**
 * Advanced Rate Limiting and DDoS Protection
 * Ubuntu Philosophy: "My security ensures our freedom"
 */

import Redis from 'ioredis';
import { Request, Response, NextFunction } from 'express';
import { metrics } from '../monitoring/metrics';

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  handler?: (req: Request, res: Response) => void;
  onLimitReached?: (req: Request, res: Response) => void;
}

export interface DDoSProtectionConfig {
  enabled: boolean;
  threshold: number;
  windowMs: number;
  banDurationMs: number;
  whitelist: string[];
  blacklist: string[];
}

export class RateLimiter {
  private redis: Redis;
  private config: RateLimitConfig;
  private ddosConfig: DDoSProtectionConfig;

  constructor(redis: Redis, config: RateLimitConfig, ddosConfig: DDoSProtectionConfig) {
    this.redis = redis;
    this.config = config;
    this.ddosConfig = ddosConfig;
  }

  public middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = this.getKey(req);
        const now = Date.now();
        const windowStart = now - this.config.windowMs;

        // Check DDoS protection first
        if (this.ddosConfig.enabled && await this.isBanned(req)) {
          this.handleDDoS(req, res);
          return;
        }

        // Check rate limit
        const requests = await this.getRequests(key, windowStart, now);
        
        if (requests.length >= this.config.max) {
          await this.handleRateLimit(req, res, key, requests);
          return;
        }

        // Add current request
        await this.addRequest(key, now);
        
        // Track metrics
        metrics.incrementCounter('rate_limit_requests_total', 1, {
          endpoint: req.path,
          method: req.method,
          status: 'allowed'
        });

        next();
      } catch (error) {
        console.error('Rate limiter error:', error);
        // Fail open - allow request if rate limiter fails
        next();
      }
    };
  }

  private getKey(req: Request): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(req);
    }
    
    // Default key: IP + endpoint
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return `rate_limit:${ip}:${req.path}`;
  }

  private async getRequests(key: string, windowStart: number, windowEnd: number): Promise<number[]> {
    try {
      // Remove old requests
      await this.redis.zremrangebyscore(key, 0, windowStart);
      
      // Get current requests
      const requests = await this.redis.zrangebyscore(key, windowStart, windowEnd);
      return requests.map(Number);
    } catch (error) {
      console.error('Redis error getting requests:', error);
      return [];
    }
  }

  private async addRequest(key: string, timestamp: number): Promise<void> {
    try {
      await this.redis.zadd(key, timestamp, timestamp);
      await this.redis.expire(key, Math.ceil(this.config.windowMs / 1000));
    } catch (error) {
      console.error('Redis error adding request:', error);
    }
  }

  private async handleRateLimit(req: Request, res: Response, key: string, requests: number[]): Promise<void> {
    // Track metrics
    metrics.incrementCounter('rate_limit_requests_total', 1, {
      endpoint: req.path,
      method: req.method,
      status: 'blocked'
    });

    // Check for DDoS pattern
    if (this.ddosConfig.enabled && await this.detectDDoS(req, requests)) {
      await this.banIP(req);
      this.handleDDoS(req, res);
      return;
    }

    // Standard rate limit exceeded
    if (this.config.onLimitReached) {
      this.config.onLimitReached(req, res);
    } else {
      res.status(429).json({
        error: 'Too many requests',
        ubuntu: 'My security ensures our freedom - Please respect rate limits',
        retryAfter: Math.ceil(this.config.windowMs / 1000),
        limit: this.config.max,
        windowMs: this.config.windowMs
      });
    }
  }

  private async detectDDoS(req: Request, requests: number[]): Promise<boolean> {
    const requestRate = requests.length / (this.config.windowMs / 1000);
    return requestRate > this.ddosConfig.threshold;
  }

  private async isBanned(req: Request): Promise<boolean> {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const banKey = `banned:${ip}`;
    
    try {
      const banned = await this.redis.exists(banKey);
      return banned === 1;
    } catch (error) {
      console.error('Redis error checking ban:', error);
      return false;
    }
  }

  private async banIP(req: Request): Promise<void> {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const banKey = `banned:${ip}`;
    
    try {
      await this.redis.setex(banKey, Math.ceil(this.ddosConfig.banDurationMs / 1000), '1');
      
      // Track DDoS event
      metrics.incrementCounter('ddos_events_total', 1, {
        ip,
        endpoint: req.path,
        ubuntu: 'DDoS protection activated'
      });
    } catch (error) {
      console.error('Redis error banning IP:', error);
    }
  }

  private handleDDoS(req: Request, res: Response): void {
    metrics.incrementCounter('ddos_blocks_total', 1, {
      ip: req.ip || 'unknown',
      endpoint: req.path
    });

    res.status(403).json({
      error: 'Access denied',
      ubuntu: 'My security ensures our freedom - DDoS protection active',
      banned: true,
      duration: this.ddosConfig.banDurationMs
    });
  }

  public async clearBan(ip: string): Promise<void> {
    const banKey = `banned:${ip}`;
    await this.redis.del(banKey);
  }

  public async getStats(): Promise<any> {
    try {
      const bannedKeys = await this.redis.keys('banned:*');
      const rateLimitKeys = await this.redis.keys('rate_limit:*');
      
      return {
        bannedIPs: bannedKeys.length,
        activeRateLimits: rateLimitKeys.length,
        ubuntu: 'My security ensures our freedom'
      };
    } catch (error) {
      console.error('Redis error getting stats:', error);
      return { error: 'Failed to get stats' };
    }
  }
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // Strict limits for authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req: Request) => {
      const ip = req.ip || 'unknown';
      const email = req.body?.email || 'unknown';
      return `auth:${ip}:${email}`;
    }
  },

  // Moderate limits for API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },

  // Lenient limits for public endpoints
  public: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per 15 minutes
    skipSuccessfulRequests: true,
    skipFailedRequests: false
  },

  // Strict limits for payment endpoints
  payment: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req: Request) => {
      const ip = req.ip || 'unknown';
      const userId = req.user?.id || 'anonymous';
      return `payment:${ip}:${userId}`;
    }
  }
};

// DDoS protection configurations
export const ddosConfigs = {
  strict: {
    enabled: true,
    threshold: 100, // 100 requests per window
    windowMs: 60 * 1000, // 1 minute
    banDurationMs: 60 * 60 * 1000, // 1 hour ban
    whitelist: ['127.0.0.1', '::1'],
    blacklist: []
  },

  moderate: {
    enabled: true,
    threshold: 500, // 500 requests per window
    windowMs: 60 * 1000, // 1 minute
    banDurationMs: 30 * 60 * 1000, // 30 minute ban
    whitelist: ['127.0.0.1', '::1'],
    blacklist: []
  },

  disabled: {
    enabled: false,
    threshold: 0,
    windowMs: 0,
    banDurationMs: 0,
    whitelist: [],
    blacklist: []
  }
};

// Factory function to create rate limiters
export function createRateLimiter(
  redis: Redis,
  rateLimitConfig: RateLimitConfig,
  ddosConfig: DDoSProtectionConfig = ddosConfigs.moderate
): RateLimiter {
  return new RateLimiter(redis, rateLimitConfig, ddosConfig);
}

// Express middleware factory
export function rateLimitMiddleware(
  redis: Redis,
  config: RateLimitConfig,
  ddosConfig: DDoSProtectionConfig = ddosConfigs.moderate
) {
  const limiter = createRateLimiter(redis, config, ddosConfig);
  return limiter.middleware();
}
