/**
 * Async Processing Service
 * Handles async tasks using Bull queues (RabbitMQ alternative)
 * Supports certificate generation, analytics aggregation, and notifications
 */

import Queue from 'bull';
import { logger } from '../utils/logger';

export interface AsyncTask {
  id: string;
  type: string;
  data: Record<string, any>;
  priority?: number;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
}

export interface TaskResult {
  taskId: string;
  status: 'completed' | 'failed' | 'pending';
  result?: any;
  error?: string;
  completedAt?: Date;
}

export enum AsyncTaskType {
  CERTIFICATE_GENERATION = 'certificate:generate',
  ANALYTICS_AGGREGATION = 'analytics:aggregate',
  EMAIL_NOTIFICATION = 'email:send',
  PAYMENT_PROCESSING = 'payment:process',
  REPORT_GENERATION = 'report:generate',
  DATA_EXPORT = 'data:export',
  CLEANUP = 'cleanup:execute'
}

/**
 * Async Processor Service
 * Manages async task queues
 */
export class AsyncProcessor {
  private queues: Map<string, Queue.Queue> = new Map();
  private redisUrl: string;

  constructor(redisUrl: string = 'redis://localhost:6379') {
    this.redisUrl = redisUrl;
    this.initializeQueues();
  }

  /**
   * Initialize all task queues
   */
  private initializeQueues(): void {
    const queueNames = Object.values(AsyncTaskType);

    for (const queueName of queueNames) {
      const queue = new Queue(queueName, this.redisUrl, {
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000
          },
          removeOnComplete: true,
          removeOnFail: false
        }
      });

      // Setup event handlers
      queue.on('completed', (job) => {
        logger.info(`Task completed: ${job.id} (${queueName})`);
      });

      queue.on('failed', (job, err) => {
        logger.error(`Task failed: ${job.id} (${queueName}): ${err.message}`);
      });

      queue.on('error', (err) => {
        logger.error(`Queue error (${queueName}): ${err.message}`);
      });

      this.queues.set(queueName, queue);
    }

    logger.info(`Initialized ${this.queues.size} async task queues`);
  }

  /**
   * Add task to queue
   */
  async addTask(
    taskType: AsyncTaskType,
    data: Record<string, any>,
    options: {
      priority?: number;
      delay?: number;
      attempts?: number;
    } = {}
  ): Promise<string> {
    const queue = this.queues.get(taskType);
    if (!queue) {
      throw new Error(`Unknown task type: ${taskType}`);
    }

    const job = await queue.add(data, {
      priority: options.priority || 0,
      delay: options.delay || 0,
      attempts: options.attempts || 3
    });

    logger.info(`Task queued: ${job.id} (${taskType})`);
    return job.id;
  }

  /**
   * Process certificate generation tasks
   */
  async processCertificateGeneration(
    handler: (data: any) => Promise<void>
  ): Promise<void> {
    const queue = this.queues.get(AsyncTaskType.CERTIFICATE_GENERATION);
    if (!queue) {return;}

    await queue.process(async (job) => {
      logger.info(`Processing certificate generation: ${job.id}`);
      await handler(job.data);
      return { success: true };
    });
  }

  /**
   * Process analytics aggregation tasks
   */
  async processAnalyticsAggregation(
    handler: (data: any) => Promise<void>
  ): Promise<void> {
    const queue = this.queues.get(AsyncTaskType.ANALYTICS_AGGREGATION);
    if (!queue) {return;}

    await queue.process(async (job) => {
      logger.info(`Processing analytics aggregation: ${job.id}`);
      await handler(job.data);
      return { success: true };
    });
  }

  /**
   * Process email notification tasks
   */
  async processEmailNotification(
    handler: (data: any) => Promise<void>
  ): Promise<void> {
    const queue = this.queues.get(AsyncTaskType.EMAIL_NOTIFICATION);
    if (!queue) {return;}

    await queue.process(async (job) => {
      logger.info(`Processing email notification: ${job.id}`);
      await handler(job.data);
      return { success: true };
    });
  }

  /**
   * Process payment tasks
   */
  async processPayment(
    handler: (data: any) => Promise<void>
  ): Promise<void> {
    const queue = this.queues.get(AsyncTaskType.PAYMENT_PROCESSING);
    if (!queue) {return;}

    await queue.process(async (job) => {
      logger.info(`Processing payment: ${job.id}`);
      await handler(job.data);
      return { success: true };
    });
  }

  /**
   * Process report generation tasks
   */
  async processReportGeneration(
    handler: (data: any) => Promise<void>
  ): Promise<void> {
    const queue = this.queues.get(AsyncTaskType.REPORT_GENERATION);
    if (!queue) {return;}

    await queue.process(async (job) => {
      logger.info(`Processing report generation: ${job.id}`);
      await handler(job.data);
      return { success: true };
    });
  }

  /**
   * Process data export tasks
   */
  async processDataExport(
    handler: (data: any) => Promise<void>
  ): Promise<void> {
    const queue = this.queues.get(AsyncTaskType.DATA_EXPORT);
    if (!queue) {return;}

    await queue.process(async (job) => {
      logger.info(`Processing data export: ${job.id}`);
      await handler(job.data);
      return { success: true };
    });
  }

  /**
   * Process cleanup tasks
   */
  async processCleanup(
    handler: (data: any) => Promise<void>
  ): Promise<void> {
    const queue = this.queues.get(AsyncTaskType.CLEANUP);
    if (!queue) {return;}

    await queue.process(async (job) => {
      logger.info(`Processing cleanup: ${job.id}`);
      await handler(job.data);
      return { success: true };
    });
  }

  /**
   * Get task status
   */
  async getTaskStatus(taskType: AsyncTaskType, taskId: string): Promise<TaskResult> {
    const queue = this.queues.get(taskType);
    if (!queue) {
      throw new Error(`Unknown task type: ${taskType}`);
    }

    const job = await queue.getJob(taskId);
    if (!job) {
      return {
        taskId,
        status: 'pending'
      };
    }

    const state = await job.getState();
    const progress = job.progress();

    if (state === 'completed') {
      return {
        taskId,
        status: 'completed',
        result: job.returnvalue,
        completedAt: new Date(job.finishedOn || 0)
      };
    }

    if (state === 'failed') {
      return {
        taskId,
        status: 'failed',
        error: job.failedReason,
        completedAt: new Date(job.finishedOn || 0)
      };
    }

    return {
      taskId,
      status: 'pending'
    };
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(taskType: AsyncTaskType): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const queue = this.queues.get(taskType);
    if (!queue) {
      throw new Error(`Unknown task type: ${taskType}`);
    }

    const counts = await queue.getJobCounts();
    return {
      waiting: counts.waiting,
      active: counts.active,
      completed: counts.completed,
      failed: counts.failed,
      delayed: counts.delayed
    };
  }

  /**
   * Get all queue statistics
   */
  async getAllQueueStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};

    for (const [taskType, queue] of this.queues.entries()) {
      const counts = await queue.getJobCounts();
      stats[taskType] = {
        waiting: counts.waiting,
        active: counts.active,
        completed: counts.completed,
        failed: counts.failed,
        delayed: counts.delayed
      };
    }

    return stats;
  }

  /**
   * Retry failed tasks
   */
  async retryFailedTasks(taskType: AsyncTaskType, limit: number = 10): Promise<number> {
    const queue = this.queues.get(taskType);
    if (!queue) {
      throw new Error(`Unknown task type: ${taskType}`);
    }

    const failedJobs = await queue.getFailed(0, limit);
    let retried = 0;

    for (const job of failedJobs) {
      await job.retry();
      retried++;
    }

    logger.info(`Retried ${retried} failed tasks for ${taskType}`);
    return retried;
  }

  /**
   * Clear queue
   */
  async clearQueue(taskType: AsyncTaskType): Promise<void> {
    const queue = this.queues.get(taskType);
    if (!queue) {
      throw new Error(`Unknown task type: ${taskType}`);
    }

    await queue.clean(0, 'failed');
    await queue.clean(0, 'completed');
    logger.info(`Cleared queue: ${taskType}`);
  }

  /**
   * Close all queues
   */
  async close(): Promise<void> {
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    logger.info('Closed all async task queues');
  }

  /**
   * Schedule recurring task
   */
  async scheduleRecurring(
    taskType: AsyncTaskType,
    data: Record<string, any>,
    cronExpression: string
  ): Promise<void> {
    const queue = this.queues.get(taskType);
    if (!queue) {
      throw new Error(`Unknown task type: ${taskType}`);
    }

    await queue.add(data, {
      repeat: {
        cron: cronExpression
      }
    });

    logger.info(`Scheduled recurring task: ${taskType} (${cronExpression})`);
  }

  /**
   * Get failed jobs
   */
  async getFailedJobs(taskType: AsyncTaskType, limit: number = 20): Promise<any[]> {
    const queue = this.queues.get(taskType);
    if (!queue) {
      throw new Error(`Unknown task type: ${taskType}`);
    }

    return queue.getFailed(0, limit);
  }

  /**
   * Export metrics for monitoring
   */
  async exportMetrics() {
    const allStats = await this.getAllQueueStats();
    const timestamp = new Date().toISOString();

    return {
      timestamp,
      queues: allStats,
      summary: {
        totalWaiting: Object.values(allStats).reduce((sum: number, q: any) => sum + q.waiting, 0),
        totalActive: Object.values(allStats).reduce((sum: number, q: any) => sum + q.active, 0),
        totalFailed: Object.values(allStats).reduce((sum: number, q: any) => sum + q.failed, 0)
      }
    };
  }
}

// Singleton instance
let asyncProcessor: AsyncProcessor | null = null;

/**
 * Initialize async processor
 */
export function initializeAsyncProcessor(redisUrl?: string): AsyncProcessor {
  if (!asyncProcessor) {
    asyncProcessor = new AsyncProcessor(redisUrl);
  }
  return asyncProcessor;
}

/**
 * Get async processor instance
 */
export function getAsyncProcessor(): AsyncProcessor {
  if (!asyncProcessor) {
    throw new Error('Async processor not initialized');
  }
  return asyncProcessor;
}
