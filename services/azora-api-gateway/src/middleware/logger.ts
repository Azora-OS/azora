/**
 * Logger Middleware
 * Ubuntu Philosophy: "My security ensures our freedom"
 */

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: any;
  ubuntu: string;
}

export class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  public error(message: string, metadata?: any): void {
    this.log(LogLevel.ERROR, message, metadata);
  }

  public warn(message: string, metadata?: any): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  public info(message: string, metadata?: any): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  public debug(message: string, metadata?: any): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  private log(level: LogLevel, message: string, metadata?: any): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
      ubuntu: 'My security ensures our freedom'
    };

    this.logs.push(logEntry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Output to console
    this.outputToConsole(logEntry);
  }

  private outputToConsole(logEntry: LogEntry): void {
    const timestamp = logEntry.timestamp;
    const level = logEntry.level.padEnd(5);
    const message = logEntry.message;
    const metadata = logEntry.metadata ? JSON.stringify(logEntry.metadata) : '';

    switch (logEntry.level) {
      case LogLevel.ERROR:
        console.error(`[${timestamp}] ${level} ${message} ${metadata}`);
        break;
      case LogLevel.WARN:
        console.warn(`[${timestamp}] ${level} ${message} ${metadata}`);
        break;
      case LogLevel.INFO:
        console.info(`[${timestamp}] ${level} ${message} ${metadata}`);
        break;
      case LogLevel.DEBUG:
        console.debug(`[${timestamp}] ${level} ${message} ${metadata}`);
        break;
    }
  }

  public getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }
}
