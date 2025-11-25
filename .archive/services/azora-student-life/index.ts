/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { SocietiesPlatform } from './societies-platform';

const app = express();
const PORT = process.env.PORT || 3020;

const platform = new SocietiesPlatform();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'azora-student-life' }));

// Society routes
app.post('/api/societies', async (req, res) => {
  try {
    const society = await platform.createSociety(req.body);
    res.status(201).json({ success: true, society });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/societies/:societyId/join', async (req, res) => {
  try {
    const { studentNumber } = req.body;
    await platform.joinSociety(req.params.societyId, studentNumber);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/societies/:societyId/events', async (req, res) => {
  try {
    const event = await platform.createEvent(req.params.societyId, req.body);
    res.status(201).json({ success: true, event });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/societies/:societyId/funding', async (req, res) => {
  try {
    const request = await platform.requestFunding(req.params.societyId, req.body);
    res.status(201).json({ success: true, request });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => console.log(`🎭 Student Life Platform on port ${PORT}`));
export default app;
