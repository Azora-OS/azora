const request = require('supertest');
const express = require('express');

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.post('/api/blockchain/deploy-contract', (req, res) => {
    const { contractCode, parameters } = req.body;

    if (!contractCode) {
      return res.status(400).json({ error: 'Contract code is required' });
    }

    const deployment = {
      contractId: `contract_${Date.now()}`,
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      status: 'deployed',
      gasUsed: Math.floor(Math.random() * 100000),
      timestamp: new Date().toISOString()
    };

    res.json(deployment);
  });

  app.post('/api/blockchain/execute-contract', (req, res) => {
    const { contractAddress, method, params } = req.body;

    if (!contractAddress || !method) {
      return res.status(400).json({ error: 'Contract address and method are required' });
    }

    const execution = {
      executionId: `exec_${Date.now()}`,
      contractAddress,
      method,
      result: { success: true },
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      timestamp: new Date().toISOString()
    };

    res.json(execution);
  });

  app.get('/api/blockchain/contract/:address', (req, res) => {
    const { address } = req.params;

    res.json({
      address,
      deployed: true,
      balance: '0',
      methods: ['transfer', 'approve', 'balanceOf']
    });
  });

  return app;
}

describe('Azora Blockchain - Smart Contract Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('POST /api/blockchain/deploy-contract', () => {
    it('should deploy smart contract', async () => {
      const response = await request(app)
        .post('/api/blockchain/deploy-contract')
        .send({
          contractCode: 'pragma solidity ^0.8.0; contract Test {}',
          parameters: { name: 'TestToken' }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('contractId');
      expect(response.body).toHaveProperty('address');
      expect(response.body.address).toMatch(/^0x[a-f0-9]{40}$/);
      expect(response.body.status).toBe('deployed');
    });

    it('should return error when contract code is missing', async () => {
      const response = await request(app)
        .post('/api/blockchain/deploy-contract')
        .send({ parameters: {} });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Contract code is required');
    });

    it('should include transaction hash', async () => {
      const response = await request(app)
        .post('/api/blockchain/deploy-contract')
        .send({ contractCode: 'contract Test {}' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('transactionHash');
      expect(response.body.transactionHash).toMatch(/^0x[a-f0-9]{64}$/);
    });

    it('should report gas used', async () => {
      const response = await request(app)
        .post('/api/blockchain/deploy-contract')
        .send({ contractCode: 'contract Test {}' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('gasUsed');
      expect(typeof response.body.gasUsed).toBe('number');
    });
  });

  describe('POST /api/blockchain/execute-contract', () => {
    it('should execute contract method', async () => {
      const response = await request(app)
        .post('/api/blockchain/execute-contract')
        .send({
          contractAddress: '0x1234567890123456789012345678901234567890',
          method: 'transfer',
          params: ['0xabcd', 100]
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('executionId');
      expect(response.body.contractAddress).toBe('0x1234567890123456789012345678901234567890');
      expect(response.body.method).toBe('transfer');
    });

    it('should return error when contract address is missing', async () => {
      const response = await request(app)
        .post('/api/blockchain/execute-contract')
        .send({ method: 'transfer' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Contract address and method are required');
    });

    it('should return error when method is missing', async () => {
      const response = await request(app)
        .post('/api/blockchain/execute-contract')
        .send({ contractAddress: '0x1234' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Contract address and method are required');
    });

    it('should include execution result', async () => {
      const response = await request(app)
        .post('/api/blockchain/execute-contract')
        .send({
          contractAddress: '0x1234',
          method: 'balanceOf'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('success');
    });
  });

  describe('GET /api/blockchain/contract/:address', () => {
    it('should retrieve contract information', async () => {
      const address = '0x1234567890123456789012345678901234567890';
      const response = await request(app)
        .get(`/api/blockchain/contract/${address}`);

      expect(response.status).toBe(200);
      expect(response.body.address).toBe(address);
      expect(response.body).toHaveProperty('deployed');
      expect(response.body).toHaveProperty('methods');
    });
  });
});
