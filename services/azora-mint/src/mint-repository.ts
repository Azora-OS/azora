/*
 * AZORA PROPRIETARY LICENSE
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * 
 * Azora Mint Service - Database Repository
 * Constitutional AI Operating System - No Mock Protocol Compliant
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MintRepository {
    // ========== DIGITAL ASSETS ==========

    async createDigitalAsset(data: {
        tokenId: string;
        name: string;
        description: string;
        imageUrl?: string;
        imageHash?: string;
        metadataUri: string;
        metadataHash: string;
        owner: string;
        creator: string;
        collectionId?: string;
        royalty?: number;
        supply?: number;
        blockchainTxHash?: string;
        attributes?: any;
    }) {
        return await prisma.digitalAsset.create({
            data: {
                ...data,
                royalty: data.royalty || 0,
                supply: data.supply || 1,
                attributes: data.attributes || {},
            },
        });
    }

    async getDigitalAsset(id: string) {
        return await prisma.digitalAsset.findUnique({
            where: { id },
            include: { collection: true },
        });
    }

    async getDigitalAssetByTokenId(tokenId: string) {
        return await prisma.digitalAsset.findUnique({
            where: { tokenId },
            include: { collection: true },
        });
    }

    async getUserDigitalAssets(userId: string) {
        return await prisma.digitalAsset.findMany({
            where: {
                OR: [
                    { owner: userId },
                    { creator: userId },
                ],
            },
            include: { collection: true },
            orderBy: { mintedAt: 'desc' },
        });
    }

    async updateDigitalAsset(id: string, data: {
        owner?: string;
        status?: string;
        blockchainTxHash?: string;
    }) {
        return await prisma.digitalAsset.update({
            where: { id },
            data,
        });
    }

    // ========== CERTIFICATES ==========

    async createCertificate(data: {
        tokenId: string;
        recipientName: string;
        recipientEmail?: string;
        courseName: string;
        institution: string;
        issueDate: string;
        expiryDate?: string;
        grade?: string;
        instructor?: string;
        certificateType?: string;
        documentUrl?: string;
        documentHash?: string;
        metadataUri: string;
        metadataHash: string;
        verificationCode: string;
        issuedBy: string;
        blockchainTxHash?: string;
    }) {
        return await prisma.certificate.create({
            data: {
                ...data,
                certificateType: data.certificateType || 'completion',
            },
        });
    }

    async getCertificate(id: string) {
        return await prisma.certificate.findUnique({
            where: { id },
        });
    }

    async getCertificateByTokenId(tokenId: string) {
        return await prisma.certificate.findUnique({
            where: { tokenId },
        });
    }

    async getCertificateByVerificationCode(code: string) {
        return await prisma.certificate.findUnique({
            where: { verificationCode: code.toUpperCase() },
        });
    }

    async getUserCertificates(userId: string) {
        return await prisma.certificate.findMany({
            where: {
                OR: [
                    { recipientEmail: userId },
                    { issuedBy: userId },
                ],
            },
            orderBy: { issuedAt: 'desc' },
        });
    }

    async updateCertificate(id: string, data: {
        status?: string;
        blockchainTxHash?: string;
    }) {
        return await prisma.certificate.update({
            where: { id },
            data,
        });
    }

    // ========== COLLECTIONS ==========

    async createCollection(data: {
        name: string;
        description: string;
        category?: string;
        isPublic?: boolean;
        creator: string;
        coverImageUrl?: string;
    }) {
        return await prisma.collection.create({
            data: {
                ...data,
                category: data.category || 'art',
                isPublic: data.isPublic !== undefined ? data.isPublic : true,
            },
        });
    }

    async getCollection(id: string) {
        return await prisma.collection.findUnique({
            where: { id },
            include: {
                assets: {
                    orderBy: { mintedAt: 'desc' },
                    take: 10,
                },
            },
        });
    }

    async getCollections(filters?: {
        category?: string;
        isPublic?: boolean;
        creator?: string;
        skip?: number;
        take?: number;
    }) {
        return await prisma.collection.findMany({
            where: {
                category: filters?.category,
                isPublic: filters?.isPublic,
                creator: filters?.creator,
            },
            skip: filters?.skip || 0,
            take: filters?.take || 20,
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateCollection(id: string, data: {
        assetCount?: number;
        totalVolume?: number;
        coverImageUrl?: string;
    }) {
        return await prisma.collection.update({
            where: { id },
            data,
        });
    }

    async incrementCollectionAssetCount(collectionId: string) {
        return await prisma.collection.update({
            where: { id: collectionId },
            data: {
                assetCount: {
                    increment: 1,
                },
            },
        });
    }

    // ========== MINTING QUEUE ==========

    async addToMintingQueue(data: {
        userId: string;
        assetType: string;
        metadata: any;
        priority?: number;
    }) {
        return await prisma.mintingQueue.create({
            data: {
                ...data,
                priority: data.priority || 0,
                metadata: data.metadata || {},
            },
        });
    }

    async getNextMintingJob() {
        return await prisma.mintingQueue.findFirst({
            where: { status: 'pending' },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'asc' },
            ],
        });
    }

    async updateMintingJob(id: string, data: {
        status?: string;
        processedAt?: Date;
        completedAt?: Date;
        errorMessage?: string;
        resultTokenId?: string;
        resultTxHash?: string;
    }) {
        return await prisma.mintingQueue.update({
            where: { id },
            data,
        });
    }

    // ========== BLOCKCHAIN TRANSACTIONS ==========

    async recordTransaction(data: {
        transactionHash: string;
        fromAddress: string;
        toAddress: string;
        tokenId?: string;
        amount?: string;
        gasUsed?: string;
        gasPrice?: string;
        blockNumber?: number;
        status?: string;
        eventType: string;
        metadata?: any;
    }) {
        return await prisma.blockchainTransaction.create({
            data: {
                ...data,
                status: data.status || 'pending',
                metadata: data.metadata || {},
            },
        });
    }

    async getTransaction(transactionHash: string) {
        return await prisma.blockchainTransaction.findUnique({
            where: { transactionHash },
        });
    }

    async getTransactionsByAddress(address: string, limit: number = 50) {
        return await prisma.blockchainTransaction.findMany({
            where: {
                OR: [
                    { fromAddress: address },
                    { toAddress: address },
                ],
            },
            orderBy: { timestamp: 'desc' },
            take: limit,
        });
    }

    async updateTransaction(transactionHash: string, data: {
        status?: string;
        blockNumber?: number;
        gasUsed?: string;
        gasPrice?: string;
    }) {
        return await prisma.blockchainTransaction.update({
            where: { transactionHash },
            data,
        });
    }

    // ========== TOKEN BALANCES ==========

    async getTokenBalance(address: string) {
        let balance = await prisma.tokenBalance.findUnique({
            where: { address },
        });

        if (!balance) {
            balance = await prisma.tokenBalance.create({
                data: {
                    address,
                    balance: '0',
                },
            });
        }

        return balance;
    }

    async updateTokenBalance(address: string, balance: string) {
        return await prisma.tokenBalance.upsert({
            where: { address },
            update: { balance },
            create: { address, balance },
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

    async getAudits(auditType?: string, limit: number = 10) {
        return await prisma.constitutionalAudit.findMany({
            where: auditType ? { auditType } : undefined,
            orderBy: { auditedAt: 'desc' },
            take: limit,
        });
    }

    // ========== UTILITY ==========

    async disconnect() {
        await prisma.$disconnect();
    }
}

export const mintRepository = new MintRepository();
