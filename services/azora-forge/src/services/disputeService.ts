import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DisputeService {
  async createDispute(jobId: string, raisedBy: string, reason: string) {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'DISPUTED' }
    });

    await prisma.escrow.update({
      where: { jobId },
      data: { status: 'DISPUTED' }
    });

    return { jobId, status: 'DISPUTED', raisedBy, reason, createdAt: new Date() };
  }

  async resolveDispute(jobId: string, resolution: 'CLIENT' | 'FREELANCER') {
    const escrow = await prisma.escrow.findUnique({ where: { jobId } });
    if (!escrow) throw new Error('Escrow not found');

    await prisma.escrow.update({
      where: { jobId },
      data: { status: resolution === 'FREELANCER' ? 'RELEASED' : 'REFUNDED', releasedAt: new Date() }
    });

    await prisma.job.update({
      where: { id: jobId },
      data: { status: resolution === 'FREELANCER' ? 'COMPLETED' : 'CANCELLED' }
    });

    return { jobId, resolution, resolvedAt: new Date() };
  }
}
