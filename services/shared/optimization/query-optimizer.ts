import winston from 'winston';
import { trackDbQuery } from '../middleware/performance';

const logger = winston.createLogger({
  defaultMeta: { service: 'query-optimizer' },
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${timestamp} [QUERY] ${level}: ${message} ${metaStr}`;
        })
      ),
    }),
  ],
});

/**
 * Query Optimizer for database performance
 * Implements query optimization strategies and monitoring
 */
export class QueryOptimizer {
  private slowQueryThreshold: number = 50; // ms

  /**
   * Execute query with performance tracking
   */
  async executeQuery<T>(
    operation: string,
    model: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    
    try {
      const result = await queryFn();
      const duration = Date.now() - start;

      // Track performance
      trackDbQuery(operation, model, duration, 'success');

      // Log slow queries
      if (duration > this.slowQueryThreshold) {
        logger.warn('Slow database query', {
          operation,
          model,
          duration,
          threshold: this.slowQueryThreshold,
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      trackDbQuery(operation, model, duration, 'error');
      
      logger.error('Query execution error', {
        operation,
        model,
        duration,
        error: (error as Error).message,
      });

      throw error;
    }
  }

  /**
   * Batch execute queries for better performance
   */
  async batchExecute<T>(
    operation: string,
    model: string,
    queries: Array<() => Promise<T>>
  ): Promise<T[]> {
    const start = Date.now();

    try {
      const results = await Promise.all(queries.map(q => q()));
      const duration = Date.now() - start;

      trackDbQuery(operation, model, duration, 'success');

      if (duration > this.slowQueryThreshold) {
        logger.warn('Slow batch query', {
          operation,
          model,
          duration,
          queryCount: queries.length,
          avgDuration: (duration / queries.length).toFixed(2),
        });
      }

      return results;
    } catch (error) {
      const duration = Date.now() - start;
      trackDbQuery(operation, model, duration, 'error');

      logger.error('Batch query execution error', {
        operation,
        model,
        duration,
        queryCount: queries.length,
        error: (error as Error).message,
      });

      throw error;
    }
  }

  /**
   * Execute query with pagination for large result sets
   */
  async executePaginatedQuery<T>(
    operation: string,
    model: string,
    queryFn: (skip: number, take: number) => Promise<T[]>,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ data: T[]; page: number; pageSize: number; hasMore: boolean }> {
    const skip = (page - 1) * pageSize;
    const take = pageSize + 1; // Fetch one extra to determine if there are more

    const data = await this.executeQuery(
      `${operation}:paginated`,
      model,
      () => queryFn(skip, take)
    );

    const hasMore = data.length > pageSize;
    const result = hasMore ? data.slice(0, pageSize) : data;

    return {
      data: result,
      page,
      pageSize,
      hasMore,
    };
  }

  /**
   * Execute query with field projection to reduce payload
   */
  async executeProjectedQuery<T>(
    operation: string,
    model: string,
    queryFn: (fields: string[]) => Promise<T[]>,
    fields: string[]
  ): Promise<T[]> {
    return this.executeQuery(
      `${operation}:projected`,
      model,
      () => queryFn(fields)
    );
  }

  /**
   * Set slow query threshold
   */
  setSlowQueryThreshold(ms: number): void {
    this.slowQueryThreshold = ms;
    logger.info('Slow query threshold updated', { threshold: ms });
  }

  /**
   * Get slow query threshold
   */
  getSlowQueryThreshold(): number {
    return this.slowQueryThreshold;
  }
}

// Export singleton instance
export const queryOptimizer = new QueryOptimizer();

/**
 * Query optimization strategies
 */
export const queryStrategies = {
  /**
   * Use pagination for large result sets
   */
  paginate: (page: number = 1, pageSize: number = 20) => ({
    skip: (page - 1) * pageSize,
    take: pageSize,
  }),

  /**
   * Select specific fields to reduce payload
   */
  selectFields: (fields: string[]) => ({
    select: fields.reduce((acc, field) => ({ ...acc, [field]: true }), {}),
  }),

  /**
   * Include related data efficiently
   */
  includeRelations: (relations: string[]) => ({
    include: relations.reduce((acc, rel) => ({ ...acc, [rel]: true }), {}),
  }),

  /**
   * Order results for consistent pagination
   */
  orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => ({
    orderBy: { [field]: direction },
  }),

  /**
   * Filter results efficiently
   */
  filter: (conditions: Record<string, any>) => ({
    where: conditions,
  }),

  /**
   * Combine multiple strategies
   */
  combine: (...strategies: any[]) => {
    return strategies.reduce((acc, strategy) => ({ ...acc, ...strategy }), {});
  },
};

/**
 * Common query patterns for optimization
 */
export const queryPatterns = {
  /**
   * Get single item with specific fields
   */
  getSingleOptimized: (fields: string[]) => ({
    ...queryStrategies.selectFields(fields),
  }),

  /**
   * Get list with pagination and fields
   */
  getListOptimized: (page: number, pageSize: number, fields: string[]) => ({
    ...queryStrategies.paginate(page, pageSize),
    ...queryStrategies.selectFields(fields),
  }),

  /**
   * Get filtered list with pagination
   */
  getFilteredListOptimized: (
    filters: Record<string, any>,
    page: number,
    pageSize: number,
    fields: string[]
  ) => ({
    ...queryStrategies.filter(filters),
    ...queryStrategies.paginate(page, pageSize),
    ...queryStrategies.selectFields(fields),
  }),

  /**
   * Get with related data
   */
  getWithRelationsOptimized: (relations: string[], fields: string[]) => ({
    ...queryStrategies.includeRelations(relations),
    ...queryStrategies.selectFields(fields),
  }),
};
