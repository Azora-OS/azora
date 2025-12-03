interface ServiceHealth {
  id: string;
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: number;
  failCount: number;
}

class FaultTolerantSystem {
  private services = new Map<string, ServiceHealth>();
  private replicas = new Map<string, string[]>();
  private circuitBreakers = new Map<string, { open: boolean; failures: number; lastFail: number }>();

  registerService(id: string, replicaIds: string[] = []): void {
    this.services.set(id, { id, status: 'healthy', lastCheck: Date.now(), failCount: 0 });
    this.replicas.set(id, replicaIds);
    this.circuitBreakers.set(id, { open: false, failures: 0, lastFail: 0 });
  }

  async call<T>(serviceId: string, fn: () => Promise<T>): Promise<T> {
    const breaker = this.circuitBreakers.get(serviceId);
    
    if (breaker?.open) {
      if (Date.now() - breaker.lastFail > 30000) {
        breaker.open = false;
        breaker.failures = 0;
      } else {
        return this.fallback(serviceId, fn);
      }
    }

    try {
      const result = await Promise.race([fn(), this.timeout(5000)]);
      this.markHealthy(serviceId);
      return result;
    } catch (error) {
      this.markFailed(serviceId);
      return this.fallback(serviceId, fn);
    }
  }

  private async fallback<T>(serviceId: string, fn: () => Promise<T>): Promise<T> {
    const replicaIds = this.replicas.get(serviceId) || [];
    
    for (const replicaId of replicaIds) {
      const replica = this.services.get(replicaId);
      if (replica?.status === 'healthy') {
        try {
          return await fn();
        } catch {}
      }
    }
    
    throw new Error(`All replicas failed for ${serviceId}`);
  }

  private markHealthy(id: string): void {
    const service = this.services.get(id);
    if (service) {
      service.status = 'healthy';
      service.failCount = 0;
      service.lastCheck = Date.now();
    }
    const breaker = this.circuitBreakers.get(id);
    if (breaker) {breaker.failures = 0;}
  }

  private markFailed(id: string): void {
    const service = this.services.get(id);
    const breaker = this.circuitBreakers.get(id);
    
    if (service) {
      service.failCount++;
      service.lastCheck = Date.now();
      service.status = service.failCount > 3 ? 'down' : 'degraded';
    }
    
    if (breaker) {
      breaker.failures++;
      breaker.lastFail = Date.now();
      if (breaker.failures >= 5) {breaker.open = true;}
    }
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));
  }

  getSystemHealth(): number {
    const services = Array.from(this.services.values());
    const healthy = services.filter(s => s.status === 'healthy').length;
    return services.length ? (healthy / services.length) * 100 : 100;
  }
}

export const faultTolerance = new FaultTolerantSystem();
