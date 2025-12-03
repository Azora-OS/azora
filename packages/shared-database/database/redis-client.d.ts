import { RedisClientType } from 'redis';
/**
 * Initialize Redis connection
 */
export declare function connectRedis(): Promise<RedisClientType>;
/**
 * Get Redis client (lazy connection)
 */
export declare function getRedisClient(): Promise<RedisClientType>;
/**
 * Disconnect Redis
 */
export declare function disconnectRedis(): Promise<void>;
/**
 * Health check for Redis
 */
export declare function checkRedisHealth(): Promise<{
    healthy: boolean;
    latency?: number;
    error?: string;
}>;
/**
 * Cache abstraction
 */
export declare class CacheService {
    private client;
    constructor(client: RedisClientType);
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttlSeconds?: number): Promise<boolean>;
    delete(key: string): Promise<boolean>;
    exists(key: string): Promise<boolean>;
    clear(pattern?: string): Promise<number>;
}
export declare function getCacheService(): Promise<CacheService>;
declare const _default: {
    connectRedis: typeof connectRedis;
    getRedisClient: typeof getRedisClient;
    disconnectRedis: typeof disconnectRedis;
    checkRedisHealth: typeof checkRedisHealth;
    getCacheService: typeof getCacheService;
};
export default _default;
