/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Collaboration API Server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { collaborationService } from './collaboration-service';
import { connectAzoraDatabase } from '../shared/database/connection';
import { Server as HttpServer } from 'http';
import { educationWebSocket } from '../shared/websocket-server';

const app = express();
const PORT = process.env.COLLABORATION_PORT || 4206;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Connect to Azora database
connectAzoraDatabase(process.env.DATABASE_URI || process.env.MONGODB_URI).catch(console.error);

// Initialize WebSocket server
const httpServer = HttpServer(app);
educationWebSocket.initialize(httpServer);

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Azora Collaboration Platform',
    timestamp: new Date(),
  });
});

// ========== FORUMS ==========

app.post('/api/forums', async (req, res) => {
  try {
    const forum = await collaborationService.createForum(req.body);
    res.json(forum);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/forums/course/:courseId', (req, res) => {
  const forums = collaborationService.getCourseForums(req.params.courseId);
  res.json({ forums });
});

app.get('/api/forums/:id', (req, res) => {
  const forum = collaborationService.getForum(req.params.id);
  if (!forum) {
    return res.status(404).json({ error: 'Forum not found' });
  }
  res.json(forum);
});

// ========== TOPICS ==========

app.post('/api/topics', async (req, res) => {
  try {
    const topic = await collaborationService.createTopic(req.body);
    res.json(topic);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/topics/:id', (req, res) => {
  const topic = collaborationService.getTopic(req.params.id);
  if (!topic) {
    return res.status(404).json({ error: 'Topic not found' });
  }
  res.json(topic);
});

app.post('/api/topics/:id/replies', async (req, res) => {
  try {
    const reply = await collaborationService.addReply({
      ...req.body,
      topicId: req.params.id,
    });
    res.json(reply);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ========== MESSAGING ==========

app.post('/api/messages', async (req, res) => {
  try {
    const message = await collaborationService.sendMessage(req.body);
    res.json(message);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/messages/:userId', (req, res) => {
  const messages = collaborationService.getMessages(req.params.userId);
  res.json({ messages });
});

app.post('/api/messages/:messageId/read', async (req, res) => {
  try {
    const { userId } = req.body;
    await collaborationService.markMessageRead(req.params.messageId, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ========== STUDY GROUPS ==========

app.post('/api/study-groups', async (req, res) => {
  try {
    const group = await collaborationService.createStudyGroup(req.body);
    res.json(group);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/study-groups/course/:courseId', (req, res) => {
  const groups = collaborationService.getCourseStudyGroups(req.params.courseId);
  res.json({ groups });
});

app.get('/api/study-groups/:id', (req, res) => {
  const group = collaborationService.getStudyGroup(req.params.id);
  if (!group) {
    return res.status(404).json({ error: 'Study group not found' });
  }
  res.json(group);
});

app.post('/api/study-groups/:id/join', async (req, res) => {
  try {
    const { userId } = req.body;
    await collaborationService.joinStudyGroup(req.params.id, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ========== PEER REVIEW ==========

app.post('/api/peer-reviews', async (req, res) => {
  try {
    const review = await collaborationService.createPeerReview(req.body);
    res.json(review);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/peer-reviews/submission/:submissionId', (req, res) => {
  const reviews = collaborationService.getPeerReviews(req.params.submissionId);
  res.json({ reviews });
});

httpServer.listen(PORT, () => {
  console.log(`\n💬 AZORA COLLABORATION PLATFORM running on port ${PORT}\n`);
  console.log(`   📝 Forums: http://localhost:${PORT}/api/forums`);
  console.log(`   💬 Messages: http://localhost:${PORT}/api/messages`);
  console.log(`   👥 Study Groups: http://localhost:${PORT}/api/study-groups`);
  console.log(`   ✅ Peer Reviews: http://localhost:${PORT}/api/peer-reviews`);
  console.log(`   ❤️  Health: http://localhost:${PORT}/health\n`);
});

export default app;
