import { PrismaClient } from '@prisma/client';
import { createLogger, logInfo, logError } from '../logging';

const prisma = new PrismaClient();
const logger = createLogger('consent-manager');

export enum ConsentType {
  ESSENTIAL = 'ESSENTIAL',
  ANALYTICS = 'ANALYTICS',
  MARKETING = 'MARKETING',
  PERSONALIZATION = 'PERSONALIZATION'
}

export interface ConsentRecord {
  userId: string;
  consentType: ConsentType;
  granted: boolean;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface ConsentStatus {
  userId: string;
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  lastUpdated: Date;
}

export class ConsentManager {
  async recordConsent(record: ConsentRecord): Promise<void> {
    try {
      // Store consent record in database
      await prisma.consentRecord.create({
        data: {
          userId: record.userId,
          consentType: record.consentType,
          granted: record.granted,
          timestamp: record.timestamp,
          ipAddress: record.ipAddress,
          userAgent: record.userAgent
        }
      });
      logInfo(logger, '[GDPR] Consent recorded', { userId: record.userId, type: record.consentType });
    } catch (error) {
      logError(logger, '[GDPR] Failed to record consent', error as Error, { userId: record.userId });
      throw error;
    }
  }

  async getConsent(userId: string, consentType: ConsentType): Promise<boolean> {
    try {
      const record = await prisma.consentRecord.findFirst({
        where: {
          userId,
          consentType
        },
        orderBy: {
          timestamp: 'desc'
        }
      });
      return record?.granted ?? false;
    } catch (error) {
      logError(logger, '[GDPR] Failed to get consent', error as Error, { userId });
      return false;
    }
  }

  async getConsentStatus(userId: string): Promise<ConsentStatus> {
    try {
      const [essential, analytics, marketing, personalization] = await Promise.all([
        this.getConsent(userId, ConsentType.ESSENTIAL),
        this.getConsent(userId, ConsentType.ANALYTICS),
        this.getConsent(userId, ConsentType.MARKETING),
        this.getConsent(userId, ConsentType.PERSONALIZATION)
      ]);

      return {
        userId,
        essential,
        analytics,
        marketing,
        personalization,
        lastUpdated: new Date()
      };
    } catch (error) {
      logError(logger, '[GDPR] Failed to get consent status', error as Error, { userId });
      throw error;
    }
  }

  async withdrawConsent(userId: string, consentType: ConsentType): Promise<void> {
    await this.recordConsent({
      userId,
      consentType,
      granted: false,
      timestamp: new Date()
    });
  }

  async grantConsent(userId: string, consentType: ConsentType, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.recordConsent({
      userId,
      consentType,
      granted: true,
      timestamp: new Date(),
      ipAddress,
      userAgent
    });
  }

  async exportUserData(userId: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          enrollments: true,
          payments: true,
          wallets: true,
          assessments: true,
          chatSessions: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const consentRecords = await prisma.consentRecord.findMany({
        where: { userId }
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          profile: user.profile
        },
        enrollments: user.enrollments,
        payments: user.payments,
        wallets: user.wallets,
        assessments: user.assessments,
        chatSessions: user.chatSessions,
        consentRecords
      };
    } catch (error) {
      logError(logger, '[GDPR] Failed to export user data', error as Error, { userId });
      throw error;
    }
  }

  async deleteUserData(userId: string): Promise<void> {
    try {
      // Delete user and all related data (cascading deletes)
      await prisma.user.delete({
        where: { id: userId }
      });
      logInfo(logger, '[GDPR] User data deleted', { userId });
    } catch (error) {
      logError(logger, '[GDPR] Failed to delete user data', error as Error, { userId });
      throw error;
    }
  }
}

export const consentManager = new ConsentManager();
