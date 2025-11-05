/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

PREMIUM EDUCATION API ENDPOINTS
API routes for premium education features
*/

import { premiumEducationService } from '../services/azora-education/premium-service';
import express from 'express';

const router = express.Router();

/**
 * GET /api/premium/status/:userId
 * Get user's premium subscription status
 */
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const subscription = premiumEducationService.getSubscription(userId);
    const isPremium = premiumEducationService.isPremium(userId);

    res.json({
      isPremium,
      subscription: subscription || null,
      features: subscription?.features || [],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/premium/subscribe
 * Subscribe user to premium tier
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { userId, tier } = req.body;

    if (!userId || !tier) {
      return res.status(400).json({ error: 'userId and tier are required' });
    }

    if (!['basic', 'advanced', 'elite'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier. Must be basic, advanced, or elite' });
    }

    const subscription = await premiumEducationService.subscribe(userId, tier);

    res.json({
      success: true,
      subscription,
      message: `Successfully subscribed to ${tier} premium tier`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/premium/upgrade
 * Upgrade user's premium tier
 */
router.post('/upgrade', async (req, res) => {
  try {
    const { userId, newTier } = req.body;

    if (!userId || !newTier) {
      return res.status(400).json({ error: 'userId and newTier are required' });
    }

    const subscription = await premiumEducationService.upgrade(userId, newTier);

    res.json({
      success: true,
      subscription,
      message: `Successfully upgraded to ${newTier} tier`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/premium/cancel
 * Cancel user's premium subscription
 */
router.post('/cancel', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    await premiumEducationService.cancel(userId);

    res.json({
      success: true,
      message: 'Premium subscription cancelled',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/premium/features
 * Get all available premium features
 */
router.get('/features', async (req, res) => {
  try {
    const features = premiumEducationService.getAllFeatures();

    res.json({
      features,
      total: features.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/premium/check/:userId/:featureId
 * Check if user has access to specific feature
 */
router.get('/check/:userId/:featureId', async (req, res) => {
  try {
    const { userId, featureId } = req.params;
    const hasAccess = premiumEducationService.hasFeatureAccess(userId, featureId);

    res.json({
      userId,
      featureId,
      hasAccess,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
