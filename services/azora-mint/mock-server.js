/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    service: 'azora-mint',
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    mode: 'mock'
  });
});

// Basic mint endpoints (mock)
app.get('/api/v1/mint/status', (req, res) => {
  res.json({
    operational: true,
    features: ['credit-scoring', 'staking', 'payments'],
    mode: 'mock'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Azora Mint Service running on port ${PORT} (Mock Mode)`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
});
