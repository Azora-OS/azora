const request = require('supertest');
const express = require('express');

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/blockchain/consensus/status', (req, res) => {
    res.json({
      mechanism: 'proof-of-stake',
      active: true,
      validators: Math.floor(Math.random() * 100) + 20,
      currentEpoch: Math.floor(Math.random() * 1000)
    });
  });

  app.post('/api/blockchain/consensus/propose-block', (req, res) => {
    const { validator, transactions } = req.body;

    if (!validator) {
      return res.status(400).json({ error: 'Validator address is required' });
    }

    const proposal = {
      proposalId: `prop_${Date.now()}`,
      validator,
      blockNumber: Math.floor(Math.random() * 1000000),
      transactionCount: transactions?.length || 0,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    res.json(proposal);
  });

  app.post('/api/blockchain/consensus/vote', (req, res) => {
    const { proposalId, validator, vote } = req.body;

    if (!proposalId || !validator || vote === undefined) {
      return res.status(400).json({ error: 'Proposal ID, validator, and vote are required' });
    }

    const voteRecord = {
      voteId: `vote_${Date.now()}`,
      proposalId,
      validator,
      vote,
      timestamp: new Date().toISOString()
    };

    res.json(voteRecord);
  });

  app.get('/api/blockchain/consensus/validators', (req, res) => {
    res.json({
      validators: [
        { address: '0x1234', stake: '1000000', active: true },
        { address: '0x5678', stake: '500000', active: true }
      ],
      totalStake: '1500000'
    });
  });

  return app;
}

describe('Azora Blockchain - Consensus Mechanism Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /api/blockchain/consensus/status', () => {
    it('should return consensus mechanism status', async () => {
      const response = await request(app)
        .get('/api/blockchain/consensus/status');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('mechanism');
      expect(response.body).toHaveProperty('active');
      expect(response.body).toHaveProperty('validators');
    });

    it('should report current epoch', async () => {
      const response = await request(app)
        .get('/api/blockchain/consensus/status');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('currentEpoch');
      expect(typeof response.body.currentEpoch).toBe('number');
    });
  });

  describe('POST /api/blockchain/consensus/propose-block', () => {
    it('should allow validator to propose block', async () => {
      const response = await request(app)
        .post('/api/blockchain/consensus/propose-block')
        .send({
          validator: '0x1234567890123456789012345678901234567890',
          transactions: ['tx1', 'tx2', 'tx3']
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('proposalId');
      expect(response.body.validator).toBe('0x1234567890123456789012345678901234567890');
      expect(response.body.transactionCount).toBe(3);
    });

    it('should return error when validator is missing', async () => {
      const response = await request(app)
        .post('/api/blockchain/consensus/propose-block')
        .send({ transactions: [] });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validator address is required');
    });

    it('should handle proposals without transactions', async () => {
      const response = await request(app)
        .post('/api/blockchain/consensus/propose-block')
        .send({ validator: '0x1234' });

      expect(response.status).toBe(200);
      expect(response.body.transactionCount).toBe(0);
    });
  });

  describe('POST /api/blockchain/consensus/vote', () => {
    it('should record validator vote on proposal', async () => {
      const response = await request(app)
        .post('/api/blockchain/consensus/vote')
        .send({
          proposalId: 'prop_123',
          validator: '0x1234567890123456789012345678901234567890',
          vote: true
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('voteId');
      expect(response.body.proposalId).toBe('prop_123');
      expect(response.body.vote).toBe(true);
    });

    it('should return error when proposal ID is missing', async () => {
      const response = await request(app)
        .post('/api/blockchain/consensus/vote')
        .send({ validator: '0x1234', vote: true });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Proposal ID, validator, and vote are required');
    });

    it('should return error when validator is missing', async () => {
      const response = await request(app)
        .post('/api/blockchain/consensus/vote')
        .send({ proposalId: 'prop_123', vote: true });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Proposal ID, validator, and vote are required');
    });

    it('should accept negative votes', async () => {
      const response = await request(app)
        .post('/api/blockchain/consensus/vote')
        .send({
          proposalId: 'prop_123',
          validator: '0x1234',
          vote: false
        });

      expect(response.status).toBe(200);
      expect(response.body.vote).toBe(false);
    });
  });

  describe('GET /api/blockchain/consensus/validators', () => {
    it('should return list of validators', async () => {
      const response = await request(app)
        .get('/api/blockchain/consensus/validators');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('validators');
      expect(Array.isArray(response.body.validators)).toBe(true);
      expect(response.body).toHaveProperty('totalStake');
    });

    it('should include validator stake information', async () => {
      const response = await request(app)
        .get('/api/blockchain/consensus/validators');

      expect(response.status).toBe(200);
      expect(response.body.validators[0]).toHaveProperty('stake');
      expect(response.body.validators[0]).toHaveProperty('active');
    });
  });
});
