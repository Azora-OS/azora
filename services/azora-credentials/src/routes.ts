import express from 'express';
import creditTracker, { CredentialType } from './credit-tracker';

const router = express.Router();

/**
 * POST /api/credentials/track/learning
 * Track learning credits
 */
router.post('/track/learning', async (req: any, res) => {
    try {
        const { userId, courseId, credits, activityType } = req.body;

        await creditTracker.trackLearningCredit(userId, courseId, credits, activityType);

        res.json({
            success: true,
            message: `Tracked ${credits} learning credits`
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/credentials/track/building
 * Track building credits
 */
router.post('/track/building', async (req: any, res) => {
    try {
        const { userId, projectId, hours, activityType } = req.body;

        await creditTracker.trackBuildingCredit(userId, projectId, hours, activityType);

        res.json({
            success: true,
            message: 'Tracked building credits'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/credentials/credits/:userId
 * Get total credits for user
 */
router.get('/credits/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const credits = await creditTracker.getTotalCredits(userId);

        res.json(credits);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/credentials/eligibility/:userId/:type
 * Check credential eligibility
 */
router.get('/eligibility/:userId/:type', async (req, res) => {
    try {
        const { userId, type } = req.params;

        const eligibility = await creditTracker.checkCredentialEligibility(
            userId,
            type as CredentialType
        );

        res.json(eligibility);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
