# Education Revenue Engine - Monitoring Setup Guide

This guide explains how to set up and use the comprehensive logging and monitoring infrastructure for the Education Revenue Engine.

## Overview

The monitoring stack includes:

1. **Structured Logging** - Winston with ELK Stack integration
2. **Prometheus Metrics** - Application performance and business metrics
3. **Grafana Dashboards** - Visualization of metrics
4. **Sentry** - Error tracking and alerting
5. **Health Checks** - Kubernetes-compatible health endpoints

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

The following packages are included:
- `winston` - Structured logging
- `prom-client` - Prometheus metrics
- `@sentry/node` - Error tracking
- `winston-elasticsearch` - ELK Stack integration

### 2. Start Monitoring Stack

```bash
# Start ELK Stack, Prometheus, Grafana, and Sentry
docker-compose -f docker-compose.monitoring.yml up -d

# Verify services are running
docker-compose -f docker-compose.monitoring.yml ps
```

### 3. Configure Environment Variables

Copy the monitoring configuration:

```bash
cp .env.monitoring.example .env.monitoring
```

Update `.env` with monitoring settings:

```env
# Logging
LOG_LEVEL=info
LOG_REQUEST_BODY=false

# Sentry
SENTRY_DSN=https://your-key@sentry.io/project-id
SENTRY_TRACE_SAMPLE_RATE=0.1

# ELK Stack
ELK_HOST=localhost
ELK_PORT=9200
```

### 4. Start the Application

```bash
npm run dev
```

## Monitoring Endpoints

### Health Checks

- **GET /monitoring/health** - Overall health status
- **GET /monitoring/health/live** - Kubernetes liveness probe
- **GET /monitoring/health/ready** - Kubernetes readiness probe
- **GET /monitoring/status** - Detailed status with statistics
- **GET /monitoring/diagnostics** - System diagnostics

### Metrics

- **GET /monitoring/metrics** - Prometheus metrics (text format)

## Accessing Monitoring Tools

### Kibana (Log Visualization)
- URL: http://localhost:5601
- View logs from Elasticsearch
- Create dashboards and alerts

### Prometheus (Metrics)
- URL: http://localhost:9090
- Query metrics using PromQL
- View alerts and targets

### Grafana (Dashboards)
- URL: http://localhost:3000
- Default credentials: admin/admin
- Create custom dashboards
- Set up alerts

### Sentry (Error Tracking)
- URL: http://localhost:9000
- Track errors and exceptions
- Set up notifications

## Structured Logging

### Basic Usage

```typescript
import { structuredLogger } from './utils/structured-logger';

// Simple logging
structuredLogger.info('User enrolled in course');

// Logging with context
structuredLogger.info('User enrolled in course', {
  userId: 'user-123',
  courseId: 'course-456',
  enrollmentId: 'enrollment-789',
});

// Logging with metadata
structuredLogger.info('Payment processed', 
  { userId: 'user-123' },
  { amount: 99.99, currency: 'USD', paymentMethod: 'stripe' }
);

// Error logging
structuredLogger.error('Payment failed', error, 
  { userId: 'user-123' },
  { amount: 99.99, errorCode: 'PAYMENT_DECLINED' }
);
```

### Child Logger with Context

```typescript
const childLogger = structuredLogger.createChildLogger({
  userId: 'user-123',
  courseId: 'course-456',
  requestId: 'req-789',
});

// All logs from this child logger include the context
childLogger.info('Module completed');
childLogger.logBusinessEvent('course_completion', { score: 95 });
```

### Business Event Logging

```typescript
structuredLogger.logBusinessEvent('enrollment_created', {
  studentId: 'student-123',
  courseId: 'course-456',
  tier: 'premium',
  price: 99.99,
});

structuredLogger.logBusinessEvent('conversion_triggered', {
  studentId: 'student-123',
  eventType: 'module_completion',
  offerType: 'upgrade_discount',
  discount: 50,
});
```

## Prometheus Metrics

### API Metrics

- `http_request_duration_seconds` - Request latency histogram
- `http_requests_total` - Total requests counter
- `http_errors_total` - Total errors counter

### Database Metrics

- `db_query_duration_seconds` - Query latency histogram
- `db_queries_total` - Total queries counter
- `db_connection_pool_size` - Connection pool gauge

### Business Metrics

- `enrollments_total` - Total enrollments counter
- `course_completions_total` - Total completions counter
- `conversions_total` - Total conversions counter
- `revenueTotal` - Total revenue counter
- `active_students` - Active students gauge
- `active_courses` - Active courses gauge

### AI Engine Metrics

- `ai_query_duration_seconds` - AI query latency histogram
- `ai_queries_total` - Total AI queries counter
- `ai_errors_total` - Total AI errors counter

### Cache Metrics

- `cache_hits_total` - Cache hits counter
- `cache_misses_total` - Cache misses counter
- `cache_size_bytes` - Cache size gauge

## Grafana Dashboards

### Creating a Dashboard

1. Go to http://localhost:3000
2. Click "Create" → "Dashboard"
3. Add panels with PromQL queries

### Example Queries

**Request Rate:**
```promql
rate(http_requests_total[5m])
```

**Error Rate:**
```promql
rate(http_errors_total[5m]) / rate(http_requests_total[5m])
```

**API Latency (p95):**
```promql
histogram_quantile(0.95, http_request_duration_seconds)
```

**Conversion Rate:**
```promql
rate(conversions_total[1h]) / rate(enrollments_total[1h])
```

**Active Students:**
```promql
active_students
```

## Sentry Error Tracking

### Configuration

Set `SENTRY_DSN` in your environment:

```env
SENTRY_DSN=https://your-key@sentry.io/project-id
```

### Automatic Error Capture

Errors are automatically captured and sent to Sentry:

```typescript
structuredLogger.error('Payment failed', error, context, metadata);
```

### Manual Error Capture

```typescript
import * as Sentry from '@sentry/node';

Sentry.captureException(error, {
  tags: { service: 'education-revenue-engine' },
  contexts: { custom: context },
  extra: metadata,
});
```

## Health Checks

### Basic Health Check

```bash
curl http://localhost:3020/monitoring/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 5,
      "message": "Database connection successful",
      "lastChecked": "2024-01-15T10:30:00.000Z"
    },
    "cache": { ... },
    "aiEngines": { ... },
    "memory": { ... }
  },
  "metrics": {
    "requestsPerSecond": 150,
    "errorRate": 0.5,
    "averageResponseTime": 45,
    "activeConnections": 25
  }
}
```

### Kubernetes Probes

**Liveness Probe:**
```yaml
livenessProbe:
  httpGet:
    path: /monitoring/health/live
    port: 3020
  initialDelaySeconds: 10
  periodSeconds: 10
```

**Readiness Probe:**
```yaml
readinessProbe:
  httpGet:
    path: /monitoring/health/ready
    port: 3020
  initialDelaySeconds: 5
  periodSeconds: 5
```

## Alerts

### Configured Alerts

The system includes alerts for:

- High error rate (>5%)
- Slow API responses (p95 > 2s)
- Slow database queries (>1s)
- High database error rate (>1%)
- High AI engine latency (p95 > 5s)
- High AI engine error rate (>10%)
- Low cache hit rate (<50%)
- High memory usage (>90%)
- Low conversion rate (<30%)
- High churn rate (>20%)
- Service down
- High request rate (>1000 req/s)

### Viewing Alerts

1. Go to http://localhost:9090/alerts
2. View active alerts
3. Check alert status and details

## Performance Monitoring

### Slow Request Logging

Requests slower than 1 second are automatically logged:

```
[2024-01-15 10:30:00] [WARN] Slow request detected: GET /api/v1/courses took 1250ms
```

### Database Query Monitoring

Database queries are tracked and slow queries are logged:

```typescript
// Queries slower than 100ms are flagged
structuredLogger.debug('DB SELECT on courses', context, {
  operation: 'SELECT',
  table: 'courses',
  duration: 150,
});
```

### AI Engine Monitoring

AI engine operations are tracked:

```typescript
structuredLogger.logAiOperation(
  'elara',
  'tutoring_query',
  2500,
  'success',
  context
);
```

## Troubleshooting

### Logs Not Appearing in Kibana

1. Check Elasticsearch is running: `curl http://localhost:9200`
2. Verify `ELK_HOST` and `ELK_PORT` in environment
3. Check application logs for errors

### Metrics Not Appearing in Prometheus

1. Check Prometheus is running: `curl http://localhost:9090`
2. Verify `/monitoring/metrics` endpoint is accessible
3. Check Prometheus configuration in `prometheus.yml`

### Sentry Not Receiving Errors

1. Verify `SENTRY_DSN` is set correctly
2. Check Sentry service is running
3. Verify error is being logged with `structuredLogger.error()`

### High Memory Usage

1. Check memory metrics in Grafana
2. Review slow queries in database logs
3. Check cache size and hit rate
4. Consider increasing Node.js heap size

## Best Practices

1. **Use Structured Logging** - Always include context and metadata
2. **Log Business Events** - Track important business metrics
3. **Monitor AI Engines** - Track latency and error rates
4. **Set Up Alerts** - Configure alerts for critical metrics
5. **Review Dashboards** - Regularly check Grafana dashboards
6. **Analyze Errors** - Review Sentry for error patterns
7. **Optimize Slow Queries** - Use database metrics to identify bottlenecks
8. **Cache Effectively** - Monitor cache hit rates and optimize

## Production Deployment

### Environment Variables

```env
LOG_LEVEL=warn
LOG_REQUEST_BODY=false
SENTRY_DSN=https://your-production-key@sentry.io/project-id
SENTRY_TRACE_SAMPLE_RATE=0.01
ELK_HOST=elasticsearch.production.internal
ELK_PORT=9200
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: education-engine
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: education-engine
        image: education-engine:latest
        ports:
        - containerPort: 3020
        livenessProbe:
          httpGet:
            path: /monitoring/health/live
            port: 3020
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /monitoring/health/ready
            port: 3020
          initialDelaySeconds: 5
          periodSeconds: 5
        env:
        - name: LOG_LEVEL
          value: "warn"
        - name: SENTRY_DSN
          valueFrom:
            secretKeyRef:
              name: sentry-config
              key: dsn
```

## Additional Resources

- [Winston Documentation](https://github.com/winstonjs/winston)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Sentry Documentation](https://docs.sentry.io/)
- [ELK Stack Documentation](https://www.elastic.co/guide/index.html)
