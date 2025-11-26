const request = require('supertest');
const express = require('express');
const rateLimit = require('express-rate-limit');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Mock rate limiter for testing
  const testLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // Lower limit for testing
    message: { error: 'Rate limit exceeded' }
  });
  
  // Mock authentication middleware
  const mockAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      req.user = { userId: 1, email: 'test@azora.world' };
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };
  
  // Test routes
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'azora-api-gateway' });
  });
  
  app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'Test route' });
  });
  
  app.get('/api/protected', mockAuth, (req, res) => {
    res.json({ success: true, user: req.user });
  });
  
  app.use('/api/limited', testLimiter, (req, res) => {
    res.json({ success: true });
  });
  
  // Service discovery mock
  app.get('/api/services', (req, res) => {
    res.json({
      services: {
        education: 'http://localhost:4001',
        finance: 'http://localhost:4002',
        marketplace: 'http://localhost:4003',
        auth: 'http://localhost:4004'
      }
    });
  });
  
  // Error handling
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  
  return app;
};

describe('API Gateway - Request Routing', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });
  
  it('should route requests to health endpoint', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);
    
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('azora-api-gateway');
  });
  
  it('should route requests to API endpoints', async () => {
    const res = await request(app)
      .get('/api/test')
      .expect(200);
    
    expect(res.body.success).toBe(true);
  });
  
  it('should handle service discovery', async () => {
    const res = await request(app)
      .get('/api/services')
      .expect(200);
    
    expect(res.body.services).toBeDefined();
    expect(res.body.services.education).toBeDefined();
    expect(res.body.services.auth).toBeDefined();
  });
});

describe('API Gateway - Rate Limiting', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });
  
  it('should allow requests within rate limit', async () => {
    const res = await request(app)
      .get('/api/limited')
      .expect(200);
    
    expect(res.body.success).toBe(true);
  });
  
  it('should enforce rate limits', async () => {
    // Make multiple requests to exceed limit
    for (let i = 0; i < 5; i++) {
      await request(app).get('/api/limited');
    }
    
    // Next request should be rate limited
    const res = await request(app)
      .get('/api/limited')
      .expect(429);
    
    expect(res.body.error).toBeDefined();
  });
});

describe('API Gateway - Authentication Middleware', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });
  
  it('should allow authenticated requests', async () => {
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);
    
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
  });
  
  it('should reject unauthenticated requests', async () => {
    const res = await request(app)
      .get('/api/protected')
      .expect(401);
    
    expect(res.body.error).toBe('Unauthorized');
  });
  
  it('should reject requests with invalid token format', async () => {
    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', 'InvalidFormat')
      .expect(401);
    
    expect(res.body.error).toBe('Unauthorized');
  });
});

describe('API Gateway - Service Discovery', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });
  
  it('should return list of available services', async () => {
    const res = await request(app)
      .get('/api/services')
      .expect(200);
    
    expect(res.body.services).toBeDefined();
    expect(Object.keys(res.body.services).length).toBeGreaterThan(0);
  });
  
  it('should include service URLs', async () => {
    const res = await request(app)
      .get('/api/services')
      .expect(200);
    
    const services = res.body.services;
    Object.values(services).forEach(url => {
      expect(url).toMatch(/^http:\/\//);
    });
  });
});

describe('API Gateway - Error Handling', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });
  
  it('should handle 404 errors', async () => {
    const res = await request(app)
      .get('/api/nonexistent')
      .expect(404);
  });
  
  it('should handle errors gracefully', async () => {
    const errorApp = express();
    errorApp.use(express.json());
    
    errorApp.get('/api/error', (req, res, next) => {
      next(new Error('Test error'));
    });
    
    errorApp.use((err, req, res, next) => {
      res.status(500).json({ error: err.message });
    });
    
    const res = await request(errorApp)
      .get('/api/error')
      .expect(500);
    
    expect(res.body.error).toBe('Test error');
  });
});
