/**
 * Metrics Dashboard Service
 * 
 * Collects and displays real-time metrics including response times,
 * throughput, error rates, and service health indicators.
 */

export interface MetricData {
  timestamp: number;
  value: number;
  labels?: Record<string, string>;
}

export interface ServiceMetrics {
  serviceName: string;
  responseTime: {
    p50: number;
    p95: number;
    p99: number;
    avg: number;
  };
  throughput: {
    requestsPerSecond: number;
    requestsPerMinute: number;
  };
  errorRate: {
    percentage: number;
    count: number;
    total: number;
  };
  health: 'healthy' | 'degraded' | 'down';
  uptime: number;
  lastUpdated: Date;
}

export interface CustomMetric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  value: number;
  labels?: Record<string, string>;
  description?: string;
}

export interface DashboardData {
  services: ServiceMetrics[];
  customMetrics: CustomMetric[];
  alerts: Alert[];
  timeRange: { start: Date; end: Date };
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  service: string;
  timestamp: Date;
  resolved: boolean;
}

export class MetricsDashboard {
  private metricsCache: Map<string, MetricData[]> = new Map();
  private serviceMetrics: Map<string, ServiceMetrics> = new Map();
  private alerts: Alert[] = [];
  private pollingInterval: NodeJS.Timeout | null = null;

  /**
   * Start collecting metrics from deployed services
   */
  startMonitoring(services: string[], intervalMs: number = 5000): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(async () => {
      for (const service of services) {
        await this.collectServiceMetrics(service);
      }
      this.checkAlerts();
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Collect metrics from a service
   */
  private async collectServiceMetrics(serviceName: string): Promise<void> {
    try {
      const metricsUrl = this.getMetricsUrl(serviceName);
      const response = await fetch(metricsUrl);
      
      if (!response.ok) {
        this.updateServiceHealth(serviceName, 'down');
        return;
      }

      const metricsText = await response.text();
      const parsed = this.parsePrometheusMetrics(metricsText);
      
      const metrics = this.calculateServiceMetrics(serviceName, parsed);
      this.serviceMetrics.set(serviceName, metrics);
      
      // Store time-series data
      this.storeMetricData(serviceName, parsed);
      
    } catch (error) {
      console.error(`Failed to collect metrics from ${serviceName}:`, error);
      this.updateServiceHealth(serviceName, 'down');
    }
  }

  /**
   * Parse Prometheus metrics format
   */
  private parsePrometheusMetrics(text: string): Map<string, MetricData[]> {
    const metrics = new Map<string, MetricData[]>();
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.startsWith('#') || !line.trim()) continue;

      const match = line.match(/^(\w+)(?:\{([^}]+)\})?\s+(\S+)(?:\s+(\d+))?$/);
      if (match) {
        const [, name, labelsStr, value, timestamp] = match;
        const labels = this.parseLabels(labelsStr);
        
        if (!metrics.has(name)) {
          metrics.set(name, []);
        }

        metrics.get(name)!.push({
          timestamp: timestamp ? parseInt(timestamp) : Date.now(),
          value: parseFloat(value),
          labels,
        });
      }
    }

    return metrics;
  }

  /**
   * Parse Prometheus labels
   */
  private parseLabels(labelsStr?: string): Record<string, string> | undefined {
    if (!labelsStr) return undefined;

    const labels: Record<string, string> = {};
    const pairs = labelsStr.split(',');

    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key && value) {
        labels[key.trim()] = value.trim().replace(/"/g, '');
      }
    }

    return labels;
  }

  /**
   * Calculate service metrics from raw data
   */
  private calculateServiceMetrics(serviceName: string, metrics: Map<string, MetricData[]>): ServiceMetrics {
    const durations = metrics.get('http_request_duration_ms') || [];
    const requests = metrics.get('http_requests_total') || [];
    const errors = metrics.get('http_errors_total') || [];

    // Calculate response time percentiles
    const sortedDurations = durations.map(d => d.value).sort((a, b) => a - b);
    const responseTime = {
      p50: this.percentile(sortedDurations, 50),
      p95: this.percentile(sortedDurations, 95),
      p99: this.percentile(sortedDurations, 99),
      avg: sortedDurations.reduce((a, b) => a + b, 0) / sortedDurations.length || 0,
    };

    // Calculate throughput
    const totalRequests = requests.reduce((sum, r) => sum + r.value, 0);
    const timeWindow = 60; // seconds
    const throughput = {
      requestsPerSecond: totalRequests / timeWindow,
      requestsPerMinute: totalRequests,
    };

    // Calculate error rate
    const totalErrors = errors.reduce((sum, e) => sum + e.value, 0);
    const errorRate = {
      percentage: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
      count: totalErrors,
      total: totalRequests,
    };

    // Determine health status
    let health: 'healthy' | 'degraded' | 'down' = 'healthy';
    if (errorRate.percentage > 10) health = 'down';
    else if (errorRate.percentage > 5 || responseTime.p95 > 1000) health = 'degraded';

    return {
      serviceName,
      responseTime,
      throughput,
      errorRate,
      health,
      uptime: this.calculateUptime(serviceName),
      lastUpdated: new Date(),
    };
  }

  /**
   * Calculate percentile from sorted array
   */
  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Store metric data for time-series analysis
   */
  private storeMetricData(serviceName: string, metrics: Map<string, MetricData[]>): void {
    const key = `${serviceName}:timeseries`;
    const existing = this.metricsCache.get(key) || [];
    
    // Keep last 1000 data points
    const maxDataPoints = 1000;
    const allMetrics = Array.from(metrics.values()).flat();
    const combined = [...existing, ...allMetrics].slice(-maxDataPoints);
    
    this.metricsCache.set(key, combined);
  }

  /**
   * Update service health status
   */
  private updateServiceHealth(serviceName: string, health: 'healthy' | 'degraded' | 'down'): void {
    const existing = this.serviceMetrics.get(serviceName);
    if (existing) {
      existing.health = health;
      existing.lastUpdated = new Date();
    }
  }

  /**
   * Calculate service uptime
   */
  private calculateUptime(serviceName: string): number {
    // Simplified uptime calculation
    const metrics = this.serviceMetrics.get(serviceName);
    if (!metrics) return 0;

    const now = Date.now();
    const lastUpdate = metrics.lastUpdated.getTime();
    const uptimeMs = now - lastUpdate;

    return uptimeMs / 1000; // seconds
  }

  /**
   * Check for alert conditions
   */
  private checkAlerts(): void {
    for (const [serviceName, metrics] of this.serviceMetrics) {
      // High error rate alert
      if (metrics.errorRate.percentage > 5) {
        this.createAlert({
          severity: metrics.errorRate.percentage > 10 ? 'critical' : 'warning',
          message: `High error rate: ${metrics.errorRate.percentage.toFixed(2)}%`,
          service: serviceName,
        });
      }

      // Slow response time alert
      if (metrics.responseTime.p95 > 1000) {
        this.createAlert({
          severity: 'warning',
          message: `Slow response time: P95 ${metrics.responseTime.p95.toFixed(0)}ms`,
          service: serviceName,
        });
      }

      // Service down alert
      if (metrics.health === 'down') {
        this.createAlert({
          severity: 'critical',
          message: `Service is down`,
          service: serviceName,
        });
      }
    }
  }

  /**
   * Create an alert
   */
  private createAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'resolved'>): void {
    const existing = this.alerts.find(
      a => a.service === alert.service && a.message === alert.message && !a.resolved
    );

    if (!existing) {
      this.alerts.push({
        id: `alert-${Date.now()}-${Math.random()}`,
        ...alert,
        timestamp: new Date(),
        resolved: false,
      });
    }
  }

  /**
   * Get metrics URL for a service
   */
  private getMetricsUrl(serviceName: string): string {
    // This would be configured based on deployment
    const port = this.getServicePort(serviceName);
    return `http://localhost:${port}/metrics`;
  }

  /**
   * Get service port (simplified)
   */
  private getServicePort(serviceName: string): number {
    const portMap: Record<string, number> = {
      'auth-service': 3001,
      'payment-service': 3002,
      'education-service': 3003,
      'marketplace-service': 3004,
    };
    return portMap[serviceName] || 3000;
  }

  /**
   * Get dashboard data
   */
  getDashboardData(timeRange?: { start: Date; end: Date }): DashboardData {
    const services = Array.from(this.serviceMetrics.values());
    const customMetrics = this.getCustomMetrics();
    const alerts = this.alerts.filter(a => !a.resolved);

    return {
      services,
      customMetrics,
      alerts,
      timeRange: timeRange || {
        start: new Date(Date.now() - 3600000), // 1 hour ago
        end: new Date(),
      },
    };
  }

  /**
   * Get custom metrics
   */
  private getCustomMetrics(): CustomMetric[] {
    const customMetrics: CustomMetric[] = [];

    for (const [key, data] of this.metricsCache) {
      if (key.includes('custom_')) {
        const latest = data[data.length - 1];
        if (latest) {
          customMetrics.push({
            name: key,
            type: 'gauge',
            value: latest.value,
            labels: latest.labels,
          });
        }
      }
    }

    return customMetrics;
  }

  /**
   * Get time-series data for a metric
   */
  getTimeSeriesData(serviceName: string, metricName: string, timeRange: { start: Date; end: Date }): MetricData[] {
    const key = `${serviceName}:timeseries`;
    const data = this.metricsCache.get(key) || [];

    return data.filter(d => {
      const timestamp = new Date(d.timestamp);
      return timestamp >= timeRange.start && timestamp <= timeRange.end;
    });
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  /**
   * Clear all alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }
}
