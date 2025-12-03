import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EnterpriseRepository {
    // Account Methods
    async createAccount(data: {
        name: string;
        contactEmail: string;
        domain?: string;
    }) {
        return await prisma.enterpriseAccount.create({
            data: {
                name: data.name,
                contactEmail: data.contactEmail,
                domain: data.domain,
                status: 'ACTIVE',
            },
        });
    }

    async getAccount(id: string) {
        return await prisma.enterpriseAccount.findUnique({
            where: { id },
            include: { licenses: true, departments: true },
        });
    }

    // License Methods
    async addLicense(data: {
        accountId: string;
        type: string;
        maxSeats?: number;
        expiresAt: Date;
    }) {
        return await prisma.license.create({
            data: {
                accountId: data.accountId,
                type: data.type,
                maxSeats: data.maxSeats,
                expiresAt: data.expiresAt,
            },
        });
    }

    async getAccountLicenses(accountId: string) {
        return await prisma.license.findMany({
            where: { accountId },
        });
    }

    // Department Methods
    async createDepartment(data: {
        accountId: string;
        name: string;
        budget?: number;
    }) {
        return await prisma.department.create({
            data: {
                accountId: data.accountId,
                name: data.name,
                budget: data.budget,
            },
        });
    }

    // Employee Methods
    async addEmployee(data: {
        departmentId: string;
        userId: string;
        role: string;
    }) {
        return await prisma.employee.create({
            data: {
                departmentId: data.departmentId,
                userId: data.userId,
                role: data.role,
            },
        });
    }

    async getDepartmentEmployees(departmentId: string) {
        return await prisma.employee.findMany({
            where: { departmentId },
        });
    }

    // Stats
    async getStats() {
        const totalAccounts = await prisma.enterpriseAccount.count();
        const totalEmployees = await prisma.employee.count();

        return {
            totalAccounts,
            totalEmployees,
        };
    }
}

export const enterpriseRepository = new EnterpriseRepository();
