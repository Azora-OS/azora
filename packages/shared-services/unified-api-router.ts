/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

API LAYER FOUNDATION - LAYER 6
Provides unified API endpoints for all services, ready for design system integration
*/

import express, { Router } from 'express';
import { authenticateSession, AuthRequest, requireRole } from '@azora/shared-auth/middleware';
import { getServiceRegistry } from '@azora/shared-services/service-registry';
import { eventBus } from '@azora/shared-services/event-bus';
import { healthCheckService } from '@azora/shared-services/health-check';

const router = Router();

/**
 * Unified API Router
 * Provides consistent API structure across all services
 */
export class UnifiedAPIRouter {
  private router: Router;
  private serviceRegistry: ReturnType<typeof getServiceRegistry>;

  constructor() {
    this.router = Router();
    this.serviceRegistry = getServiceRegistry();
    this.setupRoutes();
  }

  /**
   * Setup unified API routes
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.router.get('/health', async (req, res) => {
      try {
        const health = await healthCheckService.getHealthReport();
        res.json({
          success: true,
          data: health,
          timestamp: new Date(),
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: 'Failed to get health report',
        });
      }
    });

    // Service status endpoint
    this.router.get('/services/status', authenticateSession, async (req: AuthRequest, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const status = this.serviceRegistry.getStatus();
        res.json({
          success: true,
          data: status,
          timestamp: new Date(),
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: 'Failed to get service status',
        });
      }
    });

    // Event history endpoint
    this.router.get('/events/history', authenticateSession, requireRole('ADMIN'), async (req: AuthRequest, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const { eventType, limit = 100 } = req.query;
        const history = eventBus.getEventHistory(
          eventType as string | undefined,
          Number(limit)
        );

        res.json({
          success: true,
          data: history,
          timestamp: new Date(),
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: 'Failed to get event history',
        });
      }
    });
  }

  /**
   * Get router instance
   */
  getRouter(): Router {
    return this.router;
  }
}

// Export singleton instance
export const unifiedAPIRouter = new UnifiedAPIRouter();

export default unifiedAPIRouter.getRouter();
