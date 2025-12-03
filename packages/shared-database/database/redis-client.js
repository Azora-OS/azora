"use strict";
/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

LAYER 2: DATA FOUNDATION - REDIS CLIENT SETUP
Unified Redis client with connection pooling and error handling
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCacheService = exports.CacheService = exports.checkRedisHealth = exports.disconnectRedis = exports.getRedisClient = exports.connectRedis = void 0;
const redis_1 = require("redis");
let redisClient = null;
let isConnected = false;
/**
 * Initialize Redis connection
 */
async function connectRedis() {
    if (redisClient && isConnected) {
        return redisClient;
    }
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = (0, redis_1.createClient)({
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
exports.connectRedis = connectRedis;
/**
 * Get Redis client (lazy connection)
 */
async function getRedisClient() {
    if (!redisClient || !isConnected) {
        return connectRedis();
    }
    return redisClient;
}
exports.getRedisClient = getRedisClient;
/**
 * Disconnect Redis
 */
async function disconnectRedis() {
    if (redisClient && isConnected) {
        await redisClient.quit();
        isConnected = false;
        console.log('✅ Redis disconnected');
    }
}
exports.disconnectRedis = disconnectRedis;
/**
 * Health check for Redis
 */
async function checkRedisHealth() {
    try {
        const client = await getRedisClient();
        const start = Date.now();
        await client.ping();
        const latency = Date.now() - start;
        return {
            healthy: true,
            latency,
        };
    }
    catch (error) {
        return {
            healthy: false,
            error: error.message,
        };
    }
}
exports.checkRedisHealth = checkRedisHealth;
/**
 * Cache abstraction
 */
class CacheService {
    constructor(client) {
        this.client = client;
    }
    async get(key) {
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            console.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        try {
            const serialized = JSON.stringify(value);
            if (ttlSeconds) {
                await this.client.setEx(key, ttlSeconds, serialized);
            }
            else {
                await this.client.set(key, serialized);
            }
            return true;
        }
        catch (error) {
            console.error(`Cache set error for key ${key}:`, error);
            return false;
        }
    }
    async delete(key) {
        try {
            await this.client.del(key);
            return true;
        }
        catch (error) {
            console.error(`Cache delete error for key ${key}:`, error);
            return false;
        }
    }
    async exists(key) {
        try {
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (error) {
            console.error(`Cache exists error for key ${key}:`, error);
            return false;
        }
    }
    async clear(pattern) {
        try {
            if (pattern) {
                const keys = await this.client.keys(pattern);
                if (keys.length > 0) {
                    return await this.client.del(keys);
                }
                return 0;
            }
            await this.client.flushDb();
            return 0;
        }
        catch (error) {
            console.error('Cache clear error:', error);
            return 0;
        }
    }
}
exports.CacheService = CacheService;
// Export singleton cache service
let cacheService = null;
async function getCacheService() {
    if (!cacheService) {
        const client = await getRedisClient();
        cacheService = new CacheService(client);
    }
    return cacheService;
}
exports.getCacheService = getCacheService;
// Graceful shutdown
process.on('beforeExit', async () => {
    await disconnectRedis();
});
exports.default = { connectRedis, getRedisClient, disconnectRedis, checkRedisHealth, getCacheService };
