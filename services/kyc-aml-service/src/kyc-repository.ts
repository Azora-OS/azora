import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class KYCRepository {
    // KYC Verification Methods
    async createVerification(data: {
        userId: string;
        documentType: string;
        documentData?: any;
        riskLevel?: string;
    }) {
        return await prisma.kYCVerification.create({
            data: {
                userId: data.userId,
                documentType: data.documentType,
                documentData: data.documentData || {},
                riskLevel: data.riskLevel || 'LOW',
                status: 'PENDING',
            },
        });
    }

    async getVerification(id: string) {
        return await prisma.kYCVerification.findUnique({
            where: { id },
        });
    }

    async getUserVerifications(userId: string) {
        return await prisma.kYCVerification.findMany({
            where: { userId },
            orderBy: { submittedAt: 'desc' },
        });
    }

    async updateVerificationStatus(
        id: string,
        status: string,
        reviewedBy?: string,
        reviewNotes?: string
    ) {
        return await prisma.kYCVerification.update({
            where: { id },
            data: {
                status,
                reviewedBy,
                reviewNotes,
                reviewedAt: new Date(),
            },
        });
    }

    async getVerificationsByStatus(status: string) {
        return await prisma.kYCVerification.findMany({
            where: { status },
            orderBy: { submittedAt: 'desc' },
        });
    }

    // Risk Assessment Methods
    async createRiskAssessment(data: {
        userId: string;
        assessmentType: string;
        riskScore: number;
        riskLevel: string;
        factors: any;
        recommendations?: string;
        assessedBy?: string;
    }) {
        return await prisma.riskAssessment.create({
            data,
        });
    }

    async getUserRiskAssessments(userId: string) {
        return await prisma.riskAssessment.findMany({
            where: { userId },
            orderBy: { assessedAt: 'desc' },
        });
    }

    async getLatestRiskAssessment(userId: string, assessmentType: string) {
        return await prisma.riskAssessment.findFirst({
            where: { userId, assessmentType },
            orderBy: { assessedAt: 'desc' },
        });
    }

    async getHighRiskUsers() {
        return await prisma.riskAssessment.findMany({
            where: {
                riskLevel: {
                    in: ['HIGH', 'CRITICAL'],
                },
            },
            orderBy: { assessedAt: 'desc' },
            distinct: ['userId'],
        });
    }

    // Compliance Audit Methods
    async logComplianceAudit(data: {
        userId: string;
        action: string;
        details: any;
        performedBy?: string;
        ipAddress?: string;
        userAgent?: string;
    }) {
        return await prisma.complianceAudit.create({
            data,
        });
    }

    async getUserAuditTrail(userId: string, limit: number = 100) {
        return await prisma.complianceAudit.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
            take: limit,
        });
    }

    async getAuditsByAction(action: string, limit: number = 100) {
        return await prisma.complianceAudit.findMany({
            where: { action },
            orderBy: { timestamp: 'desc' },
            take: limit,
        });
    }

    async getAuditsByDateRange(startDate: Date, endDate: Date) {
        return await prisma.complianceAudit.findMany({
            where: {
                timestamp: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { timestamp: 'desc' },
        });
    }

    // Statistics Methods
    async getVerificationStats() {
        const total = await prisma.kYCVerification.count();
        const pending = await prisma.kYCVerification.count({
            where: { status: 'PENDING' },
        });
        const approved = await prisma.kYCVerification.count({
            where: { status: 'APPROVED' },
        });
        const rejected = await prisma.kYCVerification.count({
            where: { status: 'REJECTED' },
        });

        return { total, pending, approved, rejected };
    }

    async getRiskDistribution() {
        const low = await prisma.riskAssessment.count({
            where: { riskLevel: 'LOW' },
        });
        const medium = await prisma.riskAssessment.count({
            where: { riskLevel: 'MEDIUM' },
        });
        const high = await prisma.riskAssessment.count({
            where: { riskLevel: 'HIGH' },
        });
        const critical = await prisma.riskAssessment.count({
            where: { riskLevel: 'CRITICAL' },
        });

        return { low, medium, high, critical };
    }
}

export const kycRepository = new KYCRepository();
