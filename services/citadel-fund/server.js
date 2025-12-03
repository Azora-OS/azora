const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4010;

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
    service: 'citadel-fund',
    status: 'healthy',
    ubuntu: 'I collect because we prosper together',
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
    service: 'citadel-fund',
    ubuntu: 'Ubuntu prosperity through collective support'
  });
});

// Citadel Fund State
let citadelState = {
  totalCollected: '0.0',
  totalDistributed: '0.0',
  currentBalance: '0.0',
  scholarships: [],
  grants: [],
  publicGoods: [],
  transactions: []
};

// Revenue Collection (10% of all platform revenue)
app.post('/api/citadel/collect', async (req, res) => {
  try {
    const { amount, source, transactionId } = req.body;
    
    // Calculate 10% for Citadel Fund
    const citadelAmount = (parseFloat(amount) * 0.1).toString();
    
    const transaction = {
      id: 'citadel-' + Date.now(),
      source,
      originalAmount: amount,
      citadelAmount,
      percentage: '10%',
      timestamp: new Date().toISOString(),
      transactionId,
      type: 'collection'
    };
    
    citadelState.transactions.push(transaction);
    citadelState.totalCollected = (parseFloat(citadelState.totalCollected) + parseFloat(citadelAmount)).toString();
    citadelState.currentBalance = (parseFloat(citadelState.currentBalance) + parseFloat(citadelAmount)).toString();
    
    console.log(`💰 Citadel Fund: Collected ${citadelAmount} AZR from ${source}`);
    
    res.json({ 
      success: true, 
      transaction: {
        id: transaction.id,
        amount: citadelAmount,
        source,
        timestamp: transaction.timestamp
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scholarship Grants
app.post('/api/citadel/scholarship', async (req, res) => {
  try {
    const { student, amount, reason, courseType } = req.body;
    
    if (parseFloat(citadelState.currentBalance) < parseFloat(amount)) {
      return res.status(400).json({ error: 'Insufficient Citadel Fund balance' });
    }
    
    const scholarship = {
      id: 'scholarship-' + Date.now(),
      student,
      amount,
      reason,
      courseType,
      status: 'approved',
      timestamp: new Date().toISOString(),
      type: 'scholarship'
    };
    
    citadelState.scholarships.push(scholarship);
    citadelState.totalDistributed = (parseFloat(citadelState.totalDistributed) + parseFloat(amount)).toString();
    citadelState.currentBalance = (parseFloat(citadelState.currentBalance) - parseFloat(amount)).toString();
    
    const transaction = {
      id: 'tx-' + Date.now(),
      type: 'scholarship',
      recipient: student,
      amount,
      purpose: reason,
      timestamp: new Date().toISOString()
    };
    
    citadelState.transactions.push(transaction);
    
    console.log(`🎓 Citadel Fund: Granted ${amount} AZR scholarship to ${student}`);
    
    res.json({ 
      success: true, 
      scholarship: {
        id: scholarship.id,
        amount,
        student,
        status: 'approved',
        timestamp: scholarship.timestamp
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Community Grants
app.post('/api/citadel/grant', async (req, res) => {
  try {
    const { recipient, amount, purpose, projectType } = req.body;
    
    if (parseFloat(citadelState.currentBalance) < parseFloat(amount)) {
      return res.status(400).json({ error: 'Insufficient Citadel Fund balance' });
    }
    
    const grant = {
      id: 'grant-' + Date.now(),
      recipient,
      amount,
      purpose,
      projectType,
      status: 'approved',
      timestamp: new Date().toISOString(),
      type: 'grant'
    };
    
    citadelState.grants.push(grant);
    citadelState.totalDistributed = (parseFloat(citadelState.totalDistributed) + parseFloat(amount)).toString();
    citadelState.currentBalance = (parseFloat(citadelState.currentBalance) - parseFloat(amount)).toString();
    
    const transaction = {
      id: 'tx-' + Date.now(),
      type: 'grant',
      recipient,
      amount,
      purpose,
      timestamp: new Date().toISOString()
    };
    
    citadelState.transactions.push(transaction);
    
    console.log(`🌍 Citadel Fund: Granted ${amount} AZR to ${recipient} for ${purpose}`);
    
    res.json({ 
      success: true, 
      grant: {
        id: grant.id,
        amount,
        recipient,
        status: 'approved',
        timestamp: grant.timestamp
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public Goods Funding
app.post('/api/citadel/public-goods', async (req, res) => {
  try {
    const { project, amount, description, impact } = req.body;
    
    if (parseFloat(citadelState.currentBalance) < parseFloat(amount)) {
      return res.status(400).json({ error: 'Insufficient Citadel Fund balance' });
    }
    
    const publicGood = {
      id: 'public-' + Date.now(),
      project,
      amount,
      description,
      impact,
      status: 'funded',
      timestamp: new Date().toISOString(),
      type: 'public-good'
    };
    
    citadelState.publicGoods.push(publicGood);
    citadelState.totalDistributed = (parseFloat(citadelState.totalDistributed) + parseFloat(amount)).toString();
    citadelState.currentBalance = (parseFloat(citadelState.currentBalance) - parseFloat(amount)).toString();
    
    const transaction = {
      id: 'tx-' + Date.now(),
      type: 'public-good',
      project,
      amount,
      description,
      timestamp: new Date().toISOString()
    };
    
    citadelState.transactions.push(transaction);
    
    console.log(`🏛️ Citadel Fund: Funded ${amount} AZR for public good: ${project}`);
    
    res.json({ 
      success: true, 
      publicGood: {
        id: publicGood.id,
        amount,
        project,
        status: 'funded',
        timestamp: publicGood.timestamp
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Citadel Fund Balance and Stats
app.get('/api/citadel/balance', async (req, res) => {
  try {
    res.json({
      balance: citadelState.currentBalance,
      totalCollected: citadelState.totalCollected,
      totalDistributed: citadelState.totalDistributed,
      scholarships: citadelState.scholarships.length,
      grants: citadelState.grants.length,
      publicGoods: citadelState.publicGoods.length,
      ubuntu: 'Ubuntu prosperity through collective support'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Recent Transactions
app.get('/api/citadel/transactions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const transactions = citadelState.transactions
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
    
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Scholarships
app.get('/api/citadel/scholarships', async (req, res) => {
  try {
    const status = req.query.status || 'all';
    const scholarships = status === 'all' 
      ? citadelState.scholarships
      : citadelState.scholarships.filter(s => s.status === status);
    
    res.json({ scholarships });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Grants
app.get('/api/citadel/grants', async (req, res) => {
  try {
    const status = req.query.status || 'all';
    const grants = status === 'all' 
      ? citadelState.grants
      : citadelState.grants.filter(g => g.status === status);
    
    res.json({ grants });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transparency Report
app.get('/api/citadel/transparency', async (req, res) => {
  try {
    const report = {
      period: 'All Time',
      totalRevenue: citadelState.totalCollected,
      totalDistributed: citadelState.totalDistributed,
      currentBalance: citadelState.currentBalance,
      distribution: {
        scholarships: {
          count: citadelState.scholarships.length,
          total: citadelState.scholarships.reduce((sum, s) => sum + parseFloat(s.amount), 0).toString()
        },
        grants: {
          count: citadelState.grants.length,
          total: citadelState.grants.reduce((sum, g) => sum + parseFloat(g.amount), 0).toString()
        },
        publicGoods: {
          count: citadelState.publicGoods.length,
          total: citadelState.publicGoods.reduce((sum, p) => sum + parseFloat(p.amount), 0).toString()
        }
      },
      efficiency: (parseFloat(citadelState.totalDistributed) / parseFloat(citadelState.totalCollected) * 100).toFixed(2) + '%',
      ubuntu: 'Full transparency - Ubuntu accountability'
    };
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Default Ubuntu Routes
app.get('/api/status', (req, res) => {
  res.json({
    service: 'citadel-fund',
    status: 'operational',
    ubuntu: 'Ubuntu prosperity service ready'
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
  console.log(`🏦 Citadel Fund service running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I collect because we prosper together!"');
  console.log(`💰 Current Balance: ${citadelState.currentBalance} AZR`);
});
