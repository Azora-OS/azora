/**
 * Monitoring Integrations Service
 * 
 * Integrates with external monitoring tools including Sentry,
 * DataDog, New Relic, and Prometheus/Grafana.
 */

export interface IntegrationConfig {
  type: 'sentry' | 'datadog' | 'newrelic' | 'prometheus' | 'grafana';
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  projectId?: string;
  options?: Record<string, any>;
}

export interface SentryConfig extends IntegrationConfig {
  type: 'sentry';
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate?: number;
}

export interface DataDogConfig extends IntegrationConfig {
  type: 'datadog';
  apiKey: string;
  appKey: string;
  site?: string;
}

export interface NewRelicConfig extends IntegrationConfig {
  type: 'newrelic';
  licenseKey: string;
  appName: string;
}

export interface PrometheusConfig extends IntegrationConfig {
  type: 'prometheus';
  endpoint: string;
  port: number;
}

export interface GrafanaConfig extends IntegrationConfig {
  type: 'grafana';
  endpoint: string;
  apiKey: string;
  dashboardId?: string;
}

export class MonitoringIntegrations {
  private integrations: Map<string, IntegrationConfig> = new Map();

  /**
   * Add integration
   */
  addIntegration(config: IntegrationConfig): void {
    this.integrations.set(config.type, config);
  }

  /**
   * Remove integration
   */
  removeIntegration(type: string): void {
    this.integrations.delete(type);
  }

  /**
   * Get integration
   */
  getIntegration(type: string): IntegrationConfig | undefined {
    return this.integrations.get(type);
  }

  /**
   * Get all integrations
   */
  getAllIntegrations(): IntegrationConfig[] {
    return Array.from(this.integrations.values());
  }

  /**
   * Generate Sentry integration code
   */
  generateSentryIntegration(config: SentryConfig): string {
    return `import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: '${config.dsn}',
  environment: '${config.environment}',
  ${config.release ? `release: '${config.release}',` : ''}
  integrations: [
    new ProfilingIntegration(),
  ],
  tracesSampleRate: ${config.tracesSampleRate || 1.0},
  profilesSampleRate: 1.0,
});

// Error handler middleware
export const sentryErrorHandler = Sentry.Handlers.errorHandler();

// Request handler middleware
export const sentryRequestHandler = Sentry.Handlers.requestHandler();

// Capture exception
export const captureException = (error: Error, context?: any) => {
  Sentry.captureException(error, { extra: context });
};

// Capture message
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};
`;
  }

  /**
   * Generate DataDog integration code
   */
  generateDataDogIntegration(config: DataDogConfig): string {
    return `import tracer from 'dd-trace';
import { StatsD } from 'hot-shots';

// Initialize DataDog tracer
tracer.init({
  env: process.env.NODE_ENV || 'development',
  service: process.env.SERVICE_NAME || 'azstudio-service',
  version: process.env.VERSION || '1.0.0',
  ${config.site ? `site: '${config.site}',` : ''}
});

// Initialize StatsD client
const dogstatsd = new StatsD({
  host: 'localhost',
  port: 8125,
  prefix: 'azstudio.',
  globalTags: {
    env: process.env.NODE_ENV || 'development',
  },
});

// Metrics helpers
export const metrics = {
  increment: (metric: string, tags?: Record<string, string>) => {
    dogstatsd.increment(metric, tags);
  },
  
  gauge: (metric: string, value: number, tags?: Record<string, string>) => {
    dogstatsd.gauge(metric, value, tags);
  },
  
  histogram: (metric: string, value: number, tags?: Record<string, string>) => {
    dogstatsd.histogram(metric, value, tags);
  },
  
  timing: (metric: string, duration: number, tags?: Record<string, string>) => {
    dogstatsd.timing(metric, duration, tags);
  },
};

// Tracing helpers
export const trace = {
  startSpan: (name: string, options?: any) => {
    return tracer.startSpan(name, options);
  },
  
  wrap: (name: string, fn: Function) => {
    return tracer.wrap(name, fn);
  },
};
`;
  }

  /**
   * Generate New Relic integration code
   */
  generateNewRelicIntegration(config: NewRelicConfig): string {
    return `import newrelic from 'newrelic';

// New Relic is automatically initialized via newrelic.js config file

// Custom instrumentation helpers
export const recordMetric = (name: string, value: number) => {
  newrelic.recordMetric(name, value);
};

export const recordCustomEvent = (eventType: string, attributes: Record<string, any>) => {
  newrelic.recordCustomEvent(eventType, attributes);
};

export const noticeError = (error: Error, customAttributes?: Record<string, any>) => {
  newrelic.noticeError(error, customAttributes);
};

export const setTransactionName = (name: string) => {
  newrelic.setTransactionName(name);
};

export const addCustomAttribute = (key: string, value: string | number | boolean) => {
  newrelic.addCustomAttribute(key, value);
};

export const startSegment = (name: string, record: boolean, handler: Function) => {
  return newrelic.startSegment(name, record, handler);
};
`;
  }

  /**
   * Generate Prometheus integration code
   */
  generatePrometheusIntegration(config: PrometheusConfig): string {
    return `import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';
import express from 'express';

// Create a Registry
const register = new Registry();

// Collect default metrics
collectDefaultMetrics({ register });

// Custom metrics
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in milliseconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000],
  registers: [register],
});

const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register],
});

// Metrics middleware
export const metricsMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  activeConnections.inc();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const labels = {
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode,
    };
    
    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, duration);
    activeConnections.dec();
  });
  
  next();
};

// Metrics endpoint
export const metricsEndpoint = async (req: any, res: any) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};

// Export metrics
export { register, httpRequestsTotal, httpRequestDuration, activeConnections };
`;
  }

  /**
   * Generate Grafana dashboard configuration
   */
  generateGrafanaDashboard(config: GrafanaConfig): string {
    return JSON.stringify({
      dashboard: {
        title: 'AzStudio Service Metrics',
        tags: ['azstudio', 'monitoring'],
        timezone: 'browser',
        panels: [
          {
            id: 1,
            title: 'Request Rate',
            type: 'graph',
            targets: [
              {
                expr: 'rate(http_requests_total[5m])',
                legendFormat: '{{method}} {{route}}',
              },
            ],
            gridPos: { x: 0, y: 0, w: 12, h: 8 },
          },
          {
            id: 2,
            title: 'Response Time (P95)',
            type: 'graph',
            targets: [
              {
                expr: 'histogram_quantile(0.95, rate(http_request_duration_ms_bucket[5m]))',
                legendFormat: '{{method}} {{route}}',
              },
            ],
            gridPos: { x: 12, y: 0, w: 12, h: 8 },
          },
          {
            id: 3,
            title: 'Error Rate',
            type: 'graph',
            targets: [
              {
                expr: 'rate(http_requests_total{status=~"5.."}[5m])',
                legendFormat: '{{method}} {{route}}',
              },
            ],
            gridPos: { x: 0, y: 8, w: 12, h: 8 },
          },
          {
            id: 4,
            title: 'Active Connections',
            type: 'graph',
            targets: [
              {
                expr: 'active_connections',
                legendFormat: 'Connections',
              },
            ],
            gridPos: { x: 12, y: 8, w: 12, h: 8 },
          },
        ],
        refresh: '10s',
      },
    }, null, 2);
  }

  /**
   * Generate integration setup instructions
   */
  generateSetupInstructions(type: string): string {
    switch (type) {
      case 'sentry':
        return `# Sentry Setup

1. Install dependencies:
   npm install @sentry/node @sentry/profiling-node

2. Add to your main application file:
   import { sentryRequestHandler, sentryErrorHandler } from './monitoring/sentry';
   
   app.use(sentryRequestHandler);
   // ... your routes
   app.use(sentryErrorHandler);

3. Set environment variables:
   SENTRY_DSN=your-dsn-here
   SENTRY_ENVIRONMENT=production
`;

      case 'datadog':
        return `# DataDog Setup

1. Install dependencies:
   npm install dd-trace hot-shots

2. Import at the very top of your entry file:
   import './monitoring/datadog';

3. Set environment variables:
   DD_API_KEY=your-api-key
   DD_APP_KEY=your-app-key
   DD_SITE=datadoghq.com

4. Start StatsD agent:
   docker run -d --name datadog-agent \\
     -e DD_API_KEY=your-api-key \\
     -e DD_SITE=datadoghq.com \\
     -p 8125:8125/udp \\
     datadog/agent:latest
`;

      case 'newrelic':
        return `# New Relic Setup

1. Install dependencies:
   npm install newrelic

2. Create newrelic.js config file in project root

3. Import at the very top of your entry file:
   import 'newrelic';

4. Set environment variables:
   NEW_RELIC_LICENSE_KEY=your-license-key
   NEW_RELIC_APP_NAME=your-app-name
`;

      case 'prometheus':
        return `# Prometheus Setup

1. Install dependencies:
   npm install prom-client

2. Add metrics endpoint to your Express app:
   import { metricsMiddleware, metricsEndpoint } from './monitoring/prometheus';
   
   app.use(metricsMiddleware);
   app.get('/metrics', metricsEndpoint);

3. Configure Prometheus to scrape your service:
   # prometheus.yml
   scrape_configs:
     - job_name: 'azstudio-service'
       static_configs:
         - targets: ['localhost:3000']
`;

      case 'grafana':
        return `# Grafana Setup

1. Install Grafana:
   docker run -d -p 3000:3000 grafana/grafana

2. Add Prometheus as data source in Grafana UI

3. Import the generated dashboard JSON

4. Set up alerts and notifications as needed
`;

      default:
        return 'No setup instructions available for this integration.';
    }
  }

  /**
   * Test integration connection
   */
  async testIntegration(type: string): Promise<{ success: boolean; message: string }> {
    const config = this.integrations.get(type);
    
    if (!config) {
      return { success: false, message: 'Integration not configured' };
    }

    if (!config.enabled) {
      return { success: false, message: 'Integration is disabled' };
    }

    try {
      switch (type) {
        case 'sentry':
          return await this.testSentry(config as SentryConfig);
        case 'datadog':
          return await this.testDataDog(config as DataDogConfig);
        case 'newrelic':
          return await this.testNewRelic(config as NewRelicConfig);
        case 'prometheus':
          return await this.testPrometheus(config as PrometheusConfig);
        case 'grafana':
          return await this.testGrafana(config as GrafanaConfig);
        default:
          return { success: false, message: 'Unknown integration type' };
      }
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  private async testSentry(config: SentryConfig): Promise<{ success: boolean; message: string }> {
    // Test Sentry connection by sending a test event
    try {
      const response = await fetch(`https://sentry.io/api/0/projects/${config.projectId}/`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
      });

      if (response.ok) {
        return { success: true, message: 'Sentry connection successful' };
      } else {
        return { success: false, message: `Sentry connection failed: ${response.statusText}` };
      }
    } catch (error: any) {
      return { success: false, message: `Sentry connection error: ${error.message}` };
    }
  }

  private async testDataDog(config: DataDogConfig): Promise<{ success: boolean; message: string }> {
    try {
      const site = config.site || 'datadoghq.com';
      const response = await fetch(`https://api.${site}/api/v1/validate`, {
        headers: {
          'DD-API-KEY': config.apiKey,
          'DD-APPLICATION-KEY': config.appKey,
        },
      });

      if (response.ok) {
        return { success: true, message: 'DataDog connection successful' };
      } else {
        return { success: false, message: `DataDog connection failed: ${response.statusText}` };
      }
    } catch (error: any) {
      return { success: false, message: `DataDog connection error: ${error.message}` };
    }
  }

  private async testNewRelic(config: NewRelicConfig): Promise<{ success: boolean; message: string }> {
    // New Relic doesn't have a simple validation endpoint
    // We'll just check if the license key is set
    if (config.licenseKey && config.licenseKey.length > 0) {
      return { success: true, message: 'New Relic configuration looks valid' };
    } else {
      return { success: false, message: 'New Relic license key is missing' };
    }
  }

  private async testPrometheus(config: PrometheusConfig): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${config.endpoint}/metrics`);

      if (response.ok) {
        return { success: true, message: 'Prometheus endpoint is accessible' };
      } else {
        return { success: false, message: `Prometheus endpoint failed: ${response.statusText}` };
      }
    } catch (error: any) {
      return { success: false, message: `Prometheus connection error: ${error.message}` };
    }
  }

  private async testGrafana(config: GrafanaConfig): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${config.endpoint}/api/health`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
      });

      if (response.ok) {
        return { success: true, message: 'Grafana connection successful' };
      } else {
        return { success: false, message: `Grafana connection failed: ${response.statusText}` };
      }
    } catch (error: any) {
      return { success: false, message: `Grafana connection error: ${error.message}` };
    }
  }
}
