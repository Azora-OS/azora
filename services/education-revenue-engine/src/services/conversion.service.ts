import { prisma } from '../index';
import { ConversionEvent, ConversionOffer } from '../types';
import { logger } from '../utils/logger';
import Joi from 'joi';

const conversionEventSchema = Joi.object({
  studentId: Joi.string().required(),
  eventType: Joi.string().valid('module_completion', 'assessment_pass', 'course_completion', 'inactivity_alert').required(),
  triggerValue: Joi.number().min(0).max(100).required(),
});

const conversionOfferSchema = Joi.object({
  studentId: Joi.string().required(),
  offerType: Joi.string().valid('upgrade_discount', 'premium_trial', 'bundle_deal').required(),
  discount: Joi.number().min(0).max(100).required(),
  expirationDays: Joi.number().min(1).default(7),
});

export class ConversionService {
  /**
   * Track a conversion event (module completion, assessment pass, course completion)
   */
  async trackConversionEvent(data: {
    studentId: string;
    eventType: 'module_completion' | 'assessment_pass' | 'course_completion' | 'inactivity_alert';
    triggerValue: number;
  }): Promise<ConversionEvent> {
    try {
      const { error, value } = conversionEventSchema.validate(data);
      if (error) {
        throw new Error(`Validation error: ${error.message}`);
      }

      // Check if student exists
      const student = await prisma.user.findUnique({
        where: { id: value.studentId },
      });

      if (!student) {
        throw new Error('Student not found');
      }

      // Create conversion event
      const event = await prisma.conversionEvent.create({
        data: {
          studentId: value.studentId,
          eventType: value.eventType,
          triggerValue: value.triggerValue,
          timestamp: new Date(),
        },
      });

      logger.info(`Conversion event tracked: ${event.id} (${value.eventType})`);

      // Check if conversion offer should be generated
      await this.generateConversionOfferIfEligible(value.studentId, value.eventType, value.triggerValue, event.id);

      return event as ConversionEvent;
    } catch (error) {
      logger.error('Error tracking conversion event:', error);
      throw error;
    }
  }

  /**
   * Generate conversion offer based on event type and trigger value
   */
  private async generateConversionOfferIfEligible(
    studentId: string,
    eventType: string,
    triggerValue: number,
    eventId: string
  ): Promise<void> {
    try {
      // Get student's current tier
      const student = await prisma.user.findUnique({
        where: { id: studentId },
      });

      if (!student || student.tier !== 'free') {
        // Only generate offers for free tier students
        return;
      }

      let offerType: 'upgrade_discount' | 'premium_trial' | 'bundle_deal' | null = null;
      let discount = 0;

      // Determine offer based on event type and trigger value
      if (eventType === 'module_completion' && triggerValue >= 40) {
        // 40% course completion: offer 50% discount on Premium
        offerType = 'upgrade_discount';
        discount = 50;
      } else if (eventType === 'assessment_pass') {
        // Assessment pass: offer premium trial
        offerType = 'premium_trial';
        discount = 100; // 100% discount for trial period
      } else if (eventType === 'course_completion') {
        // Course completion: offer bundle deal
        offerType = 'bundle_deal';
        discount = 30; // 30% discount on bundle
      }

      if (offerType) {
        await this.createConversionOffer({
          studentId,
          offerType,
          discount,
          expirationDays: 7,
          eventId,
        });
      }
    } catch (error) {
      logger.error('Error generating conversion offer:', error);
      // Don't throw - this is a non-critical operation
    }
  }

  /**
   * Create a conversion offer
   */
  async createConversionOffer(data: {
    studentId: string;
    offerType: 'upgrade_discount' | 'premium_trial' | 'bundle_deal';
    discount: number;
    expirationDays: number;
    eventId?: string;
  }): Promise<ConversionOffer> {
    try {
      const { error, value } = conversionOfferSchema.validate(data);
      if (error) {
        throw new Error(`Validation error: ${error.message}`);
      }

      // Check if student already has an active offer
      const existingOffer = await prisma.conversionOffer.findFirst({
        where: {
          studentId: value.studentId,
          accepted: false,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (existingOffer) {
        logger.info(`Student ${value.studentId} already has an active offer`);
        return existingOffer as ConversionOffer;
      }

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + value.expirationDays);

      // Create offer
      const offer = await prisma.conversionOffer.create({
        data: {
          eventId: data.eventId || '',
          studentId: value.studentId,
          offerType: value.offerType,
          discount: value.discount,
          expiresAt,
          accepted: false,
        },
      });

      logger.info(`Conversion offer created: ${offer.id} (${value.offerType})`);
      return offer as ConversionOffer;
    } catch (error) {
      logger.error('Error creating conversion offer:', error);
      throw error;
    }
  }

  /**
   * Get conversion events for a student
   */
  async getStudentConversionEvents(studentId: string): Promise<ConversionEvent[]> {
    try {
      const events = await prisma.conversionEvent.findMany({
        where: { studentId },
        orderBy: { timestamp: 'desc' },
      });

      return events as ConversionEvent[];
    } catch (error) {
      logger.error('Error getting conversion events:', error);
      throw error;
    }
  }

  /**
   * Get active conversion offers for a student
   */
  async getStudentActiveOffers(studentId: string): Promise<ConversionOffer[]> {
    try {
      const offers = await prisma.conversionOffer.findMany({
        where: {
          studentId,
          accepted: false,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: { expiresAt: 'asc' },
      });

      return offers as ConversionOffer[];
    } catch (error) {
      logger.error('Error getting active offers:', error);
      throw error;
    }
  }

  /**
   * Accept a conversion offer
   */
  async acceptConversionOffer(offerId: string): Promise<ConversionOffer> {
    try {
      const offer = await prisma.conversionOffer.findUnique({
        where: { id: offerId },
      });

      if (!offer) {
        throw new Error('Offer not found');
      }

      if (offer.accepted) {
        throw new Error('Offer already accepted');
      }

      if (new Date() > offer.expiresAt) {
        throw new Error('Offer has expired');
      }

      // Update offer as accepted
      const updatedOffer = await prisma.conversionOffer.update({
        where: { id: offerId },
        data: {
          accepted: true,
          acceptedAt: new Date(),
        },
      });

      logger.info(`Conversion offer accepted: ${offerId}`);

      // Upgrade student to premium tier
      await prisma.user.update({
        where: { id: offer.studentId },
        data: { tier: 'premium' },
      });

      logger.info(`Student ${offer.studentId} upgraded to premium tier`);

      return updatedOffer as ConversionOffer;
    } catch (error) {
      logger.error('Error accepting conversion offer:', error);
      throw error;
    }
  }

  /**
   * Get conversion offer by ID
   */
  async getConversionOffer(offerId: string): Promise<ConversionOffer | null> {
    try {
      const offer = await prisma.conversionOffer.findUnique({
        where: { id: offerId },
      });

      return offer as ConversionOffer | null;
    } catch (error) {
      logger.error('Error getting conversion offer:', error);
      throw error;
    }
  }

  /**
   * Check and expire old conversion offers
   */
  async expireOldOffers(): Promise<number> {
    try {
      const result = await prisma.conversionOffer.updateMany({
        where: {
          accepted: false,
          expiresAt: {
            lt: new Date(),
          },
        },
        data: {
          accepted: false, // Mark as expired by not accepting
        },
      });

      logger.info(`Expired ${result.count} old conversion offers`);
      return result.count;
    } catch (error) {
      logger.error('Error expiring old offers:', error);
      throw error;
    }
  }

  /**
   * Get conversion metrics for analytics
   */
  async getConversionMetrics(period: string): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    offersGenerated: number;
    offersAccepted: number;
    acceptanceRate: number;
  }> {
    try {
      // Parse period (e.g., "2024-01")
      const [year, month] = period.split('-');
      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      // Get conversion events
      const events = await prisma.conversionEvent.findMany({
        where: {
          timestamp: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      // Get conversion offers (filter by expiresAt since createdAt doesn't exist)
      const offers = await prisma.conversionOffer.findMany({
        where: {
          expiresAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      const acceptedOffers = offers.filter((o: any) => o.accepted);
      const acceptanceRate = offers.length > 0 ? (acceptedOffers.length / offers.length) * 100 : 0;

      // Count events by type
      const eventsByType: Record<string, number> = {};
      events.forEach((event: any) => {
        eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
      });

      return {
        totalEvents: events.length,
        eventsByType,
        offersGenerated: offers.length,
        offersAccepted: acceptedOffers.length,
        acceptanceRate,
      };
    } catch (error) {
      logger.error('Error getting conversion metrics:', error);
      throw error;
    }
  }
}

export const conversionService = new ConversionService();
