/*
 * AZORA PROPRIETARY LICENSE
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * 
 * Azora Pay Service - Database Repository
 * Constitutional AI Operating System - No Mock Protocol Compliant
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PayRepository {
    // ========== WALLETS ==========

    async getWallet(userId: string) {
        return await prisma.wallet.findUnique({
            where: { userId },
        });
    }

    async createWallet(data: {
        userId: string;
        balance?: number;
        currency?: string;
        available?: number;
        status?: string;
    }) {
        return await prisma.wallet.create({
            data: {
                ...data,
                balance: data.balance || 0,
                available: data.available || 0,
                currency: data.currency || 'AZR',
                status: data.status || 'active',
            },
        });
    }

    async updateWallet(userId: string, data: {
        balance?: number;
        staked?: number;
        available?: number;
        status?: string;
    }) {
        return await prisma.wallet.update({
            where: { userId },
            data,
        });
    }

    // ========== TRANSACTIONS ==========

    async createTransaction(data: {
        fromUserId?: string;
        toUserId?: string;
        amount: number;
        currency?: string;
        type: string;
        status?: string;
        description?: string;
        source?: string;
        blockchainTxHash?: string;
        metadata?: any;
    }) {
        return await prisma.transaction.create({
            data: {
                ...data,
                currency: data.currency || 'AZR',
                status: data.status || 'pending',
                metadata: data.metadata || {},
            },
        });
    }

    async getTransaction(id: string) {
        return await prisma.transaction.findUnique({
            where: { id },
        });
    }

    async getUserTransactions(userId: string, limit: number = 50) {
        return await prisma.transaction.findMany({
            where: {
                OR: [
                    { fromUserId: userId },
                    { toUserId: userId },
                ],
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    // ========== PAYMENT METHODS ==========

    async createPaymentMethod(data: {
        userId: string;
        type: string;
        provider?: string;
        details: any;
        isDefault?: boolean;
        metadata?: any;
    }) {
        // If setting as default, unset other defaults for this user
        if (data.isDefault) {
            await prisma.paymentMethod.updateMany({
                where: { userId: data.userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        return await prisma.paymentMethod.create({
            data: {
                ...data,
                details: data.details,
                isDefault: data.isDefault || false,
                metadata: data.metadata || {},
            },
        });
    }

    async getUserPaymentMethods(userId: string) {
        return await prisma.paymentMethod.findMany({
            where: { userId, status: 'active' },
            orderBy: { isDefault: 'desc' },
        });
    }

    // ========== STAKING ==========

    async getStakingPools() {
        return await prisma.stakingPool.findMany({
            where: { status: 'active' },
        });
    }

    async getStakingPool(id: string) {
        return await prisma.stakingPool.findUnique({
            where: { id },
        });
    }

    async createStakingRecord(data: {
        userId: string;
        poolId: string;
        amount: number;
        duration: number;
        apr: number;
        endsAt: Date;
        blockchainTxHash?: string;
    }) {
        // Start transaction to update pool stats and create record
        return await prisma.$transaction(async (tx) => {
            // Update pool stats
            await tx.stakingPool.update({
                where: { id: data.poolId },
                data: {
                    totalStaked: { increment: data.amount },
                    participants: { increment: 1 },
                },
            });

            // Create record
            return await tx.stakingRecord.create({
                data: {
                    ...data,
                    status: 'active',
                },
            });
        });
    }

    async getStakingRecord(id: string) {
        return await prisma.stakingRecord.findUnique({
            where: { id },
            include: { pool: true },
        });
    }

    async updateStakingRecord(id: string, data: {
        status?: string;
        rewards?: number;
        blockchainTxHash?: string;
    }) {
        return await prisma.stakingRecord.update({
            where: { id },
            data,
        });
    }

    // ========== CONSTITUTIONAL AUDITS ==========

    async recordAudit(data: {
        auditType: string;
        complianceScore: number;
        violations?: any[];
        recommendations?: any[];
        auditedBy?: string;
    }) {
        return await prisma.constitutionalAudit.create({
            data: {
                ...data,
                violations: data.violations || [],
                recommendations: data.recommendations || [],
                auditedBy: data.auditedBy || 'constitutional-ai',
            },
        });
    }

    // ========== UTILITY ==========

    async disconnect() {
        await prisma.$disconnect();
    }
}

export const payRepository = new PayRepository();
