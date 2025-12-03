import Redis from 'ioredis';
import { PredictedQA } from './types';

export class CacheManager {
    private redis: Redis | null = null;
    private memoryCache: Map<string, { data: any; expires: number }> = new Map();
    private readonly DEFAULT_TTL = 60 * 60 * 24 * 3; // 3 days

    constructor(redisUrl?: string) {
        if (redisUrl) {
            this.redis = new Redis(redisUrl);
            this.redis.on('error', (err) => {
                console.error('Redis error:', err);
                this.redis = null; // Fallback to memory
            });
        }
    }

    /**
     * Cache predictions for a query
     */
    async cachePredictions(query: string, predictions: PredictedQA[], ttlSeconds: number = this.DEFAULT_TTL): Promise<void> {
        const key = `prpeng:predictions:${this.normalizeKey(query)}`;
        const data = JSON.stringify(predictions);

        if (this.redis) {
            await this.redis.setex(key, ttlSeconds, data);
        } else {
            this.memoryCache.set(key, {
                data: predictions,
                expires: Date.now() + ttlSeconds * 1000
            });
        }
    }

    /**
     * Get cached predictions
     */
    async getPredictions(query: string): Promise<PredictedQA[] | null> {
        const key = `prpeng:predictions:${this.normalizeKey(query)}`;

        if (this.redis) {
            const data = await this.redis.get(key);
            return data ? JSON.parse(data) : null;
        } else {
            const cached = this.memoryCache.get(key);
            if (cached && cached.expires > Date.now()) {
                return cached.data;
            }
            this.memoryCache.delete(key);
            return null;
        }
    }

    /**
     * Normalize query for cache key
     */
    private normalizeKey(query: string): string {
        return query.toLowerCase().trim().replace(/\s+/g, '_');
    }
}
