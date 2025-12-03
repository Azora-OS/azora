/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

UNIFIED HEALTH CHECK SERVICE
Provides comprehensive health checks across all services
*/

import { getServiceRegistry, ServiceRegistry } from './service-registry';
import { HealthStatus } from './core/organs/interfaces';
import { prisma } from '@azora/shared-database/prisma';
import { checkRedisHealth } from '@azora/shared-database/redis';

export interface HealthCheckResult {
  service: string;
  status: HealthStatus;
  latency?: number;
  error?: string;
  timestamp: Date;
}

export interface SystemHealthReport {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  score: number;
  services: HealthCheckResult[];
  infrastructure: {
    database: HealthCheckResult;
    redis: HealthCheckResult;
  };
  timestamp: Date;
}

/**
 * Unified Health Check Service
 */
export class UnifiedHealthCheckService {
  private serviceRegistry: ServiceRegistry;

  constructor() {
    this.serviceRegistry = getServiceRegistry();
  }

  /**
   * Check database health
   */
  async checkDatabaseHealth(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;

      return {
        service: 'database',
        status: latency < 100 ? 'healthy' : latency < 500 ? 'degraded' : 'unhealthy',
        latency,
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        service: 'database',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check Redis health
   */
  async checkRedisHealth(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const result = await checkRedisHealth();
      const latency = Date.now() - start;

      return {
        service: 'redis',
        status: result.healthy ? (latency < 50 ? 'healthy' : 'degraded') : 'unhealthy',
        latency: result.latency,
        error: result.error,
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        service: 'redis',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check all services health
   */
  async checkAllServices(): Promise<HealthCheckResult[]> {
    await this.serviceRegistry.checkAllServicesHealth();
    const services = this.serviceRegistry.getAllServices();

    return services.map(service => ({
      service: service.name,
      status: service.health,
      timestamp: service.lastHealthCheck || new Date(),
    }));
  }

  /**
   * Get comprehensive health report
   */
  async getHealthReport(): Promise<SystemHealthReport> {
    const [databaseHealth, redisHealth, servicesHealth] = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkRedisHealth(),
      this.checkAllServices(),
    ]);

    const allChecks = [databaseHealth, redisHealth, ...servicesHealth];
    
    // Calculate overall health
    const healthyCount = allChecks.filter(c => c.status === 'healthy').length;
    const degradedCount = allChecks.filter(c => c.status === 'degraded').length;
    const unhealthyCount = allChecks.filter(c => c.status === 'unhealthy').length;
    
    const total = allChecks.length;
    const score = total > 0 
      ? Math.round((healthyCount * 100 + degradedCount * 70 + unhealthyCount * 30) / total)
      : 100;

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (unhealthyCount === 0 && degradedCount === 0) {
      overall = 'healthy';
    } else if (unhealthyCount === 0) {
      overall = 'degraded';
    } else {
      overall = 'unhealthy';
    }

    return {
      overall,
      score,
      services: servicesHealth,
      infrastructure: {
        database: databaseHealth,
        redis: redisHealth,
      },
      timestamp: new Date(),
    };
  }
}

// Export singleton instance
export const healthCheckService = new UnifiedHealthCheckService();

export default healthCheckService;
