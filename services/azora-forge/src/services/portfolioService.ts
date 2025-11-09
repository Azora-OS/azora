import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Portfolio {
  userId: string;
  projects: Array<{ title: string; description: string; url?: string; images?: string[] }>;
  certifications: Array<{ name: string; issuer: string; date: Date }>;
  education: Array<{ degree: string; institution: string; year: number }>;
}

export class PortfolioService {
  private portfolios = new Map<string, Portfolio>();

  async createPortfolio(userId: string, data: Omit<Portfolio, 'userId'>) {
    const portfolio = { userId, ...data };
    this.portfolios.set(userId, portfolio);
    return portfolio;
  }

  async getPortfolio(userId: string) {
    const portfolio = this.portfolios.get(userId);
    if (!portfolio) throw new Error('Portfolio not found');
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { jobsAssigned: { where: { status: 'COMPLETED' } }, reviews: true }
    });

    return { ...portfolio, user };
  }

  async addProject(userId: string, project: Portfolio['projects'][0]) {
    const portfolio = this.portfolios.get(userId) || { userId, projects: [], certifications: [], education: [] };
    portfolio.projects.push(project);
    this.portfolios.set(userId, portfolio);
    return portfolio;
  }
}
