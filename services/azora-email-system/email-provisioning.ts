/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * MULTI-DOMAIN STUDENT EMAIL PROVISIONING SYSTEM
 * 
 * Automatically provisions professional email addresses for students:
 * - stno.edu@azora.world (K-12 Education)
 * - stno.ac@azora.world (University/Academic)
 * - stno.sk@azora.world (Skills & Professional Development)
 * 
 * Features:
 * - Automatic provisioning on enrollment
 * - Domain routing based on institution type
 * - Microsoft 365 / Google Workspace integration
 * - Email forwarding
 * - Alumni support (lifetime email)
 * - Professional signatures
 */

import { EventEmitter } from 'events';
import { InstitutionType } from '../azora-institutional-system/institutional-auth';
import crypto from 'crypto';

export enum EmailDomain {
  EDUCATION = 'edu.azora.world',    // K-12
  ACADEMIC = 'ac.azora.world',      // University
  SKILLS = 'sk.azora.world',        // Professional/Skills
}

export interface EmailAccount {
  id: string;
  studentNumber: string;
  email: string;
  domain: EmailDomain;
  firstName: string;
  lastName: string;
  displayName: string;
  institutionType: InstitutionType;
  status: 'active' | 'suspended' | 'alumni' | 'inactive';
  createdAt: Date;
  provisionedAt?: Date;
  expiresAt?: Date; // null for alumni (lifetime)
  forwardTo?: string; // Personal email forwarding
  storageQuota: number; // GB
  storageUsed: number; // GB
  aliases: string[]; // Additional email aliases
  signature: string; // Professional email signature
  metadata: {
    provider: 'microsoft365' | 'google' | 'zoho';
    accountId?: string;
    mailboxId?: string;
    lastLogin?: Date;
    loginCount: number;
  };
}

export interface EmailProvisioningRequest {
  studentNumber: string;
  firstName: string;
  lastName: string;
  institutionType: InstitutionType;
  program?: string;
  personalEmail?: string; // For forwarding
}

export interface EmailProvisioningResult {
  success: boolean;
  account?: EmailAccount;
  credentials?: {
    email: string;
    temporaryPassword: string;
    resetUrl: string;
  };
  error?: string;
}

export class EmailProvisioningService extends EventEmitter {
  private accounts: Map<string, EmailAccount> = new Map();
  
  // Configuration
  private readonly DEFAULT_STORAGE_GB = 50;
  private readonly ALUMNI_STORAGE_GB = 10;
  private readonly DEFAULT_PROVIDER = 'microsoft365';

  constructor() {
    super();
  }

  /**
   * Provision email account for new student
   */
  async provisionEmail(request: EmailProvisioningRequest): Promise<EmailProvisioningResult> {
    try {
      // Validate student number
      if (!request.studentNumber) {
        throw new Error('Student number is required');
      }

      // Check if email already exists
      if (this.accounts.has(request.studentNumber)) {
        return {
          success: false,
          error: 'Email account already exists for this student'
        };
      }

      // Determine domain based on institution type
      const domain = this.getDomainForInstitution(request.institutionType);

      // Generate email address
      const email = this.generateEmailAddress(request, domain);

      // Generate professional signature
      const signature = this.generateEmailSignature(request, email);

      // Create account record
      const account: EmailAccount = {
        id: crypto.randomUUID(),
        studentNumber: request.studentNumber,
        email,
        domain,
        firstName: request.firstName,
        lastName: request.lastName,
        displayName: `${request.firstName} ${request.lastName}`,
        institutionType: request.institutionType,
        status: 'active',
        createdAt: new Date(),
        storageQuota: this.DEFAULT_STORAGE_GB,
        storageUsed: 0,
        aliases: this.generateAliases(request.studentNumber, domain),
        signature,
        forwardTo: request.personalEmail,
        metadata: {
          provider: this.DEFAULT_PROVIDER as any,
          loginCount: 0
        }
      };

      // Provision account on email provider
      const provisionResult = await this.provisionOnProvider(account);
      
      if (!provisionResult.success) {
        throw new Error(provisionResult.error || 'Failed to provision on email provider');
      }

      account.provisionedAt = new Date();
      account.metadata.accountId = provisionResult.accountId;

      // Store account
      this.accounts.set(request.studentNumber, account);

      // Generate temporary password
      const temporaryPassword = this.generateTemporaryPassword();

      // Emit event
      this.emit('email-provisioned', account);

      // Send welcome email
      await this.sendWelcomeEmail(account, temporaryPassword);

      return {
        success: true,
        account,
        credentials: {
          email: account.email,
          temporaryPassword,
          resetUrl: `https://account.azora.world/reset-password?email=${encodeURIComponent(account.email)}`
        }
      };
    } catch (error: any) {
      console.error('Email provisioning failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Determine email domain based on institution type
   */
  private getDomainForInstitution(institutionType: InstitutionType): EmailDomain {
    switch (institutionType) {
      case InstitutionType.K12:
      case InstitutionType.PRIMARY:
      case InstitutionType.SECONDARY:
        return EmailDomain.EDUCATION;
      
      case InstitutionType.UNIVERSITY:
      case InstitutionType.COLLEGE:
        return EmailDomain.ACADEMIC;
      
      default:
        return EmailDomain.SKILLS;
    }
  }

  /**
   * Generate email address from student info
   */
  private generateEmailAddress(request: EmailProvisioningRequest, domain: EmailDomain): string {
    // Format: studentnumber@domain
    // Example: ASU2025001@ac.azora.world
    return `${request.studentNumber.toLowerCase()}@${domain}`;
  }

  /**
   * Generate email aliases
   */
  private generateAliases(studentNumber: string, domain: EmailDomain): string[] {
    // Add aliases for convenience
    return [
      `${studentNumber.toLowerCase()}@azora.world`, // Generic alias
    ];
  }

  /**
   * Generate professional email signature
   */
  private generateEmailSignature(request: EmailProvisioningRequest, email: string): string {
    const institutionName = this.getInstitutionName(request.institutionType);
    
    return `
--
${request.firstName} ${request.lastName}
${request.program || 'Student'}
${institutionName}

Email: ${email}
Portal: https://student.azora.world

"Building a sovereign future through education"
    `.trim();
  }

  /**
   * Get institution name
   */
  private getInstitutionName(institutionType: InstitutionType): string {
    switch (institutionType) {
      case InstitutionType.UNIVERSITY:
      case InstitutionType.COLLEGE:
        return 'Azora Sapiens University';
      
      case InstitutionType.K12:
      case InstitutionType.PRIMARY:
      case InstitutionType.SECONDARY:
        return 'Azora Education';
      
      default:
        return 'Azora Academy';
    }
  }

  /**
   * Provision account on email provider (Microsoft 365, Google Workspace, etc.)
   */
  private async provisionOnProvider(account: EmailAccount): Promise<{
    success: boolean;
    accountId?: string;
    error?: string;
  }> {
    // TODO: Integrate with actual email provider API
    
    // Microsoft 365 Graph API example:
    // POST https://graph.microsoft.com/v1.0/users
    // {
    //   "accountEnabled": true,
    //   "displayName": account.displayName,
    //   "mailNickname": account.studentNumber,
    //   "userPrincipalName": account.email,
    //   "passwordProfile": {
    //     "forceChangePasswordNextSignIn": true,
    //     "password": temporaryPassword
    //   }
    // }

    // Google Workspace Admin SDK example:
    // POST https://admin.googleapis.com/admin/directory/v1/users
    // {
    //   "primaryEmail": account.email,
    //   "name": {
    //     "givenName": account.firstName,
    //     "familyName": account.lastName
    //   },
    //   "password": temporaryPassword
    // }

    // For now, simulate success
    console.log(`[EMAIL] Provisioning account on ${account.metadata.provider}: ${account.email}`);
    
    return {
      success: true,
      accountId: `provider-${crypto.randomUUID()}`
    };
  }

  /**
   * Generate secure temporary password
   */
  private generateTemporaryPassword(): string {
    // Generate secure random password (16 chars)
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < 16; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }

  /**
   * Send welcome email with credentials
   */
  private async sendWelcomeEmail(account: EmailAccount, temporaryPassword: string): Promise<void> {
    // TODO: Send actual email using email service
    
    const welcomeMessage = `
Welcome to ${this.getInstitutionName(account.institutionType)}!

Your professional email account has been created:

Email: ${account.email}
Temporary Password: ${temporaryPassword}

IMPORTANT: You must change your password on first login.

Getting Started:
1. Visit https://account.azora.world
2. Login with your email and temporary password
3. Set a new secure password
4. Configure email forwarding (optional)
5. Set up your email client (Outlook, Gmail, etc.)

Email Client Settings:
- IMAP: imap.azora.world (Port 993, SSL)
- SMTP: smtp.azora.world (Port 587, STARTTLS)
- Username: ${account.email}
- Password: Your chosen password

Storage: ${account.storageQuota}GB
Aliases: ${account.aliases.join(', ')}

Support: support@azora.world
Portal: https://student.azora.world

Welcome to the Azora family!

--
Azora Education Team
    `.trim();

    console.log('[EMAIL] Welcome email sent to:', account.forwardTo || account.email);
    console.log(welcomeMessage);

    this.emit('welcome-email-sent', {
      account: account.email,
      recipient: account.forwardTo || account.email
    });
  }

  /**
   * Suspend email account (temporary)
   */
  async suspendAccount(studentNumber: string, reason: string): Promise<boolean> {
    const account = this.accounts.get(studentNumber);
    
    if (!account) {
      throw new Error('Account not found');
    }

    account.status = 'suspended';
    
    // TODO: Suspend on provider
    // await this.suspendOnProvider(account);

    this.emit('account-suspended', { account, reason });
    
    return true;
  }

  /**
   * Convert to alumni status (lifetime email)
   */
  async convertToAlumni(studentNumber: string): Promise<boolean> {
    const account = this.accounts.get(studentNumber);
    
    if (!account) {
      throw new Error('Account not found');
    }

    account.status = 'alumni';
    account.expiresAt = undefined; // Lifetime access
    account.storageQuota = this.ALUMNI_STORAGE_GB; // Reduced storage
    
    // TODO: Update on provider
    // await this.updateOnProvider(account);

    this.emit('alumni-converted', account);
    
    return true;
  }

  /**
   * Setup email forwarding to personal email
   */
  async setupForwarding(studentNumber: string, forwardTo: string): Promise<boolean> {
    const account = this.accounts.get(studentNumber);
    
    if (!account) {
      throw new Error('Account not found');
    }

    // Validate email
    if (!this.isValidEmail(forwardTo)) {
      throw new Error('Invalid forwarding email address');
    }

    account.forwardTo = forwardTo;
    
    // TODO: Configure forwarding on provider
    // await this.configureForwardingOnProvider(account, forwardTo);

    this.emit('forwarding-configured', { account: account.email, forwardTo });
    
    return true;
  }

  /**
   * Get account by student number
   */
  getAccount(studentNumber: string): EmailAccount | undefined {
    return this.accounts.get(studentNumber);
  }

  /**
   * Get account by email address
   */
  getAccountByEmail(email: string): EmailAccount | undefined {
    return Array.from(this.accounts.values()).find(acc => acc.email === email);
  }

  /**
   * Update email signature
   */
  async updateSignature(studentNumber: string, signature: string): Promise<boolean> {
    const account = this.accounts.get(studentNumber);
    
    if (!account) {
      throw new Error('Account not found');
    }

    account.signature = signature;
    
    // TODO: Update on provider
    
    return true;
  }

  /**
   * Get storage usage
   */
  async getStorageUsage(studentNumber: string): Promise<{
    used: number;
    quota: number;
    percentUsed: number;
  }> {
    const account = this.accounts.get(studentNumber);
    
    if (!account) {
      throw new Error('Account not found');
    }

    return {
      used: account.storageUsed,
      quota: account.storageQuota,
      percentUsed: (account.storageUsed / account.storageQuota) * 100
    };
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Bulk provision emails (for batch enrollment)
   */
  async bulkProvision(requests: EmailProvisioningRequest[]): Promise<{
    successful: EmailProvisioningResult[];
    failed: { request: EmailProvisioningRequest; error: string }[];
  }> {
    const successful: EmailProvisioningResult[] = [];
    const failed: { request: EmailProvisioningRequest; error: string }[] = [];

    for (const request of requests) {
      const result = await this.provisionEmail(request);
      
      if (result.success) {
        successful.push(result);
      } else {
        failed.push({
          request,
          error: result.error || 'Unknown error'
        });
      }
    }

    return { successful, failed };
  }

  /**
   * Get all accounts (admin)
   */
  getAllAccounts(): EmailAccount[] {
    return Array.from(this.accounts.values());
  }

  /**
   * Get accounts by status
   */
  getAccountsByStatus(status: EmailAccount['status']): EmailAccount[] {
    return Array.from(this.accounts.values()).filter(acc => acc.status === status);
  }

  /**
   * Get accounts by domain
   */
  getAccountsByDomain(domain: EmailDomain): EmailAccount[] {
    return Array.from(this.accounts.values()).filter(acc => acc.domain === domain);
  }
}

// Create singleton instance
export const emailProvisioningService = new EmailProvisioningService();

// Export for testing
export default emailProvisioningService;
