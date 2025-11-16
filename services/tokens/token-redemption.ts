/**
 * Token Redemption Service
 * Manages token redemption for features, content, and merchandise
 */

import { PrismaClient, TokenRedemptionStatus, TokenRedemptionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { logger } from '../shared/logging';
import { ErrorHandler } from '../payment/error-handler';
import { TokenRewardsService } from './token-rewards';

const prisma = new PrismaClient();
const tokenRewardsService = new TokenRewardsService();

export interface RedemptionRequest {
  userId: string;
  amount: Decimal;
  type: TokenRedemptionType;
  metadata?: any;
}

export interface RedemptionResponse {
  id: string;
  userId: string;
  amount: Decimal;
  type: TokenRedemptionType;
  status: TokenRedemptionStatus;
  createdAt: Date;
  completedAt: Date | null;
}

export class TokenRedemptionService {
  /**
   * Request token redemption
   */
  async requestRedemption(request: RedemptionRequest): Promise<RedemptionResponse> {
    try {
      logger.info('Requesting token redemption', {
        userId: request.userId,
        amount: request.amount.toString(),
        type: request.type,
      });

      // Check balance
      const balance = await tokenRewardsService.getTokenBalance(request.userId);
      if (balance.lessThan(request.amount)) {
        throw new Error(`Insufficient tokens. Balance: ${balance}, Required: ${request.amount}`);
      }

      // Create redemption request
      const redemption = await prisma.tokenRedemption.create({
        data: {
          userId: request.userId,
          amount: request.amount,
          type: request.type,
          status: 'PENDING',
          metadata: request.metadata,
        },
      });

      logger.info('Redemption request created', { redemptionId: redemption.id });

      return this.mapRedemptionResponse(redemption);
    } catch (error) {
      logger.error('Failed to request redemption', { error, ...request });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Approve redemption
   */
  async approveRedemption(redemptionId: string): Promise<RedemptionResponse> {
    try {
      logger.info('Approving redemption', { redemptionId });

      const redemption = await prisma.tokenRedemption.findUnique({
        where: { id: redemptionId },
      });

      if (!redemption) {
        throw new Error(`Redemption ${redemptionId} not found`);
      }

      if (redemption.status !== 'PENDING') {
        throw new Error(`Redemption is not pending (status: ${redemption.status})`);
      }

      // Deduct tokens
      await tokenRewardsService.redeemTokens(
        redemption.userId,
        redemption.amount.toNumber(),
        redemption.type,
        redemption.metadata
      );

      // Update redemption status
      const updated = await prisma.tokenRedemption.update({
        where: { id: redemptionId },
        data: {
          status: 'APPROVED',
        },
      });

      logger.info('Redemption approved', { redemptionId });

      return this.mapRedemptionResponse(updated);
    } catch (error) {
      logger.error('Failed to approve redemption', { error, redemptionId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Complete redemption
   */
  async completeRedemption(redemptionId: string): Promise<RedemptionResponse> {
    try {
      logger.info('Completing redemption', { redemptionId });

      const redemption = await prisma.tokenRedemption.findUnique({
        where: { id: redemptionId },
      });

      if (!redemption) {
        throw new Error(`Redemption ${redemptionId} not found`);
      }

      if (redemption.status !== 'APPROVED') {
        throw new Error(`Redemption must be approved first (status: ${redemption.status})`);
      }

      // Update redemption status
      const updated = await prisma.tokenRedemption.update({
        where: { id: redemptionId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      logger.info('Redemption completed', { redemptionId });

      return this.mapRedemptionResponse(updated);
    } catch (error) {
      logger.error('Failed to complete redemption', { error, redemptionId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Reject redemption
   */
  async rejectRedemption(redemptionId: string, reason: string): Promise<RedemptionResponse> {
    try {
      logger.info('Rejecting redemption', { redemptionId, reason });

      const redemption = await prisma.tokenRedemption.findUnique({
        where: { id: redemptionId },
      });

      if (!redemption) {
        throw new Error(`Redemption ${redemptionId} not found`);
      }

      if (redemption.status !== 'PENDING') {
        throw new Error(`Redemption is not pending (status: ${redemption.status})`);
      }

      // Update redemption status
      const updated = await prisma.tokenRedemption.update({
        where: { id: redemptionId },
        data: {
          status: 'REJECTED',
          metadata: {
            ...redemption.metadata,
            rejectionReason: reason,
          },
        },
      });

      logger.info('Redemption rejected', { redemptionId });

      return this.mapRedemptionResponse(updated);
    } catch (error) {
      logger.error('Failed to reject redemption', { error, redemptionId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get redemption by ID
   */
  async getRedemption(redemptionId: string): Promise<RedemptionResponse | null> {
    try {
      const redemption = await prisma.tokenRedemption.findUnique({
        where: { id: redemptionId },
      });

      if (!redemption) {
        return null;
      }

      return this.mapRedemptionResponse(redemption);
    } catch (error) {
      logger.error('Failed to get redemption', { error, redemptionId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get user's redemptions
   */
  async getUserRedemptions(
    userId: string,
    status?: TokenRedemptionStatus,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    redemptions: RedemptionResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const where: any = { userId };
      if (status) {
        where.status = status;
      }

      const [redemptions, total] = await Promise.all([
        prisma.tokenRedemption.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.tokenRedemption.count({ where }),
      ]);

      return {
        redemptions: redemptions.map((r) => this.mapRedemptionResponse(r)),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Failed to get user redemptions', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get pending redemptions
   */
  async getPendingRedemptions(limit: number = 100): Promise<RedemptionResponse[]> {
    try {
      const redemptions = await prisma.tokenRedemption.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        take: limit,
      });

      return redemptions.map((r) => this.mapRedemptionResponse(r));
    } catch (error) {
      logger.error('Failed to get pending redemptions', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get redemption statistics
   */
  async getRedemptionStats(): Promise<{
    totalRedemptions: number;
    pendingRedemptions: number;
    approvedRedemptions: number;
    completedRedemptions: number;
    rejectedRedemptions: number;
    totalTokensRedeemed: Decimal;
    byType: Record<TokenRedemptionType, number>;
  }> {
    try {
      const [total, pending, approved, completed, rejected, byType] = await Promise.all([
        prisma.tokenRedemption.count(),
        prisma.tokenRedemption.count({ where: { status: 'PENDING' } }),
        prisma.tokenRedemption.count({ where: { status: 'APPROVED' } }),
        prisma.tokenRedemption.count({ where: { status: 'COMPLETED' } }),
        prisma.tokenRedemption.count({ where: { status: 'REJECTED' } }),
        prisma.tokenRedemption.groupBy({
          by: ['type'],
          _count: true,
        }),
      ]);

      const completedRedemptions = await prisma.tokenRedemption.findMany({
        where: { status: 'COMPLETED' },
        select: { amount: true },
      });

      const totalTokensRedeemed = completedRedemptions.reduce(
        (sum, r) => sum.plus(r.amount),
        new Decimal(0)
      );

      const typeStats: Record<TokenRedemptionType, number> = {
        FEATURE_UNLOCK: 0,
        PREMIUM_CONTENT: 0,
        MERCHANDISE: 0,
        DONATION: 0,
      };

      byType.forEach((item: any) => {
        typeStats[item.type] = item._count;
      });

      return {
        totalRedemptions: total,
        pendingRedemptions: pending,
        approvedRedemptions: approved,
        completedRedemptions: completed,
        rejectedRedemptions: rejected,
        totalTokensRedeemed,
        byType: typeStats,
      };
    } catch (error) {
      logger.error('Failed to get redemption stats', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Map redemption to response format
   */
  private mapRedemptionResponse(redemption: any): RedemptionResponse {
    return {
      id: redemption.id,
      userId: redemption.userId,
      amount: redemption.amount,
      type: redemption.type,
      status: redemption.status,
      createdAt: redemption.createdAt,
      completedAt: redemption.completedAt,
    };
  }
}

export default new TokenRedemptionService();
