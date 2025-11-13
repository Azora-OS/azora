const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3025;

const blocks = [];
const transactions = [];

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'blockchain-service', blocks: blocks.length });
});

app.post('/api/blockchain/blocks', (req, res) => {
  const { data } = req.body;
  const prevHash = blocks.length > 0 ? blocks[blocks.length - 1].hash : '0';
  const hash = crypto.createHash('sha256').update(prevHash + data + Date.now()).digest('hex');
  
  const block = { id: blocks.length, index: blocks.length, hash, prevHash, data, timestamp: new Date() };
  blocks.push(block);
  res.json({ block });
});

app.get('/api/blockchain/blocks', (req, res) => {
  res.json({ blocks });
});

app.post('/api/blockchain/transactions', (req, res) => {
  const { from, to, amount } = req.body;
  const hash = crypto.createHash('sha256').update(from + to + amount + Date.now()).digest('hex');
  const transaction = { id: Date.now().toString(), from, to, amount, hash, status: 'pending', timestamp: new Date() };
  transactions.push(transaction);
  res.json({ transaction });
});

app.get('/api/blockchain/transactions', (req, res) => {
  res.json({ transactions });
});

app.listen(port, () => console.log(`Blockchain Service on port ${port}`));
module.exports = app;
