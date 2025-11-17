const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(compression());

// Input validation middleware
const validateInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/<script[^>]*>.*?<\/script>/gi, '');
        req.body[key] = req.body[key].replace(/javascript:/gi, '');
      }
    });
  }
  next();
};
app.use(validateInput);

app.use(express.json({ limit: '10mb' }));

// 🏛️ AZORA GOVERNANCE - CONSTITUTIONAL AI
console.log('🌟 Azora Governance Service - Initializing...');

const proposals = new Map();
const votes = new Map();
const policies = new Map();

// 🎯 API ROUTES
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'governance-service',
    ubuntu: 'I govern because we decide together',
    proposals: proposals.size,
    timestamp: new Date().toISOString()
  });
});

// Create governance proposal
app.post('/api/proposals', (req, res) => {
  try {
    const { title, description, proposerId, type } = req.body;
    
    const proposal = {
      id: `prop_${Date.now()}`,
      title,
      description,
      proposerId,
      type: type || 'POLICY',
      status: 'ACTIVE',
      votesFor: 0,
      votesAgainst: 0,
      createdAt: new Date().toISOString()
    };
    
    proposals.set(proposal.id, proposal);
    
    res.status(201).json({
      success: true,
      message: 'Proposal created successfully',
      data: proposal
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create proposal' });
  }
});

// Vote on proposal
app.post('/api/proposals/:id/vote', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, vote } = req.body;
    
    const proposal = proposals.get(id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    const voteRecord = {
      id: `vote_${Date.now()}`,
      proposalId: id,
      userId,
      vote: vote, // 'FOR' or 'AGAINST'
      timestamp: new Date().toISOString()
    };
    
    votes.set(voteRecord.id, voteRecord);
    
    // Update proposal vote counts
    if (vote === 'FOR') {
      proposal.votesFor++;
    } else {
      proposal.votesAgainst++;
    }
    
    proposals.set(id, proposal);
    
    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: voteRecord
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

const PORT = process.env.PORT || 3026;
app.listen(PORT, () => {
  console.log('🌟 Azora Governance Service running on port', PORT);
});

module.exports = app;