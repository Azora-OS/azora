import { Pool, PoolClient } from 'pg';
import { createClient, RedisClientType } from 'redis';

interface PoolConfig {
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

class DatabaseLayer {
  private pool: Pool | null = null;
  private readReplicas: Pool[] = [];
  private cache: RedisClientType | null = null;
  private queryCache: Map<string, { data: any; ttl: number }> = new Map();

  async initializePool(connectionString: string, config?: Partial<PoolConfig>) {
    const poolConfig = {
      connectionString,
      max: config?.max || 20,
      idleTimeoutMillis: config?.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config?.connectionTimeoutMillis || 2000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    };

    this.pool = new Pool(poolConfig);
    this.pool.on('error', (err) => console.error('Pool error:', err));
    return this.pool;
  }

  async addReadReplica(connectionString: string) {
    const replica = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });
    this.readReplicas.push(replica);
    return replica;
  }

  async initializeCache(redisUrl: string) {
    this.cache = createClient({ url: redisUrl });
    this.cache.on('error', (err) => console.error('Cache error:', err));
    await this.cache.connect();
    return this.cache;
  }

  private getReadPool(): Pool {
    if (this.readReplicas.length > 0) {
      return this.readReplicas[Math.floor(Math.random() * this.readReplicas.length)];
    }
    return this.pool!;
  }

  async query(sql: string, params?: any[], isRead: boolean = false) {
    const cacheKey = `query:${sql}:${JSON.stringify(params || [])}`;
    
    if (isRead && this.cache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const pool = isRead ? this.getReadPool() : this.pool;
    const result = await pool!.query(sql, params);

    if (isRead && this.cache) {
      await this.cache.setEx(cacheKey, 300, JSON.stringify(result.rows));
    }

    return result.rows;
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool!.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async migrate(migrations: Array<{ name: string; sql: string }>) {
    const client = await this.pool!.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      for (const migration of migrations) {
        const result = await client.query('SELECT * FROM migrations WHERE name = $1', [migration.name]);
        if (result.rows.length === 0) {
          await client.query(migration.sql);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [migration.name]);
          console.log(`✓ Migration: ${migration.name}`);
        }
      }
    } finally {
      client.release();
    }
  }

  async getPoolStats() {
    return {
      totalCount: this.pool?.totalCount || 0,
      idleCount: this.pool?.idleCount || 0,
      waitingCount: this.pool?.waitingCount || 0,
      readReplicas: this.readReplicas.length
    };
  }

  async disconnect() {
    if (this.pool) await this.pool.end();
    this.readReplicas.forEach(r => r.end());
    if (this.cache) await this.cache.disconnect();
  }
}

export const db = new DatabaseLayer();
