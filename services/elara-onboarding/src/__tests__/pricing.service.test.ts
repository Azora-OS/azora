/**
 * Pricing Service Tests
 * 
 * Tests for pricing tiers, discounts, and benefits
 */

import { PricingService } from '../services/pricing.service';

describe('PricingService', () => {
  let service: PricingService;

  beforeEach(() => {
    service = new PricingService();
  });

  describe('getPricingTiers', () => {
    it('should get student pricing tiers', async () => {
      const tiers = await service.getPricingTiers('student');

      expect(tiers).toHaveLength(3);
      expect(tiers[0].name).toBe('Free');
      expect(tiers[1].name).toBe('Premium');
      expect(tiers[2].name).toBe('Pro');
    });

    it('should get founder pricing tiers', async () => {
      const tiers = await service.getPricingTiers('founder');

      expect(tiers).toHaveLength(3);
      expect(tiers[0].name).toBe('Starter');
      expect(tiers[1].name).toBe('Professional');
      expect(tiers[2].name).toBe('Enterprise');
    });

    it('should get teacher pricing tiers', async () => {
      const tiers = await service.getPricingTiers('teacher');

      expect(tiers).toHaveLength(2);
      expect(tiers[0].discountPercentage).toBe(25);
    });

    it('should get researcher pricing tiers', async () => {
      const tiers = await service.getPricingTiers('researcher');

      expect(tiers).toHaveLength(2);
      expect(tiers[0].discountPercentage).toBe(30);
    });

    it('should get professional pricing tiers', async () => {
      const tiers = await service.getPricingTiers('professional');

      expect(tiers).toHaveLength(2);
      expect(tiers[0].discountPercentage).toBe(0);
    });

    it('should get enterprise pricing tiers', async () => {
      const tiers = await service.getPricingTiers('enterprise');

      expect(tiers).toHaveLength(2);
      expect(tiers[0].discountPercentage).toBe(25);
      expect(tiers[1].discountPercentage).toBe(40);
    });

    it('should get non-profit pricing tiers', async () => {
      const tiers = await service.getPricingTiers('non-profit');

      expect(tiers).toHaveLength(2);
      expect(tiers[0].discountPercentage).toBe(75);
    });

    it('should get government pricing tiers', async () => {
      const tiers = await service.getPricingTiers('government');

      expect(tiers).toHaveLength(2);
      expect(tiers[0].discountPercentage).toBe(20);
    });

    it('should throw error for unknown user type', async () => {
      await expect(service.getPricingTiers('unknown' as any)).rejects.toThrow(
        'Unknown user type: unknown'
      );
    });
  });

  describe('getBenefits', () => {
    it('should get student benefits', async () => {
      const benefits = await service.getBenefits('student');

      expect(benefits.userType).toBe('student');
      expect(benefits.discountPercentage).toBe(30);
      expect(benefits.features).toContain('Course access');
      expect(benefits.pricingTiers).toHaveLength(3);
    });

    it('should get founder benefits', async () => {
      const benefits = await service.getBenefits('founder');

      expect(benefits.userType).toBe('founder');
      expect(benefits.discountPercentage).toBe(0);
      expect(benefits.features).toContain('Course creation tools');
    });

    it('should get teacher benefits', async () => {
      const benefits = await service.getBenefits('teacher');

      expect(benefits.userType).toBe('teacher');
      expect(benefits.discountPercentage).toBe(25);
      expect(benefits.features).toContain('Educator tools');
    });

    it('should get researcher benefits', async () => {
      const benefits = await service.getBenefits('researcher');

      expect(benefits.userType).toBe('researcher');
      expect(benefits.discountPercentage).toBe(30);
      expect(benefits.features).toContain('Research collaboration');
    });

    it('should get professional benefits', async () => {
      const benefits = await service.getBenefits('professional');

      expect(benefits.userType).toBe('professional');
      expect(benefits.discountPercentage).toBe(0);
      expect(benefits.features).toContain('Career development');
    });

    it('should get enterprise benefits', async () => {
      const benefits = await service.getBenefits('enterprise');

      expect(benefits.userType).toBe('enterprise');
      expect(benefits.discountPercentage).toBe(25);
      expect(benefits.features).toContain('Admin dashboard');
    });

    it('should get non-profit benefits', async () => {
      const benefits = await service.getBenefits('non-profit');

      expect(benefits.userType).toBe('non-profit');
      expect(benefits.discountPercentage).toBe(75);
      expect(benefits.features).toContain('Unlimited courses');
    });

    it('should get government benefits', async () => {
      const benefits = await service.getBenefits('government');

      expect(benefits.userType).toBe('government');
      expect(benefits.discountPercentage).toBe(20);
      expect(benefits.features).toContain('Compliance features');
    });

    it('should include student tier in benefits', async () => {
      const benefits = await service.getBenefits('student', 'premium');

      expect(benefits.tier).toBe('premium');
    });
  });

  describe('calculatePricing', () => {
    it('should calculate student free tier pricing', async () => {
      const calculation = await service.calculatePricing(100, 'student', 'free');

      expect(calculation.basePrice).toBe(100);
      expect(calculation.discountPercentage).toBe(100);
      expect(calculation.discountAmount).toBe(100);
      expect(calculation.finalPrice).toBe(0);
    });

    it('should calculate student premium tier pricing', async () => {
      const calculation = await service.calculatePricing(100, 'student', 'premium');

      expect(calculation.basePrice).toBe(100);
      expect(calculation.discountPercentage).toBe(50);
      expect(calculation.discountAmount).toBe(50);
      expect(calculation.finalPrice).toBe(50);
    });

    it('should calculate student pro tier pricing', async () => {
      const calculation = await service.calculatePricing(100, 'student', 'pro');

      expect(calculation.basePrice).toBe(100);
      expect(calculation.discountPercentage).toBe(30);
      expect(calculation.discountAmount).toBe(30);
      expect(calculation.finalPrice).toBe(70);
    });

    it('should calculate founder pricing (no discount)', async () => {
      const calculation = await service.calculatePricing(100, 'founder');

      expect(calculation.basePrice).toBe(100);
      expect(calculation.discountPercentage).toBe(0);
      expect(calculation.discountAmount).toBe(0);
      expect(calculation.finalPrice).toBe(100);
    });

    it('should calculate teacher pricing (25% discount)', async () => {
      const calculation = await service.calculatePricing(100, 'teacher');

      expect(calculation.basePrice).toBe(100);
      expect(calculation.discountPercentage).toBe(25);
      expect(calculation.discountAmount).toBe(25);
      expect(calculation.finalPrice).toBe(75);
    });

    it('should calculate researcher pricing (30% discount)', async () => {
      const calculation = await service.calculatePricing(100, 'researcher');

      expect(calculation.basePrice).toBe(100);
      expect(calculation.discountPercentage).toBe(30);
      expect(calculation.discountAmount).toBe(30);
      expect(calculation.finalPrice).toBe(70);
    });

    it('should calculate non-profit pricing (75% discount)', async () => {
      const calculation = await service.calculatePricing(100, 'non-profit');

      expect(calculation.basePrice).toBe(100);
      expect(calculation.discountPercentage).toBe(75);
      expect(calculation.discountAmount).toBe(75);
      expect(calculation.finalPrice).toBe(25);
    });

    it('should calculate government pricing (20% discount)', async () => {
      const calculation = await service.calculatePricing(100, 'government');

      expect(calculation.basePrice).toBe(100);
      expect(calculation.discountPercentage).toBe(20);
      expect(calculation.discountAmount).toBe(20);
      expect(calculation.finalPrice).toBe(80);
    });
  });

  describe('getStudentTier', () => {
    it('should get free tier', async () => {
      const tier = await service.getStudentTier('free');

      expect(tier.tier).toBe('free');
      expect(tier.discountPercentage).toBe(100);
      expect(tier.monthlyPrice).toBe(0);
      expect(tier.features).toContain('3 free courses');
    });

    it('should get premium tier', async () => {
      const tier = await service.getStudentTier('premium');

      expect(tier.tier).toBe('premium');
      expect(tier.discountPercentage).toBe(50);
      expect(tier.monthlyPrice).toBe(99.50);
      expect(tier.features).toContain('Unlimited courses');
    });

    it('should get pro tier', async () => {
      const tier = await service.getStudentTier('pro');

      expect(tier.tier).toBe('pro');
      expect(tier.discountPercentage).toBe(30);
      expect(tier.monthlyPrice).toBe(139.30);
      expect(tier.features).toContain('API access');
    });

    it('should throw error for unknown tier', async () => {
      await expect(service.getStudentTier('unknown')).rejects.toThrow(
        'Unknown student tier: unknown'
      );
    });
  });

  describe('verifyStudent', () => {
    it('should verify student with .edu email', async () => {
      const verified = await service.verifyStudent('student@university.edu');

      expect(verified).toBe(true);
    });

    it('should not verify student with non-.edu email', async () => {
      const verified = await service.verifyStudent('student@example.com');

      expect(verified).toBe(false);
    });
  });

  describe('applyDiscount', () => {
    it('should apply 25% discount', async () => {
      const finalPrice = await service.applyDiscount(100, 25);

      expect(finalPrice).toBe(75);
    });

    it('should apply 50% discount', async () => {
      const finalPrice = await service.applyDiscount(100, 50);

      expect(finalPrice).toBe(50);
    });

    it('should apply 75% discount', async () => {
      const finalPrice = await service.applyDiscount(100, 75);

      expect(finalPrice).toBe(25);
    });

    it('should apply 0% discount', async () => {
      const finalPrice = await service.applyDiscount(100, 0);

      expect(finalPrice).toBe(100);
    });

    it('should apply 100% discount', async () => {
      const finalPrice = await service.applyDiscount(100, 100);

      expect(finalPrice).toBe(0);
    });
  });

  describe('generatePricingReport', () => {
    it('should generate report for student user type', async () => {
      const report = await service.generatePricingReport('student', 1000);

      expect(report.userType).toBe('student');
      expect(report.totalUsers).toBe(1000);
      expect(report.averageDiscount).toBe(30);
      expect(report.timestamp).toBeInstanceOf(Date);
    });

    it('should generate report for founder user type', async () => {
      const report = await service.generatePricingReport('founder', 500);

      expect(report.userType).toBe('founder');
      expect(report.totalUsers).toBe(500);
      expect(report.averageDiscount).toBe(0);
    });

    it('should generate report for non-profit user type', async () => {
      const report = await service.generatePricingReport('non-profit', 100);

      expect(report.userType).toBe('non-profit');
      expect(report.totalUsers).toBe(100);
      expect(report.averageDiscount).toBe(75);
    });

    it('should calculate revenue impact correctly', async () => {
      const report = await service.generatePricingReport('student', 1000);

      expect(report.revenueImpact).toBeLessThan(0);
    });
  });

  describe('pricing accuracy', () => {
    it('should calculate correct pricing for multiple user types', async () => {
      const basePrice = 200;

      const founder = await service.calculatePricing(basePrice, 'founder');
      const student = await service.calculatePricing(basePrice, 'student');
      const teacher = await service.calculatePricing(basePrice, 'teacher');
      const researcher = await service.calculatePricing(basePrice, 'researcher');
      const nonprofit = await service.calculatePricing(basePrice, 'non-profit');

      expect(founder.finalPrice).toBe(200);
      expect(student.finalPrice).toBe(140); // 30% discount
      expect(teacher.finalPrice).toBe(150); // 25% discount
      expect(researcher.finalPrice).toBe(140); // 30% discount
      expect(nonprofit.finalPrice).toBe(50); // 75% discount
    });

    it('should maintain pricing consistency', async () => {
      const basePrice = 100;
      const calculation1 = await service.calculatePricing(basePrice, 'student', 'premium');
      const calculation2 = await service.calculatePricing(basePrice, 'student', 'premium');

      expect(calculation1.finalPrice).toBe(calculation2.finalPrice);
    });
  });

  describe('benefits consistency', () => {
    it('should provide consistent benefits for each user type', async () => {
      const userTypes = ['founder', 'student', 'teacher', 'researcher', 'professional', 'enterprise', 'non-profit', 'government'] as const;

      for (const userType of userTypes) {
        const benefits = await service.getBenefits(userType);
        expect(benefits.features).toBeDefined();
        expect(benefits.features.length).toBeGreaterThan(0);
        expect(benefits.pricingTiers).toBeDefined();
        expect(benefits.pricingTiers.length).toBeGreaterThan(0);
      }
    });
  });
});
