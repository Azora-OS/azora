/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { CorporateTrainingPlatform } from './corporate-training-platform';

const app = express();
const PORT = process.env.PORT || 3024;

const platform = new CorporateTrainingPlatform();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'azora-corporate-learning' }));

// Corporate clients
app.post('/api/clients', async (req, res) => {
  try {
    const client = await platform.onboardClient(req.body);
    res.status(201).json({ success: true, client });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Employee enrollment
app.post('/api/clients/:clientId/employees', async (req, res) => {
  try {
    const employee = await platform.enrollEmployee(req.params.clientId, req.body);
    res.status(201).json({ success: true, employee });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Skill gap analysis
app.get('/api/clients/:clientId/skill-gaps', async (req, res) => {
  try {
    const analysis = await platform.analyzeSkillGaps(req.params.clientId);
    res.json({ success: true, analysis });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Training programs
app.post('/api/clients/:clientId/programs', async (req, res) => {
  try {
    const program = await platform.createTrainingProgram(req.params.clientId, req.body);
    res.status(201).json({ success: true, program });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Analytics
app.get('/api/clients/:clientId/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await platform.getAnalytics(
      req.params.clientId,
      new Date(startDate as string),
      new Date(endDate as string)
    );
    res.json({ success: true, analytics });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => console.log(`🏢 Corporate Learning on port ${PORT}`));
export default app;
