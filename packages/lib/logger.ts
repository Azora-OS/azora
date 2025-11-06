/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Centralized Logging Utility
 * 
 * Replaces console.log statements with structured logging using Winston
 * Provides consistent logging across all services
 */

import winston from 'winston';
import path from 'path';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly',
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }: winston.LogEntry) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'azora-os',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
    }),
  ],
});

// Add file transport for production
if (process.env.NODE_ENV === 'production') {
  const logDir = process.env.LOG_DIR || './logs';
  
  // Error log file
  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Combined log file
  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create convenience methods matching console API for easy migration
export const log = {
  error: (message: string, ...args: unknown[]) => {
    logger.error(message, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    logger.warn(message, ...args);
  },
  info: (message: string, ...args: unknown[]) => {
    logger.info(message, ...args);
  },
  http: (message: string, ...args: unknown[]) => {
    logger.http(message, ...args);
  },
  verbose: (message: string, ...args: unknown[]) => {
    logger.verbose(message, ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    logger.debug(message, ...args);
  },
  silly: (message: string, ...args: unknown[]) => {
    logger.silly(message, ...args);
  },
};

// Export winston logger for advanced usage
export { logger };

// Default export for convenience
export default log;


