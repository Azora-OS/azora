import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class JobMatchingService {
  async matchFreelancersToJob(jobId: string, limit = 10) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {throw new Error('Job not found');}

    const freelancers = await prisma.user.findMany({
      where: { role: { in: ['FREELANCER', 'BOTH'] }, skills: { hasSome: job.skills } },
      include: { jobsAssigned: { where: { status: 'COMPLETED' } }, reviews: true }
    });

    return freelancers.map(f => ({
      ...f,
      score: this.calculateScore(f, job)
    })).sort((a, b) => b.score - a.score).slice(0, limit);
  }

  private calculateScore(freelancer: any, job: any): number {
    const skillMatch = freelancer.skills.filter((s: string) => job.skills.includes(s)).length / job.skills.length;
    const rating = freelancer.rating / 5;
    const experience = Math.min((freelancer.jobsAssigned?.length || 0) / 10, 1);
    return Math.round(skillMatch * 40 + rating * 30 + experience * 30);
  }
}
