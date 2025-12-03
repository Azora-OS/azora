import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auditLogger = {
    async logValidation(data: {
        action: string;
        context: string;
        isEthical: boolean;
        score: number;
        ubuntuAlignment: number;
        reasoning: string;
    }) {
        return prisma.ethicalAudit.create({ data });
    },

    async logVeto(data: {
        action: string;
        reason: string;
        violations: string[];
    }) {
        return prisma.vetoLog.create({ data });
    },

    async logBiasCheck(data: {
        content: string;
        hasBias: boolean;
        biasType?: string;
        confidence: number;
        severity: string;
    }) {
        return prisma.biasReport.create({ data });
    }
};
