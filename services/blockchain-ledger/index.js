const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class BlockchainLedger {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3063;
    this.data = new Map();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'blockchain-ledger', timestamp: new Date().toISOString(), items: this.data.size });
    });

    this.app.post('/api/blockchain-ledger', this.createTransaction.bind(this));
    this.app.get('/api/blockchain-ledger', this.getBalance.bind(this));
    this.app.get('/api/blockchain-ledger', this.getHistory.bind(this));
  }

  createTransaction(req, res) {
    const id = Date.now().toString();
    const item = { id, ...req.body, createdAt: new Date() };
    this.data.set(id, item);
    res.status(201).json(item);
  }

  getBalance(req, res) {
    const id = Date.now().toString();
    const item = { id, ...req.body, createdAt: new Date() };
    this.data.set(id, item);
    res.status(201).json(item);
  }

  getHistory(req, res) {
    const id = Date.now().toString();
    const item = { id, ...req.body, createdAt: new Date() };
    this.data.set(id, item);
    res.status(201).json(item);
  }

  start() {
    this.app.listen(this.port, () => console.log(`blockchain-ledger running on port ${this.port}`));
  }
}

const service = new BlockchainLedger();
if (require.main === module) service.start();
module.exports = service;
