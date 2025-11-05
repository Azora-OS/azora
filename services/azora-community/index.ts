/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { SocialPlatformSystem } from './social-platform';

const app = express();
const PORT = process.env.PORT || 3016;

// Initialize system
const socialPlatform = new SocialPlatformSystem();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'azora-community', timestamp: new Date() });
});

// ===== PROFILE ROUTES =====

app.post('/api/profiles', async (req: Request, res: Response) => {
  try {
    const profile = await socialPlatform.createProfile(req.body);
    res.status(201).json({ success: true, profile });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/profiles/:userId', async (req: Request, res: Response) => {
  try {
    const profile = await socialPlatform.updateProfile(req.params.userId, req.body);
    res.json({ success: true, profile });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/profiles/:userId/skills/:skillId/endorse', async (req: Request, res: Response) => {
  try {
    await socialPlatform.endorseSkill(req.params.userId, req.params.skillId, req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ===== CONNECTION ROUTES =====

app.post('/api/connections/request', async (req: Request, res: Response) => {
  try {
    const { fromUserId, toUserId, message } = req.body;
    const connection = await socialPlatform.sendConnectionRequest(fromUserId, toUserId, message);
    res.status(201).json({ success: true, connection });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/connections/:connectionId/accept', async (req: Request, res: Response) => {
  try {
    await socialPlatform.acceptConnection(req.params.connectionId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ===== POST ROUTES =====

app.post('/api/posts', async (req: Request, res: Response) => {
  try {
    const post = await socialPlatform.createPost(req.body);
    res.status(201).json({ success: true, post });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/posts/:postId/react', async (req: Request, res: Response) => {
  try {
    const { userId, type } = req.body;
    await socialPlatform.reactToPost(req.params.postId, userId, type);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/posts/:postId/comment', async (req: Request, res: Response) => {
  try {
    const comment = await socialPlatform.commentOnPost(req.params.postId, req.body);
    res.status(201).json({ success: true, comment });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ===== GROUP ROUTES =====

app.post('/api/groups', async (req: Request, res: Response) => {
  try {
    const group = await socialPlatform.createGroup(req.body);
    res.status(201).json({ success: true, group });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/groups/:groupId/join', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    await socialPlatform.joinGroup(req.params.groupId, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ===== EVENT ROUTES =====

app.post('/api/events', async (req: Request, res: Response) => {
  try {
    const event = await socialPlatform.createEvent(req.body);
    res.status(201).json({ success: true, event });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/events/:eventId/register', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    await socialPlatform.registerForEvent(req.params.eventId, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ===== MENTORSHIP ROUTES =====

app.post('/api/mentorship/request', async (req: Request, res: Response) => {
  try {
    const request = await socialPlatform.requestMentorship(req.body);
    res.status(201).json({ success: true, request });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/mentorship/:requestId/accept', async (req: Request, res: Response) => {
  try {
    await socialPlatform.acceptMentorship(req.params.requestId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ===== MESSAGING ROUTES =====

app.post('/api/messages', async (req: Request, res: Response) => {
  try {
    const message = await socialPlatform.sendMessage(req.body);
    res.status(201).json({ success: true, message });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ===== SEARCH ROUTES =====

app.get('/api/search', async (req: Request, res: Response) => {
  try {
    const { query, type, page = 1, limit = 20, ...filters } = req.query;
    const results = await socialPlatform.search(
      query as string,
      { type: type as any, ...filters },
      Number(page),
      Number(limit)
    );
    res.json({ success: true, results });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ===== NOTIFICATION ROUTES =====

app.get('/api/notifications/:userId', async (req: Request, res: Response) => {
  try {
    const { unreadOnly } = req.query;
    const notifications = await socialPlatform.getNotifications(
      req.params.userId,
      unreadOnly === 'true'
    );
    res.json({ success: true, notifications });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/notifications/:notificationId/read', async (req: Request, res: Response) => {
  try {
    await socialPlatform.markNotificationRead(req.params.notificationId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ===== ANALYTICS ROUTES =====

app.get('/api/analytics/:userId', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await socialPlatform.getAnalytics(
      req.params.userId,
      new Date(startDate as string),
      new Date(endDate as string)
    );
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
  console.log(`🚀 Azora Community running on port ${PORT}`);
});

export default app;
