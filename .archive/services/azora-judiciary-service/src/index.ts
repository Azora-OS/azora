/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express, { Application } from 'express';
import cors from 'cors';
import { caseManagement } from './modules/case-management';

const app: Application = express();
const PORT = process.env.JUDICIARY_PORT || 3026;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'azora-judiciary-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Case management routes
app.post('/api/v1/cases', async (req, res) => {
  try {
    const caseData = await caseManagement.createCase(req.body);
    res.json({ success: true, data: caseData });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

app.get('/api/v1/cases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const caseData = await caseManagement.getCase(id);
    res.json({ success: true, data: caseData });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

app.post('/api/v1/cases/:id/evidence', async (req, res) => {
  try {
    const { id } = req.params;
    await caseManagement.addEvidence(id, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

app.post('/api/v1/cases/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    await caseManagement.submitVote(id, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

app.get('/api/v1/arbiters/:id/cases', async (req, res) => {
  try {
    const { id } = req.params;
    const cases = await caseManagement.getCasesByArbiter(id);
    res.json({ success: true, data: cases });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`⚖️  Judiciary Service running on port ${PORT}`);
  });
}

export { app, caseManagement };
