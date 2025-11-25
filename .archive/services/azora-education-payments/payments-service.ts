/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Education Payments & Rewards Integration
 * 
 * Features:
 * - Course payment processing
 * - Scholarship management
 * - Rewards integration with mint service
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

export interface CoursePayment {
  id: string;
  studentId: string;
  studentNumber: string;
  courseId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'credit-card' | 'azr-tokens' | 'bank-transfer' | 'scholarship';
  transactionId?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Scholarship {
  id: string;
  name: string;
  description: string;
  eligibilityCriteria: string[];
  amount: number;
  coverage: 'full' | 'partial';
  percentage?: number; // For partial coverage
  maxRecipients?: number;
  currentRecipients: number;
  applicationDeadline?: Date;
  status: 'active' | 'closed' | 'expired';
  createdAt: Date;
}

export interface ScholarshipApplication {
  id: string;
  scholarshipId: string;
  studentId: string;
  studentNumber: string;
  applicationData: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

export interface RewardTransaction {
  id: string;
  studentId: string;
  studentNumber: string;
  type: 'course-completion' | 'achievement' | 'referral' | 'participation';
  amount: number; // AZR tokens
  courseId?: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  mintTransactionId?: string;
  createdAt: Date;
  completedAt?: Date;
}

export class EducationPaymentsService extends EventEmitter {
  private static instance: EducationPaymentsService;
  private payments: Map<string, CoursePayment> = new Map();
  private scholarships: Map<string, Scholarship> = new Map();
  private applications: Map<string, ScholarshipApplication> = new Map();
  private rewards: Map<string, RewardTransaction> = new Map();

  private constructor() {
    super();
  }

  public static getInstance(): EducationPaymentsService {
    if (!EducationPaymentsService.instance) {
      EducationPaymentsService.instance = new EducationPaymentsService();
    }
    return EducationPaymentsService.instance;
  }

  /**
   * Process course payment
   */
  async processPayment(payment: Omit<CoursePayment, 'id' | 'status' | 'createdAt'>): Promise<CoursePayment> {
    const newPayment: CoursePayment = {
      ...payment,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date(),
    };

    // Process payment based on method
    if (payment.paymentMethod === 'scholarship') {
      // Check scholarship eligibility
      const scholarship = await this.findApplicableScholarship(payment.studentId, payment.courseId);
      if (scholarship) {
        newPayment.amount = scholarship.coverage === 'full' ? 0 : payment.amount * (1 - (scholarship.percentage || 0) / 100);
        newPayment.status = 'completed';
        newPayment.completedAt = new Date();
      } else {
        throw new Error('No applicable scholarship found');
      }
    } else {
      // TODO: Integrate with payment gateway
      // For now, simulate payment
      newPayment.status = 'completed';
      newPayment.completedAt = new Date();
      newPayment.transactionId = `TXN-${Date.now()}`;
    }

    this.payments.set(newPayment.id, newPayment);
    this.emit('payment:processed', newPayment);

    return newPayment;
  }

  /**
   * Create scholarship
   */
  async createScholarship(scholarship: Omit<Scholarship, 'id' | 'currentRecipients' | 'createdAt'>): Promise<Scholarship> {
    const newScholarship: Scholarship = {
      ...scholarship,
      id: crypto.randomUUID(),
      currentRecipients: 0,
      createdAt: new Date(),
    };

    this.scholarships.set(newScholarship.id, newScholarship);
    this.emit('scholarship:created', newScholarship);
    return newScholarship;
  }

  /**
   * Apply for scholarship
   */
  async applyForScholarship(application: Omit<ScholarshipApplication, 'id' | 'status' | 'createdAt'>): Promise<ScholarshipApplication> {
    const scholarship = this.scholarships.get(application.scholarshipId);
    if (!scholarship) {
      throw new Error('Scholarship not found');
    }

    if (scholarship.status !== 'active') {
      throw new Error('Scholarship is not active');
    }

    if (scholarship.applicationDeadline && new Date() > scholarship.applicationDeadline) {
      throw new Error('Application deadline has passed');
    }

    if (scholarship.maxRecipients && scholarship.currentRecipients >= scholarship.maxRecipients) {
      throw new Error('Scholarship is full');
    }

    const newApplication: ScholarshipApplication = {
      ...application,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date(),
    };

    this.applications.set(newApplication.id, newApplication);
    this.emit('scholarship:applied', newApplication);

    return newApplication;
  }

  /**
   * Review scholarship application
   */
  async reviewScholarshipApplication(applicationId: string, decision: 'approved' | 'rejected', reviewedBy: string): Promise<ScholarshipApplication> {
    const application = this.applications.get(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const scholarship = this.scholarships.get(application.scholarshipId);
    if (!scholarship) {
      throw new Error('Scholarship not found');
    }

    application.status = decision;
    application.reviewedBy = reviewedBy;
    application.reviewedAt = new Date();

    if (decision === 'approved') {
      scholarship.currentRecipients += 1;
      this.scholarships.set(scholarship.id, scholarship);
    }

    this.applications.set(applicationId, application);
    this.emit('scholarship:reviewed', application);

    return application;
  }

  /**
   * Award reward (integrate with mint service)
   */
  async awardReward(reward: Omit<RewardTransaction, 'id' | 'status' | 'createdAt'>): Promise<RewardTransaction> {
    const newReward: RewardTransaction = {
      ...reward,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date(),
    };

    // TODO: Integrate with azora-mint service
    // const mintResult = await mintService.rewardStudent(reward.studentId, reward.amount, reward.description);
    // newReward.mintTransactionId = mintResult.transactionId;
    // newReward.status = 'completed';
    // newReward.completedAt = new Date();

    // For now, simulate
    newReward.status = 'completed';
    newReward.completedAt = new Date();
    newReward.mintTransactionId = `MINT-${Date.now()}`;

    this.rewards.set(newReward.id, newReward);
    this.emit('reward:awarded', newReward);

    return newReward;
  }

  /**
   * Find applicable scholarship
   */
  private async findApplicableScholarship(studentId: string, courseId: string): Promise<Scholarship | undefined> {
    const applications = Array.from(this.applications.values())
      .filter(a => a.studentId === studentId && a.status === 'approved');

    if (applications.length === 0) return undefined;

    const scholarshipId = applications[0].scholarshipId;
    return this.scholarships.get(scholarshipId);
  }

  /**
   * Get payment by ID
   */
  getPayment(paymentId: string): CoursePayment | undefined {
    return this.payments.get(paymentId);
  }

  /**
   * Get student payments
   */
  getStudentPayments(studentId: string): CoursePayment[] {
    return Array.from(this.payments.values())
      .filter(p => p.studentId === studentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get all scholarships
   */
  getAllScholarships(status?: Scholarship['status']): Scholarship[] {
    const scholarships = Array.from(this.scholarships.values());
    return status ? scholarships.filter(s => s.status === status) : scholarships;
  }

  /**
   * Get student rewards
   */
  getStudentRewards(studentId: string): RewardTransaction[] {
    return Array.from(this.rewards.values())
      .filter(r => r.studentId === studentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const educationPaymentsService = EducationPaymentsService.getInstance();
