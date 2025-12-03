/**
 * Structured Logging Service
 * Provides structured logging with support for ELK Stack, Sentry, and local file logging
 */

import winston from 'winston';
import * as Sentry from '@sentry/node';

export interface LogContext {
  userId?: string;
  courseId?: string;
  enrollmentId?: string;
  requestId?: string;
  sessionId?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  metadata?: Record<string, any>;
}

class StructuredLogger {
  private logger: winston.Logger;
  private sentryEnabled: boolean;

  constructor() {
    this.sentryEnabled = !!process.env.SENTRY_DSN;

    // Initialize Sentry if DSN is provided
    if (this.sentryEnabled) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: parseFloat(process.env.SENTRY_TRACE_SAMPLE_RATE || '0.1'),
        integrations: [
          new Sentry.Integrations.Http({ tracing: true }),
          new Sentry.Integrations.OnUncaughtException(),
          new Sentry.Integrations.OnUnhandledRejection(),
        ],
      });
    }

    // Create Winston logger with multiple transports
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: {
        service: 'education-revenue-engine',
        environment: process.env.NODE_ENV || 'development',
      },
      transports: this.getTransports(),
    });
  }

  private getTransports(): winston.transport[] {
    const transports: winston.transport[] = [
      // Console transport for development
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
            return `${timestamp} [${level}] ${message} ${metaStr}`;
          }),
        ),
      }),

      // File transport for all logs
      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 10485760, // 10MB
        maxFiles: 10,
      }),

      // File transport for errors only
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 10485760, // 10MB
        maxFiles: 10,
      }),
    ];

    // Add HTTP transport for ELK Stack if configured
    if (process.env.ELK_HOST) {
      const ElasticsearchTransport = require('winston-elasticsearch');
      transports.push(
        new ElasticsearchTransport({
          level: 'info',
          clientOpts: {
            node: `http://${process.env.ELK_HOST}:${process.env.ELK_PORT || 9200}`,
          },
          index: 'education-logs',
          transformer: (logData: any) => ({
            '@timestamp': new Date().toISOString(),
            message: logData.message,
            severity: logData.level,
            fields: logData.meta,
          }),
        })
      );
    }

    return transports;
  }

  /**
   * Log info level message
   */
  info(message: string, context?: LogContext, metadata?: Record<string, any>): void {
    this.logger.info(message, {
      context,
      metadata,
    });
  }

  /**
   * Log warning level message
   */
  warn(message: string, context?: LogContext, metadata?: Record<string, any>): void {
    this.logger.warn(message, {
      context,
      metadata,
    });
  }

  /**
   * Log error level message
   */
  error(
    message: string,
    error?: Error | string,
    context?: LogContext,
    metadata?: Record<string, any>
  ): void {
    const errorData = typeof error === 'string' ? new Error(error) : error;

    this.logger.error(message, {
      context,
      metadata,
      error: errorData ? {
        message: errorData.message,
        stack: errorData.stack,
        code: (errorData as any).code,
      } : undefined,
    });

    // Send to Sentry if enabled
    if (this.sentryEnabled && errorData) {
      Sentry.captureException(errorData, {
        tags: {
          service: 'education-revenue-engine',
        },
        contexts: {
          custom: context,
        },
        extra: metadata,
      });
    }
  }

  /**
   * Log debug level message
   */
  debug(message: string, context?: LogContext, metadata?: Record<string, any>): void {
    this.logger.debug(message, {
      context,
      metadata,
    });
  }

  /**
   * Log HTTP request
   */
  logHttpRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    this.info(`HTTP ${method} ${path} ${statusCode}`, context, {
      method,
      path,
      statusCode,
      duration,
    });
  }

  /**
   * Log database operation
   */
  logDbOperation(
    operation: string,
    table: string,
    duration: number,
    rowsAffected?: number,
    context?: LogContext
  ): void {
    this.debug(`DB ${operation} on ${table}`, context, {
      operation,
      table,
      duration,
      rowsAffected,
    });
  }

  /**
   * Log AI engine operation
   */
  logAiOperation(
    engine: string,
    operation: string,
    duration: number,
    status: 'success' | 'error',
    context?: LogContext
  ): void {
    const level = status === 'error' ? 'warn' : 'debug';
    const logFn = level === 'error' ? this.error.bind(this) : this.debug.bind(this);

    logFn(`AI ${engine} ${operation} ${status}`, context, {
      engine,
      operation,
      duration,
      status,
    });
  }

  /**
   * Log business event
   */
  logBusinessEvent(
    eventType: string,
    eventData: Record<string, any>,
    context?: LogContext
  ): void {
    this.info(`Business Event: ${eventType}`, context, eventData);
  }

  /**
   * Create a child logger with additional context
   */
  createChildLogger(context: LogContext): ChildLogger {
    return new ChildLogger(this, context);
  }
}

/**
 * Child logger with pre-filled context
 */
class ChildLogger {
  constructor(private parent: StructuredLogger, private context: LogContext) {}

  info(message: string, metadata?: Record<string, any>): void {
    this.parent.info(message, this.context, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.parent.warn(message, this.context, metadata);
  }

  error(message: string, error?: Error | string, metadata?: Record<string, any>): void {
    this.parent.error(message, error, this.context, metadata);
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.parent.debug(message, this.context, metadata);
  }

  logHttpRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number
  ): void {
    this.parent.logHttpRequest(method, path, statusCode, duration, this.context);
  }

  logDbOperation(
    operation: string,
    table: string,
    duration: number,
    rowsAffected?: number
  ): void {
    this.parent.logDbOperation(operation, table, duration, rowsAffected, this.context);
  }

  logAiOperation(
    engine: string,
    operation: string,
    duration: number,
    status: 'success' | 'error'
  ): void {
    this.parent.logAiOperation(engine, operation, duration, status, this.context);
  }

  logBusinessEvent(eventType: string, eventData: Record<string, any>): void {
    this.parent.logBusinessEvent(eventType, eventData, this.context);
  }
}

// Export singleton instance
export const structuredLogger = new StructuredLogger();
export { ChildLogger };
