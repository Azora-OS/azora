const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
// Import the enhanced BlockchainService
const { BlockchainService } = require('./src/export');

const app = express();
const PORT = process.env.PORT || 4009;

const blockchain = new BlockchainService();

// Initialize blockchain service and verify contracts
blockchain.initialize().catch(console.error);

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
    philosophy: 'Ngiyakwazi ngoba sikwazi - I can because we can',
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

// AZR Token Routes
app.post('/api/token/mint', async (req, res) => {
  try {
    const { to, knowledgeProof, knowledgeLevel } = req.body;
    const txHash = await blockchain.mintAZR(to, knowledgeProof, knowledgeLevel);
    res.json({ success: true, txHash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/token/transfer', async (req, res) => {
  try {
    const { to, amount } = req.body;
    const txHash = await blockchain.transferAZR(to, amount);
    res.json({ success: true, txHash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/token/balance/:address', async (req, res) => {
  try {
    const balance = await blockchain.getAZRBalance(req.params.address);
    res.json({ address: req.params.address, balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/token/total-supply', async (req, res) => {
  try {
    const totalSupply = await blockchain.getAZRTotalSupply();
    res.json({ totalSupply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NFT Certificate Routes
app.post('/api/nft/certificate', async (req, res) => {
  try {
    const { student, courseId, studentId, score, metadataUri } = req.body;
    const result = await blockchain.mintCertificate(student, courseId, studentId, score, metadataUri);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/nft/owner/:tokenId', async (req, res) => {
  try {
    const owner = await blockchain.getCertificateOwner(req.params.tokenId);
    res.json({ tokenId: req.params.tokenId, owner });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/nft/metadata/:tokenId', async (req, res) => {
  try {
    const metadata = await blockchain.getCertificateMetadata(req.params.tokenId);
    res.json({ tokenId: req.params.tokenId, metadata });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Default Ubuntu Routes
app.get('/api/status', (req, res) => {
  res.json({
    service: 'azora-blockchain',
    status: 'operational',
    ubuntu: 'Ubuntu service ready',
    contracts: {
      AZR: '✅ Connected',
      NFTCertificate: '✅ Connected'
    }
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
  console.log(`🚀 azora-blockchain running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I serve because we prosper together!"');
});