/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

DESIGN API ROUTES
Provides API endpoints for design data access
*/

import express, { Request, Response } from 'express';
import { authenticateSession, AuthRequest } from '@azora/shared-auth/middleware';
import { designDataService } from './data-service';

const router = express.Router();

/**
 * GET /api/design/wallet-balance
 * Get user wallet balance for UI display
 */
router.get('/wallet-balance', authenticateSession, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const balance = await designDataService.getUserWalletBalance(req.user.userId);
    res.json({
      success: true,
      data: balance,
    });
  } catch (error: any) {
    console.error('Error getting wallet balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get wallet balance',
    });
  }
});

/**
 * GET /api/design/student-progress
 * Get student progress for UI display
 */
router.get('/student-progress', authenticateSession, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const progress = await designDataService.getStudentProgress(req.user.userId);
    res.json({
      success: true,
      data: progress,
    });
  } catch (error: any) {
    console.error('Error getting student progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get student progress',
    });
  }
});

/**
 * GET /api/design/health-check
 * Get system health for UI display
 */
router.get('/health-check', async (req: Request, res: Response) => {
  try {
    const health = await designDataService.getSystemHealth();
    res.json({
      success: true,
      data: health,
    });
  } catch (error: any) {
    console.error('Error getting health check:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get health check',
    });
  }
});

/**
 * GET /api/design/dashboard
 * Get comprehensive dashboard data
 */
router.get('/dashboard', authenticateSession, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const dashboard = await designDataService.getCachedDashboardData(req.user.userId);
    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error: any) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard data',
    });
  }
});

export default router;
