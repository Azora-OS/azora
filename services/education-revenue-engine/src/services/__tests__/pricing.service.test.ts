// Mock Prisma before importing the service
jest.mock('../../index', () => ({
  prisma: {
    pricingTier: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { pricingService } from '../pricing.service';
import { prisma } from '../../index';

describe('PricingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTiers', () => {
    it('should return all pricing tiers sorted by price', async () => {
      const mockTiers = [
        {
          id: '1',
          name: 'free',
          monthlyPrice: 0,
          studentDiscount: 0,
          features: ['Feature 1'],
          coursesPerMonth: 3,
          aiQueriesPerMonth: 10,
          storageGB: 1,
          supportLevel: 'community',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'premium',
          monthlyPrice: 29.99,
          studentDiscount: 50,
          features: ['Feature 1', 'Feature 2'],
          coursesPerMonth: 999999,
          aiQueriesPerMonth: 999999,
          storageGB: 10,
          supportLevel: 'priority',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.pricingTier.findMany as jest.Mock).mockResolvedValue(mockTiers);

      const result = await pricingService.getAllTiers();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('free');
      expect(result[1].name).toBe('premium');
      expect(prisma.pricingTier.findMany).toHaveBeenCalledWith({
        orderBy: { monthlyPrice: 'asc' },
      });
    });
  });

  describe('getTierByName', () => {
    it('should return a specific tier by name', async () => {
      const mockTier = {
        id: '1',
        name: 'premium',
        monthlyPrice: 29.99,
        studentDiscount: 50,
        features: ['Feature 1', 'Feature 2'],
        coursesPerMonth: 999999,
        aiQueriesPerMonth: 999999,
        storageGB: 10,
        supportLevel: 'priority',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.pricingTier.findUnique as jest.Mock).mockResolvedValue(mockTier);

      const result = await pricingService.getTierByName('premium');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('premium');
      expect(prisma.pricingTier.findUnique).toHaveBeenCalledWith({
        where: { name: 'premium' },
      });
    });

    it('should return null if tier does not exist', async () => {
      (prisma.pricingTier.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await pricingService.getTierByName('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('calculateStudentPrice', () => {
    it('should calculate correct student price with discount', () => {
      const price = pricingService.calculateStudentPrice(100, 50);
      expect(price).toBe(50);
    });

    it('should calculate correct student price with 30% discount', () => {
      const price = pricingService.calculateStudentPrice(99.99, 30);
      expect(price).toBeCloseTo(69.99, 2);
    });

    it('should return original price with 0% discount', () => {
      const price = pricingService.calculateStudentPrice(29.99, 0);
      expect(price).toBe(29.99);
    });
  });

  describe('getTierLimits', () => {
    it('should return tier limits for a specific tier', async () => {
      const mockTier = {
        id: '1',
        name: 'premium',
        monthlyPrice: 29.99,
        studentDiscount: 50,
        features: ['Feature 1'],
        coursesPerMonth: 999999,
        aiQueriesPerMonth: 999999,
        storageGB: 10,
        supportLevel: 'priority',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.pricingTier.findUnique as jest.Mock).mockResolvedValue(mockTier);

      const result = await pricingService.getTierLimits('premium');

      expect(result).not.toBeNull();
      expect(result?.coursesPerMonth).toBe(999999);
      expect(result?.aiQueriesPerMonth).toBe(999999);
      expect(result?.storageGB).toBe(10);
      expect(result?.supportLevel).toBe('priority');
    });

    it('should return null if tier does not exist', async () => {
      (prisma.pricingTier.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await pricingService.getTierLimits('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('canAccessCourse', () => {
    it('should allow free tier student to access free course', async () => {
      const result = await pricingService.canAccessCourse('free', 'free');
      expect(result).toBe(true);
    });

    it('should prevent free tier student from accessing premium course', async () => {
      const result = await pricingService.canAccessCourse('free', 'premium');
      expect(result).toBe(false);
    });

    it('should allow premium tier student to access free course', async () => {
      const result = await pricingService.canAccessCourse('premium', 'free');
      expect(result).toBe(true);
    });

    it('should allow premium tier student to access premium course', async () => {
      const result = await pricingService.canAccessCourse('premium', 'premium');
      expect(result).toBe(true);
    });

    it('should allow pro tier student to access all courses', async () => {
      expect(await pricingService.canAccessCourse('pro', 'free')).toBe(true);
      expect(await pricingService.canAccessCourse('pro', 'premium')).toBe(true);
      expect(await pricingService.canAccessCourse('pro', 'pro')).toBe(true);
    });
  });

  describe('getStudentPricing', () => {
    it('should return student pricing with discount applied', async () => {
      const mockTier = {
        id: '1',
        name: 'premium',
        monthlyPrice: 29.99,
        studentDiscount: 50,
        features: ['Feature 1', 'Feature 2'],
        coursesPerMonth: 999999,
        aiQueriesPerMonth: 999999,
        storageGB: 10,
        supportLevel: 'priority',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.pricingTier.findUnique as jest.Mock).mockResolvedValue(mockTier);

      const result = await pricingService.getStudentPricing('premium');

      expect(result.tier).toBe('premium');
      expect(result.originalPrice).toBe(29.99);
      expect(result.studentDiscount).toBe(50);
      expect(result.studentPrice).toBeCloseTo(14.995, 2);
      expect(result.savings).toBeCloseTo(14.995, 2);
      expect(result.features).toHaveLength(2);
      expect(result.limits.coursesPerMonth).toBe(999999);
    });

    it('should throw error if tier does not exist', async () => {
      (prisma.pricingTier.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(pricingService.getStudentPricing('nonexistent')).rejects.toThrow(
        'Pricing tier nonexistent not found'
      );
    });
  });

  describe('createTier', () => {
    it('should create a new pricing tier', async () => {
      const tierData = {
        name: 'pro',
        monthlyPrice: 299.99,
        studentDiscount: 20,
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
        coursesPerMonth: 999999,
        aiQueriesPerMonth: 999999,
        storageGB: 500,
        supportLevel: 'dedicated',
      };

      const mockCreatedTier = {
        id: '3',
        ...tierData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.pricingTier.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.pricingTier.create as jest.Mock).mockResolvedValue(mockCreatedTier);

      const result = await pricingService.createTier(tierData);

      expect(result.name).toBe('pro');
      expect(result.monthlyPrice).toBe(299.99);
      expect(prisma.pricingTier.create).toHaveBeenCalled();
    });

    it('should throw error if tier already exists', async () => {
      const tierData = {
        name: 'premium',
        monthlyPrice: 29.99,
        studentDiscount: 50,
        features: ['Feature 1'],
        coursesPerMonth: 999999,
        aiQueriesPerMonth: 999999,
        storageGB: 10,
        supportLevel: 'priority',
      };

      (prisma.pricingTier.findUnique as jest.Mock).mockResolvedValue({
        id: '2',
        ...tierData,
      });

      await expect(pricingService.createTier(tierData)).rejects.toThrow(
        'Pricing tier premium already exists'
      );
    });

    it('should throw validation error for invalid data', async () => {
      const invalidData = {
        name: 'invalid_tier',
        monthlyPrice: -10,
      };

      await expect(pricingService.createTier(invalidData)).rejects.toThrow();
    });
  });

  describe('updateTier', () => {
    it('should update an existing pricing tier', async () => {
      const updateData = {
        monthlyPrice: 39.99,
        studentDiscount: 40,
      };

      const mockUpdatedTier = {
        id: '2',
        name: 'premium',
        monthlyPrice: 39.99,
        studentDiscount: 40,
        features: ['Feature 1'],
        coursesPerMonth: 999999,
        aiQueriesPerMonth: 999999,
        storageGB: 10,
        supportLevel: 'priority',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.pricingTier.update as jest.Mock).mockResolvedValue(mockUpdatedTier);

      const result = await pricingService.updateTier('premium', updateData);

      expect(result.monthlyPrice).toBe(39.99);
      expect(result.studentDiscount).toBe(40);
      expect(prisma.pricingTier.update).toHaveBeenCalled();
    });
  });
});

