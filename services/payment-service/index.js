const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3039;

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// In-memory storage (replace with database in production)
const transactions = new Map();
const wallets = new Map();

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'payment-service', timestamp: new Date().toISOString() });
});

// Create payment
app.post('/api/payments', async (req, res) => {
  try {
    const { userId, amount, currency, method, description } = req.body;
    
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment data' });
    }

    const transactionId = `TXN-${crypto.randomUUID()}`;
    const transaction = {
      transactionId,
      userId,
      amount,
      currency: currency || 'ZAR',
      method: method || 'card',
      description,
      status: 'pending',
      createdAt: new Date()
    };

    transactions.set(transactionId, transaction);
    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction
app.get('/api/payments/:transactionId', (req, res) => {
  const transaction = transactions.get(req.params.transactionId);
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  res.json({ transaction });
});

// Get user transactions
app.get('/api/payments/user/:userId', (req, res) => {
  const userTransactions = Array.from(transactions.values())
    .filter(t => t.userId === req.params.userId);
  res.json({ transactions: userTransactions });
});

// Process payment
app.post('/api/payments/:transactionId/process', async (req, res) => {
  try {
    const transaction = transactions.get(req.params.transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    transaction.status = 'completed';
    transaction.completedAt = new Date();
    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refund payment
app.post('/api/payments/:transactionId/refund', async (req, res) => {
  try {
    const transaction = transactions.get(req.params.transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'completed') {
      return res.status(400).json({ error: 'Can only refund completed transactions' });
    }

    transaction.status = 'refunded';
    transaction.refundedAt = new Date();
    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get wallet balance
app.get('/api/wallet/:userId/balance', (req, res) => {
  const wallet = wallets.get(req.params.userId) || { balance: 0, currency: 'ZAR' };
  res.json({ wallet });
});

app.listen(PORT, () => console.log(`💳 payment-service running on port ${PORT}`));

module.exports = app;
