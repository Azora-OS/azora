import { registerSingleton, InstantiationType } from '../../../platform/instantiation/common/simpleExtensions.js';
import { KnowledgeOceanService } from './knowledgeOceanService';
import StorageService from './storageService';
import { getMetricsService } from './metricsService';
import RedisIngestionQueue from './redisIngestionQueue';

export interface IngestionJob { id: string; docs: { id: string; title?: string; content: string }[]; priority?: number; retries?: number }

class IngestionQueue {
  private queue: IngestionJob[] = [];
  private running = false;
  private readonly storage: StorageService;
  private readonly knowledge: KnowledgeOceanService;
  private redisQueue: RedisIngestionQueue | null = null;

  constructor() {
    this.storage = new StorageService();
    this.knowledge = new KnowledgeOceanService();
    const backend = process.env.AZORA_INGESTION_QUEUE_BACKEND || 'fs';
    if (backend === 'redis') {
      try { this.redisQueue = new RedisIngestionQueue(process.env.REDIS_URL); } catch (err) { this.redisQueue = null; }
    }
    // rehydrate persisted queue
    this.queue = [];
      if (!this.redisQueue) {
        (async () => {
          const q = await this.storage.readJson<IngestionJob[]>('ingestionQueue.json');
          this.queue = q || [];
        })();
    }
    // fire and forget process
    setTimeout(() => void this.processQueue(), 2000);
  }

  async listDeadLetter(): Promise<any[]> {
    if (this.redisQueue) {
      try { return await this.redisQueue.listDead(); } catch (e) { return []; }
    }
    return this.storage.readJson<any[]>('ingestionDead.json') || [];
  }

  async retry(id: string): Promise<boolean> {
    if (this.redisQueue) {
      try { return await this.redisQueue.retryDead(id); } catch (e) { return false; }
    }
      const dead = (await this.storage.readJson<any[]>('ingestionDead.json')) || [];
    const idx = dead.findIndex(d => d.id === id);
    if (idx === -1) return false;
    const job = dead[idx];
    job.retries = 0;
    this.enqueue(job);
    dead.splice(idx, 1);
    await this.storage.writeJson('ingestionDead.json', dead);
    return true;
  }

  enqueue(job: IngestionJob) {
    const priority = (job as any).priority || 100;
    if (this.redisQueue) {
      this.redisQueue.enqueue(job, priority);
      return;
    }
    // Insert by priority (lower number = higher priority)
    const pos = this.queue.findIndex(j => (j.priority || 100) > (job.priority || 100));
    if (pos === -1) this.queue.push(job);
    else this.queue.splice(pos, 0, job);
    void this.storage.writeJson('ingestionQueue.json', this.queue);
    if (!this.running) void this.processQueue();
  }

  async processQueue() {
    if (this.running) return;
    this.running = true;
    const maxRetries = Number(process.env.AZORA_INGESTION_MAX_RETRIES || '3');
    if (this.redisQueue) {
      while (true) {
        const job = await this.redisQueue.dequeue();
        if (!job) break;
        try {
          const start = Date.now();
          await this.knowledge.indexLocal(job.docs);
          const latency = Date.now() - start;
          getMetricsService().recordIngestionSuccess(latency);
        } catch (e) {
          const latency = Date.now() - job['__createdAt'] || 0;
          getMetricsService().recordIngestionFailure(latency);
          job.retries = (job.retries || 0) + 1;
          if (job.retries > maxRetries) {
            try { await this.redisQueue.client.zadd('azora:ingest:dead', Date.now(), JSON.stringify({ ...job, error: `${e?.message || e}` })); } catch {}
          } else {
            await this.redisQueue.enqueue(job, (job as any).priority || 100);
          }
          break;
        }
      }
      this.running = false;
      return;
    }
      while (this.queue.length > 0) {
      const job = this.queue.shift()!;
      try {
        job['__createdAt'] = job['__createdAt'] || Date.now();
        const start = Date.now();
        await this.knowledge.indexLocal(job.docs);
        const latency = Date.now() - start;
        getMetricsService().recordIngestionSuccess(latency);
      } catch (e) {
        job.retries = (job.retries || 0) + 1;
        if (job.retries > Number(process.env.AZORA_INGESTION_MAX_RETRIES || 3)) {
          const dead = (await this.storage.readJson<any[]>('ingestionDead.json')) || [];
          dead.push({ ...job, error: `${(e as any)?.message || e}` });
          await this.storage.writeJson('ingestionDead.json', dead);
        } else {
          this.queue.unshift(job);
        }
        break;
      }
      // persist queue
      await this.storage.writeJson('ingestionQueue.json', this.queue);
    }
    this.running = false;
  }
}

registerSingleton('IIngestionQueue' as any, IngestionQueue as any, InstantiationType.Delayed);
// global helper for non-DI callers
const globalIngestionQueue = new IngestionQueue();
export function getIngestionQueue(): IngestionQueue { return globalIngestionQueue; }
export default IngestionQueue;
