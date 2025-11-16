/**
 * Token Burn Repository Service
 * Handles database operations for token burn transactions
 */

import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { createLogger } from '../shared/logging';
import {
  BurnTransactionRecord,
  BurnHistoryResult,
  BurnStatistics,
  ProofOfKnowledgeRecord,
  TokenSupplyData,
  BurnTransactionFilter,
  BurnTransactionType,
  BlockchainStatus,
} from './token-burn.types';

const logger = createLogger('TokenBurnRepository');

const prisma = new PrismaClient();

export class TokenBurnRepository {
  /**
   * Create burn transaction record
   */
  async createBurnTransaction(
    userId: string,
    amount: Decimal,
    burnRate: number,
    burnedAmount: Decimal,
    transactionType: BurnTransactionType,
    reason: string,
    metadata?: Record<string, any>
  ): Promise<BurnTransactionRecord> {
    try {
      logger.info('Creating burn transaction', {
        userId,
        amount: amount.toString(),
        burnedAmount: burnedAmount.toString(),
        transactionType,
      });

      const transaction = await prisma.burnTransaction.create({
        data: {
          userId,
          amount,
          burnRate,
          burnedAmount,
          transactionType,
          reason,
          metadata,
          blockchainStatus: BlockchainStatus.PENDING,
        },
      });

      return this.mapBurnTransaction(transaction);
    } catch (error) {
      logger.error('Failed to create burn transaction', { error, userId });
      throw error instanceof Error ? error : new Error('Failed to create burn transaction');
    }
  }

  /**
   * Update burn transaction with blockchain hash
   */
  async updateBurnTransactionHash(
    transactionId: string,
    txHash: string,
    status: BlockchainStatus
  ): Promise<BurnTransactionRecord> {
    try {
      logger.info('Updating burn transaction hash', { transactionId, txHash, status });

      const transaction = await prisma.burnTransaction.update({
        where: { id: transactionId },
        data: {
          blockchainTxHash: txHash,
          blockchainStatus: status,
        },
      });

      return this.mapBurnTransaction(transaction);
    } catch (error) {
      logger.error('Failed to update burn transaction hash', { error, transactionId });
      throw error instanceof Error ? error : new Error('Failed to update burn transaction hash');
    }
  }

  /**
   * Get burn transaction by ID
   */
  async getBurnTransaction(transactionId: string): Promise<BurnTransactionRecord | null> {
    try {
      const transaction = await prisma.burnTransaction.findUnique({
        where: { id: transactionId },
      });

      return transaction ? this.mapBurnTransaction(transaction) : null;
    } catch (error) {
      logger.error('Failed to get burn transaction', { error, transactionId });
      throw error instanceof Error ? error : new Error('Failed to get burn transaction');
    }
  }

  /**
   * Get burn transaction history
   */
  async getBurnHistory(
    filter: BurnTransactionFilter
  ): Promise<BurnHistoryResult> {
    try {
      const page = filter.page || 1;
      const limit = filter.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (filter.userId) {
        where.userId = filter.userId;
      }

      if (filter.transactionType) {
        where.transactionType = filter.transactionType;
      }

      if (filter.blockchainStatus) {
        where.blockchainStatus = filter.blockchainStatus;
      }

      if (filter.startDate || filter.endDate) {
        where.createdAt = {};
        if (filter.startDate) {
          where.createdAt.gte = filter.startDate;
        }
        if (filter.endDate) {
          where.createdAt.lte = filter.endDate;
        }
      }

      const [transactions, total] = await Promise.all([
        prisma.burnTransaction.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.burnTransaction.count({ where }),
      ]);

      const totalBurned = transactions.reduce(
        (sum: Decimal, t: any): Decimal => sum.plus(t.burnedAmount),
        new Decimal(0)
      );

      return {
        transactions: transactions.map((t: any) => this.mapBurnTransaction(t)),
        total,
        page,
        limit,
        totalBurned,
      };
    } catch (error) {
      logger.error('Failed to get burn history', { error, filter });
      throw error instanceof Error ? error : new Error('Failed to get burn history');
    }
  }

  /**
   * Get burn statistics
   */
  async getBurnStatistics(): Promise<BurnStatistics> {
    try {
      const transactions = await prisma.burnTransaction.findMany();

      const totalBurned = transactions.reduce(
        (sum: Decimal, t: any): Decimal => sum.plus(t.burnedAmount),
        new Decimal(0)
      );

      const courseSaleBurns = transactions
        .filter((t: any) => t.transactionType === BurnTransactionType.COURSE_SALE)
        .reduce((sum: Decimal, t: any): Decimal => sum.plus(t.burnedAmount), new Decimal(0));

      const earningsWithdrawalBurns = transactions
        .filter((t: any) => t.transactionType === BurnTransactionType.EARNINGS_WITHDRAWAL)
        .reduce((sum: Decimal, t: any): Decimal => sum.plus(t.burnedAmount), new Decimal(0));

      const tokenRedemptionBurns = transactions
        .filter((t: any) => t.transactionType === BurnTransactionType.TOKEN_REDEMPTION)
        .reduce((sum: Decimal, t: any): Decimal => sum.plus(t.burnedAmount), new Decimal(0));

      const successfulTransactions = transactions.filter(
        (t: any) => t.blockchainStatus === BlockchainStatus.CONFIRMED
      ).length;

      const successRate =
        transactions.length > 0 ? successfulTransactions / transactions.length : 0;

      const averageBurn =
        transactions.length > 0
          ? totalBurned.dividedBy(transactions.length)
          : new Decimal(0);

      return {
        totalBurned,
        burnsByType: {
          courseSale: courseSaleBurns,
          earningsWithdrawal: earningsWithdrawalBurns,
          tokenRedemption: tokenRedemptionBurns,
        },
        averageBurnPerTransaction: averageBurn,
        transactionCount: transactions.length,
        successRate,
      };
    } catch (error) {
      logger.error('Failed to get burn statistics', { error });
      throw error instanceof Error ? error : new Error('Failed to get burn statistics');
    }
  }

  /**
   * Create proof of knowledge record
   */
  async createProofOfKnowledge(
    userId: string,
    courseId: string,
    completionDate: Date,
    certificateId: string,
    verificationHash: string,
    expiryDate?: Date,
    metadata?: Record<string, any>
  ): Promise<ProofOfKnowledgeRecord> {
    try {
      logger.info('Creating proof of knowledge', {
        userId,
        courseId,
        certificateId,
      });

      const pok = await prisma.proofOfKnowledge.create({
        data: {
          userId,
          courseId,
          completionDate,
          certificateId,
          verificationHash,
          expiryDate,
          metadata,
        },
      });

      return this.mapProofOfKnowledge(pok);
    } catch (error) {
      logger.error('Failed to create proof of knowledge', { error, userId, courseId });
      throw error instanceof Error ? error : new Error('Failed to create proof of knowledge');
    }
  }

  /**
   * Get proof of knowledge by certificate ID
   */
  async getProofOfKnowledgeByCertificate(
    certificateId: string
  ): Promise<ProofOfKnowledgeRecord | null> {
    try {
      const pok = await prisma.proofOfKnowledge.findUnique({
        where: { certificateId },
      });

      return pok ? this.mapProofOfKnowledge(pok) : null;
    } catch (error) {
      logger.error('Failed to get proof of knowledge', { error, certificateId });
      throw error instanceof Error ? error : new Error('Failed to get proof of knowledge');
    }
  }

  /**
   * Get user's proof of knowledge records
   */
  async getUserProofOfKnowledge(userId: string): Promise<ProofOfKnowledgeRecord[]> {
    try {
      const records = await prisma.proofOfKnowledge.findMany({
        where: { userId },
        orderBy: { completionDate: 'desc' },
      });

      return records.map((r: any) => this.mapProofOfKnowledge(r));
    } catch (error) {
      logger.error('Failed to get user proof of knowledge', { error, userId });
      throw error instanceof Error ? error : new Error('Failed to get user proof of knowledge');
    }
  }

  /**
   * Update or create token supply
   */
  async updateTokenSupply(
    totalSupply: Decimal,
    circulatingSupply: Decimal,
    burnedSupply: Decimal
  ): Promise<TokenSupplyData> {
    try {
      logger.info('Updating token supply', {
        totalSupply: totalSupply.toString(),
        circulatingSupply: circulatingSupply.toString(),
        burnedSupply: burnedSupply.toString(),
      });

      // Get or create token supply record
      let supply = await prisma.tokenSupply.findFirst();

      if (!supply) {
        supply = await prisma.tokenSupply.create({
          data: {
            totalSupply,
            circulatingSupply,
            burnedSupply,
            lastUpdated: new Date(),
          },
        });
      } else {
        supply = await prisma.tokenSupply.update({
          where: { id: supply.id },
          data: {
            totalSupply,
            circulatingSupply,
            burnedSupply,
            lastUpdated: new Date(),
          },
        });
      }

      return this.mapTokenSupply(supply);
    } catch (error) {
      logger.error('Failed to update token supply', { error });
      throw error instanceof Error ? error : new Error('Failed to update token supply');
    }
  }

  /**
   * Get current token supply
   */
  async getTokenSupply(): Promise<TokenSupplyData | null> {
    try {
      const supply = await prisma.tokenSupply.findFirst();
      return supply ? this.mapTokenSupply(supply) : null;
    } catch (error) {
      logger.error('Failed to get token supply', { error });
      throw error instanceof Error ? error : new Error('Failed to get token supply');
    }
  }

  /**
   * Map database burn transaction to record
   */
  private mapBurnTransaction(transaction: any): BurnTransactionRecord {
    return {
      id: transaction.id,
      userId: transaction.userId,
      amount: transaction.amount,
      burnRate: transaction.burnRate,
      burnedAmount: transaction.burnedAmount,
      transactionType: transaction.transactionType,
      reason: transaction.reason,
      blockchainTxHash: transaction.blockchainTxHash,
      blockchainStatus: transaction.blockchainStatus,
      metadata: transaction.metadata,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }

  /**
   * Map database proof of knowledge to record
   */
  private mapProofOfKnowledge(pok: any): ProofOfKnowledgeRecord {
    return {
      id: pok.id,
      userId: pok.userId,
      courseId: pok.courseId,
      completionDate: pok.completionDate,
      certificateId: pok.certificateId,
      verificationHash: pok.verificationHash,
      expiryDate: pok.expiryDate,
      metadata: pok.metadata,
      createdAt: pok.createdAt,
      updatedAt: pok.updatedAt,
    };
  }

  /**
   * Map database token supply to record
   */
  private mapTokenSupply(supply: any): TokenSupplyData {
    return {
      id: supply.id,
      totalSupply: supply.totalSupply,
      circulatingSupply: supply.circulatingSupply,
      burnedSupply: supply.burnedSupply,
      lastUpdated: supply.lastUpdated,
      createdAt: supply.createdAt,
      updatedAt: supply.updatedAt,
    };
  }
}

export default new TokenBurnRepository();
