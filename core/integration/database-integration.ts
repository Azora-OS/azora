// 🔗 Database Integration Bridge - Connecting v0 UI to Azora Data Layer
import { prisma, cache, syncManager } from '../../services/database';
import { nexus, EventTypes } from '../../services/azora-nexus/event-bus';

export class DatabaseIntegration {
  // User operations with caching
  async getUser(userId: string) {
    return syncManager.getUserWithCache(userId);
  }

  async createUser(data: { email: string; username: string; passwordHash: string }) {
    const user = await prisma.user.create({
      data,
      include: { profile: true }
    });

    await nexus.publish({
      type: EventTypes.USER_REGISTERED,
      payload: { userId: user.id, email: user.email },
      source: 'database-integration',
      timestamp: Date.now()
    });

    return user;
  }

  // Course operations with caching
  async getCourse(courseId: string) {
    return syncManager.getCourseWithCache(courseId);
  }

  async enrollCourse(userId: string, courseId: string) {
    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId }
    });

    await nexus.publish({
      type: EventTypes.COURSE_ENROLLED,
      payload: { userId, courseId, enrollmentId: enrollment.id },
      source: 'database-integration',
      timestamp: Date.now()
    });

    return enrollment;
  }

  // Wallet operations with real-time updates
  async getWallet(userId: string, currency = 'AZR') {
    const cached = await cache.get(`wallet:${userId}:${currency}`);
    if (cached) return cached;

    const wallet = await prisma.wallet.findFirst({
      where: { userId, currency }
    });

    if (wallet) {
      await cache.set(`wallet:${userId}:${currency}`, wallet);
    }

    return wallet;
  }

  async updateBalance(walletId: string, amount: number, userId: string) {
    return syncManager.updateWalletBalance(walletId, amount, userId);
  }

  // Job marketplace operations
  async createJob(data: { userId: string; title: string; description: string; budget: number }) {
    const job = await prisma.job.create({ data });

    await nexus.publish({
      type: EventTypes.JOB_POSTED,
      payload: { jobId: job.id, userId: data.userId },
      source: 'database-integration',
      timestamp: Date.now()
    });

    return job;
  }

  async applyToJob(jobId: string, userId: string, proposal: string) {
    const application = await prisma.application.create({
      data: { jobId, userId, proposal }
    });

    await nexus.publish({
      type: EventTypes.APPLICATION_SUBMITTED,
      payload: { applicationId: application.id, jobId, userId },
      source: 'database-integration',
      timestamp: Date.now()
    });

    return application;
  }
}

export const dbIntegration = new DatabaseIntegration();
export default dbIntegration;
