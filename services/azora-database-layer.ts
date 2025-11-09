/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Azora Database Layer
 * Mock implementation for development and testing
 */

export interface DatabasePool {
  healthCheck(): Promise<boolean>;
  query(sql: string, params?: any[]): Promise<any>;
  close(): Promise<void>;
}

export interface RedisCache {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  healthCheck(): Promise<boolean>;
}

export interface SupabaseClient {
  from(table: string): any;
  healthCheck(): Promise<boolean>;
}

class MockDatabasePool implements DatabasePool {
  async healthCheck(): Promise<boolean> {
    return true; // Mock always healthy
  }

  async query(sql: string, params?: any[]): Promise<any> {
    console.log(`Mock DB Query: ${sql}`, params);
    return { rows: [], rowCount: 0 };
  }

  async close(): Promise<void> {
    console.log('Mock DB Pool closed');
  }
}

class MockRedisCache implements RedisCache {
  private cache = new Map<string, any>();

  async get(key: string): Promise<any> {
    return this.cache.get(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.cache.set(key, value);
    if (ttl) {
      setTimeout(() => this.cache.delete(key), ttl * 1000);
    }
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async healthCheck(): Promise<boolean> {
    return true; // Mock always healthy
  }
}

class MockSupabaseClient implements SupabaseClient {
  from(table: string): any {
    return {
      select: () => this,
      insert: () => this,
      update: () => this,
      delete: () => this,
      eq: () => this,
      then: (callback: any) => callback({ data: [], error: null })
    };
  }

  async healthCheck(): Promise<boolean> {
    return true; // Mock always healthy
  }
}

export function createDatabasePool(config?: any): DatabasePool {
  console.log('Creating mock database pool');
  return new MockDatabasePool();
}

export function createRedisCache(config?: any): RedisCache {
  console.log('Creating mock Redis cache');
  return new MockRedisCache();
}

export function createSupabaseClient(config?: any): SupabaseClient {
  console.log('Creating mock Supabase client');
  return new MockSupabaseClient();
}

export function getDatabasePool(config?: any): DatabasePool {
  return createDatabasePool(config);
}

export function getRedisCache(config?: any): RedisCache {
  return createRedisCache(config);
}

export function getSupabaseClient(url?: string, key?: string): SupabaseClient {
  return createSupabaseClient({ url, key });
}
