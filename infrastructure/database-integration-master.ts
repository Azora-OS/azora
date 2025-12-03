/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Pool } from 'pg';
import Redis from 'ioredis';

export interface DatabaseConfig {
  postgres: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl?: boolean;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
}

export class DatabaseManager {
  private pgPool: Pool;
  private redis: Redis;

  constructor(config: DatabaseConfig) {
    this.pgPool = new Pool({
      host: config.postgres.host,
      port: config.postgres.port,
      database: config.postgres.database,
      user: config.postgres.username,
      password: config.postgres.password,
      ssl: config.postgres.ssl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });
  }

  async query(text: string, params?: any[]) {
    const client = await this.pgPool.connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  }

  async cache(key: string, value: any, ttl = 3600) {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async getCache(key: string) {
    const result = await this.redis.get(key);
    return result ? JSON.parse(result) : null;
  }

  async healthCheck() {
    try {
      await this.pgPool.query('SELECT 1');
      await this.redis.ping();
      return { postgres: true, redis: true };
    } catch (error) {
      return { postgres: false, redis: false, error };
    }
  }
}

export const createDatabaseManager = (config: DatabaseConfig) => new DatabaseManager(config);