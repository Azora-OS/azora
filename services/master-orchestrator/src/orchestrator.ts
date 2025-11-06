/**
 * Azora OS Master Orchestrator
 * 
 * Horizon 1 Feature: Complete Service Orchestration System
 * 
 * Responsibilities:
 * - Service discovery and registration
 * - Health monitoring for all microservices
 * - Automated restart and recovery
 * - Load balancing across services
 * - Self-healing system implementation
 * - Cross-service communication patterns
 */

import { EventEmitter } from 'events';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ServiceConfig {
  id: string;
  name: string;
  type: 'core' | 'b2b' | 'infrastructure' | 'ui';
  endpoint: string;
  healthCheckPath: string;
  healthCheckInterval: number; // milliseconds
  maxRestarts: number;
  restartDelay: number; // milliseconds
  priority: number; // 1-10, higher is more critical
  dependencies: string[]; // IDs of dependent services
  metadata?: Record<string, any>;
}

export interface ServiceHealth {
  serviceId: string;
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  lastCheck: Date;
  uptime: number; // milliseconds
  restartCount: number;
  errorCount: number;
  responseTime: number; // milliseconds
  cpu?: number; // percentage
  memory?: number; // MB
}

export interface ServiceInstance {
  config: ServiceConfig;
  health: ServiceHealth;
  startTime: Date;
  process?: any; // Node process if managed locally
}

export interface LoadBalancerConfig {
  strategy: 'round-robin' | 'least-connections' | 'weighted' | 'ip-hash';
  healthCheckEnabled: boolean;
}

// ============================================================================
// SERVICE REGISTRY
// ============================================================================

export class ServiceRegistry {
  private services: Map<string, ServiceInstance> = new Map();
  private servicesByType: Map<string, Set<string>> = new Map();

  register(config: ServiceConfig): void {
    const instance: ServiceInstance = {
      config,
      health: {
        serviceId: config.id,
        status: 'unknown',
        lastCheck: new Date(),
        uptime: 0,
        restartCount: 0,
        errorCount: 0,
        responseTime: 0,
      },
      startTime: new Date(),
    };

    this.services.set(config.id, instance);

    // Index by type
    if (!this.servicesByType.has(config.type)) {
      this.servicesByType.set(config.type, new Set());
    }
    this.servicesByType.get(config.type)!.add(config.id);

    console.log(`[Registry] Registered service: ${config.name} (${config.id})`);
  }

  unregister(serviceId: string): void {
    const instance = this.services.get(serviceId);
    if (instance) {
      this.servicesByType.get(instance.config.type)?.delete(serviceId);
      this.services.delete(serviceId);
      console.log(`[Registry] Unregistered service: ${serviceId}`);
    }
  }

  get(serviceId: string): ServiceInstance | undefined {
    return this.services.get(serviceId);
  }

  getAll(): ServiceInstance[] {
    return Array.from(this.services.values());
  }

  getByType(type: string): ServiceInstance[] {
    const ids = this.servicesByType.get(type) || new Set();
    return Array.from(ids)
      .map(id => this.services.get(id))
      .filter((s): s is ServiceInstance => s !== undefined);
  }

  updateHealth(serviceId: string, health: Partial<ServiceHealth>): void {
    const instance = this.services.get(serviceId);
    if (instance) {
      instance.health = { ...instance.health, ...health, lastCheck: new Date() };
    }
  }
}

// ============================================================================
// HEALTH CHECK SYSTEM
// ============================================================================

export class HealthCheckSystem {
  private registry: ServiceRegistry;
  private checkIntervals: Map<string, NodeJS.Timeout> = new Map();
  private eventEmitter: EventEmitter;

  constructor(registry: ServiceRegistry, eventEmitter: EventEmitter) {
    this.registry = registry;
    this.eventEmitter = eventEmitter;
  }

  startMonitoring(serviceId: string): void {
    const instance = this.registry.get(serviceId);
    if (!instance) {
      console.error(`[HealthCheck] Service not found: ${serviceId}`);
      return;
    }

    // Clear existing interval if any
    this.stopMonitoring(serviceId);

    // Start new health check interval
    const interval = setInterval(
      () => this.checkHealth(serviceId),
      instance.config.healthCheckInterval
    );

    this.checkIntervals.set(serviceId, interval);
    console.log(`[HealthCheck] Started monitoring: ${instance.config.name}`);

    // Perform immediate health check
    this.checkHealth(serviceId);
  }

  stopMonitoring(serviceId: string): void {
    const interval = this.checkIntervals.get(serviceId);
    if (interval) {
      clearInterval(interval);
      this.checkIntervals.delete(serviceId);
      console.log(`[HealthCheck] Stopped monitoring: ${serviceId}`);
    }
  }

  async checkHealth(serviceId: string): Promise<void> {
    const instance = this.registry.get(serviceId);
    if (!instance) return;

    const startTime = Date.now();
    let status: ServiceHealth['status'] = 'unknown';
    let responseTime = 0;

    try {
      // Perform HTTP health check
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(
        `${instance.config.endpoint}${instance.config.healthCheckPath}`,
        { signal: controller.signal }
      );

      clearTimeout(timeout);
      responseTime = Date.now() - startTime;

      if (response.ok) {
        status = 'healthy';
        
        // Try to get additional metrics from response
        try {
          const data = await response.json();
          if (data.cpu !== undefined) instance.health.cpu = data.cpu;
          if (data.memory !== undefined) instance.health.memory = data.memory;
        } catch (e) {
          // Response might not be JSON, that's ok
        }
      } else if (response.status >= 500) {
        status = 'unhealthy';
      } else {
        status = 'degraded';
      }
    } catch (error: any) {
      status = 'unhealthy';
      responseTime = Date.now() - startTime;
      
      this.registry.updateHealth(serviceId, {
        errorCount: instance.health.errorCount + 1,
      });

      console.error(`[HealthCheck] Failed for ${instance.config.name}: ${error.message}`);
    }

    // Update health status
    const uptime = status === 'healthy' 
      ? Date.now() - instance.startTime.getTime()
      : instance.health.uptime;

    this.registry.updateHealth(serviceId, {
      status,
      responseTime,
      uptime,
    });

    // Emit health check event
    this.eventEmitter.emit('healthCheck', {
      serviceId,
      status,
      responseTime,
    });

    // Trigger recovery if unhealthy
    if (status === 'unhealthy') {
      this.eventEmitter.emit('serviceUnhealthy', { serviceId });
    }
  }

  stopAll(): void {
    this.checkIntervals.forEach((_, serviceId) => {
      this.stopMonitoring(serviceId);
    });
  }
}

// ============================================================================
// AUTO-RESTART & SELF-HEALING
// ============================================================================

export class SelfHealingSystem {
  private registry: ServiceRegistry;
  private eventEmitter: EventEmitter;
  private restartQueue: Map<string, NodeJS.Timeout> = new Map();

  constructor(registry: ServiceRegistry, eventEmitter: EventEmitter) {
    this.registry = registry;
    this.eventEmitter = eventEmitter;

    // Listen for unhealthy services
    this.eventEmitter.on('serviceUnhealthy', (data: { serviceId: string }) => {
      this.handleUnhealthyService(data.serviceId);
    });
  }

  private async handleUnhealthyService(serviceId: string): Promise<void> {
    const instance = this.registry.get(serviceId);
    if (!instance) return;

    const { config, health } = instance;

    // Check if we've exceeded max restarts
    if (health.restartCount >= config.maxRestarts) {
      console.error(
        `[SelfHealing] Service ${config.name} exceeded max restarts (${config.maxRestarts}). Marking as failed.`
      );
      this.eventEmitter.emit('serviceFailed', { serviceId });
      return;
    }

    // Schedule restart if not already scheduled
    if (!this.restartQueue.has(serviceId)) {
      console.log(
        `[SelfHealing] Scheduling restart for ${config.name} in ${config.restartDelay}ms...`
      );

      const timeout = setTimeout(() => {
        this.restartService(serviceId);
        this.restartQueue.delete(serviceId);
      }, config.restartDelay);

      this.restartQueue.set(serviceId, timeout);
    }
  }

  async restartService(serviceId: string): Promise<void> {
    const instance = this.registry.get(serviceId);
    if (!instance) return;

    console.log(`[SelfHealing] Restarting service: ${instance.config.name}`);

    try {
      // In a real implementation, this would actually restart the service process
      // For now, we'll simulate a restart by resetting the health status
      
      this.registry.updateHealth(serviceId, {
        status: 'unknown',
        restartCount: instance.health.restartCount + 1,
        errorCount: 0,
      });

      instance.startTime = new Date();

      // Emit restart event
      this.eventEmitter.emit('serviceRestarted', { serviceId });

      console.log(`[SelfHealing] Service restarted: ${instance.config.name}`);
    } catch (error: any) {
      console.error(
        `[SelfHealing] Failed to restart ${instance.config.name}: ${error.message}`
      );
      this.eventEmitter.emit('serviceFailed', { serviceId });
    }
  }

  cancelRestart(serviceId: string): void {
    const timeout = this.restartQueue.get(serviceId);
    if (timeout) {
      clearTimeout(timeout);
      this.restartQueue.delete(serviceId);
    }
  }
}

// ============================================================================
// LOAD BALANCER
// ============================================================================

export class LoadBalancer {
  private registry: ServiceRegistry;
  private config: LoadBalancerConfig;
  private roundRobinCounters: Map<string, number> = new Map();

  constructor(registry: ServiceRegistry, config: LoadBalancerConfig) {
    this.registry = registry;
    this.config = config;
  }

  /**
   * Get the best service instance for a given service type
   */
  getServiceInstance(serviceType: string): ServiceInstance | null {
    const instances = this.registry.getByType(serviceType);
    
    if (instances.length === 0) {
      return null;
    }

    // Filter out unhealthy services if health check is enabled
    const availableInstances = this.config.healthCheckEnabled
      ? instances.filter(i => i.health.status === 'healthy')
      : instances;

    if (availableInstances.length === 0) {
      console.warn(`[LoadBalancer] No healthy instances for type: ${serviceType}`);
      return null;
    }

    // Apply load balancing strategy
    switch (this.config.strategy) {
      case 'round-robin':
        return this.roundRobin(serviceType, availableInstances);
      case 'least-connections':
        return this.leastConnections(availableInstances);
      case 'weighted':
        return this.weighted(availableInstances);
      default:
        return availableInstances[0];
    }
  }

  private roundRobin(serviceType: string, instances: ServiceInstance[]): ServiceInstance {
    const counter = this.roundRobinCounters.get(serviceType) || 0;
    const index = counter % instances.length;
    this.roundRobinCounters.set(serviceType, counter + 1);
    return instances[index];
  }

  private leastConnections(instances: ServiceInstance[]): ServiceInstance {
    // In a real implementation, track active connections per instance
    // For now, use response time as a proxy
    return instances.reduce((best, current) =>
      current.health.responseTime < best.health.responseTime ? current : best
    );
  }

  private weighted(instances: ServiceInstance[]): ServiceInstance {
    // Use priority as weight
    const totalWeight = instances.reduce((sum, i) => sum + i.config.priority, 0);
    let random = Math.random() * totalWeight;

    for (const instance of instances) {
      random -= instance.config.priority;
      if (random <= 0) {
        return instance;
      }
    }

    return instances[instances.length - 1];
  }
}

// ============================================================================
// SERVICE DISCOVERY
// ============================================================================

export class ServiceDiscovery {
  private registry: ServiceRegistry;

  constructor(registry: ServiceRegistry) {
    this.registry = registry;
  }

  /**
   * Discover all services of a given type
   */
  discover(type: string): ServiceInstance[] {
    return this.registry.getByType(type);
  }

  /**
   * Find a specific service by ID
   */
  findById(serviceId: string): ServiceInstance | undefined {
    return this.registry.get(serviceId);
  }

  /**
   * Find services by dependency
   */
  findByDependency(dependencyId: string): ServiceInstance[] {
    return this.registry
      .getAll()
      .filter(instance => instance.config.dependencies.includes(dependencyId));
  }

  /**
   * Get service dependency tree
   */
  getDependencyTree(serviceId: string): string[] {
    const visited = new Set<string>();
    const tree: string[] = [];

    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const instance = this.registry.get(id);
      if (!instance) return;

      tree.push(id);
      instance.config.dependencies.forEach(depId => traverse(depId));
    };

    traverse(serviceId);
    return tree;
  }
}

// ============================================================================
// MASTER ORCHESTRATOR
// ============================================================================

export class MasterOrchestrator {
  private registry: ServiceRegistry;
  private healthCheck: HealthCheckSystem;
  private selfHealing: SelfHealingSystem;
  private loadBalancer: LoadBalancer;
  private discovery: ServiceDiscovery;
  private eventEmitter: EventEmitter;
  private isRunning: boolean = false;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.registry = new ServiceRegistry();
    this.healthCheck = new HealthCheckSystem(this.registry, this.eventEmitter);
    this.selfHealing = new SelfHealingSystem(this.registry, this.eventEmitter);
    this.loadBalancer = new LoadBalancer(this.registry, {
      strategy: 'round-robin',
      healthCheckEnabled: true,
    });
    this.discovery = new ServiceDiscovery(this.registry);

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.eventEmitter.on('healthCheck', (data) => {
      console.log(
        `[Orchestrator] Health check: ${data.serviceId} - ${data.status} (${data.responseTime}ms)`
      );
    });

    this.eventEmitter.on('serviceRestarted', (data) => {
      console.log(`[Orchestrator] Service restarted: ${data.serviceId}`);
    });

    this.eventEmitter.on('serviceFailed', (data) => {
      console.error(`[Orchestrator] Service failed permanently: ${data.serviceId}`);
    });
  }

  /**
   * Register a new service with the orchestrator
   */
  registerService(config: ServiceConfig): void {
    this.registry.register(config);
    if (this.isRunning) {
      this.healthCheck.startMonitoring(config.id);
    }
  }

  /**
   * Unregister a service
   */
  unregisterService(serviceId: string): void {
    this.healthCheck.stopMonitoring(serviceId);
    this.registry.unregister(serviceId);
  }

  /**
   * Start the orchestrator
   */
  start(): void {
    if (this.isRunning) {
      console.warn('[Orchestrator] Already running');
      return;
    }

    console.log('[Orchestrator] Starting...');
    this.isRunning = true;

    // Start monitoring all registered services
    this.registry.getAll().forEach(instance => {
      this.healthCheck.startMonitoring(instance.config.id);
    });

    console.log('[Orchestrator] Started successfully');
  }

  /**
   * Stop the orchestrator
   */
  stop(): void {
    if (!this.isRunning) {
      console.warn('[Orchestrator] Not running');
      return;
    }

    console.log('[Orchestrator] Stopping...');
    this.isRunning = false;

    this.healthCheck.stopAll();
    console.log('[Orchestrator] Stopped');
  }

  /**
   * Get orchestrator status
   */
  getStatus(): {
    running: boolean;
    totalServices: number;
    healthyServices: number;
    unhealthyServices: number;
    services: ServiceHealth[];
  } {
    const services = this.registry.getAll();
    const healthyCount = services.filter(s => s.health.status === 'healthy').length;
    const unhealthyCount = services.filter(s => s.health.status === 'unhealthy').length;

    return {
      running: this.isRunning,
      totalServices: services.length,
      healthyServices: healthyCount,
      unhealthyServices: unhealthyCount,
      services: services.map(s => s.health),
    };
  }

  /**
   * Get service instance via load balancer
   */
  getService(serviceType: string): ServiceInstance | null {
    return this.loadBalancer.getServiceInstance(serviceType);
  }

  /**
   * Discover services
   */
  discoverServices(type: string): ServiceInstance[] {
    return this.discovery.discover(type);
  }

  /**
   * Get event emitter for custom event handling
   */
  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default MasterOrchestrator;
