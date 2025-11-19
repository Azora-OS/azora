import { prisma } from '../index';
import { CountryPricing, LocalizedPricing } from '../types';
import { logger } from '../utils/logger';
import Joi from 'joi';

// Country to currency mapping
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  IN: 'INR',
  ZA: 'ZAR',
  NG: 'NGN',
  KE: 'KES',
  GH: 'GHS',
  EG: 'EGP',
  BR: 'BRL',
  MX: 'MXN',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  JP: 'JPY',
  CN: 'CNY',
  SG: 'SGD',
  MY: 'MYR',
  TH: 'THB',
  PH: 'PHP',
  ID: 'IDR',
  VN: 'VND',
  PK: 'PKR',
  BD: 'BDT',
};

// Default pricing multipliers by country (relative to USD)
const COUNTRY_PRICE_MULTIPLIERS: Record<string, number> = {
  US: 1.0,
  GB: 0.85,
  CA: 1.35,
  AU: 1.55,
  IN: 0.012, // INR to USD conversion
  ZA: 0.053,
  NG: 0.0013,
  KE: 0.0077,
  GH: 0.065,
  EG: 0.032,
  BR: 0.2,
  MX: 0.058,
  DE: 0.92,
  FR: 0.92,
  IT: 0.92,
  ES: 0.92,
  JP: 0.0067,
  CN: 0.14,
  SG: 0.74,
  MY: 0.21,
  TH: 0.028,
  PH: 0.018,
  ID: 0.000063,
  VN: 0.000039,
  PK: 0.0036,
  BD: 0.0095,
};

const countryPricingSchema = Joi.object({
  pricingTierId: Joi.string().required(),
  countryCode: Joi.string().length(2).uppercase().required(),
  currency: Joi.string().length(3).uppercase().required(),
  monthlyPrice: Joi.number().min(0).required(),
  studentDiscount: Joi.number().min(0).max(100).default(0),
});

export class CurrencyService {
  /**
   * Get currency for a country
   */
  getCurrencyForCountry(countryCode: string): string {
    return COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()] || 'USD';
  }

  /**
   * Calculate localized price for a country
   */
  calculateLocalizedPrice(basePrice: number, countryCode: string): number {
    const multiplier = COUNTRY_PRICE_MULTIPLIERS[countryCode.toUpperCase()] || 1.0;
    return Math.round(basePrice * multiplier * 100) / 100;
  }

  /**
   * Create country-specific pricing
   */
  async createCountryPricing(data: any): Promise<CountryPricing> {
    try {
      const { error, value } = countryPricingSchema.validate(data);
      if (error) {
        throw new Error(`Validation error: ${error.message}`);
      }

      // Check if pricing already exists for this country
      const existingPricing = await prisma.countryPricing.findUnique({
        where: {
          pricingTierId_countryCode: {
            pricingTierId: value.pricingTierId,
            countryCode: value.countryCode,
          },
        },
      });

      if (existingPricing) {
        throw new Error(
          `Pricing already exists for tier ${value.pricingTierId} in country ${value.countryCode}`
        );
      }

      const pricing = await prisma.countryPricing.create({
        data: {
          pricingTierId: value.pricingTierId,
          countryCode: value.countryCode.toUpperCase(),
          currency: value.currency.toUpperCase(),
          monthlyPrice: value.monthlyPrice,
          studentDiscount: value.studentDiscount,
        },
      });

      logger.info(
        `Country pricing created: ${value.countryCode} - ${value.currency} ${value.monthlyPrice}`
      );
      return {
        ...pricing,
        monthlyPrice: Number(pricing.monthlyPrice),
      } as CountryPricing;
    } catch (error) {
      logger.error('Error creating country pricing:', error);
      throw error;
    }
  }

  /**
   * Get pricing for a specific country and tier
   */
  async getCountryPricing(
    pricingTierId: string,
    countryCode: string
  ): Promise<CountryPricing | null> {
    try {
      const pricing = await prisma.countryPricing.findUnique({
        where: {
          pricingTierId_countryCode: {
            pricingTierId,
            countryCode: countryCode.toUpperCase(),
          },
        },
      });

      return pricing
        ? ({
            ...pricing,
            monthlyPrice: Number(pricing.monthlyPrice),
          } as CountryPricing)
        : null;
    } catch (error) {
      logger.error(`Error getting country pricing for ${countryCode}:`, error);
      throw error;
    }
  }

  /**
   * Get all country pricing for a tier
   */
  async getAllCountryPricing(pricingTierId: string): Promise<CountryPricing[]> {
    try {
      const pricing = await prisma.countryPricing.findMany({
        where: { pricingTierId },
      });

      return pricing.map((p: any) => ({
        ...p,
        monthlyPrice: Number(p.monthlyPrice),
      })) as CountryPricing[];
    } catch (error) {
      logger.error(`Error getting all country pricing for tier ${pricingTierId}:`, error);
      throw error;
    }
  }

  /**
   * Update country pricing
   */
  async updateCountryPricing(
    pricingTierId: string,
    countryCode: string,
    data: any
  ): Promise<CountryPricing> {
    try {
      const updateSchema = Joi.object({
        monthlyPrice: Joi.number().min(0),
        studentDiscount: Joi.number().min(0).max(100),
        currency: Joi.string().length(3).uppercase(),
      });

      const { error, value } = updateSchema.validate(data);
      if (error) {
        throw new Error(`Validation error: ${error.message}`);
      }

      const pricing = await prisma.countryPricing.update({
        where: {
          pricingTierId_countryCode: {
            pricingTierId,
            countryCode: countryCode.toUpperCase(),
          },
        },
        data: {
          ...(value.monthlyPrice !== undefined && { monthlyPrice: value.monthlyPrice }),
          ...(value.studentDiscount !== undefined && { studentDiscount: value.studentDiscount }),
          ...(value.currency && { currency: value.currency.toUpperCase() }),
        },
      });

      logger.info(`Country pricing updated: ${countryCode}`);
      return {
        ...pricing,
        monthlyPrice: Number(pricing.monthlyPrice),
      } as CountryPricing;
    } catch (error) {
      logger.error(`Error updating country pricing for ${countryCode}:`, error);
      throw error;
    }
  }

  /**
   * Initialize country pricing for all tiers
   */
  async initializeCountryPricing(pricingTierId: string, basePrice: number): Promise<void> {
    try {
      const countries = Object.keys(COUNTRY_CURRENCY_MAP);

      for (const countryCode of countries) {
        const existingPricing = await prisma.countryPricing.findUnique({
          where: {
            pricingTierId_countryCode: {
              pricingTierId,
              countryCode,
            },
          },
        });

        if (!existingPricing) {
          const localizedPrice = this.calculateLocalizedPrice(basePrice, countryCode);
          const currency = this.getCurrencyForCountry(countryCode);

          await prisma.countryPricing.create({
            data: {
              pricingTierId,
              countryCode,
              currency,
              monthlyPrice: localizedPrice,
              studentDiscount: 0,
            },
          });
        }
      }

      logger.info(`Country pricing initialized for tier ${pricingTierId}`);
    } catch (error) {
      logger.error('Error initializing country pricing:', error);
      throw error;
    }
  }

  /**
   * Get localized pricing for a student
   */
  async getLocalizedPricing(
    tierName: string,
    countryCode: string,
    pricingService: any
  ): Promise<LocalizedPricing | null> {
    try {
      const tier = await pricingService.getTierByName(tierName);
      if (!tier) {
        return null;
      }

      const countryPricing = await this.getCountryPricing(tier.id, countryCode);

      if (!countryPricing) {
        // Fallback to calculated pricing if not explicitly set
        const localizedPrice = this.calculateLocalizedPrice(tier.monthlyPrice, countryCode);
        const currency = this.getCurrencyForCountry(countryCode);

        return {
          tier: tierName,
          countryCode: countryCode.toUpperCase(),
          currency,
          originalPrice: localizedPrice,
          studentDiscount: tier.studentDiscount,
          studentPrice: this.calculateStudentPrice(localizedPrice, tier.studentDiscount),
          savings: localizedPrice - this.calculateStudentPrice(localizedPrice, tier.studentDiscount),
          features: tier.features,
          limits: tier.limits,
        };
      }

      return {
        tier: tierName,
        countryCode: countryPricing.countryCode,
        currency: countryPricing.currency,
        originalPrice: Number(countryPricing.monthlyPrice),
        studentDiscount: countryPricing.studentDiscount,
        studentPrice: this.calculateStudentPrice(
          Number(countryPricing.monthlyPrice),
          countryPricing.studentDiscount
        ),
        savings:
          Number(countryPricing.monthlyPrice) -
          this.calculateStudentPrice(
            Number(countryPricing.monthlyPrice),
            countryPricing.studentDiscount
          ),
        features: tier.features,
        limits: tier.limits,
      };
    } catch (error) {
      logger.error(`Error getting localized pricing for ${countryCode}:`, error);
      throw error;
    }
  }

  /**
   * Calculate student price with discount
   */
  private calculateStudentPrice(monthlyPrice: number, studentDiscount: number): number {
    const discountAmount = (monthlyPrice * studentDiscount) / 100;
    return Math.round((monthlyPrice - discountAmount) * 100) / 100;
  }
}

export const currencyService = new CurrencyService();
