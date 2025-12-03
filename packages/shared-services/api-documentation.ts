/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

API DOCUMENTATION SERVICE
Generates and maintains API documentation for all services
*/

import { getServiceRegistry } from './service-registry';
import { apiEndpointIntegration } from './api-endpoint-integration';

export interface APIDocumentation {
  service: string;
  version: string;
  baseUrl: string;
  endpoints: Array<{
    path: string;
    method: string;
    description: string;
    parameters?: any[];
    responses?: any[];
    requiresAuth: boolean;
    requiredRole?: string[];
  }>;
  schemas?: any;
}

/**
 * API Documentation Service
 * Generates comprehensive API documentation
 */
export class APIDocumentationService {
  private serviceRegistry: ReturnType<typeof getServiceRegistry>;

  constructor() {
    this.serviceRegistry = getServiceRegistry();
  }

  /**
   * Generate OpenAPI/Swagger documentation for a service
   */
  async generateServiceDocumentation(serviceName: string): Promise<APIDocumentation> {
    const service = this.serviceRegistry.getService(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    const endpoints = await apiEndpointIntegration.getServiceEndpoints(serviceName);

    return {
      service: serviceName,
      version: '2.0.0',
      baseUrl: `${service.url}:${service.port}`,
      endpoints: endpoints.map(e => ({
        path: e.path,
        method: e.method,
        description: e.description,
        requiresAuth: e.requiresAuth,
        requiredRole: e.requiredRole,
      })),
    };
  }

  /**
   * Generate documentation for all services
   */
  async generateAllDocumentation(): Promise<Record<string, APIDocumentation>> {
    const services = this.serviceRegistry.getAllServices();
    const documentation: Record<string, APIDocumentation> = {};

    for (const service of services) {
      try {
        documentation[service.name] = await this.generateServiceDocumentation(service.name);
      } catch (error) {
        console.error(`Failed to generate documentation for ${service.name}:`, error);
      }
    }

    return documentation;
  }

  /**
   * Generate OpenAPI 3.0 spec
   */
  async generateOpenAPISpec(): Promise<any> {
    const docs = await this.generateAllDocumentation();

    return {
      openapi: '3.0.0',
      info: {
        title: 'Azora OS API',
        version: '2.0.0',
        description: 'Azora OS - Constitutional AI Operating System API Documentation',
      },
      servers: [
        {
          url: process.env.API_BASE_URL || 'http://localhost:4000',
          description: 'API Gateway',
        },
      ],
      paths: this.buildOpenAPIPaths(docs),
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    };
  }

  /**
   * Build OpenAPI paths from documentation
   */
  private buildOpenAPIPaths(docs: Record<string, APIDocumentation>): any {
    const paths: any = {};

    for (const [serviceName, doc] of Object.entries(docs)) {
      for (const endpoint of doc.endpoints) {
        const pathKey = `/api/${serviceName}${endpoint.path}`;
        
        if (!paths[pathKey]) {
          paths[pathKey] = {};
        }

        paths[pathKey][endpoint.method.toLowerCase()] = {
          tags: [serviceName],
          summary: endpoint.description,
          security: endpoint.requiresAuth ? [{ bearerAuth: [] }] : [],
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
            },
            '500': {
              description: 'Internal Server Error',
            },
          },
        };
      }
    }

    return paths;
  }
}

// Export singleton instance
export const apiDocumentation = new APIDocumentationService();

export default apiDocumentation;
