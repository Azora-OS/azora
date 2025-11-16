/**
 * Retry Manager Service
 * Implements exponential backoff retry logic for payment operations
 */

import { logger } from '../shared/logging';
import ErrorHandler from './error-handler';

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
}

export class RetryManager {
  private readonly config: RetryConfig;
  private readonly errorHandler: ErrorHandler;

  constructor(
    errorHandler: ErrorHandler,
    config: Partial<RetryConfig> = {}
  ) {
    this.errorHandler = errorHandler;
    this.config = {
      maxRetries: config.maxRetries ?? 5,
      initialDelayMs: config.initialDelayMs ?? 1000,
      maxDelayMs: config.maxDelayMs ?? 32000,
      backoffMultiplier: config.backoffMultiplier ?? 2,
    };
  }

  /**
   * Execute function with retry logic
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    operationName: string
  ): Promise<RetryResult<T>> {
    let lastError: Error | null = null;
    let attempts = 0;

    for (attempts = 1; attempts <= this.config.maxRetries; attempts++) {
      try {
        logger.info(`Executing ${operationName} (attempt ${attempts})`, {
          operationName,
          attempt: attempts,
        });

        const result = await fn();

        logger.info(`${operationName} succeeded`, {
          operationName,
          attempts,
        });

        return {
          success: true,
          data: result,
          attempts,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        logger.warn(`${operationName} failed (attempt ${attempts})`, {
          operationName,
          attempt: attempts,
          error: lastError.message,
        });

        // Check if error is retryable
        const errorCode = (error as any)?.code || 'UNKNOWN_ERROR';
        if (!this.errorHandler.isRetryable(errorCode)) {
          logger.info(`${operationName} failed with non-retryable error`, {
            operationName,
            errorCode,
          });

          return {
            success: false,
            error: lastError,
            attempts,
          };
        }

        // Don't retry if we've exhausted attempts
        if (attempts >= this.config.maxRetries) {
          logger.error(`${operationName} failed after ${attempts} attempts`, {
            operationName,
            attempts,
            error: lastError.message,
          });

          return {
            success: false,
            error: lastError,
            attempts,
          };
        }

        // Calculate delay for next retry
        const delay = this.calculateDelay(attempts);
        logger.info(`Retrying ${operationName} after ${delay}ms`, {
          operationName,
          delay,
          nextAttempt: attempts + 1,
        });

        // Wait before retrying
        await this.sleep(delay);
      }
    }

    return {
      success: false,
      error: lastError || new Error('Unknown error'),
      attempts,
    };
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateDelay(attempt: number): number {
    const exponentialDelay =
      this.config.initialDelayMs *
      Math.pow(this.config.backoffMultiplier, attempt - 1);

    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * exponentialDelay;
    const delay = exponentialDelay + jitter;

    // Cap at max delay
    return Math.min(delay, this.config.maxDelayMs);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get retry configuration
   */
  getConfig(): RetryConfig {
    return { ...this.config };
  }

  /**
   * Update retry configuration
   */
  updateConfig(config: Partial<RetryConfig>): void {
    Object.assign(this.config, config);
    logger.info('Retry configuration updated', { config: this.config });
  }
}

export default RetryManager;
