import { Router, Request, Response } from 'express';
import { conversionMetricsService } from '../services/conversion-metrics.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /analytics/conversion/metrics
 * Get conversion metrics for current month
 * Requirements: 5.1, 5.2
 */
router.get('/analytics/conversion/metrics', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const metrics = await conversionMetricsService.getConversionMetrics(period);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('Error fetching conversion metrics', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversion metrics',
    });
  }
});

/**
 * GET /analytics/conversion/metrics/:period
 * Get conversion metrics for a specific period
 * Period format: YYYY-MM, YYYY-Q1, or YYYY
 * Requirements: 5.1, 5.2
 */
router.get('/analytics/conversion/metrics/:period', async (req: Request, res: Response) => {
  try {
    const { period } = req.params;

    // Validate period format
    if (!isValidPeriod(period)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid period format. Use YYYY-MM, YYYY-Q1, or YYYY',
      });
    }

    const metrics = await conversionMetricsService.getConversionMetrics(period);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('Error fetching conversion metrics for period', { error, period: req.params.period });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversion metrics',
    });
  }
});

/**
 * Validate period format
 */
function isValidPeriod(period: string): boolean {
  // YYYY-MM format
  if (/^\d{4}-\d{2}$/.test(period)) {
    const [year, month] = period.split('-');
    const m = parseInt(month);
    return m >= 1 && m <= 12;
  }

  // YYYY-Q1 format
  if (/^\d{4}-Q[1-4]$/.test(period)) {
    return true;
  }

  // YYYY format
  if (/^\d{4}$/.test(period)) {
    return true;
  }

  return false;
}

export default router;
