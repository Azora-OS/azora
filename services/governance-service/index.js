const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3024;

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'governance-service', 
    timestamp: new Date().toISOString() 
  });
});

// Governance proposals endpoint
app.get('/api/proposals', (req, res) => {
  const proposals = [
    {
      id: 'prop_1',
      title: 'Community Fund Allocation',
      status: 'active',
      votes: {
        yes: 1250,
        no: 340,
        abstain: 89
      }
    },
    {
      id: 'prop_2',
      title: 'New Feature Implementation',
      status: 'passed',
      votes: {
        yes: 2100,
        no: 150,
        abstain: 45
      }
    }
  ];
  
  res.json({ proposals, count: proposals.length });
});

// Proposal submission endpoint
app.post('/api/proposals', (req, res) => {
  const { title, description, duration } = req.body;
  
  const proposal = {
    id: `prop_${Date.now()}`,
    title,
    description,
    duration,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  
  res.status(201).json(proposal);
});

// Voting endpoint
app.post('/api/vote', (req, res) => {
  const { proposalId, voterId, vote } = req.body;
  
  const voteRecord = {
    id: `vote_${Date.now()}`,
    proposalId,
    voterId,
    vote,
    timestamp: new Date().toISOString()
  };
  
  res.status(201).json(voteRecord);
});

app.listen(PORT, () => {
  console.log(`Governance Service running on port ${PORT}`);
});

module.exports = app;