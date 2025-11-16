/**
 * Idempotency Manager Service
 * Manages idempotency keys to prevent duplicate payments
 */

import { createHash, randomBytes } from 'crypto';
import { RedisClient } from '../shared/cache';
import { logger } from '../shared/logging';
import PaymentRepository from './payment-repository';
import { PaymentError } from './types';

export class IdempotencyManager {
  private readonly KEY_PREFIX = 'idempotency:';
  private readonly KEY_EXPIRATION = 24 * 60 * 60; // 24 hours in seconds

  constructor(
    private redis: RedisClient,
    private paymentRepository: PaymentRepository
  ) {}

  /**
   * Generate a unique idempotency key
   */
  generateKey(userId: string, amount: number, metadata?: Record<string, any>): string {
    const timestamp = Date.now();
    const random = randomBytes(16).toString('hex');
    const data = JSON.stringify({
      userId,
      amount,
      timestamp,
      random,
      metadata,
    });

    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Store idempotency key result in Redis and database
   */
  async storeResult(
    key: string,
    userId: string,
    result: any
  ): Promise<void> {
    try {
      logger.info('Storing idempotency result', { key, userId });

      const redisKey = `${this.KEY_PREFIX}${key}`;
      const expiresAt = new Date(Date.now() + this.KEY_EXPIRATION * 1000);

      // Store in Redis for fast access
      await this.redis.setex(
        redisKey,
        this.KEY_EXPIRATION,
        JSON.stringify(result)
      );

      // Store in database for persistence
      await this.paymentRepository.storeIdempotencyKey(
        key,
        userId,
        result,
        expiresAt
      );

      logger.info('Idempotency result stored', { key });
    } catch (error) {
      logger.error('Failed to store idempotency result', { error, key });
      throw new PaymentError(
        'Failed to store idempotency result',
        'IDEMPOTENCY_ERROR',
        500
      );
    }
  }

  /**
   * Get idempotency key result from Redis or database
   */
  async getResult(key: string): Promise<any | null> {
    try {
      logger.info('Fetching idempotency result', { key });

      const redisKey = `${this.KEY_PREFIX}${key}`;

      // Try Redis first
      const cachedResult = await this.redis.get(redisKey);
      if (cachedResult) {
        logger.info('Idempotency result found in Redis', { key });
        return JSON.parse(cachedResult);
      }

      // Fall back to database
      const dbResult = await this.paymentRepository.getIdempotencyResult(key);
      if (dbResult) {
        logger.info('Idempotency result found in database', { key });
        // Restore to Redis for future access
        await this.redis.setex(
          redisKey,
          this.KEY_EXPIRATION,
          JSON.stringify(dbResult)
        );
        return dbResult;
      }

      logger.info('Idempotency result not found', { key });
      return null;
    } catch (error) {
      logger.error('Failed to get idempotency result', { error, key });
      throw new PaymentError(
        'Failed to get idempotency result',
        'IDEMPOTENCY_ERROR',
        500
      );
    }
  }

  /**
   * Check if idempotency key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const redisKey = `${this.KEY_PREFIX}${key}`;
      const exists = await this.redis.exists(redisKey);
      return exists === 1;
    } catch (error) {
      logger.error('Failed to check idempotency key existence', { error, key });
      return false;
    }
  }

  /**
   * Delete idempotency key
   */
  async delete(key: string): Promise<void> {
    try {
      logger.info('Deleting idempotency key', { key });

      const redisKey = `${this.KEY_PREFIX}${key}`;
      await this.redis.del(redisKey);

      logger.info('Idempotency key deleted', { key });
    } catch (error) {
      logger.error('Failed to delete idempotency key', { error, key });
      throw new PaymentError(
        'Failed to delete idempotency key',
        'IDEMPOTENCY_ERROR',
        500
      );
    }
  }

  /**
   * Clean up expired keys
   */
  async cleanupExpiredKeys(): Promise<number> {
    try {
      logger.info('Cleaning up expired idempotency keys');

      const count = await this.paymentRepository.cleanupExpiredKeys();

      logger.info('Expired idempotency keys cleaned up', { count });
      return count;
    } catch (error) {
      logger.error('Failed to clean up expired keys', { error });
      throw new PaymentError(
        'Failed to clean up expired keys',
        'IDEMPOTENCY_ERROR',
        500
      );
    }
  }

  /**
   * Validate idempotency key format
   */
  validateKeyFormat(key: string): boolean {
    // Key should be a 64-character hex string (SHA256)
    return /^[a-f0-9]{64}$/.test(key);
  }
}

export default IdempotencyManager;
