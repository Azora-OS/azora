import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SubscriptionRepository {
    // Plan Methods
    async createPlan(data: {
        name: string;
        price: number;
        interval: string;
        features: any;
    }) {
        return await prisma.subscriptionPlan.create({
            data: {
                name: data.name,
                price: data.price,
                interval: data.interval,
                features: data.features,
            },
        });
    }

    async getPlans() {
        return await prisma.subscriptionPlan.findMany({
            where: { isActive: true },
        });
    }

    async getPlan(id: string) {
        return await prisma.subscriptionPlan.findUnique({
            where: { id },
        });
    }

    // Subscription Methods
    async createSubscription(data: {
        userId: string;
        planId: string;
        status: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
    }) {
        return await prisma.subscription.create({
            data: {
                userId: data.userId,
                planId: data.planId,
                status: data.status,
                currentPeriodStart: data.currentPeriodStart,
                currentPeriodEnd: data.currentPeriodEnd,
            },
            include: { plan: true },
        });
    }

    async getSubscription(id: string) {
        return await prisma.subscription.findUnique({
            where: { id },
            include: { plan: true, invoices: true },
        });
    }

    async getUserSubscription(userId: string) {
        return await prisma.subscription.findFirst({
            where: {
                userId,
                status: { in: ['ACTIVE', 'PAST_DUE'] }
            },
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateSubscriptionStatus(id: string, status: string) {
        return await prisma.subscription.update({
            where: { id },
            data: { status },
        });
    }

    async cancelSubscription(id: string, atPeriodEnd: boolean = true) {
        if (atPeriodEnd) {
            return await prisma.subscription.update({
                where: { id },
                data: { cancelAtPeriodEnd: true },
            });
        } else {
            return await prisma.subscription.update({
                where: { id },
                data: { status: 'CANCELLED', cancelAtPeriodEnd: false },
            });
        }
    }

    // Invoice Methods
    async createInvoice(data: {
        subscriptionId: string;
        amount: number;
        status: string;
    }) {
        return await prisma.invoice.create({
            data: {
                subscriptionId: data.subscriptionId,
                amount: data.amount,
                status: data.status,
            },
        });
    }

    async getSubscriptionInvoices(subscriptionId: string) {
        return await prisma.invoice.findMany({
            where: { subscriptionId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateInvoiceStatus(id: string, status: string, paidAt?: Date) {
        return await prisma.invoice.update({
            where: { id },
            data: {
                status,
                paidAt: status === 'PAID' ? (paidAt || new Date()) : undefined
            },
        });
    }

    // Statistics
    async getStats() {
        const totalSubscriptions = await prisma.subscription.count();
        const activeSubscriptions = await prisma.subscription.count({
            where: { status: 'ACTIVE' },
        });
        const totalRevenueResult = await prisma.invoice.aggregate({
            where: { status: 'PAID' },
            _sum: { amount: true },
        });

        return {
            totalSubscriptions,
            activeSubscriptions,
            totalRevenue: totalRevenueResult._sum.amount || 0,
        };
    }
}

export const subscriptionRepository = new SubscriptionRepository();
