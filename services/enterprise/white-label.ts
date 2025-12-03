/**
 * White-Label Features Service
 * Manages custom branding, domains, and white-label configurations
 */

import { PrismaClient, CustomizationType } from '@prisma/client';
import { logger } from '../shared/logging';
import { ErrorHandler } from '../payment/error-handler';

const prisma = new PrismaClient();

export interface BrandingConfig {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  companyName?: string;
  supportEmail?: string;
  supportPhone?: string;
}

export interface WhiteLabelConfig {
  customDomain?: string;
  branding?: BrandingConfig;
  ssoConfig?: any;
  apiConfig?: any;
  features?: string[];
}

export class WhiteLabelService {
  /**
   * Enable white-label for license
   */
  async enableWhiteLabel(licenseId: string): Promise<void> {
    try {
      logger.info('Enabling white-label', { licenseId });

      const license = await prisma.enterpriseLicense.findUnique({
        where: { id: licenseId },
      });

      if (!license) {
        throw new Error(`License ${licenseId} not found`);
      }

      await prisma.enterpriseLicense.update({
        where: { id: licenseId },
        data: { whiteLabel: true },
      });

      logger.info('White-label enabled', { licenseId });
    } catch (error) {
      logger.error('Failed to enable white-label', { error, licenseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Set custom domain
   */
  async setCustomDomain(licenseId: string, domain: string): Promise<void> {
    try {
      logger.info('Setting custom domain', { licenseId, domain });

      // Validate domain format
      const domainRegex = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
      if (!domainRegex.test(domain)) {
        throw new Error('Invalid domain format');
      }

      // Check if domain is already in use
      const existingLicense = await prisma.enterpriseLicense.findFirst({
        where: {
          customDomain: domain,
          id: { not: licenseId },
        },
      });

      if (existingLicense) {
        throw new Error('Domain is already in use');
      }

      await prisma.enterpriseLicense.update({
        where: { id: licenseId },
        data: { customDomain: domain },
      });

      // Store customization
      await prisma.enterpriseCustomization.upsert({
        where: {
          licenseId_type_key: {
            licenseId,
            type: 'DOMAIN',
            key: 'customDomain',
          },
        },
        update: { value: domain },
        create: {
          licenseId,
          type: 'DOMAIN',
          key: 'customDomain',
          value: domain,
          description: 'Custom domain for white-label',
        },
      });

      logger.info('Custom domain set', { licenseId, domain });
    } catch (error) {
      logger.error('Failed to set custom domain', { error, licenseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Set branding configuration
   */
  async setBranding(licenseId: string, branding: BrandingConfig): Promise<void> {
    try {
      logger.info('Setting branding', { licenseId });

      // Store each branding element
      const brandingEntries = [
        { key: 'primaryColor', value: branding.primaryColor },
        { key: 'secondaryColor', value: branding.secondaryColor },
        { key: 'logoUrl', value: branding.logoUrl },
        { key: 'faviconUrl', value: branding.faviconUrl },
        { key: 'companyName', value: branding.companyName },
        { key: 'supportEmail', value: branding.supportEmail },
        { key: 'supportPhone', value: branding.supportPhone },
      ];

      for (const entry of brandingEntries) {
        if (entry.value) {
          await prisma.enterpriseCustomization.upsert({
            where: {
              licenseId_type_key: {
                licenseId,
                type: 'BRANDING',
                key: entry.key,
              },
            },
            update: { value: entry.value },
            create: {
              licenseId,
              type: 'BRANDING',
              key: entry.key,
              value: entry.value,
              description: `Branding: ${entry.key}`,
            },
          });
        }
      }

      logger.info('Branding set', { licenseId });
    } catch (error) {
      logger.error('Failed to set branding', { error, licenseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get branding configuration
   */
  async getBranding(licenseId: string): Promise<BrandingConfig> {
    try {
      const customizations = await prisma.enterpriseCustomization.findMany({
        where: {
          licenseId,
          type: 'BRANDING',
        },
      });

      const branding: BrandingConfig = {};

      customizations.forEach((custom) => {
        branding[custom.key as keyof BrandingConfig] = custom.value as any;
      });

      return branding;
    } catch (error) {
      logger.error('Failed to get branding', { error, licenseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Enable SSO integration
   */
  async enableSSO(licenseId: string, ssoConfig: any): Promise<void> {
    try {
      logger.info('Enabling SSO', { licenseId });

      await prisma.enterpriseLicense.update({
        where: { id: licenseId },
        data: { ssoEnabled: true },
      });

      // Store SSO configuration
      await prisma.enterpriseCustomization.upsert({
        where: {
          licenseId_type_key: {
            licenseId,
            type: 'SSO',
            key: 'ssoConfig',
          },
        },
        update: { value: JSON.stringify(ssoConfig) },
        create: {
          licenseId,
          type: 'SSO',
          key: 'ssoConfig',
          value: JSON.stringify(ssoConfig),
          description: 'SSO configuration',
        },
      });

      logger.info('SSO enabled', { licenseId });
    } catch (error) {
      logger.error('Failed to enable SSO', { error, licenseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get SSO configuration
   */
  async getSSO(licenseId: string): Promise<any | null> {
    try {
      const custom = await prisma.enterpriseCustomization.findFirst({
        where: {
          licenseId,
          type: 'SSO',
          key: 'ssoConfig',
        },
      });

      if (!custom) {
        return null;
      }

      return JSON.parse(custom.value);
    } catch (error) {
      logger.error('Failed to get SSO config', { error, licenseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Enable API access
   */
  async enableAPI(licenseId: string, apiConfig: any): Promise<void> {
    try {
      logger.info('Enabling API access', { licenseId });

      await prisma.enterpriseLicense.update({
        where: { id: licenseId },
        data: { apiAccessEnabled: true },
      });

      // Store API configuration
      await prisma.enterpriseCustomization.upsert({
        where: {
          licenseId_type_key: {
            licenseId,
            type: 'API',
            key: 'apiConfig',
          },
        },
        update: { value: JSON.stringify(apiConfig) },
        create: {
          licenseId,
          type: 'API',
          key: 'apiConfig',
          value: JSON.stringify(apiConfig),
          description: 'API configuration',
        },
      });

      logger.info('API access enabled', { licenseId });
    } catch (error) {
      logger.error('Failed to enable API', { error, licenseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get white-label configuration
   */
  async getWhiteLabelConfig(licenseId: string): Promise<WhiteLabelConfig> {
    try {
      const license = await prisma.enterpriseLicense.findUnique({
        where: { id: licenseId },
      });

      if (!license) {
        throw new Error(`License ${licenseId} not found`);
      }

      const config: WhiteLabelConfig = {};

      if (license.customDomain) {
        config.customDomain = license.customDomain;
      }

      if (license.whiteLabel) {
        config.branding = await this.getBranding(licenseId);
      }

      if (license.ssoEnabled) {
        config.ssoConfig = await this.getSSO(licenseId);
      }

      if (license.apiAccessEnabled) {
        const apiCustom = await prisma.enterpriseCustomization.findFirst({
          where: {
            licenseId,
            type: 'API',
            key: 'apiConfig',
          },
        });
        if (apiCustom) {
          config.apiConfig = JSON.parse(apiCustom.value);
        }
      }

      return config;
    } catch (error) {
      logger.error('Failed to get white-label config', { error, licenseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get all customizations for license
   */
  async getCustomizations(licenseId: string): Promise<any[]> {
    try {
      const customizations = await prisma.enterpriseCustomization.findMany({
        where: { licenseId },
        orderBy: { type: 'asc' },
      });

      return customizations.map((c) => ({
        id: c.id,
        type: c.type,
        key: c.key,
        value: c.value,
        description: c.description,
      }));
    } catch (error) {
      logger.error('Failed to get customizations', { error, licenseId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Delete customization
   */
  async deleteCustomization(customizationId: string): Promise<void> {
    try {
      logger.info('Deleting customization', { customizationId });

      await prisma.enterpriseCustomization.delete({
        where: { id: customizationId },
      });

      logger.info('Customization deleted', { customizationId });
    } catch (error) {
      logger.error('Failed to delete customization', { error, customizationId });
      throw ErrorHandler.handle(error);
    }
  }
}

export default new WhiteLabelService();
