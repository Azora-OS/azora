/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

LAYER 3: AUTHENTICATION FOUNDATION - INTEGRATION EXAMPLE
Example of how to integrate @azora/shared-auth with Express/Next.js
*/

import express, { Router } from 'express';
import { authService } from '@azora/shared-auth/service';
import { authenticateJWT, authenticateSession, requireRole } from '@azora/shared-auth/middleware';
import bcrypt from 'bcryptjs';
import { prisma } from '@azora/shared-database/prisma';

const router = Router();

/**
 * Login endpoint
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    // Find user (this should use your user repository)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Verify password (assuming passwordHash is stored)
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Create session using auth service
    const loginResult = await authService.login(
      { email, password: '***' }, // Password already validated
      {
        userId: user.id,
        role: user.role || 'USER',
      },
      {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      }
    );

    if (!loginResult.success || !loginResult.session) {
      return res.status(500).json({
        error: loginResult.error || 'Login failed',
      });
    }

    // Return session tokens
    res.json({
      success: true,
      session: {
        id: loginResult.session.id,
        accessToken: loginResult.session.accessToken,
        refreshToken: loginResult.session.refreshToken,
        expiresIn: 3600, // 1 hour
      },
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

/**
 * Refresh token endpoint
 * POST /api/auth/refresh
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken, sessionId } = req.body;

    if (!refreshToken || !sessionId) {
      return res.status(400).json({
        error: 'Refresh token and session ID are required',
      });
    }

    const refreshResult = await authService.refreshTokens(
      sessionId,
      refreshToken
    );

    if (!refreshResult.success || !refreshResult.session) {
      return res.status(401).json({
        error: refreshResult.error || 'Token refresh failed',
      });
    }

    res.json({
      success: true,
      session: {
        id: refreshResult.session.id,
        accessToken: refreshResult.session.accessToken,
        refreshToken: refreshResult.session.refreshToken,
        expiresIn: 3600,
      },
    });
  } catch (error: any) {
    console.error('Refresh error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

/**
 * Logout endpoint
 * POST /api/auth/logout
 */
router.post('/logout', authenticateSession, async (req: any, res) => {
  try {
    const sessionId = req.sessionId;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Session ID required',
      });
    }

    await authService.logout(sessionId);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

/**
 * Protected route example
 * GET /api/auth/me
 */
router.get('/me', authenticateSession, async (req: any, res) => {
  try {
    // User is attached to req.user by authenticateSession middleware
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        profile: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

/**
 * Admin-only route example
 * GET /api/auth/admin/users
 */
router.get(
  '/admin/users',
  authenticateSession,
  requireRole('ADMIN'),
  async (req: any, res) => {
    try {
      // Only admins can access this
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      res.json({
        success: true,
        users,
      });
    } catch (error: any) {
      console.error('Get users error:', error);
      res.status(500).json({
        error: 'Internal server error',
      });
    }
  }
);

export default router;
