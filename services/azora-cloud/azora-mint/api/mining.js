const express = require('express');
const router = express.Router();
const miningEngine = require('../engines/mining-engine');
const walletManager = require('../engines/wallet-manager');
const economicPolicy = require('../engines/economic-policy');

router.post('/mine', async (req, res) => {
  try {
    const { userId, activity } = req.body;
    const result = await miningEngine.mine(userId, activity);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats/:userId', (req, res) => {
  const stats = miningEngine.getMiningStats(req.params.userId);
  res.json(stats);
});

router.get('/stats/global', (req, res) => {
  const stats = miningEngine.getGlobalMiningStats();
  res.json(stats);
});

router.get('/wallet/:userId', (req, res) => {
  const wallet = walletManager.getWallet(req.params.userId);
  res.json(wallet);
});

router.post('/transfer', (req, res) => {
  const { from, to, currency, amount } = req.body;
  const result = walletManager.transfer(from, to, currency, amount);
  res.json(result);
});

router.get('/transactions/:userId', (req, res) => {
  const history = walletManager.getTransactionHistory(req.params.userId);
  res.json(history);
});

router.post('/ubi/distribute', (req, res) => {
  const { users } = req.body;
  const result = economicPolicy.distributeUBI(users);
  res.json(result);
});

router.get('/economy/health', (req, res) => {
  const { metrics } = req.query;
  const health = economicPolicy.monitorEconomy(JSON.parse(metrics || '{}'));
  res.json(health);
});

module.exports = router;
