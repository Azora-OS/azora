/**
 * AZORA OS - Unified Video Platform Integration Service
 *
 * Provides comprehensive integration with multiple video platforms including:
 * - YouTube (Learning, Tutorials, Educational Content)
 * - Microsoft Learn (Training, Certifications)
 * - Google Cloud Training (Certifications, Courses)
 * - Other educational platforms
 *
 * This service enables Azora OS to host and integrate video content from multiple platforms
 * with a unified interface for learning and education.
 */

import { EventEmitter } from 'events';
import { elaraIntegration } from './elara-integration-service';
import {
  GoogleCloudIntegrationService,
  defaultGoogleCloudConfig,
} from './google-cloud-integration-service';
import {
  Microsoft365IntegrationService,
  defaultMicrosoft365Config,
} from './microsoft365-integration-service';

export interface VideoPlatformConfig {
  youtube?: {
    apiKey: string;
    channelId?: string;
    playlistId?: string;
  };
  microsoftLearn?: {
    tenantId: string;
    clientId: string;
    clientSecret: string;
  };
  googleCloudTraining?: {
    projectId: string;
    credentials?: {
      client_email: string;
      private_key: string;
    };
  };
  otherPlatforms?: Record<string, unknown>;
}

export interface VideoContent {
  id: string;
  platform: 'youtube' | 'microsoft' | 'google' | 'other';
  title: string;
  description: string;
  duration: string;
  thumbnailUrl: string;
  url: string;
  embedUrl: string;
  publishDate: string;
  viewCount?: number;
  likeCount?: number;
  category: string;
  tags: string[];
  author: string;
  authorUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  azrReward?: number;
  contentType:
    | 'tutorial'
    | 'lecture'
    | 'demo'
    | 'course'
    | 'certification'
    | 'other';
}

export interface VideoProgress {
  userId: string;
  videoId: string;
  platform: string;
  progress: number; // 0-100%
  completed: boolean;
  completionDate?: Date;
  quizScore?: number;
  notes?: string;
}

export class UnifiedVideoPlatformService extends EventEmitter {
  private config: VideoPlatformConfig;
  private googleCloudService?: GoogleCloudIntegrationService;
  private microsoftService?: Microsoft365IntegrationService;
  private videoContent: Map<string, VideoContent> = new Map();
  private userProgress: Map<string, VideoProgress[]> = new Map();

  constructor(config: VideoPlatformConfig) {
    super();
    this.config = config;
    this.initializeServices();
    this.loadSampleContent();
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize Google Cloud service if configured
      if (this.config.googleCloudTraining) {
        const googleConfig = {
          ...defaultGoogleCloudConfig,
          projectId: this.config.googleCloudTraining.projectId,
          credentials: this.config.googleCloudTraining.credentials,
        };
        this.googleCloudService = new GoogleCloudIntegrationService(
          googleConfig
        );
      }

      // Initialize Microsoft service if configured
      if (this.config.microsoftLearn) {
        const microsoftConfig = {
          ...defaultMicrosoft365Config,
          tenantId: this.config.microsoftLearn.tenantId,
          clientId: this.config.microsoftLearn.clientId,
          clientSecret: this.config.microsoftLearn.clientSecret,
        };
        this.microsoftService = new Microsoft365IntegrationService(
          microsoftConfig
        );
      }

      console.log('✅ Unified Video Platform Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize video platform services:', error);
      throw error;
    }
  }

  /**
   * Load sample video content for demonstration
   */
  private loadSampleContent(): void {
    const sampleContent: VideoContent[] = [
      {
        id: 'yt-sample-001',
        platform: 'youtube',
        title: 'Introduction to Azora OS Quantum Architecture',
        description:
          'Learn about the revolutionary quantum-secure architecture of Azora OS and how it protects your data.',
        duration: '15:30',
        thumbnailUrl: '/branding/videos/azora-os-brand-video.html',
        url: 'https://www.youtube.com/watch?v=sample1',
        embedUrl: 'https://www.youtube.com/embed/sample1',
        publishDate: '2025-01-15',
        viewCount: 12500,
        likeCount: 890,
        category: 'Technology',
        tags: ['quantum', 'security', 'architecture', 'introduction'],
        author: 'Azora OS Team',
        difficulty: 'beginner',
        azrReward: 5,
        contentType: 'tutorial',
      },
      {
        id: 'ms-sample-001',
        platform: 'microsoft',
        title: 'Microsoft Azure Fundamentals for Azora Developers',
        description:
          'Master Azure integration with Azora OS for scalable cloud deployments.',
        duration: '42:15',
        thumbnailUrl: '/branding/videos/elara-ai-video.html',
        url: 'https://learn.microsoft.com/sample1',
        embedUrl: 'https://learn.microsoft.com/embed/sample1',
        publishDate: '2025-02-20',
        viewCount: 8700,
        likeCount: 620,
        category: 'Cloud Computing',
        tags: ['azure', 'cloud', 'integration', 'microsoft'],
        author: 'Microsoft Learn',
        difficulty: 'intermediate',
        azrReward: 10,
        contentType: 'course',
      },
      {
        id: 'gc-sample-001',
        platform: 'google',
        title: 'Google Cloud AI Integration with Azora OS',
        description:
          'Learn how to leverage Google Cloud AI services within the Azora OS ecosystem.',
        duration: '35:45',
        thumbnailUrl: '/branding/videos/what-is-azora-os-video.html',
        url: 'https://cloud.google.com/training/sample1',
        embedUrl: 'https://cloud.google.com/training/embed/sample1',
        publishDate: '2025-03-10',
        viewCount: 9200,
        likeCount: 750,
        category: 'Artificial Intelligence',
        tags: ['ai', 'google cloud', 'machine learning', 'vertex ai'],
        author: 'Google Cloud Training',
        difficulty: 'advanced',
        azrReward: 15,
        contentType: 'certification',
      },
    ];

    sampleContent.forEach(content => {
      this.videoContent.set(content.id, content);
    });
  }

  /**
   * Fetch YouTube videos using YouTube Data API
   */
  async fetchYouTubeVideos(): Promise<VideoContent[]> {
    try {
      if (!this.config.youtube?.apiKey) {
        throw new Error('YouTube API key not configured');
      }

      // In a real implementation, this would call the YouTube Data API
      // For now, we'll return mock data
      const mockVideos: VideoContent[] = [
        {
          id: 'yt-real-001',
          platform: 'youtube',
          title: 'Building Quantum Applications with Azora OS',
          description:
            'Step-by-step guide to creating quantum-secure applications.',
          duration: '28:42',
          thumbnailUrl: '',
          url: 'https://www.youtube.com/watch?v=real1',
          embedUrl: 'https://www.youtube.com/embed/real1',
          publishDate: '2025-04-01',
          viewCount: 15600,
          likeCount: 1200,
          category: 'Development',
          tags: ['quantum', 'development', 'tutorial'],
          author: 'Azora OS Developers',
          difficulty: 'intermediate',
          azrReward: 8,
          contentType: 'tutorial',
        },
      ];

      // Add to our content library
      mockVideos.forEach(video => {
        this.videoContent.set(video.id, video);
      });

      return mockVideos;
    } catch (error) {
      console.error('Failed to fetch YouTube videos:', error);
      throw error;
    }
  }

  async fetchMicrosoftLearnContent(): Promise<VideoContent[]> {
    try {
      if (!this.microsoftService) {
        throw new Error('Microsoft service not initialized');
      }

      // In a real implementation, this would call Microsoft Learn APIs
      // For now, we'll return mock data
      const mockContent: VideoContent[] = [
        {
          id: 'ms-real-001',
          platform: 'microsoft',
          title: 'Advanced Azora OS Integration with Microsoft 365',
          description:
            'Deep dive into integrating Azora OS with Microsoft productivity tools.',
          duration: '55:20',
          thumbnailUrl: '',
          url: 'https://learn.microsoft.com/advanced-azora',
          embedUrl: 'https://learn.microsoft.com/embed/advanced-azora',
          publishDate: '2025-04-05',
          viewCount: 7800,
          likeCount: 540,
          category: 'Productivity',
          tags: ['microsoft 365', 'integration', 'productivity'],
          author: 'Microsoft Learn',
          difficulty: 'advanced',
          azrReward: 12,
          contentType: 'course',
        },
      ];

      // Add to our content library
      mockContent.forEach(content => {
        this.videoContent.set(content.id, content);
      });

      return mockContent;
    } catch (error) {
      console.error('Failed to fetch Microsoft Learn content:', error);
      throw error;
    }
  }

  async fetchGoogleCloudTrainingContent(): Promise<VideoContent[]> {
    try {
      if (!this.googleCloudService) {
        throw new Error('Google Cloud service not initialized');
      }

      // In a real implementation, this would call Google Cloud Training APIs
      // For now, we'll return mock data
      const mockContent: VideoContent[] = [
        {
          id: 'gc-real-001',
          platform: 'google',
          title: 'Deploying Azora OS on Google Kubernetes Engine',
          description:
            'Learn how to deploy and scale Azora OS applications on GKE.',
          duration: '48:15',
          thumbnailUrl: '',
          url: 'https://cloud.google.com/training/gke-azora',
          embedUrl: 'https://cloud.google.com/training/embed/gke-azora',
          publishDate: '2025-04-10',
          viewCount: 6500,
          likeCount: 480,
          category: 'Cloud Infrastructure',
          tags: ['gke', 'kubernetes', 'deployment', 'scaling'],
          author: 'Google Cloud Training',
          difficulty: 'expert',
          azrReward: 18,
          contentType: 'certification',
        },
      ];

      // Add to our content library
      mockContent.forEach(content => {
        this.videoContent.set(content.id, content);
      });

      return mockContent;
    } catch (error) {
      console.error('Failed to fetch Google Cloud Training content:', error);
      throw error;
    }
  }

  /**
   * Get all available video content
   */
  getAllContent(filters?: {
    platform?: string;
    category?: string;
    difficulty?: string;
    contentType?: string;
    search?: string;
  }): VideoContent[] {
    let content = Array.from(this.videoContent.values());

    if (filters) {
      if (filters.platform) {
        content = content.filter(c => c.platform === filters.platform);
      }
      if (filters.category) {
        content = content.filter(c => c.category === filters.category);
      }
      if (filters.difficulty) {
        content = content.filter(c => c.difficulty === filters.difficulty);
      }
      if (filters.contentType) {
        content = content.filter(c => c.contentType === filters.contentType);
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        content = content.filter(
          c =>
            c.title.toLowerCase().includes(searchTerm) ||
            c.description.toLowerCase().includes(searchTerm) ||
            c.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
    }

    return content;
  }

  /**
   * Get video content by ID
   */
  getContentById(id: string): VideoContent | undefined {
    return this.videoContent.get(id);
  }

  /**
   * Track user progress for a video
   */
  async trackProgress(progress: VideoProgress): Promise<void> {
    try {
      const userProgress = this.userProgress.get(progress.userId) || [];
      const existingIndex = userProgress.findIndex(
        p => p.videoId === progress.videoId && p.platform === progress.platform
      );

      if (existingIndex >= 0) {
        userProgress[existingIndex] = progress;
      } else {
        userProgress.push(progress);
      }

      this.userProgress.set(progress.userId, userProgress);

      // Emit event for progress tracking
      this.emit('progress-updated', progress);

      // Log event to Elara for AI analysis
      elaraIntegration.logEvent({
        type: 'video-progress-updated',
        data: {
          userId: progress.userId,
          videoId: progress.videoId,
          platform: progress.platform,
          progress: progress.progress,
          completed: progress.completed,
        },
        userId: progress.userId,
      });

      console.log(
        `✅ Progress tracked for user ${progress.userId} on ${progress.platform} video ${progress.videoId}`
      );
    } catch (error) {
      console.error('Failed to track progress:', error);
      throw error;
    }
  }

  /**
   * Get user progress for all videos
   */
  getUserProgress(userId: string): VideoProgress[] {
    return this.userProgress.get(userId) || [];
  }

  /**
   * Get user progress for specific video
   */
  getUserVideoProgress(
    userId: string,
    videoId: string
  ): VideoProgress | undefined {
    const userProgress = this.userProgress.get(userId) || [];
    return userProgress.find(p => p.videoId === videoId);
  }

  /**
   * Recommend videos based on user progress and interests
   */
  getRecommendations(userId: string, limit: number = 10): VideoContent[] {
    try {
      const userProgress = this.getUserProgress(userId);
      const completedVideos = userProgress
        .filter(p => p.completed)
        .map(p => p.videoId);

      // Get all content not yet completed
      const recommendations = Array.from(this.videoContent.values())
        .filter(content => !completedVideos.includes(content.id))
        .slice(0, limit);

      // Log recommendation event to Elara
      elaraIntegration.logEvent({
        type: 'video-recommendations-generated',
        data: {
          userId,
          recommendationCount: recommendations.length,
          completedVideoCount: completedVideos.length,
        },
        userId,
      });

      return recommendations;
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      return [];
    }
  }

  /**
   * Sync content with external platforms
   */
  async syncContent(): Promise<void> {
    try {
      // Fetch content from all configured platforms
      const promises: Promise<VideoContent[]>[] = [];

      if (this.config.youtube) {
        promises.push(this.fetchYouTubeVideos());
      }

      if (this.microsoftService) {
        promises.push(this.fetchMicrosoftLearnContent());
      }

      if (this.googleCloudService) {
        promises.push(this.fetchGoogleCloudTrainingContent());
      }

      // Wait for all content to be fetched
      const results = await Promise.all(promises);

      // Flatten results and update content library
      const allContent = results.flat();
      allContent.forEach(content => {
        this.videoContent.set(content.id, content);
      });

      console.log(
        `✅ Synced ${allContent.length} videos from external platforms`
      );
      this.emit('content-synced', allContent.length);

      // Log sync event to Elara
      elaraIntegration.logEvent({
        type: 'video-content-synced',
        data: {
          platformCount: results.length,
          contentCount: allContent.length,
        },
      });
    } catch (error) {
      console.error('Failed to sync content:', error);
      throw error;
    }
  }

  /**
   * Generate embed code for video content
   */
  generateEmbedCode(
    videoId: string,
    options?: {
      width?: number;
      height?: number;
      autoplay?: boolean;
      controls?: boolean;
    }
  ): string {
    const content = this.videoContent.get(videoId);
    if (!content) {
      throw new Error(`Video content not found: ${videoId}`);
    }

    const width = options?.width || 560;
    const height = options?.height || 315;
    const autoplay = options?.autoplay ? 1 : 0;
    const controls = options?.controls !== false ? 1 : 0; // Default to true

    // Generate platform-specific embed code
    switch (content.platform) {
      case 'youtube':
        return `<iframe width="${width}" height="${height}" src="${content.embedUrl}?autoplay=${autoplay}&controls=${controls}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

      case 'microsoft':
        return `<iframe width="${width}" height="${height}" src="${content.embedUrl}" frameborder="0" allowfullscreen></iframe>`;

      case 'google':
        return `<iframe width="${width}" height="${height}" src="${content.embedUrl}" frameborder="0" allowfullscreen></iframe>`;

      default:
        return `<iframe width="${width}" height="${height}" src="${content.embedUrl}" frameborder="0" allowfullscreen></iframe>`;
    }
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<Record<string, unknown>> {
    return {
      service: 'Unified Video Platform Service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      platforms: {
        youtube: !!this.config.youtube,
        microsoft: !!this.microsoftService,
        googleCloud: !!this.googleCloudService,
      },
      contentCount: this.videoContent.size,
      userCount: this.userProgress.size,
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.googleCloudService) {
      await this.googleCloudService.cleanup();
    }
    if (this.microsoftService) {
      await this.microsoftService.cleanup();
    }

    // Log cleanup event to Elara
    elaraIntegration.logEvent({
      type: 'video-platform-cleanup',
      data: {
        timestamp: new Date().toISOString(),
      },
    });

    console.log('Unified Video Platform Service cleanup completed');
  }
}

// Export default configuration
export const defaultVideoPlatformConfig: VideoPlatformConfig = {
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || '',
    channelId: process.env.YOUTUBE_CHANNEL_ID,
    playlistId: process.env.YOUTUBE_PLAYLIST_ID,
  },
  microsoftLearn: process.env.MICROSOFT_LEARN_ENABLED
    ? {
        tenantId: process.env.MICROSOFT365_TENANT_ID || '',
        clientId: process.env.MICROSOFT365_CLIENT_ID || '',
        clientSecret: process.env.MICROSOFT365_CLIENT_SECRET || '',
      }
    : undefined,
  googleCloudTraining: process.env.GOOGLE_CLOUD_TRAINING_ENABLED
    ? {
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
        credentials: process.env.GOOGLE_CLOUD_CREDENTIALS
          ? JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS)
          : undefined,
      }
    : undefined,
};

// Factory function to create unified video platform service
export function createUnifiedVideoPlatformService(
  config?: Partial<VideoPlatformConfig>
): UnifiedVideoPlatformService {
  const finalConfig = { ...defaultVideoPlatformConfig, ...config };
  return new UnifiedVideoPlatformService(finalConfig);
}
