import winston from 'winston'
import path from 'path'
import fs from 'fs'

// Custom log levels
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
  }
}

// Add colors to winston
winston.addColors(customLevels.colors)

// Custom format for structured logging
const structuredFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, requestId, userId, ...meta }) => {
    const logEntry = {
      timestamp,
      level,
      message,
      service: service || 'azora-os',
      ...(requestId && { requestId }),
      ...(userId && { userId }),
      ...meta
    }
    return JSON.stringify(logEntry)
  })
)

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, service, requestId, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
    const reqId = requestId ? ` [${requestId}]` : ''
    const svc = service ? ` [${service}]` : ''
    return `${timestamp}${svc}${reqId} ${level}: ${message}${metaStr}`
  })
)

class Logger {
  private winston: winston.Logger
  private logDir: string

  constructor(serviceName: string = 'azora-os') {
    this.logDir = path.join(process.cwd(), 'logs')
    this.ensureLogDirectory()
    
    this.winston = winston.createLogger({
      levels: customLevels.levels,
      level: process.env.LOG_LEVEL || 'info',
      defaultMeta: { service: serviceName },
      transports: this.createTransports(),
      exitOnError: false,
    })

    // Handle uncaught exceptions and rejections
    this.winston.exceptions.handle(
      new winston.transports.File({ 
        filename: path.join(this.logDir, 'exceptions.log'),
        format: structuredFormat
      })
    )

    this.winston.rejections.handle(
      new winston.transports.File({ 
        filename: path.join(this.logDir, 'rejections.log'),
        format: structuredFormat
      })
    )
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  private createTransports(): winston.transport[] {
    const transports: winston.transport[] = []

    // Console transport for development
    if (process.env.NODE_ENV !== 'production') {
      transports.push(
        new winston.transports.Console({
          format: consoleFormat,
          handleExceptions: true,
          handleRejections: true,
        })
      )
    }

    // File transports
    transports.push(
      // Error logs
      new winston.transports.File({
        filename: path.join(this.logDir, 'error.log'),
        level: 'error',
        format: structuredFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
      }),

      // Combined logs
      new winston.transports.File({
        filename: path.join(this.logDir, 'combined.log'),
        format: structuredFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 10,
      }),

      // HTTP logs
      new winston.transports.File({
        filename: path.join(this.logDir, 'http.log'),
        level: 'http',
        format: structuredFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
      })
    )

    return transports
  }

  // Core logging methods
  error(message: string, meta?: any): void {
    this.winston.error(message, meta)
  }

  warn(message: string, meta?: any): void {
    this.winston.warn(message, meta)
  }

  info(message: string, meta?: any): void {
    this.winston.info(message, meta)
  }

  http(message: string, meta?: any): void {
    this.winston.http(message, meta)
  }

  debug(message: string, meta?: any): void {
    this.winston.debug(message, meta)
  }

  // Structured logging methods
  logRequest(req: any, res: any, duration: number): void {
    this.http('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      requestId: req.requestId,
      userId: req.user?.id,
    })
  }

  logError(error: Error, context?: any): void {
    this.error('Application Error', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context,
    })
  }

  logSecurity(event: string, details: any): void {
    this.warn('Security Event', {
      event,
      ...details,
      timestamp: new Date().toISOString(),
    })
  }

  logPerformance(operation: string, duration: number, meta?: any): void {
    this.info('Performance Metric', {
      operation,
      duration,
      ...meta,
    })
  }

  logBusinessEvent(event: string, data: any): void {
    this.info('Business Event', {
      event,
      data,
      timestamp: new Date().toISOString(),
    })
  }

  // Create child logger with additional context
  child(meta: any): Logger {
    const childLogger = Object.create(this)
    childLogger.winston = this.winston.child(meta)
    return childLogger
  }

  // Get winston instance for advanced usage
  getWinstonInstance(): winston.Logger {
    return this.winston
  }
}

// Performance monitoring decorator
export function logPerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value

  descriptor.value = async function (...args: any[]) {
    const start = Date.now()
    const logger = new Logger()
    
    try {
      const result = await method.apply(this, args)
      const duration = Date.now() - start
      
      logger.logPerformance(`${target.constructor.name}.${propertyName}`, duration, {
        success: true,
        args: args.length,
      })
      
      return result
    } catch (error) {
      const duration = Date.now() - start
      
      logger.logPerformance(`${target.constructor.name}.${propertyName}`, duration, {
        success: false,
        error: error.message,
        args: args.length,
      })
      
      throw error
    }
  }

  return descriptor
}

// Singleton logger instance
export const logger = new Logger()

// Create service-specific loggers
export function createServiceLogger(serviceName: string): Logger {
  return new Logger(serviceName)
}

// Express middleware for request logging
export function requestLoggingMiddleware() {
  return (req: any, res: any, next: any) => {
    const start = Date.now()
    
    res.on('finish', () => {
      const duration = Date.now() - start
      logger.logRequest(req, res, duration)
    })
    
    next()
  }
}