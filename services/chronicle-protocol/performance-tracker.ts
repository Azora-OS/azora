/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

CHRONICLE PROTOCOL - PERFORMANCE TRACKER
Real-time performance monitoring and optimization recommendations
*/

import { chronicleMetrics } from './metrics';
import { hybridStorage } from './hybrid-storage';

interface PerformanceSnapshot {
  timestamp: Date;
  metrics: {
    memoriesPerSecond: number;
    thoughtsPerSecond: number;
    avgBlockchainLatency: number;
    avgCacheLatency: number;
    cacheHitRate: number;
    blockchainSuccessRate: number;
    apiRequestsPerSecond: number;
    avgResponseTime: number;
    errorRate: number;
  };
  system: {
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
    uptime: number;
  };
}

interface PerformanceAlert {
  level: 'info' | 'warning' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  recommendation: string;
  timestamp: Date;
}

interface PerformanceReport {
  period: {
    start: Date;
    end: Date;
    duration: number;
  };
  summary: {
    totalMemories: number;
    totalThoughts: number;
    totalTransactions: number;
    avgThroughput: number;
    avgLatency: number;
    uptime: number;
  };
  performance: {
    blockchain: {
      avgLatency: number;
      successRate: number;
      failureCount: number;
    };
    cache: {
      hitRate: number;
      avgLatency: number;
      size: number;
    };
    api: {
      requestsPerSecond: number;
      avgResponseTime: number;
      errorRate: number;
    };
  };
  alerts: PerformanceAlert[];
  recommendations: string[];
}

/**
 * Performance Tracker
 * Monitors and analyzes Chronicle Protocol performance
 */
export class PerformanceTracker {
  private snapshots: PerformanceSnapshot[] = [];
  private alerts: PerformanceAlert[] = [];
  private startTime: Date;
  
  private counters = {
    memoriesImprinted: 0,
    thoughtsRecorded: 0,
    blockchainTransactions: 0,
    blockchainFailures: 0,
    apiRequests: 0,
    apiErrors: 0,
  };

  private timings = {
    blockchainLatencies: [] as number[],
    cacheLatencies: [] as number[],
    apiResponseTimes: [] as number[],
  };

  private readonly SNAPSHOT_INTERVAL = 60000; // 1 minute
  private readonly MAX_SNAPSHOTS = 1440; // 24 hours worth
  private readonly MAX_TIMINGS = 1000; // Keep last 1000 samples

  // Performance thresholds
  private readonly THRESHOLDS = {
    blockchainLatency: 5000, // 5 seconds
    cacheHitRate: 80, // 80%
    apiResponseTime: 1000, // 1 second
    errorRate: 5, // 5%
    memoryUsage: 0.9, // 90% of heap
  };

  constructor() {
    this.startTime = new Date();
    this.startPeriodicSnapshots();
  }

  /**
   * Track memory imprint performance
   */
  trackMemoryImprint(duration: number, blockchainUsed: boolean): void {
    this.counters.memoriesImprinted++;
    
    if (blockchainUsed) {
      this.trackBlockchainLatency(duration);
    } else {
      this.trackCacheLatency(duration);
    }
  }

  /**
   * Track thought recording performance
   */
  trackThoughtRecording(duration: number, blockchainUsed: boolean): void {
    this.counters.thoughtsRecorded++;
    
    if (blockchainUsed) {
      this.trackBlockchainLatency(duration);
    } else {
      this.trackCacheLatency(duration);
    }
  }

  /**
   * Track blockchain latency
   */
  trackBlockchainLatency(latency: number): void {
    this.timings.blockchainLatencies.push(latency);
    
    // Keep only recent samples
    if (this.timings.blockchainLatencies.length > this.MAX_TIMINGS) {
      this.timings.blockchainLatencies.shift();
    }

    // Check threshold
    if (latency > this.THRESHOLDS.blockchainLatency) {
      this.addAlert({
        level: 'warning',
        metric: 'blockchain_latency',
        value: latency,
        threshold: this.THRESHOLDS.blockchainLatency,
        message: `Blockchain latency (${latency}ms) exceeded threshold (${this.THRESHOLDS.blockchainLatency}ms)`,
        recommendation: 'Consider using faster RPC endpoint or increasing gas price',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Track cache latency
   */
  trackCacheLatency(latency: number): void {
    this.timings.cacheLatencies.push(latency);
    
    if (this.timings.cacheLatencies.length > this.MAX_TIMINGS) {
      this.timings.cacheLatencies.shift();
    }
  }

  /**
   * Track API request performance
   */
  trackApiRequest(duration: number, status: number): void {
    this.counters.apiRequests++;
    this.timings.apiResponseTimes.push(duration);
    
    if (this.timings.apiResponseTimes.length > this.MAX_TIMINGS) {
      this.timings.apiResponseTimes.shift();
    }

    if (status >= 400) {
      this.counters.apiErrors++;
    }

    // Check thresholds
    if (duration > this.THRESHOLDS.apiResponseTime) {
      this.addAlert({
        level: 'info',
        metric: 'api_response_time',
        value: duration,
        threshold: this.THRESHOLDS.apiResponseTime,
        message: `API response time (${duration}ms) exceeded threshold`,
        recommendation: 'Optimize database queries or add caching',
        timestamp: new Date(),
      });
    }
  }

  /**
   * Track blockchain transaction
   */
  trackBlockchainTransaction(success: boolean): void {
    this.counters.blockchainTransactions++;
    
    if (!success) {
      this.counters.blockchainFailures++;
    }
  }

  /**
   * Add performance alert
   */
  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);
    
    // Keep only recent alerts (last 100)
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }

    // Log critical alerts
    if (alert.level === 'critical') {
      console.error(`🚨 CRITICAL ALERT: ${alert.message}`);
      console.error(`   Recommendation: ${alert.recommendation}`);
    }
  }

  /**
   * Take performance snapshot
   */
  private async takeSnapshot(): Promise<PerformanceSnapshot> {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();

    // Calculate metrics
    const avgBlockchainLatency = this.average(this.timings.blockchainLatencies);
    const avgCacheLatency = this.average(this.timings.cacheLatencies);
    const avgResponseTime = this.average(this.timings.apiResponseTimes);

    const blockchainSuccessRate = this.counters.blockchainTransactions > 0
      ? ((this.counters.blockchainTransactions - this.counters.blockchainFailures) / this.counters.blockchainTransactions) * 100
      : 100;

    const errorRate = this.counters.apiRequests > 0
      ? (this.counters.apiErrors / this.counters.apiRequests) * 100
      : 0;

    // Get storage statistics from HybridStorage
    const storageStats = await hybridStorage.getStats();

    // Update Prometheus metrics
    chronicleMetrics.updateServiceUptime(uptime);
    chronicleMetrics.updateBlockchainLatency(process.env.BLOCKCHAIN_NETWORK || 'unknown', avgBlockchainLatency);
    chronicleMetrics.updateStorageStats({
        memoriesInCache: storageStats.memoriesInCache,
        thoughtsInCache: storageStats.thoughtsInCache,
        memoriesOnChain: storageStats.memoriesOnChain,
        thoughtsOnChain: storageStats.thoughtsOnChain,
        cacheHitRate: storageStats.cacheHitRate,
        evolutionLevel: storageStats.evolutionLevel,
    });
    
    const snapshot: PerformanceSnapshot = {
      timestamp: new Date(),
      metrics: {
        memoriesPerSecond: this.counters.memoriesImprinted / uptime,
        thoughtsPerSecond: this.counters.thoughtsRecorded / uptime,
        avgBlockchainLatency,
        avgCacheLatency,
        cacheHitRate: storageStats.cacheHitRate, // Will be updated by hybrid storage
        blockchainSuccessRate,
        apiRequestsPerSecond: this.counters.apiRequests / uptime,
        avgResponseTime,
        errorRate,
      },
      system: {
        memoryUsage,
        cpuUsage,
        uptime,
      },
    };

    this.snapshots.push(snapshot);

    // Keep only recent snapshots
    if (this.snapshots.length > this.MAX_SNAPSHOTS) {
      this.snapshots.shift();
    }

    // Check system thresholds
    if (memoryUsage && memoryUsage.heapTotal > 0) {
        const heapUsedPercent = memoryUsage.heapUsed / memoryUsage.heapTotal;
        if (heapUsedPercent > this.THRESHOLDS.memoryUsage) {
          this.addAlert({
            level: 'critical',
            metric: 'memory_usage',
            value: heapUsedPercent * 100,
            threshold: this.THRESHOLDS.memoryUsage * 100,
            message: `Memory usage (${Math.round(heapUsedPercent * 100)}%) is critical`,
            recommendation: 'Restart service or increase memory allocation',
            timestamp: new Date(),
          });
        }
    }

    return snapshot;
  }

  /**
   * Start periodic snapshots
   */
  private startPeriodicSnapshots(): void {
    setInterval(async () => {
      await this.takeSnapshot();
    }, this.SNAPSHOT_INTERVAL);
  }

  /**
   * Generate performance report
   */
  async generateReport(periodMinutes: number = 60): Promise<PerformanceReport> {
    const now = new Date();
    const start = new Date(now.getTime() - periodMinutes * 60 * 1000);

    const recentSnapshots = this.snapshots.filter(s => s.timestamp >= start);
    const recentAlerts = this.alerts.filter(a => a.timestamp >= start);

    // Calculate summary
    const totalMemories = this.counters.memoriesImprinted;
    const totalThoughts = this.counters.thoughtsRecorded;
    const totalTransactions = this.counters.blockchainTransactions;
    const uptime = process.uptime();

    const avgThroughput = (totalMemories + totalThoughts) / uptime;
    const avgLatency = this.average([
      ...this.timings.blockchainLatencies,
      ...this.timings.cacheLatencies,
    ]);

    // Generate recommendations
    const recommendations = this.generateRecommendations(recentSnapshots, recentAlerts);

    const report: PerformanceReport = {
      period: {
        start,
        end: now,
        duration: periodMinutes,
      },
      summary: {
        totalMemories,
        totalThoughts,
        totalTransactions,
        avgThroughput,
        avgLatency,
        uptime,
      },
      performance: {
        blockchain: {
          avgLatency: this.average(this.timings.blockchainLatencies),
          successRate: this.counters.blockchainTransactions > 0
            ? ((this.counters.blockchainTransactions - this.counters.blockchainFailures) / this.counters.blockchainTransactions) * 100
            : 100,
          failureCount: this.counters.blockchainFailures,
        },
        cache: {
          hitRate: 0, // Updated by hybrid storage
          avgLatency: this.average(this.timings.cacheLatencies),
          size: 0, // Updated by hybrid storage
        },
        api: {
          requestsPerSecond: this.counters.apiRequests / uptime,
          avgResponseTime: this.average(this.timings.apiResponseTimes),
          errorRate: this.counters.apiRequests > 0
            ? (this.counters.apiErrors / this.counters.apiRequests) * 100
            : 0,
        },
      },
      alerts: recentAlerts,
      recommendations,
    };

    return report;
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(snapshots: PerformanceSnapshot[], alerts: PerformanceAlert[]): string[] {
    const recommendations: string[] = [];

    // Check blockchain latency
    const avgBlockchainLatency = this.average(this.timings.blockchainLatencies);
    if (avgBlockchainLatency > this.THRESHOLDS.blockchainLatency) {
      recommendations.push('🔸 High blockchain latency detected. Consider using faster RPC endpoint or increasing gas price.');
    }

    // Check error rate
    const errorRate = this.counters.apiRequests > 0
      ? (this.counters.apiErrors / this.counters.apiRequests) * 100
      : 0;
    
    if (errorRate > this.THRESHOLDS.errorRate) {
      recommendations.push('🔸 High error rate detected. Review error logs and implement additional error handling.');
    }

    // Check memory usage
    if (snapshots && snapshots.length > 0) {
        const latestSnapshot = snapshots[snapshots.length - 1];
        if (latestSnapshot && latestSnapshot.system && latestSnapshot.system.memoryUsage && latestSnapshot.system.memoryUsage.heapTotal > 0) {
            const heapUsedPercent = latestSnapshot.system.memoryUsage.heapUsed / latestSnapshot.system.memoryUsage.heapTotal;
            if (heapUsedPercent > 0.8) {
                recommendations.push('🔸 Memory usage above 80%. Consider increasing cache size limits or Node.js memory allocation.');
            }
        }
    }

    // Check critical alerts
    const criticalAlerts = alerts.filter(a => a.level === 'critical');
    if (criticalAlerts.length > 0) {
      recommendations.push(`🔸 ${criticalAlerts.length} critical alerts detected. Immediate action required.`);
    }

    // Add general optimizations
    if (recommendations.length === 0) {
      recommendations.push('✅ System performance is optimal. No recommendations at this time.');
    }

    return recommendations;
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(count: number = 10): PerformanceAlert[] {
    return this.alerts.slice(-count);
  }

  /**
   * Get current performance snapshot
   */
  getCurrentSnapshot(): PerformanceSnapshot | null {
    return this.snapshots.length > 0 ? this.snapshots[this.snapshots.length - 1] : null;
  }

  /**
   * Calculate average
   */
  private average(numbers: number[]): number {
    if (!numbers || numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  /**
   * Reset performance counters (for testing)
   */
  reset(): void {
    this.counters = {
      memoriesImprinted: 0,
      thoughtsRecorded: 0,
      blockchainTransactions: 0,
      blockchainFailures: 0,
      apiRequests: 0,
      apiErrors: 0,
    };
    this.timings = {
      blockchainLatencies: [],
      cacheLatencies: [],
      apiResponseTimes: [],
    };
    this.snapshots = [];
    this.alerts = [];
    this.startTime = new Date();
  }
}

// Export singleton instance
export const performanceTracker = new PerformanceTracker();
export default performanceTracker;
