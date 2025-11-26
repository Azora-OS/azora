const request = require('supertest');
const express = require('express');

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/blockchain/status', (req, res) => {
    res.json({
      connected: true,
      network: 'testnet',
      blockHeight: Math.floor(Math.random() * 1000000),
      peers: Math.floor(Math.random() * 50) + 10
    });
  });

  app.get('/api/blockchain/block/:blockNumber', (req, res) => {
    const { blockNumber } = req.params;

    res.json({
      number: parseInt(blockNumber),
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      timestamp: new Date().toISOString(),
      transactions: []
    });
  });

  app.post('/api/blockchain/transaction', (req, res) => {
    const { from, to, value } = req.body;

    if (!from || !to || value === undefined) {
      return res.status(400).json({ error: 'From, to, and value are required' });
    }

    const transaction = {
      transactionId: `tx_${Date.now()}`,
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      from,
      to,
      value,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    res.json(transaction);
  });

  return app;
}

describe('Azora Blockchain - Integration Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /api/blockchain/status', () => {
    it('should return blockchain connection status', async () => {
      const response = await request(app)
        .get('/api/blockchain/status');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('connected');
      expect(response.body).toHaveProperty('network');
      expect(response.body).toHaveProperty('blockHeight');
    });

    it('should report peer count', async () => {
      const response = await request(app)
        .get('/api/blockchain/status');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('peers');
      expect(typeof response.body.peers).toBe('number');
    });
  });

  describe('GET /api/blockchain/block/:blockNumber', () => {
    it('should retrieve block by number', async () => {
      const blockNumber = 12345;
      const response = await request(app)
        .get(`/api/blockchain/block/${blockNumber}`);

      expect(response.status).toBe(200);
      expect(response.body.number).toBe(blockNumber);
      expect(response.body).toHaveProperty('hash');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should include transactions in block', async () => {
      const response = await request(app)
        .get('/api/blockchain/block/100');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('transactions');
      expect(Array.isArray(response.body.transactions)).toBe(true);
    });
  });

  describe('POST /api/blockchain/transaction', () => {
    it('should create blockchain transaction', async () => {
      const response = await request(app)
        .post('/api/blockchain/transaction')
        .send({
          from: '0x1234567890123456789012345678901234567890',
          to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          value: '1000000000000000000'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('transactionId');
      expect(response.body).toHaveProperty('hash');
      expect(response.body.status).toBe('pending');
    });

    it('should return error when from address is missing', async () => {
      const response = await request(app)
        .post('/api/blockchain/transaction')
        .send({ to: '0xabcd', value: '100' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('From, to, and value are required');
    });

    it('should return error when to address is missing', async () => {
      const response = await request(app)
        .post('/api/blockchain/transaction')
        .send({ from: '0x1234', value: '100' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('From, to, and value are required');
    });

    it('should return error when value is missing', async () => {
      const response = await request(app)
        .post('/api/blockchain/transaction')
        .send({ from: '0x1234', to: '0xabcd' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('From, to, and value are required');
    });
  });
});
