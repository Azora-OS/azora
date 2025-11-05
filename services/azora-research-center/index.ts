/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { ResearchCenter } from './research-center';

const app = express();
const PORT = process.env.PORT || 3023;

const researchCenter = new ResearchCenter();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'azora-research-center' }));

// Research projects
app.post('/api/projects', async (req, res) => {
  try {
    const project = await researchCenter.createProject(req.body);
    res.status(201).json({ success: true, project });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/projects/:projectId', async (req, res) => {
  try {
    const project = await researchCenter.getProject(req.params.projectId);
    res.json({ success: true, project });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Publications
app.post('/api/publications', async (req, res) => {
  try {
    const publication = await researchCenter.publishResearch(req.body);
    res.status(201).json({ success: true, publication });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Emerging trends
app.get('/api/trends', async (req, res) => {
  try {
    const trends = await researchCenter.getEmergingTrends();
    res.json({ success: true, trends });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Curriculum recommendations
app.get('/api/curriculum-recommendations', async (req, res) => {
  try {
    const recommendations = await researchCenter.generateCurriculumRecommendations();
    res.json({ success: true, recommendations });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => console.log(`🔬 Research Center on port ${PORT}`));
export default app;
