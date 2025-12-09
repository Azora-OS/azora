import fs from 'fs';
import path from 'path';
import RedisStorageService from './redisStorageService';

export interface StorageOptions { dataDir?: string }

export class StorageService {
  private baseDir: string;
  private backend: 'fs' | 'redis';
  private redisSvc: any;
  constructor(opts?: StorageOptions) {
    this.backend = (process.env.AZORA_STORAGE_BACKEND || 'fs') as any;
    const candidates = [process.env.AZORA_DATA_DIR || path.join(process.cwd(), 'data'), path.join(process.cwd(), '..', 'data')];
    this.baseDir = opts?.dataDir || candidates.find((c) => fs.existsSync(c)) || candidates[0];
    if (!fs.existsSync(this.baseDir) && this.backend === 'fs') {
      try { fs.mkdirSync(this.baseDir, { recursive: true }); } catch (e) { /* ignore for read-only setups */ }
    }
    if (this.backend === 'redis') {
      const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
      try {
        this.redisSvc = new RedisStorageService(url);
      } catch (err) {
        // Fall back to file system
        this.backend = 'fs';
        this.redisSvc = null;
      }
    }
  }

  async readJson<T>(filename: string): Promise<T | null> {
    if (this.backend === 'redis' && this.redisSvc) {
      return await this.redisSvc.readJson(filename) as T | null;
    }
    try {
      const file = path.join(this.baseDir, filename);
      if (!fs.existsSync(file)) return null;
      const content = fs.readFileSync(file, 'utf-8');
      return JSON.parse(content) as T;
    } catch (err) {
      return null;
    }
  }

  async writeJson(filename: string, data: any) {
    if (this.backend === 'redis' && this.redisSvc) {
      return await this.redisSvc.writeJson(filename, data);
    }
    try {
      const file = path.join(this.baseDir, filename);
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (err) {
      // ignore for now; logging could be added
    }
  }
}

export default StorageService;
