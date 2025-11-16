/**
 * Prometheus Metrics Setup
 * Provides centralized metrics collection for all Azora services
 */

import { register, Counter, Histogram, Gauge } from 'prom-client';
import { Request, Response, NextFunction } from 'express';

// Default metrics
import 'prom-client';

/**
 * HTTP Request Metrics
 */
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service'],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'service'],
  buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
});

/**
 * Database Metrics
 */
export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table', 'status'],
  buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1, 5],
});

export const dbConnectionPoolUsed = new Gauge({
  name: 'db_connection_pool_used',
  help: 'Number of used database connections',
  labelNames: ['service'],
});

export const dbConnectionPoolMax = new Gauge({
  name: 'db_connection_pool_max',
  help: 'Maximum database connections',
  labelNames: ['service'],
});

/**
 * Business Metrics
 */
export const enrollmentsTotal = new Counter({
  name: 'enrollments_total',
  help: 'Total number of course enrollments',
  labelNames: ['course_id', 'status'],
});

export const transactionsTotal = new Counter({
  name: 'transactions_total',
  help: 'Total number of financial transactions',
  labelNames: ['type', 'status', 'currency'],
});

export const jobsPosted = new Counter({
  name: 'jobs_posted_total',
  help: 'Total number of jobs posted',
  labelNames: ['category', 'status'],
});

export const applicationsReceived = new Counter({
  name: 'applications_received_total',
  help: 'Total number of job applications',
  labelNames: ['job_id', 'status'],
});

/**
 * Authentication Metrics
 */
export const authAttempts = new Counter({
  name: 'auth_attempts_total',
  help: 'Total authentication attempts',
  labelNames: ['method', 'status'],
});

export const authFailures = new Counter({
  name: 'auth_failures_total',
  help: 'Total authentication failures',
  labelNames: ['method', 'reason'],
});

/**
 * Cache Metrics
 */
export const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Total cache hits',
  labelNames: ['cache_name'],
});

export const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: 'Total cache misses',
  labelNames: ['cache_name'],
});

/**
 * Error Metrics
 */
export const errorsTotal = new Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['service', 'error_type', 'severity'],
});

/**
 * Express middleware for automatic metrics collection
 */
export function metricsMiddleware(serviceName: string = 'unknown') {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Capture response
    const originalSend = res.send;
    res.send = function (data: any) {
      const duration = (Date.now() - start) / 1000;
      const route = req.route?.path || req.path;

      // Record metrics
      httpRequestsTotal.labels(req.method, route, res.statusCode.toString(), serviceName).inc();
      httpRequestDuration.labels(req.method, route, res.statusCode.toString(), serviceName).observe(duration);

      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Metrics endpoint for Prometheus scraping
 */
export async function metricsEndpoint(_req: Request, res: Response) {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}

/**
 * Record database query metrics
 */
export function recordDatabaseQuery(
  operation: string,
  table: string,
  duration: number,
  status: 'success' | 'error' = 'success'
) {
  dbQueryDuration.labels(operation, table, status).observe(duration);
}

/**
 * Update connection pool metrics
 */
export function updateConnectionPool(serviceName: string, used: number, max: number) {
  dbConnectionPoolUsed.labels(serviceName).set(used);
  dbConnectionPoolMax.labels(serviceName).set(max);
}

/**
 * Record enrollment
 */
export function recordEnrollment(courseId: string, status: 'success' | 'failed' = 'success') {
  enrollmentsTotal.labels(courseId, status).inc();
}

/**
 * Record transaction
 */
export function recordTransaction(
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment',
  status: 'success' | 'failed' = 'success',
  currency: string = 'USD'
) {
  transactionsTotal.labels(type, status, currency).inc();
}

/**
 * Record job posting
 */
export function recordJobPosting(category: string, status: 'active' | 'closed' = 'active') {
  jobsPosted.labels(category, status).inc();
}

/**
 * Record job application
 */
export function recordJobApplication(jobId: string, status: 'submitted' | 'accepted' | 'rejected' = 'submitted') {
  applicationsReceived.labels(jobId, status).inc();
}

/**
 * Record authentication attempt
 */
export function recordAuthAttempt(method: string, success: boolean) {
  authAttempts.labels(method, success ? 'success' : 'failed').inc();
  if (!success) {
    authFailures.labels(method, 'invalid_credentials').inc();
  }
}

/**
 * Record cache hit/miss
 */
export function recordCacheHit(cacheName: string, hit: boolean) {
  if (hit) {
    cacheHits.labels(cacheName).inc();
  } else {
    cacheMisses.labels(cacheName).inc();
  }
}

/**
 * Record error
 */
export function recordError(serviceName: string, errorType: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
  errorsTotal.labels(serviceName, errorType, severity).inc();
}

export default {
  register,
  metricsMiddleware,
  metricsEndpoint,
  recordDatabaseQuery,
  updateConnectionPool,
  recordEnrollment,
  recordTransaction,
  recordJobPosting,
  recordJobApplication,
  recordAuthAttempt,
  recordCacheHit,
  recordError,
  // Metrics objects
  httpRequestsTotal,
  httpRequestDuration,
  dbQueryDuration,
  dbConnectionPoolUsed,
  dbConnectionPoolMax,
  enrollmentsTotal,
  transactionsTotal,
  jobsPosted,
  applicationsReceived,
  authAttempts,
  authFailures,
  cacheHits,
  cacheMisses,
  errorsTotal,
};
