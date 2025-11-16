/**
 * Burn Tracker Service Tests
 * Tests for burn transaction tracking and supply management
 */

import { Decimal } from '@prisma/client/runtime/library';
import { BurnTracker } from '../burn-tracker';
import { TokenBurnRepository } from '../token-burn-repository';
import {
  BurnTransactionType,
  BlockchainStatus,
  BurnTransactionRecord,
  TokenSupplyData,
} from '../token-burn.types';

// Mock the repository
jest.mock('../token-burn-repository');

describe('BurnTracker', () => {
  let burnTracker: BurnTracker;
  let mockRepository: jest.Mocked<TokenBurnRepository>;

  beforeEach(() => {
    mockRepository = new TokenBurnRepository() as jest.Mocked<TokenBurnRepository>;
    burnTracker = new BurnTracker(mockRepository);
  });

  describe('logBurnTransaction', () => {
    it('should log a burn transaction successfully', async () => {
      const mockTransaction: BurnTransactionRecord = {
        id: 'tx-1',
        userId: 'user-1',
        amount: new Decimal('100'),
        burnRate: 0.05,
        burnedAmount: new Decimal('5'),
        transactionType: BurnTransactionType.COURSE_SALE,
        reason: 'Course sale',
        blockchainStatus: BlockchainStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.createBurnTransaction.mockResolvedValue(mockTransaction);

      const result = await burnTracker.logBurnTransaction(
        'user-1',
        new Decimal('100'),
        0.05,
        new Decimal('5'),
        BurnTransactionType.COURSE_SALE,
        'Course sale'
      );

      expect(result).toEqual(mockTransaction);
      expect(mockRepository.createBurnTransaction).toHaveBeenCalledWith(
        'user-1',
        new Decimal('100'),
        0.05,
        new Decimal('5'),
        BurnTransactionType.COURSE_SALE,
        'Course sale',
        undefined
      );
    });

    it('should include metadata when provided', async () => {
      const mockTransaction: BurnTransactionRecord = {
        id: 'tx-1',
        userId: 'user-1',
        amount: new Decimal('100'),
        burnRate: 0.05,
        burnedAmount: new Decimal('5'),
        transactionType: BurnTransactionType.COURSE_SALE,
        reason: 'Course sale',
        blockchainStatus: BlockchainStatus.PENDING,
        metadata: { courseId: 'course-1' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.createBurnTransaction.mockResolvedValue(mockTransaction);

      const metadata = { courseId: 'course-1' };
      const result = await burnTracker.logBurnTransaction(
        'user-1',
        new Decimal('100'),
        0.05,
        new Decimal('5'),
        BurnTransactionType.COURSE_SALE,
        'Course sale',
        metadata
      );

      expect(result.metadata).toEqual(metadata);
      expect(mockRepository.createBurnTransaction).toHaveBeenCalledWith(
        'user-1',
        new Decimal('100'),
        0.05,
        new Decimal('5'),
        BurnTransactionType.COURSE_SALE,
        'Course sale',
        metadata
      );
    });
  });

  describe('confirmBurnTransaction', () => {
    it('should confirm a burn transaction with blockchain hash', async () => {
      const mockTransaction: BurnTransactionRecord = {
        id: 'tx-1',
        userId: 'user-1',
        amount: new Decimal('100'),
        burnRate: 0.05,
        burnedAmount: new Decimal('5'),
        transactionType: BurnTransactionType.COURSE_SALE,
        reason: 'Course sale',
        blockchainTxHash: '0xabc123',
        blockchainStatus: BlockchainStatus.CONFIRMED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.updateBurnTransactionHash.mockResolvedValue(mockTransaction);

      const result = await burnTracker.confirmBurnTransaction(
        'tx-1',
        '0xabc123',
        BlockchainStatus.CONFIRMED
      );

      expect(result.blockchainStatus).toBe(BlockchainStatus.CONFIRMED);
      expect(result.blockchainTxHash).toBe('0xabc123');
      expect(mockRepository.updateBurnTransactionHash).toHaveBeenCalledWith(
        'tx-1',
        '0xabc123',
        BlockchainStatus.CONFIRMED
      );
    });
  });

  describe('getTotalBurnedSupply', () => {
    it('should return total burned supply', async () => {
      const mockSupply: TokenSupplyData = {
        id: 'supply-1',
        totalSupply: new Decimal('1000000'),
        circulatingSupply: new Decimal('950000'),
        burnedSupply: new Decimal('50000'),
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.getTokenSupply.mockResolvedValue(mockSupply);

      const result = await burnTracker.getTotalBurnedSupply();

      expect(result).toEqual(new Decimal('50000'));
      expect(mockRepository.getTokenSupply).toHaveBeenCalled();
    });

    it('should return 0 when no supply record exists', async () => {
      mockRepository.getTokenSupply.mockResolvedValue(null);

      const result = await burnTracker.getTotalBurnedSupply();

      expect(result).toEqual(new Decimal(0));
    });
  });

  describe('getUserCumulativeBurn', () => {
    it('should calculate cumulative burn for a user', async () => {
      const mockTransactions: BurnTransactionRecord[] = [
        {
          id: 'tx-1',
          userId: 'user-1',
          amount: new Decimal('100'),
          burnRate: 0.05,
          burnedAmount: new Decimal('5'),
          transactionType: BurnTransactionType.COURSE_SALE,
          reason: 'Course sale',
          blockchainStatus: BlockchainStatus.CONFIRMED,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'tx-2',
          userId: 'user-1',
          amount: new Decimal('200'),
          burnRate: 0.03,
          burnedAmount: new Decimal('6'),
          transactionType: BurnTransactionType.EARNINGS_WITHDRAWAL,
          reason: 'Earnings withdrawal',
          blockchainStatus: BlockchainStatus.CONFIRMED,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.getBurnHistory.mockResolvedValue({
        transactions: mockTransactions,
        total: 2,
        page: 1,
        limit: 20,
        totalBurned: new Decimal('11'),
      });

      const result = await burnTracker.getUserCumulativeBurn('user-1');

      expect(result).toEqual(new Decimal('11'));
    });
  });

  describe('updateSupplyAfterBurn', () => {
    it('should update token supply after burn', async () => {
      const currentSupply: TokenSupplyData = {
        id: 'supply-1',
        totalSupply: new Decimal('1000000'),
        circulatingSupply: new Decimal('950000'),
        burnedSupply: new Decimal('50000'),
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedSupply: TokenSupplyData = {
        id: 'supply-1',
        totalSupply: new Decimal('1000000'),
        circulatingSupply: new Decimal('949995'),
        burnedSupply: new Decimal('50005'),
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.getTokenSupply.mockResolvedValue(currentSupply);
      mockRepository.updateTokenSupply.mockResolvedValue(updatedSupply);

      const result = await burnTracker.updateSupplyAfterBurn(
        new Decimal('1000000'),
        new Decimal('950000'),
        new Decimal('5')
      );

      expect(result.burnedSupply).toEqual(new Decimal('50005'));
      expect(result.circulatingSupply).toEqual(new Decimal('949995'));
      expect(mockRepository.updateTokenSupply).toHaveBeenCalledWith(
        new Decimal('1000000'),
        new Decimal('999995'),
        new Decimal('50005')
      );
    });

    it('should handle first burn when no supply record exists', async () => {
      const updatedSupply: TokenSupplyData = {
        id: 'supply-1',
        totalSupply: new Decimal('1000000'),
        circulatingSupply: new Decimal('999995'),
        burnedSupply: new Decimal('5'),
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.getTokenSupply.mockResolvedValue(null);
      mockRepository.updateTokenSupply.mockResolvedValue(updatedSupply);

      const result = await burnTracker.updateSupplyAfterBurn(
        new Decimal('1000000'),
        new Decimal('1000000'),
        new Decimal('5')
      );

      expect(result.burnedSupply).toEqual(new Decimal('5'));
      expect(mockRepository.updateTokenSupply).toHaveBeenCalledWith(
        new Decimal('1000000'),
        new Decimal('999995'),
        new Decimal('5')
      );
    });
  });

  describe('getBurnHistory', () => {
    it('should retrieve burn history with filters', async () => {
      const mockHistory = {
        transactions: [
          {
            id: 'tx-1',
            userId: 'user-1',
            amount: new Decimal('100'),
            burnRate: 0.05,
            burnedAmount: new Decimal('5'),
            transactionType: BurnTransactionType.COURSE_SALE,
            reason: 'Course sale',
            blockchainStatus: BlockchainStatus.CONFIRMED,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalBurned: new Decimal('5'),
      };

      mockRepository.getBurnHistory.mockResolvedValue(mockHistory);

      const result = await burnTracker.getBurnHistory({
        userId: 'user-1',
        transactionType: BurnTransactionType.COURSE_SALE,
      });

      expect(result).toEqual(mockHistory);
      expect(mockRepository.getBurnHistory).toHaveBeenCalled();
    });
  });

  describe('getBurnStatistics', () => {
    it('should calculate burn statistics', async () => {
      const mockStats = {
        totalBurned: new Decimal('50000'),
        burnsByType: {
          courseSale: new Decimal('25000'),
          earningsWithdrawal: new Decimal('15000'),
          tokenRedemption: new Decimal('10000'),
        },
        averageBurnPerTransaction: new Decimal('500'),
        transactionCount: 100,
        successRate: 0.95,
      };

      mockRepository.getBurnStatistics.mockResolvedValue(mockStats);

      const result = await burnTracker.getBurnStatistics();

      expect(result).toEqual(mockStats);
      expect(mockRepository.getBurnStatistics).toHaveBeenCalled();
    });
  });

  describe('getBurnStatisticsByType', () => {
    it('should calculate burn statistics for a specific type', async () => {
      const mockHistory = {
        transactions: [
          {
            id: 'tx-1',
            userId: 'user-1',
            amount: new Decimal('100'),
            burnRate: 0.05,
            burnedAmount: new Decimal('5'),
            transactionType: BurnTransactionType.COURSE_SALE,
            reason: 'Course sale',
            blockchainStatus: BlockchainStatus.CONFIRMED,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'tx-2',
            userId: 'user-2',
            amount: new Decimal('200'),
            burnRate: 0.05,
            burnedAmount: new Decimal('10'),
            transactionType: BurnTransactionType.COURSE_SALE,
            reason: 'Course sale',
            blockchainStatus: BlockchainStatus.CONFIRMED,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 2,
        page: 1,
        limit: 20,
        totalBurned: new Decimal('15'),
      };

      mockRepository.getBurnHistory.mockResolvedValue(mockHistory);

      const result = await burnTracker.getBurnStatisticsByType(BurnTransactionType.COURSE_SALE);

      expect(result.totalBurned).toEqual(new Decimal('15'));
      expect(result.transactionCount).toBe(2);
      expect(result.averageBurn).toEqual(new Decimal('7.5'));
    });
  });

  describe('getHistoricalBurnData', () => {
    it('should retrieve historical burn data for a date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const mockHistory = {
        transactions: [
          {
            id: 'tx-1',
            userId: 'user-1',
            amount: new Decimal('100'),
            burnRate: 0.05,
            burnedAmount: new Decimal('5'),
            transactionType: BurnTransactionType.COURSE_SALE,
            reason: 'Course sale',
            blockchainStatus: BlockchainStatus.CONFIRMED,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
          },
        ],
        total: 1,
        page: 1,
        limit: 10000,
        totalBurned: new Decimal('5'),
      };

      mockRepository.getBurnHistory.mockResolvedValue(mockHistory);

      const result = await burnTracker.getHistoricalBurnData(startDate, endDate);

      expect(result.transactions.length).toBe(1);
      expect(result.totalBurned).toEqual(new Decimal('5'));
      expect(result.dailyBreakdown['2024-01-15']).toEqual(new Decimal('5'));
    });
  });

  describe('getPendingBurnTransactions', () => {
    it('should retrieve pending burn transactions', async () => {
      const mockPendingTransactions = {
        transactions: [
          {
            id: 'tx-1',
            userId: 'user-1',
            amount: new Decimal('100'),
            burnRate: 0.05,
            burnedAmount: new Decimal('5'),
            transactionType: BurnTransactionType.COURSE_SALE,
            reason: 'Course sale',
            blockchainStatus: BlockchainStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10000,
        totalBurned: new Decimal('5'),
      };

      mockRepository.getBurnHistory.mockResolvedValue(mockPendingTransactions);

      const result = await burnTracker.getPendingBurnTransactions();

      expect(result.length).toBe(1);
      expect(result[0].blockchainStatus).toBe(BlockchainStatus.PENDING);
    });
  });

  describe('getFailedBurnTransactions', () => {
    it('should retrieve failed burn transactions', async () => {
      const mockFailedTransactions = {
        transactions: [
          {
            id: 'tx-1',
            userId: 'user-1',
            amount: new Decimal('100'),
            burnRate: 0.05,
            burnedAmount: new Decimal('5'),
            transactionType: BurnTransactionType.COURSE_SALE,
            reason: 'Course sale',
            blockchainStatus: BlockchainStatus.FAILED,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10000,
        totalBurned: new Decimal('5'),
      };

      mockRepository.getBurnHistory.mockResolvedValue(mockFailedTransactions);

      const result = await burnTracker.getFailedBurnTransactions();

      expect(result.length).toBe(1);
      expect(result[0].blockchainStatus).toBe(BlockchainStatus.FAILED);
    });
  });

  describe('calculateOwnershipPercentage', () => {
    it('should calculate ownership percentage correctly', async () => {
      const userTokens = new Decimal('100000');
      const totalSupply = new Decimal('1000000');

      const result = await burnTracker.calculateOwnershipPercentage(userTokens, totalSupply);

      expect(result).toBe(10); // 100000 / 1000000 * 100 = 10%
    });

    it('should return 0 when total supply is 0', async () => {
      const userTokens = new Decimal('100000');
      const totalSupply = new Decimal('0');

      const result = await burnTracker.calculateOwnershipPercentage(userTokens, totalSupply);

      expect(result).toBe(0);
    });

    it('should handle small percentages', async () => {
      const userTokens = new Decimal('1');
      const totalSupply = new Decimal('1000000');

      const result = await burnTracker.calculateOwnershipPercentage(userTokens, totalSupply);

      expect(result).toBeCloseTo(0.0001, 6);
    });
  });

  describe('getSupplyTrendData', () => {
    it('should retrieve supply trend data', async () => {
      const mockSupply: TokenSupplyData = {
        id: 'supply-1',
        totalSupply: new Decimal('1000000'),
        circulatingSupply: new Decimal('950000'),
        burnedSupply: new Decimal('50000'),
        lastUpdated: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockHistoricalData = {
        transactions: [],
        totalBurned: new Decimal('50000'),
        dailyBreakdown: {
          '2024-01-01': new Decimal('1000'),
          '2024-01-02': new Decimal('1500'),
        },
      };

      mockRepository.getTokenSupply.mockResolvedValue(mockSupply);
      mockRepository.getBurnHistory.mockResolvedValue({
        transactions: [],
        total: 0,
        page: 1,
        limit: 10000,
        totalBurned: new Decimal('0'),
      });

      // Mock the getHistoricalBurnData method
      jest.spyOn(burnTracker, 'getHistoricalBurnData').mockResolvedValue(mockHistoricalData);

      const result = await burnTracker.getSupplyTrendData(30);

      expect(result.dates.length).toBe(30);
      expect(result.totalSupply.length).toBe(30);
      expect(result.circulatingSupply.length).toBe(30);
      expect(result.burnedSupply.length).toBe(30);
    });
  });

  describe('getBurnTransaction', () => {
    it('should retrieve a specific burn transaction', async () => {
      const mockTransaction: BurnTransactionRecord = {
        id: 'tx-1',
        userId: 'user-1',
        amount: new Decimal('100'),
        burnRate: 0.05,
        burnedAmount: new Decimal('5'),
        transactionType: BurnTransactionType.COURSE_SALE,
        reason: 'Course sale',
        blockchainStatus: BlockchainStatus.CONFIRMED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.getBurnTransaction.mockResolvedValue(mockTransaction);

      const result = await burnTracker.getBurnTransaction('tx-1');

      expect(result).toEqual(mockTransaction);
      expect(mockRepository.getBurnTransaction).toHaveBeenCalledWith('tx-1');
    });

    it('should return null when transaction not found', async () => {
      mockRepository.getBurnTransaction.mockResolvedValue(null);

      const result = await burnTracker.getBurnTransaction('tx-nonexistent');

      expect(result).toBeNull();
    });
  });
});
