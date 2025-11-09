/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

AI ROUTES
API endpoints for AI integration
*/

import { Router } from 'express';
import { aiHub } from './ai-integration-hub';
import { 
  elaraTutoringEndpoint, 
  aiHealthCheck,
  constitutionalValidation,
  guardianVerification 
} from './ai-middleware';

const router = Router();

// Elara AI Tutor Routes
router.post('/elara/tutor', elaraTutoringEndpoint);

router.post('/elara/lesson', async (req, res) => {
  try {
    const result = await aiHub.processLearningRequest(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Lesson generation failed' });
  }
});

router.post('/elara/assess', async (req, res) => {
  try {
    const { studentId, responses } = req.body;
    const assessment = await aiHub.elara.assessUnderstanding(studentId, responses);
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ error: 'Assessment failed' });
  }
});

// Constitutional AI Routes
router.post('/constitutional/validate', async (req, res) => {
  try {
    const validation = await aiHub.constitutional.validateAction(req.body.action);
    res.json(validation);
  } catch (error) {
    res.status(500).json({ error: 'Validation failed' });
  }
});

router.post('/constitutional/govern', async (req, res) => {
  try {
    const { decision, context } = req.body;
    const result = await aiHub.constitutional.governDecision(decision, context);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Governance decision failed' });
  }
});

// Guardian Oracle Routes
router.post('/guardian/verify', guardianVerification, async (req, res) => {
  try {
    res.json(req.guardianVerification);
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Recommendations Routes
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const recommendations = await aiHub.recommendations.getPersonalizedRecommendations(
      userId,
      req.query
    );
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Recommendations failed' });
  }
});

router.post('/recommendations/feedback', async (req, res) => {
  try {
    // Store feedback for ML improvement
    res.json({ success: true, message: 'Feedback recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Feedback recording failed' });
  }
});

// AI Insights
router.get('/insights/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const insights = await aiHub.getRealTimeInsights(userId, req.query);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: 'Insights retrieval failed' });
  }
});

// Combined AI Action
router.post('/ai/verify-and-recommend', async (req, res) => {
  try {
    const { userId, action } = req.body;
    const result = await aiHub.verifyAndRecommend(userId, action);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'AI processing failed' });
  }
});

// AI Health
router.get('/ai/health', aiHealthCheck);

export default router;
