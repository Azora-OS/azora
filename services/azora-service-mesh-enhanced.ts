import { EventBus } from './azora-event-bus';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

interface ServiceMetrics {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  errorRate: number;
  requestCount: number;
  successCount: number;
  lastCheck: Date;
  endpoint: string;
  version: string;
  dependencies: string[];
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  monitoringPeriod: number;
}

interface CircuitBreakerState {
  state: 'open' | 'closed' | 'half-open';
  failureCount: number;
  successCount: number;
  lastFailureTime: Date | null;
  lastSuccessTime: Date | null;
  totalRequests: number;
  totalFailures: number;
}

interface ServiceRegistry {
  name: string;
  endpoint: string;
  version: string;
  healthEndpoint: string;
  metricsEndpoint: string;
  dependencies: string[];
  tags: string[];
  registeredAt: Date;
  lastHeartbeat: Date;
}

interface DistributedTrace {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  serviceName: string;
  operation: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'success' | 'error';
  tags: Record<string, any>;
  logs: Array<{
    timestamp: Date;
    level: string;
    message: string;
  }>;
}

interface ServiceObservability {
  metrics: ServiceMetrics;
  traces: DistributedTrace[];
  alerts: Alert[];
  dependencies: DependencyGraph;
}

interface Alert {
  id: string;
  serviceName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

interface DependencyGraph {
  nodes: Map<string, ServiceNode>;
  edges: Map<string, DependencyEdge>;
}

interface ServiceNode {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  version: string;
  endpoint: string;
  metrics: ServiceMetrics;
}

interface DependencyEdge {
  from: string;
  to: string;
  strength: number;
  latency: number;
  errorRate: number;
}

class EnhancedServiceMesh {
  private services: Map<string, ServiceMetrics> = new Map();
  private serviceRegistry: Map<string, ServiceRegistry> = new Map();
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private traces: Map<string, DistributedTrace[]> = new Map();
  private alerts: Map<string, Alert[]> = new Map();
  private dependencyGraph: DependencyGraph = {
    nodes: new Map(),
    edges: new Map()
  };
  
  private eventBus: EventBus;
  private healthCheckInterval: NodeJS.Timer | null = null;
  private metricsCollectionInterval: NodeJS.Timer | null = null;
  private alertEvaluationInterval: NodeJS.Timer | null = null;
  
  // Ubuntu-inspired observability metrics
  private ubuntuMetrics = {
    collectiveHealth: 100,
    harmonyIndex: 1.0,
    prosperityScore: 0,
    communityTrust: 1.0
  };

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.setupEventListeners();
  }

  // ========== SERVICE REGISTRATION ==========

  registerService(service: ServiceRegistry) {
    this.serviceRegistry.set(service.name, service);
    
    // Initialize service metrics
    this.services.set(service.name, {
      name: service.name,
      status: 'healthy',
      responseTime: 0,
      errorRate: 0,
      requestCount: 0,
      successCount: 0,
      lastCheck: new Date(),
      endpoint: service.endpoint,
      version: service.version,
      dependencies: service.dependencies,
      uptime: 0,
      memoryUsage: 0,
      cpuUsage: 0
    });

    // Initialize circuit breaker
    this.circuitBreakers.set(service.name, {
      state: 'closed',
      failureCount: 0,
      successCount: 0,
      lastFailureTime: null,
      lastSuccessTime: null,
      totalRequests: 0,
      totalFailures: 0
    });

    // Add to dependency graph
    this.dependencyGraph.nodes.set(service.name, {
      name: service.name,
      status: 'healthy',
      version: service.version,
      endpoint: service.endpoint,
      metrics: this.services.get(service.name)!
    });

    // Log service registration
    this.logServiceEvent('SERVICE_REGISTERED', service.name, {
      endpoint: service.endpoint,
      version: service.version,
      dependencies: service.dependencies
    });

    console.log(`🔗 Service registered: ${service.name} at ${service.endpoint}`);
  }

  unregisterService(serviceName: string) {
    this.serviceRegistry.delete(serviceName);
    this.services.delete(serviceName);
    this.circuitBreakers.delete(serviceName);
    this.dependencyGraph.nodes.delete(serviceName);
    
    this.logServiceEvent('SERVICE_UNREGISTERED', serviceName);
    console.log(`❌ Service unregistered: ${serviceName}`);
  }

  // ========== INTER-SERVICE COMMUNICATION ==========

  async callService<T = any>(
    serviceName: string,
    path: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      data?: any;
      headers?: Record<string, string>;
      timeout?: number;
      retries?: number;
    } = {}
  ): Promise<T> {
    const traceId = this.startTrace(serviceName, path, options.method || 'GET');
    const startTime = Date.now();

    try {
      // Check circuit breaker
      if (!this.canCallService(serviceName)) {
        throw new Error(`Circuit breaker open for service: ${serviceName}`);
      }

      const service = this.serviceRegistry.get(serviceName);
      if (!service) {
        throw new Error(`Service not found: ${serviceName}`);
      }

      const url = `${service.endpoint}${path}`;
      const config = {
        method: options.method,
        data: options.data,
        headers: {
          'Content-Type': 'application/json',
          'X-Trace-Id': traceId,
          'X-Request-Id': uuidv4(),
          ...options.headers
        },
        timeout: options.timeout || 30000,
        retries: options.retries || 3
      };

      // Make the request with retry logic
      const response = await this.makeRequestWithRetry(url, config);
      
      const duration = Date.now() - startTime;
      await this.recordRequest(serviceName, duration, true, traceId);
      
      return response.data;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      await this.recordRequest(serviceName, duration, false, traceId);
      
      this.endTrace(traceId, 'error', {
        error: error.message,
        stack: error.stack
      });
      
      throw error;
    }
  }

  private async makeRequestWithRetry(url: string, config: any, attempt = 1): Promise<any> {
    try {
      const response = await axios(url, config);
      return response;
    } catch (error: any) {
      if (attempt < config.retries && this.isRetryableError(error)) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequestWithRetry(url, config, attempt + 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: any): boolean {
    return error.code === 'ECONNRESET' || 
           error.code === 'ENOTFOUND' || 
           error.response?.status >= 500;
  }

  // ========== TRACING AND OBSERVABILITY ==========

  startTrace(serviceName: string, operation: string, method: string): string {
    const traceId = uuidv4();
    const spanId = uuidv4();
    
    const trace: DistributedTrace = {
      traceId,
      spanId,
      serviceName,
      operation: `${method} ${operation}`,
      startTime: new Date(),
      status: 'success',
      tags: {
        method,
        operation,
        ubuntu_trace: 'Ubuntu inter-service communication'
      },
      logs: []
    };

    if (!this.traces.has(traceId)) {
      this.traces.set(traceId, []);
    }
    this.traces.get(traceId)!.push(trace);

    return traceId;
  }

  endTrace(traceId: string, status: 'success' | 'error', tags?: Record<string, any>) {
    const traces = this.traces.get(traceId);
    if (!traces) return;

    const currentTrace = traces[traces.length - 1];
    currentTrace.endTime = new Date();
    currentTrace.duration = currentTrace.endTime.getTime() - currentTrace.startTime.getTime();
    currentTrace.status = status;
    
    if (tags) {
      currentTrace.tags = { ...currentTrace.tags, ...tags };
    }

    // Publish trace event
    this.eventBus.publish('trace-completed', {
      traceId,
      trace: currentTrace
    });
  }

  getTraces(traceId?: string, serviceName?: string, limit = 100): DistributedTrace[] {
    let allTraces: DistributedTrace[] = [];
    
    if (traceId) {
      allTraces = this.traces.get(traceId) || [];
    } else {
      for (const traces of this.traces.values()) {
        allTraces.push(...traces);
      }
      
      if (serviceName) {
        allTraces = allTraces.filter(trace => trace.serviceName === serviceName);
      }
    }

    return allTraces
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  // ========== METRICS COLLECTION ==========

  async recordRequest(serviceName: string, duration: number, success: boolean, traceId?: string) {
    const metrics = this.services.get(serviceName);
    if (!metrics) return;

    metrics.requestCount++;
    metrics.responseTime = (metrics.responseTime + duration) / 2;
    
    if (success) {
      metrics.successCount++;
      metrics.errorRate = Math.max(0, metrics.errorRate * 0.95);
    } else {
      metrics.errorRate = Math.min(1, metrics.errorRate + 0.05);
    }
    
    metrics.lastCheck = new Date();

    // Update circuit breaker
    this.updateCircuitBreaker(serviceName, success);
    
    // Update service status
    this.updateServiceStatus(serviceName);
    
    // Update dependency graph
    this.updateDependencyGraph(serviceName, duration, success);
    
    // Update Ubuntu metrics
    this.updateUbuntuMetrics();

    // Publish metrics event
    await this.eventBus.publish('service-metric', {
      service: serviceName,
      duration,
      success,
      metrics,
      traceId,
      ubuntu_harmony: this.ubuntuMetrics.harmonyIndex
    });

    // Check for alerts
    this.evaluateAlerts(serviceName);
  }

  private updateCircuitBreaker(serviceName: string, success: boolean) {
    const cb = this.circuitBreakers.get(serviceName);
    if (!cb) return;

    cb.totalRequests++;
    
    if (success) {
      cb.successCount++;
      cb.lastSuccessTime = new Date();
      
      if (cb.state === 'half-open' && cb.successCount >= 3) {
        cb.state = 'closed';
        cb.failureCount = 0;
        cb.successCount = 0;
        this.logServiceEvent('CIRCUIT_BREAKER_CLOSED', serviceName);
      }
    } else {
      cb.failureCount++;
      cb.totalFailures++;
      cb.lastFailureTime = new Date();
      
      if (cb.failureCount >= 5 && cb.state === 'closed') {
        cb.state = 'open';
        this.logServiceEvent('CIRCUIT_BREAKER_OPENED', serviceName, {
          failureCount: cb.failureCount,
          totalRequests: cb.totalRequests
        });
      }
    }
  }

  private updateServiceStatus(serviceName: string) {
    const metrics = this.services.get(serviceName);
    if (!metrics) return;

    const previousStatus = metrics.status;

    if (metrics.errorRate > 0.5 || metrics.responseTime > 5000) {
      metrics.status = 'down';
    } else if (metrics.errorRate > 0.1 || metrics.responseTime > 2000) {
      metrics.status = 'degraded';
    } else {
      metrics.status = 'healthy';
    }

    // Update dependency graph
    const node = this.dependencyGraph.nodes.get(serviceName);
    if (node) {
      node.status = metrics.status;
      node.metrics = metrics;
    }

    // Log status change
    if (previousStatus !== metrics.status) {
      this.logServiceEvent('SERVICE_STATUS_CHANGED', serviceName, {
        from: previousStatus,
        to: metrics.status,
        errorRate: metrics.errorRate,
        responseTime: metrics.responseTime
      });
    }
  }

  private updateDependencyGraph(serviceName: string, latency: number, success: boolean) {
    const service = this.serviceRegistry.get(serviceName);
    if (!service) return;

    // Update edges for dependencies
    for (const dep of service.dependencies) {
      const edgeKey = `${serviceName}-${dep}`;
      let edge = this.dependencyGraph.edges.get(edgeKey);
      
      if (!edge) {
        edge = {
          from: serviceName,
          to: dep,
          strength: 1,
          latency: 0,
          errorRate: 0
        };
        this.dependencyGraph.edges.set(edgeKey, edge);
      }

      edge.latency = (edge.latency + latency) / 2;
      edge.errorRate = success ? edge.errorRate * 0.95 : Math.min(1, edge.errorRate + 0.05);
      edge.strength = Math.max(0.1, 1 - edge.errorRate);
    }
  }

  private updateUbuntuMetrics() {
    const services = Array.from(this.services.values());
    
    if (services.length === 0) return;

    // Calculate collective health
    const healthyServices = services.filter(s => s.status === 'healthy').length;
    this.ubuntuMetrics.collectiveHealth = (healthyServices / services.length) * 100;

    // Calculate harmony index (based on error rates and response times)
    const avgErrorRate = services.reduce((sum, s) => sum + s.errorRate, 0) / services.length;
    const avgResponseTime = services.reduce((sum, s) => sum + s.responseTime, 0) / services.length;
    
    this.ubuntuMetrics.harmonyIndex = Math.max(0, 1 - (avgErrorRate * 0.5 + avgResponseTime / 10000));

    // Calculate prosperity score (based on request throughput)
    const totalRequests = services.reduce((sum, s) => sum + s.requestCount, 0);
    this.ubuntuMetrics.prosperityScore = Math.min(100, totalRequests / 1000);

    // Calculate community trust (based on circuit breaker states)
    const openCircuitBreakers = Array.from(this.circuitBreakers.values())
      .filter(cb => cb.state === 'open').length;
    this.ubuntuMetrics.communityTrust = Math.max(0, 1 - (openCircuitBreakers / services.length));
  }

  // ========== HEALTH MONITORING ==========

  canCallService(serviceName: string): boolean {
    const cb = this.circuitBreakers.get(serviceName);
    if (!cb) return true;

    if (cb.state === 'open') {
      const timeSinceFailure = Date.now() - (cb.lastFailureTime?.getTime() || 0);
      if (timeSinceFailure > 30000) {
        cb.state = 'half-open';
        cb.failureCount = 0;
        return true;
      }
      return false;
    }

    return true;
  }

  async performHealthCheck(serviceName: string): Promise<boolean> {
    const service = this.serviceRegistry.get(serviceName);
    if (!service) return false;

    try {
      const response = await axios.get(`${service.endpoint}${service.healthEndpoint}`, {
        timeout: 5000
      });
      
      const isHealthy = response.status === 200;
      await this.recordRequest(serviceName, 100, isHealthy);
      
      return isHealthy;
    } catch (error) {
      await this.recordRequest(serviceName, 5000, false);
      return false;
    }
  }

  async collectServiceMetrics(serviceName: string): Promise<void> {
    const service = this.serviceRegistry.get(serviceName);
    if (!service) return;

    try {
      const response = await axios.get(`${service.endpoint}${service.metricsEndpoint}`, {
        timeout: 5000
      });
      
      const metrics = this.services.get(serviceName);
      if (metrics && response.data) {
        metrics.memoryUsage = response.data.memoryUsage || 0;
        metrics.cpuUsage = response.data.cpuUsage || 0;
        metrics.uptime = response.data.uptime || 0;
      }
    } catch (error) {
      console.warn(`Failed to collect metrics for ${serviceName}:`, error);
    }
  }

  startHealthChecks(interval: number = 30000) {
    this.healthCheckInterval = setInterval(async () => {
      for (const [name] of this.services) {
        await this.performHealthCheck(name);
      }
    }, interval);

    this.metricsCollectionInterval = setInterval(async () => {
      for (const [name] of this.services) {
        await this.collectServiceMetrics(name);
      }
    }, interval * 2);

    this.alertEvaluationInterval = setInterval(() => {
      this.evaluateAllAlerts();
    }, interval / 2);
  }

  stopHealthChecks() {
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
    if (this.metricsCollectionInterval) clearInterval(this.metricsCollectionInterval);
    if (this.alertEvaluationInterval) clearInterval(this.alertEvaluationInterval);
  }

  // ========== ALERTING ==========

  private evaluateAlerts(serviceName: string) {
    const metrics = this.services.get(serviceName);
    if (!metrics) return;

    const alerts: Alert[] = [];

    // High error rate alert
    if (metrics.errorRate > 0.2) {
      alerts.push({
        id: uuidv4(),
        serviceName,
        severity: metrics.errorRate > 0.5 ? 'critical' : 'high',
        type: 'HIGH_ERROR_RATE',
        message: `Error rate is ${(metrics.errorRate * 100).toFixed(1)}%`,
        timestamp: new Date(),
        resolved: false
      });
    }

    // High response time alert
    if (metrics.responseTime > 3000) {
      alerts.push({
        id: uuidv4(),
        serviceName,
        severity: metrics.responseTime > 5000 ? 'critical' : 'medium',
        type: 'HIGH_RESPONSE_TIME',
        message: `Response time is ${metrics.responseTime.toFixed(0)}ms`,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Service down alert
    if (metrics.status === 'down') {
      alerts.push({
        id: uuidv4(),
        serviceName,
        severity: 'critical',
        type: 'SERVICE_DOWN',
        message: 'Service is down',
        timestamp: new Date(),
        resolved: false
      });
    }

    // Store alerts
    for (const alert of alerts) {
      if (!this.alerts.has(serviceName)) {
        this.alerts.set(serviceName, []);
      }
      this.alerts.get(serviceName)!.push(alert);

      // Publish alert event
      this.eventBus.publish('alert-fired', {
        alert,
        ubuntu_alert: 'Ubuntu community alert system'
      });
    }
  }

  private evaluateAllAlerts() {
    for (const [serviceName] of this.services) {
      this.evaluateAlerts(serviceName);
    }
  }

  getAlerts(serviceName?: string): Alert[] {
    if (serviceName) {
      return this.alerts.get(serviceName) || [];
    }

    const allAlerts: Alert[] = [];
    for (const alerts of this.alerts.values()) {
      allAlerts.push(...alerts);
    }
    return allAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  resolveAlert(alertId: string): boolean {
    for (const [serviceName, alerts] of this.alerts) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.resolved = true;
        alert.resolvedAt = new Date();
        
        this.eventBus.publish('alert-resolved', {
          alert,
          ubuntu_resolution: 'Ubuntu community issue resolved'
        });
        
        return true;
      }
    }
    return false;
  }

  // ========== DASHBOARD AND ANALYTICS ==========

  getServiceObservability(serviceName?: string): ServiceObservability | Map<string, ServiceObservability> {
    if (serviceName) {
      const metrics = this.services.get(serviceName);
      const traces = this.getTraces(undefined, serviceName);
      const alerts = this.getAlerts(serviceName);
      
      return {
        metrics: metrics!,
        traces,
        alerts,
        dependencies: this.getDependencyGraph(serviceName)
      };
    }

    const observabilityMap = new Map<string, ServiceObservability>();
    for (const [name] of this.services) {
      observabilityMap.set(name, this.getServiceObservability(name) as ServiceObservability);
    }
    return observabilityMap;
  }

  getDependencyGraph(serviceName?: string): DependencyGraph {
    if (serviceName) {
      const filteredGraph: DependencyGraph = {
        nodes: new Map(),
        edges: new Map()
      };

      // Include the service and its direct dependencies
      const service = this.serviceRegistry.get(serviceName);
      if (service) {
        filteredGraph.nodes.set(serviceName, this.dependencyGraph.nodes.get(serviceName)!);
        
        for (const dep of service.dependencies) {
          filteredGraph.nodes.set(dep, this.dependencyGraph.nodes.get(dep)!);
          
          const edgeKey = `${serviceName}-${dep}`;
          const edge = this.dependencyGraph.edges.get(edgeKey);
          if (edge) {
            filteredGraph.edges.set(edgeKey, edge);
          }
        }
      }
      
      return filteredGraph;
    }
    
    return this.dependencyGraph;
  }

  getUbuntuMetrics() {
    return {
      ...this.ubuntuMetrics,
      collectiveHealth: this.ubuntuMetrics.collectiveHealth.toFixed(1),
      harmonyIndex: this.ubuntuMetrics.harmonyIndex.toFixed(3),
      prosperityScore: this.ubuntuMetrics.prosperityScore.toFixed(1),
      communityTrust: this.ubuntuMetrics.communityTrust.toFixed(3),
      ubuntu_philosophy: 'Ubuntu: I am because we are'
    };
  }

  // ========== EVENT HANDLING ==========

  private setupEventListeners() {
    this.eventBus.subscribe('service-heartbeat', (data: any) => {
      this.handleServiceHeartbeat(data);
    });

    this.eventBus.subscribe('service-metric', (data: any) => {
      this.handleServiceMetric(data);
    });
  }

  private handleServiceHeartbeat(data: any) {
    const service = this.serviceRegistry.get(data.service);
    if (service) {
      service.lastHeartbeat = new Date();
    }
  }

  private handleServiceMetric(data: any) {
    // Handle incoming metrics from services
    const metrics = this.services.get(data.service);
    if (metrics && data.metrics) {
      Object.assign(metrics, data.metrics);
    }
  }

  private async logServiceEvent(eventType: string, serviceName: string, data?: any) {
    try {
      await this.eventBus.publish('service-mesh-event', {
        eventType,
        serviceName,
        data,
        timestamp: new Date(),
        ubuntu_logging: 'Ubuntu service mesh logging'
      });
    } catch (error) {
      console.warn('Failed to log service event:', error);
    }
  }

  // ========== UTILITY METHODS ==========

  getMetrics(serviceName?: string) {
    if (serviceName) {
      return this.services.get(serviceName);
    }
    return Array.from(this.services.values());
  }

  getCircuitBreakerStatus(serviceName?: string) {
    if (serviceName) {
      return this.circuitBreakers.get(serviceName);
    }
    return Object.fromEntries(this.circuitBreakers);
  }

  getServiceRegistry() {
    return Array.from(this.serviceRegistry.values());
  }

  getSystemOverview() {
    const services = Array.from(this.services.values());
    const healthyServices = services.filter(s => s.status === 'healthy').length;
    const degradedServices = services.filter(s => s.status === 'degraded').length;
    const downServices = services.filter(s => s.status === 'down').length;
    
    const totalRequests = services.reduce((sum, s) => sum + s.requestCount, 0);
    const avgResponseTime = services.reduce((sum, s) => sum + s.responseTime, 0) / services.length;
    const avgErrorRate = services.reduce((sum, s) => sum + s.errorRate, 0) / services.length;

    return {
      totalServices: services.length,
      healthyServices,
      degradedServices,
      downServices,
      totalRequests,
      avgResponseTime: avgResponseTime.toFixed(0),
      avgErrorRate: (avgErrorRate * 100).toFixed(1),
      ubuntuMetrics: this.getUbuntuMetrics(),
      activeAlerts: this.getAlerts().filter(a => !a.resolved).length,
      timestamp: new Date()
    };
  }
}

export { 
  EnhancedServiceMesh, 
  ServiceMetrics, 
  CircuitBreakerConfig, 
  ServiceRegistry,
  DistributedTrace,
  ServiceObservability,
  Alert,
  DependencyGraph
};
