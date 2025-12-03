// Minimal Health types used by shared services
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface OrganCapability {
  name: string;
  description?: string;
}

export interface HealthCheckResult {
  service: string;
  status: HealthStatus;
  timestamp: Date;
}

export default HealthStatus;
