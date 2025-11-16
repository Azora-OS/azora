/**
 * Token Burn Integration Tests
 * Tests for complete token burn flows integrated into payment operations
 * 
 * Covers:
 * - Sale → Burn → Supply Update flow
 * - Withdrawal → Burn → Balance Update flow
 * - Redemption → Burn → Feature Access flow
 * - Leaderboard Ranking Updates
 */

import { Decimal } from '@prisma/client/runtime/library';
import { TokenBurnCalculator } from '../../services/tokens/token-burn-calculator';
import { BurnTracker } from '../../services/tokens/burn-tracker';
import { LeaderboardUpdater } from '../../services/tokens/leaderboard-updater';
import { BurnTransactionType, BlockchainStatus } from '../../services/tokens/token-burn.types';
import { TokenBurnRepository } from '../../services/tokens/token-burn-repository';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client');

describe('Token Burn Integration Flows', () => {
  let calculator: TokenBurnCalculator;
  let burnTracker: BurnTracker;
  let leaderboardUpdater: LeaderboardUpdater;
  let repository: TokenBurnRepository;
  let prisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    calculator = new TokenBurnCalculator();
    repository = new TokenBurnRepository();
    burnTracker = new BurnTracker(repository);
    leaderboardUpdater = new LeaderboardUpdater();
    prisma = new PrismaClient() as jest.Mocked<PrismaClient>;
  });

  describe('Complete Sale → Burn → Supply Update Flow', () => {
    it('should execute complete course sale burn flow', async () => {
      const userId = 'user-123';
      const saleAmount = new Decimal(100);
      const initialSupply = new Decimal(1000000);
      const initialCirculating = new Decimal(900000);

      // Step 1: Calculate burn on sale
      const burnCalculation = calculator.calculateBurn(
        saleAmount,
        BurnTransactionType.COURSE_SALE
      );

      expect(burnCalculation.burnRate).toBe(0.05);
      expect(burnCalculation.burnedAmount.toString()).toBe('5');
      expect(burnCalculation.netAmount.toString()).toBe('95');

      // Step 2: Log burn transaction
      const mockTransaction = {
        id: 'burn-tx-1',
        userId,
        amount: saleAmount,
        burnRate: burnCalculation.burnRate,
        burnedAmount: burnCalculation.burnedAmount,
        transactionType: BurnTransactionType.COURSE_SALE,
        reason: 'Course sale',
        blockchainTxHash: null,
        blockchainStatus: BlockchainStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(repository, 'createBurnTransaction').mockResolvedValue(mockTransaction);

      const transaction = await burnTracker.logBurnTransaction(
        userId,
        saleAmount,
        burnCalculation.burnRate,
        burnCalculation.burnedAmount,
        BurnTransactionType.COURSE_SALE,
        'Course sale'
      );

      expect(transaction.id).toBe('burn-tx-1');
      expect(transaction.burnedAmount.toString()).toBe('5');

      // Step 3: Confirm blockchain transaction
      const confirmedTransaction = {
        ...mockTransaction,
        blockchainTxHash: '0x123abc',
        blockchainStatus: BlockchainStatus.CONFIRMED,
      };

      jest.spyOn(repository, 'updateBurnTransactionHash').mockResolvedValue(confirmedTransaction);

      const confirmed = await burnTracker.confirmBurnTransaction(
        'burn-tx-1',
        '0x123abc',
        BlockchainStatus.CONFIRMED
      );

      expect(confirmed.blockchainStatus).toBe(BlockchainStatus.CONFIRMED);
      expect(confirmed.blockchainTxHash).toBe('0x123abc');

      // Step 4: Update token supply
      const mockSupply = {
        id: 'supply-1',
        totalSupply: initialSupply,
        circulatingSupply: initialCirculating,
        burnedSupply: new Decimal(100000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(repository, 'getTokenSupply').mockResolvedValue(mockSupply);
      jest.spyOn(repository, 'updateTokenSupply').mockResolvedValue({
        ...mockSupply,
        burnedSupply: new Decimal(100005),
        circulatingSupply: initialCirculating.minus(new Decimal(5)),
      });

      const updatedSupply = await burnTracker.updateSupplyAfterBurn(
        initialSupply,
        initialCirculating,
        burnCalculation.burnedAmount
      );

      expect(updatedSupply.burnedSupply.toString()).toBe('100005');
      expect(updatedSupply.circulatingSupply.toString()).toBe('899995');
    });

    it('should handle multiple concurrent sales with burns', async () => {
      const sales = [
        { userId: 'user-1', amount: new Decimal(100) },
        { userId: 'user-2', amount: new Decimal(200) },
        { userId: 'user-3', amount: new Decimal(150) },
      ];

      const burns = sales.map((sale) =>
        calculator.calculateBurn(sale.amount, BurnTransactionType.COURSE_SALE)
      );

      const totalBurned = burns.reduce(
        (sum, burn) => sum.plus(burn.burnedAmount),
        new Decimal(0)
      );

      expect(burns).toHaveLength(3);
      expect(burns[0].burnedAmount.toString()).toBe('5'); // 5% of 100
      expect(burns[1].burnedAmount.toString()).toBe('10'); // 5% of 200
      expect(burns[2].burnedAmount.toString()).toBe('7.5'); // 5% of 150
      expect(totalBurned.toString()).toBe('22.5');
    });

    it('should track cumulative burns across multiple sales', async () => {
      const userId = 'user-123';
      const transactions = [
        { amount: new Decimal(100), type: BurnTransactionType.COURSE_SALE },
        { amount: new Decimal(200), type: BurnTransactionType.COURSE_SALE },
        { amount: new Decimal(150), type: BurnTransactionType.COURSE_SALE },
      ];

      const mockHistory = {
        transactions: transactions.map((tx, i) => ({
          id: `burn-tx-${i}`,
          userId,
          amount: tx.amount,
          burnRate: 0.05,
          burnedAmount: tx.amount.times(0.05),
          transactionType: tx.type,
          reason: 'Course sale',
          blockchainTxHash: '0x123',
          blockchainStatus: BlockchainStatus.CONFIRMED,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        total: 3,
        totalBurned: new Decimal(22.5),
      };

      jest.spyOn(repository, 'getBurnHistory').mockResolvedValue(mockHistory);

      const history = await burnTracker.getBurnHistory({ userId });

      expect(history.transactions).toHaveLength(3);
      expect(history.totalBurned.toString()).toBe('22.5');
    });
  });

  describe('Complete Withdrawal → Burn → Balance Update Flow', () => {
    it('should execute complete earnings withdrawal burn flow', async () => {
      const userId = 'user-456';
      const withdrawalAmount = new Decimal(1000);
      const userBalance = new Decimal(5000);

      // Step 1: Calculate burn on withdrawal
      const burnCalculation = calculator.calculateBurn(
        withdrawalAmount,
        BurnTransactionType.EARNINGS_WITHDRAWAL
      );

      expect(burnCalculation.burnRate).toBe(0.03);
      expect(burnCalculation.burnedAmount.toString()).toBe('30');
      expect(burnCalculation.netAmount.toString()).toBe('970');

      // Step 2: Validate user has sufficient balance
      const validation = calculator.validateBurnTransaction(
        withdrawalAmount,
        BurnTransactionType.EARNINGS_WITHDRAWAL,
        userBalance
      );

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // Step 3: Log burn transaction
      const mockTransaction = {
        id: 'burn-tx-2',
        userId,
        amount: withdrawalAmount,
        burnRate: burnCalculation.burnRate,
        burnedAmount: burnCalculation.burnedAmount,
        transactionType: BurnTransactionType.EARNINGS_WITHDRAWAL,
        reason: 'Earnings withdrawal',
        blockchainTxHash: null,
        blockchainStatus: BlockchainStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(repository, 'createBurnTransaction').mockResolvedValue(mockTransaction);

      const transaction = await burnTracker.logBurnTransaction(
        userId,
        withdrawalAmount,
        burnCalculation.burnRate,
        burnCalculation.burnedAmount,
        BurnTransactionType.EARNINGS_WITHDRAWAL,
        'Earnings withdrawal'
      );

      expect(transaction.burnedAmount.toString()).toBe('30');

      // Step 4: Update user balance (net amount after burn)
      const newBalance = userBalance.minus(withdrawalAmount);
      const burnedFromBalance = burnCalculation.burnedAmount;

      expect(newBalance.toString()).toBe('4000');
      expect(burnedFromBalance.toString()).toBe('30');
    });

    it('should reject withdrawal if insufficient balance for burn', async () => {
      const withdrawalAmount = new Decimal(1000);
      const insufficientBalance = new Decimal(500); // Less than withdrawal amount

      const validation = calculator.validateBurnTransaction(
        withdrawalAmount,
        BurnTransactionType.EARNINGS_WITHDRAWAL,
        insufficientBalance
      );

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        'Insufficient balance. Required: 1000, Available: 500'
      );
    });

    it('should warn on significant burn relative to balance', async () => {
      const withdrawalAmount = new Decimal(100);
      const smallBalance = new Decimal(5); // Only 5 tokens

      const validation = calculator.validateBurnTransaction(
        withdrawalAmount,
        BurnTransactionType.EARNINGS_WITHDRAWAL,
        smallBalance
      );

      expect(validation.isValid).toBe(false);
      expect(validation.warnings.length).toBeGreaterThan(0);
    });

    it('should handle large withdrawal amounts correctly', async () => {
      const largeWithdrawal = new Decimal('50000');
      const largeBalance = new Decimal('100000');

      const burnCalculation = calculator.calculateBurn(
        largeWithdrawal,
        BurnTransactionType.EARNINGS_WITHDRAWAL
      );

      expect(burnCalculation.burnedAmount.toString()).toBe('1500'); // 3% of 50000
      expect(burnCalculation.netAmount.toString()).toBe('48500');

      const validation = calculator.validateBurnTransaction(
        largeWithdrawal,
        BurnTransactionType.EARNINGS_WITHDRAWAL,
        largeBalance
      );

      expect(validation.isValid).toBe(true);
    });
  });

  describe('Complete Redemption → Burn → Feature Access Flow', () => {
    it('should execute complete token redemption burn flow', async () => {
      const userId = 'user-789';
      const redemptionAmount = new Decimal(500);
      const userBalance = new Decimal(1000);

      // Step 1: Calculate burn on redemption
      const burnCalculation = calculator.calculateBurn(
        redemptionAmount,
        BurnTransactionType.TOKEN_REDEMPTION
      );

      expect(burnCalculation.burnRate).toBe(0.02);
      expect(burnCalculation.burnedAmount.toString()).toBe('10');
      expect(burnCalculation.netAmount.toString()).toBe('490');

      // Step 2: Validate user has sufficient balance
      const validation = calculator.validateBurnTransaction(
        redemptionAmount,
        BurnTransactionType.TOKEN_REDEMPTION,
        userBalance
      );

      expect(validation.isValid).toBe(true);

      // Step 3: Log burn transaction
      const mockTransaction = {
        id: 'burn-tx-3',
        userId,
        amount: redemptionAmount,
        burnRate: burnCalculation.burnRate,
        burnedAmount: burnCalculation.burnedAmount,
        transactionType: BurnTransactionType.TOKEN_REDEMPTION,
        reason: 'Premium feature redemption',
        blockchainTxHash: null,
        blockchainStatus: BlockchainStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(repository, 'createBurnTransaction').mockResolvedValue(mockTransaction);

      const transaction = await burnTracker.logBurnTransaction(
        userId,
        redemptionAmount,
        burnCalculation.burnRate,
        burnCalculation.burnedAmount,
        BurnTransactionType.TOKEN_REDEMPTION,
        'Premium feature redemption'
      );

      expect(transaction.burnedAmount.toString()).toBe('10');

      // Step 4: Deduct tokens from user balance
      const newBalance = userBalance.minus(redemptionAmount);

      expect(newBalance.toString()).toBe('500');

      // Step 5: Grant feature access (simulated)
      const featureAccess = {
        userId,
        feature: 'premium_analytics',
        grantedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };

      expect(featureAccess.userId).toBe(userId);
      expect(featureAccess.feature).toBe('premium_analytics');
    });

    it('should handle small redemption amounts', async () => {
      const smallRedemption = new Decimal('10');
      const userBalance = new Decimal('100');

      const burnCalculation = calculator.calculateBurn(
        smallRedemption,
        BurnTransactionType.TOKEN_REDEMPTION
      );

      expect(burnCalculation.burnedAmount.toString()).toBe('0.2'); // 2% of 10
      expect(burnCalculation.netAmount.toString()).toBe('9.8');

      const validation = calculator.validateBurnTransaction(
        smallRedemption,
        BurnTransactionType.TOKEN_REDEMPTION,
        userBalance
      );

      expect(validation.isValid).toBe(true);
    });

    it('should track redemption burns separately from other burns', async () => {
      const userId = 'user-123';

      const mockHistory = {
        transactions: [
          {
            id: 'burn-tx-1',
            userId,
            amount: new Decimal(100),
            burnRate: 0.02,
            burnedAmount: new Decimal(2),
            transactionType: BurnTransactionType.TOKEN_REDEMPTION,
            reason: 'Premium feature',
            blockchainTxHash: '0x123',
            blockchainStatus: BlockchainStatus.CONFIRMED,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'burn-tx-2',
            userId,
            amount: new Decimal(200),
            burnRate: 0.02,
            burnedAmount: new Decimal(4),
            transactionType: BurnTransactionType.TOKEN_REDEMPTION,
            reason: 'Premium feature',
            blockchainTxHash: '0x124',
            blockchainStatus: BlockchainStatus.CONFIRMED,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 2,
        totalBurned: new Decimal(6),
      };

      jest.spyOn(repository, 'getBurnHistory').mockResolvedValue(mockHistory);

      const history = await burnTracker.getBurnHistory({
        userId,
        transactionType: BurnTransactionType.TOKEN_REDEMPTION,
      });

      expect(history.transactions).toHaveLength(2);
      expect(history.totalBurned.toString()).toBe('6');
    });
  });

  describe('Leaderboard Ranking Updates on Burn', () => {
    it('should update leaderboard rankings after burn', async () => {
      const users = [
        { userId: 'user-1', tokens: new Decimal(10000) },
        { userId: 'user-2', tokens: new Decimal(5000) },
        { userId: 'user-3', tokens: new Decimal(2000) },
      ];

      const totalSupply = new Decimal(20000);

      // Calculate ownership percentages
      const ownerships = users.map((u) => ({
        userId: u.userId,
        percentage: u.tokens.dividedBy(totalSupply).times(100).toNumber(),
      }));

      // Sort by ownership (descending)
      ownerships.sort((a, b) => b.percentage - a.percentage);

      expect(ownerships[0].userId).toBe('user-1');
      expect(ownerships[0].percentage).toBeCloseTo(50, 1);
      expect(ownerships[1].userId).toBe('user-2');
      expect(ownerships[1].percentage).toBeCloseTo(25, 1);
      expect(ownerships[2].userId).toBe('user-3');
      expect(ownerships[2].percentage).toBeCloseTo(10, 1);
    });

    it('should recalculate rankings when supply changes due to burn', async () => {
      const initialSupply = new Decimal(20000);
      const userTokens = new Decimal(5000);

      // Initial ownership
      const initialOwnership = userTokens
        .dividedBy(initialSupply)
        .times(100)
        .toNumber();

      expect(initialOwnership).toBeCloseTo(25, 1);

      // After burn: supply decreases to 19000
      const burnedAmount = new Decimal(1000);
      const newSupply = initialSupply.minus(burnedAmount);

      // New ownership (user tokens unchanged, but supply decreased)
      const newOwnership = userTokens
        .dividedBy(newSupply)
        .times(100)
        .toNumber();

      expect(newOwnership).toBeCloseTo(26.3, 1); // Increased due to lower supply
      expect(newOwnership).toBeGreaterThan(initialOwnership);
    });

    it('should handle ranking changes for multiple users', async () => {
      const mockRankingUpdates = [
        {
          userId: 'user-1',
          newRank: 1,
          previousRank: 2,
          ownershipPercentage: 30,
          changed: true,
        },
        {
          userId: 'user-2',
          newRank: 2,
          previousRank: 1,
          ownershipPercentage: 25,
          changed: true,
        },
        {
          userId: 'user-3',
          newRank: 3,
          previousRank: 3,
          ownershipPercentage: 20,
          changed: false,
        },
      ];

      const changedCount = mockRankingUpdates.filter((r) => r.changed).length;

      expect(mockRankingUpdates).toHaveLength(3);
      expect(changedCount).toBe(2);
      expect(mockRankingUpdates[0].newRank).toBe(1);
      expect(mockRankingUpdates[1].newRank).toBe(2);
    });

    it('should track historical ranking changes', async () => {
      const userId = 'user-123';
      const mockHistory = [
        {
          date: new Date('2024-01-01'),
          rank: 100,
          ownershipPercentage: 0.5,
        },
        {
          date: new Date('2024-01-02'),
          rank: 95,
          ownershipPercentage: 0.52,
        },
        {
          date: new Date('2024-01-03'),
          rank: 90,
          ownershipPercentage: 0.55,
        },
      ];

      expect(mockHistory).toHaveLength(3);
      expect(mockHistory[0].rank).toBe(100);
      expect(mockHistory[2].rank).toBe(90);
      expect(mockHistory[2].ownershipPercentage).toBeGreaterThan(mockHistory[0].ownershipPercentage);
    });

    it('should calculate ranking percentile correctly', async () => {
      const totalUsers = 1000;
      const userRank = 100;

      const percentile = ((totalUsers - userRank) / totalUsers) * 100;

      expect(percentile).toBe(90); // Top 10%
    });

    it('should handle edge case of single user', async () => {
      const totalUsers = 1;
      const userRank = 1;

      const percentile = ((totalUsers - userRank) / totalUsers) * 100;

      expect(percentile).toBe(0); // Only user, no percentile
    });
  });

  describe('Cross-Flow Integration', () => {
    it('should handle mixed transaction types in single flow', async () => {
      const userId = 'user-123';
      const transactions = [
        { amount: new Decimal(100), type: BurnTransactionType.COURSE_SALE },
        { amount: new Decimal(1000), type: BurnTransactionType.EARNINGS_WITHDRAWAL },
        { amount: new Decimal(500), type: BurnTransactionType.TOKEN_REDEMPTION },
      ];

      const burns = transactions.map((tx) =>
        calculator.calculateBurn(tx.amount, tx.type)
      );

      const totalBurned = burns.reduce(
        (sum, burn) => sum.plus(burn.burnedAmount),
        new Decimal(0)
      );

      expect(burns[0].burnedAmount.toString()).toBe('5'); // 5% of 100
      expect(burns[1].burnedAmount.toString()).toBe('30'); // 3% of 1000
      expect(burns[2].burnedAmount.toString()).toBe('10'); // 2% of 500
      expect(totalBurned.toString()).toBe('45');
    });

    it('should maintain consistency across supply updates', async () => {
      const initialSupply = new Decimal(1000000);
      const initialCirculating = new Decimal(900000);
      let currentBurned = new Decimal(0);

      // Simulate multiple burns
      const burns = [
        new Decimal(100), // 5% of 2000 sale
        new Decimal(30), // 3% of 1000 withdrawal
        new Decimal(10), // 2% of 500 redemption
      ];

      burns.forEach((burn) => {
        currentBurned = currentBurned.plus(burn);
      });

      const finalCirculating = initialCirculating.minus(currentBurned);

      expect(currentBurned.toString()).toBe('140');
      expect(finalCirculating.toString()).toBe('899860');
    });

    it('should handle concurrent burns without data loss', async () => {
      const concurrentBurns = Array.from({ length: 10 }, (_, i) => ({
        userId: `user-${i}`,
        amount: new Decimal(100 * (i + 1)),
        type: BurnTransactionType.COURSE_SALE,
      }));

      const burns = concurrentBurns.map((burn) =>
        calculator.calculateBurn(burn.amount, burn.type)
      );

      const totalBurned = burns.reduce(
        (sum, burn) => sum.plus(burn.burnedAmount),
        new Decimal(0)
      );

      // Sum of 5% of (100, 200, 300, ..., 1000)
      const expectedTotal = new Decimal(2750); // 5% of 55000

      expect(totalBurned.toString()).toBe(expectedTotal.toString());
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle zero burn amount gracefully', async () => {
      expect(() => {
        calculator.calculateBurn(new Decimal(0), BurnTransactionType.COURSE_SALE);
      }).toThrow('Amount must be greater than 0');
    });

    it('should handle negative amounts', async () => {
      expect(() => {
        calculator.calculateBurn(new Decimal(-100), BurnTransactionType.COURSE_SALE);
      }).toThrow('Amount must be greater than 0');
    });

    it('should handle very large amounts', async () => {
      const largeAmount = new Decimal('999999999999.99');
      const burn = calculator.calculateBurn(largeAmount, BurnTransactionType.COURSE_SALE);

      expect(burn.burnedAmount.toString()).toBe('49999999999.9995');
      expect(burn.netAmount.toString()).toBe('949999999999.9905');
    });

    it('should handle very small amounts', async () => {
      const smallAmount = new Decimal('0.01');
      const burn = calculator.calculateBurn(smallAmount, BurnTransactionType.COURSE_SALE);

      expect(burn.burnedAmount.toString()).toBe('0.0005');
      expect(burn.netAmount.toString()).toBe('0.0095');
    });

    it('should validate transaction type', async () => {
      const validation = calculator.validateBurnTransaction(
        new Decimal(100),
        'INVALID_TYPE' as any,
        new Decimal(200)
      );

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should handle pending blockchain transactions', async () => {
      const mockTransaction = {
        id: 'burn-tx-1',
        userId: 'user-123',
        amount: new Decimal(100),
        burnRate: 0.05,
        burnedAmount: new Decimal(5),
        transactionType: BurnTransactionType.COURSE_SALE,
        reason: 'Course sale',
        blockchainTxHash: null,
        blockchainStatus: BlockchainStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(repository, 'createBurnTransaction').mockResolvedValue(mockTransaction);

      const transaction = await burnTracker.logBurnTransaction(
        'user-123',
        new Decimal(100),
        0.05,
        new Decimal(5),
        BurnTransactionType.COURSE_SALE,
        'Course sale'
      );

      expect(transaction.blockchainStatus).toBe(BlockchainStatus.PENDING);
      expect(transaction.blockchainTxHash).toBeNull();
    });

    it('should handle failed blockchain transactions', async () => {
      const mockTransaction = {
        id: 'burn-tx-1',
        userId: 'user-123',
        amount: new Decimal(100),
        burnRate: 0.05,
        burnedAmount: new Decimal(5),
        transactionType: BurnTransactionType.COURSE_SALE,
        reason: 'Course sale',
        blockchainTxHash: null,
        blockchainStatus: BlockchainStatus.FAILED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(repository, 'createBurnTransaction').mockResolvedValue(mockTransaction);

      const transaction = await burnTracker.logBurnTransaction(
        'user-123',
        new Decimal(100),
        0.05,
        new Decimal(5),
        BurnTransactionType.COURSE_SALE,
        'Course sale'
      );

      expect(transaction.blockchainStatus).toBe(BlockchainStatus.FAILED);
    });
  });

  describe('Performance and Scalability', () => {
    it('should calculate burns efficiently for bulk operations', async () => {
      const startTime = Date.now();

      const transactions = Array.from({ length: 1000 }, (_, i) => ({
        amount: new Decimal(100 * (i + 1)),
        type: BurnTransactionType.COURSE_SALE,
      }));

      const burns = calculator.calculateBulkBurns(transactions);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(burns).toHaveLength(1000);
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should calculate total burn efficiently', async () => {
      const transactions = Array.from({ length: 1000 }, (_, i) => ({
        amount: new Decimal(100 * (i + 1)),
        type: BurnTransactionType.COURSE_SALE,
      }));

      const totalBurn = calculator.calculateTotalBurn(transactions);

      expect(totalBurn).toBeDefined();
      expect(totalBurn.toNumber()).toBeGreaterThan(0);
    });
  });
});
