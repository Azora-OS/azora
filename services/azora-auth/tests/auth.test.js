const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Import auth routes
  const authRoutes = require('../src/routes/auth');
  app.use('/api', authRoutes);
  
  return app;
};

describe('Auth Service - Authentication Endpoints', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });
  
  describe('POST /api/login', () => {
    it('should authenticate user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'test@azora.world',
          password: 'password123'
        })
        .expect(200);
      
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('test@azora.world');
    });
    
    it('should reject login without email', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          password: 'password123'
        })
        .expect(401);
      
      expect(res.body.error).toBeDefined();
    });
    
    it('should reject login without password', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'test@azora.world'
        })
        .expect(401);
      
      expect(res.body.error).toBeDefined();
    });
  });
  
  describe('GET /api/profile', () => {
    it('should return user profile with valid token', async () => {
      const token = jwt.sign(
        { userId: 1, email: 'test@azora.world' },
        process.env.JWT_SECRET || 'ubuntu-secret',
        { expiresIn: '24h' }
      );
      
      const res = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(res.body.user).toBeDefined();
    });
    
    it('should reject request without token', async () => {
      const res = await request(app)
        .get('/api/profile')
        .expect(401);
      
      expect(res.body.error).toBeDefined();
    });
    
    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
      
      expect(res.body.error).toBeDefined();
    });
  });
});

describe('Auth Service - JWT Token Generation', () => {
  it('should generate valid JWT token', () => {
    const payload = { userId: 1, email: 'test@azora.world' };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'ubuntu-secret',
      { expiresIn: '24h' }
    );
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ubuntu-secret');
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
  });
  
  it('should include expiration in token', () => {
    const token = jwt.sign(
      { userId: 1 },
      process.env.JWT_SECRET || 'ubuntu-secret',
      { expiresIn: '1h' }
    );
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ubuntu-secret');
    expect(decoded.exp).toBeDefined();
    expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
  });
});

describe('Auth Service - Password Validation', () => {
  it('should validate password requirements', () => {
    const validatePassword = (password) => {
      return password && password.length >= 8;
    };
    
    expect(validatePassword('short')).toBe(false);
    expect(validatePassword('validpassword123')).toBe(true);
    expect(validatePassword('')).toBe(false);
    expect(validatePassword(null)).toBe(false);
  });
});

describe('Auth Service - Session Management', () => {
  it('should create session on successful login', async () => {
    const app = createTestApp();
    
    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'test@azora.world',
        password: 'password123'
      })
      .expect(200);
    
    expect(res.body.token).toBeDefined();
    
    // Verify token can be used for authenticated requests
    const profileRes = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${res.body.token}`)
      .expect(200);
    
    expect(profileRes.body.user).toBeDefined();
  });
});
