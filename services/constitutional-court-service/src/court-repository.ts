import { PrismaClient, Case, Ruling, Justice, CaseStatus, CaseType } from '@prisma/client';

const prisma = new PrismaClient();

export class CourtRepository {

    // --- Case Management ---

    async createCase(data: { title: string; description: string; plaintiffId: string; defendantId?: string; type: CaseType }) {
        return prisma.case.create({
            data
        });
    }

    async getCase(id: string) {
        return prisma.case.findUnique({
            where: { id },
            include: {
                rulings: true,
                appeals: true,
                hearings: true
            }
        });
    }

    async getAllCases(status?: CaseStatus) {
        return prisma.case.findMany({
            where: status ? { status } : undefined,
            orderBy: { filedAt: 'desc' }
        });
    }

    async updateCaseStatus(id: string, status: CaseStatus) {
        return prisma.case.update({
            where: { id },
            data: { status }
        });
    }

    // --- Justice Management ---

    async addJustice(data: { userId: string; name: string; termStart: Date }) {
        return prisma.justice.create({
            data
        });
    }

    async getActiveJustices() {
        return prisma.justice.findMany({
            where: { isActive: true }
        });
    }

    // --- Rulings ---

    async issueRuling(data: { caseId: string; justiceId: string; verdict: string; reasoning: string }) {
        const ruling = await prisma.ruling.create({
            data
        });

        // Automatically update case status to RULING_ISSUED
        await prisma.case.update({
            where: { id: data.caseId },
            data: { status: 'RULING_ISSUED' }
        });

        return ruling;
    }

    // --- Stats ---

    async getStats() {
        const [totalCases, activeCases, totalRulings] = await Promise.all([
            prisma.case.count(),
            prisma.case.count({ where: { status: { not: 'CLOSED' } } }),
            prisma.ruling.count()
        ]);

        return {
            totalCases,
            activeCases,
            totalRulings
        };
    }
}

export const courtRepository = new CourtRepository();
