/**
 * Test Parallelization Utilities
 * 
 * Provides utilities for parallel test execution, worker management,
 * and resource pooling to optimize test performance.
 */

import { cpus } from 'os';
import { EventEmitter } from 'events';

export interface WorkerConfig {
  maxWorkers: number;
  workerIdleMemoryLimit?: string;
  workerThreads?: boolean;
}

export interface TestShard {
  id: number;
  total: number;
  tests: string[];
}

export interface ResourcePool<T> {
  acquire(): Promise<T>;
  release(resource: T): void;
  drain(): Promise<void>;
  size(): number;
}

/**
 * Calculate optimal worker count based on system resources
 */
export function calculateOptimalWorkers(): number {
  const cpuCount = cpus().length;
  const memoryGB = process.memoryUsage().heapTotal / (1024 * 1024 * 1024);
  
  // Use 75% of CPUs, but at least 2 and at most 8
  const cpuBasedWorkers = Math.max(2, Math.min(8, Math.floor(cpuCount * 0.75)));
  
  // Limit based on available memory (assume 512MB per worker)
  const memoryBasedWorkers = Math.floor(memoryGB / 0.5);
  
  return Math.min(cpuBasedWorkers, memoryBasedWorkers);
}

/**
 * Get Jest worker configuration
 */
export function getJestWorkerConfig(): WorkerConfig {
  const optimalWorkers = calculateOptimalWorkers();
  
  return {
    maxWorkers: optimalWorkers,
    workerIdleMemoryLimit: '512MB',
    workerThreads: true,
  };
}

/**
 * Shard tests across workers for parallel execution
 */
export function shardTests(testFiles: string[], shardCount: number): TestShard[] {
  const shards: TestShard[] = [];
  const testsPerShard = Math.ceil(testFiles.length / shardCount);
  
  for (let i = 0; i < shardCount; i++) {
    const start = i * testsPerShard;
    const end = Math.min(start + testsPerShard, testFiles.length);
    
    shards.push({
      id: i + 1,
      total: shardCount,
      tests: testFiles.slice(start, end),
    });
  }
  
  return shards;
}

/**
 * Create a resource pool for managing shared resources across workers
 */
export function createResourcePool<T>(
  factory: () => Promise<T>,
  destroyer: (resource: T) => Promise<void>,
  options: { min?: number; max?: number } = {}
): ResourcePool<T> {
  const { min = 2, max = 10 } = options;
  const available: T[] = [];
  const inUse = new Set<T>();
  const waitQueue: Array<(resource: T) => void> = [];
  let creating = 0;
  
  const pool: ResourcePool<T> = {
    async acquire(): Promise<T> {
      // Return available resource if exists
      if (available.length > 0) {
        const resource = available.pop()!;
        inUse.add(resource);
        return resource;
      }
      
      // Create new resource if under max
      if (inUse.size + creating < max) {
        creating++;
        try {
          const resource = await factory();
          inUse.add(resource);
          creating--;
          return resource;
        } catch (error) {
          creating--;
          throw error;
        }
      }
      
      // Wait for resource to become available
      return new Promise((resolve) => {
        waitQueue.push(resolve);
      });
    },
    
    release(resource: T): void {
      inUse.delete(resource);
      
      // Give to waiting request if any
      if (waitQueue.length > 0) {
        const resolve = waitQueue.shift()!;
        inUse.add(resource);
        resolve(resource);
        return;
      }
      
      // Return to available pool
      available.push(resource);
    },
    
    async drain(): Promise<void> {
      // Wait for all in-use resources to be released
      while (inUse.size > 0 || creating > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Destroy all available resources
      await Promise.all(available.map(resource => destroyer(resource)));
      available.length = 0;
    },
    
    size(): number {
      return available.length + inUse.size + creating;
    },
  };
  
  // Initialize minimum resources
  (async () => {
    for (let i = 0; i < min; i++) {
      try {
        const resource = await factory();
        available.push(resource);
      } catch (error) {
        console.error('Failed to initialize resource pool:', error);
      }
    }
  })();
  
  return pool;
}

/**
 * Monitor parallel test execution
 */
export class ParallelExecutionMonitor extends EventEmitter {
  private workerStats: Map<number, WorkerStats> = new Map();
  private startTime: number = 0;
  
  start(workerCount: number): void {
    this.startTime = Date.now();
    for (let i = 0; i < workerCount; i++) {
      this.workerStats.set(i, {
        workerId: i,
        testsRun: 0,
        testsPassed: 0,
        testsFailed: 0,
        totalDuration: 0,
        memoryUsage: 0,
      });
    }
    this.emit('start', { workerCount, startTime: this.startTime });
  }
  
  recordTest(workerId: number, testName: string, passed: boolean, duration: number): void {
    const stats = this.workerStats.get(workerId);
    if (!stats) return;
    
    stats.testsRun++;
    if (passed) {
      stats.testsPassed++;
    } else {
      stats.testsFailed++;
    }
    stats.totalDuration += duration;
    
    this.emit('test', { workerId, testName, passed, duration });
  }
  
  recordMemory(workerId: number, memoryMB: number): void {
    const stats = this.workerStats.get(workerId);
    if (stats) {
      stats.memoryUsage = memoryMB;
    }
    this.emit('memory', { workerId, memoryMB });
  }
  
  getStats(): ParallelExecutionStats {
    const workers = Array.from(this.workerStats.values());
    const totalTests = workers.reduce((sum, w) => sum + w.testsRun, 0);
    const totalPassed = workers.reduce((sum, w) => sum + w.testsPassed, 0);
    const totalFailed = workers.reduce((sum, w) => sum + w.testsFailed, 0);
    const totalDuration = Date.now() - this.startTime;
    const avgMemory = workers.reduce((sum, w) => sum + w.memoryUsage, 0) / workers.length;
    
    return {
      workerCount: this.workerStats.size,
      totalTests,
      totalPassed,
      totalFailed,
      totalDuration,
      averageMemoryUsage: avgMemory,
      workers,
      efficiency: this.calculateEfficiency(workers, totalDuration),
    };
  }
  
  private calculateEfficiency(workers: WorkerStats[], totalDuration: number): number {
    const totalWorkerTime = workers.reduce((sum, w) => sum + w.totalDuration, 0);
    const idealTime = totalDuration * workers.length;
    return idealTime > 0 ? (totalWorkerTime / idealTime) * 100 : 0;
  }
  
  end(): ParallelExecutionStats {
    const stats = this.getStats();
    this.emit('end', stats);
    return stats;
  }
}

export interface WorkerStats {
  workerId: number;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  totalDuration: number;
  memoryUsage: number;
}

export interface ParallelExecutionStats {
  workerCount: number;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalDuration: number;
  averageMemoryUsage: number;
  workers: WorkerStats[];
  efficiency: number;
}

/**
 * Generate Jest CLI arguments for parallel execution
 */
export function generateJestParallelArgs(options: {
  maxWorkers?: number;
  shard?: { id: number; total: number };
  runInBand?: boolean;
}): string[] {
  const args: string[] = [];
  
  if (options.runInBand) {
    args.push('--runInBand');
  } else if (options.maxWorkers) {
    args.push('--maxWorkers', options.maxWorkers.toString());
  }
  
  if (options.shard) {
    args.push('--shard', `${options.shard.id}/${options.shard.total}`);
  }
  
  return args;
}

/**
 * Detect if running in CI environment
 */
export function isCI(): boolean {
  return !!(
    process.env.CI ||
    process.env.CONTINUOUS_INTEGRATION ||
    process.env.GITHUB_ACTIONS ||
    process.env.GITLAB_CI ||
    process.env.CIRCLECI
  );
}

/**
 * Get recommended worker count for environment
 */
export function getRecommendedWorkerCount(): number {
  if (isCI()) {
    // CI environments often have limited resources
    return Math.min(4, calculateOptimalWorkers());
  }
  return calculateOptimalWorkers();
}
