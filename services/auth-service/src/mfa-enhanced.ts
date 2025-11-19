/**
 * Enhanced Multi-Factor Authentication Service
 * Supports TOTP, SMS, Email, and backup codes
 */

import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'azora-secret-key-2025';

interface MFASettings {
  userId: string;
  totpSecret?: string;
  totpEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  phoneNumber?: string;
  backupCodes: string[];
  createdAt: Date;
  lastUsedAt?: Date;
}

interface MFAChallenge {
  challengeId: string;
  userId: string;
  method: 'totp' | 'sms' | 'email';
  code?: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
}

/**
 * Enhanced MFA Service
 */
export class EnhancedMFAService {
  private challenges: Map<string, MFAChallenge> = new Map();
  private emailTransporter: any;

  constructor(private prisma: any) {
    this.initializeEmailTransporter();
  }

  /**
   * Initialize email transporter
   */
  private initializeEmailTransporter(): void {
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  /**
   * Setup MFA for user
   */
  async setupMFA(userId: string, methods: ('totp' | 'sms' | 'email')[] = ['totp']): Promise<{
    secret?: string;
    qrCode?: string;
    backupCodes: string[];
    methods: string[];
  }> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      const backupCodes = this.generateBackupCodes();
      const response: any = { backupCodes, methods };

      // Setup TOTP if requested
      if (methods.includes('totp')) {
        const secret = speakeasy.generateSecret({
          name: `Azora OS (${user.email})`,
          issuer: 'Azora OS'
        });

        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

        await this.prisma.mFASettings.upsert({
          where: { userId },
          create: {
            userId,
            totpSecret: secret.base32,
            totpEnabled: false,
            smsEnabled: methods.includes('sms'),
            emailEnabled: methods.includes('email'),
            backupCodes: JSON.stringify(backupCodes),
            createdAt: new Date()
          },
          update: {
            totpSecret: secret.base32,
            smsEnabled: methods.includes('sms'),
            emailEnabled: methods.includes('email'),
            backupCodes: JSON.stringify(backupCodes)
          }
        });

        response.secret = secret.base32;
        response.qrCode = qrCodeUrl;
      }

      return response;
    } catch (error) {
      throw new Error(`MFA setup failed: ${error}`);
    }
  }

  /**
   * Enable MFA method
   */
  async enableMFAMethod(userId: string, method: 'totp' | 'sms' | 'email', code?: string): Promise<void> {
    try {
      const mfaSettings = await this.prisma.mFASettings.findUnique({ where: { userId } });
      if (!mfaSettings) {
        throw new Error('MFA not set up');
      }

      // Verify TOTP code if enabling TOTP
      if (method === 'totp' && code) {
        const verified = speakeasy.totp.verify({
          secret: mfaSettings.totpSecret,
          encoding: 'base32',
          token: code,
          window: 2
        });

        if (!verified) {
          throw new Error('Invalid TOTP code');
        }
      }

      // Update MFA settings
      const updateData: any = {};
      updateData[`${method}Enabled`] = true;

      await this.prisma.mFASettings.update({
        where: { userId },
        data: updateData
      });
    } catch (error) {
      throw new Error(`Failed to enable MFA method: ${error}`);
    }
  }

  /**
   * Disable MFA method
   */
  async disableMFAMethod(userId: string, method: 'totp' | 'sms' | 'email'): Promise<void> {
    try {
      const updateData: any = {};
      updateData[`${method}Enabled`] = false;

      await this.prisma.mFASettings.update({
        where: { userId },
        data: updateData
      });
    } catch (error) {
      throw new Error(`Failed to disable MFA method: ${error}`);
    }
  }

  /**
   * Send MFA challenge
   */
  async sendMFAChallenge(userId: string, method: 'totp' | 'sms' | 'email'): Promise<string> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      const mfaSettings = await this.prisma.mFASettings.findUnique({ where: { userId } });
      if (!mfaSettings) {
        throw new Error('MFA not set up');
      }

      // Check if method is enabled
      const methodKey = `${method}Enabled`;
      if (!mfaSettings[methodKey]) {
        throw new Error(`${method} MFA not enabled`);
      }

      const challengeId = crypto.randomUUID();
      const code = this.generateMFACode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      const challenge: MFAChallenge = {
        challengeId,
        userId,
        method,
        code,
        expiresAt,
        attempts: 0,
        maxAttempts: 5
      };

      this.challenges.set(challengeId, challenge);

      // Send code based on method
      if (method === 'sms' && mfaSettings.phoneNumber) {
        await this.sendSMSCode(mfaSettings.phoneNumber, code);
      } else if (method === 'email') {
        await this.sendEmailCode(user.email, code);
      }

      return challengeId;
    } catch (error) {
      throw new Error(`Failed to send MFA challenge: ${error}`);
    }
  }

  /**
   * Verify MFA challenge
   */
  async verifyMFAChallenge(challengeId: string, code: string): Promise<{ token: string; userId: string }> {
    try {
      const challenge = this.challenges.get(challengeId);
      if (!challenge) {
        throw new Error('Challenge not found or expired');
      }

      // Check expiration
      if (challenge.expiresAt < new Date()) {
        this.challenges.delete(challengeId);
        throw new Error('Challenge expired');
      }

      // Check attempts
      if (challenge.attempts >= challenge.maxAttempts) {
        this.challenges.delete(challengeId);
        throw new Error('Too many failed attempts');
      }

      // Verify code
      if (challenge.code !== code) {
        challenge.attempts++;
        throw new Error('Invalid code');
      }

      // Code verified
      this.challenges.delete(challengeId);

      // Generate MFA token
      const mfaToken = jwt.sign(
        { userId: challenge.userId, mfaVerified: true },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      return { token: mfaToken, userId: challenge.userId };
    } catch (error) {
      throw new Error(`MFA verification failed: ${error}`);
    }
  }

  /**
   * Verify TOTP code directly
   */
  async verifyTOTPCode(userId: string, code: string): Promise<boolean> {
    try {
      const mfaSettings = await this.prisma.mFASettings.findUnique({ where: { userId } });
      if (!mfaSettings || !mfaSettings.totpEnabled) {
        throw new Error('TOTP not enabled');
      }

      const verified = speakeasy.totp.verify({
        secret: mfaSettings.totpSecret,
        encoding: 'base32',
        token: code,
        window: 2
      });

      if (verified) {
        await this.prisma.mFASettings.update({
          where: { userId },
          data: { lastUsedAt: new Date() }
        });
      }

      return verified;
    } catch (error) {
      throw new Error(`TOTP verification failed: ${error}`);
    }
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const mfaSettings = await this.prisma.mFASettings.findUnique({ where: { userId } });
      if (!mfaSettings) {
        throw new Error('MFA not set up');
      }

      const backupCodes = JSON.parse(mfaSettings.backupCodes || '[]');
      const codeIndex = backupCodes.indexOf(code);

      if (codeIndex === -1) {
        throw new Error('Invalid backup code');
      }

      // Remove used backup code
      backupCodes.splice(codeIndex, 1);

      await this.prisma.mFASettings.update({
        where: { userId },
        data: {
          backupCodes: JSON.stringify(backupCodes),
          lastUsedAt: new Date()
        }
      });

      return true;
    } catch (error) {
      throw new Error(`Backup code verification failed: ${error}`);
    }
  }

  /**
   * Send SMS code
   */
  private async sendSMSCode(phoneNumber: string, code: string): Promise<void> {
    try {
      // Integration with SMS provider (Twilio, AWS SNS, etc.)
      // This is a placeholder implementation
      console.log(`SMS Code for ${phoneNumber}: ${code}`);
      
      // In production, use actual SMS provider
      // const twilio = require('twilio');
      // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // await client.messages.create({
      //   body: `Your Azora OS verification code is: ${code}`,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: phoneNumber
      // });
    } catch (error) {
      throw new Error(`Failed to send SMS: ${error}`);
    }
  }

  /**
   * Send email code
   */
  private async sendEmailCode(email: string, code: string): Promise<void> {
    try {
      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@azora.world',
        to: email,
        subject: 'Your Azora OS Verification Code',
        html: `
          <h2>Verification Code</h2>
          <p>Your verification code is: <strong>${code}</strong></p>
          <p>This code will expire in 5 minutes.</p>
          <p>If you did not request this code, please ignore this email.</p>
        `
      });
    } catch (error) {
      throw new Error(`Failed to send email: ${error}`);
    }
  }

  /**
   * Generate MFA code
   */
  private generateMFACode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  /**
   * Get MFA status
   */
  async getMFAStatus(userId: string): Promise<MFASettings | null> {
    try {
      return await this.prisma.mFASettings.findUnique({ where: { userId } });
    } catch (error) {
      throw new Error(`Failed to get MFA status: ${error}`);
    }
  }

  /**
   * Disable all MFA
   */
  async disableAllMFA(userId: string): Promise<void> {
    try {
      await this.prisma.mFASettings.update({
        where: { userId },
        data: {
          totpEnabled: false,
          smsEnabled: false,
          emailEnabled: false,
          totpSecret: null,
          backupCodes: JSON.stringify([])
        }
      });
    } catch (error) {
      throw new Error(`Failed to disable MFA: ${error}`);
    }
  }
}

export default EnhancedMFAService;
