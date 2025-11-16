/**
 * Proof-of-Knowledge Validator Tests
 * Tests for course completion verification, certificate generation, and token redemption gating
 */

import { ProofOfKnowledgeValidator, CompletionStatus } from '../proof-of-knowledge-validator';
import { PrismaClient, EnrollmentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();
const validator = new ProofOfKnowledgeValidator();

describe('ProofOfKnowledgeValidator', () => {
  let testUserId: string;
  let testCourseId: string;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: `test-pok-${Date.now()}@example.com`,
        name: 'Test User',
        password: 'hashed_password',
      },
    });
    testUserId = user.id;

    // Create test course
    const course = await prisma.course.create({
      data: {
        instructorId: user.id,
        title: 'Test Course',
        description: 'Test course for POK validation',
        category: 'Technology',
        duration: 60,
        price: 100,
      },
    });
    testCourseId = course.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.proofOfKnowledge.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.enrollment.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.course.deleteMany({
      where: { instructorId: testUserId },
    });
    await prisma.user.delete({
      where: { id: testUserId },
    });
    await prisma.$disconnect();
  });

  describe('validateCompletion', () => {
    it('should return invalid when no enrollment exists', async () => {
      const result = await validator.validateCompletion(testUserId, 'non-existent-course');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No enrollment found for this user and course');
    });

    it('should return invalid when course is not completed', async () => {
      // Create incomplete enrollment
      await prisma.enrollment.create({
        data: {
          userId: testUserId,
          courseId: testCourseId,
          status: EnrollmentStatus.ACTIVE,
          progress: 50,
        },
      });

      const result = await validator.validateCompletion(testUserId, testCourseId);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Course not completed');
    });

    it('should return valid when course is completed', async () => {
      // Update enrollment to completed
      const completedAt = new Date();
      await prisma.enrollment.update({
        where: {
          userId_courseId: {
            userId: testUserId,
            courseId: testCourseId,
          },
        },
        data: {
          status: EnrollmentStatus.COMPLETED,
          progress: 100,
          completedAt,
        },
      });

      const result = await validator.validateCompletion(testUserId, testCourseId);

      expect(result.isValid).toBe(true);
      expect(result.completionDate).toEqual(completedAt);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid when certificate is expired', async () => {
      // Create expired proof
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1); // Yesterday

      await prisma.proofOfKnowledge.create({
        data: {
          userId: testUserId,
          courseId: testCourseId,
          completionDate: new Date(),
          certificateId: 'CERT-EXPIRED',
          verificationHash: 'hash-expired',
          expiryDate: expiredDate,
        },
      });

      const result = await validator.validateCompletion(testUserId, testCourseId);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Certificate has expired');
    });
  });

  describe('generateCertificate', () => {
    it('should generate certificate for completed course', async () => {
      const certificate = await validator.generateCertificate(testUserId, testCourseId);

      expect(certificate.id).toBeDefined();
      expect(certificate.userId).toBe(testUserId);
      expect(certificate.courseId).toBe(testCourseId);
      expect(certificate.certificateId).toMatch(/^CERT-/);
      expect(certificate.verificationHash).toBeDefined();
      expect(certificate.isValid).toBe(true);
      expect(certificate.expiryDate).toBeDefined();
    });

    it('should throw error when generating certificate for incomplete course', async () => {
      // Create another course
      const course2 = await prisma.course.create({
        data: {
          instructorId: testUserId,
          title: 'Test Course 2',
          description: 'Test course 2',
          category: 'Technology',
          duration: 60,
          price: 100,
        },
      });

      // Create incomplete enrollment
      await prisma.enrollment.create({
        data: {
          userId: testUserId,
          courseId: course2.id,
          status: EnrollmentStatus.ACTIVE,
          progress: 50,
        },
      });

      await expect(validator.generateCertificate(testUserId, course2.id)).rejects.toThrow();

      // Cleanup
      await prisma.enrollment.deleteMany({
        where: { courseId: course2.id },
      });
      await prisma.course.delete({
        where: { id: course2.id },
      });
    });

    it('should update existing certificate', async () => {
      const cert1 = await validator.generateCertificate(testUserId, testCourseId);
      const cert2 = await validator.generateCertificate(testUserId, testCourseId);

      expect(cert1.id).toBe(cert2.id);
      expect(cert1.certificateId).not.toBe(cert2.certificateId);
    });
  });

  describe('canRedeemTokens', () => {
    it('should return false when no completed courses', async () => {
      // Create new user with no completions
      const newUser = await prisma.user.create({
        data: {
          email: `test-redeem-${Date.now()}@example.com`,
          name: 'Redeem Test User',
          password: 'hashed_password',
        },
      });

      const result = await validator.canRedeemTokens(newUser.id);

      expect(result.canRedeem).toBe(false);
      expect(result.completedCourses).toBe(0);
      expect(result.errors).toContain('No completed courses found. Complete at least one course to redeem tokens.');

      // Cleanup
      await prisma.user.delete({
        where: { id: newUser.id },
      });
    });

    it('should return true when user has valid proofs', async () => {
      const result = await validator.canRedeemTokens(testUserId);

      expect(result.canRedeem).toBe(true);
      expect(result.completedCourses).toBeGreaterThan(0);
      expect(result.totalProofs).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('getCompletionStatus', () => {
    it('should return completion status for specific course', async () => {
      const status = await validator.getCompletionStatus(testUserId, testCourseId);

      if (Array.isArray(status)) {
        throw new Error('Expected single status, got array');
      }

      expect(status.userId).toBe(testUserId);
      expect(status.courseId).toBe(testCourseId);
      expect(status.status).toBe(CompletionStatus.COMPLETED);
      expect(status.progress).toBe(100);
      expect(status.completedAt).toBeDefined();
      expect(status.certificateId).toBeDefined();
    });

    it('should return completion status for all courses', async () => {
      const statuses = await validator.getCompletionStatus(testUserId);

      expect(Array.isArray(statuses)).toBe(true);
      expect(statuses.length).toBeGreaterThan(0);

      const testStatus = (statuses as any[]).find((s) => s.courseId === testCourseId);
      expect(testStatus).toBeDefined();
      expect(testStatus.status).toBe(CompletionStatus.COMPLETED);
    });

    it('should return NOT_STARTED for non-existent enrollment', async () => {
      // Create new course
      const course = await prisma.course.create({
        data: {
          instructorId: testUserId,
          title: 'New Test Course',
          description: 'New test course',
          category: 'Technology',
          duration: 60,
          price: 100,
        },
      });

      const status = await validator.getCompletionStatus(testUserId, course.id);

      if (Array.isArray(status)) {
        throw new Error('Expected single status, got array');
      }

      expect(status.status).toBe(CompletionStatus.NOT_STARTED);
      expect(status.progress).toBe(0);

      // Cleanup
      await prisma.course.delete({
        where: { id: course.id },
      });
    });
  });

  describe('verifyCertificate', () => {
    it('should verify valid certificate', async () => {
      const certificate = await validator.generateCertificate(testUserId, testCourseId);

      const isValid = await validator.verifyCertificate(
        testUserId,
        testCourseId,
        certificate.verificationHash
      );

      expect(isValid).toBe(true);
    });

    it('should reject invalid hash', async () => {
      const isValid = await validator.verifyCertificate(testUserId, testCourseId, 'invalid-hash');

      expect(isValid).toBe(false);
    });

    it('should reject non-existent certificate', async () => {
      const isValid = await validator.verifyCertificate(testUserId, 'non-existent-course', 'any-hash');

      expect(isValid).toBe(false);
    });
  });

  describe('getUserProofs', () => {
    it('should return all valid proofs for user', async () => {
      const proofs = await validator.getUserProofs(testUserId);

      expect(Array.isArray(proofs)).toBe(true);
      expect(proofs.length).toBeGreaterThan(0);

      const testProof = proofs.find((p) => p.courseId === testCourseId);
      expect(testProof).toBeDefined();
      expect(testProof?.isValid).toBe(true);
    });

    it('should not include expired proofs', async () => {
      // Create another course
      const course = await prisma.course.create({
        data: {
          instructorId: testUserId,
          title: 'Expiring Course',
          description: 'Course with expiring certificate',
          category: 'Technology',
          duration: 60,
          price: 100,
        },
      });

      // Create completed enrollment
      const completedAt = new Date();
      await prisma.enrollment.create({
        data: {
          userId: testUserId,
          courseId: course.id,
          status: EnrollmentStatus.COMPLETED,
          progress: 100,
          completedAt,
        },
      });

      // Create expired proof
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);

      await prisma.proofOfKnowledge.create({
        data: {
          userId: testUserId,
          courseId: course.id,
          completionDate: completedAt,
          certificateId: 'CERT-EXPIRED-TEST',
          verificationHash: 'hash-expired-test',
          expiryDate: expiredDate,
        },
      });

      const proofs = await validator.getUserProofs(testUserId);

      const expiredProof = proofs.find((p) => p.courseId === course.id);
      expect(expiredProof).toBeUndefined();

      // Cleanup
      await prisma.proofOfKnowledge.deleteMany({
        where: { courseId: course.id },
      });
      await prisma.enrollment.deleteMany({
        where: { courseId: course.id },
      });
      await prisma.course.delete({
        where: { id: course.id },
      });
    });
  });

  describe('getProofStatistics', () => {
    it('should return proof statistics for user', async () => {
      const stats = await validator.getProofStatistics(testUserId);

      expect(stats.totalProofs).toBeGreaterThanOrEqual(0);
      expect(stats.validProofs).toBeGreaterThanOrEqual(0);
      expect(stats.expiredProofs).toBeGreaterThanOrEqual(0);
      expect(stats.completedCourses).toBeGreaterThanOrEqual(0);
      expect(stats.totalProofs).toBe(stats.validProofs + stats.expiredProofs);
    });
  });

  describe('recordMilestone', () => {
    it('should record milestone without error', async () => {
      await expect(validator.recordMilestone(testUserId, 'completed-first-course')).resolves.not.toThrow();
    });

    it('should throw error for non-existent user', async () => {
      await expect(validator.recordMilestone('non-existent-user', 'milestone')).rejects.toThrow();
    });
  });
});
