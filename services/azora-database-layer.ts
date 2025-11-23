import { Pool } from 'pg';
import { createClient } from 'redis';

// Singleton instances
let pool: Pool | null = null;
let redisClient: any | null = null;

export const getDatabasePool = (connectionString: string) => {
    if (!pool) {
        pool = new Pool({
            connectionString,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
        });

        pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });
    }
    return pool;
};

export const getRedisCache = (url: string) => {
    if (!redisClient) {
        redisClient = createClient({ url });
        redisClient.on('error', (err: any) => console.error('Redis Client Error', err));
        redisClient.connect().catch(console.error);
    }
    return redisClient;
};

export const getSupabaseClient = (url?: string, key?: string) => {
    if (!url || !key) return null;
    // Mock or implement if @supabase/supabase-js is added
    // For now returning a mock that satisfies the basic usage in server.ts
    return {
        from: (table: string) => ({
            select: (cols: string) => ({
                limit: (n: number) => Promise.resolve([])
            })
        })
    };
};
