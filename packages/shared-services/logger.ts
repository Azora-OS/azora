import { v4 as uuidv4 } from 'uuid';

interface LogContext {
  correlationId?: string;
  userId?: string;
  service?: string;
  [key: string]: any;
}

class Logger {
  private service: string;
  private context: LogContext = {};

  constructor(service: string) {
    this.service = service;
  }

  setContext(context: LogContext) {
    this.context = { ...this.context, ...context };
  }

  private log(level: string, message: string, meta?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
      correlationId: this.context.correlationId || uuidv4(),
      userId: this.context.userId,
      ...meta,
    };

    console.log(JSON.stringify(logEntry));
  }

  info(message: string, meta?: any) {
    this.log('info', message, meta);
  }

  error(message: string, error?: Error, meta?: any) {
    this.log('error', message, {
      ...meta,
      error: error?.message,
      stack: error?.stack,
    });
  }

  warn(message: string, meta?: any) {
    this.log('warn', message, meta);
  }

  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, meta);
    }
  }
}

export const createLogger = (service: string) => new Logger(service);
