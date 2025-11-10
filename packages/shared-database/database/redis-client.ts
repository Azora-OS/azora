/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

LAYER 2: DATA FOUNDATION - REDIS CLIENT SETUP
Unified Redis client with connection pooling and error handling
*/

import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let isConnected = false;

/**
 * Initialize Redis connection
 */
export async function connectRedis(): Promise<RedisClientType> {
  if (redisClient && isConnected) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  redisClient = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('❌ Redis reconnection failed after 10 attempts');
          return new Error('Redis connection failed');
        }
        return Math.min(retries * 100, 3000);
      },
    },
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis Client Error:', err);
    isConnected = false;
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connecting...');
  });

  redisClient.on('ready', () => {
    console.log('✅ Redis connected successfully');
    isConnected = true;
  });

  redisClient.on('end', () => {
    console.log('⚠️  Redis connection ended');
    isConnected = false;
  });

  await redisClient.connect();
  return redisClient;
}

/**
 * Get Redis client (lazy connection)
 */
export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient || !isConnected) {
    return connectRedis();
  }
  return redisClient;
}

/**
 * Disconnect Redis
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient && isConnected) {
    await redisClient.quit();
    isConnected = false;
    console.log('✅ Redis disconnected');
  }
}

/**
 * Health check for Redis
 */
export async function checkRedisHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  try {
    const client = await getRedisClient();
    const start = Date.now();
    await client.ping();
    const latency = Date.now() - start;

    return {
      healthy: true,
      latency,
    };
  } catch (error: any) {
    return {
      healthy: false,
      error: error.message,
    };
  }
}

/**
 * Cache abstraction
 */
export class CacheService {
  private client: RedisClientType;

  constructor(client: RedisClientType) {
    this.client = client;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  async clear(pattern?: string): Promise<number> {
    try {
      if (pattern) {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          return await this.client.del(keys);
        }
        return 0;
      }
      return await this.client.flushDb();
    } catch (error) {
      console.error('Cache clear error:', error);
      return 0;
    }
  }
}

// Export singleton cache service
let cacheService: CacheService | null = null;

export async function getCacheService(): Promise<CacheService> {
  if (!cacheService) {
    const client = await getRedisClient();
    cacheService = new CacheService(client);
  }
  return cacheService;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await disconnectRedis();
});

export default { connectRedis, getRedisClient, disconnectRedis, checkRedisHealth, getCacheService };
