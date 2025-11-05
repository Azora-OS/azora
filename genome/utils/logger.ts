/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export interface Logger {
  info(message: string, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  error(message: string, meta?: Record<string, any>): void;
  debug(message: string, meta?: Record<string, any>): void;
}

class ConsoleLogger implements Logger {
  info(message: string, meta?: Record<string, any>): void {
    console.log(`ℹ️  ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  }

  warn(message: string, meta?: Record<string, any>): void {
    console.warn(`⚠️  ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  }

  error(message: string, meta?: Record<string, any>): void {
    console.error(`❌ ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
  }

  debug(message: string, meta?: Record<string, any>): void {
    if (process.env.DEBUG) {
      console.debug(`🐛 ${message}`, meta ? JSON.stringify(meta, null, 2) : '');
    }
  }
}

export const logger: Logger = new ConsoleLogger();

