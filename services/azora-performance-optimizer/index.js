const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
const crypto = require('crypto');
const Redis = require('ioredis');
const EventEmitter = require('events');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3037;

// Initialize Redis for caching and deduplication
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
  defaultMeta: { service: 'azora-performance-optimizer' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'performance-optimizer.log' })
  ]
});

// Advanced Response Cache Implementation
class ResponseCache {
  constructor(options = {}) {
    this.defaultTTL = options.defaultTTL || 300; // 5 minutes
    this.maxCacheSize = options.maxCacheSize || 10000;
    this.keyPrefix = options.keyPrefix || 'cache:';
    this.compressionEnabled = options.compressionEnabled || true;
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      totalRequests: 0,
      averageResponseTime: 0,
      cacheSize: 0
    };
  }

  generateCacheKey(req) {
    const keyData = {
      method: req.method,
      url: req.url,
      headers: this.getRelevantHeaders(req),
      body: req.method !== 'GET' ? req.body : undefined,
      query: req.query
    };
    
    return `${this.keyPrefix}${crypto.createHash('sha256').update(JSON.stringify(keyData)).digest('hex')}`;
  }

  getRelevantHeaders(req) {
    const relevantHeaders = ['authorization', 'x-user-id', 'x-tenant-id', 'accept-language'];
    const headers = {};
    
    relevantHeaders.forEach(header => {
      if (req.headers[header]) {
        headers[header] = req.headers[header];
      }
    });
    
    return headers;
  }

  async get(key) {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const cached = await redis.get(key);
      
      if (cached) {
        this.metrics.hits++;
        const responseTime = Date.now() - startTime;
        this.updateAverageResponseTime(responseTime);
        
        const data = JSON.parse(cached);
        
        // Check if cache entry is still valid
        if (data.expiresAt && Date.now() > data.expiresAt) {
          await this.delete(key);
          this.metrics.misses++;
          return null;
        }
        
        return data.content;
      }
      
      this.metrics.misses++;
      return null;
      
    } catch (error) {
      logger.error('Cache get error', { key, error: error.message });
      this.metrics.misses++;
      return null;
    }
  }

  async set(key, content, options = {}) {
    const ttl = options.ttl || this.defaultTTL;
    const tags = options.tags || [];
    const priority = options.priority || 'normal';
    
    try {
      const data = {
        content,
        createdAt: Date.now(),
        expiresAt: Date.now() + (ttl * 1000),
        tags,
        priority,
        accessCount: 0,
        lastAccessed: Date.now()
      };

      const serialized = JSON.stringify(data);
      
      // Apply compression if enabled and content is large enough
      let finalData = serialized;
      if (this.compressionEnabled && serialized.length > 1024) {
        // In production, would use actual compression
        finalData = serialized;
      }

      await redis.setex(key, ttl, finalData);
      
      // Store tags for invalidation
      if (tags.length > 0) {
        await this.storeTags(key, tags);
      }
      
      this.metrics.sets++;
      this.metrics.cacheSize = await this.getCurrentCacheSize();
      
      return true;
    } catch (error) {
      logger.error('Cache set error', { key, error: error.message });
      return false;
    }
  }

  async delete(key) {
    try {
      await redis.del(key);
      this.metrics.deletes++;
      this.metrics.cacheSize = await this.getCurrentCacheSize();
      return true;
    } catch (error) {
      logger.error('Cache delete error', { key, error: error.message });
      return false;
    }
  }

  async invalidateByTag(tag) {
    try {
      const tagKey = `tag:${tag}`;
      const keys = await redis.smembers(tagKey);
      
      if (keys.length > 0) {
        await redis.del(...keys);
        await redis.del(tagKey);
        
        this.metrics.evictions += keys.length;
        this.metrics.cacheSize = await this.getCurrentCacheSize();
        
        logger.info(`Cache invalidated by tag`, { tag, keysCount: keys.length });
      }
      
      return keys.length;
    } catch (error) {
      logger.error('Cache tag invalidation error', { tag, error: error.message });
      return 0;
    }
  }

  async storeTags(key, tags) {
    try {
      for (const tag of tags) {
        await redis.sadd(`tag:${tag}`, key);
        await redis.expire(`tag:${tag}`, 86400); // 24 hours
      }
    } catch (error) {
      logger.error('Cache tag storage error', { key, tags, error: error.message });
    }
  }

  async getCurrentCacheSize() {
    try {
      const keys = await redis.keys(`${this.keyPrefix}*`);
      return keys.length;
    } catch (error) {
      return 0;
    }
  }

  updateAverageResponseTime(responseTime) {
    const total = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1);
    this.metrics.averageResponseTime = (total + responseTime) / this.metrics.totalRequests;
  }

  getMetrics() {
    const hitRate = this.metrics.totalRequests > 0 ? 
      (this.metrics.hits / this.metrics.totalRequests) * 100 : 0;
    
    return {
      ...this.metrics,
      hitRate: Math.round(hitRate),
      ubuntu: 'Cache metrics show Ubuntu efficiency'
    };
  }

  async clear() {
    try {
      const keys = await redis.keys(`${this.keyPrefix}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
        this.metrics.cacheSize = 0;
        logger.info('Cache cleared', { keysCount: keys.length });
      }
    } catch (error) {
      logger.error('Cache clear error', { error: error.message });
    }
  }
}

// Request Deduplication System
class RequestDeduplicator {
  constructor(options = {}) {
    this.requestTimeout = options.requestTimeout || 30000; // 30 seconds
    this.keyPrefix = options.keyPrefix || 'dedup:';
    this.maxConcurrentRequests = options.maxConcurrentRequests || 100;
    this.metrics = {
      totalRequests: 0,
      deduplicatedRequests: 0,
      concurrentRequests: 0,
      averageWaitTime: 0,
      deduplicationRate: 0
    };
    this.activeRequests = new Map();
  }

  generateDedupKey(req) {
    const keyData = {
      method: req.method,
      url: req.url,
      headers: this.getRelevantHeaders(req),
      body: req.method !== 'GET' ? req.body : undefined,
      query: req.query
    };
    
    return `${this.keyPrefix}${crypto.createHash('sha256').update(JSON.stringify(keyData)).digest('hex')}`;
  }

  getRelevantHeaders(req) {
    // For deduplication, we might want different headers than caching
    const relevantHeaders = ['authorization', 'x-user-id', 'x-tenant-id'];
    const headers = {};
    
    relevantHeaders.forEach(header => {
      if (req.headers[header]) {
        headers[header] = req.headers[header];
      }
    });
    
    return headers;
  }

  async executeOrDeduplicate(req, operation) {
    const dedupKey = this.generateDedupKey(req);
    const startTime = Date.now();
    
    this.metrics.totalRequests++;
    
    try {
      // Check if request is already being processed
      const existingRequest = this.activeRequests.get(dedupKey);
      
      if (existingRequest) {
        // Wait for existing request to complete
        this.metrics.deduplicatedRequests++;
        
        logger.debug(`Request deduplicated`, { 
          dedupKey: dedupKey.substring(0, 16), 
          url: req.url 
        });
        
        const result = await existingRequest;
        const waitTime = Date.now() - startTime;
        this.updateAverageWaitTime(waitTime);
        
        return result;
      }
      
      // Check if request was recently completed (in Redis)
      const recentResult = await redis.get(dedupKey);
      if (recentResult) {
        const data = JSON.parse(recentResult);
        
        // Check if result is still fresh
        if (Date.now() - data.timestamp < this.requestTimeout) {
          this.metrics.deduplicatedRequests++;
          
          logger.debug(`Request deduplicated from cache`, { 
            dedupKey: dedupKey.substring(0, 16), 
            url: req.url 
          });
          
          return data.result;
        }
      }
      
      // Create new request promise
      const requestPromise = this.executeWithDeduplication(dedupKey, operation);
      
      // Store active request
      this.activeRequests.set(dedupKey, requestPromise);
      this.metrics.concurrentRequests = this.activeRequests.size;
      
      try {
        const result = await requestPromise;
        
        // Cache the result for potential deduplication
        await redis.setex(dedupKey, Math.ceil(this.requestTimeout / 1000), JSON.stringify({
          result,
          timestamp: Date.now()
        }));
        
        return result;
      } finally {
        // Clean up active request
        this.activeRequests.delete(dedupKey);
        this.metrics.concurrentRequests = this.activeRequests.size;
      }
      
    } catch (error) {
      // Clean up on error
      this.activeRequests.delete(dedupKey);
      this.metrics.concurrentRequests = this.activeRequests.size;
      throw error;
    }
  }

  async executeWithDeduplication(dedupKey, operation) {
    try {
      const result = await operation();
      return result;
    } catch (error) {
      // Don't cache failed requests
      await redis.del(dedupKey);
      throw error;
    }
  }

  updateAverageWaitTime(waitTime) {
    const total = this.metrics.averageWaitTime * (this.metrics.deduplicatedRequests - 1);
    this.metrics.averageWaitTime = (total + waitTime) / this.metrics.deduplicatedRequests;
  }

  getMetrics() {
    const deduplicationRate = this.metrics.totalRequests > 0 ? 
      (this.metrics.deduplicatedRequests / this.metrics.totalRequests) * 100 : 0;
    
    return {
      ...this.metrics,
      deduplicationRate: Math.round(deduplicationRate),
      ubuntu: 'Deduplication metrics show Ubuntu efficiency'
    };
  }

  async clear() {
    try {
      const keys = await redis.keys(`${this.keyPrefix}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      
      this.activeRequests.clear();
      this.metrics.concurrentRequests = 0;
      
      logger.info('Deduplication cache cleared', { keysCount: keys.length });
    } catch (error) {
      logger.error('Deduplication clear error', { error: error.message });
    }
  }
}

// Performance Optimization Framework
class PerformanceOptimizer extends EventEmitter {
  constructor() {
    super();
    this.responseCache = new ResponseCache({
      defaultTTL: 300,
      maxCacheSize: 10000,
      compressionEnabled: true
    });
    
    this.requestDeduplicator = new RequestDeduplicator({
      requestTimeout: 30000,
      maxConcurrentRequests: 100
    });
    
    this.optimizationRules = new Map();
    this.performanceMetrics = {
      totalRequests: 0,
      cacheHits: 0,
      deduplicatedRequests: 0,
      averageResponseTime: 0,
      slowRequests: 0,
      errorRate: 0
    };
    
    this.initializeOptimizationRules();
  }

  initializeOptimizationRules() {
    // Cache rules for different endpoints
    this.addOptimizationRule('/api/health', {
      cacheTTL: 60, // 1 minute
      deduplicate: true,
      tags: ['health'],
      priority: 'high'
    });

    this.addOptimizationRule('/api/ubuntu/philosophy', {
      cacheTTL: 3600, // 1 hour
      deduplicate: true,
      tags: ['static'],
      priority: 'high'
    });

    this.addOptimizationRule('/api/stats', {
      cacheTTL: 30, // 30 seconds
      deduplicate: true,
      tags: ['stats'],
      priority: 'medium'
    });

    // API endpoints with dynamic caching
    this.addOptimizationRule('/api/users/profile', {
      cacheTTL: 600, // 10 minutes
      deduplicate: true,
      tags: ['user', 'profile'],
      priority: 'medium',
      cacheKeyGenerator: (req) => `user:${req.headers['x-user-id']}:profile`
    });

    this.addOptimizationRule('/api/courses/list', {
      cacheTTL: 300, // 5 minutes
      deduplicate: true,
      tags: ['courses', 'list'],
      priority: 'medium'
    });

    logger.info(`Initialized ${this.optimizationRules.size} optimization rules`);
  }

  addOptimizationRule(pattern, config) {
    this.optimizationRules.set(pattern, {
      pattern,
      cacheTTL: config.cacheTTL,
      deduplicate: config.deduplicate !== false,
      tags: config.tags || [],
      priority: config.priority || 'normal',
      cacheKeyGenerator: config.cacheKeyGenerator,
      enabled: config.enabled !== false
    });
  }

  getOptimizationRule(req) {
    const url = req.url;
    
    // Find matching rule
    for (const [pattern, rule] of this.optimizationRules) {
      if (url.startsWith(pattern) && rule.enabled) {
        return rule;
      }
    }
    
    // Default rule
    return {
      cacheTTL: 300,
      deduplicate: false,
      tags: [],
      priority: 'normal',
      enabled: true
    };
  }

  async optimizeRequest(req, operation) {
    const startTime = Date.now();
    const rule = this.getOptimizationRule(req);
    
    this.performanceMetrics.totalRequests++;
    
    try {
      let result;
      let cacheHit = false;
      let deduplicated = false;

      // Check cache first
      if (rule.cacheTTL > 0) {
        const cacheKey = rule.cacheKeyGenerator ? 
          rule.cacheKeyGenerator(req) : 
          this.responseCache.generateCacheKey(req);
        
        result = await this.responseCache.get(cacheKey);
        
        if (result) {
          cacheHit = true;
          this.performanceMetrics.cacheHits++;
          
          this.emit('cacheHit', { 
            url: req.url, 
            cacheKey: cacheKey.substring(0, 16),
            rule: rule.pattern 
          });
        }
      }

      // If not cached, execute with deduplication
      if (!result) {
        if (rule.deduplicate) {
          result = await this.requestDeduplicator.executeOrDeduplicate(req, operation);
          deduplicated = true;
          this.performanceMetrics.deduplicatedRequests++;
        } else {
          result = await operation();
        }

        // Cache the result
        if (rule.cacheTTL > 0 && result) {
          const cacheKey = rule.cacheKeyGenerator ? 
            rule.cacheKeyGenerator(req) : 
            this.responseCache.generateCacheKey(req);
          
          await this.responseCache.set(cacheKey, result, {
            ttl: rule.cacheTTL,
            tags: rule.tags,
            priority: rule.priority
          });
        }
      }

      const responseTime = Date.now() - startTime;
      this.updateAverageResponseTime(responseTime);

      if (responseTime > 1000) { // Slow request threshold
        this.performanceMetrics.slowRequests++;
      }

      this.emit('requestOptimized', {
        url: req.url,
        responseTime,
        cacheHit,
        deduplicated,
        rule: rule.pattern
      });

      return result;

    } catch (error) {
      this.performanceMetrics.errorRate = 
        (this.performanceMetrics.errorRate * (this.performanceMetrics.totalRequests - 1) + 1) / 
        this.performanceMetrics.totalRequests;
      
      this.emit('optimizationError', { 
        url: req.url, 
        error: error.message,
        rule: rule.pattern 
      });
      
      throw error;
    }
  }

  updateAverageResponseTime(responseTime) {
    const total = this.performanceMetrics.averageResponseTime * (this.performanceMetrics.totalRequests - 1);
    this.performanceMetrics.averageResponseTime = (total + responseTime) / this.performanceMetrics.totalRequests;
  }

  getMetrics() {
    const cacheMetrics = this.responseCache.getMetrics();
    const deduplicationMetrics = this.requestDeduplicator.getMetrics();
    
    return {
      performance: this.performanceMetrics,
      cache: cacheMetrics,
      deduplication: deduplicationMetrics,
      optimizationRules: this.optimizationRules.size,
      ubuntu: 'Performance metrics show Ubuntu efficiency'
    };
  }

  async invalidateCache(tags) {
    let totalInvalidated = 0;
    
    for (const tag of tags) {
      const count = await this.responseCache.invalidateByTag(tag);
      totalInvalidated += count;
    }
    
    this.emit('cacheInvalidated', { tags, totalInvalidated });
    
    return {
      tags,
      totalInvalidated,
      ubuntu: 'Cache invalidated with Ubuntu renewal'
    };
  }

  async clearAllCaches() {
    await this.responseCache.clear();
    await this.requestDeduplicator.clear();
    
    this.emit('allCachesCleared');
    
    logger.info('All performance caches cleared');
  }

  addGlobalCacheTags(tags) {
    // Add tags to all existing cache rules
    for (const [pattern, rule] of this.optimizationRules) {
      rule.tags = [...new Set([...rule.tags, ...tags])];
    }
    
    logger.info(`Added global cache tags`, { tags });
  }
}

const performanceOptimizer = new PerformanceOptimizer();

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
  max: 200,
  message: { 
    error: 'Ubuntu rate limit exceeded', 
    ubuntu: 'Please slow down for performance harmony' 
  }
});
app.use(ubuntuLimiter);

// Performance optimization middleware
app.use(async (req, res, next) => {
  // Only optimize GET requests and specific endpoints
  if (req.method === 'GET' || req.url.startsWith('/api/')) {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Store response for caching
      if (res.statusCode === 200) {
        performanceOptimizer.optimizeRequest(req, async () => data).catch(() => {});
      }
      return originalSend.call(this, data);
    };
  }
  
  next();
});

// Health Check
app.get('/health', async (req, res) => {
  try {
    const metrics = performanceOptimizer.getMetrics();
    
    res.json({
      service: 'azora-performance-optimizer',
      status: 'healthy',
      ubuntu: 'I accelerate our ecosystem with Ubuntu efficiency',
      timestamp: new Date().toISOString(),
      port: PORT,
      metrics,
      features: {
        responseCaching: '✅ Active',
        requestDeduplication: '✅ Active',
        optimizationRules: '✅ Active',
        performanceMetrics: '✅ Active',
        ubuntuAcceleration: '✅ Active'
      }
    });
  } catch (error) {
    res.status(500).json({
      service: 'azora-performance-optimizer',
      status: 'unhealthy',
      error: error.message,
      ubuntu: 'We handle health check errors with Ubuntu grace'
    });
  }
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'I am because we are - Ubuntu performance optimization for ecosystem acceleration',
    principles: [
      'My caching accelerates our collective access',
      'My deduplication preserves our shared resources',
      'My optimization enhances our community efficiency',
      'My metrics guide our Ubuntu performance'
    ],
    service: 'azora-performance-optimizer',
    ubuntu: 'Ubuntu performance optimization'
  });
});

// ========== PERFORMANCE OPTIMIZATION ENDPOINTS ==========

// GET /api/metrics - Get performance metrics
app.get('/api/metrics', (req, res) => {
  try {
    const metrics = performanceOptimizer.getMetrics();
    
    res.json({
      metrics,
      ubuntu: 'Performance metrics show Ubuntu efficiency'
    });
  } catch (error) {
    logger.error('Error getting performance metrics:', error);
    res.status(500).json({
      error: 'Failed to get performance metrics',
      ubuntu: 'We handle metrics errors with Ubuntu grace'
    });
  }
});

// POST /api/cache/invalidate - Invalidate cache by tags
app.post('/api/cache/invalidate', async (req, res) => {
  try {
    const { tags } = req.body;
    
    if (!Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({
        error: 'Tags array is required',
        ubuntu: 'Ubuntu clarity: Specify tags for cache invalidation'
      });
    }

    const result = await performanceOptimizer.invalidateCache(tags);

    console.log(`🗑️ Cache invalidated for tags: ${tags.join(', ')}`);

    res.json({
      success: true,
      result,
      ubuntu: 'Cache invalidated with Ubuntu renewal'
    });
  } catch (error) {
    logger.error('Error invalidating cache:', error);
    res.status(500).json({
      error: 'Failed to invalidate cache',
      ubuntu: 'We handle cache invalidation errors with Ubuntu grace'
    });
  }
});

// POST /api/cache/clear - Clear all caches
app.post('/api/cache/clear', async (req, res) => {
  try {
    await performanceOptimizer.clearAllCaches();

    console.log('🗑️ All performance caches cleared');

    res.json({
      success: true,
      message: 'All caches cleared successfully',
      ubuntu: 'All caches cleared with Ubuntu renewal'
    });
  } catch (error) {
    logger.error('Error clearing caches:', error);
    res.status(500).json({
      error: 'Failed to clear caches',
      ubuntu: 'We handle cache clearing errors with Ubuntu grace'
    });
  }
});

// POST /api/rules/add - Add optimization rule
app.post('/api/rules/add', (req, res) => {
  try {
    const { pattern, config } = req.body;

    if (!pattern || !config) {
      return res.status(400).json({
        error: 'Pattern and config are required',
        ubuntu: 'Ubuntu clarity: Complete rule details enable proper optimization'
      });
    }

    performanceOptimizer.addOptimizationRule(pattern, config);

    console.log(`📏 Optimization rule added: ${pattern}`);

    res.json({
      success: true,
      message: `Optimization rule added for pattern: ${pattern}`,
      ubuntu: 'Optimization rule added with Ubuntu wisdom'
    });
  } catch (error) {
    logger.error('Error adding optimization rule:', error);
    res.status(500).json({
      error: 'Failed to add optimization rule',
      ubuntu: 'We handle rule errors with Ubuntu grace'
    });
  }
});

// GET /api/rules - Get all optimization rules
app.get('/api/rules', (req, res) => {
  try {
    const rules = Array.from(performanceOptimizer.optimizationRules.entries()).map(([pattern, config]) => ({
      pattern,
      ...config
    }));

    res.json({
      rules,
      total: rules.length,
      ubuntu: 'Optimization rules show Ubuntu wisdom'
    });
  } catch (error) {
    logger.error('Error getting optimization rules:', error);
    res.status(500).json({
      error: 'Failed to get optimization rules',
      ubuntu: 'We handle rules errors with Ubuntu grace'
    });
  }
});

// POST /api/test/performance - Test performance optimization
app.post('/api/test/performance', async (req, res) => {
  try {
    const { 
      endpoint = '/test/data', 
      cacheTTL = 60,
      deduplicate = true,
      concurrentRequests = 5
    } = req.body;

    // Add test rule
    performanceOptimizer.addOptimizationRule(endpoint, {
      cacheTTL,
      deduplicate,
      tags: ['test'],
      priority: 'high'
    });

    // Simulate test operation
    const testOperation = async () => {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50)); // 50-150ms delay
      return {
        data: 'Test response',
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      };
    };

    // Execute concurrent requests
    const startTime = Date.now();
    const promises = Array.from({ length: concurrentRequests }, () => {
      const mockReq = { url: endpoint, method: 'GET', headers: {}, query: {}, body: null };
      return performanceOptimizer.optimizeRequest(mockReq, testOperation);
    });

    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    console.log(`🧪 Performance test completed: ${concurrentRequests} requests in ${totalTime}ms`);

    res.json({
      success: true,
      test: {
        endpoint,
        concurrentRequests,
        totalTime,
        averageTime: totalTime / concurrentRequests,
        cacheTTL,
        deduplicate
      },
      results: results.slice(0, 3), // Show first 3 results
      ubuntu: 'Performance test completed with Ubuntu efficiency'
    });
  } catch (error) {
    logger.error('Error in performance test:', error);
    res.status(500).json({
      error: 'Performance test failed',
      ubuntu: 'We handle test errors with Ubuntu grace'
    });
  }
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  logger.error('Ubuntu Performance Optimizer Error:', error);
  res.status(500).json({
    error: 'Ubuntu performance optimizer error',
    ubuntu: 'We handle performance errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Performance optimizer endpoint not found',
    ubuntu: 'Ubuntu guidance: Check available performance endpoints',
    availableEndpoints: [
      '/api/metrics',
      '/api/cache/invalidate',
      '/api/cache/clear',
      '/api/rules/add',
      '/api/rules',
      '/api/test/performance',
      '/health'
    ]
  });
});

// Start the service
app.listen(PORT, () => {
  console.log(`⚡ Azora Performance Optimizer running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I accelerate our ecosystem with Ubuntu efficiency!"');
  console.log(`💾 Response Caching: Active`);
  console.log(`🔄 Request Deduplication: Active`);
  console.log(`📏 Optimization Rules: Active`);
  console.log(`📊 Performance Metrics: Active`);
  console.log(`🌍 Ubuntu: Performance optimization through ecosystem acceleration`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await performanceOptimizer.clearAllCaches();
  if (redis) await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  await performanceOptimizer.clearAllCaches();
  if (redis) await redis.quit();
  process.exit(0);
});

module.exports = app;
