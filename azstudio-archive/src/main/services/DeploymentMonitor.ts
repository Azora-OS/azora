/**
 * DeploymentMonitor
 * 
 * Monitors deployed services for health, uptime, errors, and performance.
 */

export interface ServiceHealth {
  url: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  statusCode?: number;
  lastChecked: Date;
  error?: string;
}

export interface ServiceMetrics {
  url: string;
  uptime: number;
  avgResponseTime: number;
  errorRate: number;
  totalRequests: number;
  errors: ErrorLog[];
  performanceHistory: PerformanceDataPoint[];
}

export interface ErrorLog {
  timestamp: Date;
  message: string;
  stack?: string;
  statusCode?: number;
  url?: string;
}

export interface PerformanceDataPoint {
  timestamp: Date;
  responseTime: number;
  statusCode: number;
}

export interface MonitoringConfig {
  url: string;
  interval: number;
  timeout: number;
  healthcheckPath?: string;
  expectedStatusCode?: number;
}

export class DeploymentMonitor {
  private monitors: Map<string, NodeJS.Timeout> = new Map();
  private healthStatus: Map<string, ServiceHealth> = new Map();
  private metrics: Map<string, ServiceMetrics> = new Map();
  private maxHistorySize = 100;

  startMonitoring(
    serviceId: string,
    config: MonitoringConfig,
    onUpdate?: (health: ServiceHealth) => void
  ): void {
    this.stopMonitoring(serviceId);

    if (!this.metrics.has(serviceId)) {
      this.metrics.set(serviceId, {
        url: config.url,
        uptime: 100,
        avgResponseTime: 0,
        errorRate: 0,
        totalRequests: 0,
        errors: [],
        performanceHistory: [],
      });
    }

    const monitor = setInterval(async () => {
      const health = await this.checkHealth(serviceId, config);
      this.healthStatus.set(serviceId, health);
      this.updateMetrics(serviceId, health);
      
      if (onUpdate) {
        onUpdate(health);
      }
    }, config.interval);

    this.monitors.set(serviceId, monitor);

    this.checkHealth(serviceId, config).then(health => {
      this.healthStatus.set(serviceId, health);
      if (onUpdate) {
        onUpdate(health);
      }
    });
  }

  stopMonitoring(serviceId: string): void {
    const monitor = this.monitors.get(serviceId);
    if (monitor) {
      clearInterval(monitor);
      this.monitors.delete(serviceId);
    }
  }

  stopAll(): void {
    this.monitors.forEach(monitor => clearInterval(monitor));
    this.monitors.clear();
  }

  private async checkHealth(
    _serviceId: string,
    config: MonitoringConfig
  ): Promise<ServiceHealth> {
    const startTime = Date.now();
    const url = config.healthcheckPath 
      ? `${config.url}${config.healthcheckPath}`
      : config.url;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.timeout);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const responseTime = Date.now() - startTime;
      const expectedCode = config.expectedStatusCode || 200;
      const isHealthy = response.status === expectedCode;

      return {
        url: config.url,
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime,
        statusCode: response.status,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        url: config.url,
        status: 'unhealthy',
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private updateMetrics(serviceId: string, health: ServiceHealth): void {
    const metrics = this.metrics.get(serviceId);
    if (!metrics) return;

    metrics.totalRequests++;

    if (health.responseTime && health.statusCode) {
      metrics.performanceHistory.push({
        timestamp: health.lastChecked,
        responseTime: health.responseTime,
        statusCode: health.statusCode,
      });

      if (metrics.performanceHistory.length > this.maxHistorySize) {
        metrics.performanceHistory.shift();
      }

      const totalTime = metrics.performanceHistory.reduce(
        (sum, point) => sum + point.responseTime,
        0
      );
      metrics.avgResponseTime = totalTime / metrics.performanceHistory.length;
    }

    if (health.status === 'unhealthy') {
      metrics.errors.push({
        timestamp: health.lastChecked,
        message: health.error || 'Health check failed',
        statusCode: health.statusCode,
        url: health.url,
      });

      if (metrics.errors.length > this.maxHistorySize) {
        metrics.errors.shift();
      }
    }

    const successfulChecks = metrics.performanceHistory.filter(
      point => point.statusCode >= 200 && point.statusCode < 300
    ).length;
    metrics.uptime = (successfulChecks / metrics.totalRequests) * 100;
    metrics.errorRate = (metrics.errors.length / metrics.totalRequests) * 100;
  }

  getHealth(serviceId: string): ServiceHealth | undefined {
    return this.healthStatus.get(serviceId);
  }

  getMetrics(serviceId: string): ServiceMetrics | undefined {
    return this.metrics.get(serviceId);
  }

  getMonitoredServices(): string[] {
    return Array.from(this.monitors.keys());
  }

  isMonitoring(serviceId: string): boolean {
    return this.monitors.has(serviceId);
  }

  clearMetrics(serviceId: string): void {
    this.metrics.delete(serviceId);
    this.healthStatus.delete(serviceId);
  }
}
