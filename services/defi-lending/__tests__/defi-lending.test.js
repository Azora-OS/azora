const request = require('supertest');
const app = require('../index.js');

describe('DeFi Lending Service', () => {
  // Health check test
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('defi-lending');
    });
  });

  // Get all lending pools test
  describe('GET /api/pools', () => {
    it('should return all lending pools', async () => {
      const response = await request(app)
        .get('/api/pools')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get specific lending pool test
  describe('GET /api/pools/:poolId', () => {
    it('should return specific lending pool', async () => {
      const response = await request(app)
        .get('/api/pools/pool_1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('pool_1');
    });

    it('should return 404 for non-existent pool', async () => {
      const response = await request(app)
        .get('/api/pools/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('Pool not found');
    });
  });

  // Create a new lending pool test
  describe('POST /api/pools', () => {
    it('should create a new lending pool', async () => {
      const poolData = {
        asset: 'USDC',
        initialLiquidity: 10000,
        apy: 5.5
      };

      const response = await request(app)
        .post('/api/pools')
        .send(poolData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.asset).toBe('USDC');
      expect(response.body.data.totalLiquidity).toBe(10000);
      expect(response.body.data.status).toBe('active');
    });

    it('should return 400 for missing required fields', async () => {
      const poolData = {
        asset: 'USDC'
        // Missing initialLiquidity
      };

      const response = await request(app)
        .post('/api/pools')
        .send(poolData)
        .expect(400);
      
      expect(response.body.error).toBe('Asset and initial liquidity are required');
    });
  });

  // Get all lending positions test
  describe('GET /api/lend', () => {
    it('should return all lending positions', async () => {
      const response = await request(app)
        .get('/api/lend')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get specific lending position test
  describe('GET /api/lend/:positionId', () => {
    it('should return specific lending position', async () => {
      // First create a lending position
      const lendData = {
        asset: 'ETH',
        amount: 1,
        wallet: '0x123456789'
      };

      const lendResponse = await request(app)
        .post('/api/lend')
        .send(lendData);

      const positionId = lendResponse.body.data.id;

      // Then fetch it
      const response = await request(app)
        .get(`/api/lend/${positionId}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(positionId);
    });

    it('should return 404 for non-existent lending position', async () => {
      const response = await request(app)
        .get('/api/lend/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('Lending position not found');
    });
  });

  // Create a new lending position test
  describe('POST /api/lend', () => {
    it('should create a new lending position', async () => {
      const lendData = {
        asset: 'ETH',
        amount: 1,
        wallet: '0x123456789',
        duration: '60d'
      };

      const response = await request(app)
        .post('/api/lend')
        .send(lendData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.asset).toBe('ETH');
      expect(response.body.data.amount).toBe(1);
      expect(response.body.data.wallet).toBe('0x123456789');
      expect(response.body.data.status).toBe('active');
    });

    it('should return 400 for missing required fields', async () => {
      const lendData = {
        asset: 'ETH',
        amount: 1
        // Missing wallet
      };

      const response = await request(app)
        .post('/api/lend')
        .send(lendData)
        .expect(400);
      
      expect(response.body.error).toBe('Asset, amount, and wallet are required');
    });

    it('should return 404 for non-existent asset pool', async () => {
      const lendData = {
        asset: 'NONEXISTENT',
        amount: 1,
        wallet: '0x123456789'
      };

      const response = await request(app)
        .post('/api/lend')
        .send(lendData)
        .expect(404);
      
      expect(response.body.error).toBe('Active lending pool not found for this asset');
    });
  });

  // Update lending position test
  describe('PUT /api/lend/:positionId', () => {
    let positionId;

    beforeAll(async () => {
      // Create a lending position first
      const lendData = {
        asset: 'BTC',
        amount: 0.1,
        wallet: '0x987654321'
      };

      const response = await request(app)
        .post('/api/lend')
        .send(lendData);

      positionId = response.body.data.id;
    });

    it('should update lending position', async () => {
      const updateData = {
        status: 'closed'
      };

      const response = await request(app)
        .put(`/api/lend/${positionId}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('closed');
    });

    it('should return 404 for non-existent lending position', async () => {
      const updateData = {
        status: 'closed'
      };

      const response = await request(app)
        .put('/api/lend/non-existent')
        .send(updateData)
        .expect(404);
      
      expect(response.body.error).toBe('Lending position not found');
    });
  });

  // Get all borrowing positions test
  describe('GET /api/borrow', () => {
    it('should return all borrowing positions', async () => {
      const response = await request(app)
        .get('/api/borrow')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(0);
    });
  });

  // Get specific borrowing position test
  describe('GET /api/borrow/:positionId', () => {
    it('should return specific borrowing position', async () => {
      // First create a borrowing position
      const borrowData = {
        asset: 'ETH',
        amount: 0.5,
        collateral: 'BTC',
        wallet: '0x123456789'
      };

      const borrowResponse = await request(app)
        .post('/api/borrow')
        .send(borrowData);

      const positionId = borrowResponse.body.data.id;

      // Then fetch it
      const response = await request(app)
        .get(`/api/borrow/${positionId}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(positionId);
    });

    it('should return 404 for non-existent borrowing position', async () => {
      const response = await request(app)
        .get('/api/borrow/non-existent')
        .expect(404);
      
      expect(response.body.error).toBe('Borrowing position not found');
    });
  });

  // Create a new borrowing position test
  describe('POST /api/borrow', () => {
    it('should create a new borrowing position', async () => {
      const borrowData = {
        asset: 'ETH',
        amount: 0.5,
        collateral: 'BTC',
        wallet: '0x123456789',
        duration: '45d'
      };

      const response = await request(app)
        .post('/api/borrow')
        .send(borrowData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.asset).toBe('ETH');
      expect(response.body.data.amount).toBe(0.5);
      expect(response.body.data.collateral).toBe('BTC');
      expect(response.body.data.wallet).toBe('0x123456789');
      expect(response.body.data.status).toBe('active');
    });

    it('should return 400 for missing required fields', async () => {
      const borrowData = {
        asset: 'ETH',
        amount: 0.5,
        collateral: 'BTC'
        // Missing wallet
      };

      const response = await request(app)
        .post('/api/borrow')
        .send(borrowData)
        .expect(400);
      
      expect(response.body.error).toBe('Asset, amount, collateral, and wallet are required');
    });

    it('should return 404 for non-existent asset pool', async () => {
      const borrowData = {
        asset: 'NONEXISTENT',
        amount: 0.5,
        collateral: 'BTC',
        wallet: '0x123456789'
      };

      const response = await request(app)
        .post('/api/borrow')
        .send(borrowData)
        .expect(404);
      
      expect(response.body.error).toBe('Active lending pool not found for this asset');
    });
  });

  // Update borrowing position test
  describe('PUT /api/borrow/:positionId', () => {
    let positionId;

    beforeAll(async () => {
      // Create a borrowing position first
      const borrowData = {
        asset: 'BTC',
        amount: 0.05,
        collateral: 'ETH',
        wallet: '0x987654321'
      };

      const response = await request(app)
        .post('/api/borrow')
        .send(borrowData);

      positionId = response.body.data.id;
    });

    it('should update borrowing position', async () => {
      const updateData = {
        status: 'closed'
      };

      const response = await request(app)
        .put(`/api/borrow/${positionId}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('closed');
    });

    it('should return 404 for non-existent borrowing position', async () => {
      const updateData = {
        status: 'closed'
      };

      const response = await request(app)
        .put('/api/borrow/non-existent')
        .send(updateData)
        .expect(404);
      
      expect(response.body.error).toBe('Borrowing position not found');
    });
  });
});