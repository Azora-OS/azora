import { logger } from './logger';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: string;
  message?: string;
}

export class HealthMonitor {
  private checks = new Map<string, HealthCheck>();
  private autoRecovery = true;

  registerCheck(name: string, checker: () => Promise<boolean>): void {
    setInterval(async () => {
      try {
        const healthy = await checker();
        this.checks.set(name, {
          name,
          status: healthy ? 'healthy' : 'degraded',
          lastCheck: new Date().toISOString()
        });
      } catch (err: any) {
        this.checks.set(name, {
          name,
          status: 'unhealthy',
          lastCheck: new Date().toISOString(),
          message: err.message
        });
        if (this.autoRecovery) {
          await this.recover(name);
        }
      }
    }, 30000);
  }

  async recover(checkName: string): Promise<void> {
    logger.warn({ checkName }, 'Attempting auto-recovery');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  getStatus(): { overall: string; checks: HealthCheck[] } {
    const checks = Array.from(this.checks.values());
    const unhealthy = checks.filter(c => c.status === 'unhealthy');
    const degraded = checks.filter(c => c.status === 'degraded');
    
    let overall = 'healthy';
    if (unhealthy.length > 0) overall = 'unhealthy';
    else if (degraded.length > 0) overall = 'degraded';

    return { overall, checks };
  }
}
