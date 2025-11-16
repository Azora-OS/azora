/**
 * OpenTelemetry Distributed Tracing Setup
 * Provides centralized tracing configuration for all Azora services
 */

import { NodeTracerProvider } from '@opentelemetry/node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { CompositePropagator, HttpTraceContextPropagator } from '@opentelemetry/core';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

/**
 * Initialize OpenTelemetry tracing for a service
 */
export function initializeTracing(serviceName: string) {
  const jaegerExporter = new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
  });

  const tracerProvider = new NodeTracerProvider({
    resource: Resource.default().merge(
      new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        [SemanticResourceAttributes.SERVICE_VERSION]: process.env.SERVICE_VERSION || '1.0.0',
      }),
    ),
  });

  tracerProvider.addSpanProcessor(new BatchSpanProcessor(jaegerExporter));
  tracerProvider.register();

  // Register auto-instrumentations
  registerInstrumentations({
    instrumentations: [getNodeAutoInstrumentations()],
  });

  return tracerProvider;
}

/**
 * Get the global tracer instance
 */
export function getTracer(name: string) {
  return trace.getTracer(name);
}

/**
 * Express middleware for automatic request tracing
 */
export function tracingMiddleware() {
  return (req: any, res: any, next: any) => {
    const tracer = getTracer('express');
    const span = tracer.startSpan(`${req.method} ${req.path}`);

    // Set span attributes
    span.setAttributes({
      'http.method': req.method,
      'http.url': req.url,
      'http.target': req.path,
      'http.host': req.hostname,
      'http.scheme': req.protocol,
      'http.client_ip': req.ip,
    });

    // Add trace ID to request for logging
    req.traceId = span.spanContext().traceId;
    req.spanId = span.spanContext().spanId;

    // Wrap response to capture status
    const originalSend = res.send;
    res.send = function (data: any) {
      span.setAttributes({
        'http.status_code': res.statusCode,
      });

      if (res.statusCode >= 400) {
        span.setStatus({ code: SpanStatusCode.ERROR });
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
export function createDatabaseSpan(operation: string, query: string) {
  const tracer = getTracer('database');
  const span = tracer.startSpan(`db.${operation}`);

  span.setAttributes({
    'db.operation': operation,
    'db.statement': query,
  });

  return span;
}

/**
 * Create a child span for external service calls
 */
export function createServiceSpan(serviceName: string, method: string, path: string) {
  const tracer = getTracer('http-client');
  const span = tracer.startSpan(`${serviceName}.${method}`);

  span.setAttributes({
    'http.method': method,
    'http.url': path,
    'peer.service': serviceName,
  });

  return span;
}

/**
 * Record an error in the current span
 */
export function recordError(error: Error) {
  const span = trace.getActiveSpan();
  if (span) {
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR });
  }
}

export default {
  initializeTracing,
  getTracer,
  tracingMiddleware,
  createDatabaseSpan,
  createServiceSpan,
  recordError,
};
