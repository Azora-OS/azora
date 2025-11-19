/**
 * Onboarding Service
 * 
 * Manages onboarding sessions, step progression, and profile data collection
 */

import { ElaraLogger } from '../utils/logger';
import { UserType } from './user-type-detection.service';

export interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  required: boolean;
  order: number;
  userTypes: UserType[];
}

export interface OnboardingSession {
  id: string;
  userId: string;
  userType: UserType;
  status: 'started' | 'in_progress' | 'completed' | 'abandoned';
  currentStep: string;
  completedSteps: string[];
  profileData: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  abandonedAt?: Date;
}

export interface StepProgressionResult {
  sessionId: string;
  currentStep: string;
  nextStep?: string;
  progress: number;
  isComplete: boolean;
}

export interface ProfileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class OnboardingService {
  private logger: ElaraLogger;
  private sessions: Map<string, OnboardingSession> = new Map();

  // Define onboarding steps for each user type
  private readonly stepsByUserType: Record<UserType, OnboardingStep[]> = {
    founder: [
      { id: 'welcome', name: 'Welcome', description: 'Welcome to Azora', required: true, order: 1, userTypes: ['founder'] },
      { id: 'profile', name: 'Profile Information', description: 'Tell us about yourself', required: true, order: 2, userTypes: ['founder'] },
      { id: 'kyc', name: 'KYC Verification', description: 'Identity verification', required: true, order: 3, userTypes: ['founder'] },
      { id: 'aml', name: 'AML Screening', description: 'Compliance screening', required: true, order: 4, userTypes: ['founder'] },
      { id: 'contract', name: 'Contract Signing', description: 'Sign terms and conditions', required: true, order: 5, userTypes: ['founder'] },
      { id: 'payment', name: 'Payment Setup', description: 'Set up payment method', required: true, order: 6, userTypes: ['founder'] },
      { id: 'activation', name: 'Account Activation', description: 'Activate your account', required: true, order: 7, userTypes: ['founder'] },
    ],
    student: [
      { id: 'welcome', name: 'Welcome', description: 'Welcome to Azora', required: true, order: 1, userTypes: ['student'] },
      { id: 'profile', name: 'Profile Information', description: 'Tell us about yourself', required: true, order: 2, userTypes: ['student'] },
      { id: 'verification', name: 'Student Verification', description: 'Verify your student status', required: true, order: 3, userTypes: ['student'] },
      { id: 'terms', name: 'Terms Acceptance', description: 'Accept student terms', required: true, order: 4, userTypes: ['student'] },
      { id: 'tier_selection', name: 'Tier Selection', description: 'Choose your tier (Free/Premium/Pro)', required: true, order: 5, userTypes: ['student'] },
      { id: 'activation', name: 'Account Activation', description: 'Activate your account', required: true, order: 6, userTypes: ['student'] },
    ],
    teacher: [
      { id: 'welcome', name: 'Welcome', description: 'Welcome to Azora', required: true, order: 1, userTypes: ['teacher'] },
      { id: 'profile', name: 'Profile Information', description: 'Tell us about yourself', required: true, order: 2, userTypes: ['teacher'] },
      { id: 'credentials', name: 'Credentials Verification', description: 'Verify your credentials', required: true, order: 3, userTypes: ['teacher'] },
      { id: 'terms', name: 'Terms Acceptance', description: 'Accept educator terms', required: true, order: 4, userTypes: ['teacher'] },
      { id: 'activation', name: 'Account Activation', description: 'Activate your account', required: true, order: 5, userTypes: ['teacher'] },
    ],
    researcher: [
      { id: 'welcome', name: 'Welcome', description: 'Welcome to Azora', required: true, order: 1, userTypes: ['researcher'] },
      { id: 'profile', name: 'Profile Information', description: 'Tell us about yourself', required: true, order: 2, userTypes: ['researcher'] },
      { id: 'affiliation', name: 'Affiliation Verification', description: 'Verify your institution', required: true, order: 3, userTypes: ['researcher'] },
      { id: 'terms', name: 'Terms Acceptance', description: 'Accept researcher terms', required: true, order: 4, userTypes: ['researcher'] },
      { id: 'activation', name: 'Account Activation', description: 'Activate your account', required: true, order: 5, userTypes: ['researcher'] },
    ],
    professional: [
      { id: 'welcome', name: 'Welcome', description: 'Welcome to Azora', required: true, order: 1, userTypes: ['professional'] },
      { id: 'profile', name: 'Profile Information', description: 'Tell us about yourself', required: true, order: 2, userTypes: ['professional'] },
      { id: 'verification', name: 'Professional Verification', description: 'Verify your professional status', required: true, order: 3, userTypes: ['professional'] },
      { id: 'terms', name: 'Terms Acceptance', description: 'Accept professional terms', required: true, order: 4, userTypes: ['professional'] },
      { id: 'activation', name: 'Account Activation', description: 'Activate your account', required: true, order: 5, userTypes: ['professional'] },
    ],
    enterprise: [
      { id: 'welcome', name: 'Welcome', description: 'Welcome to Azora', required: true, order: 1, userTypes: ['enterprise'] },
      { id: 'organization', name: 'Organization Information', description: 'Tell us about your organization', required: true, order: 2, userTypes: ['enterprise'] },
      { id: 'verification', name: 'Business Verification', description: 'Verify your business', required: true, order: 3, userTypes: ['enterprise'] },
      { id: 'terms', name: 'Terms Acceptance', description: 'Accept enterprise terms', required: true, order: 4, userTypes: ['enterprise'] },
      { id: 'activation', name: 'Account Activation', description: 'Activate your account', required: true, order: 5, userTypes: ['enterprise'] },
    ],
    'non-profit': [
      { id: 'welcome', name: 'Welcome', description: 'Welcome to Azora', required: true, order: 1, userTypes: ['non-profit'] },
      { id: 'organization', name: 'Organization Information', description: 'Tell us about your organization', required: true, order: 2, userTypes: ['non-profit'] },
      { id: 'verification', name: 'Non-Profit Verification', description: 'Verify your non-profit status', required: true, order: 3, userTypes: ['non-profit'] },
      { id: 'terms', name: 'Terms Acceptance', description: 'Accept non-profit terms', required: true, order: 4, userTypes: ['non-profit'] },
      { id: 'activation', name: 'Account Activation', description: 'Activate your account', required: true, order: 5, userTypes: ['non-profit'] },
    ],
    government: [
      { id: 'welcome', name: 'Welcome', description: 'Welcome to Azora', required: true, order: 1, userTypes: ['government'] },
      { id: 'organization', name: 'Organization Information', description: 'Tell us about your organization', required: true, order: 2, userTypes: ['government'] },
      { id: 'verification', name: 'Government Verification', description: 'Verify your government status', required: true, order: 3, userTypes: ['government'] },
      { id: 'terms', name: 'Terms Acceptance', description: 'Accept government terms', required: true, order: 4, userTypes: ['government'] },
      { id: 'activation', name: 'Account Activation', description: 'Activate your account', required: true, order: 5, userTypes: ['government'] },
    ],
  };

  constructor() {
    this.logger = new ElaraLogger('OnboardingService');
  }

  /**
   * Create a new onboarding session
   */
  async createSession(userId: string, userType: UserType): Promise<OnboardingSession> {
    try {
      this.logger.info(`Creating onboarding session for user: ${userId}, type: ${userType}`);

      const sessionId = `session_${userId}_${Date.now()}`;
      const steps = this.stepsByUserType[userType];

      if (!steps || steps.length === 0) {
        throw new Error(`No onboarding steps defined for user type: ${userType}`);
      }

      const session: OnboardingSession = {
        id: sessionId,
        userId,
        userType,
        status: 'started',
        currentStep: steps[0].id,
        completedSteps: [],
        profileData: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.sessions.set(sessionId, session);
      this.logger.info(`Session created: ${sessionId}`);

      return session;
    } catch (error) {
      this.logger.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<OnboardingSession | null> {
    try {
      this.logger.info(`Getting session: ${sessionId}`);
      return this.sessions.get(sessionId) || null;
    } catch (error) {
      this.logger.error('Error getting session:', error);
      throw error;
    }
  }

  /**
   * Update session profile data
   */
  async updateProfileData(sessionId: string, data: Record<string, any>): Promise<OnboardingSession> {
    try {
      this.logger.info(`Updating profile data for session: ${sessionId}`);

      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      session.profileData = { ...session.profileData, ...data };
      session.updatedAt = new Date();
      session.status = 'in_progress';

      this.sessions.set(sessionId, session);
      this.logger.info(`Profile data updated for session: ${sessionId}`);

      return session;
    } catch (error) {
      this.logger.error('Error updating profile data:', error);
      throw error;
    }
  }

  /**
   * Progress to next step
   */
  async progressToNextStep(sessionId: string): Promise<StepProgressionResult> {
    try {
      this.logger.info(`Progressing to next step for session: ${sessionId}`);

      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      const steps = this.stepsByUserType[session.userType];
      const currentStepIndex = steps.findIndex(s => s.id === session.currentStep);

      if (currentStepIndex === -1) {
        throw new Error(`Current step not found: ${session.currentStep}`);
      }

      // Mark current step as completed
      if (!session.completedSteps.includes(session.currentStep)) {
        session.completedSteps.push(session.currentStep);
      }

      // Move to next step
      const nextStepIndex = currentStepIndex + 1;
      const isComplete = nextStepIndex >= steps.length;

      if (isComplete) {
        session.status = 'completed';
        session.completedAt = new Date();
        this.logger.info(`Onboarding completed for session: ${sessionId}`);
      } else {
        session.currentStep = steps[nextStepIndex].id;
        session.status = 'in_progress';
      }

      session.updatedAt = new Date();
      this.sessions.set(sessionId, session);

      const progress = (session.completedSteps.length / steps.length) * 100;

      return {
        sessionId,
        currentStep: session.currentStep,
        nextStep: isComplete ? undefined : steps[nextStepIndex]?.id,
        progress,
        isComplete,
      };
    } catch (error) {
      this.logger.error('Error progressing to next step:', error);
      throw error;
    }
  }

  /**
   * Get current step details
   */
  async getCurrentStep(sessionId: string): Promise<OnboardingStep | null> {
    try {
      this.logger.info(`Getting current step for session: ${sessionId}`);

      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      const steps = this.stepsByUserType[session.userType];
      const currentStep = steps.find(s => s.id === session.currentStep);

      return currentStep || null;
    } catch (error) {
      this.logger.error('Error getting current step:', error);
      throw error;
    }
  }

  /**
   * Get all steps for user type
   */
  async getSteps(userType: UserType): Promise<OnboardingStep[]> {
    try {
      this.logger.info(`Getting steps for user type: ${userType}`);

      const steps = this.stepsByUserType[userType];
      if (!steps) {
        throw new Error(`No steps defined for user type: ${userType}`);
      }

      return steps;
    } catch (error) {
      this.logger.error('Error getting steps:', error);
      throw error;
    }
  }

  /**
   * Get session progress
   */
  async getProgress(sessionId: string): Promise<{ completed: number; total: number; percentage: number }> {
    try {
      this.logger.info(`Getting progress for session: ${sessionId}`);

      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      const steps = this.stepsByUserType[session.userType];
      const completed = session.completedSteps.length;
      const total = steps.length;
      const percentage = (completed / total) * 100;

      return { completed, total, percentage };
    } catch (error) {
      this.logger.error('Error getting progress:', error);
      throw error;
    }
  }

  /**
   * Validate profile data
   */
  async validateProfileData(userType: UserType, data: Record<string, any>): Promise<ProfileValidationResult> {
    try {
      this.logger.info(`Validating profile data for user type: ${userType}`);

      const errors: string[] = [];
      const warnings: string[] = [];

      // Required fields for all user types
      if (!data.firstName || data.firstName.trim() === '') {
        errors.push('First name is required');
      }
      if (!data.lastName || data.lastName.trim() === '') {
        errors.push('Last name is required');
      }
      if (!data.email || data.email.trim() === '') {
        errors.push('Email is required');
      } else if (!this.isValidEmail(data.email)) {
        errors.push('Email format is invalid');
      }

      // User type specific validation
      switch (userType) {
        case 'founder':
          if (!data.expertise || data.expertise.length === 0) {
            warnings.push('Expertise is recommended');
          }
          break;
        case 'student':
          if (!data.learningGoals || data.learningGoals.length === 0) {
            warnings.push('Learning goals are recommended');
          }
          break;
        case 'teacher':
          if (!data.institution || data.institution.trim() === '') {
            warnings.push('Institution is recommended');
          }
          break;
        case 'researcher':
          if (!data.institution || data.institution.trim() === '') {
            warnings.push('Institution is recommended');
          }
          break;
        case 'professional':
          if (!data.companyName || data.companyName.trim() === '') {
            warnings.push('Company name is recommended');
          }
          break;
        case 'enterprise':
          if (!data.companyName || data.companyName.trim() === '') {
            errors.push('Company name is required');
          }
          if (!data.companySize || data.companySize <= 0) {
            errors.push('Company size is required');
          }
          break;
        case 'non-profit':
          if (!data.companyName || data.companyName.trim() === '') {
            errors.push('Organization name is required');
          }
          break;
        case 'government':
          if (!data.agencyType || data.agencyType.trim() === '') {
            errors.push('Agency type is required');
          }
          break;
      }

      const valid = errors.length === 0;
      this.logger.info(`Profile validation result: ${valid ? 'valid' : 'invalid'}`);

      return { valid, errors, warnings };
    } catch (error) {
      this.logger.error('Error validating profile data:', error);
      throw error;
    }
  }

  /**
   * Complete session
   */
  async completeSession(sessionId: string): Promise<OnboardingSession> {
    try {
      this.logger.info(`Completing session: ${sessionId}`);

      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      session.status = 'completed';
      session.completedAt = new Date();
      session.updatedAt = new Date();

      this.sessions.set(sessionId, session);
      this.logger.info(`Session completed: ${sessionId}`);

      return session;
    } catch (error) {
      this.logger.error('Error completing session:', error);
      throw error;
    }
  }

  /**
   * Abandon session
   */
  async abandonSession(sessionId: string): Promise<OnboardingSession> {
    try {
      this.logger.info(`Abandoning session: ${sessionId}`);

      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      session.status = 'abandoned';
      session.abandonedAt = new Date();
      session.updatedAt = new Date();

      this.sessions.set(sessionId, session);
      this.logger.info(`Session abandoned: ${sessionId}`);

      return session;
    } catch (error) {
      this.logger.error('Error abandoning session:', error);
      throw error;
    }
  }

  // Private helper methods

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
