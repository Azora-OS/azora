/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

export class DatabaseService {
  private prisma: PrismaClient;
  private redis: ReturnType<typeof createClient> | null = null;

  constructor() {
    this.prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
  }

  async connect() {
    try {
      await this.prisma.$connect();
      console.log('✅ Database connected');

      if (process.env.REDIS_URL) {
        this.redis = createClient({ url: process.env.REDIS_URL });
        await this.redis.connect();
        console.log('✅ Redis connected');
      }
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
    if (this.redis) await this.redis.quit();
  }

  async createUser(data: { azoraId: string; walletAddress: string; email?: string }) {
    return this.prisma.user.create({ data });
  }

  async getUserByWallet(walletAddress: string) {
    return this.prisma.user.findUnique({ where: { walletAddress } });
  }

  async getBalance(userId: string, currency: string) {
    return this.prisma.userBalance.findUnique({
      where: { userId_currencyCode: { userId, currencyCode: currency } }
    });
  }

  async updateBalance(userId: string, currency: string, amount: number) {
    return this.prisma.userBalance.upsert({
      where: { userId_currencyCode: { userId, currencyCode: currency } },
      update: { amount },
      create: { userId, currencyCode: currency, amount }
    });
  }

  async createTransaction(data: any) {
    return this.prisma.transaction.create({ data });
  }

  async createReward(data: any) {
    return this.prisma.knowledgeReward.create({ data });
  }

  async createStake(data: any) {
    return this.prisma.stake.create({ data });
  }

  async createLoan(data: any) {
    return this.prisma.loan.create({ data });
  }

  async createCard(data: any) {
    return this.prisma.virtualCard.create({ data });
  }

  async createSubscription(data: any) {
    return this.prisma.subscription.create({ data });
  }

  async createInvoice(data: any) {
    return this.prisma.invoice.create({ data });
  }

  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  getPrisma() {
    return this.prisma;
  }
}

export const db = new DatabaseService();
