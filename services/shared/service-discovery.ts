/**
 * Service Discovery and Registry
 * Ubuntu Philosophy: "My security ensures our freedom"
 */

import EventEmitter from 'events';
import axios from 'axios';

export interface ServiceInstance {
  id: string;
  name: string;
  host: string;
  port: number;
  protocol: 'http' | 'https';
  health: 'healthy' | 'unhealthy' | 'unknown';
  lastHealthCheck: Date;
  metadata: Record<string, any>;
  ubuntu: string;
}

export interface ServiceRegistry {
  [serviceName: string]: ServiceInstance[];
}

export class ServiceDiscovery extends EventEmitter {
  private registry: ServiceRegistry = {};
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

  constructor() {
    super();
    this.startHealthChecks();
  }

  /**
   * Register a new service instance
   */
  public registerService(service: Omit<ServiceInstance, 'health' | 'lastHealthCheck' | 'ubuntu'>): void {
    const serviceInstance: ServiceInstance = {
      ...service,
      health: 'unknown',
      lastHealthCheck: new Date(),
      ubuntu: 'My security ensures our freedom'
    };

    if (!this.registry[service.name]) {
      this.registry[service.name] = [];
    }

    // Check if service instance already exists
    const existingIndex = this.registry[service.name].findIndex(
      s => s.id === service.id || (s.host === service.host && s.port === service.port)
    );

    if (existingIndex >= 0) {
      this.registry[service.name][existingIndex] = serviceInstance;
    } else {
      this.registry[service.name].push(serviceInstance);
    }

    this.emit('service:registered', serviceInstance);
    console.log(`🔗 Service registered: ${service.name} at ${service.host}:${service.port}`);
  }

  /**
   * Unregister a service instance
   */
  public unregisterService(serviceName: string, serviceId: string): boolean {
    if (!this.registry[serviceName]) {
      return false;
    }

    const initialLength = this.registry[serviceName].length;
    this.registry[serviceName] = this.registry[serviceName].filter(
      service => service.id !== serviceId
    );

    if (this.registry[serviceName].length === 0) {
      delete this.registry[serviceName];
    }

    const removed = initialLength > this.registry[serviceName].length;
    if (removed) {
      this.emit('service:unregistered', { serviceName, serviceId });
      console.log(`🔌 Service unregistered: ${serviceName} (${serviceId})`);
    }

    return removed;
  }

  /**
   * Get all instances of a service
   */
  public getServiceInstances(serviceName: string): ServiceInstance[] {
    return this.registry[serviceName] || [];
  }

  /**
   * Get healthy instances of a service
   */
  public getHealthyInstances(serviceName: string): ServiceInstance[] {
    return this.getServiceInstances(serviceName).filter(
      service => service.health === 'healthy'
    );
  }

  /**
   * Get a random healthy instance (load balancing)
   */
  public getRandomHealthyInstance(serviceName: string): ServiceInstance | null {
    const healthyInstances = this.getHealthyInstances(serviceName);
    
    if (healthyInstances.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * healthyInstances.length);
    return healthyInstances[randomIndex];
  }

  /**
   * Get service URL for a healthy instance
   */
  public getServiceUrl(serviceName: string): string | null {
    const instance = this.getRandomHealthyInstance(serviceName);
    
    if (!instance) {
      return null;
    }

    return `${instance.protocol}://${instance.host}:${instance.port}`;
  }

  /**
   * Get all registered services
   */
  public getAllServices(): string[] {
    return Object.keys(this.registry);
  }

  /**
   * Get full registry
   */
  public getRegistry(): ServiceRegistry {
    return { ...this.registry };
  }

  /**
   * Check health of a specific service instance
   */
  private async checkServiceHealth(instance: ServiceInstance): Promise<boolean> {
    try {
      const healthUrl = `${instance.protocol}://${instance.host}:${instance.port}/health`;
      const response = await axios.get(healthUrl, {
        timeout: 5000,
        validateStatus: (status: number) => status < 500
      });

      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Perform health check on all services
   */
  private async performHealthChecks(): Promise<void> {
    const serviceNames = this.getAllServices();
    
    for (const serviceName of serviceNames) {
      const instances = this.getServiceInstances(serviceName);
      
      for (const instance of instances) {
        const isHealthy = await this.checkServiceHealth(instance);
        const previousHealth = instance.health;
        
        instance.health = isHealthy ? 'healthy' : 'unhealthy';
        instance.lastHealthCheck = new Date();

        // Emit health change events
        if (previousHealth !== instance.health) {
          this.emit('service:health:changed', {
            serviceName,
            instance,
            previousHealth,
            currentHealth: instance.health
          });

          if (instance.health === 'healthy') {
            console.log(`✅ Service healthy: ${serviceName} at ${instance.host}:${instance.port}`);
          } else {
            console.log(`❌ Service unhealthy: ${serviceName} at ${instance.host}:${instance.port}`);
          }
        }
      }
    }
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks().catch(error => {
        console.error('Health check error:', error);
      });
    }, this.HEALTH_CHECK_INTERVAL);
  }

  /**
   * Stop periodic health checks
   */
  public stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Get service statistics
   */
  public getServiceStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const serviceName of this.getAllServices()) {
      const instances = this.getServiceInstances(serviceName);
      const healthy = instances.filter(s => s.health === 'healthy').length;
      const unhealthy = instances.filter(s => s.health === 'unhealthy').length;
      const unknown = instances.filter(s => s.health === 'unknown').length;

      stats[serviceName] = {
        total: instances.length,
        healthy,
        unhealthy,
        unknown,
        ubuntu: 'My security ensures our freedom'
      };
    }

    return stats;
  }

  /**
   * Auto-register services from environment variables
   */
  public autoRegisterServices(): void {
    const serviceMappings = [
      { name: 'auth', envVar: 'AUTH_SERVICE_URL', defaultPort: 4001 },
      { name: 'user', envVar: 'USER_SERVICE_URL', defaultPort: 3002 },
      { name: 'education', envVar: 'EDUCATION_SERVICE_URL', defaultPort: 3003 },
      { name: 'blockchain', envVar: 'BLOCKCHAIN_SERVICE_URL', defaultPort: 3029 },
      { name: 'citadel-fund', envVar: 'CITADEL_FUND_URL', defaultPort: 3030 },
      { name: 'proof-of-value', envVar: 'PROOF_OF_VALUE_URL', defaultPort: 3031 },
      { name: 'treasury', envVar: 'TREASURY_SERVICE_URL', defaultPort: 3028 },
      { name: 'pay', envVar: 'PAY_SERVICE_URL', defaultPort: 3018 },
      { name: 'mint', envVar: 'MINT_SERVICE_URL', defaultPort: 3010 },
      { name: 'marketplace', envVar: 'MARKETPLACE_SERVICE_URL', defaultPort: 3004 }
    ];

    for (const service of serviceMappings) {
      const serviceUrl = process.env[service.envVar];
      
      if (serviceUrl) {
        try {
          const url = new URL(serviceUrl);
          this.registerService({
            id: `${service.name}-${url.hostname}-${url.port}`,
            name: service.name,
            host: url.hostname,
            port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
            protocol: url.protocol.slice(0, -1) as 'http' | 'https',
            metadata: {
              registeredFrom: 'environment',
              envVar: service.envVar
            }
          });
        } catch (error) {
          console.warn(`Invalid service URL for ${service.name}: ${serviceUrl}`);
        }
      } else {
        // Register default localhost service for development
        if (process.env.NODE_ENV !== 'production') {
          this.registerService({
            id: `${service.name}-localhost-${service.defaultPort}`,
            name: service.name,
            host: 'localhost',
            port: service.defaultPort,
            protocol: 'http',
            metadata: {
              registeredFrom: 'default',
              envVar: service.envVar
            }
          });
        }
      }
    }
  }

  /**
   * Cleanup on shutdown
   */
  public shutdown(): void {
    this.stopHealthChecks();
    this.removeAllListeners();
    console.log('🔌 Service discovery shutdown complete');
  }
}

// Singleton instance
export const serviceDiscovery = new ServiceDiscovery();

// Auto-register services on startup
serviceDiscovery.autoRegisterServices();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  serviceDiscovery.shutdown();
  process.exit(0);
});

process.on('SIGINT', () => {
  serviceDiscovery.shutdown();
  process.exit(0);
});

export default serviceDiscovery;
