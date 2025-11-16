# Azora OS Observability Stack - Phase 3 Setup Guide

Complete guide for setting up distributed tracing, metrics, logging, and alerting.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Azora Services                            │
│  (api-gateway, auth-service, education, mint, forge, etc)   │
└──────────┬──────────────────────────────────────────────────┘
           │
           ├─────────────────────────────────────────────────┐
           │                                                 │
           ▼                                                 ▼
    ┌─────────────┐                                  ┌──────────────┐
    │  Prometheus │◄─────────────────────────────────│   Services   │
    │  (Metrics)  │                                  │  (Metrics)   │
    └─────────────┘                                  └──────────────┘
           │
           │                                         ┌──────────────┐
           │                                         │   Services   │
           │                                         │  (Traces)    │
           │                                         └──────┬───────┘
           │                                                │
           │                                                ▼
           │                                         ┌──────────────┐
           │                                         │    Jaeger    │
           │                                         │  (Tracing)   │
           │                                         └──────────────┘
           │
           │                                         ┌──────────────┐
           │                                         │   Services   │
           │                                         │   (Logs)     │
           │                                         └──────┬───────┘
           │                                                │
           │                                                ▼
           │                                         ┌──────────────┐
           │                                         │     Loki     │
           │                                         │  (Logging)   │
           │                                         └──────────────┘
           │
           └─────────────────────────────────────────────────┤
                                                             │
                                                             ▼
                                                      ┌──────────────┐
                                                      │   Grafana    │
                                                      │ (Dashboard)  │
                                                      └──────────────┘
                                                             │
                                                             ▼
                                                      ┌──────────────┐
                                                      │ Alertmanager │
                                                      │  (Alerts)    │
                                                      └──────────────┘
```

## Quick Start

### 1. Start the Observability Stack

```bash
# Start all observability services
docker-compose -f docker-compose.observability.yml up -d

# Verify services are running
docker-compose -f docker-compose.observability.yml ps
```

### 2. Access the Dashboards

- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Jaeger**: http://localhost:16686
- **Loki**: http://localhost:3100

### 3. Configure Services for Tracing

Add to each service's `index.js` or `server.ts`:

```typescript
// MUST be first import
import { initializeTracing } from '../shared/tracing';
initializeTracing('service-name');

// Then other imports
import express from 'express';
import { createTracingMiddleware } from '../shared/tracing/express-middleware';

const app = express();
app.use(createTracingMiddleware());
```

### 4. Install Dependencies

```bash
# In each service directory
npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-jaeger-http @opentelemetry/sdk-trace-node @opentelemetry/resources @opentelemetry/semantic-conventions @opentelemetry/core @opentelemetry/instrumentation
```

## Components

### Jaeger (Distributed Tracing)
- **Port**: 16686 (UI), 14268 (Collector), 6831 (Agent)
- **Purpose**: Trace requests across services
- **Features**:
  - Service dependency mapping
  - Latency analysis
  - Error tracking
  - Span visualization

### Prometheus (Metrics)
- **Port**: 9090
- **Purpose**: Collect and store metrics
- **Features**:
  - Time-series database
  - PromQL queries
  - Alert rules
  - 30-day retention

### Loki (Log Aggregation)
- **Port**: 3100
- **Purpose**: Aggregate logs from all services
- **Features**:
  - LogQL queries
  - Label-based indexing
  - Low storage overhead
  - Integration with Grafana

### Grafana (Visualization)
- **Port**: 3000
- **Purpose**: Unified dashboard for all observability data
- **Features**:
  - Multi-datasource support
  - Custom dashboards
  - Alert management
  - User management

### Alertmanager (Alert Management)
- **Port**: 9093
- **Purpose**: Route and manage alerts
- **Features**:
  - Alert grouping
  - Slack integration
  - Alert silencing
  - Webhook support

## Configuration

### Environment Variables

```bash
# Jaeger
JAEGER_ENDPOINT=http://localhost:14268/api/traces
JAEGER_AGENT_HOST=localhost
JAEGER_AGENT_PORT=6831

# Service
SERVICE_VERSION=1.0.0
SERVICE_NAME=your-service

# Slack (for alerts)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Prometheus Scrape Configuration

Edit `observability/prometheus.yml` to add services:

```yaml
scrape_configs:
  - job_name: 'your-service'
    static_configs:
      - targets: ['localhost:PORT']
    metrics_path: '/metrics'
```

### Alert Rules

Edit `observability/alert-rules.yml` to customize alerts:

```yaml
- alert: CustomAlert
  expr: your_metric > threshold
  for: 5m
  labels:
    severity: warning
```

## Usage Examples

### View Traces in Jaeger

1. Go to http://localhost:16686
2. Select service from dropdown
3. Click "Find Traces"
4. Click on a trace to see details

### Query Metrics in Prometheus

1. Go to http://localhost:9090
2. Enter PromQL query:
   ```
   rate(http_requests_total[5m])
   histogram_quantile(0.95, http_request_duration_seconds_bucket)
   ```

### View Logs in Grafana

1. Go to http://localhost:3000
2. Create new panel
3. Select Loki datasource
4. Enter LogQL query:
   ```
   {job="auth-service"} | json | level="error"
   ```

### Create Custom Dashboard

1. Go to Grafana
2. Click "+" → "Dashboard"
3. Add panels with Prometheus/Loki queries
4. Save dashboard

## Tracing Best Practices

### 1. Initialize Early
```typescript
// MUST be first
import { initializeTracing } from '../shared/tracing';
initializeTracing('service-name');
```

### 2. Add Meaningful Span Names
```typescript
const span = tracer.startSpan('user.login'); // Good
const span = tracer.startSpan('operation');  // Bad
```

### 3. Include Context
```typescript
span.setAttributes({
  'user.id': userId,
  'user.email': email,
  'action.type': 'login',
});
```

### 4. Handle Errors
```typescript
try {
  // operation
} catch (error) {
  span.recordException(error);
  span.setStatus({ code: SpanStatusCode.ERROR });
  throw error;
}
```

### 5. Trace External Calls
```typescript
const span = createServiceSpan('payment-service', 'POST', '/api/charge');
try {
  const response = await fetch(endpoint);
  span.end();
} catch (error) {
  span.recordException(error);
  span.end();
}
```

## Monitoring Checklist

- [ ] All services have tracing initialized
- [ ] Traces appear in Jaeger
- [ ] Metrics are being collected in Prometheus
- [ ] Logs are flowing into Loki
- [ ] Grafana dashboards are configured
- [ ] Alert rules are defined
- [ ] Slack integration is working
- [ ] Performance overhead is <1%

## Troubleshooting

### Traces not appearing

```bash
# Check Jaeger is running
docker-compose -f docker-compose.observability.yml ps jaeger

# Check service logs
docker logs <service-container>

# Verify endpoint
curl http://localhost:14268/api/traces
```

### Metrics not collected

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check service metrics endpoint
curl http://localhost:PORT/metrics
```

### Logs not ingesting

```bash
# Check Loki status
curl http://localhost:3100/loki/api/v1/status

# Check service logs
docker logs <service-container>
```

### High memory usage

1. Reduce sampling rate
2. Decrease batch size
3. Increase flush interval
4. Check for memory leaks in services

## Performance Tuning

### Sampling Configuration

```typescript
// Sample 10% of traces
const sampler = new ProbabilitySampler(0.1);
```

### Batch Size

```typescript
// Adjust batch processor
new BatchSpanProcessor(exporter, {
  maxQueueSize: 512,
  maxExportBatchSize: 256,
  scheduledDelayMillis: 5000,
});
```

### Retention Policies

```yaml
# Prometheus: 30 days
--storage.tsdb.retention.time=30d

# Loki: 30 days
retention_deletes_enabled: true
retention_period: 720h
```

## Next Steps

1. **Integrate with CI/CD**: Add trace collection to deployment pipeline
2. **Custom Dashboards**: Create service-specific dashboards
3. **Alert Tuning**: Adjust thresholds based on baseline metrics
4. **SLO Definition**: Define Service Level Objectives
5. **Runbook Creation**: Document incident response procedures

## Support

- OpenTelemetry: https://opentelemetry.io/docs/
- Jaeger: https://www.jaegertracing.io/docs/
- Prometheus: https://prometheus.io/docs/
- Loki: https://grafana.com/docs/loki/
- Grafana: https://grafana.com/docs/grafana/

---

**Status**: Phase 3 Complete - Distributed Tracing Infrastructure Ready
