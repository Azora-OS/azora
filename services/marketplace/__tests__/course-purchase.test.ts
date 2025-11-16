import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CoursePurchaseService } from '../course-purchase';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

jest.mock('@prisma/client');

describe('CoursePurchaseService', () => {
  let coursePurchaseService: CoursePurchaseService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    coursePurchaseService = new CoursePurchaseService();
  });

  describe('purchaseCourse', () => {
    it('should create a course purchase record', async () => {
      const userId = 'user123';
      const courseId = 'course123';
      const paymentId = 'pay_123';

      const mockCourse = {
        id: courseId,
        instructorId: 'instructor123',
        price: new Decimal('49.99'),
        title: 'Learn TypeScript',
      };

      const mockPurchase = {
        id: 'purchase_123',
        userId,
        courseId,
        paymentId,
        purchaseDate: new Date(),
        status: 'COMPLETED',
      };

      mockPrisma.course.findUnique = jest.fn().mockResolvedValue(mockCourse);
      mockPrisma.coursePurchase.create = jest.fn().mockResolvedValue(mockPurchase);

      const result = await coursePurchaseService.purchaseCourse({
        userId,
        courseId,
        paymentId,
      });

      expect(result).toEqual(mockPurchase);
      expect(mockPrisma.coursePurchase.create).toHaveBeenCalled();
    });

    it('should throw error if course not found', async () => {
      mockPrisma.course.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        coursePurchaseService.purchaseCourse({
          userId: 'user123',
          courseId: 'invalid_course',
          paymentId: 'pay_123',
        })
      ).rejects.toThrow('Course not found');
    });

    it('should throw error if user already purchased course', async () => {
      const userId = 'user123';
      const courseId = 'course123';

      mockPrisma.course.findUnique = jest.fn().mockResolvedValue({
        id: courseId,
        price: new Decimal('49.99'),
      });

      mockPrisma.coursePurchase.findFirst = jest.fn().mockResolvedValue({
        id: 'purchase_existing',
        userId,
        courseId,
      });

      await expect(
        coursePurchaseService.purchaseCourse({
          userId,
          courseId,
          paymentId: 'pay_123',
        })
      ).rejects.toThrow('User has already purchased this course');
    });
  });

  describe('calculateRevenueSplit', () => {
    it('should calculate 70/30 revenue split correctly', () => {
      const coursePrice = new Decimal('100');
      const split = coursePurchaseService.calculateRevenueSplit(coursePrice);

      expect(split.instructorAmount).toEqual(new Decimal('70'));
      expect(split.platformAmount).toEqual(new Decimal('30'));
    });

    it('should handle decimal prices correctly', () => {
      const coursePrice = new Decimal('49.99');
      const split = coursePurchaseService.calculateRevenueSplit(coursePrice);

      expect(split.instructorAmount.toFixed(2)).toBe('34.99');
      expect(split.platformAmount.toFixed(2)).toBe('14.99');
    });
  });

  describe('getUserPurchases', () => {
    it('should retrieve all purchases for a user', async () => {
      const userId = 'user123';
      const mockPurchases = [
        {
          id: 'purchase_1',
          courseId: 'course1',
          purchaseDate: new Date(),
        },
        {
          id: 'purchase_2',
          courseId: 'course2',
          purchaseDate: new Date(),
        },
      ];

      mockPrisma.coursePurchase.findMany = jest.fn().mockResolvedValue(mockPurchases);

      const result = await coursePurchaseService.getUserPurchases(userId);

      expect(result).toHaveLength(2);
      expect(mockPrisma.coursePurchase.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });
  });

  describe('checkPurchaseStatus', () => {
    it('should return true if user has purchased course', async () => {
      const userId = 'user123';
      const courseId = 'course123';

      mockPrisma.coursePurchase.findFirst = jest.fn().mockResolvedValue({
        id: 'purchase_123',
      });

      const result = await coursePurchaseService.checkPurchaseStatus(userId, courseId);

      expect(result).toBe(true);
    });

    it('should return false if user has not purchased course', async () => {
      mockPrisma.coursePurchase.findFirst = jest.fn().mockResolvedValue(null);

      const result = await coursePurchaseService.checkPurchaseStatus('user123', 'course123');

      expect(result).toBe(false);
    });
  });
});
