import Redis from 'ioredis';

let redisClient: Redis | null = null;

export const getCacheService = async () => {
    if (!redisClient) {
        redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    }

    return {
        get: async (key: string) => {
            const data = await redisClient!.get(key);
            return data ? JSON.parse(data) : null;
        },
        set: async (key: string, value: any, ttl?: number) => {
            const serialized = JSON.stringify(value);
            if (ttl) {
                await redisClient!.set(key, serialized, 'EX', ttl);
            } else {
                await redisClient!.set(key, serialized);
            }
        },
        delete: async (key: string) => {
            await redisClient!.del(key);
        }
    };
};
