import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { EnterpriseLicenseService } from '../license-service';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client');

describe('EnterpriseLicenseService', () => {
  let licenseService: EnterpriseLicenseService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    licenseService = new EnterpriseLicenseService();
  });

  describe('createLicense', () => {
    it('should create a new enterprise license', async () => {
      const licenseData = {
        organizationName: 'Acme Corp',
        organizationEmail: 'admin@acme.com',
        tier: 'PROFESSIONAL' as const,
        maxUsers: 100,
        maxCourses: 50,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      };

      const mockLicense = {
        id: 'lic_123',
        licenseKey: 'LIC-ABC-123-XYZ',
        ...licenseData,
        status: 'ACTIVE',
        createdAt: new Date(),
      };

      mockPrisma.enterpriseLicense.create = jest.fn().mockResolvedValue(mockLicense);

      const result = await licenseService.createLicense(licenseData);

      expect(result.organizationName).toBe('Acme Corp');
      expect(result.status).toBe('ACTIVE');
      expect(mockPrisma.enterpriseLicense.create).toHaveBeenCalled();
    });

    it('should throw error if expiry date is before start date', async () => {
      const licenseData = {
        organizationName: 'Acme Corp',
        organizationEmail: 'admin@acme.com',
        tier: 'PROFESSIONAL' as const,
        maxUsers: 100,
        startDate: new Date(),
        expiryDate: new Date(Date.now() - 1000),
      };

      await expect(licenseService.createLicense(licenseData)).rejects.toThrow(
        'Expiry date must be after start date'
      );
    });
  });

  describe('activateLicense', () => {
    it('should activate a license with valid key', async () => {
      const licenseKey = 'LIC-ABC-123-XYZ';
      const mockLicense = {
        id: 'lic_123',
        licenseKey,
        status: 'ACTIVE',
        organizationName: 'Acme Corp',
      };

      mockPrisma.enterpriseLicense.findUnique = jest.fn().mockResolvedValue(mockLicense);
      mockPrisma.enterpriseLicense.update = jest.fn().mockResolvedValue({
        ...mockLicense,
        activatedAt: new Date(),
      });

      const result = await licenseService.activateLicense(licenseKey);

      expect(result.status).toBe('ACTIVE');
      expect(mockPrisma.enterpriseLicense.findUnique).toHaveBeenCalledWith({
        where: { licenseKey },
      });
    });

    it('should throw error if license not found', async () => {
      mockPrisma.enterpriseLicense.findUnique = jest.fn().mockResolvedValue(null);

      await expect(licenseService.activateLicense('INVALID-KEY')).rejects.toThrow(
        'License not found'
      );
    });

    it('should throw error if license is expired', async () => {
      const mockLicense = {
        id: 'lic_123',
        licenseKey: 'LIC-ABC-123-XYZ',
        status: 'EXPIRED',
        expiryDate: new Date(Date.now() - 1000),
      };

      mockPrisma.enterpriseLicense.findUnique = jest.fn().mockResolvedValue(mockLicense);

      await expect(licenseService.activateLicense('LIC-ABC-123-XYZ')).rejects.toThrow(
        'License has expired'
      );
    });
  });

  describe('checkLicenseValidity', () => {
    it('should return true for valid active license', async () => {
      const licenseKey = 'LIC-ABC-123-XYZ';
      const mockLicense = {
        licenseKey,
        status: 'ACTIVE',
        expiryDate: new Date(Date.now() + 1000),
      };

      mockPrisma.enterpriseLicense.findUnique = jest.fn().mockResolvedValue(mockLicense);

      const result = await licenseService.checkLicenseValidity(licenseKey);

      expect(result).toBe(true);
    });

    it('should return false for expired license', async () => {
      const licenseKey = 'LIC-ABC-123-XYZ';
      const mockLicense = {
        licenseKey,
        status: 'ACTIVE',
        expiryDate: new Date(Date.now() - 1000),
      };

      mockPrisma.enterpriseLicense.findUnique = jest.fn().mockResolvedValue(mockLicense);

      const result = await licenseService.checkLicenseValidity(licenseKey);

      expect(result).toBe(false);
    });

    it('should return false if license not found', async () => {
      mockPrisma.enterpriseLicense.findUnique = jest.fn().mockResolvedValue(null);

      const result = await licenseService.checkLicenseValidity('INVALID-KEY');

      expect(result).toBe(false);
    });
  });

  describe('getLicenseUsage', () => {
    it('should retrieve license usage statistics', async () => {
      const licenseId = 'lic_123';
      const mockUsage = {
        licenseId,
        activeUsers: 45,
        maxUsers: 100,
        coursesCreated: 12,
        maxCourses: 50,
        apiCallsThisMonth: 5000,
        maxApiCalls: 10000,
      };

      mockPrisma.enterpriseLicense.findUnique = jest.fn().mockResolvedValue(mockUsage);

      const result = await licenseService.getLicenseUsage(licenseId);

      expect(result.activeUsers).toBe(45);
      expect(result.coursesCreated).toBe(12);
    });
  });

  describe('renewLicense', () => {
    it('should renew an expiring license', async () => {
      const licenseId = 'lic_123';
      const newExpiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      const mockRenewedLicense = {
        id: licenseId,
        status: 'ACTIVE',
        expiryDate: newExpiryDate,
        renewedAt: new Date(),
      };

      mockPrisma.enterpriseLicense.update = jest.fn().mockResolvedValue(mockRenewedLicense);

      const result = await licenseService.renewLicense(licenseId, newExpiryDate);

      expect(result.status).toBe('ACTIVE');
      expect(mockPrisma.enterpriseLicense.update).toHaveBeenCalled();
    });
  });
});
