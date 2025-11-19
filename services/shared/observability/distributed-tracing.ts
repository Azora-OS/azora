/**
 * Distributed Tracing Implementation
 * OpenTelemetry integration for request tracing across services
 */

import {
  NodeTracerProvider,
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { registerInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  BasicTracerProvider,
  SimpleSpanProcessor,
  SpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { CompositePropagator, HttpTraceContextPropagator } from '@opentelemetry/core';
import { JaegerPropagator } from '@opentelemetry/jaeger-propagator';
import { Request, Response, NextFunction } from 'express';

/**
 * Initialize Distributed Tracing
 */
export class DistributedTracingSetup {
  private static tracerProvider: NodeTracerProvider;
  private static jaegerExporter: JaegerExporter;

  /**
   * Initialize tracing with Jaeger exporter
   */
  static initialize(serviceName: string, environment: string = 'production') {
    // Create resource
    const resource = Resource.default().merge(
      new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION || '1.0.0',
        environment,
        'service.namespace': 'azora',
      })
    );

    // Create tracer provider
    this.tracerProvider = new NodeTracerProvider({
      resource,
    });

    // Create Jaeger exporter
    this.jaegerExporter = new JaegerExporter({
      endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
      serviceName,
    });

    // Add span processors
    this.tracerProvider.addSpanProcessor(
      new BatchSpanProcessor(this.jaegerExporter)
    );

    // Add console exporter for development
    if (environment === 'development') {
      this.tracerProvider.addSpanProcessor(
        new SimpleSpanProcessor(new ConsoleSpanExporter())
      );
    }

    // Register auto-instrumentations
    registerInstrumentations({
      tracerProvider: this.tracerProvider,
    });

    // Set global tracer provider
    trace.setGlobalTracerProvider(this.tracerProvider);

    console.log(`Distributed tracing initialized for ${serviceName}`);
  }

  /**
   * Get tracer instance
   */
  static getTracer(name: string, version?: string) {
    return trace.getTracer(name, version);
  }

  /**
   * Shutdown tracing
   */
  static async shutdown() {
    await this.tracerProvider.shutdown();
    console.log('Distributed tracing shutdown complete');
  }
}

/**
 * Express Middleware for Request Tracing
 */
export const tracingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const tracer = trace.getTracer('express-middleware');
  const span = tracer.startSpan(`${req.method} ${req.path}`);

  // Set span attributes
  span.setAttributes({
    'http.method': req.method,
    'http.url': req.url,
    'http.target': req.path,
    'http.host': req.hostname,
    'http.scheme': req.protocol,
    'http.user_agent': req.get('user-agent'),
    'http.client_ip': req.ip,
  });

  // Add trace ID to response headers
  const traceId = span.spanContext().traceId;
  res.setHeader('X-Trace-ID', traceId);

  // Wrap response.end to capture status code
  const originalEnd = res.end;
  res.end = function (...args: any[]) {
    span.setAttributes({
      'http.status_code': res.statusCode,
      'http.response_content_length': res.get('content-length'),
    });

    if (res.statusCode >= 400) {
      span.setStatus({ code: SpanStatusCode.ERROR });
    } else {
      span.setStatus({ code: SpanStatusCode.OK });
    }

    span.end();
    return originalEnd.apply(res, args);
  };

  // Run next middleware in span context
  context.with(trace.setSpan(context.active(), span), () => {
    next();
  });
};

/**
 * Database Query Tracing
 */
export class DatabaseTracing {
  private static tracer = trace.getTracer('database');

  /**
   * Trace database query
   */
  static async traceQuery<T>(
    query: string,
    params: any[],
    executor: () => Promise<T>
  ): Promise<T> {
    const span = this.tracer.startSpan('db.query');

    span.setAttributes({
      'db.system': 'mysql',
      'db.operation': query.split(' ')[0].toUpperCase(),
      'db.statement': query,
      'db.params_count': params.length,
    });

    try {
      const result = await context.with(
        trace.setSpan(context.active(), span),
        executor
      );

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error: any) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Trace transaction
   */
  static async traceTransaction<T>(
    name: string,
    executor: () => Promise<T>
  ): Promise<T> {
    const span = this.tracer.startSpan(`db.transaction.${name}`);

    span.setAttributes({
      'db.transaction': name,
    });

    try {
      const result = await context.with(
        trace.setSpan(context.active(), span),
        executor
      );

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error: any) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  }
}

/**
 * Cache Operation Tracing
 */
export class CacheTracing {
  private static tracer = trace.getTracer('cache');

  /**
   * Trace cache get
   */
  static async traceGet<T>(key: string, executor: () => Promise<T>): Promise<T> {
    const span = this.tracer.startSpan('cache.get');

    span.setAttributes({
      'cache.key': key,
      'cache.operation': 'get',
    });

    try {
      const result = await context.with(
        trace.setSpan(context.active(), span),
        executor
      );

      span.addEvent('cache.hit');
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error: any) {
      span.addEvent('cache.miss');
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Trace cache set
   */
  static async traceSet(
    key: string,
    value: any,
    ttl: number,
    executor: () => Promise<void>
  ): Promise<void> {
    const span = this.tracer.startSpan('cache.set');

    span.setAttributes({
      'cache.key': key,
      'cache.operation': 'set',
      'cache.ttl': ttl,
      'cache.value_size': JSON.stringify(value).length,
    });

    try {
      await context.with(trace.setSpan(context.active(), span), executor);
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error: any) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  }
}

/**
 * External Service Call Tracing
 */
export class ExternalServiceTracing {
  private static tracer = trace.getTracer('external-service');

  /**
   * Trace HTTP call
   */
  static async traceHttpCall<T>(
    method: string,
    url: string,
    executor: () => Promise<T>
  ): Promise<T> {
    const span = this.tracer.startSpan(`http.${method.toLowerCase()}`);

    const urlObj = new URL(url);
    span.setAttributes({
      'http.method': method,
      'http.url': url,
      'http.host': urlObj.hostname,
      'http.scheme': urlObj.protocol.replace(':', ''),
      'http.target': urlObj.pathname,
    });

    try {
      const result = await context.with(
        trace.setSpan(context.active(), span),
        executor
      );

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error: any) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Trace message queue operation
   */
  static async traceQueueOperation(
    operation: string,
    queue: string,
    executor: () => Promise<void>
  ): Promise<void> {
    const span = this.tracer.startSpan(`queue.${operation}`);

    span.setAttributes({
      'messaging.system': 'rabbitmq',
      'messaging.destination': queue,
      'messaging.operation': operation,
    });

    try {
      await context.with(trace.setSpan(context.active(), span), executor);
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (error: any) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  }
}

/**
 * Business Logic Tracing
 */
export class BusinessLogicTracing {
  private static tracer = trace.getTracer('business-logic');

  /**
   * Trace business operation
   */
  static async traceOperation<T>(
    operationName: string,
    attributes: Record<string, any>,
    executor: () => Promise<T>
  ): Promise<T> {
    const span = this.tracer.startSpan(operationName);

    span.setAttributes(attributes);

    try {
      const result = await context.with(
        trace.setSpan(context.active(), span),
        executor
      );

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error: any) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Add event to current span
   */
  static addEvent(name: string, attributes?: Record<string, any>) {
    const span = trace.getActiveSpan();
    if (span) {
      span.addEvent(name, attributes);
    }
  }

  /**
   * Set span attribute
   */
  static setAttribute(key: string, value: any) {
    const span = trace.getActiveSpan();
    if (span) {
      span.setAttribute(key, value);
    }
  }
}

/**
 * Tracing Utilities
 */
export class TracingUtils {
  /**
   * Get current trace ID
   */
  static getTraceId(): string {
    const span = trace.getActiveSpan();
    return span?.spanContext().traceId || 'unknown';
  }

  /**
   * Get current span ID
   */
  static getSpanId(): string {
    const span = trace.getActiveSpan();
    return span?.spanContext().spanId || 'unknown';
  }

  /**
   * Create child span
   */
  static createChildSpan(name: string, attributes?: Record<string, any>) {
    const tracer = trace.getTracer('child-span');
    const span = tracer.startSpan(name);

    if (attributes) {
      span.setAttributes(attributes);
    }

    return span;
  }

  /**
   * End span with status
   */
  static endSpan(span: any, status: 'OK' | 'ERROR', message?: string) {
    if (status === 'OK') {
      span.setStatus({ code: SpanStatusCode.OK });
    } else {
      span.setStatus({ code: SpanStatusCode.ERROR, message });
    }
    span.end();
  }
}

export default {
  DistributedTracingSetup,
  tracingMiddleware,
  DatabaseTracing,
  CacheTracing,
  ExternalServiceTracing,
  BusinessLogicTracing,
  TracingUtils,
};
