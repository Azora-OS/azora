/**
 * User Type Detection Routes
 * 
 * API endpoints for user type detection and verification
 */

import { Router, Request, Response } from 'express';
import { UserTypeDetectionService, UserProfile, DetectionResult, VerificationResult } from '../services/user-type-detection.service';
import { ElaraLogger } from '../utils/logger';

const router = Router();
const service = new UserTypeDetectionService();
const logger = new ElaraLogger('UserTypeDetectionRoutes');

/**
 * POST /detect
 * Detect user type from profile information
 */
router.post('/detect', async (req: Request, res: Response): Promise<void> => {
  try {
    const profile: UserProfile = req.body;

    // Validate required fields
    if (!profile.firstName || !profile.lastName || !profile.email) {
      res.status(400).json({
        error: 'Missing required fields: firstName, lastName, email',
      });
      return;
    }

    const result: DetectionResult = await service.detectUserType(profile);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error detecting user type:', error);
    res.status(500).json({
      error: 'Failed to detect user type',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /verify
 * Verify user type with external services
 */
router.post('/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userType, profile } = req.body;

    // Validate required fields
    if (!userType || !profile) {
      res.status(400).json({
        error: 'Missing required fields: userType, profile',
      });
      return;
    }

    const result: VerificationResult = await service.verifyUserType(userType, profile);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error verifying user type:', error);
    res.status(500).json({
      error: 'Failed to verify user type',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /detect-and-verify
 * Detect and verify user type in one call
 */
router.post('/detect-and-verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const profile: UserProfile = req.body;

    // Validate required fields
    if (!profile.firstName || !profile.lastName || !profile.email) {
      res.status(400).json({
        error: 'Missing required fields: firstName, lastName, email',
      });
      return;
    }

    // Detect user type
    const detection: DetectionResult = await service.detectUserType(profile);

    // Verify if required
    let verification: VerificationResult | null = null;
    if (detection.requiresVerification) {
      verification = await service.verifyUserType(detection.userType, profile);
    }

    res.json({
      success: true,
      data: {
        detection,
        verification,
      },
    });
  } catch (error) {
    logger.error('Error detecting and verifying user type:', error);
    res.status(500).json({
      error: 'Failed to detect and verify user type',
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
    service: 'user-type-detection',
    timestamp: new Date(),
  });
});

export default router;
