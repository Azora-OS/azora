/**
 * Compliance Service
 * 
 * Manages KYC/AML verification and compliance status tracking
 */

import { ElaraLogger } from '../utils/logger';

export interface KYCData {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  address?: string;
  idType?: string;
  idNumber?: string;
}

export interface AMLData {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
}

export interface ComplianceStatus {
  userId: string;
  kycStatus: 'pending' | 'verified' | 'failed' | 'manual_review';
  amlStatus: 'pending' | 'passed' | 'failed' | 'manual_review';
  overallStatus: 'pending' | 'approved' | 'rejected' | 'manual_review';
  kycResult?: any;
  amlResult?: any;
  reviewedAt?: Date;
  reviewedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ComplianceService {
  private logger: ElaraLogger;
  private complianceRecords: Map<string, ComplianceStatus> = new Map();

  constructor() {
    this.logger = new ElaraLogger('ComplianceService');
  }

  /**
   * Perform KYC verification
   */
  async performKYC(userId: string, data: KYCData): Promise<ComplianceStatus> {
    try {
      this.logger.info(`Performing KYC verification for user: ${userId}`);

      const status = this.complianceRecords.get(userId) || this.createInitialStatus(userId);

      // Validate required fields
      if (!data.firstName || !data.lastName || !data.email) {
        status.kycStatus = 'failed';
        this.logger.warn(`KYC failed for user ${userId}: missing required fields`);
      } else {
        // In production, would call third-party KYC service
        // For now, simulate verification
        status.kycStatus = this.simulateKYCVerification(data);
        status.kycResult = {
          verified: status.kycStatus === 'verified',
          timestamp: new Date(),
          method: 'document_verification',
        };
      }

      status.updatedAt = new Date();
      this.updateOverallStatus(status);
      this.complianceRecords.set(userId, status);

      this.logger.info(`KYC verification completed for user ${userId}: ${status.kycStatus}`);
      return status;
    } catch (error) {
      this.logger.error('Error performing KYC:', error);
      throw error;
    }
  }

  /**
   * Perform AML screening
   */
  async performAML(userId: string, data: AMLData): Promise<ComplianceStatus> {
    try {
      this.logger.info(`Performing AML screening for user: ${userId}`);

      const status = this.complianceRecords.get(userId) || this.createInitialStatus(userId);

      // Validate required fields
      if (!data.firstName || !data.lastName) {
        status.amlStatus = 'failed';
        this.logger.warn(`AML screening failed for user ${userId}: missing required fields`);
      } else {
        // In production, would call third-party AML service
        // For now, simulate screening
        status.amlStatus = this.simulateAMLScreening(data);
        status.amlResult = {
          passed: status.amlStatus === 'passed',
          timestamp: new Date(),
          method: 'sanctions_screening',
          riskLevel: 'low',
        };
      }

      status.updatedAt = new Date();
      this.updateOverallStatus(status);
      this.complianceRecords.set(userId, status);

      this.logger.info(`AML screening completed for user ${userId}: ${status.amlStatus}`);
      return status;
    } catch (error) {
      this.logger.error('Error performing AML screening:', error);
      throw error;
    }
  }

  /**
   * Get compliance status
   */
  async getComplianceStatus(userId: string): Promise<ComplianceStatus | null> {
    try {
      this.logger.info(`Getting compliance status for user: ${userId}`);
      return this.complianceRecords.get(userId) || null;
    } catch (error) {
      this.logger.error('Error getting compliance status:', error);
      throw error;
    }
  }

  /**
   * Flag for manual review
   */
  async flagForManualReview(userId: string, reason: string): Promise<ComplianceStatus> {
    try {
      this.logger.info(`Flagging user ${userId} for manual review: ${reason}`);

      const status = this.complianceRecords.get(userId) || this.createInitialStatus(userId);

      if (status.kycStatus !== 'verified') {
        status.kycStatus = 'manual_review';
      }
      if (status.amlStatus !== 'passed') {
        status.amlStatus = 'manual_review';
      }

      status.overallStatus = 'manual_review';
      status.updatedAt = new Date();

      this.complianceRecords.set(userId, status);
      this.logger.info(`User ${userId} flagged for manual review`);

      return status;
    } catch (error) {
      this.logger.error('Error flagging for manual review:', error);
      throw error;
    }
  }

  /**
   * Approve compliance
   */
  async approveCompliance(userId: string, reviewedBy: string): Promise<ComplianceStatus> {
    try {
      this.logger.info(`Approving compliance for user: ${userId}`);

      const status = this.complianceRecords.get(userId) || this.createInitialStatus(userId);

      status.kycStatus = 'verified';
      status.amlStatus = 'passed';
      status.overallStatus = 'approved';
      status.reviewedAt = new Date();
      status.reviewedBy = reviewedBy;
      status.updatedAt = new Date();

      this.complianceRecords.set(userId, status);
      this.logger.info(`Compliance approved for user ${userId}`);

      return status;
    } catch (error) {
      this.logger.error('Error approving compliance:', error);
      throw error;
    }
  }

  /**
   * Reject compliance
   */
  async rejectCompliance(userId: string, reason: string, reviewedBy: string): Promise<ComplianceStatus> {
    try {
      this.logger.info(`Rejecting compliance for user: ${userId}, reason: ${reason}`);

      const status = this.complianceRecords.get(userId) || this.createInitialStatus(userId);

      status.kycStatus = 'failed';
      status.amlStatus = 'failed';
      status.overallStatus = 'rejected';
      status.reviewedAt = new Date();
      status.reviewedBy = reviewedBy;
      status.updatedAt = new Date();

      this.complianceRecords.set(userId, status);
      this.logger.info(`Compliance rejected for user ${userId}`);

      return status;
    } catch (error) {
      this.logger.error('Error rejecting compliance:', error);
      throw error;
    }
  }

  /**
   * Check if user is compliant
   */
  async isCompliant(userId: string): Promise<boolean> {
    try {
      const status = await this.getComplianceStatus(userId);
      return status?.overallStatus === 'approved' || false;
    } catch (error) {
      this.logger.error('Error checking compliance:', error);
      throw error;
    }
  }

  // Private helper methods

  private createInitialStatus(userId: string): ComplianceStatus {
    return {
      userId,
      kycStatus: 'pending',
      amlStatus: 'pending',
      overallStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private simulateKYCVerification(data: KYCData): 'verified' | 'failed' | 'manual_review' {
    // Simulate KYC verification
    // In production, would call actual KYC service
    if (!data.firstName || !data.lastName) {
      return 'failed';
    }
    // 90% pass rate for demo
    return Math.random() > 0.1 ? 'verified' : 'manual_review';
  }

  private simulateAMLScreening(data: AMLData): 'passed' | 'failed' | 'manual_review' {
    // Simulate AML screening
    // In production, would call actual AML service
    if (!data.firstName || !data.lastName) {
      return 'failed';
    }
    // 95% pass rate for demo
    return Math.random() > 0.05 ? 'passed' : 'manual_review';
  }

  private updateOverallStatus(status: ComplianceStatus): void {
    if (status.kycStatus === 'failed' || status.amlStatus === 'failed') {
      status.overallStatus = 'rejected';
    } else if (status.kycStatus === 'manual_review' || status.amlStatus === 'manual_review') {
      status.overallStatus = 'manual_review';
    } else if (status.kycStatus === 'verified' && status.amlStatus === 'passed') {
      status.overallStatus = 'approved';
    } else {
      status.overallStatus = 'pending';
    }
  }
}
