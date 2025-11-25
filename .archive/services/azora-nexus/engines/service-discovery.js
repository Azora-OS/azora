class ServiceDiscovery {
  constructor() {
    this.services = new Map();
    this.healthCheckInterval = 30000;
  }

  register(serviceName, config) {
    const service = {
      name: serviceName,
      host: config.host,
      port: config.port,
      status: 'healthy',
      registeredAt: new Date(),
      lastHealthCheck: new Date(),
      metadata: config.metadata || {}
    };

    this.services.set(serviceName, service);
    return service;
  }

  deregister(serviceName) {
    return this.services.delete(serviceName);
  }

  getService(serviceName) {
    return this.services.get(serviceName);
  }

  getAllServices() {
    return Array.from(this.services.values());
  }

  getHealthyServices() {
    return this.getAllServices().filter(s => s.status === 'healthy');
  }

  updateHealth(serviceName, status) {
    const service = this.services.get(serviceName);
    if (service) {
      service.status = status;
      service.lastHealthCheck = new Date();
    }
    return service;
  }

  async healthCheck(serviceName) {
    const service = this.services.get(serviceName);
    if (!service) return { healthy: false, reason: 'Service not found' };

    try {
      const url = `http://${service.host}:${service.port}/health`;
      const response = await fetch(url);
      const healthy = response.ok;
      
      this.updateHealth(serviceName, healthy ? 'healthy' : 'unhealthy');
      
      return { healthy, service: serviceName };
    } catch (error) {
      this.updateHealth(serviceName, 'unhealthy');
      return { healthy: false, service: serviceName, error: error.message };
    }
  }

  startHealthChecks() {
    setInterval(async () => {
      for (const serviceName of this.services.keys()) {
        await this.healthCheck(serviceName);
      }
    }, this.healthCheckInterval);
  }
}

module.exports = new ServiceDiscovery();
