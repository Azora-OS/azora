# Performance Monitoring Setup

## Overview

This document describes the performance monitoring infrastructure implemented for Azora OS. The system provides real-time monitoring of API latency, database query performance, and error rates with automated alerting.

## Components Implemented

### 1. Performance Middleware

**File**: `services/shared/middleware/performance.ts`

The performance middleware automatically tracks:

- **API Response Times**: Measures duration of all HTTP requests
- **Database Query Performance**: Tracks database operation durations
- **Error Rates**: Monitors HTTP error rates in real-time
- **Threshold Violations**: Alerts when metrics exceed configured thresholds

**Key Features**:
- Prometheus metrics collection
- Structured logging with Winston
- Configurable thresholds via environment variables
- Real-time error rate calculation
- Automatic alerting on performance degradation

**Environment Variables**:
```bash
PERF_API_LATENCY_MS=100      # API latency threshold (default: 100ms)
PERF_DB_QUERY_MS=50          # Database query threshold (default: 50ms)
PERF_ERROR_RATE=0.001        # Error rate threshold (default: 0.1%)
```

### 2. Grafana Dashboard

**File**: `observability/grafana/provisioning/dashboards/performance-dashboard.json`

The performance dashboard provides visualization of:

- **API Latency Percentiles**: P50, P95, P99 latency trends
- **API Latency Gauge**: Current P95 latency with color-coded thresholds
- **Database Query Time**: Query performance percentiles
- **Error Rate Gauge**: Current error rate with thresholds
- **Request Throughput**: Requests per second by status code
- **Slow Requests**: Count of requests exceeding latency threshold
- **Slow Queries**: Count of database queries exceeding threshold

**Access**: http://localhost:3000/d/azora-performance

### 3. Prometheus Alerts

**File**: `observability/alert-rules.yml`

Configured alerts:

| Alert | Threshold | Duration | Severity |
|-------|-----------|----------|----------|
| HighAPILatency | P95 > 100ms | 5m | Warning |
| CriticalAPILatency | P95 > 200ms | 2m | Critical |
| SlowDatabaseQueries | P95 > 50ms | 5m | Warning |
| CriticalDatabaseQueries | P95 > 100ms | 2m | Critical |
| HighErrorRate | >0.1% | 5m | Warning |
| CriticalErrorRate | >1% | 2m | Critical |

### 4. Performance Benchmarks

**File**: `docs/PERFORMANCE-BENCHMARKS.md`

Establishes:
- Performance targets for all metrics
- Baseline metrics (established 2024-11-15)
- Per-service performance budgets
- Monitoring and alerting configuration
- Performance optimization strategies
- Performance testing procedures

### 5. Performance Budget

**File**: `docs/PERFORMANCE-BUDGET.md`

Defines:
- Total performance budget allocation
- Per-service budget breakdown
- Database query budget
- Frontend asset budget
- Budget tracking and enforcement
- Optimization strategies
- Budget adjustment process

## Metrics Collected

### HTTP Request Metrics

```
http_request_duration_ms (Histogram)
  - Labels: method, route, status_code
  - Buckets: 10, 50, 100, 200, 500, 1000, 2000, 5000 ms
  - Measures: API response time

http_requests_total (Counter)
  - Labels: method, route, status_code
  - Measures: Total HTTP requests

http_error_rate (Gauge)
  - Labels: service
  - Measures: Current error rate (0-1)

slow_requests_total (Counter)
  - Labels: method, route
  - Measures: Requests exceeding latency threshold
```

### Database Query Metrics

```
db_query_duration_ms (Histogram)
  - Labels: operation, model
  - Buckets: 5, 10, 25, 50, 100, 250, 500, 1000 ms
  - Measures: Database query duration

db_queries_total (Counter)
  - Labels: operation, model, status
  - Measures: Total database queries

slow_queries_total (Counter)
  - Labels: operation, model
  - Measures: Queries exceeding duration threshold
```

## Integration Guide

### Using Performance Middleware

```typescript
import express from 'express';
import { performanceMiddleware, trackDbQuery } from '../shared/middleware/performance';

const app = express();

// Add performance middleware early in the stack
app.use(performanceMiddleware);

// Track database queries
async function getUser(userId: string) {
  const start = Date.now();
  try {
    const user = await db.users.findById(userId);
    const duration = Date.now() - start;
    trackDbQuery('select', 'users', duration, 'success');
    return user;
  } catch (error) {
    const duration = Date.now() - start;
    trackDbQuery('select', 'users', duration, 'error');
    throw error;
  }
}
```

### Accessing Metrics

```typescript
import { getPerformanceStats, getMetrics } from '../shared/middleware/performance';

// Get current statistics
const stats = getPerformanceStats();
console.log(stats);
// Output:
// {
//   totalRequests: 10000,
//   errorRequests: 5,
//   errorRate: '0.05%',
//   thresholds: { API_LATENCY_MS: 100, DB_QUERY_MS: 50, ERROR_RATE: 0.001 }
// }

// Get Prometheus metrics
const metrics = await getMetrics();
console.log(metrics);
```

## Monitoring & Alerting

### Real-Time Monitoring

Performance metrics are scraped by Prometheus every 10 seconds:

```yaml
scrape_configs:
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['localhost:4000']
    metrics_path: '/metrics'
    scrape_interval: 10s
```

### Alert Delivery

Alerts are sent via Alertmanager:

```yaml
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - localhost:9093
```

### Viewing Alerts

- **Prometheus Alerts**: http://localhost:9090/alerts
- **Alertmanager**: http://localhost:9093
- **Grafana Alerts**: http://localhost:3000/alerting/list

## Performance Targets

### API Response Times

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| P50 | <50ms | >75ms | >150ms |
| P95 | <100ms | >150ms | >200ms |
| P99 | <200ms | >300ms | >500ms |

### Database Query Performance

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| P50 | <10ms | >25ms | >50ms |
| P95 | <50ms | >75ms | >100ms |
| P99 | <100ms | >150ms | >250ms |

### Error Rates

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Error Rate | <0.01% | >0.1% | >1% |

## Troubleshooting

### Metrics Not Appearing

1. Check middleware is applied:
   ```typescript
   app.use(performanceMiddleware);
   ```

2. Verify metrics endpoint:
   ```bash
   curl http://localhost:PORT/metrics
   ```

3. Check Prometheus configuration:
   ```bash
   curl http://localhost:9090/api/v1/targets
   ```

### High Latency Alerts

1. Check dashboard for slow endpoints
2. Profile the code to identify bottleneck
3. Check database query performance
4. Review resource utilization
5. Implement optimization (caching, indexing, etc.)

### High Error Rate Alerts

1. Check error logs
2. Identify error pattern
3. Review recent code changes
4. Implement fix
5. Monitor for recovery

## Best Practices

1. **Monitor Continuously**: Check dashboards regularly
2. **Respond to Alerts**: Investigate and fix issues promptly
3. **Optimize Proactively**: Don't wait for alerts to optimize
4. **Track Trends**: Monitor performance trends over time
5. **Document Changes**: Record optimizations and their impact
6. **Test Performance**: Run load tests before deployment
7. **Set Budgets**: Enforce performance budgets in code review

## References

- [Performance Benchmarks](./PERFORMANCE-BENCHMARKS.md)
- [Performance Budget](./PERFORMANCE-BUDGET.md)
- [SLO](./SLO.md)
- [Observability Setup](./OBSERVABILITY-SETUP.md)
- [Performance Middleware](../services/shared/middleware/performance.ts)
- [Grafana Dashboard](../observability/grafana/provisioning/dashboards/performance-dashboard.json)
- [Alert Rules](../observability/alert-rules.yml)
