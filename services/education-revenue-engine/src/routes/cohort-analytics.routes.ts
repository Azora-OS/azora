import { Router, Request, Response } from 'express';
import { cohortAnalyticsService } from '../services/cohort-analytics.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /analytics/cohort/:courseId
 * Get comprehensive cohort analytics for a course
 */
router.get('/cohort/:courseId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { period } = req.query;

    if (!courseId) {
      res.status(400).json({
        success: false,
        error: 'courseId is required',
      });
      return;
    }

    const periodStr = typeof period === 'string' ? period : undefined;
    const analytics = await cohortAnalyticsService.getCohortAnalytics(courseId, periodStr);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error('Error getting cohort analytics:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /analytics/cohort/:courseId/period/:period
 * Get cohort analytics for a specific time period (YYYY-MM format)
 */
router.get('/cohort/:courseId/period/:period', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId, period } = req.params;

    if (!courseId || !period) {
      res.status(400).json({
        success: false,
        error: 'courseId and period are required',
      });
      return;
    }

    // Validate period format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(period)) {
      res.status(400).json({
        success: false,
        error: 'period must be in YYYY-MM format',
      });
      return;
    }

    const analytics = await cohortAnalyticsService.getCohortAnalyticsByPeriod(courseId, period);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error('Error getting cohort analytics by period:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * POST /analytics/cohort/:courseId/compare
 * Compare cohort performance across multiple periods
 */
router.post('/cohort/:courseId/compare', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { periods } = req.body;

    if (!courseId) {
      res.status(400).json({
        success: false,
        error: 'courseId is required',
      });
      return;
    }

    if (!Array.isArray(periods) || periods.length === 0) {
      res.status(400).json({
        success: false,
        error: 'periods array is required and must not be empty',
      });
      return;
    }

    // Validate period format
    for (const period of periods) {
      if (!/^\d{4}-\d{2}$/.test(period)) {
        res.status(400).json({
          success: false,
          error: `Invalid period format: ${period}. Use YYYY-MM format.`,
        });
        return;
      }
    }

    const results = await cohortAnalyticsService.compareCohortPerformance(courseId, periods);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    logger.error('Error comparing cohort performance:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /analytics/cohort/:courseId/trends
 * Get cohort performance trends over time
 */
router.get('/cohort/:courseId/trends', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { monthsBack = 12 } = req.query;

    if (!courseId) {
      res.status(400).json({
        success: false,
        error: 'courseId is required',
      });
      return;
    }

    const months = typeof monthsBack === 'string' ? parseInt(monthsBack, 10) : 12;
    const trends = await cohortAnalyticsService.getCohortPerformanceTrends(courseId, months);

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    logger.error('Error getting cohort performance trends:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /analytics/cohort/:courseId/segmentation
 * Get cohort segmentation by performance level
 */
router.get('/cohort/:courseId/segmentation', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      res.status(400).json({
        success: false,
        error: 'courseId is required',
      });
      return;
    }

    const segmentation = await cohortAnalyticsService.getCohortSegmentation(courseId);

    res.json({
      success: true,
      data: segmentation,
    });
  } catch (error) {
    logger.error('Error getting cohort segmentation:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /analytics/cohort/:courseId/retention
 * Get cohort retention metrics
 */
router.get('/cohort/:courseId/retention', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      res.status(400).json({
        success: false,
        error: 'courseId is required',
      });
      return;
    }

    const retention = await cohortAnalyticsService.getCohortRetention(courseId);

    res.json({
      success: true,
      data: retention,
    });
  } catch (error) {
    logger.error('Error getting cohort retention:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /analytics/cohort/:courseId/velocity
 * Get learning velocity metrics
 */
router.get('/cohort/:courseId/velocity', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      res.status(400).json({
        success: false,
        error: 'courseId is required',
      });
      return;
    }

    const velocity = await cohortAnalyticsService.getLearningVelocity(courseId);

    res.json({
      success: true,
      data: velocity,
    });
  } catch (error) {
    logger.error('Error getting learning velocity:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

export default router;
