import { logger } from './logger';

interface ResourceLimits {
  maxMemoryMB: number;
  maxCpuPercent: number;
  maxExecutionTimeMs: number;
  maxConcurrentTasks: number;
}

export class ResourceLimiter {
  private activeTasks = 0;
  private limits: ResourceLimits;

  constructor(limits?: Partial<ResourceLimits>) {
    this.limits = {
      maxMemoryMB: limits?.maxMemoryMB ?? 512,
      maxCpuPercent: limits?.maxCpuPercent ?? 80,
      maxExecutionTimeMs: limits?.maxExecutionTimeMs ?? 300000,
      maxConcurrentTasks: limits?.maxConcurrentTasks ?? 10
    };
  }

  async checkLimits(): Promise<{ allowed: boolean; reason?: string }> {
    if (this.activeTasks >= this.limits.maxConcurrentTasks) {
      return { allowed: false, reason: 'Max concurrent tasks reached' };
    }

    const memUsage = process.memoryUsage();
    const memMB = memUsage.heapUsed / 1024 / 1024;
    if (memMB > this.limits.maxMemoryMB) {
      return { allowed: false, reason: 'Memory limit exceeded' };
    }

    return { allowed: true };
  }

  async executeWithLimits<T>(operation: () => Promise<T>): Promise<T> {
    const check = await this.checkLimits();
    if (!check.allowed) {
      throw new Error(`Resource limit: ${check.reason}`);
    }

    this.activeTasks++;
    const timeout = setTimeout(() => {
      logger.warn('Task execution timeout');
    }, this.limits.maxExecutionTimeMs);

    try {
      const result = await operation();
      clearTimeout(timeout);
      return result;
    } finally {
      this.activeTasks--;
    }
  }

  getMetrics() {
    const mem = process.memoryUsage();
    return {
      activeTasks: this.activeTasks,
      memoryMB: mem.heapUsed / 1024 / 1024,
      limits: this.limits
    };
  }
}
