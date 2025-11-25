const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class PlatformMint {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3080;
    this.wallets = new Map();
    this.transactions = [];
    this.miningRewards = new Map();
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
      res.json({ status: 'healthy', service: 'platform-mint', timestamp: new Date().toISOString(), wallets: this.wallets.size });
    });

    this.app.post('/api/mint/wallets', (req, res) => {
      const { userId } = req.body;
      const wallet = { userId, balance: 0, currency: 'AZR', createdAt: new Date() };
      this.wallets.set(userId, wallet);
      res.status(201).json(wallet);
    });

    this.app.get('/api/mint/wallets/:userId', (req, res) => {
      const wallet = this.wallets.get(req.params.userId);
      if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
      res.json(wallet);
    });

    this.app.post('/api/mint/transactions', (req, res) => {
      const { from, to, amount } = req.body;
      const fromWallet = this.wallets.get(from);
      const toWallet = this.wallets.get(to);
      if (!fromWallet || !toWallet) return res.status(404).json({ error: 'Wallet not found' });
      if (fromWallet.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });
      fromWallet.balance -= amount;
      toWallet.balance += amount;
      const tx = { id: Date.now().toString(), from, to, amount, timestamp: new Date() };
      this.transactions.push(tx);
      res.json(tx);
    });

    this.app.post('/api/mint/mining/start', (req, res) => {
      const { userId } = req.body;
      const reward = Math.random() * 10;
      const wallet = this.wallets.get(userId);
      if (wallet) wallet.balance += reward;
      this.miningRewards.set(userId, (this.miningRewards.get(userId) || 0) + reward);
      res.json({ reward, totalEarned: this.miningRewards.get(userId) });
    });
  }

  start() {
    this.app.listen(this.port, () => console.log(`Platform Mint running on port ${this.port}`));
  }
}

const service = new PlatformMint();
if (require.main === module) service.start();
module.exports = service;
