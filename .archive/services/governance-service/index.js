const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3033;
const proposals = [];
const votes = [];

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'governance-service', proposals: proposals.length });
});

app.post('/api/proposals', (req, res) => {
  const { title, description, proposer } = req.body;
  const proposal = { id: Date.now().toString(), title, description, proposer, status: 'active', votesFor: 0, votesAgainst: 0, createdAt: new Date() };
  proposals.push(proposal);
  res.json({ proposal });
});

app.get('/api/proposals', (req, res) => {
  res.json({ proposals });
});

app.post('/api/proposals/:id/vote', (req, res) => {
  const { voter, vote } = req.body;
  const proposal = proposals.find(p => p.id === req.params.id);
  if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
  
  const voteRecord = { id: Date.now().toString(), proposalId: proposal.id, voter, vote, timestamp: new Date() };
  votes.push(voteRecord);
  
  if (vote) proposal.votesFor++;
  else proposal.votesAgainst++;
  
  res.json({ voted: true, proposal });
});

app.get('/api/proposals/:id', (req, res) => {
  const proposal = proposals.find(p => p.id === req.params.id);
  if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
  res.json({ proposal });
});

app.use(require('./routes'));

app.listen(port, () => console.log(`Governance Service on port ${port}`));
module.exports = app;
