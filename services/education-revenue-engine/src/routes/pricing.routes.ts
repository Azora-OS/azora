import { Router, Request, Response, NextFunction } from 'express';
import { pricingService } from '../services/pricing.service';
import { currencyService } from '../services/currency.service';

const router = Router();

/**
 * GET /api/v1/pricing/tiers
 * Get all available pricing tiers
 */
router.get('/tiers', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tiers = await pricingService.getAllTiers();

    res.json({
      success: true,
      data: tiers,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/pricing/tiers/:tier
 * Get a specific pricing tier by name
 */
router.get('/tiers/:tier', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tier = await pricingService.getTierByName(req.params.tier);

    if (!tier) {
      res.status(404).json({
        success: false,
        error: `Pricing tier ${req.params.tier} not found`,
        timestamp: new Date(),
      });
      return;
    }

    res.json({
      success: true,
      data: tier,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/pricing/student/:tier
 * Get pricing information for a student (with discount applied)
 */
router.get('/student/:tier', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pricing = await pricingService.getStudentPricing(req.params.tier);

    res.json({
      success: true,
      data: pricing,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/pricing/limits/:tier
 * Get tier limits for a specific tier
 */
router.get('/limits/:tier', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limits = await pricingService.getTierLimits(req.params.tier);

    if (!limits) {
      res.status(404).json({
        success: false,
        error: `Pricing tier ${req.params.tier} not found`,
        timestamp: new Date(),
      });
      return;
    }

    res.json({
      success: true,
      data: limits,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/pricing/check-access
 * Check if a student can access a course based on their tier
 */
router.post('/check-access', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentTier, courseTier } = req.body;

    if (!studentTier || !courseTier) {
      res.status(400).json({
        success: false,
        error: 'studentTier and courseTier are required',
        timestamp: new Date(),
      });
      return;
    }

    const canAccess = await pricingService.canAccessCourse(studentTier, courseTier);

    res.json({
      success: true,
      data: {
        studentTier,
        courseTier,
        canAccess,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/pricing/calculate-price
 * Calculate the price for a student based on tier and discount
 */
router.post('/calculate-price', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { monthlyPrice, studentDiscount } = req.body;

    if (monthlyPrice === undefined || studentDiscount === undefined) {
      res.status(400).json({
        success: false,
        error: 'monthlyPrice and studentDiscount are required',
        timestamp: new Date(),
      });
      return;
    }

    const studentPrice = pricingService.calculateStudentPrice(monthlyPrice, studentDiscount);

    res.json({
      success: true,
      data: {
        originalPrice: monthlyPrice,
        studentDiscount,
        studentPrice,
        savings: monthlyPrice - studentPrice,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/pricing/tiers
 * Create a new pricing tier (admin only)
 */
router.post('/tiers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tier = await pricingService.createTier(req.body);

    res.status(201).json({
      success: true,
      data: tier,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/pricing/tiers/:tier
 * Update a pricing tier (admin only)
 */
router.put('/tiers/:tier', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tier = await pricingService.updateTier(req.params.tier, req.body);

    res.json({
      success: true,
      data: tier,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/pricing/localized/:tier/:country
 * Get localized pricing for a specific country
 */
router.get(
  '/localized/:tier/:country',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pricing = await currencyService.getLocalizedPricing(
        req.params.tier,
        req.params.country,
        pricingService
      );

      if (!pricing) {
        res.status(404).json({
          success: false,
          error: `Pricing not found for tier ${req.params.tier} in country ${req.params.country}`,
          timestamp: new Date(),
        });
        return;
      }

      res.json({
        success: true,
        data: pricing,
        timestamp: new Date(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/pricing/country/:country
 * Get currency information for a country
 */
router.get(
  '/country/:country',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const countryCode = _req.params.country.toUpperCase();
      const currency = currencyService.getCurrencyForCountry(countryCode);

      res.json({
        success: true,
        data: {
          countryCode,
          currency,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/pricing/country-pricing
 * Create country-specific pricing (admin only)
 */
router.post('/country-pricing', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pricing = await currencyService.createCountryPricing(req.body);

    res.status(201).json({
      success: true,
      data: pricing,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/pricing/country-pricing/:tierId/:country
 * Get country-specific pricing
 */
router.get(
  '/country-pricing/:tierId/:country',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pricing = await currencyService.getCountryPricing(
        req.params.tierId,
        req.params.country
      );

      if (!pricing) {
        res.status(404).json({
          success: false,
          error: `Pricing not found for tier ${req.params.tierId} in country ${req.params.country}`,
          timestamp: new Date(),
        });
        return;
      }

      res.json({
        success: true,
        data: pricing,
        timestamp: new Date(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/pricing/country-pricing/:tierId/:country
 * Update country-specific pricing (admin only)
 */
router.put(
  '/country-pricing/:tierId/:country',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pricing = await currencyService.updateCountryPricing(
        req.params.tierId,
        req.params.country,
        req.body
      );

      res.json({
        success: true,
        data: pricing,
        timestamp: new Date(),
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/pricing/country-pricing/tier/:tierId
 * Get all country pricing for a tier
 */
router.get(
  '/country-pricing/tier/:tierId',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pricing = await currencyService.getAllCountryPricing(req.params.tierId);

      res.json({
        success: true,
        data: pricing,
        timestamp: new Date(),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
