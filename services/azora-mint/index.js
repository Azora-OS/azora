const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const ProofOfKnowledgeEngine = require('./pok-engine');
const EconomicPolicyEngine = require('./economic-policy');
const TokenMinter = require('./token-minter');

const app = express();
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

const pokEngine = new ProofOfKnowledgeEngine();
const economicPolicy = new EconomicPolicyEngine();
const tokenMinter = new TokenMinter(economicPolicy);

// Wallet Management
app.post('/api/wallet/create', (req, res) => {
  const { userId } = req.body;
  const wallet = tokenMinter.createWallet(userId);
  res.json({ success: true, wallet });
});

app.get('/api/wallet/:address', (req, res) => {
  const wallet = tokenMinter.getWallet(req.params.address);
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
  res.json({ wallet });
});

app.get('/api/wallet/:address/balance', (req, res) => {
  const balance = tokenMinter.getBalance(req.params.address);
  if (!balance) return res.status(404).json({ error: 'Wallet not found' });
  res.json(balance);
});

// Proof-of-Knowledge Mining
app.post('/api/mining/challenge', (req, res) => {
  const { studentId, subject } = req.body;
  const challenge = pokEngine.generateChallenge(studentId, subject);
  res.json({ challenge });
});

app.post('/api/mining/submit', (req, res) => {
  const { challenge, answers, address, studentLevel = 1 } = req.body;
  const result = pokEngine.mine(challenge, answers, studentLevel);
  
  if (!result.success) return res.status(400).json(result);

  const mintResult = tokenMinter.mintReward(address, result.reward, 'proof-of-knowledge');
  res.json({ ...result, ...mintResult });
});

// Token Operations
app.post('/api/transfer', (req, res) => {
  const { from, to, amount } = req.body;
  const result = tokenMinter.transfer(from, to, amount);
  res.json(result);
});

app.post('/api/stake', (req, res) => {
  const { address, amount } = req.body;
  const result = tokenMinter.stake(address, amount);
  res.json(result);
});

app.post('/api/unstake', (req, res) => {
  const { address, amount } = req.body;
  const result = tokenMinter.unstake(address, amount);
  res.json(result);
});

app.post('/api/staking/reward', (req, res) => {
  const { address, days } = req.body;
  const wallet = tokenMinter.getWallet(address);
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
  
  const reward = economicPolicy.calculateStakingReward(wallet.staked, days);
  const mintResult = tokenMinter.mintReward(address, reward, 'staking-reward');
  res.json({ reward, ...mintResult });
});

// Economic Policy
app.get('/api/economics/stats', (req, res) => {
  res.json(economicPolicy.getEconomicStats());
});

app.get('/api/economics/ubi', (req, res) => {
  const { userCount = 1000 } = req.query;
  const ubi = economicPolicy.calculateUBI(parseInt(userCount));
  res.json(ubi);
});

app.post('/api/economics/adjust', (req, res) => {
  const { demand, supply } = req.body;
  const newRate = economicPolicy.adjustInflation({ demand, supply });
  res.json({ inflationRate: newRate });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'azora-mint',
    timestamp: new Date(),
    stats: {
      wallets: tokenMinter.wallets.size,
      supply: economicPolicy.currentSupply,
      maxSupply: economicPolicy.maxSupply
    }
  });
});

const PORT = process.env.PORT || 3080;
app.listen(PORT, () => console.log(`Azora Mint on ${PORT}`));
module.exports = app;
