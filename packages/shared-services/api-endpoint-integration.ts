/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

API ENDPOINT INTEGRATION SERVICE
Ensures all services expose consistent API endpoints for design system integration
*/

import { getServiceRegistry } from '@azora/shared-services/service-registry';

export interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  requiresAuth: boolean;
  requiredRole?: string[];
}

/**
 * API Endpoint Integration Service
 * Ensures consistent API structure across all services
 */
export class APIEndpointIntegrationService {
  private serviceRegistry: ReturnType<typeof getServiceRegistry>;

  constructor() {
    this.serviceRegistry = getServiceRegistry();
  }

  /**
   * Register API endpoint for a service
   */
  async registerEndpoint(
    serviceName: string,
    endpoint: APIEndpoint
  ): Promise<void> {
    // Emit event for endpoint registration
    const { eventBus } = await import('@azora/shared-services/event-bus');
    await eventBus.publish('api.endpoint.registered', {
      service: serviceName,
      endpoint: endpoint.path,
      method: endpoint.method,
      requiresAuth: endpoint.requiresAuth,
      requiredRole: endpoint.requiredRole,
    });
  }

  /**
   * Get all endpoints for a service
   */
  async getServiceEndpoints(serviceName: string): Promise<APIEndpoint[]> {
    // In production, this would query a service registry or API documentation
    // For now, return standard endpoints
    const standardEndpoints: APIEndpoint[] = [
      {
        path: '/health',
        method: 'GET',
        description: 'Health check endpoint',
        requiresAuth: false,
      },
      {
        path: '/metrics',
        method: 'GET',
        description: 'Prometheus metrics endpoint',
        requiresAuth: false,
      },
    ];

    return standardEndpoints;
  }

  /**
   * Validate endpoint availability
   */
  async validateEndpoint(
    serviceName: string,
    endpoint: string,
    method: string = 'GET'
  ): Promise<boolean> {
    const service = this.serviceRegistry.getService(serviceName);
    if (!service || service.health !== 'healthy') {
      return false;
    }

    try {
      const url = `${service.url}:${service.port}${endpoint}`;
      const response = await fetch(url, {
        method,
        signal: AbortSignal.timeout(5000),
      });
      return response.ok || response.status === 401; // 401 means endpoint exists but needs auth
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const apiEndpointIntegration = new APIEndpointIntegrationService();

export default apiEndpointIntegration;
