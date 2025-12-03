export interface HealthCheckResult {
  serviceId: string;
  status: 'healthy' | 'unhealthy';
  uptimeSeconds?: number;
  lastCheckedAt?: string;
  error?: string;
}

export type HealthCheck = () => Promise<HealthCheckResult>;

export class HealthService {
  private checks = new Map<string, HealthCheck>();

  registerHealthCheck(serviceId: string, check: HealthCheck) {
    this.checks.set(serviceId, check);
  }

  async runChecks(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];
    for (const [id, check] of this.checks.entries()) {
      try {
        const r = await check();
        results.push(r);
      } catch (err: any) {
        results.push({ serviceId: id, status: 'unhealthy', error: err.message });
      }
    }
    return results;
  }
}
