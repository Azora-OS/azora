/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
/**
 * AZORA OS - Unified Video Platform API
 *
 * API endpoints for managing video content from multiple platforms
 */

import { NextApiRequest, NextApiResponse } from 'next';
import {
  createUnifiedVideoPlatformService,
  defaultVideoPlatformConfig,
} from '../services/unified-video-platform';

// Initialize the unified video platform service
const videoPlatformService = createUnifiedVideoPlatformService(
  defaultVideoPlatformConfig
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET': {
      try {
        const { action, userId, videoId, filters } = req.query;

        switch (action) {
          case 'list': {
            // Get all video content with optional filters
            const content = videoPlatformService.getAllContent(
              filters ? JSON.parse(filters as string) : undefined
            );
            res.status(200).json({ success: true, data: content });
            break;
          }

          case 'get': {
            // Get specific video content by ID
            if (!videoId) {
              res
                .status(400)
                .json({ success: false, error: 'Video ID is required' });
              return;
            }
            const video = videoPlatformService.getContentById(
              videoId as string
            );
            if (!video) {
              res
                .status(404)
                .json({ success: false, error: 'Video not found' });
              return;
            }
            res.status(200).json({ success: true, data: video });
            break;
          }

          case 'progress': {
            // Get user progress
            if (!userId) {
              res
                .status(400)
                .json({ success: false, error: 'User ID is required' });
              return;
            }
            const progress = videoPlatformService.getUserProgress(
              userId as string
            );
            res.status(200).json({ success: true, data: progress });
            break;
          }

          case 'recommendations': {
            // Get video recommendations for user
            if (!userId) {
              res
                .status(400)
                .json({ success: false, error: 'User ID is required' });
              return;
            }
            const recommendations = videoPlatformService.getRecommendations(
              userId as string
            );
            res.status(200).json({ success: true, data: recommendations });
            break;
          }

          case 'health': {
            // Get service health status
            const health = await videoPlatformService.getHealthStatus();
            res.status(200).json({ success: true, data: health });
            break;
          }

          default:
            res.status(400).json({ success: false, error: 'Invalid action' });
        }
      } catch (error) {
        console.error('API Error:', error);
        res
          .status(500)
          .json({ success: false, error: 'Internal server error' });
      }
      break;
    }

    case 'POST': {
      try {
        const { action, userId, videoId, progress } = req.body;

        switch (action) {
          case 'track-progress': {
            // Track user progress for a video
            if (!userId || !videoId || progress === undefined) {
              res
                .status(400)
                .json({ success: false, error: 'Missing required fields' });
              return;
            }

            await videoPlatformService.trackProgress({
              userId,
              videoId,
              platform: progress.platform,
              progress: progress.progress,
              completed: progress.completed,
              completionDate: progress.completionDate
                ? new Date(progress.completionDate)
                : undefined,
              quizScore: progress.quizScore,
              notes: progress.notes,
            });

            res
              .status(200)
              .json({
                success: true,
                message: 'Progress tracked successfully',
              });
            break;
          }

          case 'sync': {
            // Sync content from all platforms
            await videoPlatformService.syncContent();
            res
              .status(200)
              .json({ success: true, message: 'Content synced successfully' });
            break;
          }

          default:
            res.status(400).json({ success: false, error: 'Invalid action' });
        }
      } catch (error) {
        console.error('API Error:', error);
        res
          .status(500)
          .json({ success: false, error: 'Internal server error' });
      }
      break;
    }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

