import { BaseMock } from './base.mock';

export interface MockEmail {
  id: string;
  to: string | string[];
  from: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
  }>;
  sentAt: Date;
}

/**
 * Mock Email service for testing
 */
export class MockEmailService extends BaseMock {
  private sentEmails: MockEmail[] = [];

  /**
   * Send an email
   */
  async sendEmail(params: {
    to: string | string[];
    from?: string;
    subject: string;
    text?: string;
    html?: string;
    attachments?: Array<{
      filename: string;
      content: Buffer | string;
    }>;
  }): Promise<MockEmail> {
    this.trackCall('sendEmail', [params]);

    const email: MockEmail = {
      id: `email_test_${this.generateId()}`,
      to: params.to,
      from: params.from || 'noreply@test.azora.com',
      subject: params.subject,
      text: params.text,
      html: params.html,
      attachments: params.attachments,
      sentAt: new Date(),
    };

    this.sentEmails.push(email);
    return email;
  }

  /**
   * Verify an email was sent
   */
  verifyEmailSent(to: string, subject: string): boolean {
    return this.sentEmails.some(email => {
      const recipients = Array.isArray(email.to) ? email.to : [email.to];
      return recipients.includes(to) && email.subject === subject;
    });
  }

  /**
   * Get all sent emails
   */
  getSentEmails(): MockEmail[] {
    return this.sentEmails;
  }

  /**
   * Get emails sent to a specific recipient
   */
  getEmailsTo(recipient: string): MockEmail[] {
    return this.sentEmails.filter(email => {
      const recipients = Array.isArray(email.to) ? email.to : [email.to];
      return recipients.includes(recipient);
    });
  }

  /**
   * Get emails with a specific subject
   */
  getEmailsBySubject(subject: string): MockEmail[] {
    return this.sentEmails.filter(email => email.subject === subject);
  }

  /**
   * Clear all sent emails
   */
  clearSentEmails(): void {
    this.sentEmails = [];
  }

  /**
   * Reset mock state
   */
  reset(): void {
    super.reset();
    this.sentEmails = [];
  }

  /**
   * Generate a random ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

// Export singleton instance
export const mockEmail = new MockEmailService();
