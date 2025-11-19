// Mock Prisma before importing the service
jest.mock('../../index', () => ({
  prisma: {
    conversionEvent: {
      create: jest.fn(),
    },
    conversionOffer: {
      create: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      aggregate: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
  },
}));

import { revenueService } from '../revenue.service';
import { prisma } from '../../index';

describe('RevenueService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPricingTier', () => {
    it('should return pricing tier for free tier', async () => {
      const result = await revenueService.getPricingTier('free');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('free');
      expect(result?.monthlyPrice).toBe(0);
      expect(result?.studentDiscount).toBe(0);
    });

    it('should return pricing tier for premium tier', async () => {
      const result = await revenueService.getPricingTier('premium');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('premium');
      expect(result?.monthlyPrice).toBe(10);
      expect(result?.studentDiscount).toBe(50);
    });

    it('should return pricing tier for pro tier', async () => {
      const result = await revenueService.getPricingTier('pro');

      expect(result).not.toBeNull();
      expect(result?.name).toBe('pro');
      expect(result?.monthlyPrice).toBe(30);
      expect(result?.studentDiscount).toBe(30);
    });

    it('should return null for invalid tier', async () => {
      const result = await revenueService.getPricingTier('invalid');

      expect(result).toBeNull();
    });

    it('should return correct features for each tier', async () => {
      const freeResult = await revenueService.getPricingTier('free');
      expect(freeResult?.features).toHaveLength(3);
      expect(freeResult?.limits.coursesPerMonth).toBe(3);
      expect(freeResult?.limits.aiQueriesPerMonth).toBe(10);
      expect(freeResult?.limits.storageGB).toBe(1);

      const premiumResult = await revenueService.getPricingTier('premium');
      expect(premiumResult?.features).toHaveLength(4);
      expect(premiumResult?.limits.coursesPerMonth).toBe(999);
      expect(premiumResult?.limits.aiQueriesPerMonth).toBe(999);
      expect(premiumResult?.limits.storageGB).toBe(10);

      const proResult = await revenueService.getPricingTier('pro');
      expect(proResult?.features).toHaveLength(5);
      expect(proResult?.limits.storageGB).toBe(100);
    });
  });

  describe('getAllPricingTiers', () => {
    it('should return all three pricing tiers', async () => {
      const result = await revenueService.getAllPricingTiers();

      expect(result).toHaveLength(3);
      expect(result.map(t => t.name)).toContain('free');
      expect(result.map(t => t.name)).toContain('premium');
      expect(result.map(t => t.name)).toContain('pro');
    });

    it('should return tiers with correct pricing', async () => {
      const result = await revenueService.getAllPricingTiers();

      const freeTier = result.find(t => t.name === 'free');
      const premiumTier = result.find(t => t.name === 'premium');
      const proTier = result.find(t => t.name === 'pro');

      expect(freeTier?.monthlyPrice).toBe(0);
      expect(premiumTier?.monthlyPrice).toBe(10);
      expect(proTier?.monthlyPrice).toBe(30);
    });
  });

  describe('calculatePrice', () => {
    it('should calculate price for free tier', async () => {
      const result = await revenueService.calculatePrice('free', false);
      expect(result).toBe(0);
    });

    it('should calculate price for premium tier without student discount', async () => {
      const result = await revenueService.calculatePrice('premium', false);
      expect(result).toBe(10);
    });

    it('should calculate price for premium tier with student discount', async () => {
      const result = await revenueService.calculatePrice('premium', true);
      // 50% discount: 10 * (1 - 0.5) = 5
      expect(result).toBe(5);
    });

    it('should calculate price for pro tier without student discount', async () => {
      const result = await revenueService.calculatePrice('pro', false);
      expect(result).toBe(30);
    });

    it('should calculate price for pro tier with student discount', async () => {
      const result = await revenueService.calculatePrice('pro', true);
      // 30% discount: 30 * (1 - 0.3) = 21
      expect(result).toBe(21);
    });

    it('should throw error for invalid tier', async () => {
      await expect(revenueService.calculatePrice('invalid', false)).rejects.toThrow(
        'Pricing tier not found: invalid'
      );
    });

    it('should not apply discount to free tier', async () => {
      const result = await revenueService.calculatePrice('free', true);
      expect(result).toBe(0);
    });
  });

  describe('trackConversionEvent', () => {
    it('should track module completion event and create offer', async () => {
      const mockEvent = {
        id: 'event-1',
        studentId: 'student-1',
        eventType: 'module_completion',
        triggerValue: 40,
      };

      const mockOffer = {
        id: 'offer-1',
        eventId: 'event-1',
        studentId: 'student-1',
        offerType: 'upgrade_discount',
        discount: 50,
        expiresAt: new Date(),
        accepted: false,
      };

      (prisma.conversionEvent.create as jest.Mock).mockResolvedValue(mockEvent);
      (prisma.conversionOffer.create as jest.Mock).mockResolvedValue(mockOffer);

      const result = await revenueService.trackConversionEvent('student-1', 'module_completion', 40);

      expect(result).not.toBeNull();
      expect(result?.offerType).toBe('upgrade_discount');
      expect(result?.discount).toBe(50);
      expect(prisma.conversionEvent.create).toHaveBeenCalledWith({
        data: {
          studentId: 'student-1',
          eventType: 'module_completion',
          triggerValue: 40,
        },
      });
    });

    it('should track assessment pass event and create offer', async () => {
      const mockEvent = {
        id: 'event-2',
        studentId: 'student-2',
        eventType: 'assessment_pass',
        triggerValue: 70,
      };

      const mockOffer = {
        id: 'offer-2',
        eventId: 'event-2',
        studentId: 'student-2',
        offerType: 'upgrade_discount',
        discount: 50,
        expiresAt: new Date(),
        accepted: false,
      };

      (prisma.conversionEvent.create as jest.Mock).mockResolvedValue(mockEvent);
      (prisma.conversionOffer.create as jest.Mock).mockResolvedValue(mockOffer);

      const result = await revenueService.trackConversionEvent('student-2', 'assessment_pass', 70);

      expect(result).not.toBeNull();
      expect(result?.discount).toBe(50);
    });

    it('should track course completion event and create offer', async () => {
      const mockEvent = {
        id: 'event-3',
        studentId: 'student-3',
        eventType: 'course_completion',
        triggerValue: 100,
      };

      const mockOffer = {
        id: 'offer-3',
        eventId: 'event-3',
        studentId: 'student-3',
        offerType: 'upgrade_discount',
        discount: 50,
        expiresAt: new Date(),
        accepted: false,
      };

      (prisma.conversionEvent.create as jest.Mock).mockResolvedValue(mockEvent);
      (prisma.conversionOffer.create as jest.Mock).mockResolvedValue(mockOffer);

      const result = await revenueService.trackConversionEvent('student-3', 'course_completion', 100);

      expect(result).not.toBeNull();
    });

    it('should not create offer if trigger value is below threshold', async () => {
      const mockEvent = {
        id: 'event-4',
        studentId: 'student-4',
        eventType: 'module_completion',
        triggerValue: 30,
      };

      (prisma.conversionEvent.create as jest.Mock).mockResolvedValue(mockEvent);

      const result = await revenueService.trackConversionEvent('student-4', 'module_completion', 30);

      expect(result).toBeNull();
      expect(prisma.conversionOffer.create).not.toHaveBeenCalled();
    });

    it('should handle conversion event creation error', async () => {
      (prisma.conversionEvent.create as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        revenueService.trackConversionEvent('student-1', 'module_completion', 40)
      ).rejects.toThrow('Database error');
    });
  });

  describe('acceptConversionOffer', () => {
    it('should accept a conversion offer', async () => {
      const mockOffer = {
        id: 'offer-1',
        eventId: 'event-1',
        studentId: 'student-1',
        offerType: 'upgrade_discount',
        discount: 50,
        expiresAt: new Date(),
        accepted: true,
        acceptedAt: new Date(),
      };

      (prisma.conversionOffer.update as jest.Mock).mockResolvedValue(mockOffer);

      const result = await revenueService.acceptConversionOffer('offer-1');

      expect(result.accepted).toBe(true);
      expect(result.acceptedAt).not.toBeNull();
      expect(prisma.conversionOffer.update).toHaveBeenCalledWith({
        where: { id: 'offer-1' },
        data: {
          accepted: true,
          acceptedAt: expect.any(Date),
        },
      });
    });

    it('should handle offer acceptance error', async () => {
      (prisma.conversionOffer.update as jest.Mock).mockRejectedValue(
        new Error('Offer not found')
      );

      await expect(revenueService.acceptConversionOffer('invalid-offer')).rejects.toThrow(
        'Offer not found'
      );
    });
  });

  describe('processPayment', () => {
    it('should process a payment successfully', async () => {
      const mockPayment = {
        id: 'payment-1',
        studentId: 'student-1',
        courseId: 'course-1',
        amount: 5,
        tier: 'premium',
        period: '2024-01',
        status: 'completed',
      };

      (prisma.payment.create as jest.Mock).mockResolvedValue(mockPayment);

      const result = await revenueService.processPayment('student-1', 'course-1', 'premium', 5);

      expect(result).not.toBeNull();
      expect(result.status).toBe('completed');
      expect(result.amount).toBe(5);
      expect(prisma.payment.create).toHaveBeenCalled();
    });

    it('should set correct period in payment', async () => {
      const mockPayment = {
        id: 'payment-1',
        studentId: 'student-1',
        courseId: 'course-1',
        amount: 10,
        tier: 'premium',
        period: expect.stringMatching(/^\d{4}-\d{2}$/),
        status: 'completed',
      };

      (prisma.payment.create as jest.Mock).mockResolvedValue(mockPayment);

      await revenueService.processPayment('student-1', 'course-1', 'premium', 10);

      const callArgs = (prisma.payment.create as jest.Mock).mock.calls[0][0];
      expect(callArgs.data.period).toMatch(/^\d{4}-\d{2}$/);
    });

    it('should handle payment processing error', async () => {
      (prisma.payment.create as jest.Mock).mockRejectedValue(
        new Error('Payment failed')
      );

      await expect(
        revenueService.processPayment('student-1', 'course-1', 'premium', 10)
      ).rejects.toThrow('Payment failed');
    });
  });

  describe('getRevenueByPeriod', () => {
    it('should calculate total revenue for a period', async () => {
      (prisma.payment.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: 150 },
      });

      const result = await revenueService.getRevenueByPeriod('2024-01');

      expect(result).toBe(150);
      expect(prisma.payment.aggregate).toHaveBeenCalledWith({
        where: { period: '2024-01', status: 'completed' },
        _sum: { amount: true },
      });
    });

    it('should return 0 if no payments in period', async () => {
      (prisma.payment.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: null },
      });

      const result = await revenueService.getRevenueByPeriod('2024-01');

      expect(result).toBe(0);
    });

    it('should only count completed payments', async () => {
      (prisma.payment.aggregate as jest.Mock).mockResolvedValue({
        _sum: { amount: 100 },
      });

      await revenueService.getRevenueByPeriod('2024-01');

      const callArgs = (prisma.payment.aggregate as jest.Mock).mock.calls[0][0];
      expect(callArgs.where.status).toBe('completed');
    });

    it('should handle revenue calculation error', async () => {
      (prisma.payment.aggregate as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(revenueService.getRevenueByPeriod('2024-01')).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('getConversionMetrics', () => {
    it('should calculate conversion metrics correctly', async () => {
      (prisma.user.count as jest.Mock)
        .mockResolvedValueOnce(100) // free users
        .mockResolvedValueOnce(30) // premium users
        .mockResolvedValueOnce(10); // pro users

      const result = await revenueService.getConversionMetrics('2024-01');

      expect(result.freeUsers).toBe(100);
      expect(result.premiumUsers).toBe(30);
      expect(result.proUsers).toBe(10);
      expect(result.totalUsers).toBe(140);
      expect(result.conversionRate).toBe(28.57); // (30 + 10) / 140 * 100
    });

    it('should return 0 conversion rate if no users', async () => {
      (prisma.user.count as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await revenueService.getConversionMetrics('2024-01');

      expect(result.conversionRate).toBe(0);
    });

    it('should calculate 100% conversion rate if all users are premium/pro', async () => {
      (prisma.user.count as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(50);

      const result = await revenueService.getConversionMetrics('2024-01');

      expect(result.conversionRate).toBe(100);
    });

    it('should handle conversion metrics calculation error', async () => {
      (prisma.user.count as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(revenueService.getConversionMetrics('2024-01')).rejects.toThrow(
        'Database error'
      );
    });

    it('should include period in response', async () => {
      (prisma.user.count as jest.Mock)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(10);

      const result = await revenueService.getConversionMetrics('2024-01');

      expect(result.period).toBe('2024-01');
    });
  });

  describe('Pricing tier limits', () => {
    it('should enforce free tier limits', async () => {
      const freeTier = await revenueService.getPricingTier('free');

      expect(freeTier?.limits.coursesPerMonth).toBe(3);
      expect(freeTier?.limits.aiQueriesPerMonth).toBe(10);
      expect(freeTier?.limits.storageGB).toBe(1);
      expect(freeTier?.limits.supportLevel).toBe('community');
    });

    it('should enforce premium tier limits', async () => {
      const premiumTier = await revenueService.getPricingTier('premium');

      expect(premiumTier?.limits.coursesPerMonth).toBe(999);
      expect(premiumTier?.limits.aiQueriesPerMonth).toBe(999);
      expect(premiumTier?.limits.storageGB).toBe(10);
      expect(premiumTier?.limits.supportLevel).toBe('priority');
    });

    it('should enforce pro tier limits', async () => {
      const proTier = await revenueService.getPricingTier('pro');

      expect(proTier?.limits.coursesPerMonth).toBe(999);
      expect(proTier?.limits.aiQueriesPerMonth).toBe(999);
      expect(proTier?.limits.storageGB).toBe(100);
      expect(proTier?.limits.supportLevel).toBe('dedicated');
    });
  });

  describe('Student discount calculations', () => {
    it('should apply 50% discount for premium students', async () => {
      const price = await revenueService.calculatePrice('premium', true);
      expect(price).toBe(5); // 50% of 10
    });

    it('should apply 30% discount for pro students', async () => {
      const price = await revenueService.calculatePrice('pro', true);
      expect(price).toBe(21); // 70% of 30
    });

    it('should not apply discount to non-students', async () => {
      const premiumPrice = await revenueService.calculatePrice('premium', false);
      const proPrice = await revenueService.calculatePrice('pro', false);

      expect(premiumPrice).toBe(10);
      expect(proPrice).toBe(30);
    });
  });

  describe('Conversion offer triggers', () => {
    it('should trigger offer at 40% module completion', async () => {
      const mockEvent = {
        id: 'event-1',
        studentId: 'student-1',
        eventType: 'module_completion',
        triggerValue: 40,
      };

      const mockOffer = {
        id: 'offer-1',
        eventId: 'event-1',
        studentId: 'student-1',
        offerType: 'upgrade_discount',
        discount: 50,
        expiresAt: new Date(),
        accepted: false,
      };

      (prisma.conversionEvent.create as jest.Mock).mockResolvedValue(mockEvent);
      (prisma.conversionOffer.create as jest.Mock).mockResolvedValue(mockOffer);

      const result = await revenueService.trackConversionEvent('student-1', 'module_completion', 40);

      expect(result).not.toBeNull();
    });

    it('should trigger offer at 70% assessment pass', async () => {
      const mockEvent = {
        id: 'event-2',
        studentId: 'student-2',
        eventType: 'assessment_pass',
        triggerValue: 70,
      };

      const mockOffer = {
        id: 'offer-2',
        eventId: 'event-2',
        studentId: 'student-2',
        offerType: 'upgrade_discount',
        discount: 50,
        expiresAt: new Date(),
        accepted: false,
      };

      (prisma.conversionEvent.create as jest.Mock).mockResolvedValue(mockEvent);
      (prisma.conversionOffer.create as jest.Mock).mockResolvedValue(mockOffer);

      const result = await revenueService.trackConversionEvent('student-2', 'assessment_pass', 70);

      expect(result).not.toBeNull();
    });

    it('should trigger offer at 100% course completion', async () => {
      const mockEvent = {
        id: 'event-3',
        studentId: 'student-3',
        eventType: 'course_completion',
        triggerValue: 100,
      };

      const mockOffer = {
        id: 'offer-3',
        eventId: 'event-3',
        studentId: 'student-3',
        offerType: 'upgrade_discount',
        discount: 50,
        expiresAt: new Date(),
        accepted: false,
      };

      (prisma.conversionEvent.create as jest.Mock).mockResolvedValue(mockEvent);
      (prisma.conversionOffer.create as jest.Mock).mockResolvedValue(mockOffer);

      const result = await revenueService.trackConversionEvent('student-3', 'course_completion', 100);

      expect(result).not.toBeNull();
    });
  });
});
