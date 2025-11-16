# Distributed Tracing Setup Guide

This guide explains how to integrate OpenTelemetry distributed tracing into any Azora service.

## Quick Start

### 1. Install Dependencies

```bash
npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-jaeger-http @opentelemetry/sdk-trace-node @opentelemetry/resources @opentelemetry/semantic-conventions @opentelemetry/core @opentelemetry/instrumentation
```

### 2. Initialize Tracing at Service Startup

Add this to the very beginning of your service (before any other imports):

```typescript
import { initializeTracing } from '../shared/tracing';

// Initialize tracing FIRST
initializeTracing('your-service-name');

// Then import everything else
import express from 'express';
// ... rest of imports
```

### 3. Add Tracing Middleware

```typescript
import { createTracingMiddleware } from '../shared/tracing/express-middleware';

const app = express();

// Add tracing middleware early in the stack
app.use(createTracingMiddleware());

// ... rest of middleware
```

### 4. Trace Database Operations

```typescript
import { createDatabaseSpan } from '../shared/tracing/express-middleware';

async function queryDatabase(query: string) {
  const span = createDatabaseSpan('query', query, {
    'db.system': 'postgresql',
    'db.name': 'azora_db',
  });

  try {
    const result = await db.query(query);
    span.end();
    return result;
  } catch (error) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR });
    span.end();
    throw error;
  }
}
```

### 5. Trace External Service Calls

```typescript
import { createServiceSpan } from '../shared/tracing/express-middleware';

async function callExternalService(serviceName: string, endpoint: string) {
  const span = createServiceSpan(serviceName, 'GET', endpoint);

  try {
    const response = await fetch(endpoint);
    span.setAttributes({
      'http.status_code': response.status,
    });
    span.end();
    return response;
  } catch (error) {
    span.recordException(error);
    span.end();
    throw error;
  }
}
```

### 6. Trace Business Operations

```typescript
import { createBusinessSpan } from '../shared/tracing/express-middleware';

async function enrollStudent(studentId: string, courseId: string) {
  const span = createBusinessSpan('student.enroll', {
    'student.id': studentId,
    'course.id': courseId,
  });

  try {
    // Enrollment logic
    span.addEvent('enrollment_started');
    // ... do work
    span.addEvent('enrollment_completed');
    span.end();
  } catch (error) {
    span.recordException(error);
    span.end();
    throw error;
  }
}
```

## Environment Variables

```bash
# Jaeger configuration
JAEGER_ENDPOINT=http://localhost:14268/api/traces
SERVICE_VERSION=1.0.0

# Optional: Jaeger agent (for UDP)
JAEGER_AGENT_HOST=localhost
JAEGER_AGENT_PORT=6831
```

## Viewing Traces

1. **Jaeger UI**: http://localhost:16686
2. **Search by Service**: Select service from dropdown
3. **Filter by Trace ID**: Use trace ID from logs
4. **View Span Details**: Click on spans to see attributes

## Trace Context Propagation

Trace context is automatically propagated across services using W3C Trace Context headers:

```
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
```

This is automatically handled by OpenTelemetry instrumentation.

## Performance Considerations

- **Sampling**: By default, all traces are collected. For high-traffic services, consider sampling:
  ```typescript
  const sampler = new ProbabilitySampler(0.1); // 10% sampling
  ```

- **Batch Processing**: Spans are batched before export (default: 512 spans)

- **Overhead**: <1% performance impact with batch processing

## Troubleshooting

### Traces not appearing in Jaeger

1. Check Jaeger is running: `docker ps | grep jaeger`
2. Verify endpoint: `curl http://localhost:14268/api/traces`
3. Check service logs for errors
4. Ensure `initializeTracing()` is called first

### High memory usage

1. Reduce sampling rate
2. Decrease batch size
3. Increase flush interval

### Missing trace context

1. Ensure middleware is added early
2. Check that services are calling each other with proper headers
3. Verify W3C Trace Context propagation

## Best Practices

1. **Initialize Early**: Call `initializeTracing()` before any other code
2. **Use Meaningful Names**: Span names should describe the operation
3. **Add Attributes**: Include relevant context (user ID, resource ID, etc.)
4. **Handle Errors**: Always record exceptions in spans
5. **Batch Operations**: Group related operations in a single span
6. **Avoid PII**: Don't include sensitive data in span attributes

## Advanced Usage

### Custom Tracer

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('my-module', '1.0.0');
const span = tracer.startSpan('my-operation');
```

### Span Events

```typescript
span.addEvent('user_action', {
  'action.type': 'login',
  'user.id': userId,
});
```

### Span Links

```typescript
const span = tracer.startSpan('operation', {
  links: [{ context: otherSpan.spanContext() }],
});
```

## Support

For issues or questions, refer to:
- OpenTelemetry Docs: https://opentelemetry.io/docs/
- Jaeger Docs: https://www.jaegertracing.io/docs/
- Azora Observability Spec: `.kiro/specs/observability/`
