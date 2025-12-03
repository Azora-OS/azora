import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LendingRepository {
    // Loan Product Methods
    async createLoanProduct(data: {
        name: string;
        interestRate: number;
        termMonths: number;
        minAmount: number;
        maxAmount: number;
    }) {
        return await prisma.loanProduct.create({
            data: {
                name: data.name,
                interestRate: data.interestRate,
                termMonths: data.termMonths,
                minAmount: data.minAmount,
                maxAmount: data.maxAmount,
            },
        });
    }

    async getActiveLoanProducts() {
        return await prisma.loanProduct.findMany({
            where: { isActive: true },
        });
    }

    // Loan Methods
    async createLoan(data: {
        userId: string;
        productId: string;
        amount: number;
        startDate?: Date;
    }) {
        const product = await prisma.loanProduct.findUnique({ where: { id: data.productId } });
        if (!product) throw new Error('Product not found');

        return await prisma.loan.create({
            data: {
                userId: data.userId,
                productId: data.productId,
                amount: data.amount,
                remainingBalance: data.amount, // Initial balance
                status: 'PENDING',
                startDate: data.startDate,
            },
        });
    }

    async getLoan(id: string) {
        return await prisma.loan.findUnique({
            where: { id },
            include: { product: true, repayments: true, collateral: true },
        });
    }

    async getUserLoans(userId: string) {
        return await prisma.loan.findMany({
            where: { userId },
            include: { product: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateLoanStatus(id: string, status: string) {
        return await prisma.loan.update({
            where: { id },
            data: { status },
        });
    }

    // Repayment Methods
    async createRepayment(data: {
        loanId: string;
        amount: number;
        dueDate: Date;
    }) {
        return await prisma.repayment.create({
            data: {
                loanId: data.loanId,
                amount: data.amount,
                dueDate: data.dueDate,
                status: 'SCHEDULED',
            },
        });
    }

    async recordRepayment(repaymentId: string) {
        return await prisma.repayment.update({
            where: { id: repaymentId },
            data: {
                status: 'PAID',
                paidAt: new Date(),
            },
        });
    }

    // Collateral Methods
    async addCollateral(data: {
        loanId: string;
        type: string;
        value: number;
        description?: string;
    }) {
        return await prisma.collateral.create({
            data: {
                loanId: data.loanId,
                type: data.type,
                value: data.value,
                description: data.description,
                status: 'HELD',
            },
        });
    }

    // Stats
    async getStats() {
        const totalLoans = await prisma.loan.count();
        const activeLoans = await prisma.loan.count({ where: { status: 'ACTIVE' } });
        const totalLentResult = await prisma.loan.aggregate({
            where: { status: { in: ['ACTIVE', 'PAID'] } },
            _sum: { amount: true },
        });

        return {
            totalLoans,
            activeLoans,
            totalLent: totalLentResult._sum.amount || 0,
        };
    }
}

export const lendingRepository = new LendingRepository();
