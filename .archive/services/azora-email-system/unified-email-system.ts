/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * UNIFIED MULTI-PLATFORM EMAIL SYSTEM
 * 
 * Comprehensive email infrastructure for entire Azora ecosystem:
 * 
 * STUDENTS:
 * - stno.edu@azora.world (K-12 Education)
 * - stno.ac@azora.world (University/Academic)
 * - stno.sk@azora.world (Skills & Professional)
 * 
 * STAFF BY PLATFORM:
 * - name.last@sapiens.azora.world (Sapiens University)
 * - name.last@education.azora.world (K-12 Education)
 * - name.last@lms.azora.world (LMS Platform)
 * - name.last@mint.azora.world (Mint Service)
 * - name.last@nexus.azora.world (Azora Nexus)
 * - name.last@forge.azora.world (Azora Forge)
 * - name.last@aegis.azora.world (Azora Aegis)
 * - name.last@oracle.azora.world (Azora Oracle)
 * - name.last@covenant.azora.world (Azora Covenant)
 * - name.last@workspace.azora.world (Azora Workspace)
 * - name.last@research.azora.world (Research Teams)
 * 
 * CORPORATE:
 * - name.last@azora.world (Core team)
 * - name.last@hr.azora.world (Human Resources)
 * - name.last@finance.azora.world (Finance)
 * - name.last@legal.azora.world (Legal)
 * - name.last@marketing.azora.world (Marketing)
 * - name.last@support.azora.world (Support)
 * 
 * Features:
 * - Automatic provisioning based on role and platform
 * - Cross-platform email forwarding
 * - Unified directory
 * - SSO integration
 * - Email aliases
 * - Distribution lists
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

export enum Platform {
  // Education Platforms
  SAPIENS_UNIVERSITY = 'sapiens',
  EDUCATION = 'education',
  LMS = 'lms',
  ACADEMY = 'academy',
  
  // Core Services
  MINT = 'mint',
  NEXUS = 'nexus',
  FORGE = 'forge',
  AEGIS = 'aegis',
  ORACLE = 'oracle',
  COVENANT = 'covenant',
  WORKSPACE = 'workspace',
  
  // Research & Development
  RESEARCH = 'research',
  INNOVATION = 'innovation',
  
  // Corporate
  CORE = 'core',
  HR = 'hr',
  FINANCE = 'finance',
  LEGAL = 'legal',
  MARKETING = 'marketing',
  SUPPORT = 'support',
  OPERATIONS = 'operations',
}

export enum UserRole {
  // Student Roles
  STUDENT_K12 = 'student_k12',
  STUDENT_UNIVERSITY = 'student_university',
  STUDENT_SKILLS = 'student_skills',
  
  // Academic Roles
  PROFESSOR = 'professor',
  LECTURER = 'lecturer',
  TEACHING_ASSISTANT = 'teaching_assistant',
  RESEARCHER = 'researcher',
  
  // Administrative Roles
  DEAN = 'dean',
  HEAD_OF_DEPARTMENT = 'head_of_department',
  ACADEMIC_ADVISOR = 'academic_advisor',
  REGISTRAR = 'registrar',
  
  // Technical Roles
  DEVELOPER = 'developer',
  ENGINEER = 'engineer',
  ARCHITECT = 'architect',
  DEVOPS = 'devops',
  DATA_SCIENTIST = 'data_scientist',
  
  // Business Roles
  PRODUCT_MANAGER = 'product_manager',
  PROJECT_MANAGER = 'project_manager',
  ANALYST = 'analyst',
  
  // Support Roles
  SUPPORT_AGENT = 'support_agent',
  COMMUNITY_MANAGER = 'community_manager',
  
  // Corporate Roles
  EXECUTIVE = 'executive',
  MANAGER = 'manager',
  HR_SPECIALIST = 'hr_specialist',
  FINANCE_OFFICER = 'finance_officer',
  LEGAL_COUNSEL = 'legal_counsel',
  MARKETING_SPECIALIST = 'marketing_specialist',
  
  // System Roles
  SYSTEM_ADMIN = 'system_admin',
  SECURITY_OFFICER = 'security_officer',
}

export interface UnifiedEmailAccount {
  id: string;
  userId: string;
  userType: 'student' | 'staff' | 'contractor' | 'alumni';
  
  // Personal Info
  firstName: string;
  lastName: string;
  displayName: string;
  
  // Primary Email
  primaryEmail: string;
  primaryPlatform: Platform;
  
  // Role & Platform
  role: UserRole;
  platforms: Platform[]; // Platforms user has access to
  
  // All Emails
  emails: {
    address: string;
    platform: Platform;
    isPrimary: boolean;
    aliases: string[];
  }[];
  
  // Configuration
  forwardingEnabled: boolean;
  forwardTo?: string;
  autoReply?: {
    enabled: boolean;
    message: string;
  };
  
  // Storage & Limits
  storageQuota: number; // GB
  storageUsed: number; // GB
  
  // Status
  status: 'active' | 'suspended' | 'alumni' | 'inactive';
  createdAt: Date;
  lastLogin?: Date;
  
  // Professional Info
  title?: string;
  department?: string;
  manager?: string;
  officeLocation?: string;
  phoneNumber?: string;
  
  // Metadata
  metadata: {
    provider: 'microsoft365' | 'google' | 'zoho';
    accountIds: Record<Platform, string>;
    signature: string;
  };
}

export interface EmailProvisionRequest {
  // User Info
  firstName: string;
  lastName: string;
  userType: 'student' | 'staff' | 'contractor';
  
  // Role & Platform
  role: UserRole;
  primaryPlatform: Platform;
  additionalPlatforms?: Platform[];
  
  // Additional Info (for staff)
  title?: string;
  department?: string;
  manager?: string;
  employeeId?: string;
  
  // Student-specific
  studentNumber?: string;
  program?: string;
  
  // Options
  personalEmail?: string; // For forwarding
}

export class UnifiedEmailSystem extends EventEmitter {
  private accounts: Map<string, UnifiedEmailAccount> = new Map();
  private emailDirectory: Map<string, string> = new Map(); // email -> userId
  
  // Platform domain mapping
  private platformDomains: Record<Platform, string> = {
    // Education
    [Platform.SAPIENS_UNIVERSITY]: 'sapiens.azora.world',
    [Platform.EDUCATION]: 'education.azora.world',
    [Platform.LMS]: 'lms.azora.world',
    [Platform.ACADEMY]: 'academy.azora.world',
    
    // Services
    [Platform.MINT]: 'mint.azora.world',
    [Platform.NEXUS]: 'nexus.azora.world',
    [Platform.FORGE]: 'forge.azora.world',
    [Platform.AEGIS]: 'aegis.azora.world',
    [Platform.ORACLE]: 'oracle.azora.world',
    [Platform.COVENANT]: 'covenant.azora.world',
    [Platform.WORKSPACE]: 'workspace.azora.world',
    
    // Research
    [Platform.RESEARCH]: 'research.azora.world',
    [Platform.INNOVATION]: 'innovation.azora.world',
    
    // Corporate
    [Platform.CORE]: 'azora.world',
    [Platform.HR]: 'hr.azora.world',
    [Platform.FINANCE]: 'finance.azora.world',
    [Platform.LEGAL]: 'legal.azora.world',
    [Platform.MARKETING]: 'marketing.azora.world',
    [Platform.SUPPORT]: 'support.azora.world',
    [Platform.OPERATIONS]: 'operations.azora.world',
  };
  
  // Storage quotas by user type
  private storageQuotas = {
    student: 50,
    staff: 100,
    contractor: 50,
    alumni: 10,
    executive: 500,
  };
  
  constructor() {
    super();
  }

  /**
   * Provision unified email account
   */
  async provisionAccount(request: EmailProvisionRequest): Promise<UnifiedEmailAccount> {
    console.log('[UNIFIED EMAIL] Provisioning account for:', request.firstName, request.lastName);

    const userId = crypto.randomUUID();

    // Generate primary email based on user type and platform
    const primaryEmail = this.generatePrimaryEmail(request);

    // Generate additional platform emails if needed
    const emails = this.generatePlatformEmails(request, primaryEmail);

    // Determine storage quota
    const storageQuota = this.determineStorageQuota(request);

    // Generate professional signature
    const signature = this.generateSignature(request, primaryEmail);

    // Create account
    const account: UnifiedEmailAccount = {
      id: userId,
      userId,
      userType: request.userType,
      firstName: request.firstName,
      lastName: request.lastName,
      displayName: `${request.firstName} ${request.lastName}`,
      primaryEmail,
      primaryPlatform: request.primaryPlatform,
      role: request.role,
      platforms: [request.primaryPlatform, ...(request.additionalPlatforms || [])],
      emails,
      forwardingEnabled: !!request.personalEmail,
      forwardTo: request.personalEmail,
      storageQuota,
      storageUsed: 0,
      status: 'active',
      createdAt: new Date(),
      title: request.title,
      department: request.department,
      manager: request.manager,
      metadata: {
        provider: 'microsoft365',
        accountIds: {},
        signature
      }
    };

    // Provision on email provider
    await this.provisionOnProvider(account);

    // Store account
    this.accounts.set(userId, account);

    // Update directory
    for (const email of emails) {
      this.emailDirectory.set(email.address, userId);
      for (const alias of email.aliases) {
        this.emailDirectory.set(alias, userId);
      }
    }

    // Emit event
    this.emit('account-provisioned', account);

    // Send welcome email
    await this.sendWelcomeEmail(account);

    return account;
  }

  /**
   * Generate primary email based on user type and platform
   */
  private generatePrimaryEmail(request: EmailProvisionRequest): string {
    // Students: studentnumber@domain
    if (request.userType === 'student' && request.studentNumber) {
      const domain = this.getStudentDomain(request.role);
      return `${request.studentNumber.toLowerCase()}@${domain}`;
    }

    // Staff/Contractors: firstname.lastname@platform.azora.world
    const domain = this.platformDomains[request.primaryPlatform];
    const username = this.generateUsername(request.firstName, request.lastName);
    
    return `${username}@${domain}`;
  }

  /**
   * Generate username from name (handle duplicates)
   */
  private generateUsername(firstName: string, lastName: string): string {
    // Clean and lowercase
    const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
    const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
    
    let username = `${cleanFirst}.${cleanLast}`;
    
    // Check for duplicates and add number if needed
    let counter = 1;
    let finalUsername = username;
    
    while (this.isUsernameExists(finalUsername)) {
      finalUsername = `${username}${counter}`;
      counter++;
    }
    
    return finalUsername;
  }

  /**
   * Check if username exists in any platform
   */
  private isUsernameExists(username: string): boolean {
    // Check across all platforms
    for (const domain of Object.values(this.platformDomains)) {
      const email = `${username}@${domain}`;
      if (this.emailDirectory.has(email)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get student email domain based on role
   */
  private getStudentDomain(role: UserRole): string {
    switch (role) {
      case UserRole.STUDENT_K12:
        return 'edu.azora.world';
      case UserRole.STUDENT_UNIVERSITY:
        return 'ac.azora.world';
      case UserRole.STUDENT_SKILLS:
        return 'sk.azora.world';
      default:
        return 'edu.azora.world';
    }
  }

  /**
   * Generate emails for all platforms
   */
  private generatePlatformEmails(request: EmailProvisionRequest, primaryEmail: string): UnifiedEmailAccount['emails'] {
    const emails: UnifiedEmailAccount['emails'] = [];
    const allPlatforms = [request.primaryPlatform, ...(request.additionalPlatforms || [])];

    for (const platform of allPlatforms) {
      const domain = this.platformDomains[platform];
      const isPrimary = platform === request.primaryPlatform;
      
      let address: string;
      
      if (request.userType === 'student' && request.studentNumber) {
        address = isPrimary ? primaryEmail : `${request.studentNumber.toLowerCase()}@${domain}`;
      } else {
        const username = this.generateUsername(request.firstName, request.lastName);
        address = `${username}@${domain}`;
      }

      // Generate aliases
      const aliases = this.generateAliases(request, platform, address);

      emails.push({
        address,
        platform,
        isPrimary,
        aliases
      });
    }

    return emails;
  }

  /**
   * Generate email aliases
   */
  private generateAliases(request: EmailProvisionRequest, platform: Platform, primaryAddress: string): string[] {
    const aliases: string[] = [];
    const username = request.studentNumber || 
                     this.generateUsername(request.firstName, request.lastName);

    // Add generic azora.world alias for staff
    if (request.userType !== 'student') {
      aliases.push(`${username}@azora.world`);
    }

    // Add role-based aliases
    if (request.role === UserRole.PROFESSOR || request.role === UserRole.LECTURER) {
      aliases.push(`prof.${username}@${this.platformDomains[platform]}`);
    }

    // Add department aliases if applicable
    if (request.department) {
      const deptAlias = `${username}@${request.department.toLowerCase()}.azora.world`;
      if (!aliases.includes(deptAlias)) {
        aliases.push(deptAlias);
      }
    }

    return aliases.filter(alias => alias !== primaryAddress);
  }

  /**
   * Determine storage quota
   */
  private determineStorageQuota(request: EmailProvisionRequest): number {
    // Executives get more storage
    if (request.role === UserRole.EXECUTIVE) {
      return this.storageQuotas.executive;
    }

    return this.storageQuotas[request.userType];
  }

  /**
   * Generate professional email signature
   */
  private generateSignature(request: EmailProvisionRequest, email: string): string {
    const platformName = this.getPlatformName(request.primaryPlatform);
    
    let signature = `--\n${request.firstName} ${request.lastName}`;
    
    if (request.title) {
      signature += `\n${request.title}`;
    }
    
    if (request.department) {
      signature += `\n${request.department}`;
    }
    
    signature += `\n${platformName}`;
    signature += `\n\nEmail: ${email}`;
    signature += `\nWeb: https://${request.primaryPlatform}.azora.world`;
    signature += `\n\n"Building a sovereign future through innovation"`;
    
    return signature;
  }

  /**
   * Get platform display name
   */
  private getPlatformName(platform: Platform): string {
    const names: Record<Platform, string> = {
      [Platform.SAPIENS_UNIVERSITY]: 'Azora Sapiens University',
      [Platform.EDUCATION]: 'Azora Education',
      [Platform.LMS]: 'Azora Learning Management System',
      [Platform.ACADEMY]: 'Azora Academy',
      [Platform.MINT]: 'Azora Mint',
      [Platform.NEXUS]: 'Azora Nexus',
      [Platform.FORGE]: 'Azora Forge',
      [Platform.AEGIS]: 'Azora Aegis',
      [Platform.ORACLE]: 'Azora Oracle',
      [Platform.COVENANT]: 'Azora Covenant',
      [Platform.WORKSPACE]: 'Azora Workspace',
      [Platform.RESEARCH]: 'Azora Research',
      [Platform.INNOVATION]: 'Azora Innovation Lab',
      [Platform.CORE]: 'Azora ES (Pty) Ltd',
      [Platform.HR]: 'Azora Human Resources',
      [Platform.FINANCE]: 'Azora Finance',
      [Platform.LEGAL]: 'Azora Legal',
      [Platform.MARKETING]: 'Azora Marketing',
      [Platform.SUPPORT]: 'Azora Support',
      [Platform.OPERATIONS]: 'Azora Operations',
    };

    return names[platform];
  }

  /**
   * Provision account on email provider
   */
  private async provisionOnProvider(account: UnifiedEmailAccount): Promise<void> {
    // TODO: Integrate with Microsoft 365 or Google Workspace
    // Create accounts for all platform emails
    
    console.log(`[UNIFIED EMAIL] Provisioning on ${account.metadata.provider}:`);
    for (const email of account.emails) {
      console.log(`  ✓ ${email.address} (${email.platform})`);
      for (const alias of email.aliases) {
        console.log(`    → ${alias} (alias)`);
      }
    }
  }

  /**
   * Send welcome email
   */
  private async sendWelcomeEmail(account: UnifiedEmailAccount): Promise<void> {
    const platformName = this.getPlatformName(account.primaryPlatform);
    
    const message = `
Welcome to ${platformName}!

Your professional email accounts have been created:

PRIMARY EMAIL: ${account.primaryEmail}

${account.emails.length > 1 ? `ADDITIONAL EMAILS:\n${account.emails.filter(e => !e.isPrimary).map(e => `- ${e.address}`).join('\n')}` : ''}

${account.emails.some(e => e.aliases.length > 0) ? `\nEMAIL ALIASES:\n${account.emails.flatMap(e => e.aliases).map(a => `- ${a}`).join('\n')}` : ''}

STORAGE: ${account.storageQuota}GB

Getting Started:
1. Visit https://account.azora.world
2. Set up your password
3. Configure email client (Outlook, Gmail, etc.)
4. Customize your signature

Email Client Settings:
- IMAP: imap.azora.world (Port 993, SSL)
- SMTP: smtp.azora.world (Port 587, STARTTLS)

Support: support@azora.world
Directory: https://directory.azora.world

Welcome to the Azora family!
    `.trim();

    console.log('[UNIFIED EMAIL] Welcome email sent to:', account.forwardTo || account.primaryEmail);
    console.log(message);
  }

  /**
   * Get account by user ID
   */
  getAccount(userId: string): UnifiedEmailAccount | undefined {
    return this.accounts.get(userId);
  }

  /**
   * Get account by email address
   */
  getAccountByEmail(email: string): UnifiedEmailAccount | undefined {
    const userId = this.emailDirectory.get(email.toLowerCase());
    return userId ? this.accounts.get(userId) : undefined;
  }

  /**
   * Add user to additional platform
   */
  async addPlatformAccess(userId: string, platform: Platform): Promise<void> {
    const account = this.accounts.get(userId);
    
    if (!account) {
      throw new Error('Account not found');
    }

    if (account.platforms.includes(platform)) {
      throw new Error('User already has access to this platform');
    }

    // Generate email for new platform
    const domain = this.platformDomains[platform];
    const username = account.userType === 'student' && account.emails[0]?.address.split('@')[0] ||
                     this.generateUsername(account.firstName, account.lastName);
    
    const newEmail = `${username}@${domain}`;
    const aliases = this.generateAliases(
      {
        firstName: account.firstName,
        lastName: account.lastName,
        userType: account.userType,
        role: account.role,
        primaryPlatform: platform,
        department: account.department
      },
      platform,
      newEmail
    );

    // Add to account
    account.platforms.push(platform);
    account.emails.push({
      address: newEmail,
      platform,
      isPrimary: false,
      aliases
    });

    // Update directory
    this.emailDirectory.set(newEmail, userId);
    for (const alias of aliases) {
      this.emailDirectory.set(alias, userId);
    }

    // Provision on provider
    console.log(`[UNIFIED EMAIL] Added platform access: ${newEmail}`);

    this.emit('platform-access-added', { account, platform, email: newEmail });
  }

  /**
   * Get all accounts for a platform
   */
  getAccountsByPlatform(platform: Platform): UnifiedEmailAccount[] {
    return Array.from(this.accounts.values())
      .filter(account => account.platforms.includes(platform));
  }

  /**
   * Get organization directory
   */
  getDirectory(): Array<{
    name: string;
    email: string;
    title?: string;
    department?: string;
    platform: string;
  }> {
    return Array.from(this.accounts.values())
      .filter(acc => acc.status === 'active')
      .map(acc => ({
        name: acc.displayName,
        email: acc.primaryEmail,
        title: acc.title,
        department: acc.department,
        platform: this.getPlatformName(acc.primaryPlatform)
      }));
  }

  /**
   * Search directory
   */
  searchDirectory(query: string): UnifiedEmailAccount[] {
    const lowerQuery = query.toLowerCase();
    
    return Array.from(this.accounts.values())
      .filter(acc => 
        acc.status === 'active' && (
          acc.firstName.toLowerCase().includes(lowerQuery) ||
          acc.lastName.toLowerCase().includes(lowerQuery) ||
          acc.displayName.toLowerCase().includes(lowerQuery) ||
          acc.primaryEmail.toLowerCase().includes(lowerQuery) ||
          acc.department?.toLowerCase().includes(lowerQuery) ||
          acc.title?.toLowerCase().includes(lowerQuery)
        )
      );
  }
}

// Create singleton
export const unifiedEmailSystem = new UnifiedEmailSystem();

export default unifiedEmailSystem;
