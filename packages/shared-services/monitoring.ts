/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

MONITORING SERVICE
Provides comprehensive monitoring and alerting
*/

import { getServiceRegistry } from './service-registry';
import { healthCheckService } from './health-check';
import { eventBus } from './event-bus';

export interface MonitoringMetrics {
  timestamp: Date;
  services: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
  infrastructure: {
    database: 'healthy' | 'degraded' | 'unhealthy';
    redis: 'healthy' | 'degraded' | 'unhealthy';
  };
  performance: {
    averageLatency: number;
    errorRate: number;
    throughput: number;
  };
}

/**
 * Monitoring Service
 * Provides comprehensive system monitoring
 */
export class MonitoringService {
  private serviceRegistry: ReturnType<typeof getServiceRegistry>;
  private metricsHistory: MonitoringMetrics[] = [];
  private maxHistorySize: number = 1000;

  constructor() {
    this.serviceRegistry = getServiceRegistry();
    this.startMonitoring();
  }

  /**
   * Start monitoring loop
   */
  private startMonitoring(): void {
    // Collect metrics every 30 seconds
    setInterval(async () => {
      await this.collectMetrics();
    }, 30000);

    // Initial collection
    this.collectMetrics();
  }

  /**
   * Collect current metrics
   */
  async collectMetrics(): Promise<MonitoringMetrics> {
    const [healthReport, serviceStatus] = await Promise.all([
      healthCheckService.getHealthReport(),
      this.serviceRegistry.getStatus(),
    ]);

    const metrics: MonitoringMetrics = {
      timestamp: new Date(),
      services: {
        total: serviceStatus.total,
        healthy: serviceStatus.healthy,
        degraded: serviceStatus.degraded,
        unhealthy: serviceStatus.unhealthy,
      },
      infrastructure: {
        database: healthReport.infrastructure.database.status,
        redis: healthReport.infrastructure.redis.status,
      },
      performance: {
        averageLatency: this.calculateAverageLatency(healthReport),
        errorRate: healthReport.score < 70 ? (100 - healthReport.score) / 100 : 0,
        throughput: 0, // Would be calculated from request metrics
      },
    };

    // Add to history
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }

    // Emit monitoring event
    await eventBus.publish('monitoring.metrics.collected', {
      metrics,
    });

    // Check for alerts
    await this.checkAlerts(metrics);

    return metrics;
  }

  /**
   * Calculate average latency
   */
  private calculateAverageLatency(healthReport: any): number {
    const latencies = [
      healthReport.infrastructure.database.latency,
      healthReport.infrastructure.redis.latency,
      ...healthReport.services.map((s: any) => s.latency).filter(Boolean),
    ].filter((l): l is number => typeof l === 'number');

    return latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 0;
  }

  /**
   * Check for alerts
   */
  private async checkAlerts(metrics: MonitoringMetrics): Promise<void> {
    // Alert if too many services unhealthy
    if (metrics.services.unhealthy > metrics.services.total * 0.2) {
      await eventBus.publish('monitoring.alert', {
        type: 'service_health',
        severity: 'high',
        message: `${metrics.services.unhealthy} services are unhealthy`,
        metrics,
      });
    }

    // Alert if infrastructure unhealthy
    if (metrics.infrastructure.database === 'unhealthy' || metrics.infrastructure.redis === 'unhealthy') {
      await eventBus.publish('monitoring.alert', {
        type: 'infrastructure',
        severity: 'critical',
        message: 'Infrastructure component is unhealthy',
        metrics,
      });
    }

    // Alert if error rate too high
    if (metrics.performance.errorRate > 0.1) {
      await eventBus.publish('monitoring.alert', {
        type: 'performance',
        severity: 'medium',
        message: `Error rate is ${(metrics.performance.errorRate * 100).toFixed(2)}%`,
        metrics,
      });
    }
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(limit: number = 100): MonitoringMetrics[] {
    return this.metricsHistory.slice(-limit);
  }

  /**
   * Get current metrics
   */
  async getCurrentMetrics(): Promise<MonitoringMetrics> {
    return this.collectMetrics();
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();

export default monitoringService;
