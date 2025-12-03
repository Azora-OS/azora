# Winston Structured Logging Setup Guide

This guide explains how to integrate Winston structured logging into any Azora service.

## Quick Start

### 1. Install Dependencies

```bash
npm install winston
```

### 2. Create Logger Instance

```typescript
import { createLogger, requestLoggingMiddleware } from '../shared/logging';

const logger = createLogger('your-service-name');

// Add to Express app
app.use(requestLoggingMiddleware(logger));
```

### 3. Use Logger Throughout Service

```typescript
import { logInfo, logError, logBusinessEvent } from '../shared/logging';

// Log info
logInfo(logger, 'User logged in', { userId: '123' });

// Log error
try {
  await someOperation();
} catch (error) {
  logError(logger, 'Operation failed', error, { userId: '123' });
}

// Log business event
logBusinessEvent(logger, 'course_enrolled', userId, { courseId: '456' });
```

## Log Levels

- **debug** - Detailed debugging information
- **info** - General informational messages
- **warn** - Warning messages for potentially harmful situations
- **error** - Error messages for error events

## Available Functions

### General Logging

```typescript
logInfo(logger, 'message', { key: 'value' });
logWarn(logger, 'message', { key: 'value' });
logError(logger, 'message', error, { key: 'value' });
logDebug(logger, 'message', { key: 'value' });
```

### Database Operations

```typescript
logDatabaseOperation(
  logger,
  'select',      // operation
  'users',       // table
  45,            // duration in ms
  true,          // success
  error          // optional error
);
```

### Authentication Events

```typescript
logAuthEvent(logger, 'login', userId, { ip: '192.168.1.1' });
logAuthEvent(logger, 'failed_login', undefined, { email: 'user@example.com' });
logAuthEvent(logger, 'mfa_enabled', userId);
logAuthEvent(logger, 'password_reset', userId);
```

### Business Events

```typescript
logBusinessEvent(logger, 'course_enrolled', userId, {
  courseId: '456',
  courseName: 'Python 101',
});

logBusinessEvent(logger, 'job_applied', userId, {
  jobId: '789',
  companyId: '101',
});
```

### Payment Events

```typescript
logPaymentEvent(
  logger,
  'payment_completed',
  'txn_123',
  99.99,
  'USD',
  { userId: '456', method: 'stripe' }
);

logPaymentEvent(
  logger,
  'refund_issued',
  'txn_123',
  99.99,
  'USD',
  { reason: 'customer_request' }
);
```

### Error with Context

```typescript
try {
  await complexOperation();
} catch (error) {
  logErrorWithContext(logger, error, 'complexOperation', {
    userId: '123',
    operationId: 'op_456',
  });
}
```

## Log Output

### Console Output (Development)
```
2025-01-14 12:34:56 [auth-service] info: User logged in { userId: '123' }
2025-01-14 12:34:57 [auth-service] error: Login failed { error: 'Invalid credentials' }
```

### File Output (JSON)
```json
{
  "timestamp": "2025-01-14 12:34:56",
  "level": "info",
  "service": "auth-service",
  "message": "User logged in",
  "userId": "123"
}
```

## Log Files

Logs are stored in `logs/` directory:
- `{service}-all.log` - All logs
- `{service}-error.log` - Errors only

Each file:
- Max size: 10MB
- Max files: 5 (rotated)
- Format: JSON

## Loki Integration

Logs are automatically sent to Loki via:
1. File output (picked up by Promtail)
2. Direct HTTP endpoint (optional)

### Configure Promtail

Add to `observability/promtail-config.yml`:

```yaml
scrape_configs:
  - job_name: azora-services
    static_configs:
      - targets:
          - localhost
        labels:
          job: azora-services
          __path__: /path/to/logs/*.log
```

## Querying Logs in Grafana

### All logs from a service
```logql
{service="auth-service"}
```

### Error logs only
```logql
{service="auth-service"} | json | level="error"
```

### Logs for specific user
```logql
{service="auth-service"} | json | userId="123"
```

### Failed authentication attempts
```logql
{service="auth-service"} | json | event="failed_login"
```

### Payment transactions
```logql
{service="azora-mint"} | json | event=~"payment_.*"
```

## Best Practices

1. **Use Structured Logging** - Always include relevant context
2. **Include Trace IDs** - Link logs to traces
3. **Log at Right Level** - Use appropriate log level
4. **Avoid PII** - Don't log sensitive data
5. **Use Consistent Keys** - Keep field names consistent
6. **Log Errors with Stack** - Always include stack traces
7. **Add Context** - Include user ID, request ID, etc.

## Performance Considerations

- Logging has minimal overhead (<1ms per request)
- File rotation prevents disk space issues
- JSON format enables efficient parsing
- Batch log shipping to Loki

## Troubleshooting

### Logs not appearing in files

1. Check logs directory exists:
   ```bash
   mkdir -p logs
   ```

2. Check file permissions:
   ```bash
   ls -la logs/
   ```

3. Check service logs for errors

### Logs not in Loki

1. Verify Loki is running:
   ```bash
   curl http://localhost:3100/loki/api/v1/status
   ```

2. Check Promtail configuration
3. Verify log file paths

### High disk usage

- Reduce log retention
- Increase rotation size
- Archive old logs

## Environment Variables

```bash
# Log level (debug, info, warn, error)
LOG_LEVEL=info

# Log directory
LOG_DIR=./logs

# Max log file size (bytes)
LOG_MAX_SIZE=10485760

# Max log files to keep
LOG_MAX_FILES=5
```

## Support

For issues or questions, refer to:
- Winston Docs: https://github.com/winstonjs/winston
- Loki Docs: https://grafana.com/docs/loki/
- Azora Observability Spec: `.kiro/specs/observability/`
