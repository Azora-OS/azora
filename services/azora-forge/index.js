require('dotenv').config();
const express = require('express');
const marketplaceRouter = require('./api/marketplace');

const app = express();
app.use(express.json());

app.use('/api/forge', marketplaceRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'azora-forge' });
});

const PORT = process.env.PORT || 4030;
app.listen(PORT, () => {
  console.log(`🔨 Azora Forge Service running on port ${PORT}`);
  console.log('💼 Job matching, skills assessment, and escrow active');
});

module.exports = app;
