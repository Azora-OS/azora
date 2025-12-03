const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const router = express.Router();

// Ubuntu Service Discovery - Enhanced with new services
const services = {
  education: 'http://localhost:4001',
  finance: 'http://localhost:4002', 
  marketplace: 'http://localhost:4003',
  auth: 'http://localhost:4004',
  ai: 'http://localhost:4005',
  blockchain: 'http://localhost:4009',
  analytics: 'http://localhost:4010',
  mint: 'http://localhost:4011',
  citadel: 'http://localhost:4015',
  proofOfValue: 'http://localhost:4016',
  constitutionalAI: 'http://localhost:4012',
  aiRouting: 'http://localhost:4013'
};

// Ubuntu Philosophy Endpoint
router.get('/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I am because we are',
    principles: [
      'My success enables your success',
      'My knowledge becomes our knowledge',
      'My work strengthens our foundation',
      'My security ensures our freedom'
    ],
    services: Object.keys(services),
    ubuntu: 'API Gateway - Ubuntu service orchestration complete'
  });
});

// Service Health Check
router.get('/services/health', async (req, res) => {
  try {
    const healthChecks = await Promise.allSettled(
      Object.entries(services).map(async ([service, target]) => {
        try {
          const response = await fetch(`${target}/health`);
          return { service, status: 'healthy', target };
        } catch (error) {
          return { service, status: 'unhealthy', target, error: error.message };
        }
      })
    );

    const results = healthChecks.map(result => 
      result.status === 'fulfilled' ? result.value : result.reason
    );

    res.json({
      gateway: 'healthy',
      services: results,
      ubuntu: 'Ubuntu service health monitoring active'
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      ubuntu: 'Ubuntu health monitoring faces temporary challenges'
    });
  }
});

// Service Proxies with Enhanced Error Handling
Object.entries(services).forEach(([service, target]) => {
  router.use(`/${service}`, createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: { [`^/${service}`]: '' },
    onError: (err, req, res) => {
      console.error(`Ubuntu service ${service} error:`, err.message);
      res.status(503).json({
        error: `Ubuntu service ${service} unavailable`,
        service,
        target,
        ubuntu: 'We handle service errors with Ubuntu grace',
        timestamp: new Date().toISOString()
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add Ubuntu headers
      proxyReq.setHeader('X-Ubuntu-Gateway', 'azora-api-gateway');
      proxyReq.setHeader('X-Ubuntu-Philosophy', 'ngiyakwazi-ngoba-sikwazi');
    },
    onProxyRes: (proxyRes, req, res) => {
      // Add Ubuntu response headers
      proxyRes.headers['X-Ubuntu-Service'] = service;
      proxyRes.headers['X-Ubuntu-Gateway'] = 'active';
    }
  }));
});

// Service Discovery - Get all available services
router.get('/services', (req, res) => {
  res.json({
    services: Object.entries(services).map(([name, target]) => ({
      name,
      target,
      endpoint: `/${name}`,
      ubuntu: `Ubuntu ${name} service`
    })),
    ubuntu: 'Ubuntu service discovery - all services available'
  });
});

// Service Routing - Smart routing based on request type
router.post('/route', (req, res) => {
  const { type, data } = req.body;
  
  // Smart routing logic
  let targetService;
  switch (type) {
    case 'education':
      targetService = 'education';
      break;
    case 'finance':
    case 'mint':
    case 'citadel':
      targetService = 'finance';
      break;
    case 'marketplace':
      targetService = 'marketplace';
      break;
    case 'auth':
      targetService = 'auth';
      break;
    case 'ai':
    case 'constitutional':
      targetService = 'ai';
      break;
    case 'blockchain':
      targetService = 'blockchain';
      break;
    case 'analytics':
      targetService = 'analytics';
      break;
    case 'mining':
      targetService = 'proofOfValue';
      break;
    default:
      return res.status(400).json({
        error: 'Unknown service type',
        ubuntu: 'Ubuntu routing requires valid service type',
        availableTypes: Object.keys(services)
      });
  }

  res.json({
    routed: true,
    targetService,
    endpoint: `/${targetService}`,
    ubuntu: 'Ubuntu smart routing active'
  });
});

// Load Balancing - Simple round-robin for multiple instances
const serviceInstances = {
  education: ['http://localhost:4001'],
  finance: ['http://localhost:4002'],
  ai: ['http://localhost:4005', 'http://localhost:4013'] // AI routing service
};

let currentInstance = {};

router.get('/balance/:service', (req, res) => {
  const { service } = req.params;
  const instances = serviceInstances[service];
  
  if (!instances || instances.length === 0) {
    return res.status(404).json({
      error: 'Service not found',
      ubuntu: 'Ubuntu service not available for balancing'
    });
  }

  // Simple round-robin
  currentInstance[service] = (currentInstance[service] || 0) % instances.length;
  const target = instances[currentInstance[service]];
  currentInstance[service]++;

  res.json({
    service,
    target,
    instance: currentInstance[service],
    ubuntu: 'Ubuntu load balancing active'
  });
});

module.exports = router;