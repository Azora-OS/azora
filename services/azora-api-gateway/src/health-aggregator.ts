/**
 * Health Aggregation Service
 * Ubuntu Philosophy: "My security ensures our freedom"
 */

import { ServiceConfig } from './index';
import { getLogger } from '../../../shared/monitoring/logger';
import { metrics } from '../../../shared/monitoring/metrics';

interface ServiceHealth {
  name: string;
  url: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  lastChecked: Date;
  error?: string;
  consecutiveFailures: number;
}

interface HealthSummary {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: ServiceHealth[];
  totalServices: number;
  healthyServices: number;
  unhealthyServices: number;
  timestamp: Date;
}

export class HealthAggregator {
  private services: ServiceConfig[];
  private healthCache: Map<string, ServiceHealth> = new Map();
  private logger = getLogger('health-aggregator');
  private checkInterval: NodeJS.Timeout;
  private readonly CACHE_TTL = 30000; // 30 seconds

  constructor(services: ServiceConfig[]) {
    this.services = services;
    this.startPeriodicChecks();
  }

  async checkAllServices(): Promise<HealthSummary> {
    const healthPromises = this.services.map(service => this.checkServiceHealth(service));
    const serviceHealths = await Promise.allSettled(healthPromises);

    const healthyServices = serviceHealths.filter(
      result => result.status === 'fulfilled' && result.value.status === 'healthy'
    ).length;

    const unhealthyServices = serviceHealths.filter(
      result => result.status === 'fulfilled' && result.value.status === 'unhealthy'
    ).length;

    const overall = this.determineOverallHealth(healthyServices, unhealthyServices);

    const summary: HealthSummary = {
      overall,
      services: serviceHealths.map(result => 
        result.status === 'fulfilled' ? result.value : {
          name: 'unknown',
          url: '',
          status: 'unknown' as const,
          lastChecked: new Date(),
          consecutiveFailures: 0
        }
      ),
      totalServices: this.services.length,
      healthyServices,
      unhealthyServices,
      timestamp: new Date()
    };

    // Update metrics
    metrics.gauge('services_healthy_total', healthyServices);
    metrics.gauge('services_unhealthy_total', unhealthyServices);
    metrics.gauge('services_total', this.services.length);

    this.logger.info('Health check completed', {
      overall,
      healthyServices,
      unhealthyServices,
      totalServices: this.services.length
    });

    return summary;
  }

  async checkServiceHealth(service: ServiceConfig): Promise<ServiceHealth> {
    const cached = this.healthCache.get(service.name);
    const now = new Date();

    // Return cached result if still valid
    if (cached && (now.getTime() - cached.lastChecked.getTime()) < this.CACHE_TTL) {
      return cached;
    }

    const startTime = Date.now();
    let status: 'healthy' | 'unhealthy' | 'unknown' = 'unknown';
    let error: string | undefined;
    let responseTime: number | undefined;

    try {
      const response = await fetch(`${service.url}/health`, {
        method: 'GET',
        timeout: service.timeout,
        signal: AbortSignal.timeout(service.timeout)
      });

      responseTime = Date.now() - startTime;

      if (response.ok) {
        status = 'healthy';
        metrics.incrementCounter('service_health_checks_total', 1, {
          service: service.name,
          status: 'healthy'
        });
      } else {
        status = 'unhealthy';
        error = `HTTP ${response.status}: ${response.statusText}`;
        metrics.incrementCounter('service_health_checks_total', 1, {
          service: service.name,
          status: 'unhealthy'
        });
      }
    } catch (err) {
      status = 'unhealthy';
      error = err instanceof Error ? err.message : 'Unknown error';
      metrics.incrementCounter('service_health_checks_total', 1, {
        service: service.name,
        status: 'error'
      });
    }

    const previousFailures = cached?.consecutiveFailures || 0;
    const consecutiveFailures = status === 'healthy' ? 0 : previousFailures + 1;

    const serviceHealth: ServiceHealth = {
      name: service.name,
      url: service.url,
      status,
      responseTime,
      lastChecked: now,
      error,
      consecutiveFailures
    };

    // Update cache
    this.healthCache.set(service.name, serviceHealth);

    // Log if service is unhealthy
    if (status === 'unhealthy') {
      this.logger.warn('Service health check failed', {
        service: service.name,
        url: service.url,
        error,
        consecutiveFailures
      });
    }

    return serviceHealth;
  }

  private determineOverallHealth(
    healthyCount: number,
    unhealthyCount: number
  ): 'healthy' | 'degraded' | 'unhealthy' {
    const totalServices = this.services.length;
    const healthyRatio = totalServices > 0 ? healthyCount / totalServices : 0;

    if (healthyRatio >= 0.9) {
      return 'healthy';
    } else if (healthyRatio >= 0.5) {
      return 'degraded';
    } else {
      return 'unhealthy';
    }
  }

  getServiceHealth(serviceName: string): ServiceHealth | null {
    return this.healthCache.get(serviceName) || null;
  }

  async waitForService(
    serviceName: string,
    timeout: number = 30000,
    checkInterval: number = 1000
  ): Promise<boolean> {
    const startTime = Date.now();
    const service = this.services.find(s => s.name === serviceName);
    
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    while (Date.now() - startTime < timeout) {
      const health = await this.checkServiceHealth(service);
      if (health.status === 'healthy') {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    return false;
  }

  getHealthMetrics(): {
    averageResponseTime: number;
    failureRate: number;
    servicesByStatus: Record<string, number>;
  } {
    const services = Array.from(this.healthCache.values());
    
    if (services.length === 0) {
      return {
        averageResponseTime: 0,
        failureRate: 0,
        servicesByStatus: {}
      };
    }

    const responseTimes = services
      .map(s => s.responseTime)
      .filter((rt): rt is number => rt !== undefined);

    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length
      : 0;

    const failureRate = services.filter(s => s.status === 'unhealthy').length / services.length;

    const servicesByStatus = services.reduce((acc, service) => {
      acc[service.status] = (acc[service.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      averageResponseTime,
      failureRate,
      servicesByStatus
    };
  }

  private startPeriodicChecks(): void {
    this.checkInterval = setInterval(async () => {
      try {
        await this.checkAllServices();
      } catch (error) {
        this.logger.error('Periodic health check failed', { error });
      }
    }, this.CACHE_TTL);
  }

  stopPeriodicChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  clearCache(): void {
    this.healthCache.clear();
  }

  // Express middleware for health endpoint
  healthMiddleware() {
    return async (req: any, res: any, next: any) => {
      try {
        const summary = await this.checkAllServices();
        
        const statusCode = summary.overall === 'healthy' ? 200 : 
                         summary.overall === 'degraded' ? 200 : 503;

        res.status(statusCode).json({
          status: summary.overall,
          timestamp: summary.timestamp,
          services: summary.services.map(service => ({
            name: service.name,
            status: service.status,
            responseTime: service.responseTime,
            lastChecked: service.lastChecked,
            error: service.error
          })),
          metrics: this.getHealthMetrics(),
          ubuntu: 'My security ensures our freedom - Health check completed'
        });
      } catch (error) {
        this.logger.error('Health endpoint error', { error });
        res.status(503).json({
          status: 'unhealthy',
          error: 'Health check failed',
          ubuntu: 'My security ensures our freedom - Service temporarily unavailable'
        });
      }
    };
  }
}

export default HealthAggregator;
