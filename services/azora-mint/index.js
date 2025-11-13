require('dotenv').config();
const express = require('express');
const miningRouter = require('./api/mining');

const app = express();
app.use(express.json());

app.use('/api/mint', miningRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'azora-mint' });
});

const PORT = process.env.PORT || 4020;
app.listen(PORT, () => {
  console.log(`💰 Azora Mint Service running on port ${PORT}`);
  console.log('⛏️ Proof-of-Knowledge mining active');
});

module.exports = app;
