/**
 * Pricing & Benefits Routes
 * 
 * API endpoints for pricing operations and benefits management
 */

import { Router, Request, Response } from 'express';
import { PricingService } from '../services/pricing.service';
import { ElaraLogger } from '../utils/logger';

const router = Router();
const service = new PricingService();
const logger = new ElaraLogger('PricingRoutes');

/**
 * GET /pricing/:userType
 * Get pricing tiers for a user type
 */
router.get('/pricing/:userType', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userType } = req.params;

    const tiers = await service.getPricingTiers(userType as any);

    res.json({
      success: true,
      data: tiers,
    });
  } catch (error) {
    logger.error('Error getting pricing tiers:', error);
    res.status(500).json({
      error: 'Failed to get pricing tiers',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /benefits/:userType
 * Get benefits for a user type
 */
router.get('/benefits/:userType', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userType } = req.params;
    const { studentTier } = req.query;

    const benefits = await service.getBenefits(userType as any, studentTier as string);

    res.json({
      success: true,
      data: benefits,
    });
  } catch (error) {
    logger.error('Error getting benefits:', error);
    res.status(500).json({
      error: 'Failed to get benefits',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /pricing/calculate
 * Calculate pricing for a service
 */
router.post('/pricing/calculate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { basePrice, userType, studentTier } = req.body;

    if (!basePrice || !userType) {
      res.status(400).json({
        error: 'Missing required fields: basePrice, userType',
      });
      return;
    }

    const calculation = await service.calculatePricing(basePrice, userType, studentTier);

    res.json({
      success: true,
      data: calculation,
    });
  } catch (error) {
    logger.error('Error calculating pricing:', error);
    res.status(500).json({
      error: 'Failed to calculate pricing',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /student/tier/:tier
 * Get student tier information
 */
router.get('/student/tier/:tier', async (req: Request, res: Response): Promise<void> => {
  try {
    const { tier } = req.params;

    const studentTier = await service.getStudentTier(tier);

    res.json({
      success: true,
      data: studentTier,
    });
  } catch (error) {
    logger.error('Error getting student tier:', error);
    res.status(500).json({
      error: 'Failed to get student tier',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /student/verify
 * Verify student status
 */
router.post('/student/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        error: 'Missing required field: email',
      });
      return;
    }

    const verified = await service.verifyStudent(email);

    res.json({
      success: true,
      data: {
        email,
        verified,
      },
    });
  } catch (error) {
    logger.error('Error verifying student:', error);
    res.status(500).json({
      error: 'Failed to verify student',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /pricing/apply-discount
 * Apply discount to a price
 */
router.post('/pricing/apply-discount', async (req: Request, res: Response): Promise<void> => {
  try {
    const { basePrice, discountPercentage } = req.body;

    if (!basePrice || discountPercentage === undefined) {
      res.status(400).json({
        error: 'Missing required fields: basePrice, discountPercentage',
      });
      return;
    }

    const finalPrice = await service.applyDiscount(basePrice, discountPercentage);

    res.json({
      success: true,
      data: {
        basePrice,
        discountPercentage,
        finalPrice,
      },
    });
  } catch (error) {
    logger.error('Error applying discount:', error);
    res.status(500).json({
      error: 'Failed to apply discount',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /pricing/report
 * Generate pricing report
 */
router.post('/pricing/report', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userType, totalUsers } = req.body;

    if (!userType || !totalUsers) {
      res.status(400).json({
        error: 'Missing required fields: userType, totalUsers',
      });
      return;
    }

    const report = await service.generatePricingReport(userType, totalUsers);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error('Error generating pricing report:', error);
    res.status(500).json({
      error: 'Failed to generate pricing report',
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
    service: 'pricing',
    timestamp: new Date(),
  });
});

export default router;
