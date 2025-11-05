/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { StartupIncubatorSystem } from './startup-incubator';

const app = express();
const PORT = process.env.PORT || 3015;

// Initialize system
const incubatorSystem = new StartupIncubatorSystem();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'azora-innovation-hub', timestamp: new Date() });
});

// ===== STARTUP ROUTES =====

app.post('/api/startups/register', async (req: Request, res: Response) => {
  try {
    const startup = await incubatorSystem.registerStartup(req.body);
    res.status(201).json({ success: true, startup });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/startups/convert-project', async (req: Request, res: Response) => {
  try {
    const { project, founders } = req.body;
    const startup = await incubatorSystem.convertProjectToStartup(project, founders);
    res.status(201).json({ success: true, startup });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/startups/:startupId', async (req: Request, res: Response) => {
  try {
    const startup = await incubatorSystem.updateStartup(req.params.startupId, req.body);
    res.json({ success: true, startup });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ===== FUNDING ROUTES =====

app.post('/api/startups/:startupId/funding', async (req: Request, res: Response) => {
  try {
    const round = await incubatorSystem.raiseFunding(req.params.startupId, req.body);
    res.status(201).json({ success: true, round });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/startups/:startupId/ip', async (req: Request, res: Response) => {
  try {
    const ip = await incubatorSystem.registerIP(req.params.startupId, req.body);
    res.status(201).json({ success: true, ip });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ===== MENTORSHIP ROUTES =====

app.post('/api/mentorship/schedule', async (req: Request, res: Response) => {
  try {
    const session = await incubatorSystem.scheduleMentorship(req.body);
    res.status(201).json({ success: true, session });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/mentorship/:sessionId/complete', async (req: Request, res: Response) => {
  try {
    const { notes, actionItems, feedback } = req.body;
    await incubatorSystem.completeMentorship(req.params.sessionId, notes, actionItems, feedback);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ===== PROGRAM ROUTES =====

app.post('/api/programs/apply', async (req: Request, res: Response) => {
  try {
    const application = await incubatorSystem.applyToProgram(req.body);
    res.status(201).json({ success: true, application });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/programs/accept/:applicationId', async (req: Request, res: Response) => {
  try {
    await incubatorSystem.acceptToProgram(req.params.applicationId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/startups/:startupId/graduate', async (req: Request, res: Response) => {
  try {
    await incubatorSystem.graduateStartup(req.params.startupId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ===== MILESTONE ROUTES =====

app.post('/api/startups/:startupId/milestones', async (req: Request, res: Response) => {
  try {
    const milestone = await incubatorSystem.addMilestone(req.params.startupId, req.body);
    res.status(201).json({ success: true, milestone });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/startups/:startupId/milestones/:milestoneId/complete', async (req: Request, res: Response) => {
  try {
    await incubatorSystem.completeMilestone(req.params.startupId, req.params.milestoneId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ===== ANALYTICS ROUTES =====

app.get('/api/startups/:startupId/analytics', async (req: Request, res: Response) => {
  try {
    const analytics = await incubatorSystem.getStartupAnalytics(req.params.startupId);
    res.json({ success: true, analytics });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Azora Innovation Hub running on port ${PORT}`);
});

export default app;
