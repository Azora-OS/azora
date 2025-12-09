// Optional Redis storage adapter. We dynamically require `ioredis` at runtime so tests/CI can run without it.
export class RedisStorageService {
  private client: any;
  constructor(redisUrl: string) {
    // dynamic require to keep module optional
    try {
      const Redis = require('ioredis');
      this.client = new Redis(redisUrl);
    } catch (err) {
      throw new Error('ioredis module not found; install ioredis or switch backend to `fs`.');
    }
  }
  async readJson<T>(key: string): Promise<T | null> {
    const val = await this.client.get(key);
    if (!val) return null;
    try { return JSON.parse(val) as T; } catch { return null; }
  }
  async writeJson(key: string, data: any) {
    await this.client.set(key, JSON.stringify(data));
  }
  async delete(key: string) { await this.client.del(key); }
}

export default RedisStorageService;
