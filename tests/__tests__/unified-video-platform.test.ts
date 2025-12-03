/**
 * AZORA OS - Unified Video Platform Service Tests
 */

import {
  UnifiedVideoPlatformService,
  defaultVideoPlatformConfig,
} from '../services/unified-video-platform';

describe('UnifiedVideoPlatformService', () => {
  let service: UnifiedVideoPlatformService;

  beforeEach(() => {
    service = new UnifiedVideoPlatformService(defaultVideoPlatformConfig);
  });

  afterEach(async () => {
    await service.cleanup();
  });

  describe('Initialization', () => {
    it('should initialize successfully', () => {
      expect(service).toBeDefined();
    });

    it('should load sample content', () => {
      const content = service.getAllContent();
      expect(content.length).toBeGreaterThan(0);
    });
  });

  describe('Content Management', () => {
    it('should get all content', () => {
      const content = service.getAllContent();
      expect(Array.isArray(content)).toBe(true);
    });

    it('should get content by ID', () => {
      const content = service.getAllContent();
      if (content.length > 0) {
        const firstContent = content[0];
        const retrievedContent = service.getContentById(firstContent.id);
        expect(retrievedContent).toBeDefined();
        expect(retrievedContent?.id).toBe(firstContent.id);
      }
    });

    it('should filter content by platform', () => {
      const youtubeContent = service.getAllContent({ platform: 'youtube' });
      youtubeContent.forEach(content => {
        expect(content.platform).toBe('youtube');
      });
    });

    it('should filter content by category', () => {
      const techContent = service.getAllContent({ category: 'Technology' });
      techContent.forEach(content => {
        expect(content.category).toBe('Technology');
      });
    });
  });

  describe('User Progress', () => {
    const userId = 'test-user';
    const videoId = 'yt-sample-001';

    it('should track user progress', async () => {
      const progress = {
        videoId,
        platform: 'youtube',
        progress: 50,
        completed: false,
      };

      await service.trackProgress({ userId, ...progress });
      const userProgress = service.getUserProgress(userId);

      expect(userProgress.length).toBe(1);
      expect(userProgress[0].videoId).toBe(videoId);
      expect(userProgress[0].progress).toBe(50);
    });

    it('should get user progress', () => {
      const userProgress = service.getUserProgress(userId);
      expect(Array.isArray(userProgress)).toBe(true);
    });

    it('should get user video progress', () => {
      const videoProgress = service.getUserVideoProgress(userId, videoId);
      expect(videoProgress).toBeDefined();
      expect(videoProgress?.videoId).toBe(videoId);
    });
  });

  describe('Recommendations', () => {
    it('should generate recommendations', () => {
      const recommendations = service.getRecommendations('test-user');
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('Health Status', () => {
    it('should return health status', async () => {
      const health = await service.getHealthStatus();
      expect(health).toBeDefined();
      expect(health.service).toBe('Unified Video Platform Service');
      expect(health.status).toBe('healthy');
    });
  });
});
