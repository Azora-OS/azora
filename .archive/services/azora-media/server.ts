/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Media API Server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { mediaService } from './media-service';
import { connectAzoraDatabase } from '../shared/database/connection';

const app = express();
const PORT = process.env.MEDIA_PORT || 4208;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Connect to Azora database
connectAzoraDatabase(process.env.DATABASE_URI || process.env.MONGODB_URI).catch(console.error);

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Azora Media Platform',
    timestamp: new Date(),
  });
});

// ========== VIDEOS ==========

app.post('/api/videos', async (req, res) => {
  try {
    const video = await mediaService.uploadVideo(req.body);
    res.json(video);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/videos/:id', (req, res) => {
  const video = mediaService.getVideo(req.params.id);
  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }
  res.json(video);
});

app.get('/api/videos/course/:courseId', (req, res) => {
  const videos = mediaService.getCourseVideos(req.params.courseId);
  res.json({ videos });
});

// ========== ANALYTICS ==========

app.get('/api/videos/:id/analytics', (req, res) => {
  const analytics = mediaService.getAnalytics(req.params.id);
  if (!analytics) {
    return res.status(404).json({ error: 'Analytics not found' });
  }
  res.json(analytics);
});

// ========== VIEWS ==========

app.post('/api/videos/:id/views', async (req, res) => {
  try {
    const view = await mediaService.recordView({
      ...req.body,
      videoId: req.params.id,
    });
    res.json(view);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/views/:viewId/complete', async (req, res) => {
  try {
    const { watchedDuration } = req.body;
    await mediaService.completeView(req.params.viewId, watchedDuration);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ========== INTERACTIONS ==========

app.post('/api/videos/:id/interactions', async (req, res) => {
  try {
    const interaction = await mediaService.addInteraction({
      ...req.body,
      videoId: req.params.id,
    });
    res.json(interaction);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/videos/:id/interactions', (req, res) => {
  const interactions = mediaService.getInteractions(req.params.id);
  res.json({ interactions });
});

app.listen(PORT, () => {
  console.log(`\n🎥 AZORA MEDIA PLATFORM running on port ${PORT}\n`);
  console.log(`   📹 Videos: http://localhost:${PORT}/api/videos`);
  console.log(`   📊 Analytics: http://localhost:${PORT}/api/videos/:id/analytics`);
  console.log(`   👁️  Views: http://localhost:${PORT}/api/videos/:id/views`);
  console.log(`   💬 Interactions: http://localhost:${PORT}/api/videos/:id/interactions`);
  console.log(`   ❤️  Health: http://localhost:${PORT}/health\n`);
});

export default app;
