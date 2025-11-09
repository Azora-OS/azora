/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/
class MockDatabasePool {
    async healthCheck() {
        return true; // Mock always healthy
    }
    async query(sql, params) {
        console.log(`Mock DB Query: ${sql}`, params);
        return { rows: [], rowCount: 0 };
    }
    async close() {
        console.log('Mock DB Pool closed');
    }
}
class MockRedisCache {
    constructor() {
        this.cache = new Map();
    }
    async get(key) {
        return this.cache.get(key);
    }
    async set(key, value, ttl) {
        this.cache.set(key, value);
        if (ttl) {
            setTimeout(() => this.cache.delete(key), ttl * 1000);
        }
    }
    async del(key) {
        this.cache.delete(key);
    }
    async healthCheck() {
        return true; // Mock always healthy
    }
}
class MockSupabaseClient {
    from(table) {
        return {
            select: () => this,
            insert: () => this,
            update: () => this,
            delete: () => this,
            eq: () => this,
            then: (callback) => callback({ data: [], error: null })
        };
    }
    async healthCheck() {
        return true; // Mock always healthy
    }
}
export function createDatabasePool(config) {
    console.log('Creating mock database pool');
    return new MockDatabasePool();
}
export function createRedisCache(config) {
    console.log('Creating mock Redis cache');
    return new MockRedisCache();
}
export function createSupabaseClient(config) {
    console.log('Creating mock Supabase client');
    return new MockSupabaseClient();
}
export function getDatabasePool(config) {
    return createDatabasePool(config);
}
export function getRedisCache(config) {
    return createRedisCache(config);
}
export function getSupabaseClient(url, key) {
    return createSupabaseClient({ url, key });
}
