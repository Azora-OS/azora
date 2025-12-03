import { Pool, PoolClient, QueryResult } from 'pg';
import { createClient, RedisClientType } from 'redis';
import { EventEmitter } from 'events';
import winston from 'winston';

interface PoolConfig {
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  min?: number;
  acquireTimeoutMillis?: number;
  evictionRunIntervalMillis?: number;
}

interface QueryMetrics {
  query: string;
  params?: any[];
  duration: number;
  rowsAffected: number;
  timestamp: Date;
  cacheHit: boolean;
  readReplica: boolean;
}

interface IndexDefinition {
  table: string;
  columns: string[];
  unique?: boolean;
  name?: string;
  partial?: string;
  type?: 'btree' | 'hash' | 'gin' | 'gist' | 'brin';
}

interface OptimizationReport {
  totalQueries: number;
  slowQueries: number;
  averageQueryTime: number;
  slowestQueries: QueryMetrics[];
  recommendations: string[];
  cacheHitRate: number;
  readReplicaUsage: number;
}

interface ConnectionStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingClients: number;
  readReplicaConnections: number;
}

export class EnhancedDatabaseLayer extends EventEmitter {
  private pool: Pool | null = null;
  private readReplicas: Pool[] = [];
  private cache: RedisClientType | null = null;
  private queryCache: Map<string, { data: any; ttl: number; accessCount: number }> = new Map();
  private queryMetrics: QueryMetrics[] = [];
  private slowQueryThreshold: number = 100; // ms
  private logger: winston.Logger;
  private readonly MAX_METRICS = 10000;
  private readonly DEFAULT_CACHE_TTL = 300; // 5 minutes

  constructor(logger?: winston.Logger) {
    super();
    this.logger = logger || winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [new winston.transports.Console()]
    });
  }

  // ========== CONNECTION POOL MANAGEMENT ==========

  async initializePool(connectionString: string, config?: Partial<PoolConfig>) {
    const poolConfig = {
      connectionString,
      max: config?.max || 20,
      min: config?.min || 5,
      idleTimeoutMillis: config?.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config?.connectionTimeoutMillis || 2000,
      acquireTimeoutMillis: config?.acquireTimeoutMillis || 60000,
      evictionRunIntervalMillis: config?.evictionRunIntervalMillis || 1000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    };

    this.pool = new Pool(poolConfig);
    
    // Set up pool event listeners
    this.pool.on('connect', (client) => {
      this.logger.debug('New database client connected', { totalCount: this.pool!.totalCount });
    });

    this.pool.on('acquire', (client) => {
      this.logger.debug('Database client acquired', { idleCount: this.pool!.idleCount });
    });

    this.pool.on('remove', (client) => {
      this.logger.debug('Database client removed', { totalCount: this.pool!.totalCount });
    });

    this.pool.on('error', (err) => {
      this.logger.error('Pool error:', err);
      this.emit('poolError', err);
    });

    // Test connection
    await this.pool.query('SELECT 1');
    this.logger.info('Database pool initialized successfully', { config: poolConfig });

    return this.pool;
  }

  async addReadReplica(connectionString: string, config?: Partial<PoolConfig>) {
    const replicaConfig = {
      connectionString,
      max: config?.max || 10,
      min: config?.min || 2,
      idleTimeoutMillis: config?.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config?.connectionTimeoutMillis || 2000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    };

    const replica = new Pool(replicaConfig);
    replica.on('error', (err) => {
      this.logger.error('Read replica error:', err);
      this.emit('replicaError', err);
    });

    // Test connection
    await replica.query('SELECT 1');
    this.readReplicas.push(replica);
    
    this.logger.info('Read replica added successfully', { 
      replicaIndex: this.readReplicas.length - 1,
      config: replicaConfig 
    });

    return replica;
  }

  async initializeCache(redisUrl: string) {
    this.cache = createClient({ 
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        lazyConnect: true
      }
    });

    this.cache.on('error', (err) => {
      this.logger.error('Cache error:', err);
      this.emit('cacheError', err);
    });

    this.cache.on('connect', () => {
      this.logger.info('Redis cache connected');
    });

    await this.cache.connect();
    this.logger.info('Cache initialized successfully');
    return this.cache;
  }

  // ========== QUERY EXECUTION WITH OPTIMIZATION ==========

  async query(sql: string, params?: any[], options: {
    isRead?: boolean;
    cacheTTL?: number;
    forceCache?: boolean;
    useReplica?: boolean;
  } = {}): Promise<any[]> {
    const startTime = Date.now();
    const { isRead = false, cacheTTL = this.DEFAULT_CACHE_TTL, forceCache = false, useReplica = true } = options;
    
    let cacheHit = false;
    let readReplica = false;
    let result: QueryResult<any>;

    // Check cache for read queries
    if ((isRead || forceCache) && this.cache) {
      const cacheKey = this.generateCacheKey(sql, params);
      const cached = await this.cache.get(cacheKey);
      
      if (cached) {
        cacheHit = true;
        this.recordQueryMetrics(sql, params, Date.now() - startTime, 0, true, false);
        this.emit('queryCacheHit', { query: sql, params });
        return JSON.parse(cached);
      }
    }

    // Select appropriate pool
    const pool = this.selectPool(isRead && useReplica);
    readReplica = pool !== this.pool;

    try {
      result = await pool.query(sql, params);
      
      // Cache read results
      if ((isRead || forceCache) && this.cache && result.rows.length > 0) {
        const cacheKey = this.generateCacheKey(sql, params);
        await this.cache.setEx(cacheKey, cacheTTL, JSON.stringify(result.rows));
        this.emit('queryCached', { query: sql, params, rowCount: result.rows.length });
      }

      // Record metrics
      this.recordQueryMetrics(sql, params, Date.now() - startTime, result.rowCount, false, readReplica);

      // Emit slow query warning
      const duration = Date.now() - startTime;
      if (duration > this.slowQueryThreshold) {
        this.emit('slowQuery', { 
          query: sql, 
          params, 
          duration, 
          rows: result.rowCount,
          readReplica 
        });
      }

      return result.rows;
    } catch (error) {
      this.logger.error('Query execution failed', { 
        sql: sql.substring(0, 100), 
        params, 
        error: error.message 
      });
      this.emit('queryError', { query: sql, params, error });
      throw error;
    }
  }

  private selectPool(useReplica: boolean): Pool {
    if (useReplica && this.readReplicas.length > 0) {
      // Load balance across read replicas
      const healthyReplicas = this.readReplicas.filter(replica => replica.totalCount > 0);
      if (healthyReplicas.length > 0) {
        return healthyReplicas[Math.floor(Math.random() * healthyReplicas.length)];
      }
    }
    return this.pool!;
  }

  private generateCacheKey(sql: string, params?: any[]): string {
    const normalizedSQL = sql.trim().toLowerCase().replace(/\s+/g, ' ');
    const paramsHash = params ? JSON.stringify(params) : '';
    return `query:${Buffer.from(`${normalizedSQL}:${paramsHash}`).toString('base64')}`;
  }

  private recordQueryMetrics(
    query: string, 
    params: any[] | undefined, 
    duration: number, 
    rowsAffected: number,
    cacheHit: boolean,
    readReplica: boolean
  ): void {
    const metrics: QueryMetrics = {
      query: query.substring(0, 200), // Limit query length for storage
      params: params?.slice(0, 5), // Limit params for storage
      duration,
      rowsAffected,
      timestamp: new Date(),
      cacheHit,
      readReplica
    };

    this.queryMetrics.push(metrics);

    // Keep metrics array size bounded
    if (this.queryMetrics.length > this.MAX_METRICS) {
      this.queryMetrics = this.queryMetrics.slice(-this.MAX_METRICS);
    }

    this.emit('queryMetrics', metrics);
  }

  // ========== TRANSACTION MANAGEMENT ==========

  async transaction<T>(callback: (client: PoolClient) => Promise<T>, options: {
    isolationLevel?: 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE';
    timeout?: number;
  } = {}): Promise<T> {
    const client = await this.pool!.connect();
    const startTime = Date.now();
    
    try {
      // Set isolation level if specified
      if (options.isolationLevel) {
        await client.query(`SET TRANSACTION ISOLATION LEVEL ${options.isolationLevel}`);
      }

      await client.query('BEGIN');
      
      // Set timeout if specified
      let timeoutId: NodeJS.Timeout | undefined;
      if (options.timeout) {
        timeoutId = setTimeout(() => {
          client.query('ROLLBACK');
          throw new Error(`Transaction timeout after ${options.timeout}ms`);
        }, options.timeout);
      }

      const result = await callback(client);
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      await client.query('COMMIT');
      
      this.emit('transactionCommitted', { 
        duration: Date.now() - startTime 
      });
      
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      this.emit('transactionRolledBack', { 
        duration: Date.now() - startTime,
        error: err.message 
      });
      throw err;
    } finally {
      client.release();
    }
  }

  // ========== BATCH OPERATIONS ==========

  async batchQuery(queries: Array<{ sql: string; params?: any[] }>, options: {
    parallel?: boolean;
    transaction?: boolean;
  } = {}): Promise<any[][]> {
    const { parallel = false, transaction = false } = options;

    if (transaction) {
      return this.transaction(async (client) => {
        const results = [];
        for (const query of queries) {
          const result = await client.query(query.sql, query.params);
          results.push(result.rows);
        }
        return results;
      });
    }

    if (parallel && queries.length <= 10) { // Limit parallel queries
      const promises = queries.map(q => this.query(q.sql, q.params));
      return Promise.all(promises);
    }

    // Sequential execution
    const results = [];
    for (const query of queries) {
      const result = await this.query(query.sql, query.params);
      results.push(result);
    }
    return results;
  }

  // ========== CACHE MANAGEMENT ==========

  async invalidateCache(pattern?: string): Promise<void> {
    if (!this.cache) return;

    if (pattern) {
      const keys = await this.cache.keys(`query:*${pattern}*`);
      if (keys.length > 0) {
        await this.cache.del(keys);
        this.emit('cacheInvalidated', { pattern, keysCount: keys.length });
      }
    } else {
      // Clear all query cache
      const keys = await this.cache.keys('query:*');
      if (keys.length > 0) {
        await this.cache.del(keys);
        this.emit('cacheInvalidated', { pattern: 'all', keysCount: keys.length });
      }
    }
  }

  async warmCache(queries: Array<{ sql: string; params?: any[]; ttl?: number }>): Promise<void> {
    if (!this.cache) return;

    for (const { sql, params, ttl = this.DEFAULT_CACHE_TTL } of queries) {
      try {
        await this.query(sql, params, { forceCache: true, cacheTTL: ttl });
      } catch (error) {
        this.logger.warn('Failed to warm cache for query', { 
          sql: sql.substring(0, 100), 
          error: error.message 
        });
      }
    }

    this.emit('cacheWarmed', { queriesCount: queries.length });
  }

  // ========== INDEX MANAGEMENT ==========

  async createIndex(index: IndexDefinition): Promise<void> {
    const indexName = index.name || `idx_${index.table}_${index.columns.join('_')}`;
    const uniqueClause = index.unique ? 'UNIQUE' : '';
    const typeClause = index.type ? `USING ${index.type}` : '';
    const partialClause = index.partial ? `WHERE ${index.partial}` : '';
    
    const sql = `
      CREATE ${uniqueClause} INDEX CONCURRENTLY ${indexName} 
      ON ${index.table} ${typeClause} (${index.columns.join(', ')})
      ${partialClause}
    `;

    await this.query(sql);
    this.logger.info('Index created', { indexName, table: index.table, columns: index.columns });
    this.emit('indexCreated', { index });
  }

  async analyzeTable(tableName: string): Promise<void> {
    await this.query(`ANALYZE ${tableName}`);
    this.logger.info('Table analyzed', { tableName });
    this.emit('tableAnalyzed', { tableName });
  }

  async getTableIndexes(tableName: string): Promise<any[]> {
    const sql = `
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = $1
    `;
    return this.query(sql, [tableName]);
  }

  // ========== PERFORMANCE MONITORING ==========

  async getQueryStats(timeRange?: { start: Date; end: Date }): Promise<QueryMetrics[]> {
    let metrics = this.queryMetrics;

    if (timeRange) {
      metrics = metrics.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }

    return metrics;
  }

  async getOptimizationReport(timeRange?: { start: Date; end: Date }): Promise<OptimizationReport> {
    const metrics = await this.getQueryStats(timeRange);
    
    if (metrics.length === 0) {
      return {
        totalQueries: 0,
        slowQueries: 0,
        averageQueryTime: 0,
        slowestQueries: [],
        recommendations: ['No query data available for analysis'],
        cacheHitRate: 0,
        readReplicaUsage: 0
      };
    }

    const slowQueries = metrics.filter(m => m.duration > this.slowQueryThreshold);
    const averageQueryTime = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
    const cacheHitRate = metrics.filter(m => m.cacheHit).length / metrics.length;
    const readReplicaUsage = metrics.filter(m => m.readReplica).length / metrics.length;

    const slowestQueries = metrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    const recommendations = this.generateRecommendations(metrics, slowQueries);

    return {
      totalQueries: metrics.length,
      slowQueries: slowQueries.length,
      averageQueryTime,
      slowestQueries,
      recommendations,
      cacheHitRate: Math.round(cacheHitRate * 100),
      readReplicaUsage: Math.round(readReplicaUsage * 100)
    };
  }

  private generateRecommendations(metrics: QueryMetrics[], slowQueries: QueryMetrics[]): string[] {
    const recommendations: string[] = [];

    // Cache hit rate analysis
    const cacheHitRate = metrics.filter(m => m.cacheHit).length / metrics.length;
    if (cacheHitRate < 0.3) {
      recommendations.push('Consider enabling caching for frequently executed read queries');
    }

    // Slow query analysis
    if (slowQueries.length > 0) {
      recommendations.push(`${slowQueries.length} slow queries detected (> ${this.slowQueryThreshold}ms)`);
      
      // Check for missing indexes
      const selectQueries = slowQueries.filter(m => m.query.toLowerCase().includes('select'));
      if (selectQueries.length > 0) {
        recommendations.push('Review SELECT queries for missing indexes');
      }
    }

    // Read replica usage
    const readReplicaUsage = metrics.filter(m => m.readReplica).length / metrics.length;
    if (readReplicaUsage < 0.5 && this.readReplicas.length > 0) {
      recommendations.push('Consider routing more read queries to replicas');
    }

    // Large result sets
    const largeResults = metrics.filter(m => m.rowsAffected > 1000);
    if (largeResults.length > 0) {
      recommendations.push('Consider pagination for queries returning large result sets');
    }

    return recommendations;
  }

  // ========== CONNECTION MONITORING ==========

  async getConnectionStats(): Promise<ConnectionStats> {
    const poolStats = this.pool!;
    const replicaStats = this.readReplicas.reduce((acc, replica) => ({
      total: acc.total + replica.totalCount,
      idle: acc.idle + replica.idleCount,
      waiting: acc.waiting + replica.waitingCount
    }), { total: 0, idle: 0, waiting: 0 });

    return {
      totalConnections: poolStats.totalCount + replicaStats.total,
      activeConnections: (poolStats.totalCount - poolStats.idleCount) + 
                        (replicaStats.total - replicaStats.idle),
      idleConnections: poolStats.idleCount + replicaStats.idle,
      waitingClients: poolStats.waitingCount + replicaStats.waiting,
      readReplicaConnections: replicaStats.total
    };
  }

  // ========== HEALTH CHECKS ==========

  async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    const details: any = {
      pool: this.pool ? 'connected' : 'disconnected',
      readReplicas: this.readReplicas.length,
      cache: this.cache ? 'connected' : 'disconnected',
      ubuntu: 'Database layer operational'
    };

    try {
      // Test primary connection
      await this.pool!.query('SELECT 1');
      details.primary = 'healthy';

      // Test read replicas
      const replicaHealth = [];
      for (let i = 0; i < this.readReplicas.length; i++) {
        try {
          await this.readReplicas[i].query('SELECT 1');
          replicaHealth.push(`replica_${i}: healthy`);
        } catch (error) {
          replicaHealth.push(`replica_${i}: unhealthy`);
        }
      }
      details.replicas = replicaHealth;

      // Test cache
      if (this.cache) {
        await this.cache.ping();
        details.cache = 'healthy';
      }

      return { healthy: true, details };
    } catch (error) {
      details.error = error.message;
      return { healthy: false, details };
    }
  }

  // ========== UTILITY METHODS ==========

  async migrate(migrations: Array<{ name: string; sql: string }>): Promise<void> {
    const client = await this.pool!.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      for (const migration of migrations) {
        const result = await client.query('SELECT * FROM migrations WHERE name = $1', [migration.name]);
        if (result.rows.length === 0) {
          await client.query(migration.sql);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [migration.name]);
          this.logger.info(`Migration executed: ${migration.name}`);
          this.emit('migrationExecuted', { name: migration.name });
        }
      }
    } finally {
      client.release();
    }
  }

  setSlowQueryThreshold(threshold: number): void {
    this.slowQueryThreshold = threshold;
    this.logger.info('Slow query threshold updated', { threshold });
  }

  async disconnect(): Promise<void> {
    this.logger.info('Shutting down enhanced database layer...');
    
    if (this.pool) await this.pool.end();
    this.readReplicas.forEach(r => r.end());
    if (this.cache) await this.cache.disconnect();
    
    this.removeAllListeners();
    this.logger.info('Enhanced database layer shutdown complete');
  }
}

export const enhancedDb = new EnhancedDatabaseLayer();
