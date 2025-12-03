/**
 * Metrics Collection System
 * Ubuntu Philosophy: "My security ensures our freedom"
 */

import { EventEmitter } from 'events';

export interface MetricData {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp: Date;
  ubuntu: string;
}

export interface CounterMetric extends MetricData {
  type: 'counter';
  total: number;
}

export interface HistogramMetric extends MetricData {
  type: 'histogram';
  buckets: Record<string, number>;
  sum: number;
  count: number;
}

export interface GaugeMetric extends MetricData {
  type: 'gauge';
  current: number;
}

export type Metric = CounterMetric | HistogramMetric | GaugeMetric;

export class MetricsCollector extends EventEmitter {
  private metrics: Map<string, Metric> = new Map();
  private readonly DEFAULT_BUCKETS = [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120, 300];

  constructor() {
    super();
    this.startCleanupInterval();
  }

  /**
   * Increment a counter metric
   */
  public incrementCounter(name: string, value: number = 1, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    let metric = this.metrics.get(key) as CounterMetric;

    if (!metric || metric.type !== 'counter') {
      metric = {
        name,
        type: 'counter',
        total: 0,
        value: 0,
        labels,
        timestamp: new Date(),
        ubuntu: 'My security ensures our freedom'
      };
      this.metrics.set(key, metric);
    }

    metric.total += value;
    metric.value = metric.total;
    metric.timestamp = new Date();

    this.emit('metric:updated', metric);
  }

  /**
   * Record a histogram metric
   */
  public recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    let metric = this.metrics.get(key) as HistogramMetric;

    if (!metric || metric.type !== 'histogram') {
      metric = {
        name,
        type: 'histogram',
        value,
        buckets: {},
        sum: 0,
        count: 0,
        labels,
        timestamp: new Date(),
        ubuntu: 'My security ensures our freedom'
      };
      this.metrics.set(key, metric);
    }

    // Update buckets
    for (const bucket of this.DEFAULT_BUCKETS) {
      if (value <= bucket) {
        metric.buckets[`le_${bucket}`] = (metric.buckets[`le_${bucket}`] || 0) + 1;
      }
    }

    metric.sum += value;
    metric.count += 1;
    metric.value = value;
    metric.timestamp = new Date();

    this.emit('metric:updated', metric);
  }

  /**
   * Set a gauge metric
   */
  public setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    let metric = this.metrics.get(key) as GaugeMetric;

    if (!metric || metric.type !== 'gauge') {
      metric = {
        name,
        type: 'gauge',
        current: value,
        value,
        labels,
        timestamp: new Date(),
        ubuntu: 'My security ensures our freedom'
      };
      this.metrics.set(key, metric);
    }

    metric.current = value;
    metric.value = value;
    metric.timestamp = new Date();

    this.emit('metric:updated', metric);
  }

  /**
   * Get a specific metric
   */
  public getMetric(name: string, labels?: Record<string, string>): Metric | undefined {
    const key = this.getMetricKey(name, labels);
    return this.metrics.get(key);
  }

  /**
   * Get all metrics
   */
  public getAllMetrics(): Metric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get metrics by type
   */
  public getMetricsByType(type: Metric['type']): Metric[] {
    return this.getAllMetrics().filter(metric => metric.type === type);
  }

  /**
   * Reset a specific metric
   */
  public resetMetric(name: string, labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    this.metrics.delete(key);
  }

  /**
   * Reset all metrics
   */
  public resetAllMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Generate Prometheus-compatible metrics output
   */
  public generatePrometheusOutput(): string {
    const output: string[] = [];
    const metricsByType = {
      counter: this.getMetricsByType('counter'),
      histogram: this.getMetricsByType('histogram'),
      gauge: this.getMetricsByType('gauge')
    };

    // Counter metrics
    for (const metric of metricsByType.counter) {
      const labelsStr = this.formatLabels(metric.labels);
      output.push(`# HELP ${metric.name} ${metric.name}`);
      output.push(`# TYPE ${metric.name} counter`);
      output.push(`${metric.name}${labelsStr} ${metric.value}`);
    }

    // Histogram metrics
    for (const metric of metricsByType.histogram) {
      const labelsStr = this.formatLabels(metric.labels);
      output.push(`# HELP ${metric.name} ${metric.name}`);
      output.push(`# TYPE ${metric.name} histogram`);
      
      // Bucket counts
      for (const [bucket, count] of Object.entries(metric.buckets)) {
        output.push(`${metric.name}_bucket{le="${bucket.replace('le_', '')}"${labelsStr.replace('{', ',').replace('}', '')} ${count}`);
      }
      
      // Sum and count
      output.push(`${metric.name}_sum${labelsStr} ${metric.sum}`);
      output.push(`${metric.name}_count${labelsStr} ${metric.count}`);
    }

    // Gauge metrics
    for (const metric of metricsByType.gauge) {
      const labelsStr = this.formatLabels(metric.labels);
      output.push(`# HELP ${metric.name} ${metric.name}`);
      output.push(`# TYPE ${metric.name} gauge`);
      output.push(`${metric.name}${labelsStr} ${metric.value}`);
    }

    return output.join('\n') + '\n';
  }

  /**
   * Get metric statistics
   */
  public getStatistics(): Record<string, any> {
    const allMetrics = this.getAllMetrics();
    const byType = {
      counter: allMetrics.filter(m => m.type === 'counter').length,
      histogram: allMetrics.filter(m => m.type === 'histogram').length,
      gauge: allMetrics.filter(m => m.type === 'gauge').length
    };

    return {
      total: allMetrics.length,
      byType,
      ubuntu: 'My security ensures our freedom',
      lastUpdated: new Date()
    };
  }

  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels) return name;
    
    const labelPairs = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`);
    
    return `${name}{${labelPairs.join(',')}}`;
  }

  private formatLabels(labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) return '';
    
    const labelPairs = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`);
    
    return `{${labelPairs.join(',')}}`;
  }

  /**
   * Clean up old metrics (prevent memory leaks)
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = new Date();
      const cutoff = new Date(now.getTime() - 5 * 60 * 100); // 5

      for (const [key, metric] of this.metrics.entries()) {
        if (metric.timestamp < cutoff) {
          this.metrics.delete(key);
        }
      }
    }, 60 * 1000); // Clean up every minute
  }

  /**
   * Create metrics middleware for Express
   */
  public createExpressMiddleware() {
    return (req: any, res: any, next: any) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        
        this.recordHistogram('http_request_duration_ms', duration, {
          method: req.method,
          route: req.route?.path || req.path,
          status_code: res.statusCode.toString()
        });

        this.incrementCounter('http_requests_total', 1, {
          method: req.method,
          route: req.route?.path || req.path,
          status_code: res.statusCode.toString()
        });
      });

      next();
    };
  }
}

// Singleton instance
export const metrics = new MetricsCollector();

// Helper functions for common metrics
export const trackRequest = (duration: number, method: string, route: string, statusCode: number) => {
  metrics.recordHistogram('http_request_duration_ms', duration, {
    method,
    route,
    status_code: statusCode.toString()
  });

  metrics.incrementCounter('http_requests_total', 1, {
    method,
    route,
    status_code: statusCode.toString()
  });
};

export const trackError = (error: Error, context?: Record<string, string>) => {
  metrics.incrementCounter('errors_total', 1, {
    error_type: error.constructor.name,
    ...context
  });
};

export const trackBusinessEvent = (event: string, value: number = 1, context?: Record<string, string>) => {
  metrics.incrementCounter(`business_event_${event}_total`, value, context);
};

export const trackSecurityEvent = (event: string, context?: Record<string, string>) => {
  metrics.incrementCounter('security_events_total', 1, {
    event_type: event,
    ...context,
    ubuntu: 'Security protects our community'
  });
};

export default metrics;
