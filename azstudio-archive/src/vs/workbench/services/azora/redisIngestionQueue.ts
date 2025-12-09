// Redis-based ingestion queue using ZSET with priority
import type { Redis } from 'ioredis';

export class RedisIngestionQueue {
  public client: any;
  private key = 'azora:ingest:queue';
  constructor(redisUrl?: string) {
    try {
      const RedisClient = require('ioredis');
      this.client = new RedisClient(redisUrl || (process.env.REDIS_URL || 'redis://127.0.0.1:6379'));
    } catch (err) {
      throw new Error('ioredis not installed');
    }
  }

  async enqueue(job: any, priority = 100) {
    const payload = JSON.stringify(job);
    await this.client.zadd(this.key, priority, payload);
  }

  async dequeue(): Promise<any | null> {
    // ZPOPMIN returns [[member, score]] in ioredis v5
    const res = await this.client.zpopmin(this.key, 1);
    if (!res || (Array.isArray(res) && res.length === 0)) return null;
    const item = Array.isArray(res[0]) ? res[0][0] : res[0];
    return JSON.parse(item);
  }

  async size(): Promise<number> { return await this.client.zcard(this.key); }

  async listDead(): Promise<any[]> {
    try {
      const members = await this.client.zrange('azora:ingest:dead', 0, -1);
      return members.map((m: string) => JSON.parse(m));
    } catch (err) { return []; }
  }

  async retryDead(id: string): Promise<boolean> {
    try {
      const members: string[] = await this.client.zrange('azora:ingest:dead', 0, -1);
      const found = members.find(m => {
        try { const obj = JSON.parse(m); return obj.id === id; } catch { return false; }
      });
      if (!found) return false;
      // remove from dead set
      await this.client.zrem('azora:ingest:dead', found);
      // requeue with priority
      try { const obj = JSON.parse(found); await this.client.zadd(this.key, obj.priority || 100, found); } catch {}
      return true;
    } catch (err) { return false; }
  }
}

export default RedisIngestionQueue;
