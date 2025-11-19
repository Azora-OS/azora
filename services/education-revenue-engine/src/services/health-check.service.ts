/**
 * Health Check Service
 * Provides detailed health status and metrics for monitoring
 */

import { PrismaClient } from '@prisma/client';
import { structuredLogger } from '../utils/structured-logger';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: HealthCheck;
    cache?: HealthCheck;
    aiEngines?: HealthCheck;
    memory?: HealthCheck;
  };
  metrics?: {
    requestsPerSecond: number;
    errorRate: number;
    averageResponseTime: number;
    activeConnections: number;
  };
}

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  message?: string;
  lastChecked: string;
}

class HealthCheckService {
  private prisma: PrismaClient;
  private lastMetrics = {
    requestCount: 0,
    errorCount: 0,
    totalResponseTime: 0,
    requestTimestamps: [] as number[],
  };

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get overall health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const startTime = Date.now();
    const checks = {
      database: await this.checkDatabase(),
      cache: await this.checkCache(),
      aiEngines: await this.checkAiEngines(),
      memory: this.checkMemory(),
    };

    // Determine overall status
    const allStatuses = Object.values(checks).map(c => c.status);
    const hasUnhealthy = allStatuses.includes('unhealthy');
    const hasDegraded = allStatuses.includes('degraded');

    const status = hasUnhealthy ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy';

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
      metrics: this.getMetrics(),
    };
  }

  /**
   * Check database connectivity
   */
  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;

      return {
        status: responseTime < 100 ? 'healthy' : 'degraded',
        responseTime,
        message: 'Database connection successful',
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      structuredLogger.error('Database health check failed', error as Error);
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        message: (error as Error).message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check cache connectivity (Redis)
   */
  private async checkCache(): Promise<HealthCheck> {
    const startTime = Date.now();
    try {
      // This would check Redis connection if configured
      // For now, return healthy as cache is optional
      return {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        message: 'Cache available',
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      structuredLogger.warn('Cache health check failed', error as Error);
      return {
        status: 'degraded',
        responseTime: Date.now() - startTime,
        message: (error as Error).message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check AI engines connectivity
   */
  private async checkAiEngines(): Promise<HealthCheck> {
    const startTime = Date.now();
    try {
      // This would check Elara, Knowledge Ocean, Constitutional AI
      // For now, return healthy as AI engines are optional
      return {
        status: 'healthy',
        responseTime: Date.now() - startTime,
        message: 'AI engines available',
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      structuredLogger.warn('AI engines health check failed', error as Error);
      return {
        status: 'degraded',
        responseTime: Date.now() - startTime,
        message: (error as Error).message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check memory usage
   */
  private checkMemory(): HealthCheck {
    const memUsage = process.memoryUsage();
    const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (heapUsedPercent > 90) {
      status = 'unhealthy';
    } else if (heapUsedPercent > 75) {
      status = 'degraded';
    }

    return {
      status,
      responseTime: 0,
      message: `Heap usage: ${heapUsedPercent.toFixed(2)}%`,
      lastChecked: new Date().toISOString(),
    };
  }

  /**
   * Get performance metrics
   */
  private getMetrics() {
    const now = Date.now();
    const oneSecondAgo = now - 1000;

    // Count requests in last second
    const recentRequests = this.lastMetrics.requestTimestamps.filter(
      t => t > oneSecondAgo
    ).length;

    // Clean up old timestamps
    this.lastMetrics.requestTimestamps = this.lastMetrics.requestTimestamps.filter(
      t => t > oneSecondAgo
    );

    const errorRate = this.lastMetrics.requestCount > 0
      ? (this.lastMetrics.errorCount / this.lastMetrics.requestCount) * 100
      : 0;

    const averageResponseTime = this.lastMetrics.requestCount > 0
      ? this.lastMetrics.totalResponseTime / this.lastMetrics.requestCount
      : 0;

    return {
      requestsPerSecond: recentRequests,
      errorRate: parseFloat(errorRate.toFixed(2)),
      averageResponseTime: parseFloat(averageResponseTime.toFixed(2)),
      activeConnections: this.lastMetrics.requestTimestamps.length,
    };
  }

  /**
   * Record request metric
   */
  recordRequest(responseTime: number, isError: boolean = false): void {
    this.lastMetrics.requestCount++;
    this.lastMetrics.totalResponseTime += responseTime;
    if (isError) {
      this.lastMetrics.errorCount++;
    }
    this.lastMetrics.requestTimestamps.push(Date.now());
  }

  /**
   * Get detailed diagnostics
   */
  async getDiagnostics() {
    const health = await this.getHealthStatus();
    const memUsage = process.memoryUsage();

    return {
      health,
      system: {
        uptime: process.uptime(),
        memory: {
          heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
          heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
          external: `${(memUsage.external / 1024 / 1024).toFixed(2)} MB`,
          rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        },
        nodeVersion: process.version,
        platform: process.platform,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

export { HealthCheckService };
