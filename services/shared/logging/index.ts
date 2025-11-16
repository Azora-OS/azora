/**
 * Winston Structured Logging Setup
 * Provides centralized logging for all Azora services
 */

import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

/**
 * Create a logger instance for a service
 */
export function createLogger(serviceName: string) {
  const logger = winston.createLogger({
    defaultMeta: { service: serviceName },
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
        return JSON.stringify({
          timestamp,
          level,
          service,
          message,
          ...meta,
        });
      })
    ),
    transports: [
      // Console output
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
            const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
            return `${timestamp} [${service}] ${level}: ${message} ${metaStr}`;
          })
        ),
      }),

      // File output - all logs
      new winston.transports.File({
        filename: `logs/${serviceName}-all.log`,
        maxsize: 10485760, // 10MB
        maxFiles: 5,
      }),

      // File output - errors only
      new winston.transports.File({
        filename: `logs/${serviceName}-error.log`,
        level: 'error',
        maxsize: 10485760,
        maxFiles: 5,
      }),
    ],
  });

  return logger;
}

/**
 * Express middleware for request logging
 */
export function requestLoggingMiddleware(logger: winston.Logger) {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Capture response
    const originalSend = res.send;
    res.send = function (data: any) {
      const duration = Date.now() - start;

      logger.info('HTTP Request', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        traceId: (req as any).traceId,
        spanId: (req as any).spanId,
      });

      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Log info message
 */
export function logInfo(logger: winston.Logger, message: string, meta?: Record<string, any>) {
  logger.info(message, meta);
}

/**
 * Log warning message
 */
export function logWarn(logger: winston.Logger, message: string, meta?: Record<string, any>) {
  logger.warn(message, meta);
}

/**
 * Log error message
 */
export function logError(logger: winston.Logger, message: string, error?: Error, meta?: Record<string, any>) {
  logger.error(message, {
    error: error?.message,
    stack: error?.stack,
    ...meta,
  });
}

/**
 * Log debug message
 */
export function logDebug(logger: winston.Logger, message: string, meta?: Record<string, any>) {
  logger.debug(message, meta);
}

/**
 * Log database operation
 */
export function logDatabaseOperation(
  logger: winston.Logger,
  operation: string,
  table: string,
  duration: number,
  success: boolean,
  error?: Error
) {
  const level = success ? 'info' : 'error';
  const message = `Database ${operation} on ${table}`;

  logger.log(level, message, {
    operation,
    table,
    duration: `${duration}ms`,
    success,
    error: error?.message,
  });
}

/**
 * Log authentication event
 */
export function logAuthEvent(
  logger: winston.Logger,
  event: 'login' | 'logout' | 'failed_login' | 'mfa_enabled' | 'password_reset',
  userId?: string,
  meta?: Record<string, any>
) {
  logger.info(`Auth: ${event}`, {
    event,
    userId,
    ...meta,
  });
}

/**
 * Log business event
 */
export function logBusinessEvent(
  logger: winston.Logger,
  event: string,
  userId: string,
  meta?: Record<string, any>
) {
  logger.info(`Business: ${event}`, {
    event,
    userId,
    ...meta,
  });
}

/**
 * Log payment event
 */
export function logPaymentEvent(
  logger: winston.Logger,
  event: 'payment_initiated' | 'payment_completed' | 'payment_failed' | 'refund_issued',
  transactionId: string,
  amount: number,
  currency: string,
  meta?: Record<string, any>
) {
  logger.info(`Payment: ${event}`, {
    event,
    transactionId,
    amount,
    currency,
    ...meta,
  });
}

/**
 * Log error with context
 */
export function logErrorWithContext(
  logger: winston.Logger,
  error: Error,
  context: string,
  meta?: Record<string, any>
) {
  logger.error(`Error in ${context}`, {
    error: error.message,
    stack: error.stack,
    context,
    ...meta,
  });
}

export default {
  createLogger,
  requestLoggingMiddleware,
  logInfo,
  logWarn,
  logError,
  logDebug,
  logDatabaseOperation,
  logAuthEvent,
  logBusinessEvent,
  logPaymentEvent,
  logErrorWithContext,
};
