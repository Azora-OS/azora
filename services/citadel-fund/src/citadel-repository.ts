/*
 * AZORA PROPRIETARY LICENSE
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * 
 * CitadelFund Service - Database Repository
 * Constitutional AI Operating System - No Mock Protocol Compliant
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AllocationProposal {
    id: string;
    title: string;
    description: string;
    amount: number;
    category: 'scholarship' | 'public_goods' | 'grant';
    votesFor: number;
    votesAgainst: number;
    status: 'pending' | 'approved' | 'rejected';
    proposer: string;
    createdAt: Date;
    votingDeadline: Date;
}

export interface RevenueRecord {
    id: string;
    amount: number;
    source: string;
    timestamp: Date;
    txHash?: string;
    category: 'education' | 'marketplace' | 'subscriptions' | 'other';
}

export interface AllocationRecord {
    id: string;
    proposalId: string;
    amount: number;
    recipient: string;
    timestamp: Date;
    txHash?: string;
    category: 'scholarship' | 'public_goods' | 'grant';
}

export interface TransparencyReport {
    totalRevenue: number;
    totalAllocated: number;
    availableFunds: number;
    allocations: {
        scholarships: number;
        publicGoods: number;
        grants: number;
    };
    revenueBreakdown: Record<string, number>;
    recentTransactions: any[];
    timestamp: Date;
}

export class CitadelRepository {
    /**
     * Get or create CitadelBalance
     */
    async getBalance() {
        let balance = await prisma.citadelBalance.findFirst();

        if (!balance) {
            balance = await prisma.citadelBalance.create({
                data: {
                    totalBalance: 0,
                    totalDistributed: 0,
                    totalScholarships: 0,
                },
            });
        }

        return balance;
    }

    /**
     * Update balance
     */
    async updateBalance(data: {
        totalBalance?: number;
        totalDistributed?: number;
        totalScholarships?: number;
    }) {
        const balance = await this.getBalance();

        return await prisma.citadelBalance.update({
            where: { id: balance.id },
            data,
        });
    }

    /**
     * Record revenue distribution
     */
    async recordRevenue(data: {
        sourceService: string;
        sourceReference?: string;
        amount: number;
        percentage?: number;
        metadata?: any;
    }) {
        return await prisma.revenueDistribution.create({
            data: {
                ...data,
                percentage: data.percentage || 10,
                metadata: data.metadata || {},
            },
        });
    }

    /**
     * Get revenue history
     */
    async getRevenueHistory(limit: number = 50) {
        return await prisma.revenueDistribution.findMany({
            orderBy: { distributedAt: 'desc' },
            take: limit,
        });
    }

    /**
     * Create scholarship
     */
    async createScholarship(data: {
        studentId: string;
        studentName?: string;
        studentEmail?: string;
        amount: number;
        reason: string;
        status?: string;
        approvedBy?: string;
        metadata?: any;
    }) {
        return await prisma.scholarship.create({
            data: {
                ...data,
                status: data.status || 'PENDING',
                metadata: data.metadata || {},
            },
        });
    }

    /**
     * Update scholarship status
     */
    async updateScholarship(id: string, data: {
        status?: string;
        disbursedAt?: Date;
        approvedBy?: string;
    }) {
        return await prisma.scholarship.update({
            where: { id },
            data,
        });
    }

    /**
     * Get scholarships
     */
    async getScholarships(filters?: {
        studentId?: string;
        status?: string;
        limit?: number;
    }) {
        return await prisma.scholarship.findMany({
            where: {
                studentId: filters?.studentId,
                status: filters?.status,
            },
            orderBy: { awardedAt: 'desc' },
            take: filters?.limit || 50,
        });
    }

    /**
     * Record allocation
     */
    async recordAllocation(data: {
        allocationType: string;
        amount: number;
        recipient?: string;
        description: string;
        allocatedBy?: string;
        transactionHash?: string;
        metadata?: any;
    }) {
        return await prisma.allocationHistory.create({
            data: {
                ...data,
                metadata: data.metadata || {},
            },
        });
    }

    /**
     * Get allocation history
     */
    async getAllocationHistory(limit: number = 50) {
        return await prisma.allocationHistory.findMany({
            orderBy: { allocatedAt: 'desc' },
            take: limit,
        });
    }

    /**
     * Governance proposals CRUD
     */
    async createProposal(data: {
        title: string;
        description?: string;
        amount: number;
        category: string;
        proposer: string;
        votingDeadline?: Date;
    }) {
        return await prisma.governanceProposal.create({
            data: {
                title: data.title,
                description: data.description || '',
                amount: data.amount,
                category: data.category,
                proposer: data.proposer,
                votingDeadline: data.votingDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
    }

    async getProposals(limit: number = 50) {
        return await prisma.governanceProposal.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    async getProposal(id: string) {
        return await prisma.governanceProposal.findUnique({
            where: { id },
        });
    }

    async voteOnProposal(id: string, voteFor: boolean) {
        // Atomic update using Prisma transaction
        return await prisma.$transaction(async (tx) => {
            const existing = await tx.governanceProposal.findUnique({ where: { id } });
            if (!existing) throw new Error('Proposal not found');

            const updated = await tx.governanceProposal.update({
                where: { id },
                data: {
                    votesFor: { increment: voteFor ? 1 : 0 },
                    votesAgainst: { increment: voteFor ? 0 : 1 },
                },
            });

            // If enough votes, update status accordingly
            const totalVotes = updated.votesFor + updated.votesAgainst;
            let status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING';
            if (totalVotes >= 10 && updated.votesFor > updated.votesAgainst) status = 'APPROVED';
            if (totalVotes >= 10 && updated.votesAgainst > updated.votesFor) status = 'REJECTED';

            if (status !== 'PENDING') {
                await tx.governanceProposal.update({ where: { id }, data: { status } });
            }

            return tx.governanceProposal.findUnique({ where: { id } });
        });
    }

    async updateProposalStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
        return await prisma.governanceProposal.update({
            where: { id },
            data: { status },
        });
    }

    /**
     * Update community impact metrics
     */
    async updateCommunityImpact(data: {
        period: string;
        studentsSupported: number;
        totalDisbursed: number;
        averageScholarship: number;
        ubuntuScore: number;
        collectiveImpact: number;
    }) {
        // Check if record exists for this period
        const existing = await prisma.communityImpact.findFirst({
            where: { period: data.period },
        });

        if (existing) {
            return await prisma.communityImpact.update({
                where: { id: existing.id },
                data,
            });
        } else {
            return await prisma.communityImpact.create({
                data,
            });
        }
    }

    /**
     * Get community impact metrics
     */
    async getCommunityImpact(period?: string) {
        if (period) {
            return await prisma.communityImpact.findFirst({
                where: { period },
            });
        }

        return await prisma.communityImpact.findMany({
            orderBy: { calculatedAt: 'desc' },
            take: 12, // Last 12 periods
        });
    }

    /**
     * Record constitutional audit
     */
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

    /**
     * Get constitutional audits
     */
    async getAudits(auditType?: string, limit: number = 10) {
        return await prisma.constitutionalAudit.findMany({
            where: auditType ? { auditType } : undefined,
            orderBy: { auditedAt: 'desc' },
            take: limit,
        });
    }

    /**
     * Get transparency report data
     */
    async getTransparencyData(): Promise<TransparencyReport> {
        const balance = await this.getBalance();
        const revenues = await this.getRevenueHistory(1000);
        const allocations = await this.getAllocationHistory(1000);

        // Calculate totals
        const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
        const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);

        // Calculate breakdown by category
        const revenueBreakdown: Record<string, number> = {};
        revenues.forEach(r => {
            revenueBreakdown[r.sourceService] = (revenueBreakdown[r.sourceService] || 0) + r.amount;
        });

        // Calculate allocations by type
        const allocationsByType = {
            scholarships: 0,
            publicGoods: 0,
            grants: 0,
        };

        allocations.forEach(a => {
            if (a.allocationType === 'SCHOLARSHIP') allocationsByType.scholarships += a.amount;
            else if (a.allocationType === 'PUBLIC_GOODS') allocationsByType.publicGoods += a.amount;
            else if (a.allocationType === 'COMMUNITY_FUND') allocationsByType.grants += a.amount;
        });

        // Get recent transactions
        const recentRevenues = revenues.slice(0, 5).map(r => ({
            ...r,
            type: 'revenue',
            timestamp: r.distributedAt,
        }));

        const recentAllocations = allocations.slice(0, 5).map(a => ({
            ...a,
            type: 'allocation',
            timestamp: a.allocatedAt,
        }));

        const recentTransactions = [...recentRevenues, ...recentAllocations]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10);

        return {
            totalRevenue,
            totalAllocated,
            availableFunds: totalRevenue - totalAllocated,
            allocations: allocationsByType,
            revenueBreakdown,
            recentTransactions,
            timestamp: new Date(),
        };
    }

    /**
     * Disconnect Prisma client
     */
    async disconnect() {
        await prisma.$disconnect();
    }
}

export const citadelRepository = new CitadelRepository();
