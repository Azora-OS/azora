/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Analytics API Server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { analyticsEngine, ProgressData, GapAnalysis } from './analytics-engine';
import { connectAzoraDatabase } from '../shared/database/connection';

const app = express();
const PORT = process.env.ANALYTICS_PORT || 4204;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Connect to Azora database
connectAzoraDatabase(process.env.DATABASE_URI || process.env.MONGODB_URI).catch(console.error);

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Azora Analytics System',
    timestamp: new Date(),
  });
});

// ========== PROGRESS TRACKING ==========

app.post('/api/progress', async (req, res) => {
  try {
    await analyticsEngine.trackProgress(req.body as ProgressData);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/progress/:studentId', (req, res) => {
  const { courseId } = req.query;
  const progress = analyticsEngine.getProgress(req.params.studentId, courseId as string);
  res.json({ progress });
});

// ========== ANALYTICS ==========

app.get('/api/analytics/:studentId', (req, res) => {
  const analytics = analyticsEngine.getAnalytics(req.params.studentId);
  if (!analytics) {
    return res.status(404).json({ error: 'Analytics not found' });
  }
  res.json(analytics);
});

app.post('/api/analytics/:studentId/gap-analysis', async (req, res) => {
  try {
    const { requiredSkills } = req.body;
    const analysis = await analyticsEngine.performGapAnalysis(req.params.studentId, requiredSkills);
    res.json(analysis);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/analytics/:studentId/predictions', (req, res) => {
  const insights = analyticsEngine.generatePredictiveInsights(req.params.studentId);
  res.json({ insights });
});

app.listen(PORT, () => {
  console.log(`\n📊 AZORA ANALYTICS SYSTEM running on port ${PORT}\n`);
  console.log(`   📈 Progress: http://localhost:${PORT}/api/progress/:studentId`);
  console.log(`   📊 Analytics: http://localhost:${PORT}/api/analytics/:studentId`);
  console.log(`   🔍 Gap Analysis: http://localhost:${PORT}/api/analytics/:studentId/gap-analysis`);
  console.log(`   🔮 Predictions: http://localhost:${PORT}/api/analytics/:studentId/predictions`);
  console.log(`   ❤️  Health: http://localhost:${PORT}/health\n`);
});

export default app;
