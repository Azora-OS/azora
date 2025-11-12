/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

SERVICE REGISTRY - REAL SERVICE DISCOVERY
Discovers and manages real services (no placeholders)
*/

import { EventEmitter } from 'events';

export interface ServiceInfo {
  name: string;
  url: string;
  port: number;
  health: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastHealthCheck?: Date;
  metadata?: {
    version?: string;
    description?: string;
    capabilities?: string[];
  };
}

export interface ServiceRegistryConfig {
  services: Array<{
    name: string;
    url: string;
    port: number;
    metadata?: ServiceInfo['metadata'];
  }>;
  healthCheckInterval?: number; // milliseconds
}

/**
 * Service Registry - Real service discovery and management
 */
export class ServiceRegistry extends EventEmitter {
  private services: Map<string, ServiceInfo> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private config: ServiceRegistryConfig;

  constructor(config: ServiceRegistryConfig) {
    super();
    this.config = config;
    this.initializeServices();
  }

  /**
   * Initialize services from config
   */
  private initializeServices(): void {
    for (const serviceConfig of this.config.services) {
      this.registerService({
        name: serviceConfig.name,
        url: serviceConfig.url,
        port: serviceConfig.port,
        health: 'unknown',
        metadata: serviceConfig.metadata,
      });
    }
  }

  /**
   * Register a service
   */
  registerService(service: ServiceInfo): void {
    this.services.set(service.name, service);
    this.emit('service-registered', service);
    console.log(`📦 Service registered: ${service.name} at ${service.url}:${service.port}`);
  }

  /**
   * Get service by name
   */
  getService(name: string): ServiceInfo | undefined {
    return this.services.get(name);
  }

  /**
   * Get service URL
   */
  getServiceUrl(name: string): string | null {
    const service = this.services.get(name);
    return service ? `${service.url}:${service.port}` : null;
  }

  /**
   * Get all services
   */
  getAllServices(): ServiceInfo[] {
    return Array.from(this.services.values());
  }

  /**
   * Get healthy services
   */
  getHealthyServices(): ServiceInfo[] {
    return this.getAllServices().filter(s => s.health === 'healthy');
  }

  /**
   * Check service health
   */
  async checkServiceHealth(name: string): Promise<'healthy' | 'degraded' | 'unhealthy'> {
    const service = this.services.get(name);
    if (!service) {
      return 'unhealthy';
    }

    try {
      const start = Date.now();
      const response = await fetch(`${service.url}:${service.port}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      const latency = Date.now() - start;
      const data = await response.json();

      if (response.ok && data.status === 'ok' || data.status === 'healthy') {
        service.health = latency < 500 ? 'healthy' : 'degraded';
        service.lastHealthCheck = new Date();
        this.emit('service-health-updated', { name, health: service.health, latency });
        return service.health;
      } else {
        service.health = 'unhealthy';
        service.lastHealthCheck = new Date();
        this.emit('service-health-updated', { name, health: service.health });
        return 'unhealthy';
      }
    } catch (error) {
      service.health = 'unhealthy';
      service.lastHealthCheck = new Date();
      this.emit('service-health-updated', { name, health: 'unhealthy', error: (error as Error).message });
      return 'unhealthy';
    }
  }

  /**
   * Check all services health
   */
  async checkAllServicesHealth(): Promise<void> {
    const promises = Array.from(this.services.keys()).map(name => 
      this.checkServiceHealth(name)
    );
    await Promise.all(promises);
  }

  /**
   * Start health check monitoring
   */
  startHealthMonitoring(intervalMs: number = 30000): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Initial check
    this.checkAllServicesHealth();

    // Periodic checks
    this.healthCheckInterval = setInterval(() => {
      this.checkAllServicesHealth();
    }, intervalMs);

    console.log(`🏥 Health monitoring started (interval: ${intervalMs}ms)`);
  }

  /**
   * Stop health check monitoring
   */
  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('🏥 Health monitoring stopped');
    }
  }

  /**
   * Get service status summary
   */
  getStatus(): {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
    services: ServiceInfo[];
  } {
    const services = this.getAllServices();
    return {
      total: services.length,
      healthy: services.filter(s => s.health === 'healthy').length,
      degraded: services.filter(s => s.health === 'degraded').length,
      unhealthy: services.filter(s => s.health === 'unhealthy').length,
      services,
    };
  }
}

// Default service registry configuration
export const defaultServiceRegistryConfig: ServiceRegistryConfig = {
  services: [
    // Core Services
    { name: 'api-gateway', url: 'http://localhost', port: 4000 },
    { name: 'auth-service', url: 'http://localhost', port: 3001 },
    { name: 'session-service', url: 'http://localhost', port: 8081 },
    
    // Data Services
    { name: 'database', url: 'http://localhost', port: 5432 },
    { name: 'redis', url: 'http://localhost', port: 6379 },
    
    // Business Services
    { name: 'retail-ai-service', url: 'http://localhost', port: 4001 },
    { name: 'lms-service', url: 'http://localhost', port: 3003 },
    { name: 'education-service', url: 'http://localhost', port: 3007 },
    
    // Financial Services
    { name: 'mint-service', url: 'http://localhost', port: 3002 },
    { name: 'payments-service', url: 'http://localhost', port: 3008 },
    
    // Infrastructure Services
    { name: 'azora-nexus', url: 'http://localhost', port: 3006 },
    { name: 'chronicle-protocol', url: 'http://localhost', port: 4400 },
    
    // Constitutional Services
    { name: 'constitutional-court', url: 'http://localhost', port: 4500 },
    { name: 'constitutional-ai', url: 'http://localhost', port: 4501 },
  ],
  healthCheckInterval: 30000, // 30 seconds
};

// Export singleton instance
let serviceRegistryInstance: ServiceRegistry | null = null;

export function getServiceRegistry(config?: ServiceRegistryConfig): ServiceRegistry {
  if (!serviceRegistryInstance) {
    serviceRegistryInstance = new ServiceRegistry(config || defaultServiceRegistryConfig);
  }
  return serviceRegistryInstance;
}

export default ServiceRegistry;
