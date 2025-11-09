/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
export class DatabaseService {
    constructor() {
        this.redis = null;
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
        }
        catch (error) {
            console.error('❌ Database connection failed:', error);
            throw error;
        }
    }
    async disconnect() {
        await this.prisma.$disconnect();
        if (this.redis)
            await this.redis.quit();
    }
    async createUser(data) {
        return this.prisma.user.create({ data });
    }
    async getUserByWallet(walletAddress) {
        return this.prisma.user.findUnique({ where: { walletAddress } });
    }
    async getBalance(userId, currency) {
        return this.prisma.userBalance.findUnique({
            where: { userId_currencyCode: { userId, currencyCode: currency } }
        });
    }
    async updateBalance(userId, currency, amount) {
        return this.prisma.userBalance.upsert({
            where: { userId_currencyCode: { userId, currencyCode: currency } },
            update: { amount },
            create: { userId, currencyCode: currency, amount }
        });
    }
    async createTransaction(data) {
        return this.prisma.transaction.create({ data });
    }
    async createReward(data) {
        return this.prisma.knowledgeReward.create({ data });
    }
    async createStake(data) {
        return this.prisma.stake.create({ data });
    }
    async createLoan(data) {
        return this.prisma.loan.create({ data });
    }
    async createCard(data) {
        return this.prisma.virtualCard.create({ data });
    }
    async createSubscription(data) {
        return this.prisma.subscription.create({ data });
    }
    async createInvoice(data) {
        return this.prisma.invoice.create({ data });
    }
    async healthCheck() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch {
            return false;
        }
    }
    getPrisma() {
        return this.prisma;
    }
}
export const db = new DatabaseService();
