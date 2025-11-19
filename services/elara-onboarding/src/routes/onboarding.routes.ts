/**
 * Onboarding Routes
 * 
 * API endpoints for onboarding session management
 */

import { Router, Request, Response } from 'express';
import { OnboardingService } from '../services/onboarding.service';
import { ElaraLogger } from '../utils/logger';

const router = Router();
const service = new OnboardingService();
const logger = new ElaraLogger('OnboardingRoutes');

/**
 * POST /onboarding/start
 * Start a new onboarding session
 */
router.post('/onboarding/start', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, userType } = req.body;

    if (!userId || !userType) {
      res.status(400).json({
        error: 'Missing required fields: userId, userType',
      });
      return;
    }

    const session = await service.createSession(userId, userType);

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    logger.error('Error starting onboarding:', error);
    res.status(500).json({
      error: 'Failed to start onboarding',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /onboarding/session/:sessionId
 * Get session details
 */
router.get('/onboarding/session/:sessionId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const session = await service.getSession(sessionId);

    if (!session) {
      res.status(404).json({
        error: 'Session not found',
      });
      return;
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    logger.error('Error getting session:', error);
    res.status(500).json({
      error: 'Failed to get session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /onboarding/session/:sessionId/profile
 * Update profile data
 */
router.post('/onboarding/session/:sessionId/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const profileData = req.body;

    const session = await service.updateProfileData(sessionId, profileData);

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /onboarding/session/:sessionId/next
 * Progress to next step
 */
router.post('/onboarding/session/:sessionId/next', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const result = await service.progressToNextStep(sessionId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error progressing to next step:', error);
    res.status(500).json({
      error: 'Failed to progress to next step',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /onboarding/session/:sessionId/current-step
 * Get current step details
 */
router.get('/onboarding/session/:sessionId/current-step', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const step = await service.getCurrentStep(sessionId);

    if (!step) {
      res.status(404).json({
        error: 'Current step not found',
      });
      return;
    }

    res.json({
      success: true,
      data: step,
    });
  } catch (error) {
    logger.error('Error getting current step:', error);
    res.status(500).json({
      error: 'Failed to get current step',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /onboarding/steps/:userType
 * Get all steps for user type
 */
router.get('/onboarding/steps/:userType', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userType } = req.params;

    const steps = await service.getSteps(userType as any);

    res.json({
      success: true,
      data: steps,
    });
  } catch (error) {
    logger.error('Error getting steps:', error);
    res.status(500).json({
      error: 'Failed to get steps',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /onboarding/session/:sessionId/progress
 * Get session progress
 */
router.get('/onboarding/session/:sessionId/progress', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const progress = await service.getProgress(sessionId);

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    logger.error('Error getting progress:', error);
    res.status(500).json({
      error: 'Failed to get progress',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /onboarding/validate
 * Validate profile data
 */
router.post('/onboarding/validate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userType, data } = req.body;

    if (!userType || !data) {
      res.status(400).json({
        error: 'Missing required fields: userType, data',
      });
      return;
    }

    const result = await service.validateProfileData(userType, data);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error validating profile:', error);
    res.status(500).json({
      error: 'Failed to validate profile',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /onboarding/session/:sessionId/complete
 * Complete session
 */
router.post('/onboarding/session/:sessionId/complete', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const session = await service.completeSession(sessionId);

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    logger.error('Error completing session:', error);
    res.status(500).json({
      error: 'Failed to complete session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /onboarding/session/:sessionId/abandon
 * Abandon session
 */
router.post('/onboarding/session/:sessionId/abandon', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const session = await service.abandonSession(sessionId);

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    logger.error('Error abandoning session:', error);
    res.status(500).json({
      error: 'Failed to abandon session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response): void => {
  res.json({
    status: 'healthy',
    service: 'onboarding',
    timestamp: new Date(),
  });
});

export default router;
