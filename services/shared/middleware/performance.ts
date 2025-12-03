import { Request, Response, NextFunction } from 'express';
import { Counter, Histogram, Gauge, register } from 'prom-client';
import winston from 'winston';

// Create logger for performance tracking
const performanceLogger = winston.createLogger({
  defaultMeta: { service: 'performance-monitor' },
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${timestamp} [PERF] ${level}: ${message} ${metaStr}`;
        })
      ),
    }),
    new winston.transports.File({
      filename: 'logs/performance.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
});

// Prometheus metrics
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000]
});

const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const dbQueryDuration = new Histogram({
  name: 'db_query_duration_ms',
  help: 'Duration of database queries in ms',
  labelNames: ['operation', 'model'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000]
});

const dbQueryTotal = new Counter({
  name: 'db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'model', 'status']
});

const errorRateGauge = new Gauge({
  name: 'http_error_rate',
  help: 'Current HTTP error rate',
  labelNames: ['service']
});

const slowRequestsTotal = new Counter({
  name: 'slow_requests_total',
  help: 'Total number of slow API requests',
  labelNames: ['method', 'route']
});

const slowQueriesTotal = new Counter({
  name: 'slow_queries_total',
  help: 'Total number of slow database queries',
  labelNames: ['operation', 'model']
});

// Performance thresholds (configurable via environment)
export const THRESHOLDS = {
  API_LATENCY_MS: parseInt(process.env.PERF_API_LATENCY_MS || '100', 10),
  DB_QUERY_MS: parseInt(process.env.PERF_DB_QUERY_MS || '50', 10),
  ERROR_RATE: parseFloat(process.env.PERF_ERROR_RATE || '0.001') // 0.1%
};

// Track request counts for error rate calculation
let totalRequests = 0;
let errorRequests = 0;

/**
 * Express middleware for performance monitoring
 * Measures API response times and records metrics to Prometheus
 */
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const route = req.route?.path || req.path;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Record metrics
    httpRequestDuration.observe(
      { method: req.method, route, status_code: res.statusCode },
      duration
    );
    
    httpRequestTotal.inc({ method: req.method, route, status_code: res.statusCode });
    
    // Track error rate
    totalRequests++;
    if (res.statusCode >= 400) {
      errorRequests++;
    }
    
    // Update error rate gauge
    const errorRate = errorRequests / totalRequests;
    errorRateGauge.set({ service: 'api' }, errorRate);
    
    // Alert on slow API responses
    if (duration > THRESHOLDS.API_LATENCY_MS) {
      slowRequestsTotal.inc({ method: req.method, route });
      performanceLogger.warn('Slow API response detected', {
        method: req.method,
        route,
        duration,
        threshold: THRESHOLDS.API_LATENCY_MS,
        status: res.statusCode,
        severity: duration > THRESHOLDS.API_LATENCY_MS * 2 ? 'high' : 'medium'
      });
    }
    
    // Alert on high error rate
    if (errorRate > THRESHOLDS.ERROR_RATE) {
      performanceLogger.error('High error rate detected', {
        errorRate: (errorRate * 100).toFixed(2) + '%',
        threshold: (THRESHOLDS.ERROR_RATE * 100).toFixed(2) + '%',
        totalRequests,
        errorRequests,
        severity: 'high'
      });
    }
  });
  
  next();
};

/**
 * Track database query performance
 * Records query duration and alerts on slow queries
 */
export const trackDbQuery = (
  operation: string,
  model: string,
  duration: number,
  status: 'success' | 'error' = 'success'
) => {
  // Record metrics
  dbQueryDuration.observe({ operation, model }, duration);
  dbQueryTotal.inc({ operation, model, status });
  
  // Alert on slow database queries
  if (duration > THRESHOLDS.DB_QUERY_MS) {
    slowQueriesTotal.inc({ operation, model });
    performanceLogger.warn('Slow database query detected', {
      operation,
      model,
      duration,
      threshold: THRESHOLDS.DB_QUERY_MS,
      status,
      severity: duration > THRESHOLDS.DB_QUERY_MS * 2 ? 'high' : 'medium'
    });
  }
};

/**
 * Get current performance metrics
 */
export const getMetrics = async () => {
  return register.metrics();
};

/**
 * Reset performance metrics
 */
export const resetMetrics = () => {
  totalRequests = 0;
  errorRequests = 0;
  register.clear();
};

/**
 * Get current performance statistics
 */
export const getPerformanceStats = () => {
  return {
    totalRequests,
    errorRequests,
    errorRate: totalRequests > 0 ? (errorRequests / totalRequests * 100).toFixed(2) + '%' : '0%',
    thresholds: THRESHOLDS
  };
};

/**
 * Export metrics for external use
 */
export {
  httpRequestDuration,
  httpRequestTotal,
  dbQueryDuration,
  dbQueryTotal,
  errorRateGauge,
  slowRequestsTotal,
  slowQueriesTotal,
  performanceLogger
};
