const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const completeRoutes = require('./routes-complete');

const app = express();
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Use comprehensive routes
app.use(completeRoutes);

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


// Load our verification modules
const unCompliance = require('./un-compliance-integration');
const valuationVerification = require('./valuation-verification');
const institutionalVerification = require('./institutional-verification');

// Initialize modules
(async () => {
  await unCompliance.initialize();
  await valuationVerification.initialize();
  await institutionalVerification.initialize();
  
  // Schedule regular verifications
  setInterval(async () => {
    await unCompliance.applyCompliancePremium();
    await valuationVerification.verifyValuation();
    await institutionalVerification.verifyInvestments();
    console.log('Valuation verification completed');
  }, 5 * 60 * 1000); // Run every 5 minutes
})();

// Add additional endpoints for verification

// Get UN compliance report
app.get('/api/un-compliance', async (req, res) => {
  const report = await unCompliance.generateReport();
  res.json(report);
});

// Get valuation verification
app.get('/api/valuation-verification', async (req, res) => {
  const report = await valuationVerification.verifyValuation();
  res.json(report);
});

// Get valuation certificate
app.get('/api/valuation-certificate', async (req, res) => {
  const certificate = await valuationVerification.generateValuationCertificate();
  res.send(certificate);
});

// Get institutional investment verification
app.get('/api/investment-verification', async (req, res) => {
  const report = await institutionalVerification.generateReport();
  res.send(report);
});

// Provide a full system valuation report
app.get('/api/full-valuation-report', async (req, res) => {
  try {
    const valuationData = await valuationVerification.verifyValuation();
    const complianceData = await unCompliance.generateReport();
    
    const fullReport = {
      timestamp: new Date().toISOString(),
      valuation: {
        current: valuationData.currentValuation,
        target: valuationData.targetValuation,
        percentage: valuationData.valuationPercentage,
        verified: valuationData.isVerified,
        statement: valuationData.statement
      },
      compliance: {
        status: complianceData.status,
        frameworkCompliance: complianceData.framework,
        valuationImpact: {
          premium: complianceData.adjustedMarketCap - complianceData.marketCap,
          percentage: ((complianceData.adjustedMarketCap / complianceData.marketCap) - 1) * 100
        }
      },
      metrics: {
        tokenPrice: valuationData.verificationDetails.price.current,
        marketCap: valuationData.currentValuation,
        institutionalInvestment: valuationData.verificationDetails.institutionalInvestment.total,
        tradingVolume: valuationData.verificationDetails.liquidity.tradingVolume,
        priceStability: valuationData.verificationDetails.stability.coefficient * 100
      },
      conclusion: valuationData.isVerified 
        ? `Azora OS has been verified to be worth $10 million based on market activity, institutional investment, and UN compliance standards.`
        : `Azora OS is currently valued at $${(valuationData.currentValuation / 1000000).toFixed(1)} million and is working toward full $10 million verification.`
    };
    
    res.json(fullReport);
  } catch (err) {
    console.error('Error generating full valuation report:', err);
    res.status(500).json({ error: 'Failed to generate full valuation report' });
  }
});

const PORT = process.env.PORT || 3080;
app.listen(PORT, () => console.log(`Azora Mint on ${PORT}`));
module.exports = app;
