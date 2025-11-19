import { Router, Request, Response } from 'express';
import { accessibilityService } from '../services/accessibility.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /accessibility/settings
 * Get accessibility settings for current user
 * Requirements: 6.1, 6.2
 */
router.get('/accessibility/settings', async (req: Request, res: Response) => {
  try {
    // In a real implementation, userId would come from auth middleware
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId query parameter is required',
      });
    }

    const settings = await accessibilityService.getAccessibilitySettings(userId);

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    logger.error('Error fetching accessibility settings', { error });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch accessibility settings',
    });
  }
});

/**
 * POST /accessibility/settings
 * Update accessibility settings for current user
 * Requirements: 6.1, 6.2
 */
router.post('/accessibility/settings', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const settings = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId query parameter is required',
      });
    }

    const updatedSettings = await accessibilityService.updateAccessibilitySettings(
      userId,
      settings
    );

    res.json({
      success: true,
      data: updatedSettings,
    });
  } catch (error) {
    logger.error('Error updating accessibility settings', { error });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update accessibility settings',
    });
  }
});

/**
 * GET /accessibility/features
 * Get list of available accessibility features
 * Requirements: 6.1, 6.2
 */
router.get('/accessibility/features', async (req: Request, res: Response) => {
  try {
    const features = accessibilityService.getAvailableFeatures();

    res.json({
      success: true,
      data: features,
      count: features.length,
    });
  } catch (error) {
    logger.error('Error fetching accessibility features', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch accessibility features',
    });
  }
});

/**
 * POST /accessibility/captions/:videoId
 * Generate captions for video content
 * Requirements: 6.1, 6.2
 */
router.post('/accessibility/captions/:videoId', async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const { language } = req.body;

    if (!language) {
      return res.status(400).json({
        success: false,
        error: 'language is required',
      });
    }

    const captions = await accessibilityService.generateCaptions(videoId, language);

    res.status(201).json({
      success: true,
      data: {
        videoId,
        language,
        captions,
      },
    });
  } catch (error) {
    logger.error('Error generating captions', { error });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate captions',
    });
  }
});

/**
 * POST /accessibility/transcripts/:videoId
 * Generate transcript for video content
 * Requirements: 6.1, 6.2
 */
router.post('/accessibility/transcripts/:videoId', async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const { language } = req.body;

    if (!language) {
      return res.status(400).json({
        success: false,
        error: 'language is required',
      });
    }

    const transcript = await accessibilityService.generateTranscript(videoId, language);

    res.status(201).json({
      success: true,
      data: {
        videoId,
        language,
        transcript,
      },
    });
  } catch (error) {
    logger.error('Error generating transcript', { error });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate transcript',
    });
  }
});

/**
 * POST /accessibility/track-usage
 * Track accessibility feature usage
 * Requirements: 6.1, 6.2
 */
router.post('/accessibility/track-usage', async (req: Request, res: Response) => {
  try {
    const { userId, featureId, duration } = req.body;

    if (!userId || !featureId || duration === undefined) {
      return res.status(400).json({
        success: false,
        error: 'userId, featureId, and duration are required',
      });
    }

    await accessibilityService.trackAccessibilityUsage(userId, featureId, duration);

    res.json({
      success: true,
      message: 'Usage tracked successfully',
    });
  } catch (error) {
    logger.error('Error tracking accessibility usage', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to track accessibility usage',
    });
  }
});

/**
 * GET /accessibility/compliance/:contentId
 * Validate content for accessibility compliance
 * Requirements: 6.1, 6.2
 */
router.get('/accessibility/compliance/:contentId', async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params;

    const compliance = await accessibilityService.validateAccessibilityCompliance(contentId);

    res.json({
      success: true,
      data: compliance,
    });
  } catch (error) {
    logger.error('Error validating accessibility compliance', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to validate accessibility compliance',
    });
  }
});

/**
 * GET /accessibility/report/:courseId
 * Get accessibility report for a course
 * Requirements: 6.1, 6.2
 */
router.get('/accessibility/report/:courseId', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const report = await accessibilityService.getAccessibilityReport(courseId);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error('Error generating accessibility report', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to generate accessibility report',
    });
  }
});

export default router;
