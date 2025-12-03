/**
 * Health Check Middleware
 * Ubuntu Philosophy: "My security ensures our freedom"
 */

import axios, { AxiosResponse } from 'axios';

interface ServiceStatus {
  name: string;
  url: string;
  status: 'healthy' | 'unhealthy';
  lastCheck: Date;
  responseTime?: number;
  error?: string;
}

export class HealthCheck {
  private services: Map<string, ServiceStatus> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startPeriodicChecks();
  }

  public addService(name: string, url: string): void {
    this.services.set(name, {
      name,
      url,
      status: 'unhealthy',
      lastCheck: new Date()
    });
  }

  public async checkService(name: string): Promise<ServiceStatus> {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }

    const startTime = Date.now();
    
    try {
      const response: AxiosResponse = await axios.get(`${service.url}/health`, {
        timeout: 5000,
        validateStatus: (status: number) => status < 500
      });
      
      service.status = 'healthy';
      service.responseTime = Date.now() - startTime;
      service.error = undefined;
    } catch (error) {
      service.status = 'unhealthy';
      service.responseTime = Date.now() - startTime;
      service.error = error instanceof Error ? error.message : 'Unknown error';
    }
    
    service.lastCheck = new Date();
    this.services.set(name, service);
    
    return service;
  }

  public async checkAllServices(): Promise<ServiceStatus[]> {
    const promises = Array.from(this.services.keys()).map(name => 
      this.checkService(name).catch(error => ({
        name,
        url: this.services.get(name)?.url || '',
        status: 'unhealthy' as const,
        lastCheck: new Date(),
        error: error.message
      }))
    );

    return Promise.all(promises);
  }

  public getServiceStatus(name: string): ServiceStatus | undefined {
    return this.services.get(name);
  }

  public getAllServiceStatuses(): ServiceStatus[] {
    return Array.from(this.services.values());
  }

  public getHealthyServices(): string[] {
    return Array.from(this.services.values())
      .filter(service => service.status === 'healthy')
      .map(service => service.name);
  }

  public getUnhealthyServices(): string[] {
    return Array.from(this.services.values())
      .filter(service => service.status === 'unhealthy')
      .map(service => service.name);
  }

  private startPeriodicChecks(): void {
    this.checkInterval = setInterval(async () => {
      await this.checkAllServices();
    }, 30000); // Check every 30 seconds
  }

  public stopPeriodicChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}
