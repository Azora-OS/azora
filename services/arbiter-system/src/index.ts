/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express, { Application } from 'express';
import cors from 'cors';
import { stakingProtocol } from './services/staking-protocol';
import { reputationEngine } from './services/reputation-engine';

const app: Application = express();
const PORT = process.env.ARBITER_SYSTEM_PORT || 3025;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'arbiter-system',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Staking routes
app.post('/api/v1/stake', async (req, res) => {
  try {
    const { arbiterId, amount } = req.body;
    const stake = await stakingProtocol.stakeTokens(arbiterId, amount);
    res.json({ success: true, data: stake });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

app.post('/api/v1/unstake', async (req, res) => {
  try {
    const { arbiterId, amount } = req.body;
    const stake = await stakingProtocol.unstakeTokens(arbiterId, amount);
    res.json({ success: true, data: stake });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

app.get('/api/v1/stake/:arbiterId', async (req, res) => {
  try {
    const { arbiterId } = req.params;
    const stake = await stakingProtocol.getStakeInfo(arbiterId);
    res.json({ success: true, data: stake });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Reputation routes
app.get('/api/v1/reputation/:arbiterId', async (req, res) => {
  try {
    const { arbiterId } = req.params;
    const reputation = await reputationEngine.getReputation(arbiterId);
    res.json({ success: true, data: reputation });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

app.get('/api/v1/arbiters/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const topArbiters = await reputationEngine.getTopArbiters(limit);
    res.json({ success: true, data: topArbiters });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

app.post('/api/v1/reputation/:arbiterId/review', async (req, res) => {
  try {
    const { arbiterId } = req.params;
    await reputationEngine.addReview(arbiterId, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`⚖️  Arbiter System running on port ${PORT}`);
  });
}

export { app, stakingProtocol, reputationEngine };
