/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Video & Media Platform Enhancement
 * 
 * Features:
 * - Video hosting backend
 * - Video analytics
 * - Interactive video features
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

export interface VideoAsset {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  duration: number; // seconds
  size: number; // bytes
  format: string;
  quality: '240p' | '360p' | '480p' | '720p' | '1080p' | '4k';
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  courseId?: string;
  moduleId?: string;
  uploadedBy: string;
  uploadedAt: Date;
  metadata: Record<string, any>;
}

export interface VideoAnalytics {
  videoId: string;
  views: number;
  uniqueViewers: number;
  averageWatchTime: number; // seconds
  completionRate: number; // percentage
  engagementScore: number; // 0-100
  viewerLocations: Record<string, number>; // country -> count
  deviceTypes: Record<string, number>; // device -> count
  lastUpdated: Date;
}

export interface VideoInteraction {
  id: string;
  videoId: string;
  timestamp: number; // seconds into video
  type: 'quiz' | 'note' | 'bookmark' | 'question' | 'comment';
  data: Record<string, any>;
  userId: string;
  createdAt: Date;
}

export interface VideoView {
  id: string;
  videoId: string;
  userId: string;
  watchedDuration: number; // seconds
  completed: boolean;
  deviceInfo?: string;
  location?: string;
  startedAt: Date;
  endedAt?: Date;
}

export class MediaService extends EventEmitter {
  private static instance: MediaService;
  private videos: Map<string, VideoAsset> = new Map();
  private analytics: Map<string, VideoAnalytics> = new Map();
  private interactions: Map<string, VideoInteraction[]> = new Map(); // videoId -> interactions
  private views: Map<string, VideoView[]> = new Map(); // videoId -> views

  private constructor() {
    super();
  }

  public static getInstance(): MediaService {
    if (!MediaService.instance) {
      MediaService.instance = new MediaService();
    }
    return MediaService.instance;
  }

  /**
   * Upload video
   */
  async uploadVideo(video: Omit<VideoAsset, 'id' | 'status' | 'uploadedAt'>): Promise<VideoAsset> {
    const newVideo: VideoAsset = {
      ...video,
      id: crypto.randomUUID(),
      status: 'uploading',
      uploadedAt: new Date(),
    };

    this.videos.set(newVideo.id, newVideo);

    // Simulate processing
    setTimeout(() => {
      newVideo.status = 'ready';
      this.videos.set(newVideo.id, newVideo);
      this.emit('video:processed', newVideo);

      // Initialize analytics
      this.analytics.set(newVideo.id, {
        videoId: newVideo.id,
        views: 0,
        uniqueViewers: 0,
        averageWatchTime: 0,
        completionRate: 0,
        engagementScore: 0,
        viewerLocations: {},
        deviceTypes: {},
        lastUpdated: new Date(),
      });
    }, 2000);

    this.emit('video:uploaded', newVideo);
    return newVideo;
  }

  /**
   * Record video view
   */
  async recordView(view: Omit<VideoView, 'id' | 'startedAt'>): Promise<VideoView> {
    const newView: VideoView = {
      ...view,
      id: crypto.randomUUID(),
      startedAt: new Date(),
    };

    const videoViews = this.views.get(view.videoId) || [];
    videoViews.push(newView);
    this.views.set(view.videoId, videoViews);

    // Update analytics
    await this.updateAnalytics(view.videoId);

    this.emit('video:viewed', newView);
    return newView;
  }

  /**
   * Complete video view
   */
  async completeView(viewId: string, watchedDuration: number): Promise<void> {
    const views = Array.from(this.views.values()).flat();
    const view = views.find(v => v.id === viewId);
    
    if (view) {
      view.watchedDuration = watchedDuration;
      view.completed = watchedDuration >= (this.videos.get(view.videoId)?.duration || 0) * 0.9;
      view.endedAt = new Date();

      await this.updateAnalytics(view.videoId);
    }
  }

  /**
   * Add interaction
   */
  async addInteraction(interaction: Omit<VideoInteraction, 'id' | 'createdAt'>): Promise<VideoInteraction> {
    const newInteraction: VideoInteraction = {
      ...interaction,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    const videoInteractions = this.interactions.get(interaction.videoId) || [];
    videoInteractions.push(newInteraction);
    this.interactions.set(interaction.videoId, videoInteractions);

    // Update analytics
    await this.updateAnalytics(interaction.videoId);

    this.emit('interaction:created', newInteraction);
    return newInteraction;
  }

  /**
   * Update analytics
   */
  private async updateAnalytics(videoId: string): Promise<void> {
    const video = this.videos.get(videoId);
    if (!video) return;

    const views = this.views.get(videoId) || [];
    const interactions = this.interactions.get(videoId) || [];

    const uniqueViewers = new Set(views.map(v => v.userId)).size;
    const completedViews = views.filter(v => v.completed).length;
    const averageWatchTime = views.length > 0
      ? views.reduce((sum, v) => sum + v.watchedDuration, 0) / views.length
      : 0;

    const completionRate = views.length > 0
      ? (completedViews / views.length) * 100
      : 0;

    // Calculate engagement score
    const engagementScore = Math.min(100, 
      (completionRate * 0.4) + 
      ((interactions.length / Math.max(views.length, 1)) * 50) +
      (averageWatchTime / video.duration * 10)
    );

    // Aggregate locations and devices
    const viewerLocations: Record<string, number> = {};
    const deviceTypes: Record<string, number> = {};
    
    views.forEach(v => {
      if (v.location) {
        viewerLocations[v.location] = (viewerLocations[v.location] || 0) + 1;
      }
      if (v.deviceInfo) {
        deviceTypes[v.deviceInfo] = (deviceTypes[v.deviceInfo] || 0) + 1;
      }
    });

    const analytics: VideoAnalytics = {
      videoId,
      views: views.length,
      uniqueViewers,
      averageWatchTime,
      completionRate,
      engagementScore,
      viewerLocations,
      deviceTypes,
      lastUpdated: new Date(),
    };

    this.analytics.set(videoId, analytics);
    this.emit('analytics:updated', analytics);
  }

  /**
   * Get video by ID
   */
  getVideo(videoId: string): VideoAsset | undefined {
    return this.videos.get(videoId);
  }

  /**
   * Get video analytics
   */
  getAnalytics(videoId: string): VideoAnalytics | undefined {
    return this.analytics.get(videoId);
  }

  /**
   * Get video interactions
   */
  getInteractions(videoId: string): VideoInteraction[] {
    return this.interactions.get(videoId) || [];
  }

  /**
   * Get course videos
   */
  getCourseVideos(courseId: string): VideoAsset[] {
    return Array.from(this.videos.values()).filter(v => v.courseId === courseId);
  }
}

export const mediaService = MediaService.getInstance();
