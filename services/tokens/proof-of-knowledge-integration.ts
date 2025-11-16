/**
 * Proof-of-Knowledge Integration
 * Integrates Proof-of-Knowledge validation into token redemption flows
 */

import { ProofOfKnowledgeValidator } from './proof-of-knowledge-validator';
import { TokenRedemptionService } from './token-redemption';
import { logger } from '../shared/logging';
import { ErrorHandler } from '../payment/error-handler';
import { Decimal } from '@prisma/client/runtime/library';

const pokValidator = new ProofOfKnowledgeValidator();
const tokenRedemptionService = new TokenRedemptionService();

/**
 * Gated token redemption request
 */
export interface GatedRedemptionRequest {
  userId: string;
  amount: Decimal;
  type: string;
  requireProofOfKnowledge?: boolean;
  courseId?: string;
  metadata?: any;
}

/**
 * Gated redemption response
 */
export interface GatedRedemptionResponse {
  success: boolean;
  redemptionId?: string;
  message: string;
  proofValidation?: {
    isValid: boolean;
    completedCourses: number;
    validProofs: number;
  };
}

export class ProofOfKnowledgeIntegration {
  /**
   * Request token redemption with proof-of-knowledge gating
   * Ensures user has completed at least one course before redeeming tokens
   */
  async requestGatedRedemption(request: GatedRedemptionRequest): Promise<GatedRedemptionResponse> {
    try {
      logger.info('Requesting gated token redemption', {
        userId: request.userId,
        amount: request.amount.toString(),
        type: request.type,
        requireProofOfKnowledge: request.requireProofOfKnowledge,
      });

      // Check proof of knowledge if required
      if (request.requireProofOfKnowledge !== false) {
        const eligibility = await pokValidator.canRedeemTokens(request.userId);

        if (!eligibility.canRedeem) {
          logger.warn('User not eligible for token redemption', {
            userId: request.userId,
            errors: eligibility.errors,
          });

          return {
            success: false,
            message: `Cannot redeem tokens: ${eligibility.errors.join(', ')}`,
            proofValidation: {
              isValid: false,
              completedCourses: eligibility.completedCourses,
              validProofs: eligibility.totalProofs,
            },
          };
        }

        logger.info('User proof-of-knowledge validated', {
          userId: request.userId,
          completedCourses: eligibility.completedCourses,
          validProofs: eligibility.totalProofs,
        });
      }

      // Proceed with token redemption
      const redemption = await tokenRedemptionService.requestRedemption({
        userId: request.userId,
        amount: request.amount,
        type: request.type as any,
        metadata: {
          ...request.metadata,
          proofOfKnowledgeRequired: request.requireProofOfKnowledge !== false,
          courseId: request.courseId,
        },
      });

      return {
        success: true,
        redemptionId: redemption.id,
        message: 'Token redemption request created successfully',
        proofValidation: {
          isValid: true,
          completedCourses: 0,
          validProofs: 0,
        },
      };
    } catch (error) {
      logger.error('Failed to request gated redemption', { error, ...request });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Verify course completion before allowing token redemption
   * Used for course-specific token redemptions
   */
  async verifyAndRedeemForCourse(
    userId: string,
    courseId: string,
    amount: Decimal,
    redemptionType: string
  ): Promise<GatedRedemptionResponse> {
    try {
      logger.info('Verifying course completion for token redemption', {
        userId,
        courseId,
        amount: amount.toString(),
      });

      // Validate course completion
      const validation = await pokValidator.validateCompletion(userId, courseId);

      if (!validation.isValid) {
        logger.warn('Course completion validation failed', {
          userId,
          courseId,
          errors: validation.errors,
        });

        return {
          success: false,
          message: `Cannot redeem tokens: ${validation.errors.join(', ')}`,
          proofValidation: {
            isValid: false,
            completedCourses: 0,
            validProofs: 0,
          },
        };
      }

      // Generate certificate if not already generated
      if (!validation.certificateId) {
        await pokValidator.generateCertificate(userId, courseId);
        logger.info('Certificate generated for course completion', { userId, courseId });
      }

      // Proceed with token redemption
      const redemption = await tokenRedemptionService.requestRedemption({
        userId,
        amount,
        type: redemptionType as any,
        metadata: {
          courseId,
          certificateId: validation.certificateId,
          completionDate: validation.completionDate,
        },
      });

      return {
        success: true,
        redemptionId: redemption.id,
        message: 'Token redemption request created successfully',
        proofValidation: {
          isValid: true,
          completedCourses: 1,
          validProofs: 1,
        },
      };
    } catch (error) {
      logger.error('Failed to verify and redeem for course', { error, userId, courseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get redemption eligibility status for a user
   */
  async getRedemptionEligibility(userId: string): Promise<{
    canRedeem: boolean;
    completedCourses: number;
    validProofs: number;
    statistics: {
      totalProofs: number;
      expiredProofs: number;
    };
    message: string;
  }> {
    try {
      logger.info('Getting redemption eligibility', { userId });

      const eligibility = await pokValidator.canRedeemTokens(userId);
      const statistics = await pokValidator.getProofStatistics(userId);

      return {
        canRedeem: eligibility.canRedeem,
        completedCourses: eligibility.completedCourses,
        validProofs: eligibility.totalProofs,
        statistics: {
          totalProofs: statistics.totalProofs,
          expiredProofs: statistics.expiredProofs,
        },
        message: eligibility.canRedeem
          ? `You have ${eligibility.totalProofs} valid proof(s) of knowledge`
          : eligibility.errors[0],
      };
    } catch (error) {
      logger.error('Failed to get redemption eligibility', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get user's certificate information
   */
  async getUserCertificates(userId: string): Promise<{
    certificates: Array<{
      courseId: string;
      courseName: string;
      completionDate: Date;
      expiryDate?: Date;
      isValid: boolean;
    }>;
    totalValid: number;
    totalExpired: number;
  }> {
    try {
      logger.info('Getting user certificates', { userId });

      const proofs = await pokValidator.getUserProofs(userId);
      const statistics = await pokValidator.getProofStatistics(userId);

      return {
        certificates: proofs.map((proof) => ({
          courseId: proof.courseId,
          courseName: proof.courseName,
          completionDate: proof.completionDate,
          expiryDate: proof.expiryDate,
          isValid: proof.isValid,
        })),
        totalValid: statistics.validProofs,
        totalExpired: statistics.expiredProofs,
      };
    } catch (error) {
      logger.error('Failed to get user certificates', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Verify a certificate using verification hash
   * Used for external verification of certificates
   */
  async verifyCertificateExternal(
    userId: string,
    courseId: string,
    verificationHash: string
  ): Promise<{
    isValid: boolean;
    message: string;
    certificateDetails?: {
      courseName: string;
      completionDate: Date;
      expiryDate?: Date;
    };
  }> {
    try {
      logger.info('Verifying certificate externally', { userId, courseId });

      const isValid = await pokValidator.verifyCertificate(userId, courseId, verificationHash);

      if (!isValid) {
        return {
          isValid: false,
          message: 'Certificate verification failed',
        };
      }

      // Get certificate details
      const proofs = await pokValidator.getUserProofs(userId);
      const certificate = proofs.find((p) => p.courseId === courseId);

      if (!certificate) {
        return {
          isValid: false,
          message: 'Certificate not found',
        };
      }

      return {
        isValid: true,
        message: 'Certificate verified successfully',
        certificateDetails: {
          courseName: certificate.courseName,
          completionDate: certificate.completionDate,
          expiryDate: certificate.expiryDate,
        },
      };
    } catch (error) {
      logger.error('Failed to verify certificate externally', { error, userId, courseId });
      throw ErrorHandler.handle(error);
    }
  }
}

export default new ProofOfKnowledgeIntegration();
