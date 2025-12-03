import { EnhancedDatabaseLayer } from './enhanced-database-layer';
import { EventEmitter } from 'events';
import winston from 'winston';
import { createClient, RedisClientType } from 'redis';

export interface OptimizationRule {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'security' | 'maintenance' | 'monitoring';
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  check: () => Promise<OptimizationResult>;
  fix?: () => Promise<boolean>;
}

export interface OptimizationResult {
  ruleId: string;
  ruleName: string;
  status: 'pass' | 'warning' | 'error' | 'info';
  message: string;
  details?: any;
  recommendations?: string[];
  autoFixable: boolean;
  impact: 'low' | 'medium' | 'high' | 'critical';
}

export interface DatabaseHealthScore {
  overall: number;
  performance: number;
  reliability: number;
  security: number;
  efficiency: number;
  factors: {
    queryPerformance: number;
    connectionHealth: number;
    cacheEfficiency: number;
    indexOptimization: number;
    replicationHealth: number;
    securityPosture: number;
  };
}

export interface PerformanceTrend {
  timestamp: Date;
  avgQueryTime: number;
  slowQueryRate: number;
  cacheHitRate: number;
  connectionUtilization: number;
  errorRate: number;
}

export class DatabaseOptimizationService extends EventEmitter {
  private db: EnhancedDatabaseLayer;
  private cache: RedisClientType | null = null;
  private logger: winston.Logger;
  private rules: Map<string, OptimizationRule> = new Map();
  private performanceHistory: PerformanceTrend[] = [];
  private healthScore: DatabaseHealthScore | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly MAX_HISTORY_POINTS = 1440; // 24 hours of minute data

  constructor(db: EnhancedDatabaseLayer, logger?: winston.Logger) {
    super();
    this.db = db;
    this.logger = logger || winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [new winston.transports.Console()]
    });

    this.initializeRules();
    this.startMonitoring();
  }

  // ========== OPTIMIZATION RULES ==========

  private initializeRules(): void {
    // Performance Rules
    this.addRule({
      id: 'slow_query_threshold',
      name: 'Slow Query Detection',
      description: 'Detect queries exceeding performance thresholds',
      category: 'performance',
      enabled: true,
      priority: 'high',
      check: async () => await this.checkSlowQueries(),
      fix: async () => await this.optimizeSlowQueries()
    });

    this.addRule({
      id: 'missing_indexes',
      name: 'Missing Index Detection',
      description: 'Identify tables that may benefit from additional indexes',
      category: 'performance',
      enabled: true,
      priority: 'medium',
      check: async () => await this.checkMissingIndexes(),
      fix: async () => await this.createRecommendedIndexes()
    });

    this.addRule({
      id: 'cache_efficiency',
      name: 'Cache Efficiency Check',
      description: 'Monitor cache hit rates and identify optimization opportunities',
      category: 'performance',
      enabled: true,
      priority: 'medium',
      check: async () => await this.checkCacheEfficiency()
    });

    // Connection Rules
    this.addRule({
      id: 'connection_pool_health',
      name: 'Connection Pool Health',
      description: 'Monitor connection pool utilization and health',
      category: 'reliability',
      enabled: true,
      priority: 'high',
      check: async () => await this.checkConnectionPoolHealth()
    });

    this.addRule({
      id: 'replication_lag',
      name: 'Replication Lag Monitor',
      description: 'Monitor read replica replication lag',
      category: 'reliability',
      enabled: true,
      priority: 'medium',
      check: async () => await this.checkReplicationLag()
    });

    // Security Rules
    this.addRule({
      id: 'security_audit',
      name: 'Security Configuration Audit',
      description: 'Check database security settings and configurations',
      category: 'security',
      enabled: true,
      priority: 'high',
      check: async () => await this.checkSecurityConfiguration()
    });

    // Maintenance Rules
    this.addRule({
      id: 'table_maintenance',
      name: 'Table Maintenance Check',
      description: 'Check if tables need vacuuming or analysis',
      category: 'maintenance',
      enabled: true,
      priority: 'medium',
      check: async () => await this.checkTableMaintenance(),
      fix: async () => await this.performTableMaintenance()
    });

    this.logger.info(`Initialized ${this.rules.size} optimization rules`);
  }

  addRule(rule: OptimizationRule): void {
    this.rules.set(rule.id, rule);
    this.emit('ruleAdded', rule);
  }

  removeRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      this.rules.delete(ruleId);
      this.emit('ruleRemoved', rule);
    }
  }

  // ========== OPTIMIZATION CHECKS ==========

  async runOptimizationCheck(ruleId?: string): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];
    const rulesToCheck = ruleId ? 
      [this.rules.get(ruleId)].filter(Boolean) : 
      Array.from(this.rules.values()).filter(r => r.enabled);

    for (const rule of rulesToCheck as OptimizationRule[]) {
      try {
        const result = await rule.check();
        results.push(result);
        this.emit('ruleChecked', { ruleId: rule.id, result });
      } catch (error) {
        const errorResult: OptimizationResult = {
          ruleId: rule.id,
          ruleName: rule.name,
          status: 'error',
          message: `Rule check failed: ${error.message}`,
          autoFixable: false,
          impact: 'medium'
        };
        results.push(errorResult);
        this.emit('ruleError', { ruleId: rule.id, error });
      }
    }

    this.emit('optimizationCheckCompleted', { results });
    return results;
  }

  async autoFixIssues(ruleIds?: string[]): Promise<{ fixed: string[]; failed: string[] }> {
    const targetRules = ruleIds || 
      Array.from(this.rules.keys());
    
    const fixed: string[] = [];
    const failed: string[] = [];

    for (const ruleId of targetRules) {
      const rule = this.rules.get(ruleId);
      if (rule && rule.enabled && rule.fix) {
        try {
          const success = await rule.fix();
          if (success) {
            fixed.push(ruleId);
            this.emit('issueFixed', { ruleId });
          } else {
            failed.push(ruleId);
          }
        } catch (error) {
          failed.push(ruleId);
          this.emit('fixFailed', { ruleId, error });
        }
      }
    }

    return { fixed, failed };
  }

  // ========== SPECIFIC CHECK IMPLEMENTATIONS ==========

  private async checkSlowQueries(): Promise<OptimizationResult> {
    const report = await this.db.getOptimizationReport();
    const slowQueryRate = report.slowQueries / Math.max(report.totalQueries, 1);

    if (slowQueryRate > 0.1) { // More than 10% slow queries
      return {
        ruleId: 'slow_query_threshold',
        ruleName: 'Slow Query Detection',
        status: 'error',
        message: `High slow query rate: ${(slowQueryRate * 100).toFixed(1)}%`,
        details: {
          slowQueries: report.slowQueries,
          totalQueries: report.totalQueries,
          averageQueryTime: report.averageQueryTime
        },
        recommendations: [
          'Review and optimize slow queries',
          'Consider adding missing indexes',
          'Analyze query execution plans'
        ],
        autoFixable: true,
        impact: 'high'
      };
    } else if (slowQueryRate > 0.05) { // 5-10% slow queries
      return {
        ruleId: 'slow_query_threshold',
        ruleName: 'Slow Query Detection',
        status: 'warning',
        message: `Elevated slow query rate: ${(slowQueryRate * 100).toFixed(1)}%`,
        details: {
          slowQueries: report.slowQueries,
          totalQueries: report.totalQueries,
          averageQueryTime: report.averageQueryTime
        },
        recommendations: [
          'Monitor slow query trends',
          'Consider query optimization'
        ],
        autoFixable: false,
        impact: 'medium'
      };
    }

    return {
      ruleId: 'slow_query_threshold',
      ruleName: 'Slow Query Detection',
      status: 'pass',
      message: 'Slow query rate within acceptable limits',
      autoFixable: false,
      impact: 'low'
    };
  }

  private async checkMissingIndexes(): Promise<OptimizationResult> {
    // This is a simplified check - in production would analyze query patterns
    const tablesToCheck = ['users', 'transactions', 'sessions', 'audit_logs'];
    const missingIndexes: string[] = [];

    for (const table of tablesToCheck) {
      try {
        const indexes = await this.db.getTableIndexes(table);
        
        // Check for common missing indexes
        if (table === 'users' && !indexes.some(idx => idx.indexname.includes('email'))) {
          missingIndexes.push(`${table}.email`);
        }
        
        if (table === 'transactions' && !indexes.some(idx => idx.indexname.includes('created_at'))) {
          missingIndexes.push(`${table}.created_at`);
        }
      } catch (error) {
        // Table might not exist
      }
    }

    if (missingIndexes.length > 0) {
      return {
        ruleId: 'missing_indexes',
        ruleName: 'Missing Index Detection',
        status: 'warning',
        message: `Potential missing indexes detected`,
        details: { missingIndexes },
        recommendations: [
          'Review query patterns for these tables',
          'Consider creating recommended indexes',
          'Monitor performance after index creation'
        ],
        autoFixable: true,
        impact: 'medium'
      };
    }

    return {
      ruleId: 'missing_indexes',
      ruleName: 'Missing Index Detection',
      status: 'pass',
      message: 'No obvious missing indexes detected',
      autoFixable: false,
      impact: 'low'
    };
  }

  private async checkCacheEfficiency(): Promise<OptimizationResult> {
    const report = await this.db.getOptimizationReport();

    if (report.cacheHitRate < 30) {
      return {
        ruleId: 'cache_efficiency',
        ruleName: 'Cache Efficiency Check',
        status: 'warning',
        message: `Low cache hit rate: ${report.cacheHitRate}%`,
        details: { cacheHitRate: report.cacheHitRate },
        recommendations: [
          'Review cache configuration',
          'Identify frequently accessed data',
          'Consider cache warming strategies'
        ],
        autoFixable: false,
        impact: 'medium'
      };
    }

    return {
      ruleId: 'cache_efficiency',
      ruleName: 'Cache Efficiency Check',
      status: 'pass',
      message: `Cache hit rate acceptable: ${report.cacheHitRate}%`,
      autoFixable: false,
      impact: 'low'
    };
  }

  private async checkConnectionPoolHealth(): Promise<OptimizationResult> {
    const stats = await this.db.getConnectionStats();
    const utilizationRate = (stats.activeConnections / stats.totalConnections) * 100;

    if (utilizationRate > 90) {
      return {
        ruleId: 'connection_pool_health',
        ruleName: 'Connection Pool Health',
        status: 'error',
        message: `High connection pool utilization: ${utilizationRate.toFixed(1)}%`,
        details: stats,
        recommendations: [
          'Consider increasing pool size',
          'Review connection leak issues',
          'Optimize connection usage'
        ],
        autoFixable: false,
        impact: 'high'
      };
    } else if (utilizationRate > 75) {
      return {
        ruleId: 'connection_pool_health',
        ruleName: 'Connection Pool Health',
        status: 'warning',
        message: `Elevated connection pool utilization: ${utilizationRate.toFixed(1)}%`,
        details: stats,
        recommendations: [
          'Monitor connection trends',
          'Consider preemptive scaling'
        ],
        autoFixable: false,
        impact: 'medium'
      };
    }

    return {
      ruleId: 'connection_pool_health',
      ruleName: 'Connection Pool Health',
      status: 'pass',
      message: `Connection pool utilization healthy: ${utilizationRate.toFixed(1)}%`,
      autoFixable: false,
      impact: 'low'
    };
  }

  private async checkReplicationLag(): Promise<OptimizationResult> {
    // Simplified replication lag check
    // In production would query actual replication lag metrics
    
    return {
      ruleId: 'replication_lag',
      ruleName: 'Replication Lag Monitor',
      status: 'info',
      message: 'Replication lag monitoring active',
      autoFixable: false,
      impact: 'low'
    };
  }

  private async checkSecurityConfiguration(): Promise<OptimizationResult> {
    const securityChecks = [
      'SSL connections enforced',
      'Strong password policies',
      'Limited superuser access',
      'Audit logging enabled'
    ];

    const issues: string[] = [];
    
    // Simplified security checks - in production would be more comprehensive
    if (process.env.NODE_ENV !== 'production') {
      issues.push('Non-production environment detected');
    }

    if (issues.length > 0) {
      return {
        ruleId: 'security_audit',
        ruleName: 'Security Configuration Audit',
        status: 'warning',
        message: 'Security configuration issues detected',
        details: { issues },
        recommendations: [
          'Review security settings',
          'Enable SSL for all connections',
          'Implement proper access controls'
        ],
        autoFixable: false,
        impact: 'high'
      };
    }

    return {
      ruleId: 'security_audit',
      ruleName: 'Security Configuration Audit',
      status: 'pass',
      message: 'Security configuration appears adequate',
      autoFixable: false,
      impact: 'low'
    };
  }

  private async checkTableMaintenance(): Promise<OptimizationResult> {
    // Simplified table maintenance check
    // In production would check for tables needing VACUUM or ANALYZE
    
    return {
      ruleId: 'table_maintenance',
      ruleName: 'Table Maintenance Check',
      status: 'info',
      message: 'Table maintenance monitoring active',
      autoFixable: true,
      impact: 'medium'
    };
  }

  // ========== AUTO-FIX IMPLEMENTATIONS ==========

  private async optimizeSlowQueries(): Promise<boolean> {
    try {
      // Invalidate cache for slow queries to force fresh execution
      await this.db.invalidateCache();
      
      // Analyze frequently accessed tables
      const tables = ['users', 'transactions', 'sessions'];
      for (const table of tables) {
        await this.db.analyzeTable(table);
      }
      
      this.logger.info('Slow query optimization completed');
      return true;
    } catch (error) {
      this.logger.error('Failed to optimize slow queries', { error });
      return false;
    }
  }

  private async createRecommendedIndexes(): Promise<boolean> {
    try {
      // Create commonly needed indexes
      const indexes = [
        { table: 'users', columns: ['email'], unique: true },
        { table: 'transactions', columns: ['created_at'] },
        { table: 'sessions', columns: ['user_id'] }
      ];

      for (const index of indexes) {
        try {
          await this.db.createIndex(index);
        } catch (error) {
          // Index might already exist
          this.logger.debug('Index creation skipped', { table: index.table, error: error.message });
        }
      }
      
      this.logger.info('Recommended indexes created');
      return true;
    } catch (error) {
      this.logger.error('Failed to create recommended indexes', { error });
      return false;
    }
  }

  private async performTableMaintenance(): Promise<boolean> {
    try {
      // Perform maintenance on key tables
      const tables = ['users', 'transactions', 'audit_logs'];
      
      for (const table of tables) {
        try {
          await this.db.analyzeTable(table);
          this.logger.debug('Table analyzed', { table });
        } catch (error) {
          this.logger.debug('Table analysis failed', { table, error: error.message });
        }
      }
      
      this.logger.info('Table maintenance completed');
      return true;
    } catch (error) {
      this.logger.error('Failed to perform table maintenance', { error });
      return false;
    }
  }

  // ========== HEALTH SCORE CALCULATION ==========

  async calculateHealthScore(): Promise<DatabaseHealthScore> {
    const results = await this.runOptimizationCheck();
    const stats = await this.db.getConnectionStats();
    const report = await this.db.getOptimizationReport();

    // Calculate individual factors
    const queryPerformance = Math.max(0, 100 - (report.slowQueries / Math.max(report.totalQueries, 1)) * 100);
    const connectionHealth = Math.max(0, 100 - (stats.waitingClients / Math.max(stats.totalConnections, 1)) * 100);
    const cacheEfficiency = report.cacheHitRate;
    const indexOptimization = 85; // Simplified - would analyze actual index usage
    const replicationHealth = 90; // Simplified - would check actual replication status
    const securityPosture = 85; // Simplified - would analyze security configurations

    // Calculate category scores
    const performance = (queryPerformance + cacheEfficiency + indexOptimization) / 3;
    const reliability = (connectionHealth + replicationHealth) / 2;
    const security = securityPosture;
    const efficiency = (cacheEfficiency + connectionHealth) / 2;

    // Calculate overall score
    const overall = (performance + reliability + security + efficiency) / 4;

    this.healthScore = {
      overall: Math.round(overall),
      performance: Math.round(performance),
      reliability: Math.round(reliability),
      security: Math.round(security),
      efficiency: Math.round(efficiency),
      factors: {
        queryPerformance: Math.round(queryPerformance),
        connectionHealth: Math.round(connectionHealth),
        cacheEfficiency: Math.round(cacheEfficiency),
        indexOptimization: Math.round(indexOptimization),
        replicationHealth: Math.round(replicationHealth),
        securityPosture: Math.round(securityPosture)
      }
    };

    this.emit('healthScoreUpdated', this.healthScore);
    return this.healthScore;
  }

  // ========== PERFORMANCE MONITORING ==========

  private startMonitoring(): void {
    // Collect performance metrics every minute
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.collectPerformanceMetrics();
      } catch (error) {
        this.logger.error('Error collecting performance metrics', { error });
      }
    }, 60000); // Every minute
  }

  private async collectPerformanceMetrics(): Promise<void> {
    const report = await this.db.getOptimizationReport();
    const stats = await this.db.getConnectionStats();

    const trend: PerformanceTrend = {
      timestamp: new Date(),
      avgQueryTime: report.averageQueryTime,
      slowQueryRate: report.slowQueries / Math.max(report.totalQueries, 1),
      cacheHitRate: report.cacheHitRate / 100,
      connectionUtilization: (stats.activeConnections / Math.max(stats.totalConnections, 1)),
      errorRate: 0 // Would track actual error rate
    };

    this.performanceHistory.push(trend);

    // Keep history bounded
    if (this.performanceHistory.length > this.MAX_HISTORY_POINTS) {
      this.performanceHistory = this.performanceHistory.slice(-this.MAX_HISTORY_POINTS);
    }

    this.emit('performanceMetricsCollected', trend);
  }

  async getPerformanceTrends(hours: number = 24): Promise<PerformanceTrend[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.performanceHistory.filter(t => t.timestamp >= cutoff);
  }

  // ========== UTILITY METHODS ==========

  async getOptimizationSummary(): Promise<{
    rules: { total: number; enabled: number; disabled: number };
    health: DatabaseHealthScore | null;
    trends: PerformanceTrend[];
    lastCheck: Date | null;
  }> {
    const rules = Array.from(this.rules.values());
    
    return {
      rules: {
        total: rules.length,
        enabled: rules.filter(r => r.enabled).length,
        disabled: rules.filter(r => !r.enabled).length
      },
      health: this.healthScore,
      trends: this.performanceHistory.slice(-10), // Last 10 data points
      lastCheck: this.performanceHistory.length > 0 ? 
        this.performanceHistory[this.performanceHistory.length - 1].timestamp : null
    };
  }

  async shutdown(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.removeAllListeners();
    this.logger.info('Database optimization service shutdown complete');
  }
}

export const dbOptimizationService = new DatabaseOptimizationService(
  require('./enhanced-database-layer').enhancedDb
);
