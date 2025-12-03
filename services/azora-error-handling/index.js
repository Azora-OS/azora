const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
const axios = require('axios');
const Redis = require('ioredis');
const EventEmitter = require('events');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3036;

// Initialize Redis for circuit breaker state
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'azora-error-handling' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'error-handling.log' })
  ]
});

// Circuit Breaker States
const CircuitState = {
  CLOSED: 'closed',
  OPEN: 'open',
  HALF_OPEN: 'half_open'
};

// Enhanced Circuit Breaker Implementation
class CircuitBreaker extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.name = options.name || 'default';
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeout = options.recoveryTimeout || 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 10000; // 10 seconds
    this.expectedRecoveryTime = options.expectedRecoveryTime || 30000; // 30 seconds
    
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
    this.requestCount = 0;
    this.lastStateChange = new Date();
    
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      timeouts: 0,
      circuitBreaks: 0,
      averageResponseTime: 0,
      responseTimeHistory: []
    };

    // Start monitoring
    this.startMonitoring();
  }

  async execute(operation, context = {}) {
    const startTime = Date.now();
    this.stats.totalRequests++;
    this.requestCount++;

    try {
      // Check if circuit is open
      if (this.state === CircuitState.OPEN) {
        if (this.shouldAttemptReset()) {
          this.setState(CircuitState.HALF_OPEN);
        } else {
          throw new CircuitBreakerOpenError(`Circuit breaker '${this.name}' is OPEN`);
        }
      }

      // Execute operation with timeout
      const timeout = context.timeout || this.expectedRecoveryTime;
      const result = await this.executeWithTimeout(operation, timeout);
      
      // Success path
      const responseTime = Date.now() - startTime;
      this.onSuccess(responseTime);
      
      return result;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.onFailure(error, responseTime);
      throw error;
    }
  }

  async executeWithTimeout(operation, timeout) {
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new TimeoutError(`Operation timed out after ${timeout}ms`));
      }, timeout);

      try {
        const result = await operation();
        clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  onSuccess(responseTime) {
    this.stats.successfulRequests++;
    this.stats.averageResponseTime = this.calculateAverageResponseTime(responseTime);
    
    // Track response time history
    this.stats.responseTimeHistory.push({
      timestamp: new Date().toISOString(),
      responseTime
    });
    
    if (this.stats.responseTimeHistory.length > 100) {
      this.stats.responseTimeHistory = this.stats.responseTimeHistory.slice(-100);
    }

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= 3) { // Need 3 successes to close circuit
        this.setState(CircuitState.CLOSED);
      }
    } else {
      this.failureCount = 0; // Reset failure count on success
    }

    this.emit('success', {
      circuitBreaker: this.name,
      state: this.state,
      responseTime,
      stats: this.getStats()
    });
  }

  onFailure(error, responseTime) {
    this.stats.failedRequests++;
    
    if (error instanceof TimeoutError) {
      this.stats.timeouts++;
    }

    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.failureCount >= this.failureThreshold) {
      this.setState(CircuitState.OPEN);
    }

    this.emit('failure', {
      circuitBreaker: this.name,
      state: this.state,
      error: error.message,
      responseTime,
      failureCount: this.failureCount,
      stats: this.getStats()
    });
  }

  setState(newState) {
    const oldState = this.state;
    this.state = newState;
    this.lastStateChange = new Date();

    if (newState === CircuitState.OPEN) {
      this.stats.circuitBreaks++;
      this.successCount = 0;
    } else if (newState === CircuitState.CLOSED) {
      this.failureCount = 0;
      this.successCount = 0;
    }

    this.emit('stateChange', {
      circuitBreaker: this.name,
      oldState,
      newState,
      timestamp: this.lastStateChange,
      stats: this.getStats()
    });

    // Persist state to Redis
    this.persistState();
  }

  shouldAttemptReset() {
    return Date.now() - this.lastFailureTime.getTime() >= this.recoveryTimeout;
  }

  calculateAverageResponseTime(newResponseTime) {
    if (this.stats.responseTimeHistory.length === 0) {
      return newResponseTime;
    }
    
    const total = this.stats.responseTimeHistory.reduce((sum, entry) => sum + entry.responseTime, 0);
    return (total + newResponseTime) / (this.stats.responseTimeHistory.length + 1);
  }

  getStats() {
    return {
      ...this.stats,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastStateChange: this.lastStateChange,
      lastFailureTime: this.lastFailureTime,
      requestCount: this.requestCount,
      uptime: this.calculateUptime()
    };
  }

  calculateUptime() {
    if (this.stats.totalRequests === 0) return 100;
    return (this.stats.successfulRequests / this.stats.totalRequests) * 100;
  }

  async persistState() {
    try {
      await redis.setex(`circuit:${this.name}`, 3600, JSON.stringify({
        state: this.state,
        failureCount: this.failureCount,
        lastFailureTime: this.lastFailureTime,
        stats: this.stats
      }));
    } catch (error) {
      logger.error('Failed to persist circuit breaker state', { 
        circuitBreaker: this.name, 
        error: error.message 
      });
    }
  }

  async loadPersistedState() {
    try {
      const data = await redis.get(`circuit:${this.name}`);
      if (data) {
        const state = JSON.parse(data);
        this.state = state.state || CircuitState.CLOSED;
        this.failureCount = state.failureCount || 0;
        this.lastFailureTime = state.lastFailureTime ? new Date(state.lastFailureTime) : null;
        this.stats = { ...this.stats, ...state.stats };
      }
    } catch (error) {
      logger.error('Failed to load persisted circuit breaker state', { 
        circuitBreaker: this.name, 
        error: error.message 
      });
    }
  }

  startMonitoring() {
    setInterval(() => {
      this.emit('monitoring', {
        circuitBreaker: this.name,
        stats: this.getStats()
      });
    }, this.monitoringPeriod);
  }

  reset() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.lastStateChange = new Date();
    this.requestCount = 0;
    
    this.emit('reset', {
      circuitBreaker: this.name,
      timestamp: this.lastStateChange
    });
  }
}

// Custom Error Classes
class CircuitBreakerOpenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
    this.code = 'CIRCUIT_BREAKER_OPEN';
  }
}

class TimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TimeoutError';
    this.code = 'TIMEOUT';
  }
}

class RetryError extends Error {
  constructor(message, attempts) {
    super(message);
    this.name = 'RetryError';
    this.code = 'MAX_RETRIES_EXCEEDED';
    this.attempts = attempts;
  }
}

// Retry Mechanism with Exponential Backoff
class RetryHandler {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.initialDelay = options.initialDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.backoffMultiplier = options.backoffMultiplier || 2;
    this.retryableErrors = options.retryableErrors || [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNREFUSED'
    ];
  }

  async execute(operation, context = {}) {
    let lastError;
    const attemptContexts = [];

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await operation();
        
        if (attempt > 0) {
          logger.info(`Operation succeeded after ${attempt} retries`, {
            attempt,
            lastError: lastError?.message
          });
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        attemptContexts.push({
          attempt: attempt + 1,
          error: error.message,
          timestamp: new Date().toISOString()
        });

        if (attempt === this.maxRetries || !this.shouldRetry(error)) {
          throw new RetryError(
            `Max retries (${this.maxRetries}) exceeded. Last error: ${error.message}`,
            attempt + 1
          );
        }

        const delay = this.calculateDelay(attempt);
        logger.warn(`Operation failed, retrying in ${delay}ms`, {
          attempt: attempt + 1,
          maxRetries: this.maxRetries,
          error: error.message
        });

        await this.sleep(delay);
      }
    }
  }

  shouldRetry(error) {
    return this.retryableErrors.includes(error.code) || 
           error.message.includes('timeout') ||
           error.message.includes('connection');
  }

  calculateDelay(attempt) {
    const delay = this.initialDelay * Math.pow(this.backoffMultiplier, attempt);
    return Math.min(delay, this.maxDelay);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Enhanced Error Handling Framework
class ErrorHandlingFramework extends EventEmitter {
  constructor() {
    super();
    this.circuitBreakers = new Map();
    this.retryHandlers = new Map();
    this.errorPatterns = new Map();
    this.globalHandlers = [];
    this.metrics = {
      totalErrors: 0,
      handledErrors: 0,
      unhandledErrors: 0,
      circuitBreakerActivations: 0,
      retryAttempts: 0
    };

    this.initializeDefaultHandlers();
  }

  initializeDefaultHandlers() {
    // Register default circuit breakers for common services
    this.registerCircuitBreaker('database', {
      failureThreshold: 5,
      recoveryTimeout: 30000,
      monitoringPeriod: 10000
    });

    this.registerCircuitBreaker('external_api', {
      failureThreshold: 3,
      recoveryTimeout: 60000,
      monitoringPeriod: 15000
    });

    this.registerCircuitBreaker('payment_gateway', {
      failureThreshold: 2,
      recoveryTimeout: 120000,
      monitoringPeriod: 5000
    });

    // Register default retry handlers
    this.registerRetryHandler('default', {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 10000
    });

    this.registerRetryHandler('critical', {
      maxRetries: 5,
      initialDelay: 500,
      maxDelay: 5000
    });

    // Register error patterns
    this.registerErrorPattern('database_connection', {
      patterns: [/connection.*refused/i, /timeout.*database/i, /pool.*exhausted/i],
      handler: this.handleDatabaseError.bind(this),
      severity: 'high'
    });

    this.registerErrorPattern('payment_failure', {
      patterns: [/payment.*declined/i, /insufficient.*funds/i, /card.*declined/i],
      handler: this.handlePaymentError.bind(this),
      severity: 'medium'
    });

    this.registerErrorPattern('external_service', {
      patterns: [/service.*unavailable/i, /external.*timeout/i, /api.*limit/i],
      handler: this.handleExternalServiceError.bind(this),
      severity: 'medium'
    });
  }

  registerCircuitBreaker(name, options) {
    const circuitBreaker = new CircuitBreaker({ name, ...options });
    this.circuitBreakers.set(name, circuitBreaker);

    // Set up event listeners
    circuitBreaker.on('stateChange', (data) => {
      this.metrics.circuitBreakerActivations++;
      this.emit('circuitBreakerStateChange', data);
      logger.warn('Circuit breaker state changed', data);
    });

    circuitBreaker.on('failure', (data) => {
      this.emit('circuitBreakerFailure', data);
      logger.warn('Circuit breaker failure', data);
    });

    circuitBreaker.on('success', (data) => {
      this.emit('circuitBreakerSuccess', data);
      logger.info('Circuit breaker success', data);
    });

    // Load persisted state
    circuitBreaker.loadPersistedState();

    logger.info(`Circuit breaker registered`, { name, options });
  }

  registerRetryHandler(name, options) {
    const retryHandler = new RetryHandler(options);
    this.retryHandlers.set(name, retryHandler);
    logger.info(`Retry handler registered`, { name, options });
  }

  registerErrorPattern(name, config) {
    this.errorPatterns.set(name, config);
    logger.info(`Error pattern registered`, { name, patterns: config.patterns.length });
  }

  async executeWithProtection(operation, options = {}) {
    const {
      circuitBreaker = 'default',
      retryHandler = 'default',
      timeout = 30000,
      context = {}
    } = options;

    try {
      // Get circuit breaker and retry handler
      const cb = this.circuitBreakers.get(circuitBreaker);
      const rh = this.retryHandlers.get(retryHandler);

      if (!cb) {
        throw new Error(`Circuit breaker '${circuitBreaker}' not found`);
      }

      // Execute with circuit breaker and retry
      const result = await cb.execute(
        () => rh.execute(operation, context),
        { timeout }
      );

      return result;

    } catch (error) {
      await this.handleError(error, options);
      throw error;
    }
  }

  async handleError(error, options = {}) {
    this.metrics.totalErrors++;

    // Try to match error patterns
    for (const [patternName, pattern] of this.errorPatterns) {
      if (this.matchesPattern(error, pattern.patterns)) {
        this.metrics.handledErrors++;
        
        try {
          await pattern.handler(error, options);
          logger.info(`Error handled by pattern`, { 
            pattern: patternName, 
            error: error.message 
          });
          return;
        } catch (handlerError) {
          logger.error(`Error pattern handler failed`, { 
            pattern: patternName, 
            error: handlerError.message 
          });
        }
      }
    }

    // Try global handlers
    for (const handler of this.globalHandlers) {
      try {
        await handler(error, options);
        this.metrics.handledErrors++;
        return;
      } catch (handlerError) {
        logger.error('Global error handler failed', { error: handlerError.message });
      }
    }

    // Unhandled error
    this.metrics.unhandledErrors++;
    logger.error('Unhandled error', { 
      error: error.message, 
      stack: error.stack 
    });
  }

  matchesPattern(error, patterns) {
    const message = error.message;
    return patterns.some(pattern => pattern.test(message));
  }

  // Default error handlers
  async handleDatabaseError(error, options) {
    logger.warn('Database error detected', { error: error.message });
    
    // Try to reset database connections
    const dbCircuitBreaker = this.circuitBreakers.get('database');
    if (dbCircuitBreaker) {
      dbCircuitBreaker.setState(CircuitState.OPEN);
    }

    // Notify administrators
    this.emit('databaseError', { error, options });
  }

  async handlePaymentError(error, options) {
    logger.warn('Payment error detected', { error: error.message });
    
    // Check if it's a temporary issue
    if (error.message.includes('timeout') || error.message.includes('network')) {
      // Retry with different payment gateway
      this.emit('paymentRetry', { error, options });
    } else {
      // Permanent failure - notify user
      this.emit('paymentFailure', { error, options });
    }
  }

  async handleExternalServiceError(error, options) {
    logger.warn('External service error detected', { error: error.message });
    
    // Enable fallback mode
    this.emit('fallbackActivated', { error, options });
  }

  addGlobalHandler(handler) {
    this.globalHandlers.push(handler);
  }

  getMetrics() {
    const circuitBreakerStats = {};
    for (const [name, cb] of this.circuitBreakers) {
      circuitBreakerStats[name] = cb.getStats();
    }

    return {
      ...this.metrics,
      circuitBreakers: circuitBreakerStats,
      ubuntu: 'Error metrics show Ubuntu resilience'
    };
  }

  async resetAllCircuitBreakers() {
    for (const [name, cb] of this.circuitBreakers) {
      cb.reset();
    }
    logger.info('All circuit breakers reset');
  }

  async shutdown() {
    this.removeAllListeners();
    logger.info('Error handling framework shutdown complete');
  }
}

const errorFramework = new ErrorHandlingFramework();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(compression());
app.use(express.json());

// Ubuntu Rate Limiting
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { 
    error: 'Ubuntu rate limit exceeded', 
    ubuntu: 'Please slow down for error handling harmony' 
  }
});
app.use(ubuntuLimiter);

// Health Check
app.get('/health', async (req, res) => {
  try {
    const metrics = errorFramework.getMetrics();
    
    res.json({
      service: 'azora-error-handling',
      status: 'healthy',
      ubuntu: 'I protect our ecosystem with Ubuntu resilience',
      timestamp: new Date().toISOString(),
      port: PORT,
      metrics,
      features: {
        circuitBreakers: '✅ Active',
        retryMechanism: '✅ Active',
        errorPatterns: '✅ Active',
        globalHandlers: '✅ Active',
        ubuntuResilience: '✅ Active'
      }
    });
  } catch (error) {
    res.status(500).json({
      service: 'azora-error-handling',
      status: 'unhealthy',
      error: error.message,
      ubuntu: 'We handle health check errors with Ubuntu grace'
    });
  }
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'I am because we are - Ubuntu error handling for ecosystem resilience',
    principles: [
      'My protection shields our collective operations',
      'My recovery sustains our community continuity',
      'My patterns guide our shared wisdom',
      'My resilience nurtures our Ubuntu harmony'
    ],
    service: 'azora-error-handling',
    ubuntu: 'Ubuntu error handling'
  });
});

// ========== ERROR HANDLING ENDPOINTS ==========

// GET /api/circuit-breakers - Get all circuit breaker statuses
app.get('/api/circuit-breakers', (req, res) => {
  try {
    const metrics = errorFramework.getMetrics();
    
    res.json({
      circuitBreakers: metrics.circuitBreakers,
      summary: {
        total: Object.keys(metrics.circuitBreakers).length,
        open: Object.values(metrics.circuitBreakers).filter(cb => cb.state === 'open').length,
        closed: Object.values(metrics.circuitBreakers).filter(cb => cb.state === 'closed').length,
        halfOpen: Object.values(metrics.circuitBreakers).filter(cb => cb.state === 'half_open').length
      },
      ubuntu: 'Circuit breakers show Ubuntu protection'
    });
  } catch (error) {
    logger.error('Error getting circuit breakers:', error);
    res.status(500).json({
      error: 'Failed to get circuit breakers',
      ubuntu: 'We handle circuit breaker errors with Ubuntu grace'
    });
  }
});

// POST /api/circuit-breakers/:name/reset - Reset specific circuit breaker
app.post('/api/circuit-breakers/:name/reset', (req, res) => {
  try {
    const { name } = req.params;
    const circuitBreaker = errorFramework.circuitBreakers.get(name);
    
    if (!circuitBreaker) {
      return res.status(404).json({
        error: 'Circuit breaker not found',
        ubuntu: 'Ubuntu guidance: Check circuit breaker name'
      });
    }

    circuitBreaker.reset();

    console.log(`🔧 Circuit breaker reset: ${name}`);

    res.json({
      success: true,
      message: `Circuit breaker '${name}' reset successfully`,
      ubuntu: 'Circuit breaker reset with Ubuntu care'
    });
  } catch (error) {
    logger.error('Error resetting circuit breaker:', error);
    res.status(500).json({
      error: 'Failed to reset circuit breaker',
      ubuntu: 'We handle reset errors with Ubuntu grace'
    });
  }
});

// POST /api/circuit-breakers/reset - Reset all circuit breakers
app.post('/api/circuit-breakers/reset', async (req, res) => {
  try {
    await errorFramework.resetAllCircuitBreakers();

    console.log('🔧 All circuit breakers reset');

    res.json({
      success: true,
      message: 'All circuit breakers reset successfully',
      ubuntu: 'All circuit breakers reset with Ubuntu care'
    });
  } catch (error) {
    logger.error('Error resetting all circuit breakers:', error);
    res.status(500).json({
      error: 'Failed to reset all circuit breakers',
      ubuntu: 'We handle mass reset errors with Ubuntu grace'
    });
  }
});

// GET /api/metrics - Get error handling metrics
app.get('/api/metrics', (req, res) => {
  try {
    const metrics = errorFramework.getMetrics();
    
    res.json({
      metrics,
      ubuntu: 'Metrics show Ubuntu resilience'
    });
  } catch (error) {
    logger.error('Error getting metrics:', error);
    res.status(500).json({
      error: 'Failed to get metrics',
      ubuntu: 'We handle metrics errors with Ubuntu grace'
    });
  }
});

// POST /api/test/operation - Test error handling with simulated operation
app.post('/api/test/operation', async (req, res) => {
  try {
    const { 
      shouldFail = false, 
      failureType = 'error',
      timeout = 1000,
      circuitBreaker = 'test',
      retryHandler = 'default'
    } = req.body;

    // Register test circuit breaker if not exists
    if (!errorFramework.circuitBreakers.has('test')) {
      errorFramework.registerCircuitBreaker('test', {
        failureThreshold: 2,
        recoveryTimeout: 10000,
        monitoringPeriod: 5000
      });
    }

    const testOperation = async () => {
      if (shouldFail) {
        if (failureType === 'timeout') {
          await new Promise(resolve => setTimeout(resolve, timeout + 1000));
        } else if (failureType === 'network') {
          throw new Error('Network connection failed');
        } else {
          throw new Error('Simulated operation failure');
        }
      }
      return { success: true, timestamp: new Date().toISOString() };
    };

    const result = await errorFramework.executeWithProtection(testOperation, {
      circuitBreaker,
      retryHandler,
      timeout
    });

    console.log(`🧪 Test operation completed: ${shouldFail ? 'failed' : 'succeeded'}`);

    res.json({
      success: true,
      result,
      testConfig: { shouldFail, failureType, timeout, circuitBreaker, retryHandler },
      ubuntu: 'Test operation completed with Ubuntu protection'
    });
  } catch (error) {
    logger.error('Error in test operation:', error);
    res.status(500).json({
      error: 'Test operation failed',
      message: error.message,
      ubuntu: 'We handle test errors with Ubuntu grace'
    });
  }
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  logger.error('Ubuntu Error Handling Error:', error);
  
  // Handle the error through the framework
  errorFramework.handleError(error, { 
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers
    }
  });

  res.status(500).json({
    error: 'Ubuntu error handling error',
    ubuntu: 'We handle errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Error handling endpoint not found',
    ubuntu: 'Ubuntu guidance: Check available error handling endpoints',
    availableEndpoints: [
      '/api/circuit-breakers',
      '/api/circuit-breakers/:name/reset',
      '/api/circuit-breakers/reset',
      '/api/metrics',
      '/api/test/operation',
      '/health'
    ]
  });
});

// Start the service
app.listen(PORT, () => {
  console.log(`🛡️ Azora Error Handling running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I protect our ecosystem with Ubuntu resilience!"');
  console.log(`🔧 Circuit Breakers: Active`);
  console.log(`🔄 Retry Mechanism: Active`);
  console.log(`🎯 Error Patterns: Active`);
  console.log(`🌐 Global Handlers: Active`);
  console.log(`📊 Metrics Collection: Active`);
  console.log(`🌍 Ubuntu: Error handling through ecosystem resilience`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await errorFramework.shutdown();
  if (redis) await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  await errorFramework.shutdown();
  if (redis) await redis.quit();
  process.exit(0);
});

module.exports = app;
