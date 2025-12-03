/**
 * Database Optimization Utilities
 * Provides query optimization, indexing strategies, and performance monitoring
 */

import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

export interface QueryMetrics {
  query: string;
  duration: number;
  rowsAffected: number;
  timestamp: Date;
}

export interface IndexDefinition {
  table: string;
  columns: string[];
  unique?: boolean;
  name?: string;
}

export interface OptimizationReport {
  totalQueries: number;
  slowQueries: number;
  averageQueryTime: number;
  slowestQueries: QueryMetrics[];
  recommendations: string[];
}

/**
 * Database Optimization Service
 */
export class DatabaseOptimization {
  private prisma: PrismaClient;
  private queryMetrics: QueryMetrics[] = [];
  private slowQueryThreshold: number = 100; // ms

  constructor(prisma: PrismaClient, slowQueryThreshold: number = 100) {
    this.prisma = prisma;
    this.slowQueryThreshold = slowQueryThreshold;
  }

  /**
   * Recommended indexes for Education Revenue Engine
   */
  static readonly RECOMMENDED_INDEXES: IndexDefinition[] = [
    // User indexes
    { table: 'User', columns: ['email'], unique: true },
    { table: 'User', columns: ['createdAt'] },
    { table: 'User', columns: ['tier'] },

    // Course indexes
    { table: 'Course', columns: ['instructorId'] },
    { table: 'Course', columns: ['tier'] },
    { table: 'Course', columns: ['category'] },
    { table: 'Course', columns: ['createdAt'] },
    { table: 'Course', columns: ['status'] },

    // Enrollment indexes
    { table: 'Enrollment', columns: ['studentId'] },
    { table: 'Enrollment', columns: ['courseId'] },
    { table: 'Enrollment', columns: ['status'] },
    { table: 'Enrollment', columns: ['enrolledAt'] },
    { table: 'Enrollment', columns: ['studentId', 'courseId'], unique: true },

    // Progress indexes
    { table: 'Progress', columns: ['enrollmentId'] },
    { table: 'Progress', columns: ['moduleId'] },
    { table: 'Progress', columns: ['updatedAt'] },

    // Assessment indexes
    { table: 'Assessment', columns: ['courseId'] },
    { table: 'Assessment', columns: ['enrollmentId'] },
    { table: 'Assessment', columns: ['submittedAt'] },

    // Payment indexes
    { table: 'Payment', columns: ['userId'] },
    { table: 'Payment', columns: ['status'] },
    { table: 'Payment', columns: ['createdAt'] },
    { table: 'Payment', columns: ['courseId'] },

    // Learning Outcome indexes
    { table: 'LearningOutcome', columns: ['studentId'] },
    { table: 'LearningOutcome', columns: ['courseId'] },
    { table: 'LearningOutcome', columns: ['status'] },

    // Certificate indexes
    { table: 'Certificate', columns: ['studentId'] },
    { table: 'Certificate', columns: ['courseId'] },
    { table: 'Certificate', columns: ['issuedAt'] },

    // Conversion Event indexes
    { table: 'ConversionEvent', columns: ['studentId'] },
    { table: 'ConversionEvent', columns: ['eventType'] },
    { table: 'ConversionEvent', columns: ['createdAt'] },
  ];

  /**
   * Get SQL for creating recommended indexes
   */
  static getCreateIndexSQL(): string[] {
    return this.RECOMMENDED_INDEXES.map(index => {
      const indexName = index.name || `idx_${index.table.toLowerCase()}_${index.columns.join('_')}`;
      const unique = index.unique ? 'UNIQUE' : '';
      const columns = index.columns.join(', ');
      return `CREATE ${unique} INDEX ${indexName} ON "${index.table}" (${columns});`;
    });
  }

  /**
   * Track query performance
   */
  trackQuery(query: string, duration: number, rowsAffected: number = 0): void {
    const metric: QueryMetrics = {
      query,
      duration,
      rowsAffected,
      timestamp: new Date()
    };

    this.queryMetrics.push(metric);

    if (duration > this.slowQueryThreshold) {
      logger.warn(`Slow query detected (${duration}ms): ${query.substring(0, 100)}`);
    }
  }

  /**
   * Get optimization report
   */
  getOptimizationReport(): OptimizationReport {
    const slowQueries = this.queryMetrics.filter(m => m.duration > this.slowQueryThreshold);
    const totalDuration = this.queryMetrics.reduce((sum, m) => sum + m.duration, 0);
    const averageQueryTime = this.queryMetrics.length > 0 ? totalDuration / this.queryMetrics.length : 0;

    const slowestQueries = [...this.queryMetrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    const recommendations = this.generateRecommendations(slowestQueries);

    return {
      totalQueries: this.queryMetrics.length,
      slowQueries: slowQueries.length,
      averageQueryTime,
      slowestQueries,
      recommendations
    };
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(slowestQueries: QueryMetrics[]): string[] {
    const recommendations: string[] = [];

    if (slowestQueries.length === 0) {
      return ['No slow queries detected'];
    }

    // Analyze patterns
    const selectQueries = slowestQueries.filter(q => q.query.includes('SELECT')).length;
    const joinQueries = slowestQueries.filter(q => q.query.includes('JOIN')).length;
    const whereQueries = slowestQueries.filter(q => q.query.includes('WHERE')).length;

    if (selectQueries > slowestQueries.length * 0.7) {
      recommendations.push('Consider adding indexes on frequently queried columns');
    }

    if (joinQueries > slowestQueries.length * 0.5) {
      recommendations.push('Optimize JOIN operations - consider denormalization or caching');
    }

    if (whereQueries > slowestQueries.length * 0.8) {
      recommendations.push('Add indexes on WHERE clause columns');
    }

    const avgDuration = slowestQueries.reduce((sum, q) => sum + q.duration, 0) / slowestQueries.length;
    if (avgDuration > 500) {
      recommendations.push('Consider implementing query result caching');
    }

    if (slowestQueries.some(q => q.rowsAffected > 10000)) {
      recommendations.push('Implement pagination for large result sets');
    }

    return recommendations;
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.queryMetrics = [];
  }

  /**
   * Get query statistics
   */
  getQueryStatistics() {
    const stats = {
      totalQueries: this.queryMetrics.length,
      totalDuration: this.queryMetrics.reduce((sum, m) => sum + m.duration, 0),
      averageDuration: 0,
      minDuration: 0,
      maxDuration: 0,
      slowQueryCount: 0,
      slowQueryPercentage: 0
    };

    if (this.queryMetrics.length === 0) {
      return stats;
    }

    stats.averageDuration = stats.totalDuration / this.queryMetrics.length;
    stats.minDuration = Math.min(...this.queryMetrics.map(m => m.duration));
    stats.maxDuration = Math.max(...this.queryMetrics.map(m => m.duration));
    stats.slowQueryCount = this.queryMetrics.filter(m => m.duration > this.slowQueryThreshold).length;
    stats.slowQueryPercentage = (stats.slowQueryCount / this.queryMetrics.length) * 100;

    return stats;
  }

  /**
   * Optimize Prisma queries with pagination
   */
  async paginateQuery<T>(
    queryFn: (skip: number, take: number) => Promise<T[]>,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ data: T[]; page: number; pageSize: number; hasMore: boolean }> {
    const skip = (page - 1) * pageSize;
    const take = pageSize + 1; // Fetch one extra to check if there are more

    const data = await queryFn(skip, take);
    const hasMore = data.length > pageSize;

    return {
      data: data.slice(0, pageSize),
      page,
      pageSize,
      hasMore
    };
  }

  /**
   * Batch operations for better performance
   */
  async batchInsert<T>(
    items: T[],
    batchSize: number = 100,
    insertFn: (batch: T[]) => Promise<void>
  ): Promise<void> {
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await insertFn(batch);
      logger.debug(`Inserted batch ${Math.floor(i / batchSize) + 1}`);
    }
  }

  /**
   * Optimize N+1 query problem with eager loading
   */
  async eagerLoadRelations<T extends Record<string, any>>(
    items: T[],
    relationFn: (ids: string[]) => Promise<Record<string, any>>
  ): Promise<T[]> {
    if (items.length === 0) {
      return items;
    }

    const ids = items.map(item => item.id);
    const relations = await relationFn(ids);

    return items.map(item => ({
      ...item,
      ...relations[item.id]
    }));
  }

  /**
   * Get database size information
   */
  async getDatabaseSize(): Promise<{ tableName: string; size: string }[]> {
    try {
      const result = await this.prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
        FROM pg_tables
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      `;
      return result as any;
    } catch (error) {
      logger.error('Error getting database size:', error);
      return [];
    }
  }

  /**
   * Get table statistics
   */
  async getTableStatistics(tableName: string): Promise<any> {
    try {
      const result = await this.prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          n_live_tup as live_rows,
          n_dead_tup as dead_rows,
          last_vacuum,
          last_autovacuum
        FROM pg_stat_user_tables
        WHERE tablename = ${tableName}
      `;
      return result;
    } catch (error) {
      logger.error(`Error getting statistics for table ${tableName}:`, error);
      return null;
    }
  }

  /**
   * Analyze query execution plan
   */
  async explainQuery(query: string): Promise<any> {
    try {
      const result = await this.prisma.$queryRaw`EXPLAIN ANALYZE ${query}`;
      return result;
    } catch (error) {
      logger.error('Error explaining query:', error);
      return null;
    }
  }

  /**
   * Vacuum and analyze tables
   */
  async vacuumAndAnalyze(tableName?: string): Promise<void> {
    try {
      if (tableName) {
        await this.prisma.$executeRaw`VACUUM ANALYZE ${tableName}`;
        logger.info(`Vacuumed and analyzed table: ${tableName}`);
      } else {
        await this.prisma.$executeRaw`VACUUM ANALYZE`;
        logger.info('Vacuumed and analyzed all tables');
      }
    } catch (error) {
      logger.error('Error during vacuum and analyze:', error);
    }
  }

  /**
   * Get slow query log
   */
  getSlowQueryLog(limit: number = 20): QueryMetrics[] {
    return this.queryMetrics
      .filter(m => m.duration > this.slowQueryThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Export metrics for monitoring
   */
  exportMetrics() {
    const stats = this.getQueryStatistics();
    const report = this.getOptimizationReport();

    return {
      timestamp: new Date().toISOString(),
      statistics: stats,
      report,
      slowQueries: this.getSlowQueryLog(10)
    };
  }
}

// Singleton instance
let dbOptimization: DatabaseOptimization | null = null;

/**
 * Initialize database optimization
 */
export function initializeDatabaseOptimization(
  prisma: PrismaClient,
  slowQueryThreshold: number = 100
): DatabaseOptimization {
  if (!dbOptimization) {
    dbOptimization = new DatabaseOptimization(prisma, slowQueryThreshold);
  }
  return dbOptimization;
}

/**
 * Get database optimization instance
 */
export function getDatabaseOptimization(): DatabaseOptimization {
  if (!dbOptimization) {
    throw new Error('Database optimization not initialized');
  }
  return dbOptimization;
}
