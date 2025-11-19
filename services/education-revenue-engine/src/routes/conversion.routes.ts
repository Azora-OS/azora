import express, { Router, Request, Response } from 'express';
import { conversionService } from '../services/conversion.service';
import { logger } from '../utils/logger';

const router: Router = express.Router();

/**
 * POST /api/v1/conversions/track
 * Track a conversion event (module completion, assessment pass, course completion)
 */
router.post('/track', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, eventType, triggerValue } = req.body;

    if (!studentId || !eventType || triggerValue === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: studentId, eventType, triggerValue',
        timestamp: new Date(),
      });
      return;
    }

    const event = await conversionService.trackConversionEvent({
      studentId,
      eventType,
      triggerValue,
    });

    res.status(201).json({
      success: true,
      data: event,
      timestamp: new Date(),
    });
  } catch (error: any) {
    logger.error('Error tracking conversion event:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to track conversion event',
      timestamp: new Date(),
    });
  }
});

/**
 * GET /api/v1/conversions/:studentId
 * Get conversion events and active offers for a student
 */
router.get('/:studentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameter: studentId',
        timestamp: new Date(),
      });
      return;
    }

    const [events, offers] = await Promise.all([
      conversionService.getStudentConversionEvents(studentId),
      conversionService.getStudentActiveOffers(studentId),
    ]);

    res.status(200).json({
      success: true,
      data: {
        events,
        activeOffers: offers,
      },
      timestamp: new Date(),
    });
  } catch (error: any) {
    logger.error('Error getting conversion data:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get conversion data',
      timestamp: new Date(),
    });
  }
});

/**
 * POST /api/v1/conversions/offers
 * Create a conversion offer
 */
router.post('/offers', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, offerType, discount, expirationDays } = req.body;

    if (!studentId || !offerType || discount === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: studentId, offerType, discount',
        timestamp: new Date(),
      });
      return;
    }

    const offer = await conversionService.createConversionOffer({
      studentId,
      offerType,
      discount,
      expirationDays: expirationDays || 7,
    });

    res.status(201).json({
      success: true,
      data: offer,
      timestamp: new Date(),
    });
  } catch (error: any) {
    logger.error('Error creating conversion offer:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create conversion offer',
      timestamp: new Date(),
    });
  }
});

/**
 * GET /api/v1/conversions/offers/:offerId
 * Get a specific conversion offer
 */
router.get('/offers/:offerId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { offerId } = req.params;

    if (!offerId) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameter: offerId',
        timestamp: new Date(),
      });
      return;
    }

    const offer = await conversionService.getConversionOffer(offerId);

    if (!offer) {
      res.status(404).json({
        success: false,
        error: 'Offer not found',
        timestamp: new Date(),
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: offer,
      timestamp: new Date(),
    });
  } catch (error: any) {
    logger.error('Error getting conversion offer:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get conversion offer',
      timestamp: new Date(),
    });
  }
});

/**
 * POST /api/v1/conversions/offers/:offerId/accept
 * Accept a conversion offer
 */
router.post('/offers/:offerId/accept', async (req: Request, res: Response): Promise<void> => {
  try {
    const { offerId } = req.params;

    if (!offerId) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameter: offerId',
        timestamp: new Date(),
      });
      return;
    }

    const offer = await conversionService.acceptConversionOffer(offerId);

    res.status(200).json({
      success: true,
      data: offer,
      message: 'Offer accepted successfully. Your tier has been upgraded to premium.',
      timestamp: new Date(),
    });
  } catch (error: any) {
    logger.error('Error accepting conversion offer:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to accept conversion offer',
      timestamp: new Date(),
    });
  }
});

/**
 * GET /api/v1/conversions/metrics/:period
 * Get conversion metrics for a period (e.g., "2024-01")
 */
router.get('/metrics/:period', async (req: Request, res: Response): Promise<void> => {
  try {
    const { period } = req.params;

    if (!period || !/^\d{4}-\d{2}$/.test(period)) {
      res.status(400).json({
        success: false,
        error: 'Invalid period format. Use YYYY-MM (e.g., 2024-01)',
        timestamp: new Date(),
      });
      return;
    }

    const metrics = await conversionService.getConversionMetrics(period);

    res.status(200).json({
      success: true,
      data: metrics,
      timestamp: new Date(),
    });
  } catch (error: any) {
    logger.error('Error getting conversion metrics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get conversion metrics',
      timestamp: new Date(),
    });
  }
});

export default router;
