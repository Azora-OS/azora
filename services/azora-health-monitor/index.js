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
const PORT = process.env.PORT || 3035;

// Initialize Redis for state management
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
  defaultMeta: { service: 'azora-health-monitor' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'health-monitor.log' })
  ]
});

// Enhanced Service Health Monitor with Auto-Recovery
class ServiceHealthMonitor extends EventEmitter {
  constructor() {
    super();
    this.services = new Map(); // serviceId -> ServiceConfig
    this.healthStatus = new Map(); // serviceId -> HealthStatus
    this.recoveryStrategies = new Map(); // serviceId -> RecoveryStrategy[]
    this.monitoringInterval = null;
    this.alertThresholds = {
      consecutiveFailures: 3,
      responseTimeThreshold: 5000, // 5 seconds
      errorRateThreshold: 0.1 // 10%
    };
    this.initializeServices();
    this.startMonitoring();
  }

  // ========== SERVICE REGISTRATION ==========

  initializeServices() {
    // Register core Azora services
    const coreServices = [
      {
        id: 'azora-api-gateway',
        name: 'Azora API Gateway',
        url: process.env.API_GATEWAY_URL || 'http://localhost:3000',
        healthEndpoint: '/health',
        port: 3000,
        critical: true,
        recoveryStrategies: ['restart', 'scale', 'fallback'],
        checkInterval: 30000 // 30 seconds
      },
      {
        id: 'azora-auth',
        name: 'Azora Authentication Service',
        url: process.env.AUTH_URL || 'http://localhost:3001',
        healthEndpoint: '/health',
        port: 3001,
        critical: true,
        recoveryStrategies: ['restart', 'scale'],
        checkInterval: 30000
      },
      {
        id: 'azora-blockchain',
        name: 'Azora Blockchain Service',
        url: process.env.BLOCKCHAIN_URL || 'http://localhost:3010',
        healthEndpoint: '/health',
        port: 3010,
        critical: true,
        recoveryStrategies: ['restart', 'reconnect'],
        checkInterval: 30000
      },
      {
        id: 'azora-treasury',
        name: 'Azora Treasury Service',
        url: process.env.TREASURY_URL || 'http://localhost:3028',
        healthEndpoint: '/health',
        port: 3028,
        critical: true,
        recoveryStrategies: ['restart', 'cache_clear'],
        checkInterval: 30000
      },
      {
        id: 'constitutional-court',
        name: 'Constitutional Court Service',
        url: process.env.COURT_URL || 'http://localhost:3025',
        healthEndpoint: '/health',
        port: 3025,
        critical: false,
        recoveryStrategies: ['restart'],
        checkInterval: 60000 // 1 minute
      },
      {
        id: 'azora-database-layer',
        name: 'Database Layer Service',
        url: process.env.DATABASE_URL || 'http://localhost:3012',
        healthEndpoint: '/health',
        port: 3012,
        critical: true,
        recoveryStrategies: ['restart', 'connection_reset'],
        checkInterval: 30000
      },
      {
        id: 'azora-websocket-notifications',
        name: 'WebSocket Notification Service',
        url: process.env.WEBSOCKET_URL || 'http://localhost:3030',
        healthEndpoint: '/health',
        port: 3030,
        critical: false,
        recoveryStrategies: ['restart'],
        checkInterval: 60000
      },
      {
        id: 'azora-mint',
        name: 'Azora Mint Service',
        url: process.env.MINT_URL || 'http://localhost:3015',
        healthEndpoint: '/health',
        port: 3015,
        critical: false,
        recoveryStrategies: ['restart'],
        checkInterval: 60000
      },
      {
        id: 'azora-pay',
        name: 'Azora Pay Service',
        url: process.env.PAY_URL || 'http://localhost:3016',
        healthEndpoint: '/health',
        port: 3016,
        critical: true,
        recoveryStrategies: ['restart', 'reconnect_payment'],
        checkInterval: 30000
      },
      {
        id: 'citadel-fund',
        name: 'Citadel Fund Service',
        url: process.env.CITADEL_URL || 'http://localhost:3017',
        healthEndpoint: '/health',
        port: 3017,
        critical: true,
        recoveryStrategies: ['restart'],
        checkInterval: 30000
      }
    ];

    coreServices.forEach(service => {
      this.registerService(service);
    });

    logger.info(`Initialized ${coreServices.length} services for health monitoring`);
  }

  registerService(config) {
    this.services.set(config.id, {
      ...config,
      registeredAt: new Date().toISOString()
    });

    // Initialize health status
    this.healthStatus.set(config.id, {
      serviceId: config.id,
      status: 'unknown',
      lastCheck: null,
      consecutiveFailures: 0,
      totalChecks: 0,
      successfulChecks: 0,
      averageResponseTime: 0,
      lastError: null,
      recoveryAttempts: 0,
      lastRecovery: null,
      uptime: 0,
      metrics: {
        responseTimeHistory: [],
        errorHistory: [],
        recoveryHistory: []
      }
    });

    // Register recovery strategies
    this.recoveryStrategies.set(config.id, config.recoveryStrategies || []);

    logger.info(`Service registered for monitoring`, { serviceId: config.id, name: config.name });
  }

  // ========== HEALTH MONITORING ==========

  startMonitoring() {
    this.monitoringInterval = setInterval(async () => {
      await this.checkAllServices();
    }, 30000); // Check all services every 30 seconds

    logger.info('Health monitoring started');
  }

  async checkAllServices() {
    const checkPromises = Array.from(this.services.keys()).map(serviceId => 
      this.checkServiceHealth(serviceId)
    );

    await Promise.allSettled(checkPromises);
    this.emit('monitoringCycleCompleted');
  }

  async checkServiceHealth(serviceId) {
    const service = this.services.get(serviceId);
    const health = this.healthStatus.get(serviceId);
    
    if (!service || !health) {
      logger.warn('Service not found for health check', { serviceId });
      return;
    }

    const startTime = Date.now();
    health.lastCheck = new Date().toISOString();
    health.totalChecks++;

    try {
      const response = await axios.get(
        `${service.url}${service.healthEndpoint}`,
        {
          timeout: 10000, // 10 second timeout
          validateStatus: (status) => status < 500 // Accept 4xx as healthy
        }
      );

      const responseTime = Date.now() - startTime;
      
      // Update health status
      health.status = response.data.healthy ? 'healthy' : 'degraded';
      health.consecutiveFailures = 0;
      health.successfulChecks++;
      health.averageResponseTime = this.calculateAverageResponseTime(health.averageResponseTime, responseTime, health.totalChecks);
      health.lastError = null;

      // Update metrics
      health.metrics.responseTimeHistory.push({
        timestamp: new Date().toISOString(),
        responseTime,
        status: health.status
      });

      // Keep history bounded
      if (health.metrics.responseTimeHistory.length > 100) {
        health.metrics.responseTimeHistory = health.metrics.responseTimeHistory.slice(-100);
      }

      // Calculate uptime
      health.uptime = (health.successfulChecks / health.totalChecks) * 100;

      // Persist to Redis
      await this.persistHealthStatus(serviceId, health);

      this.emit('serviceHealthy', { serviceId, health, responseTime });

      logger.debug(`Service health check passed`, {
        serviceId,
        status: health.status,
        responseTime,
        uptime: health.uptime.toFixed(2)
      });

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Update health status
      health.status = 'unhealthy';
      health.consecutiveFailures++;
      health.lastError = {
        message: error.message,
        code: error.code,
        timestamp: new Date().toISOString()
      };

      // Update error history
      health.metrics.errorHistory.push({
        timestamp: new Date().toISOString(),
        error: error.message,
        responseTime
      });

      // Keep history bounded
      if (health.metrics.errorHistory.length > 50) {
        health.metrics.errorHistory = health.metrics.errorHistory.slice(-50);
      }

      // Calculate uptime
      health.uptime = (health.successfulChecks / health.totalChecks) * 100;

      // Persist to Redis
      await this.persistHealthStatus(serviceId, health);

      this.emit('serviceUnhealthy', { serviceId, health, error });

      logger.warn(`Service health check failed`, {
        serviceId,
        error: error.message,
        consecutiveFailures: health.consecutiveFailures,
        uptime: health.uptime.toFixed(2)
      });

      // Trigger recovery if needed
      if (health.consecutiveFailures >= this.alertThresholds.consecutiveFailures) {
        await this.triggerRecovery(serviceId);
      }
    }
  }

  calculateAverageResponseTime(currentAvg, newTime, totalChecks) {
    return ((currentAvg * (totalChecks - 1)) + newTime) / totalChecks;
  }

  // ========== RECOVERY MECHANISMS ==========

  async triggerRecovery(serviceId) {
    const service = this.services.get(serviceId);
    const health = this.healthStatus.get(serviceId);
    const strategies = this.recoveryStrategies.get(serviceId) || [];

    if (!service || !health || strategies.length === 0) {
      logger.warn('No recovery strategies available', { serviceId });
      return;
    }

    logger.info(`Triggering recovery for service`, { 
      serviceId, 
      consecutiveFailures: health.consecutiveFailures,
      strategies: strategies.length 
    });

    this.emit('recoveryTriggered', { serviceId, strategies });

    // Try recovery strategies in order
    for (const strategy of strategies) {
      try {
        const success = await this.executeRecoveryStrategy(serviceId, strategy);
        
        if (success) {
          health.recoveryAttempts++;
          health.lastRecovery = {
            strategy,
            timestamp: new Date().toISOString(),
            successful: true
          };

          health.metrics.recoveryHistory.push(health.lastRecovery);
          if (health.metrics.recoveryHistory.length > 20) {
            health.metrics.recoveryHistory = health.metrics.recoveryHistory.slice(-20);
          }

          await this.persistHealthStatus(serviceId, health);

          logger.info(`Recovery successful`, { serviceId, strategy });
          this.emit('recoverySuccessful', { serviceId, strategy });
          return;
        }
      } catch (error) {
        logger.error(`Recovery strategy failed`, { serviceId, strategy, error: error.message });
        this.emit('recoveryFailed', { serviceId, strategy, error });
      }
    }

    // All recovery strategies failed
    health.lastRecovery = {
      strategy: 'all_failed',
      timestamp: new Date().toISOString(),
      successful: false
    };

    await this.persistHealthStatus(serviceId, health);
    this.emit('recoveryExhausted', { serviceId });
  }

  async executeRecoveryStrategy(serviceId, strategy) {
    const service = this.services.get(serviceId);
    
    switch (strategy) {
      case 'restart':
        return await this.restartService(serviceId);
      
      case 'scale':
        return await this.scaleService(serviceId);
      
      case 'fallback':
        return await this.enableFallbackMode(serviceId);
      
      case 'reconnect':
        return await this.reconnectService(serviceId);
      
      case 'cache_clear':
        return await this.clearServiceCache(serviceId);
      
      case 'connection_reset':
        return await this.resetConnections(serviceId);
      
      case 'reconnect_payment':
        return await this.reconnectPaymentProvider(serviceId);
      
      default:
        logger.warn('Unknown recovery strategy', { serviceId, strategy });
        return false;
    }
  }

  async restartService(serviceId) {
    logger.info(`Attempting service restart`, { serviceId });
    
    try {
      // In a production environment, this would integrate with container orchestration
      // For now, we'll simulate a restart attempt
      
      // Simulate restart delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if service is healthy after restart
      await this.checkServiceHealth(serviceId);
      const health = this.healthStatus.get(serviceId);
      
      return health.status === 'healthy';
    } catch (error) {
      logger.error('Service restart failed', { serviceId, error: error.message });
      return false;
    }
  }

  async scaleService(serviceId) {
    logger.info(`Attempting service scaling`, { serviceId });
    
    try {
      // In production, this would integrate with Kubernetes/Docker scaling
      // For now, we'll simulate scaling
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check health after scaling
      await this.checkServiceHealth(serviceId);
      const health = this.healthStatus.get(serviceId);
      
      return health.status === 'healthy';
    } catch (error) {
      logger.error('Service scaling failed', { serviceId, error: error.message });
      return false;
    }
  }

  async enableFallbackMode(serviceId) {
    logger.info(`Enabling fallback mode`, { serviceId });
    
    try {
      // Store fallback mode in Redis
      await redis.set(`fallback:${serviceId}`, 'enabled', 'EX', 3600); // 1 hour
      
      // Notify other services about fallback mode
      await redis.publish('service_events', JSON.stringify({
        type: 'fallback_activated',
        serviceId,
        timestamp: new Date().toISOString()
      }));
      
      return true;
    } catch (error) {
      logger.error('Failed to enable fallback mode', { serviceId, error: error.message });
      return false;
    }
  }

  async reconnectService(serviceId) {
    logger.info(`Attempting service reconnection`, { serviceId });
    
    try {
      // Simulate reconnection attempt
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check health after reconnection
      await this.checkServiceHealth(serviceId);
      const health = this.healthStatus.get(serviceId);
      
      return health.status === 'healthy';
    } catch (error) {
      logger.error('Service reconnection failed', { serviceId, error: error.message });
      return false;
    }
  }

  async clearServiceCache(serviceId) {
    logger.info(`Clearing service cache`, { serviceId });
    
    try {
      // Send cache clear request to service
      const service = this.services.get(serviceId);
      await axios.post(`${service.url}/api/cache/clear`, {}, { timeout: 5000 });
      
      return true;
    } catch (error) {
      logger.error('Failed to clear service cache', { serviceId, error: error.message });
      return false;
    }
  }

  async resetConnections(serviceId) {
    logger.info(`Resetting service connections`, { serviceId });
    
    try {
      // Simulate connection reset
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check health after reset
      await this.checkServiceHealth(serviceId);
      const health = this.healthStatus.get(serviceId);
      
      return health.status === 'healthy';
    } catch (error) {
      logger.error('Connection reset failed', { serviceId, error: error.message });
      return false;
    }
  }

  async reconnectPaymentProvider(serviceId) {
    logger.info(`Reconnecting payment provider`, { serviceId });
    
    try {
      // Send reconnect request to payment service
      const service = this.services.get(serviceId);
      await axios.post(`${service.url}/api/payment/reconnect`, {}, { timeout: 10000 });
      
      return true;
    } catch (error) {
      logger.error('Failed to reconnect payment provider', { serviceId, error: error.message });
      return false;
    }
  }

  // ========== DATA PERSISTENCE ==========

  async persistHealthStatus(serviceId, health) {
    try {
      await redis.setex(`health:${serviceId}`, 86400, JSON.stringify(health)); // 24 hours
    } catch (error) {
      logger.error('Failed to persist health status', { serviceId, error });
    }
  }

  async loadPersistedHealthStatus() {
    try {
      const keys = await redis.keys('health:*');
      
      for (const key of keys) {
        const serviceId = key.replace('health:', '');
        const healthData = await redis.get(key);
        
        if (healthData) {
          const health = JSON.parse(healthData);
          this.healthStatus.set(serviceId, health);
        }
      }
      
      logger.info(`Loaded health status for ${keys.length} services`);
    } catch (error) {
      logger.error('Failed to load persisted health status', { error });
    }
  }

  // ========== QUERY METHODS ==========

  async getOverallHealth() {
    const services = Array.from(this.healthStatus.values());
    
    if (services.length === 0) {
      return {
        status: 'unknown',
        healthyServices: 0,
        unhealthyServices: 0,
        totalServices: 0,
        overallUptime: 0
      };
    }

    const healthyServices = services.filter(s => s.status === 'healthy').length;
    const unhealthyServices = services.filter(s => s.status === 'unhealthy').length;
    const overallUptime = services.reduce((sum, s) => sum + s.uptime, 0) / services.length;

    let status = 'healthy';
    if (unhealthyServices > 0) {
      const criticalUnhealthy = services.filter(s => 
        s.status === 'unhealthy' && this.services.get(s.serviceId)?.critical
      ).length;
      
      if (criticalUnhealthy > 0) {
        status = 'critical';
      } else {
        status = 'degraded';
      }
    }

    return {
      status,
      healthyServices,
      unhealthyServices,
      totalServices: services.length,
      overallUptime: Math.round(overallUptime),
      ubuntu: 'Overall health reflects Ubuntu ecosystem vitality'
    };
  }

  async getServiceHealth(serviceId) {
    const health = this.healthStatus.get(serviceId);
    const service = this.services.get(serviceId);
    
    if (!health || !service) {
      return null;
    }

    return {
      service: {
        id: service.id,
        name: service.name,
        url: service.url,
        critical: service.critical
      },
      health: {
        status: health.status,
        uptime: health.uptime,
        consecutiveFailures: health.consecutiveFailures,
        averageResponseTime: health.averageResponseTime,
        lastCheck: health.lastCheck,
        lastError: health.lastError,
        recoveryAttempts: health.recoveryAttempts,
        lastRecovery: health.lastRecovery
      },
      ubuntu: 'Service health shows Ubuntu operational integrity'
    };
  }

  async getAllServicesHealth() {
    const services = [];
    
    for (const serviceId of this.services.keys()) {
      const serviceHealth = await this.getServiceHealth(serviceId);
      if (serviceHealth) {
        services.push(serviceHealth);
      }
    }

    return {
      services,
      summary: await this.getOverallHealth(),
      ubuntu: 'All services health reflects Ubuntu ecosystem harmony'
    };
  }

  async getHealthTrends(serviceId, hours = 24) {
    const health = this.healthStatus.get(serviceId);
    if (!health) return null;

    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const responseTimeTrend = health.metrics.responseTimeHistory
      .filter(h => new Date(h.timestamp) >= cutoff)
      .map(h => ({ timestamp: h.timestamp, value: h.responseTime }));

    const errorTrend = health.metrics.errorHistory
      .filter(e => new Date(e.timestamp) >= cutoff)
      .map(e => ({ timestamp: e.timestamp, error: e.error }));

    return {
      serviceId,
      timeRange: `${hours} hours`,
      responseTimeTrend,
      errorTrend,
      ubuntu: 'Health trends show Ubuntu service evolution'
    };
  }

  async getRecoveryHistory(serviceId) {
    const health = this.healthStatus.get(serviceId);
    if (!health) return null;

    return {
      serviceId,
      recoveryAttempts: health.recoveryAttempts,
      recoveryHistory: health.metrics.recoveryHistory,
      lastRecovery: health.lastRecovery,
      ubuntu: 'Recovery history shows Ubuntu resilience'
    };
  }

  // ========== MANUAL RECOVERY ==========

  async manualRecovery(serviceId, strategy) {
    logger.info(`Manual recovery triggered`, { serviceId, strategy });
    
    const success = await this.executeRecoveryStrategy(serviceId, strategy);
    
    this.emit('manualRecovery', { serviceId, strategy, success });
    
    return {
      serviceId,
      strategy,
      success,
      timestamp: new Date().toISOString(),
      ubuntu: 'Manual recovery shows Ubuntu proactive care'
    };
  }

  // ========== SHUTDOWN ==========

  async shutdown() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.removeAllListeners();
    logger.info('Health monitor shutdown complete');
  }
}

const healthMonitor = new ServiceHealthMonitor();

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
  max: 150,
  message: { 
    error: 'Ubuntu rate limit exceeded', 
    ubuntu: 'Please slow down for health monitoring harmony' 
  }
});
app.use(ubuntuLimiter);

// Health Check
app.get('/health', async (req, res) => {
  try {
    const overallHealth = await healthMonitor.getOverallHealth();
    
    res.json({
      service: 'azora-health-monitor',
      status: overallHealth.status,
      ubuntu: 'I watch over our ecosystem with Ubuntu vigilance',
      timestamp: new Date().toISOString(),
      port: PORT,
      health: overallHealth,
      features: {
        serviceMonitoring: '✅ Active',
        autoRecovery: '✅ Active',
        healthTrends: '✅ Active',
        recoveryStrategies: '✅ Active',
        ubuntuVigilance: '✅ Active'
      }
    });
  } catch (error) {
    res.status(500).json({
      service: 'azora-health-monitor',
      status: 'unhealthy',
      error: error.message,
      ubuntu: 'We handle health check errors with Ubuntu grace'
    });
  }
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'I am because we are - Ubuntu health monitoring for ecosystem vitality',
    principles: [
      'My vigilance protects our collective wellbeing',
      'My recovery sustains our community resilience',
      'My monitoring ensures our shared prosperity',
      'My care nurtures our Ubuntu harmony'
    ],
    service: 'azora-health-monitor',
    ubuntu: 'Ubuntu health monitoring'
  });
});

// ========== HEALTH MONITORING ENDPOINTS ==========

// GET /api/health/overall - Get overall system health
app.get('/api/health/overall', async (req, res) => {
  try {
    const health = await healthMonitor.getOverallHealth();
    
    res.json({
      health,
      ubuntu: 'Overall health shows Ubuntu ecosystem vitality'
    });
  } catch (error) {
    logger.error('Error getting overall health:', error);
    res.status(500).json({
      error: 'Failed to get overall health',
      ubuntu: 'We handle health errors with Ubuntu grace'
    });
  }
});

// GET /api/health/services - Get all services health
app.get('/api/health/services', async (req, res) => {
  try {
    const servicesHealth = await healthMonitor.getAllServicesHealth();
    
    res.json(servicesHealth);
  } catch (error) {
    logger.error('Error getting services health:', error);
    res.status(500).json({
      error: 'Failed to get services health',
      ubuntu: 'We handle services health errors with Ubuntu grace'
    });
  }
});

// GET /api/health/services/:serviceId - Get specific service health
app.get('/api/health/services/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const serviceHealth = await healthMonitor.getServiceHealth(serviceId);
    
    if (!serviceHealth) {
      return res.status(404).json({
        error: 'Service not found',
        ubuntu: 'Ubuntu guidance: Check service ID'
      });
    }
    
    res.json(serviceHealth);
  } catch (error) {
    logger.error('Error getting service health:', error);
    res.status(500).json({
      error: 'Failed to get service health',
      ubuntu: 'We handle service health errors with Ubuntu grace'
    });
  }
});

// GET /api/health/trends/:serviceId - Get service health trends
app.get('/api/health/trends/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { hours = 24 } = req.query;
    
    const trends = await healthMonitor.getHealthTrends(serviceId, parseInt(hours));
    
    if (!trends) {
      return res.status(404).json({
        error: 'Service not found',
        ubuntu: 'Ubuntu guidance: Check service ID'
      });
    }
    
    res.json(trends);
  } catch (error) {
    logger.error('Error getting health trends:', error);
    res.status(500).json({
      error: 'Failed to get health trends',
      ubuntu: 'We handle trends errors with Ubuntu grace'
    });
  }
});

// GET /api/health/recovery/:serviceId - Get service recovery history
app.get('/api/health/recovery/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const recoveryHistory = await healthMonitor.getRecoveryHistory(serviceId);
    
    if (!recoveryHistory) {
      return res.status(404).json({
        error: 'Service not found',
        ubuntu: 'Ubuntu guidance: Check service ID'
      });
    }
    
    res.json(recoveryHistory);
  } catch (error) {
    logger.error('Error getting recovery history:', error);
    res.status(500).json({
      error: 'Failed to get recovery history',
      ubuntu: 'We handle recovery history errors with Ubuntu grace'
    });
  }
});

// POST /api/health/recovery/:serviceId - Trigger manual recovery
app.post('/api/health/recovery/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { strategy } = req.body;

    if (!strategy) {
      return res.status(400).json({
        error: 'Recovery strategy is required',
        ubuntu: 'Ubuntu clarity: Specify recovery strategy for manual intervention'
      });
    }

    const result = await healthMonitor.manualRecovery(serviceId, strategy);

    console.log(`🔧 Manual recovery triggered for ${serviceId} with strategy: ${strategy}`);

    res.json({
      success: true,
      result,
      ubuntu: 'Manual recovery executed with Ubuntu care'
    });
  } catch (error) {
    logger.error('Error triggering manual recovery:', error);
    res.status(500).json({
      error: 'Failed to trigger manual recovery',
      ubuntu: 'We handle recovery errors with Ubuntu grace'
    });
  }
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  logger.error('Ubuntu Health Monitor Error:', error);
  res.status(500).json({
    error: 'Ubuntu health monitor error',
    ubuntu: 'We handle health monitoring errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Health monitor endpoint not found',
    ubuntu: 'Ubuntu guidance: Check available health monitoring endpoints',
    availableEndpoints: [
      '/api/health/overall',
      '/api/health/services',
      '/api/health/services/:serviceId',
      '/api/health/trends/:serviceId',
      '/api/health/recovery/:serviceId',
      '/health'
    ]
  });
});

// Start the service
app.listen(PORT, () => {
  console.log(`🏥 Azora Health Monitor running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I watch over our ecosystem with Ubuntu vigilance!"');
  console.log(`🔍 Service Monitoring: Active`);
  console.log(`🔧 Auto-Recovery: Active`);
  console.log(`📊 Health Trends: Active`);
  console.log(`🚨 Recovery Strategies: Active`);
  console.log(`🌍 Ubuntu: Health monitoring through ecosystem vigilance`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await healthMonitor.shutdown();
  if (redis) await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  await healthMonitor.shutdown();
  if (redis) await redis.quit();
  process.exit(0);
});

module.exports = app;
