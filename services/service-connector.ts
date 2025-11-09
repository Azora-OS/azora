/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
Service Integration Connector
*/

interface ServiceEndpoint {
  name: string;
  url: string;
  port: number;
  status: 'active' | 'inactive';
}

export const SERVICE_MAP: Record<string, ServiceEndpoint> = {
  // Constitutional Governance (Task 1)
  'constitutional-court': {
    name: 'Constitutional Court',
    url: 'http://localhost:4500',
    port: 4500,
    status: 'active'
  },
  'constitutional-ai': {
    name: 'Constitutional AI Governance',
    url: 'http://localhost:4501',
    port: 4501,
    status: 'active'
  },
  'chronicle-protocol': {
    name: 'Chronicle Protocol',
    url: 'http://localhost:4400',
    port: 4400,
    status: 'active'
  },

  // Financial Services (Task 2 - Agent 2)
  'azora-mint': {
    name: 'Azora Mint',
    url: 'http://localhost:3003',
    port: 3003,
    status: 'active'
  },
  'azora-pay': {
    name: 'Azora Pay',
    url: 'http://localhost:3008',
    port: 3008,
    status: 'active'
  },
  'virtual-cards': {
    name: 'Virtual Card Service',
    url: 'http://localhost:3010',
    port: 3010,
    status: 'active'
  },

  // Education Services (Task 3 - Agent 3)
  'azora-education': {
    name: 'Azora Education',
    url: 'http://localhost:3007',
    port: 3007,
    status: 'active'
  },
  'azora-lms': {
    name: 'Azora LMS',
    url: 'http://localhost:3005',
    port: 3005,
    status: 'active'
  },

  // Marketplace & Skills (Task 4)
  'azora-forge': {
    name: 'Azora Forge',
    url: 'http://localhost:4700',
    port: 4700,
    status: 'active'
  },
  'marketplace': {
    name: 'Marketplace Service',
    url: 'http://localhost:4600',
    port: 4600,
    status: 'active'
  },
  'azora-careers': {
    name: 'Azora Careers',
    url: 'http://localhost:4800',
    port: 4800,
    status: 'active'
  },

  // Core Infrastructure
  'azora-aegis': {
    name: 'Azora Aegis',
    url: 'http://localhost:3001',
    port: 3001,
    status: 'active'
  },
  'azora-nexus': {
    name: 'Azora Nexus',
    url: 'http://localhost:3002',
    port: 3002,
    status: 'active'
  },
  'api-gateway': {
    name: 'API Gateway',
    url: 'http://localhost:4000',
    port: 4000,
    status: 'active'
  }
};

export class ServiceConnector {
  async checkService(serviceName: string): Promise<boolean> {
    const service = SERVICE_MAP[serviceName];
    if (!service) return false;

    try {
      const response = await fetch(`${service.url}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async checkAllServices(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const [name, service] of Object.entries(SERVICE_MAP)) {
      results[name] = await this.checkService(name);
    }
    
    return results;
  }

  getServiceUrl(serviceName: string): string | null {
    return SERVICE_MAP[serviceName]?.url || null;
  }

  async routeRequest(serviceName: string, path: string, options: RequestInit = {}): Promise<Response> {
    const service = SERVICE_MAP[serviceName];
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    const url = `${service.url}${path}`;
    return fetch(url, options);
  }
}

export const connector = new ServiceConnector();
export default connector;
