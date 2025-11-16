/**
 * Proof-of-Knowledge Validator Service
 * Manages course completion verification, certificate generation, and token redemption gating
 */

import { PrismaClient, Enrollment, EnrollmentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { createHash } from 'crypto';
import { logger } from '../shared/logging';
import { ErrorHandler } from '../payment/error-handler';

const prisma = new PrismaClient();

/**
 * Proof of Knowledge completion status
 */
export enum CompletionStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}

/**
 * Certificate information
 */
export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  completionDate: Date;
  verificationHash: string;
  expiryDate?: Date;
  isValid: boolean;
}

/**
 * Completion status details
 */
export interface CompletionStatusDetails {
  userId: string;
  courseId: string;
  status: CompletionStatus;
  progress: number;
  enrolledAt: Date;
  completedAt?: Date;
  certificateId?: string;
  expiryDate?: Date;
}

/**
 * Proof of Knowledge validation result
 */
export interface ValidationResult {
  isValid: boolean;
  userId: string;
  courseId: string;
  completionDate?: Date;
  certificateId?: string;
  errors: string[];
}

/**
 * Redemption eligibility check
 */
export interface RedemptionEligibility {
  canRedeem: boolean;
  userId: string;
  completedCourses: number;
  totalProofs: number;
  errors: string[];
}

export class ProofOfKnowledgeValidator {
  /**
   * Verify course completion for a user
   */
  async validateCompletion(userId: string, courseId: string): Promise<ValidationResult> {
    try {
      logger.info('Validating course completion', { userId, courseId });

      // Check if enrollment exists and is completed
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        include: {
          course: true,
        },
      });

      if (!enrollment) {
        return {
          isValid: false,
          userId,
          courseId,
          errors: ['No enrollment found for this user and course'],
        };
      }

      // Check if course is completed
      if (enrollment.status !== EnrollmentStatus.COMPLETED) {
        return {
          isValid: false,
          userId,
          courseId,
          errors: [`Course not completed. Current status: ${enrollment.status}`],
        };
      }

      // Check if completion date exists
      if (!enrollment.completedAt) {
        return {
          isValid: false,
          userId,
          courseId,
          errors: ['Completion date not recorded'],
        };
      }

      // Check if proof of knowledge already exists
      const existingProof = await prisma.proofOfKnowledge.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });

      if (existingProof) {
        // Check if expired
        if (existingProof.expiryDate && new Date() > existingProof.expiryDate) {
          return {
            isValid: false,
            userId,
            courseId,
            completionDate: enrollment.completedAt,
            certificateId: existingProof.certificateId,
            errors: ['Certificate has expired'],
          };
        }

        return {
          isValid: true,
          userId,
          courseId,
          completionDate: enrollment.completedAt,
          certificateId: existingProof.certificateId,
          errors: [],
        };
      }

      return {
        isValid: true,
        userId,
        courseId,
        completionDate: enrollment.completedAt,
        errors: [],
      };
    } catch (error) {
      logger.error('Failed to validate completion', { error, userId, courseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Record a learning milestone for a user
   */
  async recordMilestone(userId: string, milestone: string): Promise<void> {
    try {
      logger.info('Recording milestone', { userId, milestone });

      // Get user's current profile or create one
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Store milestone in user metadata or create a milestone record
      // For now, we'll log it - in a full implementation, you'd have a Milestone model
      logger.info('Milestone recorded successfully', { userId, milestone });
    } catch (error) {
      logger.error('Failed to record milestone', { error, userId, milestone });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Check if user can redeem tokens based on proof of knowledge
   */
  async canRedeemTokens(userId: string): Promise<RedemptionEligibility> {
    try {
      logger.info('Checking token redemption eligibility', { userId });

      // Get all completed courses for the user
      const completedEnrollments = await prisma.enrollment.findMany({
        where: {
          userId,
          status: EnrollmentStatus.COMPLETED,
        },
      });

      if (completedEnrollments.length === 0) {
        return {
          canRedeem: false,
          userId,
          completedCourses: 0,
          totalProofs: 0,
          errors: ['No completed courses found. Complete at least one course to redeem tokens.'],
        };
      }

      // Get all valid proofs of knowledge
      const validProofs = await prisma.proofOfKnowledge.findMany({
        where: {
          userId,
          expiryDate: {
            gt: new Date(), // Not expired
          },
        },
      });

      // Check if user has at least one valid proof
      if (validProofs.length === 0) {
        return {
          canRedeem: false,
          userId,
          completedCourses: completedEnrollments.length,
          totalProofs: 0,
          errors: ['No valid proof of knowledge found. Generate certificates for completed courses.'],
        };
      }

      return {
        canRedeem: true,
        userId,
        completedCourses: completedEnrollments.length,
        totalProofs: validProofs.length,
        errors: [],
      };
    } catch (error) {
      logger.error('Failed to check redemption eligibility', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Generate a certificate for course completion
   */
  async generateCertificate(userId: string, courseId: string): Promise<Certificate> {
    try {
      logger.info('Generating certificate', { userId, courseId });

      // Validate completion first
      const validation = await this.validateCompletion(userId, courseId);

      if (!validation.isValid) {
        throw new Error(`Cannot generate certificate: ${validation.errors.join(', ')}`);
      }

      // Get course and enrollment details
      const [enrollment, course] = await Promise.all([
        prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
        }),
        prisma.course.findUnique({
          where: { id: courseId },
          select: { id: true, title: true },
        }),
      ]);

      if (!enrollment || !course) {
        throw new Error('Enrollment or course not found');
      }

      // Generate verification hash
      const verificationHash = this.generateVerificationHash(userId, courseId, enrollment.completedAt!);

      // Generate certificate ID
      const certificateId = `CERT-${userId.substring(0, 8)}-${courseId.substring(0, 8)}-${Date.now()}`;

      // Set expiry date (1 year from completion)
      const expiryDate = new Date(enrollment.completedAt!);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      // Create or update proof of knowledge
      const proof = await prisma.proofOfKnowledge.upsert({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        update: {
          certificateId,
          verificationHash,
          expiryDate,
          updatedAt: new Date(),
        },
        create: {
          userId,
          courseId,
          completionDate: enrollment.completedAt!,
          certificateId,
          verificationHash,
          expiryDate,
        },
      });

      logger.info('Certificate generated successfully', {
        userId,
        courseId,
        certificateId,
      });

      return {
        id: proof.id,
        userId: proof.userId,
        courseId: proof.courseId,
        courseName: course.title,
        completionDate: proof.completionDate,
        verificationHash: proof.verificationHash,
        expiryDate: proof.expiryDate || undefined,
        isValid: !proof.expiryDate || new Date() < proof.expiryDate,
      };
    } catch (error) {
      logger.error('Failed to generate certificate', { error, userId, courseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get completion status for a user and course
   */
  async getCompletionStatus(userId: string, courseId?: string): Promise<CompletionStatusDetails | CompletionStatusDetails[]> {
    try {
      logger.info('Getting completion status', { userId, courseId });

      if (courseId) {
        // Get status for specific course
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
          include: {
            course: true,
          },
        });

        if (!enrollment) {
          return {
            userId,
            courseId,
            status: CompletionStatus.NOT_STARTED,
            progress: 0,
            enrolledAt: new Date(),
          };
        }

        // Get proof of knowledge if exists
        const proof = await prisma.proofOfKnowledge.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
        });

        let status = CompletionStatus.IN_PROGRESS;
        if (enrollment.status === EnrollmentStatus.COMPLETED) {
          status = CompletionStatus.COMPLETED;
          if (proof?.expiryDate && new Date() > proof.expiryDate) {
            status = CompletionStatus.EXPIRED;
          }
        }

        return {
          userId,
          courseId,
          status,
          progress: enrollment.progress,
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt || undefined,
          certificateId: proof?.certificateId,
          expiryDate: proof?.expiryDate || undefined,
        };
      } else {
        // Get status for all courses
        const enrollments = await prisma.enrollment.findMany({
          where: { userId },
          include: {
            course: true,
          },
        });

        const proofs = await prisma.proofOfKnowledge.findMany({
          where: { userId },
        });

        const proofMap = new Map(proofs.map((p) => [`${p.userId}-${p.courseId}`, p]));

        return enrollments.map((enrollment) => {
          const proof = proofMap.get(`${enrollment.userId}-${enrollment.courseId}`);

          let status = CompletionStatus.IN_PROGRESS;
          if (enrollment.status === EnrollmentStatus.COMPLETED) {
            status = CompletionStatus.COMPLETED;
            if (proof?.expiryDate && new Date() > proof.expiryDate) {
              status = CompletionStatus.EXPIRED;
            }
          }

          return {
            userId: enrollment.userId,
            courseId: enrollment.courseId,
            status,
            progress: enrollment.progress,
            enrolledAt: enrollment.enrolledAt,
            completedAt: enrollment.completedAt || undefined,
            certificateId: proof?.certificateId,
            expiryDate: proof?.expiryDate || undefined,
          };
        });
      }
    } catch (error) {
      logger.error('Failed to get completion status', { error, userId, courseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Verify a certificate using its verification hash
   */
  async verifyCertificate(userId: string, courseId: string, verificationHash: string): Promise<boolean> {
    try {
      logger.info('Verifying certificate', { userId, courseId });

      const proof = await prisma.proofOfKnowledge.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });

      if (!proof) {
        logger.warn('Certificate not found', { userId, courseId });
        return false;
      }

      // Check if expired
      if (proof.expiryDate && new Date() > proof.expiryDate) {
        logger.warn('Certificate expired', { userId, courseId });
        return false;
      }

      // Verify hash
      const isValid = proof.verificationHash === verificationHash;

      if (!isValid) {
        logger.warn('Certificate verification failed - hash mismatch', { userId, courseId });
      }

      return isValid;
    } catch (error) {
      logger.error('Failed to verify certificate', { error, userId, courseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get all valid proofs for a user
   */
  async getUserProofs(userId: string): Promise<Certificate[]> {
    try {
      logger.info('Getting user proofs', { userId });

      const proofs = await prisma.proofOfKnowledge.findMany({
        where: { userId },
        include: {
          user: true,
        },
      });

      // Filter out expired certificates
      const validProofs = proofs.filter((proof) => !proof.expiryDate || new Date() < proof.expiryDate);

      // Get course details for each proof
      const certificates = await Promise.all(
        validProofs.map(async (proof) => {
          const course = await prisma.course.findUnique({
            where: { id: proof.courseId },
            select: { title: true },
          });

          return {
            id: proof.id,
            userId: proof.userId,
            courseId: proof.courseId,
            courseName: course?.title || 'Unknown Course',
            completionDate: proof.completionDate,
            verificationHash: proof.verificationHash,
            expiryDate: proof.expiryDate || undefined,
            isValid: !proof.expiryDate || new Date() < proof.expiryDate,
          };
        })
      );

      return certificates;
    } catch (error) {
      logger.error('Failed to get user proofs', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get proof statistics for a user
   */
  async getProofStatistics(userId: string): Promise<{
    totalProofs: number;
    validProofs: number;
    expiredProofs: number;
    completedCourses: number;
  }> {
    try {
      logger.info('Getting proof statistics', { userId });

      const proofs = await prisma.proofOfKnowledge.findMany({
        where: { userId },
      });

      const completedEnrollments = await prisma.enrollment.findMany({
        where: {
          userId,
          status: EnrollmentStatus.COMPLETED,
        },
      });

      const now = new Date();
      const validProofs = proofs.filter((p) => !p.expiryDate || p.expiryDate > now);
      const expiredProofs = proofs.filter((p) => p.expiryDate && p.expiryDate <= now);

      return {
        totalProofs: proofs.length,
        validProofs: validProofs.length,
        expiredProofs: expiredProofs.length,
        completedCourses: completedEnrollments.length,
      };
    } catch (error) {
      logger.error('Failed to get proof statistics', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Generate verification hash for a certificate
   */
  private generateVerificationHash(userId: string, courseId: string, completionDate: Date): string {
    const data = `${userId}:${courseId}:${completionDate.getTime()}`;
    return createHash('sha256').update(data).digest('hex');
  }
}

export default new ProofOfKnowledgeValidator();
