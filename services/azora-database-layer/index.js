const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
const { enhancedDb } = require('./enhanced-database-layer');
const { dbOptimizationService } = require('./database-optimization-service');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3012;

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'azora-database-layer' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'database-layer.log' })
  ]
});

// Initialize database connections
async function initializeDatabase() {
  try {
    // Initialize primary pool
    await enhancedDb.initializePool(
      process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/azora',
      {
        max: parseInt(process.env.DB_POOL_MAX) || 20,
        min: parseInt(process.env.DB_POOL_MIN) || 5,
        idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000
      }
    );

    // Initialize read replicas if configured
    const replicaUrls = process.env.READ_REPLICA_URLS?.split(',') || [];
    for (const replicaUrl of replicaUrls) {
      if (replicaUrl.trim()) {
        await enhancedDb.addReadReplica(replicaUrl.trim());
      }
    }

    // Initialize cache if configured
    if (process.env.REDIS_URL) {
      await enhancedDb.initializeCache(process.env.REDIS_URL);
    }

    logger.info('Database layer initialized successfully');
    return true;
  } catch (error) {
    logger.error('Failed to initialize database layer', { error: error.message });
    return false;
  }
}

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
    ubuntu: 'Please slow down for database harmony' 
  }
});
app.use(ubuntuLimiter);

// Health Check
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await enhancedDb.healthCheck();
    const optimizationSummary = await dbOptimizationService.getOptimizationSummary();
    const healthScore = await dbOptimizationService.calculateHealthScore();
    
    res.json({
      service: 'azora-database-layer',
      status: dbHealth.healthy ? 'healthy' : 'unhealthy',
      ubuntu: 'I provide the foundation for our collective data with Ubuntu reliability',
      timestamp: new Date().toISOString(),
      port: PORT,
      health: dbHealth,
      optimization: optimizationSummary,
      healthScore,
      features: {
        connectionPooling: '✅ Active',
        readReplicas: '✅ Active',
        queryCaching: '✅ Active',
        performanceMonitoring: '✅ Active',
        optimizationRules: '✅ Active',
        healthScoring: '✅ Active',
        ubuntuReliability: '✅ Active'
      }
    });
  } catch (error) {
    res.status(500).json({
      service: 'azora-database-layer',
      status: 'unhealthy',
      error: error.message,
      ubuntu: 'We handle health check errors with Ubuntu grace'
    });
  }
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'I am because we are - Ubuntu database foundation for collective knowledge',
    principles: [
      'My connections support our shared data integrity',
      'My optimization serves our collective performance',
      'My reliability sustains our community operations',
      'My wisdom guides our data-driven decisions'
    ],
    service: 'azora-database-layer',
    ubuntu: 'Ubuntu database foundation'
  });
});

// ========== QUERY EXECUTION ENDPOINTS ==========

// POST /api/query - Execute a query with optimization
app.post('/api/query', async (req, res) => {
  try {
    const { sql, params, options = {} } = req.body;

    if (!sql) {
      return res.status(400).json({
        error: 'SQL query is required',
        ubuntu: 'Ubuntu clarity: Complete query enables proper execution'
      });
    }

    const startTime = Date.now();
    const results = await enhancedDb.query(sql, params, options);
    const duration = Date.now() - startTime;

    console.log(`🗄️ Query executed in ${duration}ms`);

    res.json({
      success: true,
      data: results,
      metrics: {
        duration,
        rowCount: results.length,
        cacheHit: options.cacheHit || false
      },
      ubuntu: 'Query executed with Ubuntu efficiency'
    });
  } catch (error) {
    logger.error('Error executing query:', error);
    res.status(500).json({
      error: 'Failed to execute query',
      message: error.message,
      ubuntu: 'We handle query errors with Ubuntu grace'
    });
  }
});

// POST /api/batch - Execute multiple queries
app.post('/api/batch', async (req, res) => {
  try {
    const { queries, options = {} } = req.body;

    if (!Array.isArray(queries) || queries.length === 0) {
      return res.status(400).json({
        error: 'Queries array is required',
        ubuntu: 'Ubuntu clarity: Multiple queries enable batch efficiency'
      });
    }

    const startTime = Date.now();
    const results = await enhancedDb.batchQuery(queries, options);
    const duration = Date.now() - startTime;

    console.log(`🗄️ Batch query executed in ${duration}ms`);

    res.json({
      success: true,
      data: results,
      metrics: {
        duration,
        queryCount: queries.length,
        parallel: options.parallel || false
      },
      ubuntu: 'Batch queries executed with Ubuntu harmony'
    });
  } catch (error) {
    logger.error('Error executing batch query:', error);
    res.status(500).json({
      error: 'Failed to execute batch query',
      message: error.message,
      ubuntu: 'We handle batch query errors with Ubuntu grace'
    });
  }
});

// POST /api/transaction - Execute a transaction
app.post('/api/transaction', async (req, res) => {
  try {
    const { queries, options = {} } = req.body;

    if (!Array.isArray(queries) || queries.length === 0) {
      return res.status(400).json({
        error: 'Queries array is required for transaction',
        ubuntu: 'Ubuntu clarity: Transaction queries ensure data integrity'
      });
    }

    const startTime = Date.now();
    const results = await enhancedDb.transaction(async (client) => {
      const transactionResults = [];
      for (const query of queries) {
        const result = await client.query(query.sql, query.params);
        transactionResults.push(result.rows);
      }
      return transactionResults;
    }, options);
    const duration = Date.now() - startTime;

    console.log(`🗄️ Transaction executed in ${duration}ms`);

    res.json({
      success: true,
      data: results,
      metrics: {
        duration,
        queryCount: queries.length,
        committed: true
      },
      ubuntu: 'Transaction completed with Ubuntu integrity'
    });
  } catch (error) {
    logger.error('Error executing transaction:', error);
    res.status(500).json({
      error: 'Failed to execute transaction',
      message: error.message,
      ubuntu: 'We handle transaction errors with Ubuntu grace'
    });
  }
});

// ========== CACHE MANAGEMENT ENDPOINTS ==========

// DELETE /api/cache - Clear cache
app.delete('/api/cache', async (req, res) => {
  try {
    const { pattern } = req.query;
    await enhancedDb.invalidateCache(pattern);

    console.log(`🗄️ Cache cleared${pattern ? ` for pattern: ${pattern}` : ''}`);

    res.json({
      success: true,
      message: pattern ? `Cache cleared for pattern: ${pattern}` : 'All cache cleared',
      ubuntu: 'Cache cleared with Ubuntu renewal'
    });
  } catch (error) {
    logger.error('Error clearing cache:', error);
    res.status(500).json({
      error: 'Failed to clear cache',
      ubuntu: 'We handle cache errors with Ubuntu grace'
    });
  }
});

// POST /api/cache/warm - Warm cache with predefined queries
app.post('/api/cache/warm', async (req, res) => {
  try {
    const { queries } = req.body;

    if (!Array.isArray(queries)) {
      return res.status(400).json({
        error: 'Queries array is required for cache warming',
        ubuntu: 'Ubuntu clarity: Cache warming queries prepare for efficiency'
      });
    }

    await enhancedDb.warmCache(queries);

    console.log(`🗄️ Cache warmed with ${queries.length} queries`);

    res.json({
      success: true,
      message: `Cache warmed with ${queries.length} queries`,
      ubuntu: 'Cache warmed with Ubuntu preparation'
    });
  } catch (error) {
    logger.error('Error warming cache:', error);
    res.status(500).json({
      error: 'Failed to warm cache',
      ubuntu: 'We handle cache warming errors with Ubuntu grace'
    });
  }
});

// ========== OPTIMIZATION ENDPOINTS ==========

// GET /api/optimization/check - Run optimization checks
app.get('/api/optimization/check', async (req, res) => {
  try {
    const { ruleId } = req.query;
    const results = await dbOptimizationService.runOptimizationCheck(ruleId);

    res.json({
      results,
      summary: {
        total: results.length,
        pass: results.filter(r => r.status === 'pass').length,
        warning: results.filter(r => r.status === 'warning').length,
        error: results.filter(r => r.status === 'error').length,
        info: results.filter(r => r.status === 'info').length
      },
      ubuntu: 'Optimization checks completed with Ubuntu wisdom'
    });
  } catch (error) {
    logger.error('Error running optimization checks:', error);
    res.status(500).json({
      error: 'Failed to run optimization checks',
      ubuntu: 'We handle optimization errors with Ubuntu grace'
    });
  }
});

// POST /api/optimization/fix - Auto-fix optimization issues
app.post('/api/optimization/fix', async (req, res) => {
  try {
    const { ruleIds } = req.body;
    const { fixed, failed } = await dbOptimizationService.autoFixIssues(ruleIds);

    console.log(`🗄️ Optimization fixes applied: ${fixed.length} fixed, ${failed.length} failed`);

    res.json({
      success: true,
      fixed,
      failed,
      message: `${fixed.length} issues fixed, ${failed.length} failed`,
      ubuntu: 'Optimization fixes applied with Ubuntu care'
    });
  } catch (error) {
    logger.error('Error applying optimization fixes:', error);
    res.status(500).json({
      error: 'Failed to apply optimization fixes',
      ubuntu: 'We handle fix errors with Ubuntu grace'
    });
  }
});

// GET /api/optimization/health-score - Get database health score
app.get('/api/optimization/health-score', async (req, res) => {
  try {
    const healthScore = await dbOptimizationService.calculateHealthScore();

    res.json({
      healthScore,
      ubuntu: 'Health score calculated with Ubuntu assessment'
    });
  } catch (error) {
    logger.error('Error calculating health score:', error);
    res.status(500).json({
      error: 'Failed to calculate health score',
      ubuntu: 'We handle health score errors with Ubuntu grace'
    });
  }
});

// GET /api/optimization/trends - Get performance trends
app.get('/api/optimization/trends', async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const trends = await dbOptimizationService.getPerformanceTrends(parseInt(hours));

    res.json({
      trends,
      summary: {
        dataPoints: trends.length,
        timeRange: `${hours} hours`,
        latest: trends[trends.length - 1] || null
      },
      ubuntu: 'Performance trends show Ubuntu growth'
    });
  } catch (error) {
    logger.error('Error getting performance trends:', error);
    res.status(500).json({
      error: 'Failed to get performance trends',
      ubuntu: 'We handle trend errors with Ubuntu grace'
    });
  }
});

// GET /api/optimization/summary - Get optimization summary
app.get('/api/optimization/summary', async (req, res) => {
  try {
    const summary = await dbOptimizationService.getOptimizationSummary();

    res.json({
      summary,
      ubuntu: 'Optimization summary reflects Ubuntu diligence'
    });
  } catch (error) {
    logger.error('Error getting optimization summary:', error);
    res.status(500).json({
      error: 'Failed to get optimization summary',
      ubuntu: 'We handle summary errors with Ubuntu grace'
    });
  }
});

// ========== MONITORING ENDPOINTS ==========

// GET /api/stats - Get database statistics
app.get('/api/stats', async (req, res) => {
  try {
    const connectionStats = await enhancedDb.getConnectionStats();
    const queryReport = await enhancedDb.getOptimizationReport();
    const optimizationSummary = await dbOptimizationService.getOptimizationSummary();

    res.json({
      connections: connectionStats,
      queries: queryReport,
      optimization: optimizationSummary,
      ubuntu: 'Database stats show Ubuntu performance'
    });
  } catch (error) {
    logger.error('Error getting database stats:', error);
    res.status(500).json({
      error: 'Failed to get database stats',
      ubuntu: 'We handle stats errors with Ubuntu grace'
    });
  }
});

// GET /api/connections - Get connection pool details
app.get('/api/connections', async (req, res) => {
  try {
    const stats = await enhancedDb.getConnectionStats();

    res.json({
      connections: stats,
      ubuntu: 'Connection pools show Ubuntu resource management'
    });
  } catch (error) {
    logger.error('Error getting connection stats:', error);
    res.status(500).json({
      error: 'Failed to get connection stats',
      ubuntu: 'We handle connection errors with Ubuntu grace'
    });
  }
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  logger.error('Ubuntu Database Layer Error:', error);
  res.status(500).json({
    error: 'Ubuntu database layer error',
    ubuntu: 'We handle database errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Database layer endpoint not found',
    ubuntu: 'Ubuntu guidance: Check available database endpoints',
    availableEndpoints: [
      '/api/query',
      '/api/batch',
      '/api/transaction',
      '/api/cache',
      '/api/cache/warm',
      '/api/optimization/check',
      '/api/optimization/fix',
      '/api/optimization/health-score',
      '/api/optimization/trends',
      '/api/optimization/summary',
      '/api/stats',
      '/api/connections',
      '/health'
    ]
  });
});

// Start the service
async function startServer() {
  const dbInitialized = await initializeDatabase();
  
  if (!dbInitialized) {
    console.error('❌ Failed to initialize database layer');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🗄️ Azora Database Layer running on port ${PORT}`);
    console.log('⚡ Ubuntu: "I provide the foundation for our collective data with Ubuntu reliability!"');
    console.log(`🔗 Connection Pooling: Active`);
    console.log(`📖 Read Replicas: ${enhancedDb.readReplicas.length} configured`);
    console.log(`💾 Query Caching: ${enhancedDb.cache ? 'Active' : 'Inactive'}`);
    console.log(`📊 Performance Monitoring: Active`);
    console.log(`🔧 Optimization Rules: Active`);
    console.log(`💯 Health Scoring: Active`);
    console.log(`🌍 Ubuntu: Database foundation through collective reliability`);
  });
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await dbOptimizationService.shutdown();
  await enhancedDb.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  await dbOptimizationService.shutdown();
  await enhancedDb.disconnect();
  process.exit(0);
});

module.exports = app;
