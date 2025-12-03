import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class TamperProofRepository {
    // Data Storage Methods
    async storeData(data: {
        userId: string;
        dataType: string;
        data: any;
        dataHash: string;
        signature: string;
        metadata?: any;
    }) {
        return await prisma.tamperProofData.create({
            data: {
                userId: data.userId,
                dataType: data.dataType,
                data: data.data,
                dataHash: data.dataHash,
                signature: data.signature,
                metadata: data.metadata || {},
            },
        });
    }

    async retrieveData(dataId: string) {
        return await prisma.tamperProofData.findUnique({
            where: { id: dataId },
            include: { auditTrail: true },
        });
    }

    async updateData(dataId: string, data: {
        data: any;
        dataHash: string;
        signature: string;
        metadata?: any;
    }) {
        return await prisma.tamperProofData.update({
            where: { id: dataId },
            data: {
                data: data.data,
                dataHash: data.dataHash,
                signature: data.signature,
                metadata: data.metadata,
                updatedAt: new Date(),
            },
        });
    }

    async deleteData(dataId: string) {
        return await prisma.tamperProofData.delete({
            where: { id: dataId },
        });
    }

    async listUserData(userId: string) {
        return await prisma.tamperProofData.findMany({
            where: { userId },
            select: {
                id: true,
                dataType: true,
                dataHash: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Audit Trail Methods
    async addToAuditTrail(data: {
        dataId: string;
        action: string;
        userId: string;
        dataType: string;
        ipAddress?: string;
        userAgent?: string;
    }) {
        return await prisma.dataAuditTrail.create({
            data,
        });
    }

    async getAuditTrail(dataId: string) {
        return await prisma.dataAuditTrail.findMany({
            where: { dataId },
            orderBy: { timestamp: 'desc' },
        });
    }

    async getUserAuditTrail(userId: string, limit: number = 100) {
        return await prisma.dataAuditTrail.findMany({
            where: { userId },
            orderBy: { timestamp: 'desc' },
            take: limit,
        });
    }

    // Integrity Check Methods
    async logIntegrityCheck(data: {
        dataId: string;
        expectedHash: string;
        actualHash: string;
        isValid: boolean;
        checkedBy?: string;
    }) {
        return await prisma.integrityCheck.create({
            data,
        });
    }

    async getIntegrityChecks(dataId: string) {
        return await prisma.integrityCheck.findMany({
            where: { dataId },
            orderBy: { checkedAt: 'desc' },
        });
    }

    async getFailedIntegrityChecks(limit: number = 50) {
        return await prisma.integrityCheck.findMany({
            where: { isValid: false },
            orderBy: { checkedAt: 'desc' },
            take: limit,
        });
    }

    // Verification Methods
    async verifyDataIntegrity(dataId: string): Promise<boolean> {
        const data = await this.retrieveData(dataId);
        if (!data) return false;

        // Recreate hash
        const dataString = typeof data.data === 'string' ? data.data : JSON.stringify(data.data);
        const currentHash = crypto.createHash('sha256').update(dataString).digest('hex');

        const isValid = currentHash === data.dataHash;

        // Log integrity check
        await this.logIntegrityCheck({
            dataId,
            expectedHash: data.dataHash,
            actualHash: currentHash,
            isValid,
            checkedBy: 'system',
        });

        return isValid;
    }

    async verifyAllUserData(userId: string) {
        const userDataList = await prisma.tamperProofData.findMany({
            where: { userId },
        });

        const results = [];
        for (const data of userDataList) {
            const isValid = await this.verifyDataIntegrity(data.id);
            results.push({
                id: data.id,
                dataType: data.dataType,
                isValid,
                createdAt: data.createdAt,
            });
        }

        return results;
    }

    // Statistics
    async getStats() {
        const total = await prisma.tamperProofData.count();
        const totalChecks = await prisma.integrityCheck.count();
        const failedChecks = await prisma.integrityCheck.count({
            where: { isValid: false },
        });

        return { total, totalChecks, failedChecks };
    }
}

export const tamperProofRepository = new TamperProofRepository();
