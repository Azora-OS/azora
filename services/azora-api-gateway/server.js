// Initialize tracing before any other modules
try {
  require('./tracing');
} catch (e) {
  console.warn('OpenTelemetry dependencies not installed, tracing disabled.');
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGINS?.split(',') || '*', credentials: true }));
app.use(express.json());

// Ubuntu Rate Limiting
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Ubuntu rate limit exceeded', ubuntu: 'Please slow down for community harmony' }
});
app.use(ubuntuLimiter);

// Enhanced Service Registry with all 58 services
const services = {
  // Core Services
  'auth': process.env.AUTH_SERVICE_URL || 'http://localhost:4001', // Matches auth service default
  'user': process.env.USER_SERVICE_URL || 'http://localhost:3001', // Updated to match azora-sapiens
  'education': process.env.EDUCATION_SERVICE_URL || 'http://localhost:3003',
  'blockchain': process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:3029',

  // Financial Services
  'citadel-fund': process.env.CITADEL_FUND_URL || 'http://localhost:4010', // Matches citadel-fund default
  'proof-of-value': process.env.PROOF_OF_VALUE_URL || 'http://localhost:4011', // Matches proof-of-value default
  'treasury': process.env.TREASURY_SERVICE_URL || 'http://localhost:3028',
  'pay': process.env.PAY_SERVICE_URL || 'http://localhost:3018', // Matches azora-pay default
  'mint': process.env.MINT_SERVICE_URL || 'http://localhost:3010',

  // AI & Ethics Services
  'constitutional-ai': process.env.CONSTITUTIONAL_AI_URL || 'http://localhost:4012', // Matches constitutional-ai default
  'ai-ethics-monitor': process.env.AI_ETHICS_MONITOR_URL || 'http://localhost:3033',
  'constitutional-court': process.env.CONSTITUTIONAL_COURT_URL || 'http://localhost:3034',
  'ai': process.env.AI_SERVICE_URL || 'http://localhost:4005', // Matches azora-ai default
  'ai-tutor': process.env.AI_TUTOR_SERVICE_URL || 'http://localhost:3015',
  'ai-research': process.env.AI_RESEARCH_SERVICE_URL || 'http://localhost:3016',

  // Education Services
  'courses': process.env.COURSES_SERVICE_URL || 'http://localhost:3007',
  'certificates': process.env.CERTIFICATES_SERVICE_URL || 'http://localhost:3008',
  'assessments': process.env.ASSESSMENTS_SERVICE_URL || 'http://localhost:3011', // Matches azora-assessment default
  'learning-analytics': process.env.LEARNING_ANALYTICS_URL || 'http://localhost:3011',
  'knowledge-ocean': process.env.KNOWLEDGE_OCEAN_URL || 'http://localhost:4003',
  'tutoring': process.env.TUTORING_SERVICE_URL || 'http://localhost:3013',

  // Business & Marketplace
  'marketplace': process.env.MARKETPLACE_SERVICE_URL || 'http://localhost:3004', // Matches azora-marketplace default
  'jobspaces': process.env.JOBSPACES_SERVICE_URL || 'http://localhost:3017',
  'business': process.env.BUSINESS_SERVICE_URL || 'http://localhost:3018',
  'consulting': process.env.CONSULTING_SERVICE_URL || 'http://localhost:3019',
  'partnerships': process.env.PARTNERSHIPS_SERVICE_URL || 'http://localhost:3020',

  // Development & Tools
  'forge': process.env.FORGE_SERVICE_URL || 'http://localhost:3008',
  'sapiens': process.env.SAPIENS_SERVICE_URL || 'http://localhost:3012', // Updated to match azora-sapiens health
  'azstudio': process.env.AZSTUDIO_SERVICE_URL || 'http://localhost:3021',
  'build-spaces': process.env.BUILD_SPACES_SERVICE_URL || 'http://localhost:3100', // Matches buildspaces-api
  'agent-execution': process.env.AGENT_EXECUTION_SERVICE_URL || 'http://localhost:3023',
  'copilot': process.env.COPILOT_SERVICE_URL || 'http://localhost:4004', // Matches copilot-integration

  // Communication & Social
  'messaging': process.env.MESSAGING_SERVICE_URL || 'http://localhost:3025',
  'notifications': process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3026',
  'social': process.env.SOCIAL_SERVICE_URL || 'http://localhost:3027',
  'community': process.env.COMMUNITY_SERVICE_URL || 'http://localhost:3035',
  'forums': process.env.FORUMS_SERVICE_URL || 'http://localhost:3036',
  'events': process.env.EVENTS_SERVICE_URL || 'http://localhost:4019', // Matches azora-events default

  // Infrastructure & Monitoring
  'event-bus': process.env.EVENT_BUS_SERVICE_URL || 'http://localhost:3020', // Matches azora-event-bus default
  'search': process.env.SEARCH_SERVICE_URL || 'http://localhost:3039',
  'recommendations': process.env.RECOMMENDATIONS_SERVICE_URL || 'http://localhost:3040',
  'analytics': process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3041',
  'monitoring': process.env.MONITORING_SERVICE_URL || 'http://localhost:3042',
  'logging': process.env.LOGGING_SERVICE_URL || 'http://localhost:3043',
  'aegis': process.env.AEGIS_SERVICE_URL || 'http://localhost:4006', // Security Service

  // Governance & Compliance
  'governance': process.env.GOVERNANCE_SERVICE_URL || 'http://localhost:4018', // Matches azora-governance default
  'compliance': process.env.COMPLIANCE_SERVICE_URL || 'http://localhost:3045',
  'audit': process.env.AUDIT_SERVICE_URL || 'http://localhost:3046',
  'legal': process.env.LEGAL_SERVICE_URL || 'http://localhost:3047',

  // Content & Media
  'content': process.env.CONTENT_SERVICE_URL || 'http://localhost:3048',
  'media': process.env.MEDIA_SERVICE_URL || 'http://localhost:3049',
  'streaming': process.env.STREAMING_SERVICE_URL || 'http://localhost:3050',
  'podcasts': process.env.PODCASTS_SERVICE_URL || 'http://localhost:3051',

  // Additional Services
  'wellness': process.env.WELLNESS_SERVICE_URL || 'http://localhost:3052',
  'sustainability': process.env.SUSTAINABILITY_SERVICE_URL || 'http://localhost:3053',
  'research': process.env.RESEARCH_SERVICE_URL || 'http://localhost:3008', // Matches azora-research-center
  'innovation': process.env.INNOVATION_SERVICE_URL || 'http://localhost:3055',
  'incubator': process.env.INCUBATOR_SERVICE_URL || 'http://localhost:3002', // Matches elara-incubator
  'accelerator': process.env.ACCELERATOR_SERVICE_URL || 'http://localhost:3057',
  'enterprise': process.env.ENTERPRISE_SERVICE_URL || 'http://localhost:3023' // Matches enterprise default
};

// Service health monitoring
const serviceHealth = {};
const healthCheckInterval = 30000; // 30 seconds

// Health check function
async function checkServiceHealth(serviceName, serviceUrl) {
  try {
    const response = await axios.get(`${serviceUrl}/health`, { timeout: 5000 });
    serviceHealth[serviceName] = {
      healthy: true,
      lastCheck: new Date(),
      responseTime: response.headers['x-response-time'] || 'N/A',
      status: response.data?.status || 'unknown'
    };
  } catch (error) {
    serviceHealth[serviceName] = {
      healthy: false,
      lastCheck: new Date(),
      error: error.message,
      status: 'unhealthy'
    };
    console.warn(`⚠️ Service ${serviceName} health check failed:`, error.message);
  }
}

// Periodic health checks
setInterval(async () => {
  await Promise.all(
    Object.entries(services).map(([name, url]) =>
      checkServiceHealth(name, url).catch(err =>
        console.error(`Health check error for ${name}:`, err.message)
      )
    )
  );
}, healthCheckInterval);

// Initial health checks
Promise.all(
  Object.entries(services).map(([name, url]) =>
    checkServiceHealth(name, url).catch(err =>
      console.error(`Initial health check error for ${name}:`, err.message)
    )
  )
);

app.get('/health', (req, res) => {
  res.json({
    service: 'azora-api-gateway',
    status: 'healthy',
    ubuntu: 'I connect because we communicate together',
    timestamp: new Date().toISOString(),
    port: PORT,
    services: Object.keys(services).length,
    healthyServices: Object.values(serviceHealth).filter(h => h.healthy).length
  });
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I can because we can',
    principles: [
      'My success enables your success',
      'My knowledge becomes our knowledge',
      'My work strengthens our foundation',
      'My security ensures our freedom'
    ],
    service: 'azora-api-gateway',
    ubuntu: 'Ubuntu service orchestration'
  });
});

// Service discovery endpoint
app.get('/api/services', (req, res) => {
  const serviceList = Object.keys(services).map(name => ({
    name,
    url: services[name],
    healthy: serviceHealth[name]?.healthy || false,
    lastCheck: serviceHealth[name]?.lastCheck,
    status: serviceHealth[name]?.status || 'unknown'
  }));

  res.json({
    services: serviceList,
    totalServices: Object.keys(services).length,
    healthyServices: serviceList.filter(s => s.healthy).length,
    ubuntu: 'All services connected through Ubuntu harmony'
  });
});

// Service health details
app.get('/api/services/:name/health', (req, res) => {
  const serviceName = req.params.name;
  const health = serviceHealth[serviceName];

  if (!health) {
    return res.status(404).json({
      error: 'Service not found',
      availableServices: Object.keys(services)
    });
  }

  res.json({
    service: serviceName,
    url: services[serviceName],
    ...health
  });
});

// Load balancing and circuit breaker
const circuitBreakers = {};

function getCircuitBreaker(serviceName) {
  if (!circuitBreakers[serviceName]) {
    circuitBreakers[serviceName] = {
      failures: 0,
      lastFailure: null,
      state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
      threshold: 5,
      timeout: 60000, // 1 minute
      resetTimeout: 30000 // 30 seconds
    };
  }
  return circuitBreakers[serviceName];
}

function shouldAllowRequest(serviceName) {
  const breaker = getCircuitBreaker(serviceName);
  const now = Date.now();

  switch (breaker.state) {
    case 'OPEN':
      if (now - breaker.lastFailure > breaker.resetTimeout) {
        breaker.state = 'HALF_OPEN';
        return true;
      }
      return false;
    case 'HALF_OPEN':
      return true;
    default:
      return true;
  }
}

function recordFailure(serviceName) {
  const breaker = getCircuitBreaker(serviceName);
  breaker.failures++;
  breaker.lastFailure = Date.now();

  if (breaker.failures >= breaker.threshold) {
    breaker.state = 'OPEN';
    console.warn(`🔌 Circuit breaker OPEN for service: ${serviceName}`);
  }
}

function recordSuccess(serviceName) {
  const breaker = getCircuitBreaker(serviceName);
  if (breaker.state === 'HALF_OPEN') {
    breaker.state = 'CLOSED';
    breaker.failures = 0;
    console.log(`✅ Circuit breaker CLOSED for service: ${serviceName}`);
  } else if (breaker.state === 'CLOSED') {
    breaker.failures = Math.max(0, breaker.failures - 1);
  }
}

// Enhanced proxy middleware with circuit breaker and load balancing
function createEnhancedProxy(serviceName, serviceUrl) {
  const instances = serviceUrl.includes(',')
    ? serviceUrl.split(',').map(url => url.trim())
    : [serviceUrl];

  let currentInstance = 0;

  return createProxyMiddleware({
    target: instances[0],
    changeOrigin: true,
    pathRewrite: { [`^/api/${serviceName}`]: '' },
    timeout: 30000,

    // Load balancing (round-robin)
    router: (req) => {
      const instance = instances[currentInstance];
      currentInstance = (currentInstance + 1) % instances.length;
      return instance;
    },

    // Circuit breaker logic
    onProxyReq: (proxyReq, req, res) => {
      if (!shouldAllowRequest(serviceName)) {
        res.status(503).json({
          error: `Service ${serviceName} temporarily unavailable`,
          ubuntu: 'Service protection through Ubuntu care',
          circuitBreaker: 'OPEN'
        });
        return false;
      }
    },

    onError: (err, req, res) => {
      recordFailure(serviceName);
      console.error(`Service ${serviceName} error:`, err.message);

      if (!res.headersSent) {
        res.status(503).json({
          error: `Service ${serviceName} unavailable`,
          ubuntu: 'We handle service issues with Ubuntu grace',
          circuitBreaker: getCircuitBreaker(serviceName).state
        });
      }
    },

    onSuccess: (proxyRes, req, res) => {
      recordSuccess(serviceName);
    }
  });
}

// Route to services with enhanced proxy
Object.entries(services).forEach(([name, url]) => {
  app.use(`/api/${name}`, createEnhancedProxy(name, url));
});

// Service aggregation endpoint
app.get('/api/aggregation/health', async (req, res) => {
  try {
    const healthPromises = Object.entries(services).map(async ([name, url]) => {
      try {
        const response = await axios.get(`${url}/health`, { timeout: 3000 });
        return { name, healthy: true, data: response.data };
      } catch (error) {
        return { name, healthy: false, error: error.message };
      }
    });

    const results = await Promise.allSettled(healthPromises);
    const healthData = results.map(result =>
      result.status === 'fulfilled' ? result.value : result.reason
    );

    res.json({
      timestamp: new Date().toISOString(),
      totalServices: Object.keys(services).length,
      healthyServices: healthData.filter(h => h.healthy).length,
      services: healthData,
      ubuntu: 'Collective health monitoring through Ubuntu care'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`📊 ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  console.error('Ubuntu Gateway Error:', error);
  res.status(500).json({
    error: 'Ubuntu gateway error',
    ubuntu: 'We handle errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Service not found',
    ubuntu: 'Ubuntu guidance: Check available services',
    availableServices: Object.keys(services),
    path: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Azora API Gateway running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I connect because we communicate together!"');
  console.log(`🔗 Services: ${Object.keys(services).length} connected`);
  console.log(`📊 Health checks: Every ${healthCheckInterval / 1000} seconds`);
  console.log(`🛡️ Circuit breakers: Active for all services`);
});
