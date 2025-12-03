/**
 * Notification Service
 * 
 * Manages email notifications and notification tracking
 */

import { ElaraLogger } from '../utils/logger';

export interface EmailNotification {
  id: string;
  userId: string;
  email: string;
  subject: string;
  body: string;
  type: 'welcome' | 'progress' | 'status' | 'action_required' | 'completion';
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  sentAt?: Date;
  deliveredAt?: Date;
  failureReason?: string;
  createdAt: Date;
}

export interface NotificationTemplate {
  type: string;
  subject: string;
  body: string;
}

export class NotificationService {
  private logger: ElaraLogger;
  private notifications: Map<string, EmailNotification> = new Map();

  private readonly templates: Record<string, NotificationTemplate> = {
    welcome: {
      type: 'welcome',
      subject: 'Welcome to Azora - Your Onboarding Journey Begins',
      body: 'Welcome to Azora! We\'re excited to have you on board. Your personalized onboarding experience is ready to begin.',
    },
    progress: {
      type: 'progress',
      subject: 'Great Progress! You\'re Making Headway',
      body: 'You\'ve completed another step in your onboarding. Keep going - you\'re almost there!',
    },
    status: {
      type: 'status',
      subject: 'Your Onboarding Status Update',
      body: 'Here\'s an update on your onboarding progress and next steps.',
    },
    action_required: {
      type: 'action_required',
      subject: 'Action Required - Complete Your Onboarding',
      body: 'We need some information from you to complete your onboarding. Please take action now.',
    },
    completion: {
      type: 'completion',
      subject: 'Congratulations! Your Onboarding is Complete',
      body: 'Welcome to the Azora community! Your account is now fully activated and ready to use.',
    },
    kyc_pending: {
      type: 'kyc_pending',
      subject: 'KYC Verification in Progress',
      body: 'Your identity verification is being processed. We\'ll notify you once it\'s complete.',
    },
    kyc_approved: {
      type: 'kyc_approved',
      subject: 'KYC Verification Approved',
      body: 'Your identity has been verified successfully. You can now proceed with your onboarding.',
    },
    contract_ready: {
      type: 'contract_ready',
      subject: 'Contract Ready for Signature',
      body: 'Your contract is ready for e-signature. Please review and sign to continue.',
    },
    contract_signed: {
      type: 'contract_signed',
      subject: 'Contract Successfully Signed',
      body: 'Thank you for signing the contract. Your account is being finalized.',
    },
  };

  constructor() {
    this.logger = new ElaraLogger('NotificationService');
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(userId: string, email: string, name: string): Promise<EmailNotification> {
    try {
      this.logger.info(`Sending welcome email to: ${email}`);

      const notification = await this.sendEmail(
        userId,
        email,
        'welcome',
        `Welcome ${name}!`
      );

      return notification;
    } catch (error) {
      this.logger.error('Error sending welcome email:', error);
      throw error;
    }
  }

  /**
   * Send progress email
   */
  async sendProgressEmail(userId: string, email: string, stepName: string): Promise<EmailNotification> {
    try {
      this.logger.info(`Sending progress email to: ${email}`);

      const notification = await this.sendEmail(
        userId,
        email,
        'progress',
        `Progress: ${stepName} completed`
      );

      return notification;
    } catch (error) {
      this.logger.error('Error sending progress email:', error);
      throw error;
    }
  }

  /**
   * Send status email
   */
  async sendStatusEmail(userId: string, email: string, status: string): Promise<EmailNotification> {
    try {
      this.logger.info(`Sending status email to: ${email}`);

      const notification = await this.sendEmail(
        userId,
        email,
        'status',
        `Status Update: ${status}`
      );

      return notification;
    } catch (error) {
      this.logger.error('Error sending status email:', error);
      throw error;
    }
  }

  /**
   * Send action required email
   */
  async sendActionRequiredEmail(userId: string, email: string, action: string): Promise<EmailNotification> {
    try {
      this.logger.info(`Sending action required email to: ${email}`);

      const notification = await this.sendEmail(
        userId,
        email,
        'action_required',
        `Action Required: ${action}`
      );

      return notification;
    } catch (error) {
      this.logger.error('Error sending action required email:', error);
      throw error;
    }
  }

  /**
   * Send completion email
   */
  async sendCompletionEmail(userId: string, email: string, name: string): Promise<EmailNotification> {
    try {
      this.logger.info(`Sending completion email to: ${email}`);

      const notification = await this.sendEmail(
        userId,
        email,
        'completion',
        `Congratulations ${name}!`
      );

      return notification;
    } catch (error) {
      this.logger.error('Error sending completion email:', error);
      throw error;
    }
  }

  /**
   * Send KYC approved email
   */
  async sendKYCApprovedEmail(userId: string, email: string): Promise<EmailNotification> {
    try {
      this.logger.info(`Sending KYC approved email to: ${email}`);

      const notification = await this.sendEmail(
        userId,
        email,
        'kyc_approved',
        'KYC Verification Approved'
      );

      return notification;
    } catch (error) {
      this.logger.error('Error sending KYC approved email:', error);
      throw error;
    }
  }

  /**
   * Send contract ready email
   */
  async sendContractReadyEmail(userId: string, email: string): Promise<EmailNotification> {
    try {
      this.logger.info(`Sending contract ready email to: ${email}`);

      const notification = await this.sendEmail(
        userId,
        email,
        'contract_ready',
        'Contract Ready for Signature'
      );

      return notification;
    } catch (error) {
      this.logger.error('Error sending contract ready email:', error);
      throw error;
    }
  }

  /**
   * Send contract signed email
   */
  async sendContractSignedEmail(userId: string, email: string): Promise<EmailNotification> {
    try {
      this.logger.info(`Sending contract signed email to: ${email}`);

      const notification = await this.sendEmail(
        userId,
        email,
        'contract_signed',
        'Contract Successfully Signed'
      );

      return notification;
    } catch (error) {
      this.logger.error('Error sending contract signed email:', error);
      throw error;
    }
  }

  /**
   * Get notification by ID
   */
  async getNotification(notificationId: string): Promise<EmailNotification | null> {
    try {
      this.logger.info(`Getting notification: ${notificationId}`);
      return this.notifications.get(notificationId) || null;
    } catch (error) {
      this.logger.error('Error getting notification:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string): Promise<EmailNotification[]> {
    try {
      this.logger.info(`Getting notifications for user: ${userId}`);
      return Array.from(this.notifications.values()).filter(n => n.userId === userId);
    } catch (error) {
      this.logger.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as delivered
   */
  async markAsDelivered(notificationId: string): Promise<EmailNotification> {
    try {
      this.logger.info(`Marking notification as delivered: ${notificationId}`);

      const notification = this.notifications.get(notificationId);
      if (!notification) {
        throw new Error(`Notification not found: ${notificationId}`);
      }

      notification.status = 'sent';
      notification.deliveredAt = new Date();

      this.notifications.set(notificationId, notification);
      return notification;
    } catch (error) {
      this.logger.error('Error marking notification as delivered:', error);
      throw error;
    }
  }

  /**
   * Mark notification as failed
   */
  async markAsFailed(notificationId: string, reason: string): Promise<EmailNotification> {
    try {
      this.logger.info(`Marking notification as failed: ${notificationId}`);

      const notification = this.notifications.get(notificationId);
      if (!notification) {
        throw new Error(`Notification not found: ${notificationId}`);
      }

      notification.status = 'failed';
      notification.failureReason = reason;

      this.notifications.set(notificationId, notification);
      return notification;
    } catch (error) {
      this.logger.error('Error marking notification as failed:', error);
      throw error;
    }
  }

  // Private helper methods

  private async sendEmail(
    userId: string,
    email: string,
    type: string,
    customSubject?: string
  ): Promise<EmailNotification> {
    const notificationId = `notif_${userId}_${Date.now()}`;
    const template = this.templates[type] || this.templates.status;

    const notification: EmailNotification = {
      id: notificationId,
      userId,
      email,
      subject: customSubject || template.subject,
      body: template.body,
      type: type as any,
      status: 'pending',
      createdAt: new Date(),
    };

    // Simulate sending email
    // In production, would call SendGrid or similar service
    const sendSuccess = await this.simulateSendEmail(email);

    if (sendSuccess) {
      notification.status = 'sent';
      notification.sentAt = new Date();
      this.logger.info(`Email sent successfully to: ${email}`);
    } else {
      notification.status = 'failed';
      notification.failureReason = 'Email service unavailable';
      this.logger.warn(`Email failed to send to: ${email}`);
    }

    this.notifications.set(notificationId, notification);
    return notification;
  }

  private async simulateSendEmail(_email: string): Promise<boolean> {
    // Simulate email sending with 95% success rate
    return Math.random() > 0.05;
  }
}
