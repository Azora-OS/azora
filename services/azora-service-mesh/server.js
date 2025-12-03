const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { EventBus } = require('../azora-event-bus');
const { EnhancedServiceMesh } = require('../azora-service-mesh-enhanced');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3030;

// Initialize EventBus and ServiceMesh
const eventBus = new EventBus();
const serviceMesh = new EnhancedServiceMesh(eventBus);

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
    ubuntu: 'Please slow down for mesh harmony' 
  }
});
app.use(ubuntuLimiter);

// Middleware to get user ID from header
const getUserId = (req) => {
  return req.headers['x-user-id'] || req.user?.id || 'user_123456789';
};

// Health Check
app.get('/health', (req, res) => {
  const overview = serviceMesh.getSystemOverview();
  
  res.json({
    service: 'azora-service-mesh',
    status: 'healthy',
    ubuntu: 'I connect because we thrive together',
    timestamp: new Date().toISOString(),
    port: PORT,
    overview,
    features: {
      serviceRegistry: '✅ Active',
      circuitBreakers: '✅ Active',
      distributedTracing: '✅ Active',
      observability: '✅ Active',
      alerting: '✅ Active',
      dependencyGraph: '✅ Active',
      ubuntuMetrics: '✅ Active'
    }
  });
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I can because we can',
    principles: [
      'My service strengthens our collective',
      'My reliability builds community trust',
      'My observability creates shared understanding',
      'My resilience sustains our ecosystem'
    ],
    service: 'azora-service-mesh',
    ubuntu: 'Ubuntu service mesh excellence'
  });
});

// ========== SERVICE REGISTRATION ENDPOINTS ==========

// POST /api/services/register - Register a new service
app.post('/api/services/register', async (req, res) => {
  try {
    const {
      name,
      endpoint,
      version = '1.0.0',
      healthEndpoint = '/health',
      metricsEndpoint = '/metrics',
      dependencies = [],
      tags = []
    } = req.body;

    if (!name || !endpoint) {
      return res.status(400).json({
        error: 'Service name and endpoint are required',
        ubuntu: 'Ubuntu clarity: Complete information enables proper registration'
      });
    }

    const serviceRegistry = {
      name,
      endpoint,
      version,
      healthEndpoint,
      metricsEndpoint,
      dependencies,
      tags,
      registeredAt: new Date(),
      lastHeartbeat: new Date()
    };

    serviceMesh.registerService(serviceRegistry);

    console.log(`🔗 Service registered: ${name} at ${endpoint}`);

    res.status(201).json({
      success: true,
      service: serviceRegistry,
      ubuntu: 'Service registered with Ubuntu community spirit'
    });
  } catch (error) {
    console.error('Error registering service:', error);
    res.status(500).json({
      error: 'Failed to register service',
      ubuntu: 'We handle registration errors with Ubuntu grace'
    });
  }
});

// DELETE /api/services/:name/unregister - Unregister a service
app.delete('/api/services/:name/unregister', async (req, res) => {
  try {
    const { name } = req.params;
    
    serviceMesh.unregisterService(name);

    console.log(`❌ Service unregistered: ${name}`);

    res.json({
      success: true,
      ubuntu: 'Service unregistered with Ubuntu respect'
    });
  } catch (error) {
    console.error('Error unregistering service:', error);
    res.status(500).json({
      error: 'Failed to unregister service',
      ubuntu: 'We handle unregistration errors with Ubuntu grace'
    });
  }
});

// GET /api/services - Get all registered services
app.get('/api/services', (req, res) => {
  try {
    const services = serviceMesh.getServiceRegistry();
    
    res.json({
      services,
      ubuntu: 'Service registry reflects Ubuntu ecosystem'
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      error: 'Failed to fetch services',
      ubuntu: 'We handle retrieval errors with Ubuntu grace'
    });
  }
});

// ========== INTER-SERVICE COMMUNICATION ENDPOINTS ==========

// POST /api/communicate/:serviceName - Call another service
app.post('/api/communicate/:serviceName', async (req, res) => {
  try {
    const { serviceName } = req.params;
    const { path, method = 'GET', data, headers, timeout, retries } = req.body;

    if (!path) {
      return res.status(400).json({
        error: 'Path is required',
        ubuntu: 'Ubuntu clarity: Provide complete communication details'
      });
    }

    const result = await serviceMesh.callService(serviceName, path, {
      method,
      data,
      headers,
      timeout,
      retries
    });

    res.json({
      success: true,
      data: result,
      ubuntu: 'Inter-service communication completed with Ubuntu harmony'
    });
  } catch (error) {
    console.error('Error calling service:', error);
    res.status(500).json({
      error: 'Failed to call service',
      message: error.message,
      ubuntu: 'We handle communication errors with Ubuntu grace'
    });
  }
});

// ========== OBSERVABILITY ENDPOINTS ==========

// GET /api/metrics - Get system metrics
app.get('/api/metrics', (req, res) => {
  try {
    const { serviceName } = req.query;
    const metrics = serviceMesh.getMetrics(serviceName);
    
    res.json({
      metrics,
      ubuntu: 'Metrics reflect Ubuntu collective health'
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({
      error: 'Failed to fetch metrics',
      ubuntu: 'We handle metric errors with Ubuntu grace'
    });
  }
});

// GET /api/traces - Get distributed traces
app.get('/api/traces', (req, res) => {
  try {
    const { traceId, serviceName, limit = 100 } = req.query;
    const traces = serviceMesh.getTraces(traceId, serviceName, parseInt(limit));
    
    res.json({
      traces,
      ubuntu: 'Traces show Ubuntu service interactions'
    });
  } catch (error) {
    console.error('Error fetching traces:', error);
    res.status(500).json({
      error: 'Failed to fetch traces',
      ubuntu: 'We handle trace errors with Ubuntu grace'
    });
  }
});

// GET /api/circuit-breakers - Get circuit breaker status
app.get('/api/circuit-breakers', (req, res) => {
  try {
    const { serviceName } = req.query;
    const circuitBreakers = serviceMesh.getCircuitBreakerStatus(serviceName);
    
    res.json({
      circuitBreakers,
      ubuntu: 'Circuit breakers protect Ubuntu ecosystem'
    });
  } catch (error) {
    console.error('Error fetching circuit breakers:', error);
    res.status(500).json({
      error: 'Failed to fetch circuit breakers',
      ubuntu: 'We handle circuit breaker errors with Ubuntu grace'
    });
  }
});

// GET /api/dependency-graph - Get dependency graph
app.get('/api/dependency-graph', (req, res) => {
  try {
    const { serviceName } = req.query;
    const dependencyGraph = serviceMesh.getDependencyGraph(serviceName);
    
    res.json({
      dependencyGraph,
      ubuntu: 'Dependencies show Ubuntu service relationships'
    });
  } catch (error) {
    console.error('Error fetching dependency graph:', error);
    res.status(500).json({
      error: 'Failed to fetch dependency graph',
      ubuntu: 'We handle dependency errors with Ubuntu grace'
    });
  }
});

// ========== ALERTING ENDPOINTS ==========

// GET /api/alerts - Get alerts
app.get('/api/alerts', (req, res) => {
  try {
    const { serviceName, resolved } = req.query;
    let alerts = serviceMesh.getAlerts(serviceName);
    
    if (resolved !== undefined) {
      const isResolved = resolved === 'true';
      alerts = alerts.filter(alert => alert.resolved === isResolved);
    }
    
    res.json({
      alerts,
      ubuntu: 'Alerts protect Ubuntu community health'
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      error: 'Failed to fetch alerts',
      ubuntu: 'We handle alert errors with Ubuntu grace'
    });
  }
});

// POST /api/alerts/:alertId/resolve - Resolve an alert
app.post('/api/alerts/:alertId/resolve', async (req, res) => {
  try {
    const { alertId } = req.params;
    const success = serviceMesh.resolveAlert(alertId);
    
    if (success) {
      res.json({
        success: true,
        ubuntu: 'Alert resolved with Ubuntu care'
      });
    } else {
      res.status(404).json({
        error: 'Alert not found',
        ubuntu: 'Ubuntu guidance: Check alert ID'
      });
    }
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({
      error: 'Failed to resolve alert',
      ubuntu: 'We handle resolution errors with Ubuntu grace'
    });
  }
});

// ========== HEALTH MONITORING ENDPOINTS ==========

// POST /api/health-check/:serviceName - Perform health check
app.post('/api/health-check/:serviceName', async (req, res) => {
  try {
    const { serviceName } = req.params;
    const isHealthy = await serviceMesh.performHealthCheck(serviceName);
    
    res.json({
      serviceName,
      healthy: isHealthy,
      timestamp: new Date(),
      ubuntu: 'Health check completed with Ubuntu care'
    });
  } catch (error) {
    console.error('Error performing health check:', error);
    res.status(500).json({
      error: 'Failed to perform health check',
      ubuntu: 'We handle health check errors with Ubuntu grace'
    });
  }
});

// POST /api/collect-metrics/:serviceName - Collect service metrics
app.post('/api/collect-metrics/:serviceName', async (req, res) => {
  try {
    const { serviceName } = req.params;
    await serviceMesh.collectServiceMetrics(serviceName);
    
    res.json({
      serviceName,
      timestamp: new Date(),
      ubuntu: 'Metrics collected with Ubuntu diligence'
    });
  } catch (error) {
    console.error('Error collecting metrics:', error);
    res.status(500).json({
      error: 'Failed to collect metrics',
      ubuntu: 'We handle metric collection errors with Ubuntu grace'
    });
  }
});

// ========== DASHBOARD ENDPOINTS ==========

// GET /api/dashboard/overview - Get system overview
app.get('/api/dashboard/overview', (req, res) => {
  try {
    const overview = serviceMesh.getSystemOverview();
    
    res.json({
      overview,
      ubuntu: 'System overview shows Ubuntu ecosystem health'
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({
      error: 'Failed to fetch overview',
      ubuntu: 'We handle overview errors with Ubuntu grace'
    });
  }
});

// GET /api/ubuntu/metrics - Get Ubuntu-inspired metrics
app.get('/api/ubuntu/metrics', (req, res) => {
  try {
    const ubuntuMetrics = serviceMesh.getUbuntuMetrics();
    
    res.json({
      ubuntuMetrics,
      ubuntu: 'Ubuntu metrics reflect collective prosperity'
    });
  } catch (error) {
    console.error('Error fetching Ubuntu metrics:', error);
    res.status(500).json({
      error: 'Failed to fetch Ubuntu metrics',
      ubuntu: 'We handle Ubuntu metric errors with Ubuntu grace'
    });
  }
});

// GET /api/observability/:serviceName? - Get service observability
app.get('/api/observability/:serviceName?', (req, res) => {
  try {
    const { serviceName } = req.params;
    const observability = serviceMesh.getServiceObservability(serviceName);
    
    res.json({
      observability,
      ubuntu: 'Observability provides Ubuntu transparency'
    });
  } catch (error) {
    console.error('Error fetching observability:', error);
    res.status(500).json({
      error: 'Failed to fetch observability',
      ubuntu: 'We handle observability errors with Ubuntu grace'
    });
  }
});

// ========== AUTO-HEALING ENDPOINTS ==========

// POST /api/auto-healing/start - Start health monitoring
app.post('/api/auto-healing/start', (req, res) => {
  try {
    const { interval = 30000 } = req.body;
    
    serviceMesh.startHealthChecks(interval);
    
    console.log(`🔄 Auto-healing started with ${interval}ms interval`);
    
    res.json({
      success: true,
      interval,
      ubuntu: 'Auto-healing activated with Ubuntu vigilance'
    });
  } catch (error) {
    console.error('Error starting auto-healing:', error);
    res.status(500).json({
      error: 'Failed to start auto-healing',
      ubuntu: 'We handle auto-healing errors with Ubuntu grace'
    });
  }
});

// POST /api/auto-healing/stop - Stop health monitoring
app.post('/api/auto-healing/stop', (req, res) => {
  try {
    serviceMesh.stopHealthChecks();
    
    console.log('⏸️ Auto-healing stopped');
    
    res.json({
      success: true,
      ubuntu: 'Auto-healing stopped with Ubuntu care'
    });
  } catch (error) {
    console.error('Error stopping auto-healing:', error);
    res.status(500).json({
      error: 'Failed to stop auto-healing',
      ubuntu: 'We handle auto-healing errors with Ubuntu grace'
    });
  }
});

// ========== UTILITY ENDPOINTS ==========

// GET /api/status - Get mesh status
app.get('/api/status', (req, res) => {
  try {
    const overview = serviceMesh.getSystemOverview();
    const ubuntuMetrics = serviceMesh.getUbuntuMetrics();
    
    res.json({
      status: 'operational',
      overview,
      ubuntuMetrics,
      timestamp: new Date(),
      ubuntu: 'Service mesh operates with Ubuntu excellence'
    });
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({
      error: 'Failed to fetch status',
      ubuntu: 'We handle status errors with Ubuntu grace'
    });
  }
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  console.error('Ubuntu Service Mesh Error:', error);
  res.status(500).json({
    error: 'Ubuntu service mesh error',
    ubuntu: 'We handle mesh errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Service mesh endpoint not found',
    ubuntu: 'Ubuntu guidance: Check available mesh endpoints',
    availableEndpoints: [
      '/api/services/register',
      '/api/services/:name/unregister',
      '/api/services',
      '/api/communicate/:serviceName',
      '/api/metrics',
      '/api/traces',
      '/api/circuit-breakers',
      '/api/dependency-graph',
      '/api/alerts',
      '/api/alerts/:alertId/resolve',
      '/api/health-check/:serviceName',
      '/api/collect-metrics/:serviceName',
      '/api/dashboard/overview',
      '/api/ubuntu/metrics',
      '/api/observability/:serviceName',
      '/api/auto-healing/start',
      '/api/auto-healing/stop',
      '/api/status'
    ]
  });
});

// Start the service
app.listen(PORT, () => {
  console.log(`🔗 Azora Service Mesh running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I connect because we thrive together!"');
  console.log(`📊 Observability: Active`);
  console.log(`⚡ Circuit Breakers: Active`);
  console.log(`🔍 Distributed Tracing: Active`);
  console.log(`🚨 Alerting: Active`);
  console.log(`📈 Dependency Graph: Active`);
  console.log(`🔄 Auto-Healing: Ready`);
  console.log(`🛡️ Ubuntu: Mesh security through community trust`);
  
  // Start health monitoring by default
  serviceMesh.startHealthChecks(30000);
});

module.exports = app;
