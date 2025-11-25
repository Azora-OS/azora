import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

export interface Avatar {
  avatar_id: string;
  avatar_name: string;
  gender: string;
  preview_image_url?: string;
  preview_video_url?: string;
}

export interface VideoGenerationOptions {
  avatarId: string;
  script: string;
  audioUrl?: string;
  title?: string;
  background?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

export interface SlideVideoOptions {
  avatarId: string;
  slides: Slide[];
  audioUrl?: string;
  transitionDuration?: number; // in seconds
}

export interface Slide {
  title: string;
  content: string[];
  duration: number; // in seconds
  backgroundImage?: string;
}

export interface VideoGenerationResult {
  videoId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  error?: string;
}

export interface VideoPreview {
  previewUrl: string;
  thumbnailUrl: string;
  duration: number;
}

export class VideoGenerationService {
  private apiKey: string;
  private baseUrl: string = 'https://api.heygen.com/v1';
  private outputDir: string;

  constructor(apiKey: string, outputDir: string = './video-output') {
    this.apiKey = apiKey;
    this.outputDir = outputDir;
    this.ensureOutputDir();
  }

  /**
   * Get available avatars from HeyGen
   */
  async getAvatars(): Promise<Avatar[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/avatars`, {
        headers: {
          'X-Api-Key': this.apiKey,
        },
      });

      return response.data.avatars.map((avatar: any) => ({
        avatar_id: avatar.avatar_id,
        avatar_name: avatar.avatar_name,
        gender: avatar.gender,
        preview_image_url: avatar.preview_image_url,
        preview_video_url: avatar.preview_video_url,
      }));
    } catch (error) {
      console.error('Failed to fetch avatars:', error);
      return this.getDefaultAvatars();
    }
  }

  /**
   * Generate video from script and audio
   */
  async generateVideo(options: VideoGenerationOptions): Promise<VideoGenerationResult> {
    const {
      avatarId,
      script,
      audioUrl,
      title = 'Generated Video',
      background = '#ffffff',
      aspectRatio = '16:9',
    } = options;

    try {
      const response = await axios.post(
        `${this.baseUrl}/video/generate`,
        {
          video_inputs: [
            {
              character: {
                type: 'avatar',
                avatar_id: avatarId,
                avatar_style: 'normal',
              },
              voice: audioUrl
                ? {
                    type: 'audio',
                    audio_url: audioUrl,
                  }
                : {
                    type: 'text',
                    input_text: script,
                  },
              background: {
                type: 'color',
                value: background,
              },
            },
          ],
          dimension: {
            width: aspectRatio === '16:9' ? 1920 : aspectRatio === '9:16' ? 1080 : 1080,
            height: aspectRatio === '16:9' ? 1080 : aspectRatio === '9:16' ? 1920 : 1080,
          },
          aspect_ratio: aspectRatio,
          test: false,
          title,
        },
        {
          headers: {
            'X-Api-Key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        videoId: response.data.video_id,
        status: 'processing',
      };
    } catch (error: any) {
      console.error('Failed to generate video:', error.response?.data || error.message);
      throw new Error(`Video generation failed: ${error.message}`);
    }
  }

  /**
   * Generate slide-based video
   */
  async generateSlideVideo(options: SlideVideoOptions): Promise<VideoGenerationResult> {
    const { avatarId, slides, audioUrl, transitionDuration = 1 } = options;

    // Combine all slide content into a script
    const fullScript = slides
      .map(slide => {
        const slideText = [slide.title, ...slide.content].join('. ');
        return slideText;
      })
      .join(' ');

    // For now, generate a simple video with the full script
    // In a real implementation, you would create multiple scenes with transitions
    return this.generateVideo({
      avatarId,
      script: fullScript,
      audioUrl,
      title: 'Slide Presentation',
    });
  }

  /**
   * Check video generation status
   */
  async checkVideoStatus(videoId: string): Promise<VideoGenerationResult> {
    try {
      const response = await axios.get(`${this.baseUrl}/video/${videoId}`, {
        headers: {
          'X-Api-Key': this.apiKey,
        },
      });

      const data = response.data;
      
      return {
        videoId,
        status: data.status,
        videoUrl: data.video_url,
        thumbnailUrl: data.thumbnail_url,
        duration: data.duration,
        error: data.error,
      };
    } catch (error: any) {
      console.error('Failed to check video status:', error.response?.data || error.message);
      throw new Error(`Status check failed: ${error.message}`);
    }
  }

  /**
   * Wait for video to complete
   */
  async waitForVideo(
    videoId: string,
    maxWaitTime: number = 300000, // 5 minutes
    pollInterval: number = 5000 // 5 seconds
  ): Promise<VideoGenerationResult> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const result = await this.checkVideoStatus(videoId);

      if (result.status === 'completed') {
        return result;
      }

      if (result.status === 'failed') {
        throw new Error(`Video generation failed: ${result.error}`);
      }

      // Wait before polling again
      await this.sleep(pollInterval);
    }

    throw new Error('Video generation timed out');
  }

  /**
   * Download video to local storage
   */
  async downloadVideo(videoUrl: string, filename: string): Promise<string> {
    try {
      const response = await axios.get(videoUrl, {
        responseType: 'arraybuffer',
      });

      const videoPath = path.join(this.outputDir, `${filename}.mp4`);
      fs.writeFileSync(videoPath, Buffer.from(response.data));

      return videoPath;
    } catch (error) {
      console.error('Failed to download video:', error);
      throw new Error('Video download failed');
    }
  }

  /**
   * Generate video from lesson content
   */
  async generateLessonVideo(
    lessonTitle: string,
    script: string,
    audioUrl: string,
    avatarId: string
  ): Promise<VideoGenerationResult> {
    const result = await this.generateVideo({
      avatarId,
      script,
      audioUrl,
      title: lessonTitle,
      aspectRatio: '16:9',
    });

    // Wait for video to complete
    const completedVideo = await this.waitForVideo(result.videoId);

    // Download video
    if (completedVideo.videoUrl) {
      const localPath = await this.downloadVideo(
        completedVideo.videoUrl,
        this.sanitizeFilename(lessonTitle)
      );
      
      return {
        ...completedVideo,
        videoUrl: localPath,
      };
    }

    return completedVideo;
  }

  /**
   * Generate multiple videos for a course
   */
  async generateCourseVideos(
    lessons: Array<{
      title: string;
      script: string;
      audioUrl: string;
    }>,
    avatarId: string
  ): Promise<VideoGenerationResult[]> {
    const results: VideoGenerationResult[] = [];

    for (const lesson of lessons) {
      try {
        const result = await this.generateLessonVideo(
          lesson.title,
          lesson.script,
          lesson.audioUrl,
          avatarId
        );
        results.push(result);

        // Rate limiting: wait between requests
        await this.sleep(2000);
      } catch (error) {
        console.error(`Failed to generate video for "${lesson.title}":`, error);
        results.push({
          videoId: '',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Get video preview
   */
  async getVideoPreview(videoId: string): Promise<VideoPreview | null> {
    try {
      const result = await this.checkVideoStatus(videoId);
      
      if (result.status === 'completed' && result.videoUrl && result.thumbnailUrl) {
        return {
          previewUrl: result.videoUrl,
          thumbnailUrl: result.thumbnailUrl,
          duration: result.duration || 0,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get video preview:', error);
      return null;
    }
  }

  /**
   * Delete video
   */
  async deleteVideo(videoId: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseUrl}/video/${videoId}`, {
        headers: {
          'X-Api-Key': this.apiKey,
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to delete video:', error);
      return false;
    }
  }

  /**
   * Delete local video file
   */
  deleteLocalVideo(videoPath: string): void {
    try {
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    } catch (error) {
      console.error('Failed to delete local video:', error);
    }
  }

  /**
   * Get video file info
   */
  getVideoInfo(videoPath: string): { size: number; exists: boolean } {
    try {
      if (fs.existsSync(videoPath)) {
        const stats = fs.statSync(videoPath);
        return {
          size: stats.size,
          exists: true,
        };
      }
    } catch (error) {
      console.error('Failed to get video info:', error);
    }
    
    return {
      size: 0,
      exists: false,
    };
  }

  /**
   * Estimate video generation cost
   */
  estimateCost(durationSeconds: number): number {
    // HeyGen pricing: approximately $0.10 per minute
    const minutes = durationSeconds / 60;
    return minutes * 0.10;
  }

  /**
   * Validate script for video generation
   */
  validateScript(script: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (!script || script.trim().length === 0) {
      issues.push('Script is empty');
    }
    
    if (script.length > 10000) {
      issues.push('Script exceeds maximum length of 10000 characters');
    }
    
    // Estimate duration (rough: 150 words per minute)
    const wordCount = script.split(/\s+/).length;
    const estimatedMinutes = wordCount / 150;
    
    if (estimatedMinutes > 10) {
      issues.push(`Script is very long (estimated ${Math.round(estimatedMinutes)} minutes). Consider breaking into multiple videos.`);
    }
    
    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Get recommended avatar for content type
   */
  getRecommendedAvatar(contentType: 'educational' | 'professional' | 'casual'): string {
    // These are example avatar IDs - replace with actual IDs from your HeyGen account
    switch (contentType) {
      case 'educational':
        return 'avatar_educational_001';
      case 'professional':
        return 'avatar_professional_001';
      case 'casual':
        return 'avatar_casual_001';
      default:
        return 'avatar_default_001';
    }
  }

  /**
   * Create slide content from lesson script
   */
  createSlidesFromScript(
    script: {
      introduction: string;
      mainContent: string[];
      summary: string;
      keyTakeaways: string[];
    },
    durationPerSlide: number = 30
  ): Slide[] {
    const slides: Slide[] = [];

    // Introduction slide
    slides.push({
      title: 'Introduction',
      content: [script.introduction],
      duration: durationPerSlide,
    });

    // Main content slides
    script.mainContent.forEach((content, index) => {
      slides.push({
        title: `Key Point ${index + 1}`,
        content: [content],
        duration: durationPerSlide,
      });
    });

    // Summary slide
    slides.push({
      title: 'Summary',
      content: [script.summary],
      duration: durationPerSlide,
    });

    // Key takeaways slide
    if (script.keyTakeaways.length > 0) {
      slides.push({
        title: 'Key Takeaways',
        content: script.keyTakeaways,
        duration: durationPerSlide,
      });
    }

    return slides;
  }

  /**
   * Ensure output directory exists
   */
  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Sanitize filename
   */
  private sanitizeFilename(name: string): string {
    return name
      .replace(/[^a-z0-9-_]/gi, '-')
      .replace(/-+/g, '-')
      .toLowerCase();
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get default avatars (fallback)
   */
  private getDefaultAvatars(): Avatar[] {
    return [
      {
        avatar_id: 'default_female_001',
        avatar_name: 'Sarah',
        gender: 'female',
      },
      {
        avatar_id: 'default_male_001',
        avatar_name: 'John',
        gender: 'male',
      },
      {
        avatar_id: 'default_female_002',
        avatar_name: 'Emily',
        gender: 'female',
      },
      {
        avatar_id: 'default_male_002',
        avatar_name: 'Michael',
        gender: 'male',
      },
    ];
  }
}
