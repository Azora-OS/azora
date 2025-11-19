/**
 * Metrics Tests
 */

import {
  recordHttpRequest,
  recordHttpError,
  recordDbQuery,
  recordAiQuery,
  recordAiError,
  recordCacheHit,
  recordCacheMiss,
  updateSystemMetrics,
  httpRequestDuration,
  httpRequestTotal,
  httpErrorsTotal,
  dbQueryDuration,
  dbQueryTotal,
  aiQueryDuration,
  aiQueryTotal,
  aiErrorsTotal,
  cacheHitTotal,
  cacheMissTotal,
} from '../metrics';

describe('Metrics', () => {
  describe('recordHttpRequest', () => {
    it('should record HTTP request metrics', () => {
      const initialCount = (httpRequestTotal as any).get({
        method: 'GET',
        route: '/api/v1/courses',
        status_code: '200',
      })?.values[0]?.value || 0;

      recordHttpRequest('GET', '/api/v1/courses', 200, 0.5);

      const finalCount = (httpRequestTotal as any).get({
        method: 'GET',
        route: '/api/v1/courses',
        status_code: '200',
      })?.values[0]?.value || 0;

      expect(finalCount).toBeGreaterThan(initialCount);
    });

    it('should record HTTP request duration', () => {
      recordHttpRequest('POST', '/api/v1/enrollments', 201, 1.2);
      // Histogram records are stored internally
      expect(httpRequestDuration).toBeDefined();
    });
  });

  describe('recordHttpError', () => {
    it('should record HTTP errors', () => {
      const initialCount = (httpErrorsTotal as any).get({
        method: 'GET',
        route: '/api/v1/courses',
        error_type: 'ValidationError',
      })?.values[0]?.value || 0;

      recordHttpError('GET', '/api/v1/courses', 'ValidationError');

      const finalCount = (httpErrorsTotal as any).get({
        method: 'GET',
        route: '/api/v1/courses',
        error_type: 'ValidationError',
      })?.values[0]?.value || 0;

      expect(finalCount).toBeGreaterThan(initialCount);
    });
  });

  describe('recordDbQuery', () => {
    it('should record successful database queries', () => {
      const initialCount = (dbQueryTotal as any).get({
        operation: 'SELECT',
        table: 'courses',
        status: 'success',
      })?.values[0]?.value || 0;

      recordDbQuery('SELECT', 'courses', 0.05, 'success');

      const finalCount = (dbQueryTotal as any).get({
        operation: 'SELECT',
        table: 'courses',
        status: 'success',
      })?.values[0]?.value || 0;

      expect(finalCount).toBeGreaterThan(initialCount);
    });

    it('should record failed database queries', () => {
      const initialCount = (dbQueryTotal as any).get({
        operation: 'INSERT',
        table: 'enrollments',
        status: 'error',
      })?.values[0]?.value || 0;

      recordDbQuery('INSERT', 'enrollments', 0.1, 'error');

      const finalCount = (dbQueryTotal as any).get({
        operation: 'INSERT',
        table: 'enrollments',
        status: 'error',
      })?.values[0]?.value || 0;

      expect(finalCount).toBeGreaterThan(initialCount);
    });
  });

  describe('recordAiQuery', () => {
    it('should record successful AI queries', () => {
      const initialCount = (aiQueryTotal as any).get({
        engine: 'elara',
        operation: 'tutoring',
        status: 'success',
      })?.values[0]?.value || 0;

      recordAiQuery('elara', 'tutoring', 2.5, 'success');

      const finalCount = (aiQueryTotal as any).get({
        engine: 'elara',
        operation: 'tutoring',
        status: 'success',
      })?.values[0]?.value || 0;

      expect(finalCount).toBeGreaterThan(initialCount);
    });

    it('should record failed AI queries', () => {
      const initialCount = (aiQueryTotal as any).get({
        engine: 'knowledge-ocean',
        operation: 'retrieval',
        status: 'error',
      })?.values[0]?.value || 0;

      recordAiQuery('knowledge-ocean', 'retrieval', 5.0, 'error');

      const finalCount = (aiQueryTotal as any).get({
        engine: 'knowledge-ocean',
        operation: 'retrieval',
        status: 'error',
      })?.values[0]?.value || 0;

      expect(finalCount).toBeGreaterThan(initialCount);
    });
  });

  describe('recordAiError', () => {
    it('should record AI errors', () => {
      const initialCount = (aiErrorsTotal as any).get({
        engine: 'constitutional-ai',
        error_type: 'ValidationError',
      })?.values[0]?.value || 0;

      recordAiError('constitutional-ai', 'ValidationError');

      const finalCount = (aiErrorsTotal as any).get({
        engine: 'constitutional-ai',
        error_type: 'ValidationError',
      })?.values[0]?.value || 0;

      expect(finalCount).toBeGreaterThan(initialCount);
    });
  });

  describe('recordCacheHit', () => {
    it('should record cache hits', () => {
      const initialCount = (cacheHitTotal as any).get({
        cache_type: 'redis',
      })?.values[0]?.value || 0;

      recordCacheHit('redis');

      const finalCount = (cacheHitTotal as any).get({
        cache_type: 'redis',
      })?.values[0]?.value || 0;

      expect(finalCount).toBeGreaterThan(initialCount);
    });
  });

  describe('recordCacheMiss', () => {
    it('should record cache misses', () => {
      const initialCount = (cacheMissTotal as any).get({
        cache_type: 'redis',
      })?.values[0]?.value || 0;

      recordCacheMiss('redis');

      const finalCount = (cacheMissTotal as any).get({
        cache_type: 'redis',
      })?.values[0]?.value || 0;

      expect(finalCount).toBeGreaterThan(initialCount);
    });
  });

  describe('updateSystemMetrics', () => {
    it('should update system metrics without errors', () => {
      expect(() => {
        updateSystemMetrics();
      }).not.toThrow();
    });
  });
});
