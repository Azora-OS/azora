import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { TokenRewardsService } from '../token-rewards';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

jest.mock('@prisma/client');

describe('TokenRewardsService', () => {
  let tokenService: TokenRewardsService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    tokenService = new TokenRewardsService();
  });

  describe('awardTokens', () => {
    it('should award tokens to a user', async () => {
      const userId = 'user123';
      const amount = 100;
      const reason = 'course_completion';

      const mockTransaction = {
        id: 'txn_123',
        userId,
        amount: new Decimal(amount),
        type: 'AWARD',
        reason,
        balance: new Decimal(100),
        createdAt: new Date(),
      };

      mockPrisma.tokenTransaction.create = jest.fn().mockResolvedValue(mockTransaction);

      const result = await tokenService.awardTokens(userId, amount, reason);

      expect(result.amount).toEqual(new Decimal(amount));
      expect(result.type).toBe('AWARD');
      expect(mockPrisma.tokenTransaction.create).toHaveBeenCalled();
    });

    it('should throw error if amount is negative', async () => {
      await expect(tokenService.awardTokens('user123', -50, 'invalid')).rejects.toThrow(
        'Amount must be positive'
      );
    });

    it('should throw error if amount is zero', async () => {
      await expect(tokenService.awardTokens('user123', 0, 'invalid')).rejects.toThrow(
        'Amount must be positive'
      );
    });
  });

  describe('getTokenBalance', () => {
    it('should retrieve user token balance', async () => {
      const userId = 'user123';
      const mockBalance = {
        userId,
        balance: new Decimal('500'),
      };

      mockPrisma.tokenBalance.findUnique = jest.fn().mockResolvedValue(mockBalance);

      const result = await tokenService.getTokenBalance(userId);

      expect(result).toEqual(new Decimal('500'));
      expect(mockPrisma.tokenBalance.findUnique).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should return 0 if user has no balance record', async () => {
      mockPrisma.tokenBalance.findUnique = jest.fn().mockResolvedValue(null);

      const result = await tokenService.getTokenBalance('user123');

      expect(result).toEqual(new Decimal('0'));
    });
  });

  describe('redeemTokens', () => {
    it('should redeem tokens for a feature', async () => {
      const userId = 'user123';
      const amount = 50;
      const feature = 'premium_content';

      const mockTransaction = {
        id: 'txn_456',
        userId,
        amount: new Decimal(amount),
        type: 'REDEEM',
        reason: feature,
        balance: new Decimal(450),
        createdAt: new Date(),
      };

      mockPrisma.tokenBalance.findUnique = jest.fn().mockResolvedValue({
        balance: new Decimal(500),
      });

      mockPrisma.tokenTransaction.create = jest.fn().mockResolvedValue(mockTransaction);

      const result = await tokenService.redeemTokens(userId, amount, feature);

      expect(result.type).toBe('REDEEM');
      expect(result.amount).toEqual(new Decimal(amount));
    });

    it('should throw error if insufficient balance', async () => {
      const userId = 'user123';

      mockPrisma.tokenBalance.findUnique = jest.fn().mockResolvedValue({
        balance: new Decimal(30),
      });

      await expect(tokenService.redeemTokens(userId, 50, 'feature')).rejects.toThrow(
        'Insufficient token balance'
      );
    });

    it('should throw error if amount is negative', async () => {
      await expect(tokenService.redeemTokens('user123', -50, 'feature')).rejects.toThrow(
        'Amount must be positive'
      );
    });
  });

  describe('getTransactionHistory', () => {
    it('should retrieve transaction history for user', async () => {
      const userId = 'user123';
      const mockTransactions = [
        {
          id: 'txn_1',
          type: 'AWARD',
          amount: new Decimal(100),
          createdAt: new Date(),
        },
        {
          id: 'txn_2',
          type: 'REDEEM',
          amount: new Decimal(50),
          createdAt: new Date(),
        },
      ];

      mockPrisma.tokenTransaction.findMany = jest.fn().mockResolvedValue(mockTransactions);

      const result = await tokenService.getTransactionHistory(userId);

      expect(result).toHaveLength(2);
      expect(mockPrisma.tokenTransaction.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('calculateBalance', () => {
    it('should calculate correct balance from transactions', async () => {
      const userId = 'user123';
      const mockTransactions = [
        { amount: new Decimal(100), type: 'AWARD' },
        { amount: new Decimal(50), type: 'REDEEM' },
        { amount: new Decimal(25), type: 'AWARD' },
      ];

      mockPrisma.tokenTransaction.findMany = jest.fn().mockResolvedValue(mockTransactions);

      const result = await tokenService.calculateBalance(userId);

      expect(result).toEqual(new Decimal(75));
    });
  });
});
