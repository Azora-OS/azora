/**
 * Query Hasher for Cache Key Generation
 * Implements consistent hashing, cache key generation, and statistics
 */

import { createHash } from 'crypto';
import { AIQuery } from './types';

export interface HashConfig {
  algorithm: 'sha256' | 'sha1' | 'md5';
  includeMetadata: boolean;
  includeContext: boolean;
  normalizeQuery: boolean;
}

export interface QueryHashResult {
  hash: string;
  cacheKey: string;
  queryNormalized: string;
  metadata: {
    algorithm: string;
    timestamp: Date;
    queryLength: number;
    hasMetadata: boolean;
    hasContext: boolean;
  };
}

export interface HashStatistics {
  totalHashes: number;
  uniqueQueries: number;
  collisions: number;
  averageHashTime: number;
  lastUpdated: Date;
}

export class QueryHasher {
  private config: HashConfig;
  private hashMap: Map<string, string> = new Map();
  private statistics: HashStatistics = {
    totalHashes: 0,
    uniqueQueries: 0,
    collisions: 0,
    averageHashTime: 0,
    lastUpdated: new Date()
  };
  private totalHashTime: number = 0;

  constructor(config: Partial<HashConfig> = {}) {
    this.config = {
      algorithm: 'sha256',
      includeMetadata: false,
      includeContext: false,
      normalizeQuery: true,
      ...config
    };
  }

  /**
   * Normalize query string
   */
  private normalizeQuery(query: string): string {
    if (!this.config.normalizeQuery) {
      return query;
    }

    return query
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '');
  }

  /**
   * Build hashable string from query
   */
  private buildHashableString(query: AIQuery): string {
    let hashable = query.query;

    if (this.config.includeMetadata && query.metadata) {
      hashable += JSON.stringify(query.metadata);
    }

    if (this.config.includeContext && query.context) {
      hashable += JSON.stringify(query.context);
    }

    return hashable;
  }

  /**
   * Generate hash for query
   */
  generateHash(query: AIQuery): QueryHashResult {
    const startTime = Date.now();

    try {
      const hashableString = this.buildHashableString(query);
      const normalizedQuery = this.normalizeQuery(hashableString);

      const hash = createHash(this.config.algorithm)
        .update(normalizedQuery)
        .digest('hex');

      const cacheKey = `query:${hash}`;

      // Track statistics
      this.updateStatistics(hash, normalizedQuery);

      const hashTime = Date.now() - startTime;
      this.totalHashTime += hashTime;

      return {
        hash,
        cacheKey,
        queryNormalized: normalizedQuery,
        metadata: {
          algorithm: this.config.algorithm,
          timestamp: new Date(),
          queryLength: query.query.length,
          hasMetadata: !!query.metadata,
          hasContext: !!query.context
        }
      };
    } catch (error) {
      console.error('Error generating hash:', error);
      throw error;
    }
  }

  /**
   * Generate hash from string
   */
  generateHashFromString(queryString: string): string {
    const normalized = this.normalizeQuery(queryString);
    return createHash(this.config.algorithm)
      .update(normalized)
      .digest('hex');
  }

  /**
   * Generate consistent hash for distributed caching
   */
  generateConsistentHash(query: AIQuery, nodeCount: number = 1): number {
    const hash = this.generateHash(query);
    const hashValue = parseInt(hash.substring(0, 8), 16);
    return hashValue % nodeCount;
  }

  /**
   * Generate cache key with prefix
   */
  generateCacheKey(query: AIQuery, prefix: string = 'cache'): string {
    const hash = this.generateHash(query);
    return `${prefix}:${hash.hash}`;
  }

  /**
   * Generate cache key with tier information
   */
  generateTierCacheKey(query: AIQuery, tier: string): string {
    const hash = this.generateHash(query);
    return `cache:tier:${tier}:${hash.hash}`;
  }

  /**
   * Generate cache key with user information
   */
  generateUserCacheKey(query: AIQuery, userId: string): string {
    const hash = this.generateHash(query);
    return `cache:user:${userId}:${hash.hash}`;
  }

  /**
   * Update statistics
   */
  private updateStatistics(hash: string, normalizedQuery: string): void {
    this.statistics.totalHashes++;

    if (!this.hashMap.has(hash)) {
      this.hashMap.set(hash, normalizedQuery);
      this.statistics.uniqueQueries++;
    } else {
      this.statistics.collisions++;
    }

    this.statistics.averageHashTime = this.totalHashTime / this.statistics.totalHashes;
    this.statistics.lastUpdated = new Date();
  }

  /**
   * Get hash statistics
   */
  getStatistics(): HashStatistics {
    return { ...this.statistics };
  }

  /**
   * Reset statistics
   */
  resetStatistics(): void {
    this.hashMap.clear();
    this.statistics = {
      totalHashes: 0,
      uniqueQueries: 0,
      collisions: 0,
      averageHashTime: 0,
      lastUpdated: new Date()
    };
    this.totalHashTime = 0;
  }

  /**
   * Get collision rate
   */
  getCollisionRate(): number {
    if (this.statistics.totalHashes === 0) {
      return 0;
    }
    return (this.statistics.collisions / this.statistics.totalHashes) * 100;
  }

  /**
   * Verify hash consistency
   */
  verifyHashConsistency(query: AIQuery, expectedHash: string): boolean {
    const result = this.generateHash(query);
    return result.hash === expectedHash;
  }

  /**
   * Generate hash batch
   */
  generateHashBatch(queries: AIQuery[]): QueryHashResult[] {
    return queries.map(query => this.generateHash(query));
  }

  /**
   * Export statistics for monitoring
   */
  exportMetrics(): Record<string, any> {
    return {
      timestamp: new Date().toISOString(),
      hashing: {
        totalHashes: this.statistics.totalHashes,
        uniqueQueries: this.statistics.uniqueQueries,
        collisions: this.statistics.collisions,
        collisionRate: this.getCollisionRate().toFixed(2) + '%',
        averageHashTime: this.statistics.averageHashTime.toFixed(2) + 'ms',
        algorithm: this.config.algorithm
      }
    };
  }
}

// Singleton instance
let queryHasher: QueryHasher | null = null;

/**
 * Get or create query hasher
 */
export function getQueryHasher(config?: Partial<HashConfig>): QueryHasher {
  if (!queryHasher) {
    queryHasher = new QueryHasher(config);
  }
  return queryHasher;
}

/**
 * Generate hash for query
 */
export function hashQuery(query: AIQuery, config?: Partial<HashConfig>): QueryHashResult {
  const hasher = getQueryHasher(config);
  return hasher.generateHash(query);
}

/**
 * Generate hash from string
 */
export function hashQueryString(queryString: string, config?: Partial<HashConfig>): string {
  const hasher = getQueryHasher(config);
  return hasher.generateHashFromString(queryString);
}
