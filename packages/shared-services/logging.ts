/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

UNIFIED LOGGING SERVICE
Provides consistent logging across all services
*/

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  service: string;
  timestamp: Date;
  metadata?: {
    userId?: string;
    requestId?: string;
    error?: any;
    [key: string]: any;
  };
}

/**
 * Unified Logging Service
 */
export class UnifiedLoggingService {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * Log debug message
   */
  debug(message: string, metadata?: LogEntry['metadata']): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  /**
   * Log info message
   */
  info(message: string, metadata?: LogEntry['metadata']): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  /**
   * Log warning message
   */
  warn(message: string, metadata?: LogEntry['metadata']): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  /**
   * Log error message
   */
  error(message: string, error?: any, metadata?: LogEntry['metadata']): void {
    this.log(LogLevel.ERROR, message, {
      ...metadata,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : undefined,
    });
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, metadata?: LogEntry['metadata']): void {
    const entry: LogEntry = {
      level,
      message,
      service: this.serviceName,
      timestamp: new Date(),
      metadata,
    };

    // Console output (in production, would go to centralized logging)
    const logMethod = level === LogLevel.ERROR ? console.error :
                     level === LogLevel.WARN ? console.warn :
                     level === LogLevel.DEBUG ? console.debug :
                     console.log;

    const prefix = `[${entry.timestamp.toISOString()}] [${level.toUpperCase()}] [${this.serviceName}]`;
    logMethod(prefix, message, metadata || '');

    // In production, emit to event bus for centralized logging
    // eventBus.publish('log.entry', entry);
  }
}

// Export factory function
export function createLogger(serviceName: string): UnifiedLoggingService {
  return new UnifiedLoggingService(serviceName);
}

export default UnifiedLoggingService;
