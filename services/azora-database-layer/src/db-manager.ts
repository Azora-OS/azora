import { Pool } from 'pg';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export class DatabaseManager {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            max: 20, // Connection pool size
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        this.pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
        });
    }

    async query(text: string, params?: any[]) {
        const start = Date.now();
        const res = await this.pool.query(text, params);
        const duration = Date.now() - start;
        console.log('executed query', { text, duration, rows: res.rowCount });
        return res;
    }

    async getClient() {
        return await this.pool.connect();
    }
}

export class CacheManager {
    private client: any;
    private isConnected = false;

    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });

        this.client.on('error', (err: any) => console.error('Redis Client Error', err));
        this.client.on('connect', () => {
            console.log('Redis Client Connected');
            this.isConnected = true;
        });
    }

    async connect() {
        if (!this.isConnected) {
            await this.client.connect();
        }
    }

    async get(key: string): Promise<string | null> {
        await this.connect();
        return await this.client.get(key);
    }

    async set(key: string, value: string, ttlSeconds: number = 3600): Promise<void> {
        await this.connect();
        await this.client.set(key, value, { EX: ttlSeconds });
    }

    async del(key: string): Promise<void> {
        await this.connect();
        await this.client.del(key);
    }
}

export const dbManager = new DatabaseManager();
export const cacheManager = new CacheManager();
