/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * AZORA OS - Unified Video Platform Hook
 *
 * React hook for interacting with the unified video platform service
 */

import { useState } from 'react';
import {
  VideoContent,
  VideoProgress,
} from '../services/unified-video-platform';

interface UseUnifiedVideoPlatformProps {
  userId?: string;
}

interface VideoFilters {
  platform?: string;
  category?: string;
  difficulty?: string;
  contentType?: string;
  search?: string;
}

interface UseUnifiedVideoPlatformReturn {
  videos: VideoContent[];
  loading: boolean;
  error: string | null;
  fetchVideos: (filters?: VideoFilters) => Promise<void>;
  getVideoById: (id: string) => Promise<VideoContent | null>;
  trackProgress: (progress: Omit<VideoProgress, 'userId'>) => Promise<void>;
  getUserProgress: () => Promise<VideoProgress[]>;
  getRecommendations: (limit?: number) => Promise<VideoContent[]>;
  syncContent: () => Promise<void>;
}

export const useUnifiedVideoPlatform = ({
  userId,
}: UseUnifiedVideoPlatformProps = {}): UseUnifiedVideoPlatformReturn => {
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch videos with optional filters
  const fetchVideos = async (filters?: VideoFilters) => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        action: 'list',
        userId,
        ...(filters ? { filters: JSON.stringify(filters) } : {}),
      });

      const response = await fetch(`/api/video-platform?${query}`);
      const result = await response.json();

      if (result.success) {
        setVideos(result.data);
      } else {
        setError(result.error || 'Failed to fetch videos');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  // Get video by ID
  const getVideoById = async (id: string): Promise<VideoContent | null> => {
    if (!userId) {
      setError('User ID is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        action: 'get',
        userId,
        videoId: id,
      });

      const response = await fetch(`/api/video-platform?${query}`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        setError(result.error || 'Failed to fetch video');
        return null;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Track user progress for a video
  const trackProgress = async (progress: Omit<VideoProgress, 'userId'>) => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/video-platform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'track-progress',
          userId,
          videoId: progress.videoId,
          progress,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to track progress');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  // Get user progress
  const getUserProgress = async (): Promise<VideoProgress[]> => {
    if (!userId) {
      setError('User ID is required');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        action: 'progress',
        userId,
      });

      const response = await fetch(`/api/video-platform?${query}`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        setError(result.error || 'Failed to fetch progress');
        return [];
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get video recommendations
  const getRecommendations = async (
    limit: number = 10
  ): Promise<VideoContent[]> => {
    if (!userId) {
      setError('User ID is required');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        action: 'recommendations',
        userId,
        limit: limit.toString(),
      });

      const response = await fetch(`/api/video-platform?${query}`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        setError(result.error || 'Failed to fetch recommendations');
        return [];
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Sync content from all platforms
  const syncContent = async () => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/video-platform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sync',
          userId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to sync content');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    videos,
    loading,
    error,
    fetchVideos,
    getVideoById,
    trackProgress,
    getUserProgress,
    getRecommendations,
    syncContent,
  };
};

