/**
 * Centralized Logging System
 * Ubuntu Philosophy: "My security ensures our freedom"
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { config } from '../../../config/environment';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogContext {
  service?: string;
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

export class AzoraLogger {
  private logger: winston.Logger;
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.logger = this.createLogger();
  }

  private createLogger(): winston.Logger {
    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, ...meta }: any) => {
        return JSON.stringify({
          timestamp,
          level,
          service: this.serviceName,
          message,
          ubuntu: 'My security ensures our freedom',
          ...meta
        });
      })
    );

    const transports: winston.transport[] = [];

    // Console transport for development
    if (config.env !== 'production') {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(({ timestamp, level, message, ...meta }: any) => {
              const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
              return `${timestamp} [${this.serviceName}] ${level}: ${message} ${metaStr}`;
            })
          )
        })
      );
    }

    // File transports for production
    if (config.env === 'production') {
      // Error log file
      transports.push(
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '20m',
          maxFiles: '14d',
          format: logFormat
        })
      );

      // Combined log file
      transports.push(
        new DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: logFormat
        })
      );
    }

    // Add Sentry transport if configured
    if (config.monitoring.sentry.dsn) {
      try {
        const Sentry = require('@sentry/node');
        Sentry.init({ dsn: config.monitoring.sentry.dsn });
        
        transports.push(
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.errors({ stack: true }),
              winston.format.json()
            )
          })
        );
      } catch (error) {
        console.warn('Sentry not available, skipping Sentry transport');
      }
    }

    return winston.createLogger({
      level: config.monitoring.logging.level,
      format: logFormat,
      transports,
      exitOnError: false
    });
  }

  public error(message: string, context?: LogContext): void {
    this.logger.error(message, { ...context, service: this.serviceName });
  }

  public warn(message: string, context?: LogContext): void {
    this.logger.warn(message, { ...context, service: this.serviceName });
  }

  public info(message: string, context?: LogContext): void {
    this.logger.info(message, { ...context, service: this.serviceName });
  }

  public debug(message: string, context?: LogContext): void {
    this.logger.debug(message, { ...context, service: this.serviceName });
  }

  public logRequest(req: any, res: any, responseTime: number): void {
    this.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.id
    });
  }

  public logError(error: Error, context?: LogContext): void {
    this.logger.error(error.message, {
      stack: error.stack,
      ...context,
      service: this.serviceName
    });
  }

  public logSecurity(event: string, context?: LogContext): void {
    this.warn(`Security Event: ${event}`, {
      ...context,
      security: true,
      ubuntu: 'Security protects our community'
    });
  }

  public logPerformance(operation: string, duration: number, context?: LogContext): void {
    this.info(`Performance: ${operation}`, {
      duration,
      ...context,
      performance: true
    });
  }

  public logBusiness(event: string, context?: LogContext): void {
    this.info(`Business Event: ${event}`, {
      ...context,
      business: true,
      ubuntu: 'Community growth through shared success'
    });
  }

  public createChildLogger(context: LogContext): AzoraLogger {
    const child = new AzoraLogger(this.serviceName);
    child.defaultContext = { ...this.defaultContext, ...context };
    return child;
  }

  private defaultContext: LogContext = {};
}

// Logger factory
const loggers: Map<string, AzoraLogger> = new Map();

export function getLogger(serviceName: string): AzoraLogger {
  if (!loggers.has(serviceName)) {
    loggers.set(serviceName, new AzoraLogger(serviceName));
  }
  return loggers.get(serviceName)!;
}

// Default logger
export const logger = getLogger('azora-platform');

// Request logging middleware
export function requestLogger(req: any, res: any, next: any) {
  const start = Date.now();
  const requestId = req.id || Math.random().toString(36).substr(2, 9);
  
  req.id = requestId;
  req.logger = logger.createChildLogger({ requestId });

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logRequest(req, res, duration);
  });

  next();
}

// Error logging middleware
export function errorLogger(error: Error, req: any, res: any, next: any) {
  req.logger?.logError(error, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next(error);
}

export default logger;
