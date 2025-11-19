import { prisma } from '../index';
import { PricingTier, TierLimits } from '../types';
import { logger } from '../utils/logger';
import Joi from 'joi';

// Validation schemas
const pricingTierSchema = Joi.object({
  name: Joi.string().valid('free', 'premium', 'pro').required(),
  monthlyPrice: Joi.number().min(0).required(),
  studentDiscount: Joi.number().min(0).max(100).required(),
  features: Joi.array().items(Joi.string()).required(),
  coursesPerMonth: Joi.number().min(0).required(),
  aiQueriesPerMonth: Joi.number().min(0).required(),
  storageGB: Joi.number().min(0).required(),
  supportLevel: Joi.string().valid('community', 'priority', 'dedicated').required(),
});

// Default tier configurations
const DEFAULT_TIERS = {
  free: {
    name: 'free',
    monthlyPrice: 0,
    studentDiscount: 0,
    features: [
      'Access to 3 foundational courses',
      '10 AI queries per month',
      '1GB storage',
      'Community support',
    ],
    coursesPerMonth: 3,
    aiQueriesPerMonth: 10,
    storageGB: 1,
    supportLevel: 'community',
  },
  premium: {
    name: 'premium',
    monthlyPrice: 29.99,
    studentDiscount: 50,
    features: [
      'Unlimited courses',
      'Unlimited AI queries',
      '10GB storage',
      'Priority support',
      'Certification services',
      'Advanced analytics',
    ],
    coursesPerMonth: 999999,
    aiQueriesPerMonth: 999999,
    storageGB: 10,
    supportLevel: 'priority',
  },
  pro: {
    name: 'pro',
    monthlyPrice: 99.99,
    studentDiscount: 30,
    features: [
      'All Premium features',
      'API access',
      'Advanced AI features',
      'Development tools',
      'Dedicated support',
      'Custom integrations',
    ],
    coursesPerMonth: 999999,
    aiQueriesPerMonth: 999999,
    storageGB: 100,
    supportLevel: 'dedicated',
  },
};

export class PricingService {
  /**
   * Initialize default pricing tiers in the database
   */
  async initializeDefaultTiers(): Promise<void> {
    try {
      const tierEntries = Object.values(DEFAULT_TIERS) as const;
      for (const tierData of tierEntries) {
        const existingTier = await prisma.pricingTier.findUnique({
          where: { name: tierData.name },
        });

        if (!existingTier) {
          await prisma.pricingTier.create({
            data: {
              name: tierData.name,
              monthlyPrice: tierData.monthlyPrice,
              studentDiscount: tierData.studentDiscount,
              features: tierData.features,
              coursesPerMonth: tierData.coursesPerMonth,
              aiQueriesPerMonth: tierData.aiQueriesPerMonth,
              storageGB: tierData.storageGB,
              supportLevel: tierData.supportLevel,
            },
          });
          logger.info(`Pricing tier initialized: ${tierData.name}`);
        }
      }
    } catch (error) {
      logger.error('Error initializing default pricing tiers:', error);
      throw error;
    }
  }

  /**
   * Get all pricing tiers
   */
  async getAllTiers(): Promise<PricingTier[]> {
    try {
      const tiers = await prisma.pricingTier.findMany({
        orderBy: { monthlyPrice: 'asc' },
      });

      return tiers.map((tier: any) => this.mapTierToInterface(tier));
    } catch (error) {
      logger.error('Error getting all pricing tiers:', error);
      throw error;
    }
  }

  /**
   * Get a specific pricing tier by name
   */
  async getTierByName(tierName: string): Promise<PricingTier | null> {
    try {
      const tier = await prisma.pricingTier.findUnique({
        where: { name: tierName },
      });

      return tier ? this.mapTierToInterface(tier) : null;
    } catch (error) {
      logger.error(`Error getting pricing tier ${tierName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new pricing tier
   */
  async createTier(data: any): Promise<PricingTier> {
    try {
      const { error, value } = pricingTierSchema.validate(data);
      if (error) {
        throw new Error(`Validation error: ${error.message}`);
      }

      // Check if tier already exists
      const existingTier = await prisma.pricingTier.findUnique({
        where: { name: value.name },
      });

      if (existingTier) {
        throw new Error(`Pricing tier ${value.name} already exists`);
      }

      const tier = await prisma.pricingTier.create({
        data: {
          name: value.name,
          monthlyPrice: value.monthlyPrice,
          studentDiscount: value.studentDiscount,
          features: value.features,
          coursesPerMonth: value.coursesPerMonth,
          aiQueriesPerMonth: value.aiQueriesPerMonth,
          storageGB: value.storageGB,
          supportLevel: value.supportLevel,
        },
      });

      logger.info(`Pricing tier created: ${tier.name}`);
      return this.mapTierToInterface(tier);
    } catch (error) {
      logger.error('Error creating pricing tier:', error);
      throw error;
    }
  }

  /**
   * Update a pricing tier
   */
  async updateTier(tierName: string, data: any): Promise<PricingTier> {
    try {
      // Create a partial schema for updates
      const updateSchema = Joi.object({
        monthlyPrice: Joi.number().min(0),
        studentDiscount: Joi.number().min(0).max(100),
        features: Joi.array().items(Joi.string()),
        coursesPerMonth: Joi.number().min(0),
        aiQueriesPerMonth: Joi.number().min(0),
        storageGB: Joi.number().min(0),
        supportLevel: Joi.string().valid('community', 'priority', 'dedicated'),
      });

      const { error, value } = updateSchema.validate(data);
      if (error) {
        throw new Error(`Validation error: ${error.message}`);
      }

      const tier = await prisma.pricingTier.update({
        where: { name: tierName },
        data: {
          ...(value.monthlyPrice !== undefined && { monthlyPrice: value.monthlyPrice }),
          ...(value.studentDiscount !== undefined && { studentDiscount: value.studentDiscount }),
          ...(value.features && { features: value.features }),
          ...(value.coursesPerMonth !== undefined && { coursesPerMonth: value.coursesPerMonth }),
          ...(value.aiQueriesPerMonth !== undefined && { aiQueriesPerMonth: value.aiQueriesPerMonth }),
          ...(value.storageGB !== undefined && { storageGB: value.storageGB }),
          ...(value.supportLevel && { supportLevel: value.supportLevel }),
        },
      });

      logger.info(`Pricing tier updated: ${tierName}`);
      return this.mapTierToInterface(tier);
    } catch (error) {
      logger.error(`Error updating pricing tier ${tierName}:`, error);
      throw error;
    }
  }

  /**
   * Calculate the price for a student based on tier and discount
   */
  calculateStudentPrice(monthlyPrice: number, studentDiscount: number): number {
    const discountAmount = (monthlyPrice * studentDiscount) / 100;
    return monthlyPrice - discountAmount;
  }

  /**
   * Get tier limits for a specific tier
   */
  async getTierLimits(tierName: string): Promise<TierLimits | null> {
    try {
      const tier = await prisma.pricingTier.findUnique({
        where: { name: tierName },
      });

      if (!tier) {
        return null;
      }

      return {
        coursesPerMonth: tier.coursesPerMonth,
        aiQueriesPerMonth: tier.aiQueriesPerMonth,
        storageGB: tier.storageGB,
        supportLevel: tier.supportLevel as 'community' | 'priority' | 'dedicated',
      };
    } catch (error) {
      logger.error(`Error getting tier limits for ${tierName}:`, error);
      throw error;
    }
  }

  /**
   * Check if a student can access a course based on their tier
   */
  async canAccessCourse(studentTier: string, courseTier: string): Promise<boolean> {
    try {
      const tierHierarchy = { free: 0, premium: 1, pro: 2 };
      const studentLevel = tierHierarchy[studentTier as keyof typeof tierHierarchy] ?? -1;
      const courseLevel = tierHierarchy[courseTier as keyof typeof tierHierarchy] ?? -1;

      return studentLevel >= courseLevel;
    } catch (error) {
      logger.error('Error checking course access:', error);
      throw error;
    }
  }

  /**
   * Get pricing information for a student (with discount applied)
   */
  async getStudentPricing(tierName: string): Promise<any> {
    try {
      const tier = await prisma.pricingTier.findUnique({
        where: { name: tierName },
      });

      if (!tier) {
        throw new Error(`Pricing tier ${tierName} not found`);
      }

      const studentPrice = this.calculateStudentPrice(
        Number(tier.monthlyPrice),
        tier.studentDiscount
      );

      return {
        tier: tier.name,
        originalPrice: Number(tier.monthlyPrice),
        studentDiscount: tier.studentDiscount,
        studentPrice,
        savings: Number(tier.monthlyPrice) - studentPrice,
        features: tier.features,
        limits: {
          coursesPerMonth: tier.coursesPerMonth,
          aiQueriesPerMonth: tier.aiQueriesPerMonth,
          storageGB: tier.storageGB,
          supportLevel: tier.supportLevel,
        },
      };
    } catch (error) {
      logger.error(`Error getting student pricing for ${tierName}:`, error);
      throw error;
    }
  }

  /**
   * Map database tier to interface
   */
  private mapTierToInterface(tier: any): PricingTier {
    return {
      id: tier.id,
      name: tier.name as 'free' | 'premium' | 'pro',
      monthlyPrice: Number(tier.monthlyPrice),
      studentDiscount: tier.studentDiscount,
      features: tier.features.map((f: string) => ({
        id: `${tier.name}-${f}`,
        name: f,
        description: f,
        tier: tier.name,
      })),
      limits: {
        coursesPerMonth: tier.coursesPerMonth,
        aiQueriesPerMonth: tier.aiQueriesPerMonth,
        storageGB: tier.storageGB,
        supportLevel: tier.supportLevel as 'community' | 'priority' | 'dedicated',
      },
    };
  }
}

export const pricingService = new PricingService();
