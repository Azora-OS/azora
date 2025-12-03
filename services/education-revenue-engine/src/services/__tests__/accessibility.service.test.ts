import { accessibilityService } from '../accessibility.service';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    user: {
      findUnique: jest.fn(),
    },
  })),
}));

describe('AccessibilityService', () => {
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient();
  });

  describe('getAccessibilitySettings', () => {
    it('should return accessibility settings for user', async () => {
      const mockUser = {
        id: 'user-1',
        language: 'en',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const settings = await accessibilityService.getAccessibilitySettings('user-1');

      expect(settings).toHaveProperty('userId', 'user-1');
      expect(settings).toHaveProperty('captions');
      expect(settings).toHaveProperty('transcripts');
      expect(settings).toHaveProperty('screenReaderMode');
      expect(settings).toHaveProperty('keyboardNavigation');
      expect(settings).toHaveProperty('highContrast');
      expect(settings).toHaveProperty('fontSize');
      expect(settings).toHaveProperty('language');
    });

    it('should throw error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(accessibilityService.getAccessibilitySettings('invalid-id')).rejects.toThrow(
        'User not found'
      );
    });

    it('should use user language preference', async () => {
      const mockUser = {
        id: 'user-1',
        language: 'es',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const settings = await accessibilityService.getAccessibilitySettings('user-1');

      expect(settings.language).toBe('es');
    });
  });

  describe('updateAccessibilitySettings', () => {
    it('should update accessibility settings', async () => {
      const mockUser = {
        id: 'user-1',
        language: 'en',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const updatedSettings = await accessibilityService.updateAccessibilitySettings('user-1', {
        captions: true,
        screenReaderMode: true,
      });

      expect(updatedSettings.captions).toBe(true);
      expect(updatedSettings.screenReaderMode).toBe(true);
    });

    it('should throw error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        accessibilityService.updateAccessibilitySettings('invalid-id', { captions: true })
      ).rejects.toThrow('User not found');
    });
  });

  describe('generateCaptions', () => {
    it('should generate captions for video', async () => {
      const captions = await accessibilityService.generateCaptions('video-1', 'en');

      expect(typeof captions).toBe('string');
      expect(captions.length).toBeGreaterThan(0);
      expect(captions).toContain('[00:00:00]');
    });

    it('should support multiple languages', async () => {
      const captionsES = await accessibilityService.generateCaptions('video-1', 'es');
      const captionsFR = await accessibilityService.generateCaptions('video-1', 'fr');

      expect(captionsES).toBeDefined();
      expect(captionsFR).toBeDefined();
    });
  });

  describe('generateTranscript', () => {
    it('should generate transcript for video', async () => {
      const transcript = await accessibilityService.generateTranscript('video-1', 'en');

      expect(typeof transcript).toBe('string');
      expect(transcript.length).toBeGreaterThan(0);
    });

    it('should support multiple languages', async () => {
      const transcriptES = await accessibilityService.generateTranscript('video-1', 'es');
      const transcriptFR = await accessibilityService.generateTranscript('video-1', 'fr');

      expect(transcriptES).toBeDefined();
      expect(transcriptFR).toBeDefined();
    });
  });

  describe('getAvailableFeatures', () => {
    it('should return list of accessibility features', () => {
      const features = accessibilityService.getAvailableFeatures();

      expect(Array.isArray(features)).toBe(true);
      expect(features.length).toBeGreaterThan(0);
    });

    it('should include captions feature', () => {
      const features = accessibilityService.getAvailableFeatures();
      const captionsFeature = features.find((f) => f.id === 'captions');

      expect(captionsFeature).toBeDefined();
      expect(captionsFeature?.enabled).toBe(true);
    });

    it('should include screen reader feature', () => {
      const features = accessibilityService.getAvailableFeatures();
      const screenReaderFeature = features.find((f) => f.id === 'screen-reader');

      expect(screenReaderFeature).toBeDefined();
      expect(screenReaderFeature?.enabled).toBe(true);
    });

    it('should include keyboard navigation feature', () => {
      const features = accessibilityService.getAvailableFeatures();
      const keyboardNavFeature = features.find((f) => f.id === 'keyboard-nav');

      expect(keyboardNavFeature).toBeDefined();
      expect(keyboardNavFeature?.enabled).toBe(true);
    });
  });

  describe('trackAccessibilityUsage', () => {
    it('should track accessibility feature usage', async () => {
      await expect(
        accessibilityService.trackAccessibilityUsage('user-1', 'captions', 300)
      ).resolves.not.toThrow();
    });
  });

  describe('validateAccessibilityCompliance', () => {
    it('should validate accessibility compliance', async () => {
      const compliance = await accessibilityService.validateAccessibilityCompliance('content-1');

      expect(compliance).toHaveProperty('compliant');
      expect(compliance).toHaveProperty('issues');
      expect(compliance).toHaveProperty('score');
      expect(typeof compliance.score).toBe('number');
      expect(compliance.score).toBeGreaterThanOrEqual(0);
      expect(compliance.score).toBeLessThanOrEqual(100);
    });

    it('should return issues array', async () => {
      const compliance = await accessibilityService.validateAccessibilityCompliance('content-1');

      expect(Array.isArray(compliance.issues)).toBe(true);
    });
  });

  describe('getAccessibilityReport', () => {
    it('should generate accessibility report for course', async () => {
      const report = await accessibilityService.getAccessibilityReport('course-1');

      expect(report).toHaveProperty('courseId', 'course-1');
      expect(report).toHaveProperty('overallScore');
      expect(report).toHaveProperty('compliant');
      expect(report).toHaveProperty('features');
      expect(report).toHaveProperty('recommendations');
    });

    it('should include feature compliance status', async () => {
      const report = await accessibilityService.getAccessibilityReport('course-1');

      expect(report.features).toHaveProperty('captions');
      expect(report.features).toHaveProperty('transcripts');
      expect(report.features).toHaveProperty('altText');
      expect(report.features).toHaveProperty('keyboardNavigation');
      expect(report.features).toHaveProperty('colorContrast');
    });

    it('should provide recommendations', async () => {
      const report = await accessibilityService.getAccessibilityReport('course-1');

      expect(Array.isArray(report.recommendations)).toBe(true);
    });
  });

  describe('Accessibility features', () => {
    it('should support captions', () => {
      const features = accessibilityService.getAvailableFeatures();
      const captions = features.find((f) => f.id === 'captions');

      expect(captions).toBeDefined();
      expect(captions?.name).toBe('Captions');
    });

    it('should support transcripts', () => {
      const features = accessibilityService.getAvailableFeatures();
      const transcripts = features.find((f) => f.id === 'transcripts');

      expect(transcripts).toBeDefined();
      expect(transcripts?.name).toBe('Transcripts');
    });

    it('should support screen reader mode', () => {
      const features = accessibilityService.getAvailableFeatures();
      const screenReader = features.find((f) => f.id === 'screen-reader');

      expect(screenReader).toBeDefined();
      expect(screenReader?.name).toBe('Screen Reader Mode');
    });

    it('should support keyboard navigation', () => {
      const features = accessibilityService.getAvailableFeatures();
      const keyboardNav = features.find((f) => f.id === 'keyboard-nav');

      expect(keyboardNav).toBeDefined();
      expect(keyboardNav?.name).toBe('Keyboard Navigation');
    });

    it('should support high contrast mode', () => {
      const features = accessibilityService.getAvailableFeatures();
      const highContrast = features.find((f) => f.id === 'high-contrast');

      expect(highContrast).toBeDefined();
      expect(highContrast?.name).toBe('High Contrast Mode');
    });

    it('should support adjustable font size', () => {
      const features = accessibilityService.getAvailableFeatures();
      const fontSize = features.find((f) => f.id === 'font-size');

      expect(fontSize).toBeDefined();
      expect(fontSize?.name).toBe('Adjustable Font Size');
    });
  });
});
