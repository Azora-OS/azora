import { prisma } from '../index';
import { PricingTier, ConversionOffer, Payment } from '../types';
import { logger } from '../utils/logger';

export class RevenueService {
  private pricingTiers: Map<string, PricingTier> = new Map([
    ['free', {
      id: 'tier-free',
      name: 'free',
      monthlyPrice: 0,
      studentDiscount: 0,
      features: [
        { id: 'f1', name: 'Courses', description: '3 foundational courses', tier: 'free' },
        { id: 'f2', name: 'AI Queries', description: '10 per month', tier: 'free' },
        { id: 'f3', name: 'Storage', description: '1GB', tier: 'free' },
      ],
      limits: {
        coursesPerMonth: 3,
        aiQueriesPerMonth: 10,
        storageGB: 1,
        supportLevel: 'community',
      },
    }],
    ['premium', {
      id: 'tier-premium',
      name: 'premium',
      monthlyPrice: 10,
      studentDiscount: 50,
      features: [
        { id: 'f1', name: 'Courses', description: 'Unlimited', tier: 'premium' },
        { id: 'f2', name: 'AI Queries', description: 'Unlimited', tier: 'premium' },
        { id: 'f3', name: 'Storage', description: '10GB', tier: 'premium' },
        { id: 'f4', name: 'Certificates', description: 'Included', tier: 'premium' },
      ],
      limits: {
        coursesPerMonth: 999,
        aiQueriesPerMonth: 999,
        storageGB: 10,
        supportLevel: 'priority',
      },
    }],
    ['pro', {
      id: 'tier-pro',
      name: 'pro',
      monthlyPrice: 30,
      studentDiscount: 30,
      features: [
        { id: 'f1', name: 'Courses', description: 'Unlimited', tier: 'pro' },
        { id: 'f2', name: 'AI Queries', description: 'Unlimited', tier: 'pro' },
        { id: 'f3', name: 'Storage', description: '100GB', tier: 'pro' },
        { id: 'f4', name: 'Certificates', description: 'Included', tier: 'pro' },
        { id: 'f5', name: 'API Access', description: 'Included', tier: 'pro' },
      ],
      limits: {
        coursesPerMonth: 999,
        aiQueriesPerMonth: 999,
        storageGB: 100,
        supportLevel: 'dedicated',
      },
    }],
  ]);

  async getPricingTier(tierName: string): Promise<PricingTier | null> {
    return this.pricingTiers.get(tierName) || null;
  }

  async getAllPricingTiers(): Promise<PricingTier[]> {
    return Array.from(this.pricingTiers.values());
  }

  async calculatePrice(tier: string, isStudent: boolean): Promise<number> {
    const pricingTier = this.pricingTiers.get(tier);
    if (!pricingTier) {
      throw new Error(`Pricing tier not found: ${tier}`);
    }

    if (isStudent && tier !== 'free') {
      const discount = pricingTier.studentDiscount;
      return pricingTier.monthlyPrice * (1 - discount / 100);
    }

    return pricingTier.monthlyPrice;
  }

  async trackConversionEvent(
    studentId: string,
    eventType: string,
    triggerValue: number
  ): Promise<ConversionOffer | null> {
    try {
      // Create conversion event
      const event = await prisma.conversionEvent.create({
        data: {
          studentId,
          eventType,
          triggerValue,
        },
      });

      logger.info(`Conversion event tracked: ${studentId} - ${eventType}`);

      // Check if conversion offer should be triggered
      if (this.shouldTriggerOffer(eventType, triggerValue)) {
        return await this.createConversionOffer(studentId, event.id);
      }

      return null;
    } catch (error) {
      logger.error('Error tracking conversion event:', error);
      throw error;
    }
  }

  private shouldTriggerOffer(eventType: string, triggerValue: number): boolean {
    const triggers: Record<string, number> = {
      'module_completion': 40,
      'assessment_pass': 70,
      'course_completion': 100,
    };

    return triggerValue >= (triggers[eventType] || 100);
  }

  private async createConversionOffer(
    studentId: string,
    eventId: string
  ): Promise<ConversionOffer> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiry

    const offer = await prisma.conversionOffer.create({
      data: {
        eventId,
        studentId,
        offerType: 'upgrade_discount',
        discount: 50,
        expiresAt,
      },
    });

    logger.info(`Conversion offer created: ${studentId}`);
    return offer as ConversionOffer;
  }

  async acceptConversionOffer(offerId: string): Promise<ConversionOffer> {
    try {
      const offer = await prisma.conversionOffer.update({
        where: { id: offerId },
        data: {
          accepted: true,
          acceptedAt: new Date(),
        },
      });

      logger.info(`Conversion offer accepted: ${offerId}`);
      return offer as ConversionOffer;
    } catch (error) {
      logger.error('Error accepting conversion offer:', error);
      throw error;
    }
  }

  async processPayment(
    studentId: string,
    courseId: string,
    tier: string,
    amount: number
  ): Promise<Payment> {
    try {
      const period = new Date().toISOString().slice(0, 7); // YYYY-MM

      const payment = await prisma.payment.create({
        data: {
          studentId,
          courseId,
          amount,
          tier,
          period,
          status: 'completed',
        },
      });

      logger.info(`Payment processed: ${studentId} - ${courseId} - $${amount}`);
      return {
        ...payment,
        amount: typeof payment.amount === 'number' ? payment.amount : Number(payment.amount),
      } as unknown as Payment;
    } catch (error) {
      logger.error('Error processing payment:', error);
      throw error;
    }
  }

  async getRevenueByPeriod(period: string): Promise<number> {
    try {
      const result = await prisma.payment.aggregate({
        where: { period, status: 'completed' },
        _sum: { amount: true },
      });

      return result._sum.amount ? Number(result._sum.amount) : 0;
    } catch (error) {
      logger.error('Error getting revenue by period:', error);
      throw error;
    }
  }

  async getConversionMetrics(period: string): Promise<any> {
    try {
      const freeUsers = await prisma.user.count({
        where: { tier: 'free' },
      });

      const premiumUsers = await prisma.user.count({
        where: { tier: 'premium' },
      });

      const proUsers = await prisma.user.count({
        where: { tier: 'pro' },
      });

      const totalUsers = freeUsers + premiumUsers + proUsers;
      const conversionRate = totalUsers > 0 ? ((premiumUsers + proUsers) / totalUsers) * 100 : 0;

      return {
        period,
        freeUsers,
        premiumUsers,
        proUsers,
        totalUsers,
        conversionRate: Math.round(conversionRate * 100) / 100,
      };
    } catch (error) {
      logger.error('Error getting conversion metrics:', error);
      throw error;
    }
  }
}

export const revenueService = new RevenueService();
