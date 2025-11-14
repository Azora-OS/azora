const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class AzoraTreasury {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3055;
    this.reserves = new Map();
    this.allocations = [];
    this.initializeReserves();
    this.setupMiddleware();
    this.setupRoutes();
  }

  initializeReserves() {
    this.reserves.set('AZR', { amount: 1000000, locked: 500000, available: 500000 });
    this.reserves.set('USD', { amount: 100000, locked: 20000, available: 80000 });
    this.reserves.set('BTC', { amount: 10, locked: 2, available: 8 });
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'azora-treasury', reserves: this.reserves.size });
    });

    this.app.get('/api/reserves', this.getReserves.bind(this));
    this.app.post('/api/allocate', this.allocateFunds.bind(this));
    this.app.get('/api/allocations', this.getAllocations.bind(this));
    this.app.post('/api/reserves/add', this.addReserves.bind(this));
  }

  getReserves(req, res) {
    const reserves = Array.from(this.reserves.entries()).map(([currency, data]) => ({ currency, ...data }));
    const total = reserves.reduce((sum, r) => sum + r.amount, 0);
    res.json({ reserves, totalValue: total });
  }

  allocateFunds(req, res) {
    const { currency, amount, purpose, recipient } = req.body;
    const reserve = this.reserves.get(currency);
    
    if (!reserve || reserve.available < amount) {
      return res.status(400).json({ error: 'Insufficient reserves' });
    }

    reserve.available -= amount;
    reserve.locked += amount;

    const allocation = {
      id: `alloc_${Date.now()}`,
      currency,
      amount,
      purpose,
      recipient,
      status: 'allocated',
      timestamp: new Date()
    };

    this.allocations.push(allocation);
    res.json({ success: true, allocation });
  }

  getAllocations(req, res) {
    res.json({ allocations: this.allocations.slice(-50), total: this.allocations.length });
  }

  addReserves(req, res) {
    const { currency, amount } = req.body;
    const reserve = this.reserves.get(currency) || { amount: 0, locked: 0, available: 0 };
    
    reserve.amount += amount;
    reserve.available += amount;
    this.reserves.set(currency, reserve);

    res.json({ success: true, reserve });
  }

  listen() {
    this.app.listen(this.port, () => console.log(`Azora Treasury on port ${this.port}`));
  }
}

const service = new AzoraTreasury();
if (require.main === module) service.listen();
module.exports = service.app;
