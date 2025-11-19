// Mock Prisma before importing the service
jest.mock('../../index', () => ({
  prisma: {
    countryPricing: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { currencyService } from '../currency.service';
import { prisma } from '../../index';

describe('CurrencyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrencyForCountry', () => {
    it('should return USD for US', () => {
      const currency = currencyService.getCurrencyForCountry('US');
      expect(currency).toBe('USD');
    });

    it('should return GBP for GB', () => {
      const currency = currencyService.getCurrencyForCountry('GB');
      expect(currency).toBe('GBP');
    });

    it('should return INR for IN', () => {
      const currency = currencyService.getCurrencyForCountry('IN');
      expect(currency).toBe('INR');
    });

    it('should return ZAR for ZA', () => {
      const currency = currencyService.getCurrencyForCountry('ZA');
      expect(currency).toBe('ZAR');
    });

    it('should return USD for unknown country', () => {
      const currency = currencyService.getCurrencyForCountry('XX');
      expect(currency).toBe('USD');
    });

    it('should handle lowercase country codes', () => {
      const currency = currencyService.getCurrencyForCountry('us');
      expect(currency).toBe('USD');
    });
  });

  describe('calculateLocalizedPrice', () => {
    it('should return base price for US', () => {
      const price = currencyService.calculateLocalizedPrice(29.99, 'US');
      expect(price).toBeCloseTo(29.99, 2);
    });

    it('should apply multiplier for GB', () => {
      const price = currencyService.calculateLocalizedPrice(29.99, 'GB');
      expect(price).toBeCloseTo(25.49, 2);
    });

    it('should apply multiplier for IN', () => {
      const price = currencyService.calculateLocalizedPrice(29.99, 'IN');
      expect(price).toBeCloseTo(0.36, 2);
    });

    it('should apply multiplier for ZA', () => {
      const price = currencyService.calculateLocalizedPrice(29.99, 'ZA');
      expect(price).toBeCloseTo(1.59, 2);
    });

    it('should handle unknown countries with 1.0 multiplier', () => {
      const price = currencyService.calculateLocalizedPrice(29.99, 'XX');
      expect(price).toBeCloseTo(29.99, 2);
    });
  });

  describe('createCountryPricing', () => {
    it('should create country pricing', async () => {
      const data = {
        pricingTierId: 'tier-1',
        countryCode: 'us',
        currency: 'usd',
        monthlyPrice: 29.99,
        studentDiscount: 50,
      };

      const mockPricing = {
        id: 'pricing-1',
        pricingTierId: 'tier-1',
        countryCode: 'US',
        currency: 'USD',
        monthlyPrice: 29.99,
        studentDiscount: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.countryPricing.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.countryPricing.create as jest.Mock).mockResolvedValue(mockPricing);

      const result = await currencyService.createCountryPricing(data);

      expect(result.countryCode).toBe('US');
      expect(result.currency).toBe('USD');
      expect(result.monthlyPrice).toBe(29.99);
      expect(prisma.countryPricing.create).toHaveBeenCalled();
    });

    it('should throw error if pricing already exists', async () => {
      const data = {
        pricingTierId: 'tier-1',
        countryCode: 'US',
        currency: 'USD',
        monthlyPrice: 29.99,
        studentDiscount: 50,
      };

      (prisma.countryPricing.findUnique as jest.Mock).mockResolvedValue({
        id: 'pricing-1',
        ...data,
      });

      await expect(currencyService.createCountryPricing(data)).rejects.toThrow(
        'Pricing already exists'
      );
    });

    it('should throw validation error for invalid data', async () => {
      const invalidData = {
        pricingTierId: 'tier-1',
        countryCode: 'INVALID',
        currency: 'USD',
        monthlyPrice: -10,
      };

      await expect(currencyService.createCountryPricing(invalidData)).rejects.toThrow();
    });
  });

  describe('getCountryPricing', () => {
    it('should return country pricing', async () => {
      const mockPricing = {
        id: 'pricing-1',
        pricingTierId: 'tier-1',
        countryCode: 'US',
        currency: 'USD',
        monthlyPrice: 29.99,
        studentDiscount: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.countryPricing.findUnique as jest.Mock).mockResolvedValue(mockPricing);

      const result = await currencyService.getCountryPricing('tier-1', 'US');

      expect(result).not.toBeNull();
      expect(result?.countryCode).toBe('US');
      expect(result?.currency).toBe('USD');
    });

    it('should return null if pricing not found', async () => {
      (prisma.countryPricing.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await currencyService.getCountryPricing('tier-1', 'US');

      expect(result).toBeNull();
    });
  });

  describe('getAllCountryPricing', () => {
    it('should return all country pricing for a tier', async () => {
      const mockPricing = [
        {
          id: 'pricing-1',
          pricingTierId: 'tier-1',
          countryCode: 'US',
          currency: 'USD',
          monthlyPrice: 29.99,
          studentDiscount: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'pricing-2',
          pricingTierId: 'tier-1',
          countryCode: 'GB',
          currency: 'GBP',
          monthlyPrice: 25.49,
          studentDiscount: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.countryPricing.findMany as jest.Mock).mockResolvedValue(mockPricing);

      const result = await currencyService.getAllCountryPricing('tier-1');

      expect(result).toHaveLength(2);
      expect(result[0].countryCode).toBe('US');
      expect(result[1].countryCode).toBe('GB');
    });
  });

  describe('updateCountryPricing', () => {
    it('should update country pricing', async () => {
      const mockUpdated = {
        id: 'pricing-1',
        pricingTierId: 'tier-1',
        countryCode: 'US',
        currency: 'USD',
        monthlyPrice: 39.99,
        studentDiscount: 40,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.countryPricing.update as jest.Mock).mockResolvedValue(mockUpdated);

      const result = await currencyService.updateCountryPricing('tier-1', 'US', {
        monthlyPrice: 39.99,
        studentDiscount: 40,
      });

      expect(result.monthlyPrice).toBe(39.99);
      expect(result.studentDiscount).toBe(40);
    });
  });

  describe('getLocalizedPricing', () => {
    it('should return localized pricing with country-specific data', async () => {
      const mockTier = {
        id: 'tier-1',
        name: 'premium',
        monthlyPrice: 29.99,
        studentDiscount: 50,
        features: [],
        limits: {
          coursesPerMonth: 999999,
          aiQueriesPerMonth: 999999,
          storageGB: 10,
          supportLevel: 'priority',
        },
      };

      const mockCountryPricing = {
        id: 'pricing-1',
        pricingTierId: 'tier-1',
        countryCode: 'GB',
        currency: 'GBP',
        monthlyPrice: 25.49,
        studentDiscount: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPricingService = {
        getTierByName: jest.fn().mockResolvedValue(mockTier),
      };

      (prisma.countryPricing.findUnique as jest.Mock).mockResolvedValue(mockCountryPricing);

      const result = await currencyService.getLocalizedPricing(
        'premium',
        'GB',
        mockPricingService
      );

      expect(result).not.toBeNull();
      expect(result?.countryCode).toBe('GB');
      expect(result?.currency).toBe('GBP');
      expect(result?.originalPrice).toBe(25.49);
      expect(result?.studentDiscount).toBe(50);
    });

    it('should fallback to calculated pricing if not explicitly set', async () => {
      const mockTier = {
        id: 'tier-1',
        name: 'premium',
        monthlyPrice: 29.99,
        studentDiscount: 50,
        features: [],
        limits: {
          coursesPerMonth: 999999,
          aiQueriesPerMonth: 999999,
          storageGB: 10,
          supportLevel: 'priority',
        },
      };

      const mockPricingService = {
        getTierByName: jest.fn().mockResolvedValue(mockTier),
      };

      (prisma.countryPricing.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await currencyService.getLocalizedPricing(
        'premium',
        'IN',
        mockPricingService
      );

      expect(result).not.toBeNull();
      expect(result?.countryCode).toBe('IN');
      expect(result?.currency).toBe('INR');
      expect(result?.originalPrice).toBeCloseTo(0.36, 2);
    });
  });
});
