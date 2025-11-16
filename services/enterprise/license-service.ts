/**
 * Enterprise License Service
 * Manages enterprise licenses, activation, and validation
 */

import { PrismaClient, EnterpriseTier, EnterpriseStatus } from '@prisma/client';
import { logger } from '../shared/logging';
import { ErrorHandler } from '../payment/error-handler';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface CreateLicenseInput {
  organizationName: string;
  organizationEmail: string;
  tier: EnterpriseTier;
  maxUsers: number;
  maxCourses?: number;
  maxApiCalls?: number;
  startDate: Date;
  expiryDate: Date;
  autoRenew?: boolean;
}

export interface LicenseResponse {
  id: string;
  organizationId: string;
  organizationName: string;
  tier: EnterpriseTier;
  status: EnterpriseStatus;
  licenseKey: string;
  maxUsers: number;
  maxCourses: number | null;
  maxApiCalls: number | null;
  startDate: Date;
  expiryDate: Date;
  autoRenew: boolean;
  createdAt: Date;
}

export class EnterpriseLicenseService {
  /**
   * Generate unique license key
   */
  private generateLicenseKey(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = crypto.randomBytes(8).toString('hex');
    return `AZORA-${timestamp}-${randomStr}`.toUpperCase();
  }

  /**
   * Create new enterprise license
   */
  async createLicense(input: CreateLicenseInput): Promise<LicenseResponse> {
    try {
      logger.info('Creating enterprise license', {
        organizationName: input.organizationName,
        tier: input.tier,
      });

      // Validate dates
      if (input.expiryDate <= input.startDate) {
        throw new Error('Expiry date must be after start date');
      }

      // Generate license key
      const licenseKey = this.generateLicenseKey();

      // Create license
      const license = await prisma.enterpriseLicense.create({
        data: {
          organizationId: crypto.randomUUID(),
          organizationName: input.organizationName,
          tier: input.tier,
          licenseKey,
          maxUsers: input.maxUsers,
          maxCourses: input.maxCourses,
          maxApiCalls: input.maxApiCalls,
          startDate: input.startDate,
          expiryDate: input.expiryDate,
          autoRenew: input.autoRenew ?? true,
          status: 'ACTIVE',
        },
      });

      // Create organization record
      await prisma.enterpriseOrganization.create({
        data: {
          licenseId: license.id,
          name: input.organizationName,
          email: input.organizationEmail,
        },
      });

      logger.info('Enterprise license created', { licenseId: license.id, licenseKey });

      return this.mapLicenseResponse(license);
    } catch (error) {
      logger.error('Failed to create license', { error, ...input });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Activate license
   */
  async activateLicense(licenseKey: string): Promise<LicenseResponse> {
    try {
      logger.info('Activating license', { licenseKey });

      const license = await prisma.enterpriseLicense.findUnique({
        where: { licenseKey },
      });

      if (!license) {
        throw new Error(`License ${licenseKey} not found`);
      }

      if (license.status === 'ACTIVE') {
        throw new Error('License is already active');
      }

      const updated = await prisma.enterpriseLicense.update({
        where: { id: license.id },
        data: { status: 'ACTIVE' },
      });

      logger.info('License activated', { licenseId: license.id });

      return this.mapLicenseResponse(updated);
    } catch (error) {
      logger.error('Failed to activate license', { error, licenseKey });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Check license validity
   */
  async checkLicenseValidity(organizationId: string): Promise<boolean> {
    try {
      const license = await prisma.enterpriseLicense.findUnique({
        where: { organizationId },
      });

      if (!license) {
        return false;
      }

      // Check status
      if (license.status !== 'ACTIVE') {
        return false;
      }

      // Check expiry
      if (new Date() > license.expiryDate) {
        // Mark as expired
        await prisma.enterpriseLicense.update({
          where: { id: license.id },
          data: { status: 'EXPIRED' },
        });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Failed to check license validity', { error, organizationId });
      return false;
    }
  }

  /**
   * Get license by ID
   */
  async getLicense(licenseId: string): Promise<LicenseResponse | null> {
    try {
      const license = await prisma.enterpriseLicense.findUnique({
        where: { id: licenseId },
      });

      if (!license) {
        return null;
      }

      return this.mapLicenseResponse(license);
    } catch (error) {
      logger.error('Failed to get license', { error, licenseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get license by organization ID
   */
  async getLicenseByOrganization(organizationId: string): Promise<LicenseResponse | null> {
    try {
      const license = await prisma.enterpriseLicense.findUnique({
        where: { organizationId },
      });

      if (!license) {
        return null;
      }

      return this.mapLicenseResponse(license);
    } catch (error) {
      logger.error('Failed to get license by organization', { error, organizationId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Renew license
   */
  async renewLicense(licenseId: string, newExpiryDate: Date): Promise<LicenseResponse> {
    try {
      logger.info('Renewing license', { licenseId });

      const license = await prisma.enterpriseLicense.findUnique({
        where: { id: licenseId },
      });

      if (!license) {
        throw new Error(`License ${licenseId} not found`);
      }

      const updated = await prisma.enterpriseLicense.update({
        where: { id: licenseId },
        data: {
          expiryDate: newExpiryDate,
          status: 'ACTIVE',
        },
      });

      logger.info('License renewed', { licenseId, newExpiryDate });

      return this.mapLicenseResponse(updated);
    } catch (error) {
      logger.error('Failed to renew license', { error, licenseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Suspend license
   */
  async suspendLicense(licenseId: string, reason: string): Promise<LicenseResponse> {
    try {
      logger.info('Suspending license', { licenseId, reason });

      const license = await prisma.enterpriseLicense.findUnique({
        where: { id: licenseId },
      });

      if (!license) {
        throw new Error(`License ${licenseId} not found`);
      }

      const updated = await prisma.enterpriseLicense.update({
        where: { id: licenseId },
        data: {
          status: 'SUSPENDED',
          metadata: {
            ...license.metadata,
            suspensionReason: reason,
            suspendedAt: new Date().toISOString(),
          },
        },
      });

      logger.info('License suspended', { licenseId });

      return this.mapLicenseResponse(updated);
    } catch (error) {
      logger.error('Failed to suspend license', { error, licenseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Cancel license
   */
  async cancelLicense(licenseId: string, reason: string): Promise<void> {
    try {
      logger.info('Cancelling license', { licenseId, reason });

      const license = await prisma.enterpriseLicense.findUnique({
        where: { id: licenseId },
      });

      if (!license) {
        throw new Error(`License ${licenseId} not found`);
      }

      await prisma.enterpriseLicense.update({
        where: { id: licenseId },
        data: {
          status: 'CANCELLED',
          metadata: {
            ...license.metadata,
            cancellationReason: reason,
            cancelledAt: new Date().toISOString(),
          },
        },
      });

      logger.info('License cancelled', { licenseId });
    } catch (error) {
      logger.error('Failed to cancel license', { error, licenseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get expiring licenses
   */
  async getExpiringLicenses(daysUntilExpiry: number = 30): Promise<LicenseResponse[]> {
    try {
      const now = new Date();
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + daysUntilExpiry);

      const licenses = await prisma.enterpriseLicense.findMany({
        where: {
          status: 'ACTIVE',
          expiryDate: {
            gte: now,
            lte: expiryDate,
          },
        },
      });

      return licenses.map((license) => this.mapLicenseResponse(license));
    } catch (error) {
      logger.error('Failed to get expiring licenses', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get license statistics
   */
  async getLicenseStats(): Promise<{
    totalLicenses: number;
    activeLicenses: number;
    suspendedLicenses: number;
    expiredLicenses: number;
    cancelledLicenses: number;
    byTier: Record<EnterpriseTier, number>;
    totalMaxUsers: number;
  }> {
    try {
      const [total, active, suspended, expired, cancelled, byTier, maxUsers] = await Promise.all([
        prisma.enterpriseLicense.count(),
        prisma.enterpriseLicense.count({ where: { status: 'ACTIVE' } }),
        prisma.enterpriseLicense.count({ where: { status: 'SUSPENDED' } }),
        prisma.enterpriseLicense.count({ where: { status: 'EXPIRED' } }),
        prisma.enterpriseLicense.count({ where: { status: 'CANCELLED' } }),
        prisma.enterpriseLicense.groupBy({
          by: ['tier'],
          _count: true,
        }),
        prisma.enterpriseLicense.aggregate({
          _sum: { maxUsers: true },
        }),
      ]);

      const tierStats: Record<EnterpriseTier, number> = {
        STARTER: 0,
        PROFESSIONAL: 0,
        ENTERPRISE: 0,
        CUSTOM: 0,
      };

      byTier.forEach((item: any) => {
        tierStats[item.tier] = item._count;
      });

      return {
        totalLicenses: total,
        activeLicenses: active,
        suspendedLicenses: suspended,
        expiredLicenses: expired,
        cancelledLicenses: cancelled,
        byTier: tierStats,
        totalMaxUsers: maxUsers._sum.maxUsers || 0,
      };
    } catch (error) {
      logger.error('Failed to get license stats', { error });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Map license to response format
   */
  private mapLicenseResponse(license: any): LicenseResponse {
    return {
      id: license.id,
      organizationId: license.organizationId,
      organizationName: license.organizationName,
      tier: license.tier,
      status: license.status,
      licenseKey: license.licenseKey,
      maxUsers: license.maxUsers,
      maxCourses: license.maxCourses,
      maxApiCalls: license.maxApiCalls,
      startDate: license.startDate,
      expiryDate: license.expiryDate,
      autoRenew: license.autoRenew,
      createdAt: license.createdAt,
    };
  }
}

export default new EnterpriseLicenseService();
