import { EventBus } from './azora-event-bus';

interface Trace {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operation: string;
  service: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'success' | 'error';
  metadata?: Record<string, any>;
}

interface Metric {
  name: string;
  value: number;
  timestamp: number;
  labels?: Record<string, string>;
}

class Observability {
  private traces: Map<string, Trace[]> = new Map();
  private metrics: Metric[] = [];
  private eventBus: EventBus;
  private serviceName: string;

  constructor(serviceName: string, eventBus: EventBus) {
    this.serviceName = serviceName;
    this.eventBus = eventBus;
  }

  startSpan(operation: string, traceId?: string): Trace {
    const id = traceId || `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const span: Trace = {
      traceId: id,
      spanId: `span-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      operation,
      service: this.serviceName,
      startTime: Date.now(),
      status: 'success'
    };

    if (!this.traces.has(id)) {
      this.traces.set(id, []);
    }
    this.traces.get(id)!.push(span);

    return span;
  }

  endSpan(span: Trace, status: 'success' | 'error' = 'success') {
    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;

    this.eventBus.publish('trace-complete', span);
  }

  recordMetric(name: string, value: number, labels?: Record<string, string>) {
    const metric: Metric = {
      name,
      value,
      timestamp: Date.now(),
      labels
    };
    this.metrics.push(metric);

    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-5000);
    }

    this.eventBus.publish('metric-recorded', metric);
  }

  getTraces(traceId?: string) {
    if (traceId) {
      return this.traces.get(traceId) || [];
    }
    return Array.from(this.traces.values()).flat();
  }

  getMetrics(name?: string, limit: number = 100) {
    if (name) {
      return this.metrics.filter(m => m.name === name).slice(-limit);
    }
    return this.metrics.slice(-limit);
  }

  getServiceStats() {
    const traces = this.getTraces();
    const totalRequests = traces.length;
    const errors = traces.filter(t => t.status === 'error').length;
    const avgDuration = traces.reduce((sum, t) => sum + (t.duration || 0), 0) / totalRequests || 0;

    return {
      service: this.serviceName,
      totalRequests,
      errorCount: errors,
      errorRate: totalRequests > 0 ? errors / totalRequests : 0,
      avgDuration: Math.round(avgDuration),
      p95Duration: this.calculatePercentile(traces, 95),
      p99Duration: this.calculatePercentile(traces, 99)
    };
  }

  private calculatePercentile(traces: Trace[], percentile: number): number {
    const sorted = traces
      .filter(t => t.duration)
      .map(t => t.duration!)
      .sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)] || 0;
  }

  clearOldTraces(olderThanMs: number = 3600000) {
    const cutoff = Date.now() - olderThanMs;
    for (const [traceId, traces] of this.traces) {
      const filtered = traces.filter(t => t.startTime > cutoff);
      if (filtered.length === 0) {
        this.traces.delete(traceId);
      } else {
        this.traces.set(traceId, filtered);
      }
    }
  }
}

export { Observability, Trace, Metric };
