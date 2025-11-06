/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express, { Request, Response, Router } from 'express';
import { analyticsEngine } from '../services/analytics-engine';
import { clientManagement } from '../services/client-management';
import { billingIntegration } from '../services/billing-integration';

const router = Router();

/**
 * ENTERPRISE DASHBOARD ROUTES
 * 
 * Provides comprehensive dashboard endpoints for enterprise clients
 */

/**
 * GET /dashboard/:clientId
 * Get comprehensive dashboard data
 */
router.get('/:clientId', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    
    const dashboard = await clientManagement.getClientDashboard(clientId);
    const billingHistory = await billingIntegration.getBillingHistory(clientId, 6);
    const outstanding = await billingIntegration.getOutstandingBills(clientId);

    res.json({
      success: true,
      data: {
        ...dashboard,
        billing: {
          recent: billingHistory,
          outstanding
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /dashboard/:clientId/analytics
 * Get analytics for all locations
 */
router.get('/:clientId/analytics', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { startDate, endDate } = req.query;

    const locations = await clientManagement.getClientLocations(clientId);
    const period = {
      start: startDate ? new Date(startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate as string) : new Date(),
      granularity: 'day' as const
    };

    const analytics = await Promise.all(
      locations.map(loc => analyticsEngine.generateCustomerAnalytics(loc, period))
    );

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /dashboard/:clientId/alerts
 * Get enterprise alerts
 */
router.get('/:clientId/alerts', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const { severity, type, unacknowledgedOnly } = req.query;

    const alerts = await clientManagement.getClientAlerts(clientId, {
      severity: severity as any,
      type: type as any,
      unacknowledgedOnly: unacknowledgedOnly === 'true'
    });

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /dashboard/:clientId/alerts/:alertId/acknowledge
 * Acknowledge an alert
 */
router.post('/:clientId/alerts/:alertId/acknowledge', async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    
    await clientManagement.acknowledgeAlert(alertId);

    res.json({
      success: true,
      message: 'Alert acknowledged'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /dashboard/:clientId/billing
 * Get billing overview
 */
router.get('/:clientId/billing', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    
    const history = await billingIntegration.getBillingHistory(clientId);
    const outstanding = await billingIntegration.getOutstandingBills(clientId);

    res.json({
      success: true,
      data: {
        history,
        outstanding,
        summary: {
          totalBilled: history.reduce((sum, r) => sum + r.breakdown.total, 0),
          totalPaid: history.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.breakdown.total, 0),
          totalOutstanding: outstanding.reduce((sum, r) => sum + r.breakdown.total, 0)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
