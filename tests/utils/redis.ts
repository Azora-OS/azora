import Redis from 'ioredis';

let redis: Redis | null = null;
const TEST_KEY_PREFIX = 'test:';

/**
 * Get or create a Redis client instance for testing
 */
export function getTestRedisClient(): Redis {
  if (!redis) {
    const testRedisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redis = new Redis(testRedisUrl, {
      keyPrefix: TEST_KEY_PREFIX,
      lazyConnect: false,
      retryStrategy: (times) => {
        if (times > 3) {
          return null; // Stop retrying after 3 attempts
        }
        return Math.min(times * 100, 2000);
      },
    });
    
    redis.on('error', (err) => {
      console.error('Redis test client error:', err);
    });
  }
  
  return redis;
}

/**
 * Setup test Redis instance
 */
export async function setupTestRedis(): Promise<Redis> {
  const client = getTestRedisClient();
  
  try {
    // Test connection
    await client.ping();
    console.log('Redis test connection established');
    return client;
  } catch (error) {
    console.error('Failed to setup test Redis:', error);
    throw error;
  }
}

/**
 * Clean up all test keys from Redis
 */
export async function cleanupTestRedis(): Promise<void> {
  const client = getTestRedisClient();
  
  try {
    // Get all test keys (with prefix)
    const keys = await client.keys(`${TEST_KEY_PREFIX}*`);
    
    if (keys.length > 0) {
      // Use pipeline for efficient deletion
      const pipeline = client.pipeline();
      keys.forEach(key => {
        // Remove prefix before deleting since client already adds it
        const keyWithoutPrefix = key.replace(TEST_KEY_PREFIX, '');
        pipeline.del(keyWithoutPrefix);
      });
      await pipeline.exec();
      console.log(`Cleaned up ${keys.length} test keys from Redis`);
    }
  } catch (error) {
    console.error('Error cleaning up test Redis:', error);
    throw error;
  }
}

/**
 * Disconnect from test Redis
 */
export async function disconnectTestRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

/**
 * Check Redis connection health
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const client = getTestRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

/**
 * Create a test-specific key with automatic prefixing
 */
export function createTestKey(key: string): string {
  return `${TEST_KEY_PREFIX}${key}`;
}

/**
 * Set a test value with automatic expiration
 */
export async function setTestValue(
  key: string,
  value: string,
  expirationSeconds: number = 3600
): Promise<void> {
  const client = getTestRedisClient();
  await client.setex(key, expirationSeconds, value);
}

/**
 * Get a test value
 */
export async function getTestValue(key: string): Promise<string | null> {
  const client = getTestRedisClient();
  return client.get(key);
}

/**
 * Delete a specific test key
 */
export async function deleteTestKey(key: string): Promise<void> {
  const client = getTestRedisClient();
  await client.del(key);
}

/**
 * Batch set multiple key-value pairs using pipeline
 */
export async function batchSetTestValues(
  entries: Array<{ key: string; value: string; ttl?: number }>
): Promise<void> {
  if (entries.length === 0) return;

  const client = getTestRedisClient();
  const pipeline = client.pipeline();

  for (const entry of entries) {
    if (entry.ttl) {
      pipeline.setex(entry.key, entry.ttl, entry.value);
    } else {
      pipeline.set(entry.key, entry.value);
    }
  }

  await pipeline.exec();
}

/**
 * Batch get multiple values using pipeline
 */
export async function batchGetTestValues(keys: string[]): Promise<Array<string | null>> {
  if (keys.length === 0) return [];

  const client = getTestRedisClient();
  const pipeline = client.pipeline();

  for (const key of keys) {
    pipeline.get(key);
  }

  const results = await pipeline.exec();
  return (results || []).map(([err, value]) => (err ? null : value as string | null));
}

/**
 * Batch delete multiple keys using pipeline
 */
export async function batchDeleteTestKeys(keys: string[]): Promise<number> {
  if (keys.length === 0) return 0;

  const client = getTestRedisClient();
  const pipeline = client.pipeline();

  for (const key of keys) {
    pipeline.del(key);
  }

  await pipeline.exec();
  return keys.length;
}
