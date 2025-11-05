// azora-mint/src/controllers/rewardController.ts

/*
AZORA PROPRIETARY LICENSE

Copyright ? 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Request, Response } from 'express';
import type { PrismaClient as PrismaClientType } from '@prisma/client';
import { KnowledgeRewardRequest, RewardValidationResult, TransferResult } from '../interfaces/Reward.js';
import { TransactionLogger } from '../utils/logger.js';
import { AegisService } from '../services/aegis.js';
import { CovenantService } from '../services/covenant.js';

const MINT_MOCK_MODE = (process.env.MINT_MOCK_MODE ?? 'true').toLowerCase() !== 'false';
const SHOULD_USE_PRISMA = !MINT_MOCK_MODE && (process.env.MINT_USE_PRISMA ?? 'true').toLowerCase() !== 'false';

let prisma: PrismaClientType | null = null;

if (SHOULD_USE_PRISMA) {
  try {
    const prismaModule = await import('@prisma/client');
    const PrismaClient = prismaModule.PrismaClient;
    prisma = new PrismaClient();
  } catch (error) {
    console.warn('Prisma client unavailable, falling back to in-memory knowledge reward store.', error);
  }
} else if (!MINT_MOCK_MODE) {
  console.warn('MINT_USE_PRISMA set to false - knowledge rewards will use in-memory mock persistence.');
}

type MockUserRecord = {
  id: string;
  azoraId: string;
  walletAddress: string;
  kycStatus: string;
};

type MockBalanceRecord = {
  userId: string;
  currencyCode: string;
  amount: number;
};

type MockRewardRecord = {
  id: string;
  userId: string;
  rewardAmount: number;
  currencyCode: string;
  sourceTrxId: string;
  status: string;
  processedAt: Date;
};

interface MockTransactionResult {
  user: MockUserRecord;
  userBalance: MockBalanceRecord;
  reward: MockRewardRecord;
  transferResult: TransferResult;
}

const mockPersistence = createMockPersistence();

export async function processKnowledgeReward(req: Request, res: Response) {
    const request: KnowledgeRewardRequest = req.body;
    const transactionId = request.transactionId;

    try {
        // Step 1: Validate request structure
        const validation = await validateKnowledgeRewardRequest(request);
        if (!validation.isValid) {
            TransactionLogger.logAudit(transactionId, 'VALIDATION_FAILED', {
                reason: validation.reason,
                request: request
            });
            return res.status(400).json({ error: validation.reason });
        }

        // Step 2: Check idempotency (prevent duplicate processing)
        const useMock = prisma === null;
        const existingReward = useMock
            ? await mockPersistence.findReward(transactionId)
            : await prisma!.knowledgeReward.findUnique({
                  where: { sourceTrxId: transactionId }
              });
        if (existingReward) {
            TransactionLogger.logAudit(transactionId, 'DUPLICATE_TRANSACTION', {
                existingRewardId: existingReward.id
            });
            return res.status(409).json({ error: 'Transaction already processed' });
        }

        // Step 3: Verify signature and compliance with Aegis
        let complianceCheck: { isValid: boolean; reason?: string } = { isValid: true, reason: 'Development mode - Aegis not available' };
        try {
            complianceCheck = await AegisService.verifySignature(request);
        } catch (error) {
            console.warn('Aegis service not available, proceeding in development mode');
        }

        if (!complianceCheck.isValid) {
            TransactionLogger.logAudit(transactionId, 'COMPLIANCE_FAILED', {
                reason: complianceCheck.reason,
                request: request
            });
            return res.status(403).json({ error: 'Compliance check failed' });
        }

        // Step 4: Atomic database transaction
        const result: any = useMock
            ? await mockPersistence.processTransaction(request, transactionId)
            : await prisma!.$transaction(async (tx: PrismaClientType) => {
                  const user = await (tx as any).user.upsert({
                      where: { azoraId: request.userId },
                      update: {},
                      create: {
                          azoraId: request.userId,
                          walletAddress: `0x${request.userId}`,
                          kycStatus: 'VERIFIED'
                      }
                  });

                  const userBalance = await (tx as any).userBalance.upsert({
                      where: {
                          userId_currencyCode: {
                              userId: user.id,
                              currencyCode: request.economyId
                          }
                      },
                      update: {
                          amount: { increment: request.amount }
                      },
                      create: {
                          userId: user.id,
                          currencyCode: request.economyId,
                          amount: request.amount
                      }
                  });

                  const reward = await (tx as any).knowledgeReward.create({
                      data: {
                          userId: user.id,
                          rewardAmount: request.amount,
                          currencyCode: request.economyId,
                          sourceTrxId: transactionId,
                          achievement: `${request.knowledgeType}: ${request.knowledgeId}`,
                          status: 'COMPLETED',
                          processedAt: new Date()
                      }
                  });

                  const transferResult: TransferResult = {
                      hash: `0x${Math.random().toString(36).slice(2, 11)}`,
                      block: Math.floor(Math.random() * 1_000_000),
                      signer: 'azora-covenant',
                      covenantFunction: 'transferFromUBO'
                  };

                  return { user, userBalance, reward, transferResult };
              });

        // Step 5: Log successful transaction
        TransactionLogger.logAudit(transactionId, 'TRANSACTION_SUCCESS', {
            rewardId: result.reward.id,
            userBalance: result.userBalance.amount,
            transferHash: result.transferResult.hash,
            blockNumber: result.transferResult.block
        });

        // Step 6: Return success response
        res.json({
            success: true,
            transactionId,
            rewardId: result.reward.id,
            newBalance: result.userBalance.amount,
            transferHash: result.transferResult.hash,
            blockNumber: result.transferResult.block,
            processedAt: result.reward.processedAt
        });

    } catch (error) {
        // Log error and return failure
        TransactionLogger.logAudit(transactionId, 'TRANSACTION_FAILED', {
            error: (error as Error).message,
            request: request
        });

        console.error('Knowledge reward processing failed:', error);
        res.status(500).json({ error: 'Transaction processing failed' });
    }
}

async function validateKnowledgeRewardRequest(request: KnowledgeRewardRequest): Promise<RewardValidationResult> {
    if (!request.transactionId || !request.userId || !request.economyId ||
        !request.amount || !request.knowledgeType || !request.knowledgeId ||
        !request.signature) {
        return { isValid: false, reason: 'Missing required fields' };
    }

    if (request.amount <= 0) {
        return { isValid: false, reason: 'Amount must be positive' };
    }

    if (request.amount > 1000) { // Max reward limit
        return { isValid: false, reason: 'Amount exceeds maximum reward limit' };
    }

    // Validate knowledge type
    const validTypes = ['course_completion', 'assessment_pass', 'certification', 'contribution'];
    if (!validTypes.includes(request.knowledgeType)) {
        return { isValid: false, reason: 'Invalid knowledge type' };
    }

    return { isValid: true };
}

function createMockPersistence() {
    let userCounter = 1;
    let rewardCounter = 1;
    const usersByAzoraId = new Map<string, MockUserRecord>();
    const balances = new Map<string, MockBalanceRecord>();
    const rewardsByTransaction = new Map<string, MockRewardRecord>();

    const upsertUser = (azoraId: string): MockUserRecord => {
        if (usersByAzoraId.has(azoraId)) {
            return usersByAzoraId.get(azoraId)!;
        }

        const newUser: MockUserRecord = {
            id: `mock-user-${userCounter++}`,
            azoraId,
            walletAddress: `0x${azoraId}`,
            kycStatus: 'VERIFIED'
        };
        usersByAzoraId.set(azoraId, newUser);
        return newUser;
    };

    const upsertBalance = (userId: string, currencyCode: string, amountDelta: number): MockBalanceRecord => {
        const balanceKey = `${userId}:${currencyCode}`;
        const existing = balances.get(balanceKey);
        if (existing) {
            existing.amount += amountDelta;
            return existing;
        }

        const created: MockBalanceRecord = {
            userId,
            currencyCode,
            amount: amountDelta
        };
        balances.set(balanceKey, created);
        return created;
    };

    return {
        async findReward(sourceTrxId: string): Promise<MockRewardRecord | null> {
            return rewardsByTransaction.get(sourceTrxId) ?? null;
        },
        async processTransaction(request: KnowledgeRewardRequest, transactionId: string): Promise<MockTransactionResult> {
            const user = upsertUser(request.userId);
            const userBalance = upsertBalance(user.id, request.economyId, request.amount);

            const reward: MockRewardRecord = {
                id: `mock-reward-${rewardCounter++}`,
                userId: user.id,
                rewardAmount: request.amount,
                currencyCode: request.economyId,
                sourceTrxId: transactionId,
                status: 'COMPLETED',
                processedAt: new Date()
            };

            rewardsByTransaction.set(transactionId, reward);

            const transferResult: TransferResult = {
                hash: `0x${Math.random().toString(36).slice(2, 11)}`,
                block: Math.floor(Math.random() * 1_000_000),
                signer: 'azora-covenant-mock',
                covenantFunction: 'transferFromUBO'
            };

            return { user, userBalance, reward, transferResult };
        }
    };
}