require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());

class AzoraMint {
  constructor() {
    this.wallets = new Map();
    this.transactions = [];
    this.miningRecords = [];
    this.exchangeRates = { AZR: 1, USD: 0.05, BTC: 0.0000012, ETH: 0.000025 };
    this.totalSupply = { AZR: 1000000, circulating: 250000 };
  }

  getOrCreateWallet(userId) {
    if (!this.wallets.has(userId)) {
      this.wallets.set(userId, {
        userId,
        balances: { AZR: 0, USD: 0, BTC: 0, ETH: 0 },
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        createdAt: new Date(),
        totalEarned: 0,
        totalSpent: 0
      });
    }
    return this.wallets.get(userId);
  }

  mine(userId, activity) {
    const rewards = {
      'course_complete': 50,
      'lesson_complete': 5,
      'quiz_pass': 10,
      'assignment_submit': 15,
      'peer_help': 8,
      'content_create': 25,
      'daily_login': 2
    };

    const baseReward = rewards[activity.type] || 1;
    const multiplier = activity.quality ? (activity.quality / 100) : 1;
    const reward = Math.round(baseReward * multiplier);

    const wallet = this.getOrCreateWallet(userId);
    wallet.balances.AZR += reward;
    wallet.totalEarned += reward;
    this.totalSupply.circulating += reward;

    const record = {
      id: `mine_${Date.now()}`,
      userId,
      activity: activity.type,
      reward,
      timestamp: new Date(),
      blockHeight: this.miningRecords.length + 1
    };
    this.miningRecords.push(record);

    this.addTransaction({
      from: 'system',
      to: userId,
      amount: reward,
      currency: 'AZR',
      type: 'mining',
      metadata: { activity: activity.type }
    });

    return { success: true, reward, balance: wallet.balances.AZR, record };
  }

  transfer(fromUserId, toUserId, amount, currency = 'AZR') {
    const fromWallet = this.getOrCreateWallet(fromUserId);
    const toWallet = this.getOrCreateWallet(toUserId);

    if (fromWallet.balances[currency] < amount) {
      throw new Error('Insufficient balance');
    }

    fromWallet.balances[currency] -= amount;
    toWallet.balances[currency] += amount;
    fromWallet.totalSpent += amount;

    const tx = this.addTransaction({
      from: fromUserId,
      to: toUserId,
      amount,
      currency,
      type: 'transfer'
    });

    return { success: true, transaction: tx, newBalance: fromWallet.balances[currency] };
  }

  convert(userId, fromCurrency, toCurrency, amount) {
    const wallet = this.getOrCreateWallet(userId);
    
    if (wallet.balances[fromCurrency] < amount) {
      throw new Error('Insufficient balance');
    }

    const fromRate = this.exchangeRates[fromCurrency];
    const toRate = this.exchangeRates[toCurrency];
    const convertedAmount = (amount * fromRate) / toRate;

    wallet.balances[fromCurrency] -= amount;
    wallet.balances[toCurrency] += convertedAmount;

    this.addTransaction({
      from: userId,
      to: userId,
      amount,
      currency: fromCurrency,
      type: 'conversion',
      metadata: { toCurrency, convertedAmount }
    });

    return { success: true, converted: convertedAmount, balances: wallet.balances };
  }

  addTransaction(txData) {
    const tx = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...txData,
      timestamp: new Date(),
      status: 'confirmed',
      hash: `0x${Math.random().toString(16).substr(2, 64)}`
    };
    this.transactions.push(tx);
    return tx;
  }

  getTransactionHistory(userId, limit = 50) {
    return this.transactions
      .filter(tx => tx.from === userId || tx.to === userId)
      .slice(-limit)
      .reverse();
  }

  getMiningStats(userId) {
    const wallet = this.getOrCreateWallet(userId);
    const userRecords = this.miningRecords.filter(r => r.userId === userId);
    
    return {
      totalMined: wallet.totalEarned,
      miningCount: userRecords.length,
      averageReward: userRecords.length > 0 
        ? Math.round(wallet.totalEarned / userRecords.length) 
        : 0,
      lastMined: userRecords[userRecords.length - 1]?.timestamp,
      rank: this.getUserRank(userId)
    };
  }

  getUserRank(userId) {
    const sorted = Array.from(this.wallets.values())
      .sort((a, b) => b.totalEarned - a.totalEarned);
    return sorted.findIndex(w => w.userId === userId) + 1;
  }

  getGlobalStats() {
    return {
      totalSupply: this.totalSupply.AZR,
      circulating: this.totalSupply.circulating,
      totalWallets: this.wallets.size,
      totalTransactions: this.transactions.length,
      totalMined: this.miningRecords.reduce((sum, r) => sum + r.reward, 0),
      exchangeRates: this.exchangeRates
    };
  }

  distributeUBI(userIds, amount = 10) {
    const distributions = [];
    for (const userId of userIds) {
      const wallet = this.getOrCreateWallet(userId);
      wallet.balances.AZR += amount;
      wallet.totalEarned += amount;
      
      this.addTransaction({
        from: 'system',
        to: userId,
        amount,
        currency: 'AZR',
        type: 'ubi'
      });
      
      distributions.push({ userId, amount });
    }
    return { success: true, distributed: distributions.length, totalAmount: amount * userIds.length };
  }
}

const mint = new AzoraMint();

// Wallet endpoints
app.get('/api/wallet/:userId', (req, res) => {
  try {
    const wallet = mint.getOrCreateWallet(req.params.userId);
    res.json({ success: true, data: wallet });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/wallet/:userId/balance', (req, res) => {
  try {
    const wallet = mint.getOrCreateWallet(req.params.userId);
    res.json({ success: true, data: { balances: wallet.balances, address: wallet.address } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Mining endpoints
app.post('/api/mine', (req, res) => {
  try {
    const { userId, activity } = req.body;
    if (!userId || !activity) {
      return res.status(400).json({ success: false, error: 'userId and activity required' });
    }
    const result = mint.mine(userId, activity);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/mining/stats/:userId', (req, res) => {
  try {
    const stats = mint.getMiningStats(req.params.userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/mining/stats', (req, res) => {
  try {
    const stats = mint.getGlobalStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Transaction endpoints
app.post('/api/transfer', (req, res) => {
  try {
    const { from, to, amount, currency } = req.body;
    if (!from || !to || !amount) {
      return res.status(400).json({ success: false, error: 'from, to, and amount required' });
    }
    const result = mint.transfer(from, to, parseFloat(amount), currency || 'AZR');
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/transactions/:userId', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = mint.getTransactionHistory(req.params.userId, limit);
    res.json({ success: true, data: history, count: history.length });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Currency conversion
app.post('/api/convert', (req, res) => {
  try {
    const { userId, from, to, amount } = req.body;
    if (!userId || !from || !to || !amount) {
      return res.status(400).json({ success: false, error: 'userId, from, to, and amount required' });
    }
    const result = mint.convert(userId, from, to, parseFloat(amount));
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/rates', (req, res) => {
  res.json({ success: true, data: mint.exchangeRates });
});

// UBI distribution
app.post('/api/ubi/distribute', (req, res) => {
  try {
    const { userIds, amount } = req.body;
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ success: false, error: 'userIds array required' });
    }
    const result = mint.distributeUBI(userIds, amount);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/health', (req, res) => {
  const stats = mint.getGlobalStats();
  res.json({ 
    status: 'healthy', 
    service: 'azora-mint',
    timestamp: new Date(),
    stats,
    version: '2.0.0'
  });
});

const PORT = process.env.PORT || 4020;
app.listen(PORT, () => {
  console.log(`💰 Azora Mint Service running on port ${PORT}`);
  console.log('⛏️ Proof-of-Knowledge mining, wallets, and UBI active');
});

module.exports = app;
