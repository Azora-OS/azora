// 🔄 Azora Sync Manager - Ubuntu Real-Time Data Synchronization
import { prisma } from './prisma-client';
import { cache } from './redis-client';
import { nexus, EventTypes } from '../azora-nexus/event-bus';

export class SyncManager {
  // Cache-aside pattern with event broadcasting
  async syncGet<T>(key: string, fetcher: () => Promise<T>, ttl = 3600): Promise<T> {
    const cached = await cache.get<T>(key);
    if (cached) return cached;

    const data = await fetcher();
    await cache.set(key, data, ttl);
    return data;
  }

  // Write-through cache with event notification
  async syncSet(key: string, data: any, event?: { type: string; payload: any; source: string }) {
    await cache.set(key, data);
    
    if (event) {
      await nexus.publish({
        ...event,
        timestamp: Date.now()
      });
    }
  }

  // Invalidate cache and broadcast change
  async invalidate(pattern: string, eventType?: string) {
    await cache.clear(pattern);
    
    if (eventType) {
      await nexus.publish({
        type: eventType,
        payload: { pattern },
        source: 'sync-manager',
        timestamp: Date.now()
      });
    }
  }

  // User data sync
  async getUserWithCache(userId: string) {
    return this.syncGet(
      `user:${userId}`,
      () => prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true, wallets: true }
      })
    );
  }

  // Course data sync
  async getCourseWithCache(courseId: string) {
    return this.syncGet(
      `course:${courseId}`,
      () => prisma.course.findUnique({
        where: { id: courseId },
        include: { lessons: true }
      })
    );
  }

  // Wallet balance sync with real-time updates
  async updateWalletBalance(walletId: string, amount: number, userId: string) {
    const wallet = await prisma.wallet.update({
      where: { id: walletId },
      data: { balance: { increment: amount } }
    });

    await this.syncSet(`wallet:${walletId}`, wallet, {
      type: EventTypes.TRANSACTION_COMPLETED,
      payload: { walletId, amount, newBalance: wallet.balance },
      source: 'sync-manager'
    });

    return wallet;
  }

  // Enrollment progress sync
  async updateEnrollmentProgress(enrollmentId: string, progress: number, userId: string) {
    const enrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { 
        progress,
        completed: progress >= 100,
        completedAt: progress >= 100 ? new Date() : null
      }
    });

    await this.syncSet(`enrollment:${enrollmentId}`, enrollment, {
      type: progress >= 100 ? EventTypes.COURSE_ENROLLED : EventTypes.LESSON_COMPLETED,
      payload: { enrollmentId, progress, userId },
      source: 'sync-manager'
    });

    return enrollment;
  }
}

export const syncManager = new SyncManager();
export default syncManager;
