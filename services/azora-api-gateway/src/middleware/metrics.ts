/**
 * Metrics Middleware
 * Ubuntu Philosophy: "My security ensures our freedom"
 */

interface MetricData {
  count: number;
  total: number;
  min: number;
  max: number;
  avg: number;
}

interface ServiceMetrics {
  requests: MetricData;
  responseTime: MetricData;
  errors: number;
  lastUpdated: Date;
}

export class Metrics {
  private metrics: Map<string, ServiceMetrics> = new Map();
  private globalMetrics: ServiceMetrics;

  constructor() {
    this.globalMetrics = this.initializeServiceMetrics();
  }

  private initializeServiceMetrics(): ServiceMetrics {
    return {
      requests: { count: 0, total: 0, min: Infinity, max: 0, avg: 0 },
      responseTime: { count: 0, total: 0, min: Infinity, max: 0, avg: 0 },
      errors: 0,
      lastUpdated: new Date()
    };
  }

  public recordRequest(serviceName: string, responseTime: number, isError: boolean = false): void {
    // Update service-specific metrics
    if (!this.metrics.has(serviceName)) {
      this.metrics.set(serviceName, this.initializeServiceMetrics());
    }

    const serviceMetrics = this.metrics.get(serviceName)!;
    
    // Update request metrics
    serviceMetrics.requests.count++;
    serviceMetrics.requests.total += responseTime;
    serviceMetrics.requests.min = Math.min(serviceMetrics.requests.min, responseTime);
    serviceMetrics.requests.max = Math.max(serviceMetrics.requests.max, responseTime);
    serviceMetrics.requests.avg = serviceMetrics.requests.total / serviceMetrics.requests.count;

    // Update response time metrics
    serviceMetrics.responseTime.count++;
    serviceMetrics.responseTime.total += responseTime;
    serviceMetrics.responseTime.min = Math.min(serviceMetrics.responseTime.min, responseTime);
    serviceMetrics.responseTime.max = Math.max(serviceMetrics.responseTime.max, responseTime);
    serviceMetrics.responseTime.avg = serviceMetrics.responseTime.total / serviceMetrics.responseTime.count;

    if (isError) {
      serviceMetrics.errors++;
    }

    serviceMetrics.lastUpdated = new Date();

    // Update global metrics
    this.globalMetrics.requests.count++;
    this.globalMetrics.requests.total += responseTime;
    this.globalMetrics.requests.min = Math.min(this.globalMetrics.requests.min, responseTime);
    this.globalMetrics.requests.max = Math.max(this.globalMetrics.requests.max, responseTime);
    this.globalMetrics.requests.avg = this.globalMetrics.requests.total / this.globalMetrics.requests.count;

    this.globalMetrics.responseTime.count++;
    this.globalMetrics.responseTime.total += responseTime;
    this.globalMetrics.responseTime.min = Math.min(this.globalMetrics.responseTime.min, responseTime);
    this.globalMetrics.responseTime.max = Math.max(this.globalMetrics.responseTime.max, responseTime);
    this.globalMetrics.responseTime.avg = this.globalMetrics.responseTime.total / this.globalMetrics.responseTime.count;

    if (isError) {
      this.globalMetrics.errors++;
    }

    this.globalMetrics.lastUpdated = new Date();
  }

  public getServiceMetrics(serviceName: string): ServiceMetrics | undefined {
    return this.metrics.get(serviceName);
  }

  public getAllMetrics(): any {
    return {
      global: {
        ...this.globalMetrics,
        ubuntu: 'My security ensures our freedom'
      },
      services: Object.fromEntries(
        Array.from(this.metrics.entries()).map(([name, metrics]) => [
          name,
          {
            ...metrics,
            ubuntu: 'My security ensures our freedom'
          }
        ])
      ),
      ubuntu: 'My security ensures our freedom'
    };
  }

  public resetMetrics(serviceName?: string): void {
    if (serviceName) {
      this.metrics.set(serviceName, this.initializeServiceMetrics());
    } else {
      this.metrics.clear();
      this.globalMetrics = this.initializeServiceMetrics();
    }
  }
}
