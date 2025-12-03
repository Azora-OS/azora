/**
 * Alerts Routes
 * Endpoints for managing alerts and alert rules
 */

import { Router, Request, Response } from 'express';
import { alertsService, AlertRule } from '../services/alerts.service';
import { structuredLogger } from '../utils/structured-logger';

const router = Router();

/**
 * GET /alerts/rules
 * Get all alert rules
 */
router.get('/rules', (_req: Request, res: Response) => {
  try {
    const rules = alertsService.getRules();
    res.json({
      success: true,
      data: rules,
      count: rules.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    structuredLogger.error('Failed to get alert rules', error as Error);
    res.status(500).json({
      success: false,
      error: 'Failed to get alert rules',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /alerts/rules
 * Create a new alert rule
 */
router.post('/rules', (req: Request, res: Response) => {
  try {
    const rule: AlertRule = req.body;

    // Validate rule
    if (!rule.id || !rule.name || !rule.metric || rule.threshold === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: id, name, metric, threshold',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    alertsService.addRule(rule);

    res.status(201).json({
      success: true,
      data: rule,
      message: 'Alert rule created',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    structuredLogger.error('Failed to create alert rule', error as Error);
    res.status(500).json({
      success: false,
      error: 'Failed to create alert rule',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * DELETE /alerts/rules/:ruleId
 * Delete an alert rule
 */
router.delete('/rules/:ruleId', (req: Request, res: Response) => {
  try {
    const { ruleId } = req.params;
    alertsService.removeRule(ruleId);

    res.json({
      success: true,
      message: `Alert rule ${ruleId} deleted`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    structuredLogger.error('Failed to delete alert rule', error as Error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete alert rule',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /alerts/active
 * Get active alerts
 */
router.get('/active', (_req: Request, res: Response) => {
  try {
    const alerts = alertsService.getActiveAlerts();
    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    structuredLogger.error('Failed to get active alerts', error as Error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active alerts',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /alerts/history
 * Get alert history
 */
router.get('/history', (req: Request, res: Response) => {
  try {
    const limit = parseInt((req.query.limit as string) || '100');
    const history = alertsService.getAlertHistory(limit);

    res.json({
      success: true,
      data: history,
      count: history.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    structuredLogger.error('Failed to get alert history', error as Error);
    res.status(500).json({
      success: false,
      error: 'Failed to get alert history',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /alerts/:alertId/resolve
 * Resolve an alert
 */
router.post('/:alertId/resolve', (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    alertsService.resolveAlert(alertId);

    res.json({
      success: true,
      message: `Alert ${alertId} resolved`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    structuredLogger.error('Failed to resolve alert', error as Error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve alert',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /alerts/statistics
 * Get alert statistics
 */
router.get('/statistics', (_req: Request, res: Response) => {
  try {
    const stats = alertsService.getAlertStatistics();
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    structuredLogger.error('Failed to get alert statistics', error as Error);
    res.status(500).json({
      success: false,
      error: 'Failed to get alert statistics',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
