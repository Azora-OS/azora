/**
 * Redis Connection Manager
 * Handles connection pooling, health checks, and failover
 */

import Redis from 'ioredis';
import {
  createRedisCluster,
  createRedisInstance,
  applyPersistenceConfig,
  getRedisConnectionString
} from './redis-cluster-config';

export interface RedisConnectionOptions {
  useCluster: boolean;
  maxRetries: number;
  retryDelay: number;
  healthCheckInterval: number;
}

export class RedisConnectionManager {
  private redis: Redis | Redis.Cluster | null = null;
  private isConnected: boolean = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private options: RedisConnectionOptions;

  constructor(options: Partial<RedisConnectionOptions> = {}) {
    this.options = {
      useCluster: process.env.REDIS_CLUSTER === 'true',
      maxRetries: 5,
      retryDelay: 1000,
      healthCheckInterval: 30000, // 30 seconds
      ...options
    };
  }

  /**
   * Initialize Redis connection
   */
  async connect(): Promise<void> {
    try {
      if (this.options.useCluster) {
        console.log('Connecting to Redis Cluster...');
        this.redis = createRedisCluster();
      } else {
        console.log('Connecting to Redis instance...');
        this.redis = createRedisInstance();
      }

      // Wait for connection to be ready
      await this.waitForReady();

      // Apply persistence configuration
      await applyPersistenceConfig(this.redis);

      this.isConnected = true;
      console.log('Redis connection established');

      // Start health checks
      this.startHealthCheck();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  /**
   * Wait for Redis to be ready
   */
  private waitForReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.redis) {
        reject(new Error('Redis instance not initialized'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Redis connection timeout'));
      }, 10000);

      this.redis.on('ready', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.redis.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  /**
   * Start periodic health checks
   */
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.healthCheck();
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, this.options.healthCheckInterval);
  }

  /**
   * Perform health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.redis) {
        return false;
      }

      const pong = await this.redis.ping();
      return pong === 'PONG';
    } catch (error) {
      console.error('Redis health check failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Get Redis instance
   */
  getInstance(): Redis | Redis.Cluster {
    if (!this.redis) {
      throw new Error('Redis not connected. Call connect() first.');
    }
    return this.redis;
  }

  /**
   * Check if connected
   */
  isReady(): boolean {
    return this.isConnected && this.redis !== null;
  }

  /**
   * Get connection info
   */
  getConnectionInfo(): Record<string, any> {
    return {
      connected: this.isConnected,
      type: this.options.useCluster ? 'cluster' : 'standalone',
      connectionString: getRedisConnectionString()
    };
  }

  /**
   * Execute command with retry logic
   */
  async executeWithRetry<T>(
    command: () => Promise<T>,
    maxRetries: number = this.options.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await command();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Command failed (attempt ${attempt + 1}/${maxRetries + 1}):`, lastError.message);

        if (attempt < maxRetries) {
          await this.delay(this.options.retryDelay * Math.pow(2, attempt));
        }
      }
    }

    throw lastError || new Error('Command failed after retries');
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get Redis statistics
   */
  async getStats(): Promise<Record<string, any>> {
    if (!this.redis) {
      throw new Error('Redis not connected');
    }

    try {
      const info = await this.redis.info();
      const dbSize = await this.redis.dbsize();
      const memory = await this.redis.info('memory');

      return {
        info,
        dbSize,
        memory,
        connected: this.isConnected
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return { error: (error as Error).message };
    }
  }

  /**
   * Flush all data (use with caution)
   */
  async flushAll(): Promise<void> {
    if (!this.redis) {
      throw new Error('Redis not connected');
    }

    try {
      await this.redis.flushall();
      console.log('Redis flushed');
    } catch (error) {
      console.error('Error flushing Redis:', error);
      throw error;
    }
  }

  /**
   * Close connection
   */
  async disconnect(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    if (this.redis) {
      try {
        await this.redis.quit();
        this.isConnected = false;
        console.log('Redis connection closed');
      } catch (error) {
        console.error('Error closing Redis connection:', error);
      }
    }
  }
}

// Singleton instance
let connectionManager: RedisConnectionManager | null = null;

/**
 * Get or create Redis connection manager
 */
export function getRedisConnectionManager(
  options?: Partial<RedisConnectionOptions>
): RedisConnectionManager {
  if (!connectionManager) {
    connectionManager = new RedisConnectionManager(options);
  }
  return connectionManager;
}

/**
 * Initialize Redis connection globally
 */
export async function initializeRedis(
  options?: Partial<RedisConnectionOptions>
): Promise<RedisConnectionManager> {
  const manager = getRedisConnectionManager(options);
  await manager.connect();
  return manager;
}
