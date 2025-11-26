const DistributedTracing = require('../distributed-tracing');

describe('Distributed Tracing', () => {
  let tracing;

  beforeEach(() => {
    tracing = new DistributedTracing();
  });

  describe('Trace Management', () => {
    it('should start a new trace', () => {
      const traceId = tracing.startTrace('test-operation');

      expect(traceId).toBeDefined();
      expect(typeof traceId).toBe('string');
    });

    it('should create trace with operation name', () => {
      const traceId = tracing.startTrace('user-registration');
      const trace = tracing.getTrace(traceId);

      expect(trace).toBeDefined();
      expect(trace.operationName).toBe('user-registration');
    });

    it('should support parent trace ID', () => {
      const parentTraceId = tracing.startTrace('parent-operation');
      const childTraceId = tracing.startTrace('child-operation', parentTraceId);

      const childTrace = tracing.getTrace(childTraceId);
      expect(childTrace.parentTraceId).toBe(parentTraceId);
    });

    it('should track trace start time', () => {
      const traceId = tracing.startTrace('test-operation');
      const trace = tracing.getTrace(traceId);

      expect(trace.startTime).toBeDefined();
      expect(typeof trace.startTime).toBe('number');
    });

    it('should initialize trace with active status', () => {
      const traceId = tracing.startTrace('test-operation');
      const trace = tracing.getTrace(traceId);

      expect(trace.status).toBe('active');
    });
  });

  describe('Span Management', () => {
    it('should start a span within a trace', () => {
      const traceId = tracing.startTrace('test-operation');
      const spanId = tracing.startSpan(traceId, 'database-query');

      expect(spanId).toBeDefined();
      expect(typeof spanId).toBe('string');
    });

    it('should associate span with trace', () => {
      const traceId = tracing.startTrace('test-operation');
      const spanId = tracing.startSpan(traceId, 'api-call');

      const trace = tracing.getTrace(traceId);
      expect(trace.spans).toContain(spanId);
    });

    it('should support span tags', () => {
      const traceId = tracing.startTrace('test-operation');
      const spanId = tracing.startSpan(traceId, 'http-request', {
        'http.method': 'GET',
        'http.url': '/api/users'
      });

      const trace = tracing.getTrace(traceId);
      const span = trace.spans.find(s => s.spanId === spanId);
      
      expect(span.tags['http.method']).toBe('GET');
      expect(span.tags['http.url']).toBe('/api/users');
    });

    it('should finish span and calculate duration', () => {
      const traceId = tracing.startTrace('test-operation');
      const spanId = tracing.startSpan(traceId, 'test-span');

      tracing.finishSpan(spanId);

      const trace = tracing.getTrace(traceId);
      const span = trace.spans.find(s => s.spanId === spanId);

      expect(span.status).toBe('finished');
      expect(span.duration).toBeDefined();
      expect(span.duration).toBeGreaterThanOrEqual(0);
    });

    it('should add tags when finishing span', () => {
      const traceId = tracing.startTrace('test-operation');
      const spanId = tracing.startSpan(traceId, 'test-span');

      tracing.finishSpan(spanId, { 'result': 'success' });

      const trace = tracing.getTrace(traceId);
      const span = trace.spans.find(s => s.spanId === spanId);

      expect(span.tags.result).toBe('success');
    });
  });

  describe('Span Logging', () => {
    it('should add logs to span', () => {
      const traceId = tracing.startTrace('test-operation');
      const spanId = tracing.startSpan(traceId, 'test-span');

      tracing.addLog(spanId, 'Processing request');

      const trace = tracing.getTrace(traceId);
      const span = trace.spans.find(s => s.spanId === spanId);

      expect(span.logs).toHaveLength(1);
      expect(span.logs[0].message).toBe('Processing request');
    });

    it('should support log levels', () => {
      const traceId = tracing.startTrace('test-operation');
      const spanId = tracing.startSpan(traceId, 'test-span');

      tracing.addLog(spanId, 'Error occurred', 'error');

      const trace = tracing.getTrace(traceId);
      const span = trace.spans.find(s => s.spanId === spanId);

      expect(span.logs[0].level).toBe('error');
    });

    it('should default to info level', () => {
      const traceId = tracing.startTrace('test-operation');
      const spanId = tracing.startSpan(traceId, 'test-span');

      tracing.addLog(spanId, 'Info message');

      const trace = tracing.getTrace(traceId);
      const span = trace.spans.find(s => s.spanId === spanId);

      expect(span.logs[0].level).toBe('info');
    });

    it('should include timestamp in logs', () => {
      const traceId = tracing.startTrace('test-operation');
      const spanId = tracing.startSpan(traceId, 'test-span');

      tracing.addLog(spanId, 'Test log');

      const trace = tracing.getTrace(traceId);
      const span = trace.spans.find(s => s.spanId === spanId);

      expect(span.logs[0].timestamp).toBeDefined();
    });
  });

  describe('Middleware Integration', () => {
    it('should create middleware function', () => {
      const middleware = tracing.middleware();

      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // req, res, next
    });

    it('should add trace ID to request', (done) => {
      const middleware = tracing.middleware();
      const req = { headers: {}, method: 'GET', path: '/test', url: '/test' };
      const res = {
        setHeader: jest.fn(),
        on: jest.fn()
      };
      const next = () => {
        expect(req.traceId).toBeDefined();
        expect(req.spanId).toBeDefined();
        done();
      };

      middleware(req, res, next);
    });

    it('should set trace ID header in response', (done) => {
      const middleware = tracing.middleware();
      const req = { headers: {}, method: 'GET', path: '/test', url: '/test' };
      const res = {
        setHeader: jest.fn(),
        on: jest.fn()
      };
      const next = () => {
        expect(res.setHeader).toHaveBeenCalledWith('x-trace-id', expect.any(String));
        done();
      };

      middleware(req, res, next);
    });

    it('should use existing trace ID from header', (done) => {
      const existingTraceId = 'existing-trace-123';
      const middleware = tracing.middleware();
      const req = {
        headers: { 'x-trace-id': existingTraceId },
        method: 'GET',
        path: '/test',
        url: '/test'
      };
      const res = {
        setHeader: jest.fn(),
        on: jest.fn()
      };
      const next = () => {
        expect(req.traceId).toBe(existingTraceId);
        done();
      };

      middleware(req, res, next);
    });

    it('should create span with HTTP metadata', (done) => {
      const middleware = tracing.middleware();
      const req = {
        headers: { 'user-agent': 'test-agent' },
        method: 'POST',
        path: '/api/users',
        url: '/api/users'
      };
      const res = {
        setHeader: jest.fn(),
        on: jest.fn()
      };
      const next = () => {
        const trace = tracing.getTrace(req.traceId);
        const span = trace.spans.find(s => s.spanId === req.spanId);
        
        expect(span.tags['http.method']).toBe('POST');
        expect(span.tags['http.url']).toBe('/api/users');
        done();
      };

      middleware(req, res, next);
    });
  });

  describe('Trace Retrieval', () => {
    it('should retrieve trace by ID', () => {
      const traceId = tracing.startTrace('test-operation');
      const trace = tracing.getTrace(traceId);

      expect(trace).toBeDefined();
      expect(trace.traceId).toBe(traceId);
    });

    it('should return null for non-existent trace', () => {
      const trace = tracing.getTrace('non-existent-id');

      expect(trace).toBeNull();
    });

    it('should include all spans in trace', () => {
      const traceId = tracing.startTrace('test-operation');
      tracing.startSpan(traceId, 'span-1');
      tracing.startSpan(traceId, 'span-2');

      const trace = tracing.getTrace(traceId);

      expect(trace.spans).toHaveLength(2);
    });
  });

  describe('Multiple Traces', () => {
    it('should handle multiple concurrent traces', () => {
      const trace1 = tracing.startTrace('operation-1');
      const trace2 = tracing.startTrace('operation-2');

      expect(trace1).not.toBe(trace2);
      expect(tracing.getTrace(trace1)).toBeDefined();
      expect(tracing.getTrace(trace2)).toBeDefined();
    });

    it('should keep traces isolated', () => {
      const trace1 = tracing.startTrace('operation-1');
      const trace2 = tracing.startTrace('operation-2');

      tracing.startSpan(trace1, 'span-1');
      tracing.startSpan(trace2, 'span-2');

      const t1 = tracing.getTrace(trace1);
      const t2 = tracing.getTrace(trace2);

      expect(t1.spans).toHaveLength(1);
      expect(t2.spans).toHaveLength(1);
    });
  });
});
