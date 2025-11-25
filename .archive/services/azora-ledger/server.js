const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class AzoraLedgerService {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3053;
    this.transactions = new Map();
    this.balances = new Map();
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
      res.json({ status: 'healthy', service: 'azora-ledger', transactions: this.transactions.size });
    });

    this.app.post('/api/transactions', this.createTransaction.bind(this));
    this.app.get('/api/transactions/:id', this.getTransaction.bind(this));
    this.app.get('/api/balances/:userId', this.getBalance.bind(this));
    this.app.get('/api/transactions/user/:userId', this.getUserTransactions.bind(this));
  }

  createTransaction(req, res) {
    const { from, to, amount, currency, type, metadata } = req.body;
    const txId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const transaction = {
      id: txId,
      from,
      to,
      amount,
      currency: currency || 'AZR',
      type: type || 'transfer',
      status: 'completed',
      metadata,
      timestamp: new Date(),
      blockNumber: Math.floor(Math.random() * 1000000)
    };

    this.transactions.set(txId, transaction);
    this.updateBalances(from, to, amount, currency);
    
    res.status(201).json({ success: true, transaction });
  }

  updateBalances(from, to, amount, currency) {
    if (from) {
      const key = `${from}_${currency}`;
      this.balances.set(key, (this.balances.get(key) || 0) - amount);
    }
    if (to) {
      const key = `${to}_${currency}`;
      this.balances.set(key, (this.balances.get(key) || 0) + amount);
    }
  }

  getTransaction(req, res) {
    const tx = this.transactions.get(req.params.id);
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    res.json(tx);
  }

  getBalance(req, res) {
    const { userId } = req.params;
    const { currency = 'AZR' } = req.query;
    const balance = this.balances.get(`${userId}_${currency}`) || 0;
    res.json({ userId, currency, balance });
  }

  getUserTransactions(req, res) {
    const { userId } = req.params;
    const userTxs = Array.from(this.transactions.values())
      .filter(tx => tx.from === userId || tx.to === userId)
      .sort((a, b) => b.timestamp - a.timestamp);
    res.json({ transactions: userTxs, count: userTxs.length });
  }

  listen() {
    this.app.listen(this.port, () => console.log(`Azora Ledger on port ${this.port}`));
  }
}

const service = new AzoraLedgerService();
if (require.main === module) service.listen();
module.exports = service.app;
