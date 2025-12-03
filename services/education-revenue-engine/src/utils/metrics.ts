/**
 * Prometheus Metrics Collection
 * Tracks application performance, API latency, error rates, and business metrics
 */

import { Counter, Gauge, Histogram, register } from 'prom-client';

// API Metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpErrorsTotal = new Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['method', 'route', 'error_type'],
});

// Database Metrics
export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
});

export const dbQueryTotal = new Counter({
  name: 'db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table', 'status'],
});

export const dbConnectionPoolSize = new Gauge({
  name: 'db_connection_pool_size',
  help: 'Current database connection pool size',
});

// Business Metrics
export const enrollmentTotal = new Counter({
  name: 'enrollments_total',
  help: 'Total number of enrollments',
  labelNames: ['tier', 'status'],
});

export const courseCompletionTotal = new Counter({
  name: 'course_completions_total',
  help: 'Total number of course completions',
  labelNames: ['course_id', 'tier'],
});

export const conversionTotal = new Counter({
  name: 'conversions_total',
  help: 'Total number of tier conversions',
  labelNames: ['from_tier', 'to_tier'],
});

export const revenueTotal = new Counter({
  name: 'revenue_total',
  help: 'Total revenue in cents',
  labelNames: ['tier', 'period'],
});

export const paymentTotal = new Counter({
  name: 'payments_total',
  help: 'Total number of payments',
  labelNames: ['status', 'payment_method'],
});

export const activeStudents = new Gauge({
  name: 'active_students',
  help: 'Number of active students',
  labelNames: ['tier'],
});

export const activeCourses = new Gauge({
  name: 'active_courses',
  help: 'Number of active courses',
});

// AI Engine Metrics
export const aiQueryDuration = new Histogram({
  name: 'ai_query_duration_seconds',
  help: 'Duration of AI engine queries in seconds',
  labelNames: ['engine', 'operation'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

export const aiQueryTotal = new Counter({
  name: 'ai_queries_total',
  help: 'Total number of AI engine queries',
  labelNames: ['engine', 'operation', 'status'],
});

export const aiErrorsTotal = new Counter({
  name: 'ai_errors_total',
  help: 'Total number of AI engine errors',
  labelNames: ['engine', 'error_type'],
});

// Cache Metrics
export const cacheHitTotal = new Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type'],
});

export const cacheMissTotal = new Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type'],
});

export const cacheSize = new Gauge({
  name: 'cache_size_bytes',
  help: 'Current cache size in bytes',
  labelNames: ['cache_type'],
});

// System Metrics
export const processUptime = new Gauge({
  name: 'process_uptime_seconds',
  help: 'Process uptime in seconds',
});

export const memoryUsage = new Gauge({
  name: 'memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['type'],
});

export const cpuUsage = new Gauge({
  name: 'cpu_usage_percent',
  help: 'CPU usage percentage',
});

/**
 * Get all metrics in Prometheus format
 */
export async function getMetrics(): Promise<string> {
  return register.metrics();
}

/**
 * Record HTTP request metrics
 */
export function recordHttpRequest(
  method: string,
  route: string,
  statusCode: number,
  duration: number
): void {
  httpRequestDuration.labels(method, route, statusCode.toString()).observe(duration);
  httpRequestTotal.labels(method, route, statusCode.toString()).inc();
}

/**
 * Record HTTP error
 */
export function recordHttpError(
  method: string,
  route: string,
  errorType: string
): void {
  httpErrorsTotal.labels(method, route, errorType).inc();
}

/**
 * Record database query
 */
export function recordDbQuery(
  operation: string,
  table: string,
  duration: number,
  status: 'success' | 'error'
): void {
  dbQueryDuration.labels(operation, table).observe(duration);
  dbQueryTotal.labels(operation, table, status).inc();
}

/**
 * Record AI engine query
 */
export function recordAiQuery(
  engine: string,
  operation: string,
  duration: number,
  status: 'success' | 'error'
): void {
  aiQueryDuration.labels(engine, operation).observe(duration);
  aiQueryTotal.labels(engine, operation, status).inc();
}

/**
 * Record AI engine error
 */
export function recordAiError(engine: string, errorType: string): void {
  aiErrorsTotal.labels(engine, errorType).inc();
}

/**
 * Record cache hit
 */
export function recordCacheHit(cacheType: string): void {
  cacheHitTotal.labels(cacheType).inc();
}

/**
 * Record cache miss
 */
export function recordCacheMiss(cacheType: string): void {
  cacheMissTotal.labels(cacheType).inc();
}

/**
 * Update system metrics
 */
export function updateSystemMetrics(): void {
  processUptime.set(process.uptime());

  const memUsage = process.memoryUsage();
  memoryUsage.labels('heap_used').set(memUsage.heapUsed);
  memoryUsage.labels('heap_total').set(memUsage.heapTotal);
  memoryUsage.labels('external').set(memUsage.external);
  memoryUsage.labels('rss').set(memUsage.rss);
}
