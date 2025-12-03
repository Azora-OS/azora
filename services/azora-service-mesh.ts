import { EventBus } from './azora-event-bus';

interface ServiceMetrics {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  errorRate: number;
  requestCount: number;
  lastCheck: Date;
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
}

class ServiceMesh {
  private services: Map<string, ServiceMetrics> = new Map();
  private eventBus: EventBus;
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private healthCheckInterval: NodeJS.Timer | null = null;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  registerService(name: string) {
    this.services.set(name, {
      name,
      status: 'healthy',
      responseTime: 0,
      errorRate: 0,
      requestCount: 0,
      lastCheck: new Date()
    });

    this.circuitBreakers.set(name, {
      state: 'closed',
      failureCount: 0,
      successCount: 0,
      lastFailureTime: null
    });
  }

  async recordRequest(serviceName: string, duration: number, success: boolean) {
    const metrics = this.services.get(serviceName);
    if (!metrics) return;

    metrics.requestCount++;
    metrics.responseTime = (metrics.responseTime + duration) / 2;
    metrics.errorRate = success ? metrics.errorRate * 0.99 : Math.min(1, metrics.errorRate + 0.01);
    metrics.lastCheck = new Date();

    this.updateCircuitBreaker(serviceName, success);
    this.updateServiceStatus(serviceName);

    await this.eventBus.publish('service-metric', {
      service: serviceName,
      duration,
      success,
      metrics
    });
  }

  private updateCircuitBreaker(serviceName: string, success: boolean) {
    const cb = this.circuitBreakers.get(serviceName);
    if (!cb) return;

    if (success) {
      cb.successCount++;
      if (cb.state === 'half-open' && cb.successCount >= 3) {
        cb.state = 'closed';
        cb.failureCount = 0;
        cb.successCount = 0;
      }
    } else {
      cb.failureCount++;
      cb.lastFailureTime = new Date();
      if (cb.failureCount >= 5) {
        cb.state = 'open';
      }
    }
  }

  private updateServiceStatus(serviceName: string) {
    const metrics = this.services.get(serviceName);
    if (!metrics) return;

    if (metrics.errorRate > 0.5) {
      metrics.status = 'down';
    } else if (metrics.errorRate > 0.1) {
      metrics.status = 'degraded';
    } else {
      metrics.status = 'healthy';
    }
  }

  canCallService(serviceName: string): boolean {
    const cb = this.circuitBreakers.get(serviceName);
    if (!cb) return true;

    if (cb.state === 'open') {
      const timeSinceFailure = Date.now() - (cb.lastFailureTime?.getTime() || 0);
      if (timeSinceFailure > 30000) {
        cb.state = 'half-open';
        cb.failureCount = 0;
        return true;
      }
      return false;
    }

    return true;
  }

  startHealthChecks(interval: number = 30000) {
    this.healthCheckInterval = setInterval(async () => {
      for (const [name] of this.services) {
        await this.eventBus.publish('health-check-request', { service: name });
      }
    }, interval);
  }

  stopHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }

  getMetrics(serviceName?: string) {
    if (serviceName) {
      return this.services.get(serviceName);
    }
    return Array.from(this.services.values());
  }

  getCircuitBreakerStatus(serviceName?: string) {
    if (serviceName) {
      return this.circuitBreakers.get(serviceName);
    }
    return Object.fromEntries(this.circuitBreakers);
  }
}

interface CircuitBreakerState {
  state: 'open' | 'closed' | 'half-open';
  failureCount: number;
  successCount: number;
  lastFailureTime: Date | null;
}

export { ServiceMesh, ServiceMetrics, CircuitBreakerConfig };
