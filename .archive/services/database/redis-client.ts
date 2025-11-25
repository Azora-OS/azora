// 🫀 Azora Redis Client - Ubuntu Caching Layer
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  }
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('🫀 Redis connected - Ubuntu caching active'));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
};

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  },
  
  async set(key: string, value: any, ttl = 3600): Promise<void> {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  },
  
  async del(key: string): Promise<void> {
    await redisClient.del(key);
  },
  
  async clear(pattern: string): Promise<void> {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) await redisClient.del(keys);
  }
};

export default redisClient;
