const request = require('supertest');
const app = require('../complete-payment-service');

describe('Azora Payment Service', () => {
  let testUserId = 'test_user_123';
  let testCustomerId;
  let testTransactionId;

  // Health Check Tests
  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('complete-payment-service');
      expect(response.body.features).toContain('stripe-integration');
      expect(response.body.features).toContain('azr-tokens');
      expect(response.body.features).toContain('kyc-compliance');
    });
  });

  // KYC Tests
  describe('KYC Endpoints', () => {
    it('should initialize KYC for user', async () => {
      const response = await request(app)
        .post('/api/kyc/initialize')
        .send({
          userId: testUserId,
          userType: 'individual'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.kyc.userId).toBe(testUserId);
      expect(response.body.kyc.level).toBe('UNVERIFIED');
    });

    it('should submit KYC document', async () => {
      const response = await request(app)
        .post('/api/kyc/documents')
        .send({
          userId: testUserId,
          documentType: 'email',
          documentData: {
            email: 'test@example.com',
            verified: true
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.document.type).toBe('email');
      expect(response.body.document.status).toBe('verified');
    });

    it('should get KYC status', async () => {
      const response = await request(app)
        .get(`/api/kyc/status/${testUserId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.userId).toBe(testUserId);
      expect(response.body.documents).toHaveLength(1);
    });

    it('should get KYC requirements', async () => {
      const response = await request(app)
        .get(`/api/kyc/requirements/${testUserId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.currentLevel).toBeDefined();
      expect(response.body.nextLevel).toBeDefined();
    });
  });

  // AZR Token Tests
  describe('AZR Token Endpoints', () => {
    it('should create AZR wallet', async () => {
      const response = await request(app)
        .post('/api/azr/wallet')
        .send({
          userId: testUserId
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.wallet.userId).toBe(testUserId);
      expect(response.body.wallet.balance).toBe(0);
      expect(response.body.wallet.address).toMatch(/^azr_/);
    });

    it('should get AZR balance', async () => {
      const response = await request(app)
        .get(`/api/azr/balance/${testUserId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.balance.available).toBe(0);
      expect(response.body.balance.total).toBe(0);
    });

    it('should reward learning activity', async () => {
      const response = await request(app)
        .post('/api/azr/reward')
        .send({
          userId: testUserId,
          activityType: 'course_completion'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.amount).toBe(100);
      expect(response.body.reason).toBe('learning_reward_course_completion');
    });

    it('should get updated balance after reward', async () => {
      const response = await request(app)
        .get(`/api/azr/balance/${testUserId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.balance.available).toBe(100);
      expect(response.body.balance.earned).toBe(100);
    });

    it('should stake AZR tokens', async () => {
      const response = await request(app)
        .post('/api/azr/stake')
        .send({
          userId: testUserId,
          amount: 50
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.amount).toBe(50);
      expect(response.body.availableBalance).toBe(50);
      expect(response.body.stakedBalance).toBe(50);
    });

    it('should calculate staking rewards', async () => {
      const response = await request(app)
        .get(`/api/azr/staking-reward/${testUserId}?days=30`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stakedAmount).toBe(50);
      expect(response.body.days).toBe(30);
      expect(response.body.reward).toBeGreaterThan(0);
    });

    it('should get AZR transaction history', async () => {
      const response = await request(app)
        .get(`/api/azr/transactions/${testUserId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactions).toHaveLength(2); // reward + stake
      expect(response.body.transactions[0].type).toBe('stake');
      expect(response.body.transactions[1].type).toBe('mint');
    });
  });

  // Currency Conversion Tests
  describe('Currency Conversion', () => {
    it('should convert AZR to USD', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          amount: 100,
          fromCurrency: 'AZR',
          toCurrency: 'USD'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.azrAmount).toBe(100);
      expect(response.body.fiatAmount).toBe(10); // 100 * 0.10
      expect(response.body.currency).toBe('USD');
    });

    it('should convert USD to AZR', async () => {
      const response = await request(app)
        .post('/api/convert')
        .send({
          amount: 10,
          fromCurrency: 'USD',
          toCurrency: 'AZR'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.fiatAmount).toBe(10);
      expect(response.body.azrAmount).toBe(100); // 10 / 0.10
      expect(response.body.currency).toBe('USD');
    });
  });

  // Payment UI API Tests
  describe('Payment UI API', () => {
    it('should get payment configuration', async () => {
      const response = await request(app)
        .get('/api/ui/payment-config')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.config.supportedCurrencies).toContain('USD');
      expect(response.body.config.supportedPaymentMethods).toHaveLength(3);
    });

    it('should get pricing for course', async () => {
      const response = await request(app)
        .get('/api/ui/pricing/course/basic-python?currency=USD')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pricing.price).toBe(49.99);
      expect(response.body.pricing.currency).toBe('USD');
    });

    it('should calculate fees', async () => {
      const response = await request(app)
        .post('/api/ui/calculate-fees')
        .send({
          amount: 100,
          currency: 'USD',
          paymentMethod: 'card'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.calculation.subtotal).toBe(100);
      expect(response.body.calculation.fees.total).toBe(3.20); // 2.9% + $0.30
      expect(response.body.calculation.total).toBe(103.20);
    });

    it('should get wallet UI data', async () => {
      const response = await request(app)
        .get(`/api/ui/wallet/${testUserId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.wallet.userId).toBe(testUserId);
      expect(response.body.wallet.balances).toBeDefined();
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    it('should return 400 for missing userId in KYC initialization', async () => {
      const response = await request(app)
        .post('/api/kyc/initialize')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('userId is required');
    });

    it('should return 400 for invalid amount in AZR reward', async () => {
      const response = await request(app)
        .post('/api/azr/reward')
        .send({
          userId: testUserId,
          activityType: 'invalid_activity'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent wallet', async () => {
      const response = await request(app)
        .get('/api/azr/balance/non_existent_user')
        .expect(404);

      expect(response.body.error).toBe('Wallet not found');
    });

    it('should return 404 for unknown endpoint', async () => {
      const response = await request(app)
        .get('/api/unknown-endpoint')
        .expect(404);

      expect(response.body.error).toBe('Endpoint not found');
    });
  });

  // Admin Endpoints Tests
  describe('Admin Endpoints', () => {
    it('should get system statistics', async () => {
      const response = await request(app)
        .get('/api/admin/system-stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats.azr).toBeDefined();
      expect(response.body.stats.compliance).toBeDefined();
      expect(response.body.stats.azr.totalSupply).toBeGreaterThan(0);
    });

    it('should get compliance report', async () => {
      const response = await request(app)
        .get('/api/admin/compliance-report')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.report.totalUsers).toBeGreaterThan(0);
      expect(response.body.report.levelDistribution).toBeDefined();
    });
  });

  // Integration Tests
  describe('Integration Scenarios', () => {
    it('should handle complete user journey', async () => {
      const newUserId = 'integration_test_user';

      // 1. Initialize KYC
      await request(app)
        .post('/api/kyc/initialize')
        .send({ userId: newUserId })
        .expect(200);

      // 2. Submit email verification
      await request(app)
        .post('/api/kyc/documents')
        .send({
          userId: newUserId,
          documentType: 'email',
          documentData: { email: 'integration@test.com' }
        })
        .expect(200);

      // 3. Create wallet
      await request(app)
        .post('/api/azr/wallet')
        .send({ userId: newUserId })
        .expect(200);

      // 4. Reward learning
      await request(app)
        .post('/api/azr/reward')
        .send({
          userId: newUserId,
          activityType: 'course_completion'
        })
        .expect(200);

      // 5. Check final balance
      const balanceResponse = await request(app)
        .get(`/api/azr/balance/${newUserId}`)
        .expect(200);

      expect(balanceResponse.body.balance.available).toBe(100);
    });
  });
});

// Cleanup after tests
afterAll(async () => {
  // Close any open connections
  if (app.close) {
    await app.close();
  }
});