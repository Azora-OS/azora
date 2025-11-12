const logger = require('./logger');

class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byEndpoint: {},
        byMethod: {},
      },
      performance: {
        avgResponseTime: 0,
        responseTimes: [],
        slowestEndpoint: null,
        fastestEndpoint: null,
      },
      errors: {
        total: 0,
        byType: {},
      },
      auth: {
        logins: 0,
        registrations: 0,
        failedLogins: 0,
      },
      business: {
        enrollments: 0,
        coursesCreated: 0,
        tokensEarned: 0,
        paymentsProcessed: 0,
      },
    };
  }

  recordRequest(method, path, statusCode, duration) {
    this.metrics.requests.total++;
    
    if (statusCode >= 200 && statusCode < 400) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
    }

    // By endpoint
    if (!this.metrics.requests.byEndpoint[path]) {
      this.metrics.requests.byEndpoint[path] = 0;
    }
    this.metrics.requests.byEndpoint[path]++;

    // By method
    if (!this.metrics.requests.byMethod[method]) {
      this.metrics.requests.byMethod[method] = 0;
    }
    this.metrics.requests.byMethod[method]++;

    // Performance
    this.metrics.performance.responseTimes.push({
      endpoint: path,
      duration,
      timestamp: Date.now(),
    });

    // Keep only last 1000 response times
    if (this.metrics.performance.responseTimes.length > 1000) {
      this.metrics.performance.responseTimes.shift();
    }

    // Calculate average
    const times = this.metrics.performance.responseTimes.map(r => r.duration);
    this.metrics.performance.avgResponseTime = 
      times.reduce((sum, t) => sum + t, 0) / times.length;

    // Track slowest/fastest
    if (!this.metrics.performance.slowestEndpoint || 
        duration > this.metrics.performance.slowestEndpoint.duration) {
      this.metrics.performance.slowestEndpoint = { path, duration };
    }

    if (!this.metrics.performance.fastestEndpoint || 
        duration < this.metrics.performance.fastestEndpoint.duration) {
      this.metrics.performance.fastestEndpoint = { path, duration };
    }
  }

  recordError(errorType) {
    this.metrics.errors.total++;
    if (!this.metrics.errors.byType[errorType]) {
      this.metrics.errors.byType[errorType] = 0;
    }
    this.metrics.errors.byType[errorType]++;
  }

  recordLogin(successful = true) {
    if (successful) {
      this.metrics.auth.logins++;
    } else {
      this.metrics.auth.failedLogins++;
    }
  }

  recordRegistration() {
    this.metrics.auth.registrations++;
  }

  recordEnrollment() {
    this.metrics.business.enrollments++;
  }

  recordCourseCreated() {
    this.metrics.business.coursesCreated++;
  }

  recordTokensEarned(amount) {
    this.metrics.business.tokensEarned += amount;
  }

  recordPayment() {
    this.metrics.business.paymentsProcessed++;
  }

  getMetrics() {
    return {
      ...this.metrics,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }

  reset() {
    this.metrics = {
      requests: { total: 0, successful: 0, failed: 0, byEndpoint: {}, byMethod: {} },
      performance: { avgResponseTime: 0, responseTimes: [], slowestEndpoint: null, fastestEndpoint: null },
      errors: { total: 0, byType: {} },
      auth: { logins: 0, registrations: 0, failedLogins: 0 },
      business: { enrollments: 0, coursesCreated: 0, tokensEarned: 0, paymentsProcessed: 0 },
    };
    logger.info('Metrics reset');
  }
}

// Singleton instance
const metricsCollector = new MetricsCollector();

// Middleware for automatic request tracking
function metricsMiddleware(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    metricsCollector.recordRequest(
      req.method,
      req.path,
      res.statusCode,
      duration
    );
  });

  next();
}

module.exports = {
  metricsCollector,
  metricsMiddleware,
};
