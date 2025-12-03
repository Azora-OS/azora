/**
 * MFA Endpoints Test Suite
 * Tests Multi-Factor Authentication endpoints
 * Ubuntu Philosophy: "My security ensures our freedom"
 */

const request = require('supertest');
const express = require('express');
const speakeasy = require('speakeasy');

// Mock dependencies
jest.mock('speakeasy');

// Import MFA routes
const mfaRoutes = require('../../services/azora-auth/src/routes/mfa');

describe('MFA Endpoints', () => {
  let app;
  let mockUser;
  let mockSecret;

  beforeEach(() => {
    // Setup test app
    app = express();
    app.use(express.json());
    app.use('/api/auth/mfa', mfaRoutes);

    // Mock user
    mockUser = {
      sub: 'test-user-123',
      id: 'test-user-123',
      email: 'test@azora.world'
    };

    // Mock TOTP secret
    mockSecret = {
      base32: 'JBSWY3DPEHPK3PXP',
      otpauth_url: 'otpauth://totp/Azora:test@azora.world?secret=JBSWY3DPEHPK3PXP&issuer=Azora'
    };

    // Mock speakeasy functions
    speakeasy.generateSecret.mockReturnValue(mockSecret);
    speakeasy.totp.verify.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/mfa/setup', () => {
    it('should setup MFA for authenticated user', async () => {
      // Mock authentication middleware
      const mockAuth = (req, res, next) => {
        req.user = mockUser;
        next();
      };
      
      app.use('/api/auth/mfa', mockAuth);

      const response = await request(app)
        .post('/api/auth/mfa/setup')
        .expect(200);

      expect(response.body).toHaveProperty('qrCodeUrl');
      expect(response.body).toHaveProperty('secret');
      expect(response.body).toHaveProperty('backupCodes');
      expect(response.body).toHaveProperty('instructions');
      expect(response.body).toHaveProperty('ubuntu');
      expect(response.body.ubuntu).toContain('MFA setup initiated');
      
      expect(speakeasy.generateSecret).toHaveBeenCalledWith({
        name: 'Azora (test@azora.world)',
        issuer: 'Azora Platform',
        length: 32
      });
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/auth/mfa/setup')
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it('should generate 10 backup codes', async () => {
      const mockAuth = (req, res, next) => {
        req.user = mockUser;
        next();
      };
      
      app.use('/api/auth/mfa', mockAuth);

      const response = await request(app)
        .post('/api/auth/mfa/setup')
        .expect(200);

      expect(response.body.backupCodes).toHaveLength(10);
      response.body.backupCodes.forEach(code => {
        expect(code).toMatch(/^[A-F0-9]{8}$/); // 8 character hex
      });
    });
  });

  describe('POST /api/auth/mfa/verify', () => {
    beforeEach(() => {
      // Setup MFA first
      const mockAuth = (req, res, next) => {
        req.user = mockUser;
        next();
      };
      
      app.use('/api/auth/mfa', mockAuth);
    });

    it('should verify MFA setup with valid code', async () => {
      speakeasy.totp.verify.mockReturnValue(true);

      const response = await request(app)
        .post('/api/auth/mfa/verify')
        .send({ code: '123456' })
        .expect(200);

      expect(response.body.message).toContain('verification successful');
      expect(response.body.enabled).toBe(true);
      expect(response.body.ubuntu).toContain('MFA now active');
      
      expect(speakeasy.totp.verify).toHaveBeenCalledWith({
        secret: mockSecret.base32,
        encoding: 'base32',
        token: '123456',
        window: 2
      });
    });

    it('should reject invalid verification code', async () => {
      speakeasy.totp.verify.mockReturnValue(false);

      const response = await request(app)
        .post('/api/auth/mfa/verify')
        .send({ code: '000000' })
        .expect(400);

      expect(response.body.error).toContain('Invalid verification code');
      expect(response.body.ubuntu).toContain('accurate codes');
    });

    it('should require verification code', async () => {
      const response = await request(app)
        .post('/api/auth/mfa/verify')
        .send({})
        .expect(400);

      expect(response.body.error).toContain('Verification code required');
    });

    it('should fail if MFA not setup', async () => {
      // Simulate MFA not being setup
      speakeasy.totp.verify.mockImplementation(() => {
        throw new Error('Secret not found');
      });

      const response = await request(app)
        .post('/api/auth/mfa/verify')
        .send({ code: '123456' })
        .expect(404);

      expect(response.body.error).toContain('MFA not setup');
    });
  });

  describe('POST /api/auth/mfa/authenticate', () => {
    it('should authenticate with valid MFA code', async () => {
      speakeasy.totp.verify.mockReturnValue(true);

      const response = await request(app)
        .post('/api/auth/mfa/authenticate')
        .send({
          sessionId: 'test-session-123',
          code: '123456'
        })
        .expect(200);

      expect(response.body.message).toContain('authentication successful');
      expect(response.body.sessionId).toBe('test-session-123');
      expect(response.body.ubuntu).toContain('complete');
    });

    it('should reject invalid session', async () => {
      const response = await request(app)
        .post('/api/auth/mfa/authenticate')
        .send({
          sessionId: 'invalid-session',
          code: '123456'
        })
        .expect(404);

      expect(response.body.error).toContain('Invalid or expired session');
      expect(response.body.ubuntu).toContain('please login again');
    });

    it('should reject invalid MFA code', async () => {
      speakeasy.totp.verify.mockReturnValue(false);

      const response = await request(app)
        .post('/api/auth/mfa/authenticate')
        .send({
          sessionId: 'test-session-123',
          code: '000000'
        })
        .expect(400);

      expect(response.body.error).toContain('Invalid MFA code');
    });
  });

  describe('POST /api/auth/mfa/backup', () => {
    it('should authenticate with valid backup code', async () => {
      const response = await request(app)
        .post('/api/auth/mfa/backup')
        .send({
          sessionId: 'test-session-123',
          backupCode: 'ABCDEF12'
        })
        .expect(200);

      expect(response.body.message).toContain('backup code authentication successful');
      expect(response.body.sessionId).toBe('test-session-123');
      expect(response.body.remainingCodes).toBeDefined();
      expect(response.body.usedBackupCode).toBe(true);
      expect(response.body.ubuntu).toContain('consider regenerating codes');
    });

    it('should reject used backup code', async () => {
      const response = await request(app)
        .post('/api/auth/mfa/backup')
        .send({
          sessionId: 'test-session-123',
          backupCode: 'USED1234'
        })
        .expect(400);

      expect(response.body.error).toContain('already used backup code');
      expect(response.body.ubuntu).toContain('single-use only');
    });

    it('should reject invalid backup code', async () => {
      const response = await request(app)
        .post('/api/auth/mfa/backup')
        .send({
          sessionId: 'test-session-123',
          backupCode: 'INVALID'
        })
        .expect(400);

      expect(response.body.error).toContain('Invalid or already used backup code');
    });
  });

  describe('DELETE /api/auth/mfa/disable', () => {
    it('should disable MFA for authenticated user', async () => {
      const mockAuth = (req, res, next) => {
        req.user = mockUser;
        next();
      };
      
      app.use('/api/auth/mfa', mockAuth);

      const response = await request(app)
        .delete('/api/auth/mfa/disable')
        .expect(200);

      expect(response.body.message).toContain('MFA disabled successfully');
      expect(response.body.ubuntu).toContain('consider re-enabling');
    });
  });

  describe('GET /api/auth/mfa/status', () => {
    it('should return MFA status for authenticated user', async () => {
      const mockAuth = (req, res, next) => {
        req.user = mockUser;
        next();
      };
      
      app.use('/api/auth/mfa', mockAuth);

      const response = await request(app)
        .get('/api/auth/mfa/status')
        .expect(200);

      expect(response.body).toHaveProperty('enabled');
      expect(response.body).toHaveProperty('setup');
      expect(response.body).toHaveProperty('backupCodesCount');
      expect(response.body.ubuntu).toContain('status check complete');
    });
  });

  describe('POST /api/auth/mfa/regenerate-backup-codes', () => {
    it('should regenerate backup codes for authenticated user', async () => {
      const mockAuth = (req, res, next) => {
        req.user = mockUser;
        next();
      };
      
      app.use('/api/auth/mfa', mockAuth);

      const response = await request(app)
        .post('/api/auth/mfa/regenerate-backup-codes')
        .expect(200);

      expect(response.body.message).toContain('backup codes regenerated');
      expect(response.body.backupCodes).toHaveLength(10);
      expect(response.body.ubuntu).toContain('store in safe location');
    });

    it('should fail if MFA not enabled', async () => {
      const mockAuth = (req, res, next) => {
        req.user = mockUser;
        next();
      };
      
      app.use('/api/auth/mfa', mockAuth);

      // Simulate MFA not being enabled
      speakeasy.totp.verify.mockImplementation(() => {
        throw new Error('MFA not enabled');
      });

      const response = await request(app)
        .post('/api/auth/mfa/regenerate-backup-codes')
        .expect(403);

      expect(response.body.error).toContain('MFA must be enabled');
      expect(response.body.ubuntu).toContain('must be active first');
    });
  });

  describe('Security Tests', () => {
    it('should handle rate limiting', async () => {
      // Test rate limiting by making multiple requests
      const promises = Array(20).fill().map(() =>
        request(app)
          .post('/api/auth/mfa/setup')
          .send({})
      );

      const responses = await Promise.all(promises);
      
      // Should have some rate limited responses
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    });

    it('should sanitize input properly', async () => {
      const response = await request(app)
        .post('/api/auth/mfa/verify')
        .send({
          code: '<script>alert("xss")</script>'
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
      // Should not contain script tags in error message
      expect(response.body.error).not.toContain('<script>');
    });

    it('should audit log MFA operations', async () => {
      const mockAuth = (req, res, next) => {
        req.user = mockUser;
        next();
      };
      
      app.use('/api/auth/mfa', mockAuth);

      // Mock audit middleware
      const auditLog = [];
      const mockAudit = (req, res, next) => {
        auditLog.push({
          action: req.path,
          user: req.user?.sub,
          timestamp: new Date()
        });
        next();
      };
      
      app.use('/api/auth/mfa', mockAudit);

      await request(app)
        .post('/api/auth/mfa/setup')
        .send({});

      expect(auditLog).toHaveLength(1);
      expect(auditLog[0].action).toBe('/setup');
      expect(auditLog[0].user).toBe('test-user-123');
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete MFA flow', async () => {
      const mockAuth = (req, res, next) => {
        req.user = mockUser;
        next();
      };
      
      app.use('/api/auth/mfa', mockAuth);

      // 1. Setup MFA
      const setupResponse = await request(app)
        .post('/api/auth/mfa/setup')
        .send({})
        .expect(200);

      const { secret, backupCodes } = setupResponse.body;

      // 2. Verify MFA
      speakeasy.totp.verify.mockReturnValue(true);
      const verifyResponse = await request(app)
        .post('/api/auth/mfa/verify')
        .send({ code: '123456' })
        .expect(200);

      expect(verifyResponse.body.enabled).toBe(true);

      // 3. Check status
      const statusResponse = await request(app)
        .get('/api/auth/mfa/status')
        .expect(200);

      expect(statusResponse.body.enabled).toBe(true);
      expect(statusResponse.body.backupCodesCount).toBe(10);

      // 4. Test backup code authentication
      const backupResponse = await request(app)
        .post('/api/auth/mfa/backup')
        .send({
          sessionId: 'test-session',
          backupCode: backupCodes[0]
        })
        .expect(200);

      expect(backupResponse.body.usedBackupCode).toBe(true);

      // 5. Disable MFA
      const disableResponse = await request(app)
        .delete('/api/auth/mfa/disable')
        .expect(200);

      expect(disableResponse.body.message).toContain('disabled successfully');
    });
  });
});
