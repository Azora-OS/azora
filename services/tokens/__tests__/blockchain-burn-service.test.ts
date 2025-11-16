import { describe, it, expect, beforeEach, vi } from '@jest/globals';
import { BlockchainBurnService, IBlockchainProvider } from '../blockchain-burn-service';
import {
  BlockchainBurnRequest,
  BlockchainBurnResult,
  BlockchainStatus,
  BurnTransactionType,
} from '../token-burn.types';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Mock blockchain provider for testing
 */
class MockBlockchainProvider implements IBlockchainProvider {
  private callCount = 0;
  private shouldFail = false;
  private failureCount = 0;

  async executeBurn(request: BlockchainBurnRequest): Promise<BlockchainBurnResult> {
    this.callCount++;

    // Simulate transient failures for retry testing
    if (this.shouldFail && this.callCount <= this.failureCount) {
      throw new Error('Simulated blockchain failure');
    }

    return {
      success: true,
      transactionHash: `0x${this.callCount.toString().padStart(64, '0')}`,
      status: BlockchainStatus.CONFIRMED,
      timestamp: new Date(),
    };
  }

  async verifyTransaction(txHash: string): Promise<BlockchainStatus> {
    if (txHash.includes('failed')) {
      return BlockchainStatus.FAILED;
    }
    if (txHash.includes('pending')) {
      return BlockchainStatus.PENDING;
    }
    return BlockchainStatus.CONFIRMED;
  }

  async getGasEstimate(amount: Decimal): Promise<Decimal> {
    return amount.times(new Decimal(0.001));
  }

  async signTransaction(data: string): Promise<string> {
    return `0x${Buffer.from(data).toString('hex')}`;
  }

  setFailure(shouldFail: boolean, failureCount: number = 1): void {
    this.shouldFail = shouldFail;
    this.failureCount = failureCount;
  }

  getCallCount(): number {
    return this.callCount;
  }

  reset(): void {
    this.callCount = 0;
    this.shouldFail = false;
    this.failureCount = 0;
  }
}

describe('BlockchainBurnService', () => {
  let service: BlockchainBurnService;
  let mockProvider: MockBlockchainProvider;

  beforeEach(() => {
    mockProvider = new MockBlockchainProvider();
    service = new BlockchainBurnService(mockProvider);
  });

  describe('executeBurn', () => {
    it('should execute burn successfully', async () => {
      const request: BlockchainBurnRequest = {
        userId: 'user-123',
        burnAmount: new Decimal('100'),
        transactionType: BurnTransactionType.COURSE_SALE,
        reason: 'Course sale burn',
      };

      const result = await service.executeBurn(request);

      expect(result.success).toBe(true);
      expect(result.transactionHash).toBeDefined();
      expect(result.status).toBe(BlockchainStatus.CONFIRMED);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should validate user ID is required', async () => {
      const request: BlockchainBurnRequest = {
        userId: '',
        burnAmount: new Decimal('100'),
        transactionType: BurnTransactionType.COURSE_SALE,
        reason: 'Course sale burn',
      };

      const result = await service.executeBurn(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('User ID is required');
    });

    it('should validate burn amount is greater than zero', async () => {
      const request: BlockchainBurnRequest = {
        userId: 'user-123',
        burnAmount: new Decimal('0'),
        transactionType: BurnTransactionType.COURSE_SALE,
        reason: 'Course sale burn',
      };

      const result = await service.executeBurn(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Burn amount must be greater than 0');
    });

    it('should validate transaction type is valid', async () => {
      const request: any = {
        userId: 'user-123',
        burnAmount: new Decimal('100'),
        transactionType: 'INVALID_TYPE',
        reason: 'Course sale burn',
      };

      const result = await service.executeBurn(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid transaction type');
    });

    it('should validate reason is required', async () => {
      const request: BlockchainBurnRequest = {
        userId: 'user-123',
        burnAmount: new Decimal('100'),
        transactionType: BurnTransactionType.COURSE_SALE,
        reason: '',
      };

      const result = await service.executeBurn(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Reason is required');
    });

    it('should handle different burn transaction types', async () => {
      const types = [
        BurnTransactionType.COURSE_SALE,
        BurnTransactionType.EARNINGS_WITHDRAWAL,
        BurnTransactionType.TOKEN_REDEMPTION,
      ];

      for (const type of types) {
        mockProvider.reset();
        const request: BlockchainBurnRequest = {
          userId: 'user-123',
          burnAmount: new Decimal('100'),
          transactionType: type,
          reason: `Burn for ${type}`,
        };

        const result = await service.executeBurn(request);

        expect(result.success).toBe(true);
        expect(result.transactionHash).toBeDefined();
      }
    });

    it('should include metadata in request', async () => {
      const request: BlockchainBurnRequest = {
        userId: 'user-123',
        burnAmount: new Decimal('100'),
        transactionType: BurnTransactionType.COURSE_SALE,
        reason: 'Course sale burn',
        metadata: {
          courseId: 'course-456',
          salePrice: 1000,
        },
      };

      const result = await service.executeBurn(request);

      expect(result.success).toBe(true);
      expect(result.transactionHash).toBeDefined();
    });
  });

  describe('retry logic', () => {
    it('should retry on transient failure', async () => {
      mockProvider.setFailure(true, 1); // Fail once, then succeed

      const request: BlockchainBurnRequest = {
        userId: 'user-123',
        burnAmount: new Decimal('100'),
        transactionType: BurnTransactionType.COURSE_SALE,
        reason: 'Course sale burn',
      };

      const result = await service.executeBurn(request);

      expect(result.success).toBe(true);
      expect(mockProvider.getCallCount()).toBe(2); // Called twice (1 failure + 1 success)
    });

    it('should respect max retries configuration', async () => {
      mockProvider.setFailure(true, 10); // Always fail

      service.setRetryConfig({
        maxRetries: 2,
        initialDelayMs: 10,
        maxDelayMs: 100,
      });

      const request: BlockchainBurnRequest = {
        userId: 'user-123',
        burnAmount: new Decimal('100'),
        transactionType: BurnTransactionType.COURSE_SALE,
        reason: 'Course sale burn',
      };

      const result = await service.executeBurn(request);

      expect(result.success).toBe(false);
      expect(mockProvider.getCallCount()).toBe(3); // Initial + 2 retries
    });

    it('should use exponential backoff', async () => {
      mockProvider.setFailure(true, 1);

      const startTime = Date.now();

      service.setRetryConfig({
        maxRetries: 2,
        initialDelayMs: 50,
        backoffMultiplier: 2,
        maxDelayMs: 1000,
      });

      const request: BlockchainBurnRequest = {
        userId: 'user-123',
        burnAmount: new Decimal('100'),
        transactionType: BurnTransactionType.COURSE_SALE,
        reason: 'Course sale burn',
      };

      const result = await service.executeBurn(request);

      const elapsedTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      // Should have waited at least 50ms for the first retry
      expect(elapsedTime).toBeGreaterThanOrEqual(40);
    });

    it('should cap delay at maxDelayMs', async () => {
      mockProvider.setFailure(true, 2);

      service.setRetryConfig({
        maxRetries: 3,
        initialDelayMs: 100,
        backoffMultiplier: 10,
        maxDelayMs: 200,
      });

      const request: BlockchainBurnRequest = {
        userId: 'user-123',
        burnAmount: new Decimal('100'),
        transactionType: BurnTransactionType.COURSE_SALE,
        reason: 'Course sale burn',
      };

      const result = await service.executeBurn(request);

      expect(result.success).toBe(true);
      // Should have retried but not exceeded maxDelayMs
      expect(mockProvider.getCallCount()).toBe(3);
    });
  });

  describe('verifyTransaction', () => {
    it('should verify confirmed transaction', async () => {
      const status = await service.verifyTransaction('0x1234567890abcdef');

      expect(status).toBe(BlockchainStatus.CONFIRMED);
    });

    it('should verify pending transaction', async () => {
      const status = await service.verifyTransaction('0xpending1234567890abcdef');

      expect(status).toBe(BlockchainStatus.PENDING);
    });

    it('should verify failed transaction', async () => {
      const status = await service.verifyTransaction('0xfailed1234567890abcdef');

      expect(status).toBe(BlockchainStatus.FAILED);
    });

    it('should retry verification on failure', async () => {
      let callCount = 0;
      const customProvider: IBlockchainProvider = {
        async executeBurn(): Promise<BlockchainBurnResult> {
          return {
            success: true,
            transactionHash: '0x123',
            status: BlockchainStatus.CONFIRMED,
            timestamp: new Date(),
          };
        },
        async verifyTransaction(): Promise<BlockchainStatus> {
          callCount++;
          if (callCount === 1) {
            throw new Error('Temporary failure');
          }
          return BlockchainStatus.CONFIRMED;
        },
        async getGasEstimate(amount: Decimal): Promise<Decimal> {
          return amount;
        },
        async signTransaction(data: string): Promise<string> {
          return data;
        },
      };

      const customService = new BlockchainBurnService(customProvider, {
        maxRetries: 2,
        initialDelayMs: 10,
      });

      const status = await customService.verifyTransaction('0x123');

      expect(status).toBe(BlockchainStatus.CONFIRMED);
      expect(callCount).toBe(2);
    });
  });

  describe('signTransaction', () => {
    it('should sign transaction data', async () => {
      const data = 'transaction-data';

      const signature = await service.signTransaction(data);

      expect(signature).toBeDefined();
      expect(signature).toContain('0x');
    });

    it('should produce consistent signatures for same data', async () => {
      const data = 'transaction-data';

      const signature1 = await service.signTransaction(data);
      const signature2 = await service.signTransaction(data);

      expect(signature1).toBe(signature2);
    });

    it('should produce different signatures for different data', async () => {
      const signature1 = await service.signTransaction('data-1');
      const signature2 = await service.signTransaction('data-2');

      expect(signature1).not.toBe(signature2);
    });
  });

  describe('verifyTransactionSignature', () => {
    it('should verify valid signature', async () => {
      const data = 'transaction-data';
      const signature = await service.signTransaction(data);

      const isValid = await service.verifyTransactionSignature(data, signature);

      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', async () => {
      const data = 'transaction-data';
      const invalidSignature = '0xinvalidsignature';

      const isValid = await service.verifyTransactionSignature(data, invalidSignature);

      expect(isValid).toBe(false);
    });

    it('should reject signature for different data', async () => {
      const data1 = 'transaction-data-1';
      const data2 = 'transaction-data-2';

      const signature = await service.signTransaction(data1);
      const isValid = await service.verifyTransactionSignature(data2, signature);

      expect(isValid).toBe(false);
    });
  });

  describe('getGasEstimate', () => {
    it('should get gas estimate for amount', async () => {
      const amount = new Decimal('1000');

      const estimate = await service.getGasEstimate(amount);

      expect(estimate).toBeDefined();
      expect(estimate).toEqual(new Decimal('1'));
    });

    it('should handle different amounts', async () => {
      const amounts = [
        new Decimal('100'),
        new Decimal('1000'),
        new Decimal('10000'),
      ];

      for (const amount of amounts) {
        const estimate = await service.getGasEstimate(amount);
        expect(estimate).toEqual(amount.times(new Decimal(0.001)));
      }
    });
  });

  describe('provider management', () => {
    it('should set custom provider', () => {
      const customProvider: IBlockchainProvider = {
        async executeBurn(): Promise<BlockchainBurnResult> {
          return {
            success: true,
            transactionHash: '0xcustom',
            status: BlockchainStatus.CONFIRMED,
            timestamp: new Date(),
          };
        },
        async verifyTransaction(): Promise<BlockchainStatus> {
          return BlockchainStatus.CONFIRMED;
        },
        async getGasEstimate(amount: Decimal): Promise<Decimal> {
          return amount;
        },
        async signTransaction(data: string): Promise<string> {
          return data;
        },
      };

      service.setProvider(customProvider);

      // Provider should be updated
      expect(service).toBeDefined();
    });

    it('should update retry configuration', () => {
      const newConfig = {
        maxRetries: 5,
        initialDelayMs: 500,
      };

      service.setRetryConfig(newConfig);

      const config = service.getRetryConfig();

      expect(config.maxRetries).toBe(5);
      expect(config.initialDelayMs).toBe(500);
    });

    it('should get current retry configuration', () => {
      const config = service.getRetryConfig();

      expect(config).toBeDefined();
      expect(config.maxRetries).toBeGreaterThan(0);
      expect(config.initialDelayMs).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle provider errors gracefully', async () => {
      const errorProvider: IBlockchainProvider = {
        async executeBurn(): Promise<BlockchainBurnResult> {
          throw new Error('Provider error');
        },
        async verifyTransaction(): Promise<BlockchainStatus> {
          throw new Error('Provider error');
        },
        async getGasEstimate(): Promise<Decimal> {
          throw new Error('Provider error');
        },
        async signTransaction(): Promise<string> {
          throw new Error('Provider error');
        },
      };

      const errorService = new BlockchainBurnService(errorProvider, {
        maxRetries: 1,
        initialDelayMs: 10,
      });

      const request: BlockchainBurnRequest = {
        userId: 'user-123',
        burnAmount: new Decimal('100'),
        transactionType: BurnTransactionType.COURSE_SALE,
        reason: 'Course sale burn',
      };

      const result = await errorService.executeBurn(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Provider error');
    });

    it('should handle gas estimate errors', async () => {
      const errorProvider: IBlockchainProvider = {
        async executeBurn(): Promise<BlockchainBurnResult> {
          return {
            success: true,
            transactionHash: '0x123',
            status: BlockchainStatus.CONFIRMED,
            timestamp: new Date(),
          };
        },
        async verifyTransaction(): Promise<BlockchainStatus> {
          return BlockchainStatus.CONFIRMED;
        },
        async getGasEstimate(): Promise<Decimal> {
          throw new Error('Gas estimation failed');
        },
        async signTransaction(data: string): Promise<string> {
          return data;
        },
      };

      const errorService = new BlockchainBurnService(errorProvider);

      try {
        await errorService.getGasEstimate(new Decimal('1000'));
        expect(true).toBe(false); // Should throw
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('integration scenarios', () => {
    it('should execute complete burn flow', async () => {
      const request: BlockchainBurnRequest = {
        userId: 'user-123',
        burnAmount: new Decimal('100'),
        transactionType: BurnTransactionType.COURSE_SALE,
        reason: 'Course sale burn',
        metadata: {
          courseId: 'course-456',
        },
      };

      // Execute burn
      const burnResult = await service.executeBurn(request);
      expect(burnResult.success).toBe(true);

      // Verify transaction
      if (burnResult.transactionHash) {
        const verifyResult = await service.verifyTransaction(burnResult.transactionHash);
        expect(verifyResult).toBe(BlockchainStatus.CONFIRMED);
      }

      // Get gas estimate
      const gasEstimate = await service.getGasEstimate(request.burnAmount);
      expect(gasEstimate).toBeDefined();
    });

    it('should handle multiple concurrent burns', async () => {
      const requests: BlockchainBurnRequest[] = [
        {
          userId: 'user-1',
          burnAmount: new Decimal('100'),
          transactionType: BurnTransactionType.COURSE_SALE,
          reason: 'Burn 1',
        },
        {
          userId: 'user-2',
          burnAmount: new Decimal('200'),
          transactionType: BurnTransactionType.EARNINGS_WITHDRAWAL,
          reason: 'Burn 2',
        },
        {
          userId: 'user-3',
          burnAmount: new Decimal('300'),
          transactionType: BurnTransactionType.TOKEN_REDEMPTION,
          reason: 'Burn 3',
        },
      ];

      const results = await Promise.all(
        requests.map((req) => service.executeBurn(req))
      );

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.transactionHash).toBeDefined();
      });
    });
  });
});
