/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

API GATEWAY INTEGRATION WITH SERVICE REGISTRY
Connects API Gateway to real service registry for dynamic routing
*/

import { getServiceRegistry, ServiceRegistry } from '@azora/shared-services/service-registry';

/**
 * API Gateway Service Registry Integration
 * Replaces static service registry with dynamic one
 */
export class APIGatewayServiceRegistry {
  private serviceRegistry: ServiceRegistry;

  constructor() {
    this.serviceRegistry = getServiceRegistry();
  }

  /**
   * Get service URL (replaces static getServiceUrl)
   */
  getServiceUrl(serviceName: string): string | null {
    return this.serviceRegistry.getServiceUrl(serviceName);
  }

  /**
   * Get service status
   */
  getServiceStatus(): {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
    services: Array<{
      name: string;
      url: string;
      health: string;
    }>;
  } {
    const status = this.serviceRegistry.getStatus();
    return {
      total: status.total,
      healthy: status.healthy,
      degraded: status.degraded,
      unhealthy: status.unhealthy,
      services: status.services.map(s => ({
        name: s.name,
        url: `${s.url}:${s.port}`,
        health: s.health,
      })),
    };
  }

  /**
   * Check if service is available
   */
  isServiceAvailable(serviceName: string): boolean {
    const service = this.serviceRegistry.getService(serviceName);
    return service ? service.health === 'healthy' || service.health === 'degraded' : false;
  }

  /**
   * Get healthy services
   */
  getHealthyServices(): string[] {
    return this.serviceRegistry.getHealthyServices().map(s => s.name);
  }
}

// Export singleton for API Gateway
export const apiGatewayServiceRegistry = new APIGatewayServiceRegistry();

export default apiGatewayServiceRegistry;
