const request = require('supertest');
const app = require('../index.js');

describe('Azora Treasury Service', () => {
  // Health check test
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('azora-treasury');
    });
  });

  // Get all treasury assets test
  describe('GET /api/assets', () => {
    it('should return all treasury assets', async () => {
      const response = await request(app)
        .get('/api/assets')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.assets).toBeDefined();
      expect(response.body.data.totalValue).toBeDefined();
      expect(response.body.data.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get specific treasury asset test
  describe('GET /api/assets/:assetId', () => {
    it('should return specific treasury asset', async () => {
      const response = await request(app)
        .get('/api/assets/asset_1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('asset_1');
    });

    it('should return 404 for non-existent asset', async () => {
      const response = await request(app)
        .get('/api/assets/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('Asset not found');
    });
  });

  // Add a new treasury asset test
  describe('POST /api/assets', () => {
    it('should add a new treasury asset', async () => {
      const assetData = {
        type: 'cryptocurrency',
        name: 'Ethereum',
        symbol: 'ETH',
        amount: 50,
        value: 150000
      };

      const response = await request(app)
        .post('/api/assets')
        .send(assetData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('cryptocurrency');
      expect(response.body.data.name).toBe('Ethereum');
      expect(response.body.data.symbol).toBe('ETH');
    });

    it('should return 400 for missing required fields', async () => {
      const assetData = {
        type: 'cryptocurrency',
        name: 'Ethereum'
        // Missing symbol, amount, and value
      };

      const response = await request(app)
        .post('/api/assets')
        .send(assetData)
        .expect(400);
      
      expect(response.body.error).toBe('Type, name, symbol, amount, and value are required');
    });
  });

  // Update treasury asset test
  describe('PUT /api/assets/:assetId', () => {
    let assetId;

    beforeAll(async () => {
      // Create an asset first
      const assetData = {
        type: 'fiat',
        name: 'EUR',
        symbol: 'EUR',
        amount: 50000,
        value: 50000
      };

      const response = await request(app)
        .post('/api/assets')
        .send(assetData);

      assetId = response.body.data.id;
    });

    it('should update treasury asset', async () => {
      const updateData = {
        amount: 75000,
        value: 75000
      };

      const response = await request(app)
        .put(`/api/assets/${assetId}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(75000);
      expect(response.body.data.value).toBe(75000);
    });

    it('should return 404 for non-existent asset', async () => {
      const updateData = {
        amount: 100000
      };

      const response = await request(app)
        .put('/api/assets/non-existent')
        .send(updateData)
        .expect(404);
      
      expect(response.body.error).toBe('Asset not found');
    });
  });

  // Reserve management test
  describe('POST /api/reserves', () => {
    let assetId;

    beforeAll(async () => {
      // Create an asset first
      const assetData = {
        type: 'commodity',
        name: 'Gold',
        symbol: 'XAU',
        amount: 100,
        value: 200000
      };

      const response = await request(app)
        .post('/api/assets')
        .send(assetData);

      assetId = response.body.data.id;
    });

    it('should manage treasury reserves', async () => {
      const reserveData = {
        assetId: assetId,
        amount: 25,
        action: 'add',
        description: 'Additional gold purchase'
      };

      const response = await request(app)
        .post('/api/reserves')
        .send(reserveData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.assetId).toBe(assetId);
      expect(response.body.data.amount).toBe(25);
      expect(response.body.data.action).toBe('add');
    });

    it('should return 400 for missing required fields', async () => {
      const reserveData = {
        assetId: assetId,
        amount: 25
        // Missing action
      };

      const response = await request(app)
        .post('/api/reserves')
        .send(reserveData)
        .expect(400);
      
      expect(response.body.error).toBe('Asset ID, amount, and action are required');
    });

    it('should return 404 for non-existent asset', async () => {
      const reserveData = {
        assetId: 'non-existent',
        amount: 25,
        action: 'add'
      };

      const response = await request(app)
        .post('/api/reserves')
        .send(reserveData)
        .expect(404);
      
      expect(response.body.error).toBe('Asset not found');
    });
  });

  // Get all reserve transactions test
  describe('GET /api/reserves', () => {
    it('should return all reserve transactions', async () => {
      const response = await request(app)
        .get('/api/reserves')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get specific reserve transaction test
  describe('GET /api/reserves/:transactionId', () => {
    let transactionId;

    beforeAll(async () => {
      // Create an asset first
      const assetData = {
        type: 'equity',
        name: 'Apple Stock',
        symbol: 'AAPL',
        amount: 1000,
        value: 150000
      };

      const assetResponse = await request(app)
        .post('/api/assets')
        .send(assetData);

      const assetId = assetResponse.body.data.id;

      // Create a transaction
      const reserveData = {
        assetId: assetId,
        amount: 100,
        action: 'add',
        description: 'Additional stock purchase'
      };

      const transactionResponse = await request(app)
        .post('/api/reserves')
        .send(reserveData);

      transactionId = transactionResponse.body.data.id;
    });

    it('should return specific reserve transaction', async () => {
      const response = await request(app)
        .get(`/api/reserves/${transactionId}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(transactionId);
    });

    it('should return 404 for non-existent transaction', async () => {
      const response = await request(app)
        .get('/api/reserves/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('Transaction not found');
    });
  });

  // Financial reporting test
  describe('GET /api/reports', () => {
    it('should generate a financial report', async () => {
      const response = await request(app)
        .get('/api/reports')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalAssets).toBeDefined();
      expect(response.body.data.totalLiabilities).toBeDefined();
      expect(response.body.data.netWorth).toBeDefined();
      expect(response.body.data.assetBreakdown).toBeDefined();
    });
  });

  // Get specific financial report test
  describe('GET /api/reports/:reportId', () => {
    let reportId;

    beforeAll(async () => {
      // Generate a report first
      const response = await request(app)
        .get('/api/reports');

      reportId = response.body.data.id;
    });

    it('should return specific financial report', async () => {
      const response = await request(app)
        .get(`/api/reports/${reportId}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(reportId);
    });

    it('should return 404 for non-existent report', async () => {
      const response = await request(app)
        .get('/api/reports/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('Report not found');
    });
  });

  // Get all financial reports test
  describe('GET /api/reports/history', () => {
    it('should return all financial reports', async () => {
      const response = await request(app)
        .get('/api/reports/history')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });
});