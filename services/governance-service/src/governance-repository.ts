import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class GovernanceRepository {
    // Proposal Methods
    async createProposal(data: {
        title: string;
        description: string;
        proposerId: string;
        type?: string;
        quorum?: number;
        passThreshold?: number;
        votingEndsAt?: Date;
    }) {
        return await prisma.proposal.create({
            data: {
                title: data.title,
                description: data.description,
                proposerId: data.proposerId,
                type: data.type || 'POLICY',
                quorum: data.quorum || 100,
                passThreshold: data.passThreshold || 0.66,
                votingEndsAt: data.votingEndsAt,
            },
        });
    }

    async getProposal(id: string) {
        return await prisma.proposal.findUnique({
            where: { id },
            include: { votes: true },
        });
    }

    async getAllProposals(filters?: {
        status?: string;
        type?: string;
        proposerId?: string;
    }) {
        return await prisma.proposal.findMany({
            where: filters,
            include: { votes: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateProposalStatus(id: string, status: string, executedAt?: Date) {
        return await prisma.proposal.update({
            where: { id },
            data: {
                status,
                executedAt: executedAt || (status === 'PASSED' ? new Date() : undefined),
            },
        });
    }

    async updateProposalVoteCounts(id: string, votesFor: number, votesAgainst: number) {
        return await prisma.proposal.update({
            where: { id },
            data: { votesFor, votesAgainst },
        });
    }

    // Vote Methods
    async castVote(data: {
        proposalId: string;
        userId: string;
        vote: string;
        weight?: number;
        reason?: string;
    }) {
        return await prisma.vote.create({
            data: {
                proposalId: data.proposalId,
                userId: data.userId,
                vote: data.vote,
                weight: data.weight || 1,
                reason: data.reason,
            },
        });
    }

    async getProposalVotes(proposalId: string) {
        return await prisma.vote.findMany({
            where: { proposalId },
            orderBy: { timestamp: 'desc' },
        });
    }

    async getUserVotes(userId: string) {
        return await prisma.vote.findMany({
            where: { userId },
            include: { proposal: true },
            orderBy: { timestamp: 'desc' },
        });
    }

    async getUserVoteOnProposal(proposalId: string, userId: string) {
        return await prisma.vote.findUnique({
            where: {
                proposalId_userId: {
                    proposalId,
                    userId,
                },
            },
        });
    }

    // Policy Methods
    async createPolicy(data: {
        title: string;
        description: string;
        category: string;
        content: any;
        proposalId?: string;
        createdBy: string;
    }) {
        return await prisma.policy.create({
            data,
        });
    }

    async getPolicy(id: string) {
        return await prisma.policy.findUnique({
            where: { id },
        });
    }

    async getAllPolicies(filters?: {
        status?: string;
        category?: string;
    }) {
        return await prisma.policy.findMany({
            where: filters,
            orderBy: { createdAt: 'desc' },
        });
    }

    async updatePolicyStatus(id: string, status: string) {
        return await prisma.policy.update({
            where: { id },
            data: { status },
        });
    }

    // Governance Audit Methods
    async logGovernanceAudit(data: {
        action: string;
        entityType: string;
        entityId: string;
        userId: string;
        details: any;
    }) {
        return await prisma.governanceAudit.create({
            data,
        });
    }

    async getEntityAuditTrail(entityType: string, entityId: string) {
        return await prisma.governanceAudit.findMany({
            where: { entityType, entityId },
            orderBy: { timestamp: 'desc' },
        });
    }

    async getUserAuditTrail(userId: string, limit: number = 100) {
        return await prisma.governanceAudit.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
            take: limit,
        });
    }

    // Statistics Methods
    async getProposalStats() {
        const total = await prisma.proposal.count();
        const active = await prisma.proposal.count({ where: { status: 'ACTIVE' } });
        const passed = await prisma.proposal.count({ where: { status: 'PASSED' } });
        const rejected = await prisma.proposal.count({ where: { status: 'REJECTED' } });

        return { total, active, passed, rejected };
    }

    async getVoteStats() {
        const totalVotes = await prisma.vote.count();
        const votesFor = await prisma.vote.count({ where: { vote: 'FOR' } });
        const votesAgainst = await prisma.vote.count({ where: { vote: 'AGAINST' } });
        const abstentions = await prisma.vote.count({ where: { vote: 'ABSTAIN' } });

        return { totalVotes, votesFor, votesAgainst, abstentions };
    }

    async getPolicyStats() {
        const total = await prisma.policy.count();
        const active = await prisma.policy.count({ where: { status: 'ACTIVE' } });
        const superseded = await prisma.policy.count({ where: { status: 'SUPERSEDED' } });
        const repealed = await prisma.policy.count({ where: { status: 'REPEALED' } });

        return { total, active, superseded, repealed };
    }
}

export const governanceRepository = new GovernanceRepository();
