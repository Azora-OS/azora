/**
 * Blockchain Burn Service
 * Handles token burn execution on blockchain with Web3 integration
 */

import { Decimal } from '@prisma/client/runtime/library';
import { createLogger } from '../shared/logging';
import {
  BlockchainBurnRequest,
  BlockchainBurnResult,
  BlockchainStatus,
  BurnTransactionType,
} from './token-burn.types';

const logger = createLogger('BlockchainBurnService');

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

/**
 * Interface for blockchain provider
 */
export interface IBlockchainProvider {
  executeBurn(request: BlockchainBurnRequest): Promise<BlockchainBurnResult>;
  verifyTransaction(txHash: string): Promise<BlockchainStatus>;
  getGasEstimate(amount: Decimal): Promise<Decimal>;
  signTransaction(data: string): Promise<string>;
}

/**
 * Mock blockchain provider for development
 */
class MockBlockchainProvider implements IBlockchainProvider {
  async executeBurn(request: BlockchainBurnRequest): Promise<BlockchainBurnResult> {
    logger.info('Mock blockchain burn execution', {
      userId: request.userId,
      amount: request.burnAmount.toString(),
    });

    // Simulate blockchain delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      success: true,
      transactionHash: `0x${Math.random().toString(16).slice(2)}`,
      status: BlockchainStatus.CONFIRMED,
      timestamp: new Date(),
    };
  }

  async verifyTransaction(txHash: string): Promise<BlockchainStatus> {
    logger.info('Mock transaction verification', { txHash });
    return BlockchainStatus.CONFIRMED;
  }

  async getGasEstimate(amount: Decimal): Promise<Decimal> {
    // Mock gas estimate: 0.1% of amount
    return amount.times(new Decimal(0.001));
  }

  async signTransaction(data: string): Promise<string> {
    // Mock signature
    return `0x${Buffer.from(data).toString('hex')}`;
  }
}

export class BlockchainBurnService {
  private provider: IBlockchainProvider;
  private retryConfig: RetryConfig;

  constructor(provider?: IBlockchainProvider, retryConfig?: Partial<RetryConfig>) {
    this.provider = provider || new MockBlockchainProvider();
    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...retryConfig,
    };
  }

  /**
   * Execute token burn on blockchain with retry logic
   */
  async executeBurn(request: BlockchainBurnRequest): Promise<BlockchainBurnResult> {
    try {
      logger.info('Executing blockchain burn', {
        userId: request.userId,
        amount: request.burnAmount.toString(),
        type: request.transactionType,
      });

      // Validate request
      this.validateBurnRequest(request);

      // Execute burn with retry logic
      const result = await this.executeWithRetry(() => this.provider.executeBurn(request));

      if (result.success) {
        logger.info('Blockchain burn successful', {
          userId: request.userId,
          txHash: result.transactionHash,
        });

        // Verify transaction after successful execution
        if (result.transactionHash) {
          await this.verifyTransactionWithRetry(result.transactionHash);
        }
      } else {
        logger.error('Blockchain burn failed', {
          userId: request.userId,
          error: result.error,
        });
      }

      return result;
    } catch (error) {
      logger.error('Failed to execute blockchain burn', { error, request });
      return {
        success: false,
        status: BlockchainStatus.FAILED,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Execute function with exponential backoff retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    attempt: number = 0
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (attempt < this.retryConfig.maxRetries) {
        const delayMs = Math.min(
          this.retryConfig.initialDelayMs * Math.pow(this.retryConfig.backoffMultiplier, attempt),
          this.retryConfig.maxDelayMs
        );

        logger.warn('Retrying blockchain operation', {
          attempt: attempt + 1,
          maxRetries: this.retryConfig.maxRetries,
          delayMs,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return this.executeWithRetry(fn, attempt + 1);
      }

      logger.error('Max retries exceeded for blockchain operation', {
        maxRetries: this.retryConfig.maxRetries,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  /**
   * Verify transaction status on blockchain with retry logic
   */
  async verifyTransaction(txHash: string): Promise<BlockchainStatus> {
    try {
      logger.info('Verifying blockchain transaction', { txHash });

      const status = await this.verifyTransactionWithRetry(txHash);

      logger.info('Transaction verification result', { txHash, status });

      return status;
    } catch (error) {
      logger.error('Failed to verify transaction', { error, txHash });
      throw error;
    }
  }

  /**
   * Verify transaction with retry logic
   */
  private async verifyTransactionWithRetry(txHash: string): Promise<BlockchainStatus> {
    return this.executeWithRetry(() => this.provider.verifyTransaction(txHash));
  }

  /**
   * Sign transaction data
   */
  async signTransaction(data: string): Promise<string> {
    try {
      logger.info('Signing transaction', { dataLength: data.length });

      const signature = await this.provider.signTransaction(data);

      logger.info('Transaction signed successfully');

      return signature;
    } catch (error) {
      logger.error('Failed to sign transaction', { error });
      throw error;
    }
  }

  /**
   * Verify transaction signature
   */
  async verifyTransactionSignature(data: string, signature: string): Promise<boolean> {
    try {
      logger.info('Verifying transaction signature', {
        dataLength: data.length,
        signatureLength: signature.length,
      });

      // Verify signature matches the data
      const expectedSignature = await this.provider.signTransaction(data);
      const isValid = signature === expectedSignature;

      logger.info('Transaction signature verification result', { isValid });

      return isValid;
    } catch (error) {
      logger.error('Failed to verify transaction signature', { error });
      throw error;
    }
  }

  /**
   * Get gas estimate for burn transaction
   */
  async getGasEstimate(amount: Decimal): Promise<Decimal> {
    try {
      logger.info('Getting gas estimate', { amount: amount.toString() });

      const estimate = await this.provider.getGasEstimate(amount);

      logger.info('Gas estimate calculated', { estimate: estimate.toString() });

      return estimate;
    } catch (error) {
      logger.error('Failed to get gas estimate', { error, amount: amount.toString() });
      throw error;
    }
  }

  /**
   * Validate burn request
   */
  private validateBurnRequest(request: BlockchainBurnRequest): void {
    if (!request.userId) {
      throw new Error('User ID is required');
    }

    if (!request.burnAmount || request.burnAmount.lessThanOrEqualTo(0)) {
      throw new Error('Burn amount must be greater than 0');
    }

    if (!Object.values(BurnTransactionType).includes(request.transactionType)) {
      throw new Error(`Invalid transaction type: ${request.transactionType}`);
    }

    if (!request.reason || request.reason.trim().length === 0) {
      throw new Error('Reason is required');
    }
  }

  /**
   * Set custom blockchain provider
   */
  setProvider(provider: IBlockchainProvider): void {
    this.provider = provider;
    logger.info('Blockchain provider updated');
  }

  /**
   * Update retry configuration
   */
  setRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = {
      ...this.retryConfig,
      ...config,
    };
    logger.info('Retry configuration updated', { retryConfig: this.retryConfig });
  }

  /**
   * Get current retry configuration
   */
  getRetryConfig(): RetryConfig {
    return { ...this.retryConfig };
  }
}

export default new BlockchainBurnService();
