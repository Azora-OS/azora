/**
 * Elara Orchestrator
 * 
 * Manages all system services and coordinates their operations
 */

import { ElaraCore } from '../core/elara-core';
import { ElaraLogger } from '../utils/logger';

export interface ServiceConfig {
  name: string;
  url: string;
  port: number;
  priority: number;
  healthCheckInterval: number;
  timeout: number;
}

export interface OrchestrationPlan {
  services: string[];
  sequence: string[];
  parallelGroups: string[][];
  dependencies: Map<string, string[]>;
  estimatedTime: number;
}

export class ElaraOrchestrator {

  private logger: ElaraLogger;
  private services: Map<string, ServiceConfig>;
  private healthCheckIntervals: Map<string, NodeJS.Timeout>;
  private orchestrationPlans: Map<string, OrchestrationPlan>;

  constructor(_core: ElaraCore) {
    this.logger = new ElaraLogger('ElaraOrchestrator');
    this.services = new Map();
    this.healthCheckIntervals = new Map();
    this.orchestrationPlans = new Map();
  }

  /**
   * Initialize orchestrator
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Elara Orchestrator...');

      // Register all services
      await this.registerServices();

      // Start health checks
      await this.startHealthChecks();

      // Create orchestration plans
      await this.createOrchestrationPlans();

      this.logger.info('✅ Elara Orchestrator initialized');
    } catch (error) {
      this.logger.error('Failed to initialize orchestrator:', error);
      throw error;
    }
  }

  /**
   * Register all services
   */
  private async registerServices(): Promise<void> {
    const serviceConfigs: ServiceConfig[] = [
      {
        name: 'api-gateway',
        url: 'http://localhost',
        port: 3000,
        priority: 1,
        healthCheckInterval: 30000,
        timeout: 5000,
      },
      {
        name: 'constitutional-ai',
        url: 'http://localhost',
        port: 3001,
        priority: 2,
        healthCheckInterval: 30000,
        timeout: 5000,
      },
      {
        name: 'knowledge-ocean',
        url: 'http://localhost',
        port: 3002,
        priority: 2,
        healthCheckInterval: 30000,
        timeout: 5000,
      },
      {
        name: 'ai-routing',
        url: 'http://localhost',
        port: 3003,
        priority: 2,
        healthCheckInterval: 30000,
        timeout: 5000,
      },
      {
        name: 'auth-service',
        url: 'http://localhost',
        port: 3004,
        priority: 1,
        healthCheckInterval: 30000,
        timeout: 5000,
      },
      {
        name: 'azora-education',
        url: 'http://localhost',
        port: 3005,
        priority: 3,
        healthCheckInterval: 30000,
        timeout: 5000,
      },
      {
        name: 'azora-marketplace',
        url: 'http://localhost',
        port: 3006,
        priority: 3,
        healthCheckInterval: 30000,
        timeout: 5000,
      },
      {
        name: 'azora-mint',
        url: 'http://localhost',
        port: 3007,
        priority: 3,
        healthCheckInterval: 30000,
        timeout: 5000,
      },
      {
        name: 'azora-forge',
        url: 'http://localhost',
        port: 3008,
        priority: 3,
        healthCheckInterval: 30000,
        timeout: 5000,
      },
      {
        name: 'azora-sapiens',
        url: 'http://localhost',
        port: 3009,
        priority: 3,
        healthCheckInterval: 30000,
        timeout: 5000,
      },
    ];

    for (const config of serviceConfigs) {
      this.services.set(config.name, config);
    }

    this.logger.info(`✅ Registered ${serviceConfigs.length} services`);
  }

  /**
   * Start health checks for all services
   */
  private async startHealthChecks(): Promise<void> {
    for (const [serviceName, config] of this.services) {
      const interval = setInterval(async () => {
        await this.healthCheckService(serviceName);
      }, config.healthCheckInterval);

      this.healthCheckIntervals.set(serviceName, interval);
    }

    this.logger.info('✅ Health checks started for all services');
  }

  /**
   * Health check a service
   */
  private async healthCheckService(serviceName: string): Promise<boolean> {
    try {
      const config = this.services.get(serviceName);
      if (!config) return false;

      const url = `${config.url}:${config.port}/health`;
      const response = await fetch(url, { signal: AbortSignal.timeout(config.timeout) });

      return response.ok;
    } catch (error) {
      this.logger.warn(`Health check failed for ${serviceName}`);
      return false;
    }
  }

  /**
   * Create orchestration plans
   */
  private async createOrchestrationPlans(): Promise<void> {
    // Plan for query processing
    const queryPlan: OrchestrationPlan = {
      services: ['api-gateway', 'ai-routing', 'knowledge-ocean', 'constitutional-ai'],
      sequence: ['api-gateway', 'ai-routing', 'knowledge-ocean', 'constitutional-ai'],
      parallelGroups: [
        ['api-gateway'],
        ['ai-routing'],
        ['knowledge-ocean', 'constitutional-ai'],
      ],
      dependencies: new Map([
        ['ai-routing', ['api-gateway']],
        ['knowledge-ocean', ['ai-routing']],
        ['constitutional-ai', ['knowledge-ocean']],
      ]),
      estimatedTime: 200,
    };

    this.orchestrationPlans.set('query-processing', queryPlan);

    // Plan for user management
    const userPlan: OrchestrationPlan = {
      services: ['auth-service', 'api-gateway'],
      sequence: ['auth-service', 'api-gateway'],
      parallelGroups: [['auth-service'], ['api-gateway']],
      dependencies: new Map([['api-gateway', ['auth-service']]]),
      estimatedTime: 100,
    };

    this.orchestrationPlans.set('user-management', userPlan);

    // Plan for education
    const educationPlan: OrchestrationPlan = {
      services: ['azora-education', 'azora-sapiens', 'knowledge-ocean'],
      sequence: ['azora-education', 'azora-sapiens', 'knowledge-ocean'],
      parallelGroups: [
        ['azora-education'],
        ['azora-sapiens', 'knowledge-ocean'],
      ],
      dependencies: new Map([
        ['azora-sapiens', ['azora-education']],
        ['knowledge-ocean', ['azora-education']],
      ]),
      estimatedTime: 300,
    };

    this.orchestrationPlans.set('education', educationPlan);

    this.logger.info(`✅ Created ${this.orchestrationPlans.size} orchestration plans`);
  }

  /**
   * Execute orchestration plan
   */
  async executePlan(planName: string, data: any): Promise<any> {
    try {
      const plan = this.orchestrationPlans.get(planName);
      if (!plan) {
        throw new Error(`Orchestration plan not found: ${planName}`);
      }

      this.logger.info(`Executing orchestration plan: ${planName}`);

      const results: Map<string, any> = new Map();
      const startTime = Date.now();

      // Execute services in sequence
      for (const serviceName of plan.sequence) {
        const result = await this.executeService(serviceName, data, results);
        results.set(serviceName, result);
      }

      const executionTime = Date.now() - startTime;

      return {
        plan: planName,
        results: Object.fromEntries(results),
        executionTime,
        success: true,
      };
    } catch (error) {
      this.logger.error(`Failed to execute plan ${planName}:`, error);
      throw error;
    }
  }

  /**
   * Execute a service
   */
  private async executeService(
    serviceName: string,
    data: any,
    previousResults: Map<string, any>
  ): Promise<any> {
    try {
      const config = this.services.get(serviceName);
      if (!config) {
        throw new Error(`Service not found: ${serviceName}`);
      }

      // Check service health
      const isHealthy = await this.healthCheckService(serviceName);
      if (!isHealthy) {
        throw new Error(`Service is not healthy: ${serviceName}`);
      }

      // Call service
      const url = `${config.url}:${config.port}/execute`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          previousResults: Object.fromEntries(previousResults),
        }),
        signal: AbortSignal.timeout(config.timeout),
      });

      if (!response.ok) {
        throw new Error(`Service returned error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Error executing service ${serviceName}:`, error);
      throw error;
    }
  }

  /**
   * Get orchestration status
   */
  getStatus(): any {
    const serviceStatus = new Map();

    for (const [serviceName, config] of this.services) {
      serviceStatus.set(serviceName, {
        name: serviceName,
        port: config.port,
        priority: config.priority,
        status: 'registered',
      });
    }

    return {
      services: Object.fromEntries(serviceStatus),
      plans: Array.from(this.orchestrationPlans.keys()),
      timestamp: new Date(),
    };
  }

  /**
   * Shutdown orchestrator
   */
  async shutdown(): Promise<void> {
    try {
      this.logger.info('Shutting down Elara Orchestrator...');

      // Clear health check intervals
      for (const interval of this.healthCheckIntervals.values()) {
        clearInterval(interval);
      }

      this.logger.info('✅ Elara Orchestrator shut down successfully');
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
    }
  }
}
