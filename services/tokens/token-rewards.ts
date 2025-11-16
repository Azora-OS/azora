/**
 * Token Rewards Service
 * Manages token earning, balance tracking, and redemption
 */

import { PrismaClient, TokenTransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { logger } from '../shared/logging';
import { ErrorHandler } from '../payment/error-handler';

const prisma = new PrismaClient();

export interface TokenTransaction {
  id: string;
  userId: string;
  amount: Decimal;
  type: TokenTransactionType;
  reason: string;
  balance: Decimal;
  createdAt: Date;
}

export interface TokenBalanceResponse {
  userId: string;
  balance: Decimal;
  createdAt: Date;
  updatedAt: Date;
}

export class TokenRewardsService {
  /**
   * Get or create token balance for user
   */
  async getOrCreateBalance(userId: string): Promise<TokenBalanceResponse> {
    try {
      let balance = await prisma.tokenBalance.findUnique({
        where: { userId },
      });

      if (!balance) {
        balance = await prisma.tokenBalance.create({
          data: {
            userId,
            balance: new Decimal(0),
          },
        });

        logger.info('Token balance created', { userId });
      }

      return {
        userId: balance.userId,
        balance: balance.balance,
        createdAt: balance.createdAt,
        updatedAt: balance.updatedAt,
      };
    } catch (error) {
      logger.error('Failed to get or create token balance', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Award tokens to user
   */
  async awardTokens(
    userId: string,
    amount: number,
    reason: string,
    metadata?: any
  ): Promise<TokenTransaction> {
    try {
      logger.info('Awarding tokens', { userId, amount, reason });

      if (amount <= 0) {
        throw new Error('Award amount must be greater than 0');
      }

      // Get or create balance
      const balance = await this.getOrCreateBalance(userId);

      // Calculate new balance
      const newBalance = balance.balance.plus(new Decimal(amount));

      // Update balance
      const updated = await prisma.tokenBalance.update({
        where: { userId },
        data: { balance: newBalance },
      });

      // Record transaction
      const transaction = await prisma.tokenTransaction.create({
        data: {
          userId,
          balanceId: updated.id,
          amount: new Decimal(amount),
          type: 'EARN',
          reason,
          balance: newBalance,
          metadata,
        },
      });

      logger.info('Tokens awarded successfully', { userId, amount, newBalance: newBalance.toString() });

      return {
        id: transaction.id,
        userId: transaction.userId,
        amount: transaction.amount,
        type: transaction.type,
        reason: transaction.reason,
        balance: transaction.balance,
        createdAt: transaction.createdAt,
      };
    } catch (error) {
      logger.error('Failed to award tokens', { error, userId, amount });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get token balance
   */
  async getTokenBalance(userId: string): Promise<Decimal> {
    try {
      const balance = await this.getOrCreateBalance(userId);
      return balance.balance;
    } catch (error) {
      logger.error('Failed to get token balance', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Redeem tokens
   */
  async redeemTokens(
    userId: string,
    amount: number,
    feature: string,
    metadata?: any
  ): Promise<TokenTransaction> {
    try {
      logger.info('Redeeming tokens', { userId, amount, feature });

      if (amount <= 0) {
        throw new Error('Redeem amount must be greater than 0');
      }

      // Get balance
      const balance = await this.getOrCreateBalance(userId);

      if (balance.balance.lessThan(new Decimal(amount))) {
        throw new Error(
          `Insufficient tokens. Balance: ${balance.balance}, Required: ${amount}`
        );
      }

      // Calculate new balance
      const newBalance = balance.balance.minus(new Decimal(amount));

      // Update balance
      const updated = await prisma.tokenBalance.update({
        where: { userId },
        data: { balance: newBalance },
      });

      // Record transaction
      const transaction = await prisma.tokenTransaction.create({
        data: {
          userId,
          balanceId: updated.id,
          amount: new Decimal(amount),
          type: 'REDEEM',
          reason: `Redeemed for ${feature}`,
          balance: newBalance,
          metadata: { feature, ...metadata },
        },
      });

      logger.info('Tokens redeemed successfully', { userId, amount, feature });

      return {
        id: transaction.id,
        userId: transaction.userId,
        amount: transaction.amount,
        type: transaction.type,
        reason: transaction.reason,
        balance: transaction.balance,
        createdAt: transaction.createdAt,
      };
    } catch (error) {
      logger.error('Failed to redeem tokens', { error, userId, amount });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Transfer tokens between users
   */
  async transferTokens(
    fromUserId: string,
    toUserId: string,
    amount: number
  ): Promise<{ from: TokenTransaction; to: TokenTransaction }> {
    try {
      logger.info('Transferring tokens', { fromUserId, toUserId, amount });

      if (amount <= 0) {
        throw new Error('Transfer amount must be greater than 0');
      }

      // Get balances
      const fromBalance = await this.getOrCreateBalance(fromUserId);
      const toBalance = await this.getOrCreateBalance(toUserId);

      if (fromBalance.balance.lessThan(new Decimal(amount))) {
        throw new Error('Insufficient tokens for transfer');
      }

      // Update balances
      const newFromBalance = fromBalance.balance.minus(new Decimal(amount));
      const newToBalance = toBalance.balance.plus(new Decimal(amount));

      const [updatedFrom, updatedTo] = await Promise.all([
        prisma.tokenBalance.update({
          where: { userId: fromUserId },
          data: { balance: newFromBalance },
        }),
        prisma.tokenBalance.update({
          where: { userId: toUserId },
          data: { balance: newToBalance },
        }),
      ]);

      // Record transactions
      const [fromTransaction, toTransaction] = await Promise.all([
        prisma.tokenTransaction.create({
          data: {
            userId: fromUserId,
            balanceId: updatedFrom.id,
            amount: new Decimal(amount),
            type: 'TRANSFER',
            reason: `Transferred to ${toUserId}`,
            balance: newFromBalance,
            metadata: { toUserId },
          },
        }),
        prisma.tokenTransaction.create({
          data: {
            userId: toUserId,
            balanceId: updatedTo.id,
            amount: new Decimal(amount),
            type: 'TRANSFER',
            reason: `Received from ${fromUserId}`,
            balance: newToBalance,
            metadata: { fromUserId },
          },
        }),
      ]);

      logger.info('Tokens transferred successfully', { fromUserId, toUserId, amount });

      return {
        from: {
          id: fromTransaction.id,
          userId: fromTransaction.userId,
          amount: fromTransaction.amount,
          type: fromTransaction.type,
          reason: fromTransaction.reason,
          balance: fromTransaction.balance,
          createdAt: fromTransaction.createdAt,
        },
        to: {
          id: toTransaction.id,
          userId: toTransaction.userId,
          amount: toTransaction.amount,
          type: toTransaction.type,
          reason: toTransaction.reason,
          balance: toTransaction.balance,
          createdAt: toTransaction.createdAt,
        },
      };
    } catch (error) {
      logger.error('Failed to transfer tokens', { error, fromUserId, toUserId, amount });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get token transaction history
   */
  async getTokenHistory(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    transactions: TokenTransaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        prisma.tokenTransaction.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.tokenTransaction.count({ where: { userId } }),
      ]);

      return {
        transactions: transactions.map((t) => ({
          id: t.id,
          userId: t.userId,
          amount: t.amount,
          type: t.type,
          reason: t.reason,
          balance: t.balance,
          createdAt: t.createdAt,
        })),
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Failed to get token history', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Award bonus tokens
   */
  async awardBonusTokens(
    userId: string,
    amount: number,
    reason: string
  ): Promise<TokenTransaction> {
    try {
      logger.info('Awarding bonus tokens', { userId, amount, reason });

      const balance = await this.getOrCreateBalance(userId);
      const newBalance = balance.balance.plus(new Decimal(amount));

      const updated = await prisma.tokenBalance.update({
        where: { userId },
        data: { balance: newBalance },
      });

      const transaction = await prisma.tokenTransaction.create({
        data: {
          userId,
          balanceId: updated.id,
          amount: new Decimal(amount),
          type: 'BONUS',
          reason,
          balance: newBalance,
        },
      });

      logger.info('Bonus tokens awarded', { userId, amount });

      return {
        id: transaction.id,
        userId: transaction.userId,
        amount: transaction.amount,
        type: transaction.type,
        reason: transaction.reason,
        balance: transaction.balance,
        createdAt: transaction.createdAt,
      };
    } catch (error) {
      logger.error('Failed to award bonus tokens', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Apply penalty tokens
   */
  async applyPenalty(userId: string, amount: number, reason: string): Promise<TokenTransaction> {
    try {
      logger.info('Applying token penalty', { userId, amount, reason });

      const balance = await this.getOrCreateBalance(userId);
      const newBalance = balance.balance.minus(new Decimal(amount));

      const updated = await prisma.tokenBalance.update({
        where: { userId },
        data: { balance: newBalance },
      });

      const transaction = await prisma.tokenTransaction.create({
        data: {
          userId,
          balanceId: updated.id,
          amount: new Decimal(amount),
          type: 'PENALTY',
          reason,
          balance: newBalance,
        },
      });

      logger.info('Token penalty applied', { userId, amount });

      return {
        id: transaction.id,
        userId: transaction.userId,
        amount: transaction.amount,
        type: transaction.type,
        reason: transaction.reason,
        balance: transaction.balance,
        createdAt: transaction.createdAt,
      };
    } catch (error) {
      logger.error('Failed to apply penalty', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get token statistics
   */
  async getTokenStats(): Promise<{
    totalTokensDistributed: Decimal;
    totalTokensRedeemed: Decimal;
    averageBalance: Decimal;
    userCount: number;
  }> {
    try {
      const [balances, earnTransactions, redeemTransactions] = await Promise.all([
        prisma.tokenBalance.findMany(),
        prisma.tokenTransaction.findMany({ where: { type: 'EARN' } }),
        prisma.tokenTransaction.findMany({ where: { type: 'REDEEM' } }),
      ]);

      const totalDistributed = earnTransactions.reduce(
        (sum, t) => sum.plus(t.amount),
        new Decimal(0)
      );

      const totalRedeemed = redeemTransactions.reduce(
        (sum, t) => sum.plus(t.amount),
        new Decimal(0)
      );

      const totalBalance = balances.reduce((sum, b) => sum.plus(b.balance), new Decimal(0));
      const averageBalance = balances.length > 0 ? totalBalance.dividedBy(balances.length) : new Decimal(0);

      return {
        totalTokensDistributed: totalDistributed,
        totalTokensRedeemed: totalRedeemed,
        averageBalance,
        userCount: balances.length,
      };
    } catch (error) {
      logger.error('Failed to get token stats', { error });
      throw ErrorHandler.handle(error);
    }
  }
}

export default new TokenRewardsService();
