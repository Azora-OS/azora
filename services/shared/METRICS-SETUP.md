# Prometheus Metrics Setup Guide

This guide explains how to integrate Prometheus metrics into any Azora service.

## Quick Start

### 1. Install Dependencies

```bash
npm install prom-client
```

### 2. Add Metrics Middleware

```typescript
import express from 'express';
import { metricsMiddleware, metricsEndpoint } from '../shared/metrics';

const app = express();
const SERVICE_NAME = 'your-service-name';

// Add metrics middleware early
app.use(metricsMiddleware(SERVICE_NAME));

// Expose metrics endpoint for Prometheus
app.get('/metrics', metricsEndpoint);
```

### 3. Record Custom Metrics

```typescript
import {
  recordEnrollment,
  recordTransaction,
  recordAuthAttempt,
  recordError,
} from '../shared/metrics';

// Record enrollment
recordEnrollment('course-123', 'success');

// Record transaction
recordTransaction('deposit', 'success', 'USD');

// Record auth attempt
recordAuthAttempt('password', true);

// Record error
recordError('your-service', 'database_error', 'high');
```

## Available Metrics

### HTTP Metrics
- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request latency

### Database Metrics
- `db_query_duration_seconds` - Query duration
- `db_connection_pool_used` - Active connections
- `db_connection_pool_max` - Max connections

### Business Metrics
- `enrollments_total` - Course enrollments
- `transactions_total` - Financial transactions
- `jobs_posted_total` - Job postings
- `applications_received_total` - Job applications

### Authentication Metrics
- `auth_attempts_total` - Auth attempts
- `auth_failures_total` - Auth failures

### Cache Metrics
- `cache_hits_total` - Cache hits
- `cache_misses_total` - Cache misses

### Error Metrics
- `errors_total` - Total errors by type

## Usage Examples

### Record Database Query

```typescript
import { recordDatabaseQuery } from '../shared/metrics';

async function queryDatabase(query: string) {
  const start = Date.now();
  try {
    const result = await db.query(query);
    const duration = (Date.now() - start) / 1000;
    recordDatabaseQuery('select', 'users', duration, 'success');
    return result;
  } catch (error) {
    const duration = (Date.now() - start) / 1000;
    recordDatabaseQuery('select', 'users', duration, 'error');
    throw error;
  }
}
```

### Record Authentication

```typescript
import { recordAuthAttempt } from '../shared/metrics';

async function login(email: string, password: string) {
  try {
    const user = await authenticateUser(email, password);
    recordAuthAttempt('password', true);
    return user;
  } catch (error) {
    recordAuthAttempt('password', false);
    throw error;
  }
}
```

### Record Business Events

```typescript
import { recordEnrollment, recordTransaction } from '../shared/metrics';

async function enrollStudent(studentId: string, courseId: string) {
  try {
    await db.enrollments.create({ studentId, courseId });
    recordEnrollment(courseId, 'success');
  } catch (error) {
    recordEnrollment(courseId, 'failed');
    throw error;
  }
}

async function processPayment(userId: string, amount: number) {
  try {
    await stripe.charges.create({ amount, customer: userId });
    recordTransaction('payment', 'success', 'USD');
  } catch (error) {
    recordTransaction('payment', 'failed', 'USD');
    throw error;
  }
}
```

### Update Connection Pool

```typescript
import { updateConnectionPool } from '../shared/metrics';

// In your database initialization
const pool = new Pool({ max: 20 });

setInterval(() => {
  updateConnectionPool('your-service', pool.totalCount - pool.idleCount, pool.max);
}, 10000);
```

## Prometheus Configuration

Add to `observability/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'your-service'
    static_configs:
      - targets: ['localhost:PORT']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

## Querying Metrics

### Request Rate
```promql
rate(http_requests_total[5m])
```

### Error Rate
```promql
rate(http_requests_total{status_code=~"5.."}[5m]) / rate(http_requests_total[5m])
```

### P95 Latency
```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### Enrollments per Hour
```promql
rate(enrollments_total[1h])
```

### Transaction Success Rate
```promql
rate(transactions_total{status="success"}[5m]) / rate(transactions_total[5m])
```

## Best Practices

1. **Use Consistent Labels** - Keep label names consistent across services
2. **Record at Source** - Record metrics where events occur
3. **Avoid High Cardinality** - Don't use unbounded values as labels
4. **Use Appropriate Buckets** - Histogram buckets should match your SLOs
5. **Document Metrics** - Add help text to all metrics

## Performance Considerations

- Metrics collection has minimal overhead (<1ms per request)
- Use sampling for high-traffic endpoints if needed
- Batch metric updates when possible
- Monitor metrics endpoint performance

## Troubleshooting

### Metrics not appearing in Prometheus

1. Check `/metrics` endpoint returns data:
   ```bash
   curl http://localhost:PORT/metrics
   ```

2. Verify Prometheus config includes service:
   ```bash
   curl http://localhost:9090/api/v1/targets
   ```

3. Check service logs for errors

### High cardinality issues

- Avoid using user IDs or request IDs as labels
- Use fixed categories instead
- Aggregate high-cardinality data separately

### Memory usage

- Limit number of metrics
- Use appropriate histogram buckets
- Clean up old metrics regularly

## Support

For issues or questions, refer to:
- Prometheus Docs: https://prometheus.io/docs/
- prom-client: https://github.com/siimon/prom-client
- Azora Observability Spec: `.kiro/specs/observability/`
