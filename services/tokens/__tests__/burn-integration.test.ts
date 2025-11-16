/**
 * Burn Integration Service Tests
 * Tests for integrating burn mechanism into payment flows
 */

import { Decimal } from '@prisma/client/runtime/library';
import { BurnIntegrationService } from '../burn-integration';
import { TokenBurnCalculator } from '../token-burn-calculator';
import { BlockchainBurnService } from '../blockchain-burn-service';
import { BurnTracker } from '../burn-tracker';
import {
  BurnTransactionType,
  BlockchainStatus,
  BurnTransactionRecord,
} from '../token-burn.types';

// Mock the services
jest.mock('../token-burn-calculator');
jest.mock('../blockchain-burn-service');
jest.mock('../burn-tracker');

describe('BurnIntegrationService', () => {
  let burnIntegration: BurnIntegrationService;
  let mockCalculator: jest.Mocked<TokenBurnCalculator>;
  let mockBlockchainService: jest.Mocked<BlockchainBurnService>;
  let mockBurnTracker: jest.Mocked<BurnTracker>;

  beforeEach(() => {
    mockCalculator = new TokenBurnCalculator() as jest.Mocked<TokenBurnCalculator>;
    mockBlockchainService = new BlockchainBurnService() as jest.Mocked<BlockchainBurnService>;
    mockBurnTracker = new BurnTracker(
      new (require('../token-burn-repository').TokenBurnRepository)()
    ) as jest.Mocked<BurnTracker>;

    burnIntegration = new BurnIntegrationService(
      mockCalculator,
      mockBlockchainService,
      mockBurnTracker
    );
  });

  describe('processSaleBurn', () => {
    it('should process burn on course sale successfully', async () => {
      const mockBurnTx: BurnTransactionRecord = {
        id: 'tx-1',
        userId: 'user-1',
        amount: new Decimal('100'),
        burnRate: 0.05,
        burnedAmount: new Decimal('5'),
        transactionType: BurnTransactionType.COURSE_SALE,
        reason: 'Course sale: course-1',
        blockchainStatus: BlockchainStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCalculator.calculateBurn.mockReturnValue({
        originalAmount: new Decimal('100'),
        burnRate: 0.05,
        burnedAmount: new Decimal('5'),
        netAmount: new Decimal('95'),
      });

      mockBurnTracker.logBurnTransaction.mockResolvedValue(mockBurnTx);
      mockBlockchainService.executeBurn.mockResolvedValue({
        success: true,
        transactionHash: '0xabc123',
        status: BlockchainStatus.CONFIRMED,
        timestamp: new Date(),
      });

      mockBurnTracker.confirmBurnTransaction.mockResolvedValue({
        ...mockBurnTx,
        blockchainTxHash: '0xabc123',
        blockchainStatus: BlockchainStatus.CONFIRMED,
      });

      const result = await burnIntegration.processSaleBurn(
        'user-1',
        new Decimal('100'),
        'course-1'
      );

      expect(result.success).toBe(true);
      expect(result.burnedAmount).toEqual(new Decimal('5'));
      expect(result.netAmount).toEqual(new Decimal('95'));
      expect(result.burnTransactionId).toBe('tx-1');
    });

    it('should handle blockchain failure gracefully', async () => {
      const mockBurnTx: BurnTransactionRecord = {
        id: 'tx-1',
        userId: 'user-1',
        amount: new Decimal('100'),
        burnRate: 0.05,
        burnedAmount: new Decimal('5'),
        transactionType: BurnTransactionType.COURSE_SALE,
        reason: 'Course sale: course-1',
        blockchainStatus: BlockchainStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCalculator.calculateBurn.mockReturnValue({
        originalAmount: new Decimal('100'),
        burnRate: 0.05,
        burnedAmount: new Decimal('5'),
        netAmount: new Decimal('95'),
      });

      mockBurnTracker.logBurnTransaction.mockResolvedValue(mockBurnTx);
      mockBlockchainService.executeBurn.mockResolvedValue({
        success: false,
        status: BlockchainStatus.FAILED,
        error: 'Blockchain error',
        timestamp: new Date(),
      });

      const result = await burnIntegration.processSaleBurn(
        'user-1',
        new Decimal('100'),
        'course-1'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Blockchain error');
    });
  });

  describe('processWithdrawalBurn', () => {
    it('should process burn on earnings withdrawal successfully', async () => {
      const mockBurnTx: BurnTransactionRecord = {
        id: 'tx-2',
        userId: 'user-1',
        amount: new Decimal('200'),
        burnRate: 0.03,
        burnedAmount: new Decimal('6'),
        transactionType: BurnTransactionType.EARNINGS_WITHDRAWAL,
        reason: 'Earnings withdrawal: withdrawal-1',
        blockchainStatus: BlockchainStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCalculator.calculateBurn.mockReturnValue({
        originalAmount: new Decimal('200'),
        burnRate: 0.03,
        burnedAmount: new Decimal('6'),
        netAmount: new Decimal('194'),
      });

      mockBurnTracker.logBurnTransaction.mockResolvedValue(mockBurnTx);
      mockBlockchainService.executeBurn.mockResolvedValue({
        success: true,
        transactionHash: '0xdef456',
        status: BlockchainStatus.CONFIRMED,
        timestamp: new Date(),
      });

      mockBurnTracker.confirmBurnTransaction.mockResolvedValue({
        ...mockBurnTx,
        blockchainTxHash: '0xdef456',
        blockchainStatus: BlockchainStatus.CONFIRMED,
      });

      const result = await burnIntegration.processWithdrawalBurn(
        'user-1',
        new Decimal('200'),
        'withdrawal-1'
      );

      expect(result.success).toBe(true);
      expect(result.burnedAmount).toEqual(new Decimal('6'));
      expect(result.netAmount).toEqual(new Decimal('194'));
    });
  });

  describe('processRedemptionBurn', () => {
    it('should process burn on token redemption successfully', async () => {
      const mockBurnTx: BurnTransactionRecord = {
        id: 'tx-3',
        userId: 'user-1',
        amount: new Decimal('50'),
        burnRate: 0.02,
        burnedAmount: new Decimal('1'),
        transactionType: BurnTransactionType.TOKEN_REDEMPTION,
        reason: 'Token redemption: redemption-1',
        blockchainStatus: BlockchainStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCalculator.calculateBurn.mockReturnValue({
        originalAmount: new Decimal('50'),
        burnRate: 0.02,
        burnedAmount: new Decimal('1'),
        netAmount: new Decimal('49'),
      });

      mockBurnTracker.logBurnTransaction.mockResolvedValue(mockBurnTx);
      mockBlockchainService.executeBurn.mockResolvedValue({
        success: true,
        transactionHash: '0xghi789',
        status: BlockchainStatus.CONFIRMED,
        timestamp: new Date(),
      });

      mockBurnTracker.confirmBurnTransaction.mockResolvedValue({
        ...mockBurnTx,
        blockchainTxHash: '0xghi789',
        blockchainStatus: BlockchainStatus.CONFIRMED,
      });

      const result = await burnIntegration.processRedemptionBurn(
        'user-1',
        new Decimal('50'),
        'redemption-1'
      );

      expect(result.success).toBe(true);
      expect(result.burnedAmount).toEqual(new Decimal('1'));
      expect(result.netAmount).toEqual(new Decimal('49'));
    });
  });

  describe('getBurnImpact', () => {
    it('should calculate burn impact for a transaction', async () => {
      mockCalculator.calculateBurn.mockReturnValue({
        originalAmount: new Decimal('100'),
        burnRate: 0.05,
        burnedAmount: new Decimal('5'),
        netAmount: new Decimal('95'),
      });

      mockCalculator.calculatePercentageLoss.mockReturnValue(5);

      const result = await burnIntegration.getBurnImpact(
        new Decimal('100'),
        BurnTransactionType.COURSE_SALE
      );

      expect(result.originalAmount).toEqual(new Decimal('100'));
      expect(result.burnedAmount).toEqual(new Decimal('5'));
      expect(result.netAmount).toEqual(new Decimal('95'));
      expect(result.burnPercentage).toBe(5);
    });
  });

  describe('getUserBurnImpact', () => {
    it('should calculate user burn impact', async () => {
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

      mockBurnTracker.getBurnStatistics.mockResolvedValue(mockStats);
      mockBurnTracker.getBurnHistory.mockResolvedValue(mockHistory);

      const result = await burnIntegration.getUserBurnImpact('user-1');

      expect(result.totalBurned).toEqual(new Decimal('5'));
      expect(result.burnsByType.courseSale).toEqual(new Decimal('5'));
    });
  });

  describe('validateBurnTransaction', () => {
    it('should validate burn transaction', async () => {
      mockCalculator.validateBurnTransaction.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: [],
      });

      const result = await burnIntegration.validateBurnTransaction(
        'user-1',
        new Decimal('100'),
        BurnTransactionType.COURSE_SALE,
        new Decimal('1000')
      );

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should return validation errors', async () => {
      mockCalculator.validateBurnTransaction.mockReturnValue({
        isValid: false,
        errors: ['Insufficient balance'],
        warnings: [],
      });

      const result = await burnIntegration.validateBurnTransaction(
        'user-1',
        new Decimal('100'),
        BurnTransactionType.COURSE_SALE,
        new Decimal('50')
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Insufficient balance');
    });
  });
});
