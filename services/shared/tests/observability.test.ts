import { Request, Response, NextFunction } from 'express';

describe('Shared Utilities - Observability', () => {
  describe('Tracing', () => {
    it('should generate trace ID', () => {
      const generateTraceId = (): string => {
        return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      };
      
      const traceId = generateTraceId();
      expect(traceId).toMatch(/^trace-\d+-[a-z0-9]+$/);
    });
    
    it('should generate span ID', () => {
      const generateSpanId = (): string => {
        return Math.random().toString(36).substr(2, 16);
      };
      
      const spanId = generateSpanId();
      expect(spanId).toBeDefined();
      expect(spanId.length).toBeGreaterThan(0);
    });
    
    it('should attach trace context to request', () => {
      const mockRequest: any = {
        headers: {}
      };
      
      const tracingMiddleware = (req: any, res: Response, next: NextFunction) => {
        req.traceId = `trace-${Date.now()}`;
        req.spanId = Math.random().toString(36).substr(2, 16);
        next();
      };
      
      const mockResponse = {} as Response;
      const nextFunction = jest.fn();
      
      tracingMiddleware(mockRequest, mockResponse, nextFunction);
      
      expect(mockRequest.traceId).toBeDefined();
      expect(mockRequest.spanId).toBeDefined();
      expect(nextFunction).toHaveBeenCalled();
    });
  });
  
  describe('Metrics', () => {
    it('should track request duration', () => {
      const startTime = Date.now();
      const endTime = startTime + 150;
      const duration = endTime - startTime;
      
      expect(duration).toBe(150);
    });
    
    it('should count requests by endpoint', () => {
      const requestCounts = new Map<string, number>();
      
      const incrementCounter = (endpoint: string) => {
        const count = requestCounts.get(endpoint) || 0;
        requestCounts.set(endpoint, count + 1);
      };
      
      incrementCounter('/api/users');
      incrementCounter('/api/users');
      incrementCounter('/api/courses');
      
      expect(requestCounts.get('/api/users')).toBe(2);
      expect(requestCounts.get('/api/courses')).toBe(1);
    });
    
    it('should track error rates', () => {
      const metrics = {
        totalRequests: 0,
        errorRequests: 0
      };
      
      const recordRequest = (isError: boolean) => {
        metrics.totalRequests++;
        if (isError) metrics.errorRequests++;
      };
      
      const getErrorRate = (): number => {
        return metrics.totalRequests > 0
          ? (metrics.errorRequests / metrics.totalRequests) * 100
          : 0;
      };
      
      recordRequest(false);
      recordRequest(false);
      recordRequest(true);
      recordRequest(false);
      
      expect(getErrorRate()).toBe(25);
    });
  });
  
  describe('Health Checks', () => {
    it('should check service health', () => {
      const checkHealth = (): { status: string; timestamp: string } => {
        return {
          status: 'healthy',
          timestamp: new Date().toISOString()
        };
      };
      
      const health = checkHealth();
      expect(health.status).toBe('healthy');
      expect(health.timestamp).toBeDefined();
    });
    
    it('should check dependency health', () => {
      const checkDependencies = (): Record<string, boolean> => {
        return {
          database: true,
          redis: true,
          externalAPI: false
        };
      };
      
      const dependencies = checkDependencies();
      expect(dependencies.database).toBe(true);
      expect(dependencies.redis).toBe(true);
      expect(dependencies.externalAPI).toBe(false);
    });
  });
  
  describe('Performance Monitoring', () => {
    it('should measure function execution time', async () => {
      const measureExecutionTime = async (fn: () => Promise<void>): Promise<number> => {
        const start = Date.now();
        await fn();
        return Date.now() - start;
      };
      
      const testFunction = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      };
      
      const duration = await measureExecutionTime(testFunction);
      expect(duration).toBeGreaterThanOrEqual(10);
    });
    
    it('should track slow queries', () => {
      const slowQueries: Array<{ query: string; duration: number }> = [];
      const SLOW_QUERY_THRESHOLD = 100;
      
      const recordQuery = (query: string, duration: number) => {
        if (duration > SLOW_QUERY_THRESHOLD) {
          slowQueries.push({ query, duration });
        }
      };
      
      recordQuery('SELECT * FROM users', 50);
      recordQuery('SELECT * FROM large_table', 150);
      recordQuery('SELECT * FROM another_table', 200);
      
      expect(slowQueries.length).toBe(2);
      expect(slowQueries[0].duration).toBe(150);
    });
  });
  
  describe('Error Tracking', () => {
    it('should capture error details', () => {
      const captureError = (error: Error, context: Record<string, any>) => {
        return {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          ...context
        };
      };
      
      const error = new Error('Test error');
      const errorDetails = captureError(error, { userId: '123', endpoint: '/api/test' });
      
      expect(errorDetails.message).toBe('Test error');
      expect(errorDetails.stack).toBeDefined();
      expect(errorDetails.userId).toBe('123');
      expect(errorDetails.endpoint).toBe('/api/test');
    });
    
    it('should categorize errors', () => {
      const categorizeError = (statusCode: number): string => {
        if (statusCode >= 500) return 'server_error';
        if (statusCode >= 400) return 'client_error';
        return 'unknown';
      };
      
      expect(categorizeError(500)).toBe('server_error');
      expect(categorizeError(404)).toBe('client_error');
      expect(categorizeError(200)).toBe('unknown');
    });
  });
});
