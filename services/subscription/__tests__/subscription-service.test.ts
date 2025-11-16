import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SubscriptionService } from '../subscription-service';
import { PrismaClient } from '@prisma/client';

// Mock logger
jest.mock('../../shared/logging', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock ErrorHandler
jest.mock('../../payment/error-handler', () => ({
  ErrorHandler: {
    handle: jest.fn((error) => error),
  },
}));

// Mock Prisma
jest.mock('@prisma/client');

describe('SubscriptionService', () => {
  let subscriptionService: SubscriptionService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      subscription: {
        create: jest.fn().mockResolvedValue({
          id: 'sub_123',
          userId: 'user123',
          tier: 'PRO',
          status: 'ACTIVE',
          startDate: new Date(),
          renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue({
          id: 'sub_123',
          userId: 'user123',
          tier: 'PRO',
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        update: jest.fn().mockResolvedValue({
          id: 'sub_123',
          tier: 'ENTERPRISE',
          status: 'ACTIVE',
          updatedAt: new Date(),
        }),
      },
    };
    subscriptionService = new SubscriptionService();
  });

  describe('createSubscription', () => {
    it('should create a new subscription for a user', async () => {
      const userId = 'user123';
      const tier = 'PRO';
      const paymentMethodId = 'pm_123';

      const mockSubscription = {
        id: 'sub_123',
        userId,
        tier,
        status: 'ACTIVE',
        startDate: new Date(),
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.subscription.create = jest.fn().mockResolvedValue(mockSubscription);

      const result = await subscriptionService.createSubscription({
        userId,
        tier,
        paymentMethodId,
      });

      expect(result).toEqual(mockSubscription);
      expect(mockPrisma.subscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          tier,
        }),
      });
    });

    it('should throw error if user already has active subscription', async () => {
      const userId = 'user123';

      mockPrisma.subscription.findFirst = jest.fn().mockResolvedValue({
        id: 'sub_existing',
        userId,
        status: 'ACTIVE',
      });

      await expect(
        subscriptionService.createSubscription({
          userId,
          tier: 'PRO',
          paymentMethodId: 'pm_123',
        })
      ).rejects.toThrow('User already has an active subscription');
    });
  });

  describe('updateSubscription', () => {
    it('should update subscription tier', async () => {
      const subscriptionId = 'sub_123';
      const newTier = 'ENTERPRISE';

      const mockUpdatedSubscription = {
        id: subscriptionId,
        tier: newTier,
        status: 'ACTIVE',
        updatedAt: new Date(),
      };

      mockPrisma.subscription.update = jest.fn().mockResolvedValue(mockUpdatedSubscription);

      const result = await subscriptionService.updateSubscription(subscriptionId, {
        tier: newTier,
      });

      expect(result.tier).toBe(newTier);
      expect(mockPrisma.subscription.update).toHaveBeenCalled();
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel an active subscription', async () => {
      const subscriptionId = 'sub_123';

      const mockCancelledSubscription = {
        id: subscriptionId,
        status: 'CANCELLED',
        cancelledAt: new Date(),
      };

      mockPrisma.subscription.update = jest.fn().mockResolvedValue(mockCancelledSubscription);

      const result = await subscriptionService.cancelSubscription(subscriptionId);

      expect(result.status).toBe('CANCELLED');
      expect(mockPrisma.subscription.update).toHaveBeenCalled();
    });

    it('should throw error if subscription not found', async () => {
      mockPrisma.subscription.findUnique = jest.fn().mockResolvedValue(null);

      await expect(subscriptionService.cancelSubscription('invalid_id')).rejects.toThrow(
        'Subscription not found'
      );
    });
  });

  describe('getSubscription', () => {
    it('should retrieve subscription by ID', async () => {
      const subscriptionId = 'sub_123';
      const mockSubscription = {
        id: subscriptionId,
        userId: 'user123',
        tier: 'PRO',
        status: 'ACTIVE',
      };

      mockPrisma.subscription.findUnique = jest.fn().mockResolvedValue(mockSubscription);

      const result = await subscriptionService.getSubscription(subscriptionId);

      expect(result).toEqual(mockSubscription);
      expect(mockPrisma.subscription.findUnique).toHaveBeenCalledWith({
        where: { id: subscriptionId },
      });
    });

    it('should return null if subscription not found', async () => {
      mockPrisma.subscription.findUnique = jest.fn().mockResolvedValue(null);

      const result = await subscriptionService.getSubscription('invalid_id');

      expect(result).toBeNull();
    });
  });

  describe('getUserSubscription', () => {
    it('should retrieve active subscription for user', async () => {
      const userId = 'user123';
      const mockSubscription = {
        id: 'sub_123',
        userId,
        tier: 'PRO',
        status: 'ACTIVE',
      };

      mockPrisma.subscription.findFirst = jest.fn().mockResolvedValue(mockSubscription);

      const result = await subscriptionService.getUserSubscription(userId);

      expect(result).toEqual(mockSubscription);
      expect(mockPrisma.subscription.findFirst).toHaveBeenCalledWith({
        where: {
          userId,
          status: 'ACTIVE',
        },
      });
    });
  });
});
