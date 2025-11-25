/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import { EventEmitter } from 'events';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SyncEvent {
  serviceName: string;
  entityType: string;
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'SYNC';
  data: any;
}

export class DatabaseSyncService extends EventEmitter {
  private syncQueue: SyncEvent[] = [];
  private processing = false;

  constructor() {
    super();
    console.log('🔄 Database Sync Service initialized');
    this.startProcessing();
  }

  // Queue sync event
  async queueSync(event: SyncEvent): Promise<void> {
    try {
      await prisma.serviceSync.create({
        data: {
          serviceName: event.serviceName,
          entityType: event.entityType,
          entityId: event.entityId,
          operation: event.operation,
          data: event.data,
          status: 'PENDING'
        }
      });

      this.syncQueue.push(event);
      this.emit('sync-queued', event);
    } catch (error) {
      console.error('Failed to queue sync:', error);
    }
  }

  // Process sync queue
  private async startProcessing(): Promise<void> {
    setInterval(async () => {
      if (this.processing || this.syncQueue.length === 0) return;

      this.processing = true;
      const event = this.syncQueue.shift();

      if (event) {
        await this.processSync(event);
      }

      this.processing = false;
    }, 1000);
  }

  // Process individual sync
  private async processSync(event: SyncEvent): Promise<void> {
    try {
      // Find pending sync record
      const syncRecord = await prisma.serviceSync.findFirst({
        where: {
          serviceName: event.serviceName,
          entityType: event.entityType,
          entityId: event.entityId,
          status: 'PENDING'
        }
      });

      if (!syncRecord) return;

      // Update status to processing
      await prisma.serviceSync.update({
        where: { id: syncRecord.id },
        data: { status: 'PROCESSING' }
      });

      // Perform sync based on entity type
      await this.syncEntity(event);

      // Mark as completed
      await prisma.serviceSync.update({
        where: { id: syncRecord.id },
        data: {
          status: 'COMPLETED',
          processedAt: new Date()
        }
      });

      this.emit('sync-completed', event);
      console.log(`✅ Synced: ${event.entityType} ${event.entityId}`);
    } catch (error: any) {
      console.error('Sync failed:', error);
      this.emit('sync-failed', { event, error });

      // Update sync record with error
      try {
        await prisma.serviceSync.updateMany({
          where: {
            serviceName: event.serviceName,
            entityType: event.entityType,
            entityId: event.entityId,
            status: 'PROCESSING'
          },
          data: {
            status: 'FAILED',
            lastError: error.message,
            retryCount: { increment: 1 }
          }
        });
      } catch (updateError) {
        console.error('Failed to update sync record:', updateError);
      }
    }
  }

  // Sync entity based on type
  private async syncEntity(event: SyncEvent): Promise<void> {
    switch (event.entityType) {
      case 'user':
        await this.syncUser(event);
        break;
      case 'course':
        await this.syncCourse(event);
        break;
      case 'transaction':
        await this.syncTransaction(event);
        break;
      case 'job':
        await this.syncJob(event);
        break;
      default:
        console.log(`Unknown entity type: ${event.entityType}`);
    }
  }

  // Sync user across services
  private async syncUser(event: SyncEvent): Promise<void> {
    const { operation, data } = event;

    if (operation === 'CREATE' || operation === 'UPDATE') {
      await prisma.user.upsert({
        where: { id: event.entityId },
        create: data,
        update: data
      });
    } else if (operation === 'DELETE') {
      await prisma.user.update({
        where: { id: event.entityId },
        data: { deletedAt: new Date() }
      });
    }
  }

  // Sync course
  private async syncCourse(event: SyncEvent): Promise<void> {
    const { operation, data } = event;

    if (operation === 'CREATE' || operation === 'UPDATE') {
      await prisma.course.upsert({
        where: { id: event.entityId },
        create: data,
        update: data
      });
    }
  }

  // Sync transaction
  private async syncTransaction(event: SyncEvent): Promise<void> {
    const { operation, data } = event;

    if (operation === 'CREATE') {
      await prisma.transaction.create({ data });
    }
  }

  // Sync job
  private async syncJob(event: SyncEvent): Promise<void> {
    const { operation, data } = event;

    if (operation === 'CREATE' || operation === 'UPDATE') {
      await prisma.job.upsert({
        where: { id: event.entityId },
        create: data,
        update: data
      });
    }
  }

  // Get sync status
  async getSyncStatus(): Promise<any> {
    const [pending, processing, completed, failed] = await Promise.all([
      prisma.serviceSync.count({ where: { status: 'PENDING' } }),
      prisma.serviceSync.count({ where: { status: 'PROCESSING' } }),
      prisma.serviceSync.count({ where: { status: 'COMPLETED' } }),
      prisma.serviceSync.count({ where: { status: 'FAILED' } })
    ]);

    return {
      pending,
      processing,
      completed,
      failed,
      queueSize: this.syncQueue.length,
      timestamp: new Date().toISOString()
    };
  }

  // Retry failed syncs
  async retryFailed(maxRetries: number = 3): Promise<number> {
    const failed = await prisma.serviceSync.findMany({
      where: {
        status: 'FAILED',
        retryCount: { lt: maxRetries }
      }
    });

    for (const sync of failed) {
      await this.queueSync({
        serviceName: sync.serviceName,
        entityType: sync.entityType,
        entityId: sync.entityId,
        operation: sync.operation as any,
        data: sync.data
      });
    }

    return failed.length;
  }
}

export const dbSync = new DatabaseSyncService();
export default dbSync;
