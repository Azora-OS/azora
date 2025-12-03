/**
 * Express middleware for OpenTelemetry tracing
 * Automatically traces all HTTP requests and responses
 */

import { Request, Response, NextFunction } from 'express';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

/**
 * Middleware to trace HTTP requests
 */
export function createTracingMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const tracer = trace.getTracer('express-http');
    
    // Create span for this request
    const span = tracer.startSpan(`${req.method} ${req.path}`, {
      attributes: {
        'http.method': req.method,
        'http.url': req.url,
        'http.target': req.path,
        'http.host': req.hostname,
        'http.scheme': req.protocol,
        'http.client_ip': req.ip,
        'http.user_agent': req.get('user-agent'),
      },
    });

    // Store trace context in request for child spans
    (req as any).span = span;
    (req as any).traceId = span.spanContext().traceId;
    (req as any).spanId = span.spanContext().spanId;

    // Capture response
    const originalSend = res.send;
    res.send = function (data: any) {
      span.setAttributes({
        'http.status_code': res.statusCode,
        'http.response_content_length': Buffer.byteLength(JSON.stringify(data)),
      });

      if (res.statusCode >= 400) {
        span.setStatus({ code: SpanStatusCode.ERROR });
      } else {
        span.setStatus({ code: SpanStatusCode.OK });
      }

      span.end();
      return originalSend.call(this, data);
    };

    // Run handler in span context
    context.with(trace.setSpan(context.active(), span), () => {
      next();
    });
  };
}

/**
 * Create a child span for database operations
 */
export function createDatabaseSpan(
  operation: string,
  query: string,
  attributes?: Record<string, any>
) {
  const tracer = trace.getTracer('database');
  const span = tracer.startSpan(`db.${operation}`, {
    attributes: {
      'db.operation': operation,
      'db.statement': query,
      ...attributes,
    },
  });

  return span;
}

/**
 * Create a child span for external service calls
 */
export function createServiceSpan(
  serviceName: string,
  method: string,
  path: string,
  attributes?: Record<string, any>
) {
  const tracer = trace.getTracer('http-client');
  const span = tracer.startSpan(`${serviceName}.${method}`, {
    attributes: {
      'http.method': method,
      'http.url': path,
      'peer.service': serviceName,
      ...attributes,
    },
  });

  return span;
}

/**
 * Record an error in the current span
 */
export function recordSpanError(error: Error, span?: any) {
  const targetSpan = span || trace.getActiveSpan();
  if (targetSpan) {
    targetSpan.recordException(error);
    targetSpan.setStatus({ code: SpanStatusCode.ERROR });
  }
}

/**
 * Add custom attributes to current span
 */
export function addSpanAttributes(attributes: Record<string, any>) {
  const span = trace.getActiveSpan();
  if (span) {
    span.setAttributes(attributes);
  }
}

/**
 * Create a child span for cache operations
 */
export function createCacheSpan(
  operation: string,
  key: string,
  attributes?: Record<string, any>
) {
  const tracer = trace.getTracer('cache');
  const span = tracer.startSpan(`cache.${operation}`, {
    attributes: {
      'cache.operation': operation,
      'cache.key': key,
      ...attributes,
    },
  });

  return span;
}

/**
 * Create a child span for business operations
 */
export function createBusinessSpan(
  operation: string,
  attributes?: Record<string, any>
) {
  const tracer = trace.getTracer('business');
  const span = tracer.startSpan(`business.${operation}`, {
    attributes,
  });

  return span;
}

export default {
  createTracingMiddleware,
  createDatabaseSpan,
  createServiceSpan,
  recordSpanError,
  addSpanAttributes,
  createCacheSpan,
  createBusinessSpan,
};
