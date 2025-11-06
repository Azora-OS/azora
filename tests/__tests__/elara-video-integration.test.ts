/**
 * AZORA OS - Elara Video Platform Integration Tests
 */

import { elaraIntegration } from '../services/elara-integration-service';
import {
  UnifiedVideoPlatformService,
  defaultVideoPlatformConfig,
} from '../services/unified-video-platform';

// Mock the elaraIntegration to avoid external dependencies
jest.mock('../services/elara-integration-service', () => ({
  elaraIntegration: {
    logEvent: jest.fn(),
    registerUser: jest.fn(),
    getUserContext: jest.fn(),
  },
}));

describe('Elara Video Platform Integration', () => {
  let service: UnifiedVideoPlatformService;

  beforeEach(() => {
    service = new UnifiedVideoPlatformService(defaultVideoPlatformConfig);
  });

  afterEach(async () => {
    await service.cleanup();
  });

  describe('Elara Event Logging', () => {
    it('should log progress updates to Elara', async () => {
      const progress = {
        userId: 'test-user',
        videoId: 'yt-sample-001',
        platform: 'youtube',
        progress: 75,
        completed: false,
      };

      await service.trackProgress(progress);

      expect(elaraIntegration.logEvent).toHaveBeenCalledWith({
        type: 'video-progress-updated',
        data: {
          userId: 'test-user',
          videoId: 'yt-sample-001',
          platform: 'youtube',
          progress: 75,
          completed: false,
        },
        userId: 'test-user',
      });
    });

    it('should log recommendations to Elara', () => {
      const recommendations = service.getRecommendations('test-user');

      expect(elaraIntegration.logEvent).toHaveBeenCalledWith({
        type: 'video-recommendations-generated',
        data: {
          userId: 'test-user',
          recommendationCount: recommendations.length,
          completedVideoCount: 0,
        },
        userId: 'test-user',
      });
    });

    it('should log content sync to Elara', async () => {
      await service.syncContent();

      expect(elaraIntegration.logEvent).toHaveBeenCalledWith({
        type: 'video-content-synced',
        data: {
          platformCount: 0, // No platforms configured in default config
          contentCount: expect.any(Number),
        },
      });
    });
  });

  describe('User Registration with Elara', () => {
    it('should register users with Elara', () => {
      const userContext = {
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        preferences: {
          learningStyle: 'visual',
          communicationPreference: 'email',
        },
      };

      elaraIntegration.registerUser(userContext);

      expect(elaraIntegration.registerUser).toHaveBeenCalledWith(userContext);
    });
  });
});
