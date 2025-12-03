const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const UbuntuContractIntegration = require('./src/contract-integration');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4009;

// Initialize Ubuntu Blockchain Integration
const blockchain = new UbuntuContractIntegration();

// Ubuntu Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}));
app.use(express.json());

// Ubuntu Rate Limiting
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Ubuntu rate limit exceeded', ubuntu: 'Please slow down for community harmony' }
});
app.use(ubuntuLimiter);

// Ubuntu Health Check
app.get('/health', (req, res) => {
  res.json({
    service: 'azora-blockchain',
    status: 'healthy',
    ubuntu: 'I serve because we prosper together',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I am because we are',
    principles: [
      'My success enables your success',
      'My knowledge becomes our knowledge',
      'My work strengthens our foundation',
      'My security ensures our freedom'
    ],
    service: 'azora-blockchain',
    ubuntu: 'Ubuntu service excellence'
  });
});

// Service-specific routes

// Blockchain Integration Routes
app.get('/api/contracts/health', async (req, res) => {
  try {
    const health = await blockchain.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      ubuntu: 'Ubuntu blockchain integration facing challenges'
    });
  }
});

// Mint knowledge tokens
app.post('/api/contracts/mint', async (req, res) => {
  try {
    const { userAddress, knowledgeProof, contributionAmount } = req.body;
    
    if (!userAddress || !knowledgeProof) {
      return res.status(400).json({
        error: 'Missing userAddress or knowledgeProof',
        ubuntu: 'Ubuntu mining requires honest participation'
      });
    }

    const result = await blockchain.mintKnowledgeTokens(userAddress, knowledgeProof, contributionAmount || 5);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      ubuntu: 'Ubuntu mining handles challenges with collective wisdom'
    });
  }
});

// Get token balance
app.get('/api/contracts/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const balance = await blockchain.getTokenBalance(address);
    res.json(balance);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      ubuntu: 'Ubuntu balance check requires patience'
    });
  }
});

// Transfer tokens
app.post('/api/contracts/transfer', async (req, res) => {
  try {
    const { fromAddress, toAddress, amount, purpose } = req.body;
    
    if (!fromAddress || !toAddress || !amount) {
      return res.status(400).json({
        error: 'Missing fromAddress, toAddress, or amount',
        ubuntu: 'Ubuntu transfers require complete information'
      });
    }

    const result = await blockchain.transferTokens(fromAddress, toAddress, amount, purpose);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      ubuntu: 'Ubuntu transfers require collective harmony'
    });
  }
});

// Network statistics
app.get('/api/contracts/stats', async (req, res) => {
  try {
    const stats = await blockchain.getNetworkStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      ubuntu: 'Ubuntu network statistics temporarily unavailable'
    });
  }
});

// Default Ubuntu Routes
app.get('/api/status', (req, res) => {
  res.json({
    service: 'azora-blockchain',
    status: 'operational',
    ubuntu: 'Ubuntu service ready'
  });
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  console.error('Ubuntu Service Error:', error);
  res.status(500).json({
    error: 'Ubuntu service error',
    ubuntu: 'We handle errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// Start Ubuntu Service
app.listen(PORT, () => {
  console.log(`🚀 ${serviceName} running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I serve because we prosper together!"');
});