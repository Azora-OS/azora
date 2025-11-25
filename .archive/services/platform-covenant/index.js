const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class PlatformCovenant {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3081;
    this.blocks = [];
    this.contracts = new Map();
    this.transactions = [];
    this.setupMiddleware();
    this.setupRoutes();
    this.initGenesis();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'platform-covenant', timestamp: new Date().toISOString(), blocks: this.blocks.length });
    });

    this.app.post('/api/covenant/contracts', (req, res) => {
      const id = Date.now().toString();
      const contract = { id, ...req.body, deployed: true, deployedAt: new Date() };
      this.contracts.set(id, contract);
      res.status(201).json(contract);
    });

    this.app.get('/api/covenant/contracts/:id', (req, res) => {
      const contract = this.contracts.get(req.params.id);
      if (!contract) return res.status(404).json({ error: 'Contract not found' });
      res.json(contract);
    });

    this.app.post('/api/covenant/transactions', (req, res) => {
      const tx = { id: Date.now().toString(), ...req.body, timestamp: new Date() };
      this.transactions.push(tx);
      if (this.transactions.length >= 10) this.mineBlock();
      res.json(tx);
    });

    this.app.get('/api/covenant/blocks', (req, res) => {
      res.json({ blocks: this.blocks, height: this.blocks.length });
    });

    this.app.get('/api/covenant/blocks/:index', (req, res) => {
      const block = this.blocks[parseInt(req.params.index)];
      if (!block) return res.status(404).json({ error: 'Block not found' });
      res.json(block);
    });
  }

  initGenesis() {
    this.blocks.push({
      index: 0,
      timestamp: new Date(),
      transactions: [],
      previousHash: '0',
      hash: this.calculateHash(0, new Date(), [], '0')
    });
  }

  mineBlock() {
    const index = this.blocks.length;
    const previousHash = this.blocks[index - 1].hash;
    const timestamp = new Date();
    const transactions = this.transactions.splice(0, 10);
    const hash = this.calculateHash(index, timestamp, transactions, previousHash);
    this.blocks.push({ index, timestamp, transactions, previousHash, hash });
  }

  calculateHash(index, timestamp, transactions, previousHash) {
    return `${index}${timestamp}${JSON.stringify(transactions)}${previousHash}`.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0).toString(16);
  }

  start() {
    this.app.listen(this.port, () => console.log(`Platform Covenant running on port ${this.port}`));
  }
}

const service = new PlatformCovenant();
if (require.main === module) service.start();
module.exports = service;
