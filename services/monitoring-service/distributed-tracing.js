// Task 11: Distributed Tracing Implementation
const { v4: uuidv4 } = require('uuid');

class DistributedTracing {
  constructor() {
    this.traces = new Map();
    this.spans = new Map();
  }

  startTrace(operationName, parentTraceId = null) {
    const traceId = uuidv4();
    const trace = {
      traceId,
      parentTraceId,
      operationName,
      startTime: Date.now(),
      spans: [],
      status: 'active'
    };
    
    this.traces.set(traceId, trace);
    return traceId;
  }

  startSpan(traceId, spanName, tags = {}) {
    const spanId = uuidv4();
    const span = {
      spanId,
      traceId,
      spanName,
      startTime: Date.now(),
      tags,
      logs: [],
      status: 'active'
    };
    
    this.spans.set(spanId, span);
    
    const trace = this.traces.get(traceId);
    if (trace) {
      trace.spans.push(spanId);
    }
    
    return spanId;
  }

  finishSpan(spanId, tags = {}) {
    const span = this.spans.get(spanId);
    if (span) {
      span.endTime = Date.now();
      span.duration = span.endTime - span.startTime;
      span.status = 'finished';
      Object.assign(span.tags, tags);
    }
  }

  addLog(spanId, message, level = 'info') {
    const span = this.spans.get(spanId);
    if (span) {
      span.logs.push({
        timestamp: Date.now(),
        level,
        message
      });
    }
  }

  getTrace(traceId) {
    const trace = this.traces.get(traceId);
    if (!trace) return null;
    
    const spans = trace.spans.map(spanId => this.spans.get(spanId));
    return { ...trace, spans };
  }

  middleware() {
    return (req, res, next) => {
      const traceId = req.headers['x-trace-id'] || this.startTrace(`${req.method} ${req.path}`);
      const spanId = this.startSpan(traceId, `HTTP ${req.method}`, {
        'http.method': req.method,
        'http.url': req.url,
        'http.user_agent': req.headers['user-agent']
      });
      
      req.traceId = traceId;
      req.spanId = spanId;
      res.setHeader('x-trace-id', traceId);
      
      res.on('finish', () => {
        this.finishSpan(spanId, {
          'http.status_code': res.statusCode,
          'http.response_size': res.get('content-length') || 0
        });
      });
      
      next();
    };
  }
}

module.exports = DistributedTracing;