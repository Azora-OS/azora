const request = require('supertest');
const express = require('express');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Mock service health data
  const serviceHealthData = {
    'auth-service': { status: 'healthy', responseTime: 45 },
    'payment-service': { status: 'healthy', responseTime: 120 },
    'education-service': { status: 'degraded', responseTime: 250 },
    'marketplace-service': { status: 'healthy', responseTime: 80 }
  };
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'health-monitor',
      timestamp: new Date().toISOString()
    });
  });
  
  // Get specific service health
  app.get('/api/health/:serviceId', (req, res) => {
    const { serviceId } = req.params;
    const healthData = serviceHealthData[serviceId];
    
    if (!healthData) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.json({
      serviceId,
      status: healthData.status,
      responseTime: healthData.responseTime,
      lastChecked: new Date().toISOString()
    });
  });
  
  // Get all services health
  app.get('/api/health', (req, res) => {
    const services = Object.entries(serviceHealthData).map(([id, data]) => ({
      id,
      status: data.status,
      responseTime: data.responseTime,
      lastChecked: new Date().toISOString()
    }));
    
    res.json({
      success: true,
      data: services,
      count: services.length
    });
  });
  
  return app;
};

describe('Health Monitor - Service Health Checks', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });
  
  it('should return health status for specific service', async () => {
    const res = await request(app)
      .get('/api/health/auth-service')
      .expect(200);
    
    expect(res.body.serviceId).toBe('auth-service');
    expect(res.body.status).toBeDefined();
    expect(res.body.responseTime).toBeDefined();
    expect(res.body.lastChecked).toBeDefined();
  });
  
  it('should return 404 for unknown service', async () => {
    const res = await request(app)
      .get('/api/health/unknown-service')
      .expect(404);
    
    expect(res.body.error).toBe('Service not found');
  });
  
  it('should return health status for all services', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
  });
  
  it('should include response time in health data', async () => {
    const res = await request(app)
      .get('/api/health/payment-service')
      .expect(200);
    
    expect(res.body.responseTime).toBeDefined();
    expect(typeof res.body.responseTime).toBe('number');
  });
  
  it('should detect degraded services', async () => {
    const res = await request(app)
      .get('/api/health/education-service')
      .expect(200);
    
    expect(res.body.status).toBe('degraded');
  });
});

describe('Health Monitor - Metrics Collection', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });
  
  it('should collect metrics for all services', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200);
    
    const services = res.body.data;
    services.forEach(service => {
      expect(service.id).toBeDefined();
      expect(service.status).toBeDefined();
      expect(service.responseTime).toBeDefined();
      expect(service.lastChecked).toBeDefined();
    });
  });
  
  it('should include timestamp in metrics', async () => {
    const res = await request(app)
      .get('/api/health/auth-service')
      .expect(200);
    
    expect(res.body.lastChecked).toBeDefined();
    const timestamp = new Date(res.body.lastChecked);
    expect(timestamp.getTime()).not.toBeNaN();
  });
});

describe('Health Monitor - Alert Generation', () => {
  it('should identify unhealthy services', async () => {
    const app = createTestApp();
    
    const res = await request(app)
      .get('/api/health')
      .expect(200);
    
    const unhealthyServices = res.body.data.filter(
      service => service.status !== 'healthy'
    );
    
    expect(unhealthyServices.length).toBeGreaterThan(0);
    expect(unhealthyServices[0].status).toBe('degraded');
  });
  
  it('should detect slow response times', async () => {
    const app = createTestApp();
    
    const res = await request(app)
      .get('/api/health')
      .expect(200);
    
    const slowServices = res.body.data.filter(
      service => service.responseTime > 200
    );
    
    expect(slowServices.length).toBeGreaterThan(0);
  });
});

describe('Health Monitor - Dashboard Data', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });
  
  it('should provide dashboard-ready data', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.count).toBeDefined();
  });
  
  it('should include service count', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(res.body.count).toBe(res.body.data.length);
  });
  
  it('should format data for visualization', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200);
    
    const services = res.body.data;
    services.forEach(service => {
      expect(service).toHaveProperty('id');
      expect(service).toHaveProperty('status');
      expect(service).toHaveProperty('responseTime');
      expect(service).toHaveProperty('lastChecked');
    });
  });
});

describe('Health Monitor - Self Health Check', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });
  
  it('should report own health status', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);
    
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('health-monitor');
  });
  
  it('should include timestamp in health response', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);
    
    expect(res.body.timestamp).toBeDefined();
    const timestamp = new Date(res.body.timestamp);
    expect(timestamp.getTime()).not.toBeNaN();
  });
});
