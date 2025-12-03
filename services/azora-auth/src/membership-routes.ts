import express from 'express';
import usageTracker from './usage-tracker';
import { MembershipTier, TIER_LIMITS, getSuggestedUpgrade } from './membership-tiers';

const router = express.Router();

/**
 * Middleware to check AI request limits
 */
export async function checkAILimit(req: any, res: any, next: any) {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await usageTracker.trackAIRequest(userId);

    if (!result.allowed) {
        const suggestedTier = getSuggestedUpgrade(result.tier);

        return res.status(429).json({
            error: 'AI request limit exceeded',
            message: `You've used all ${TIER_LIMITS[result.tier].aiRequests} AI requests this month.`,
            currentTier: result.tier,
            suggestedTier,
            upgradeUrl: '/upgrade',
            resetDate: getNextMonthStart()
        });
    }

    // Add usage info to response headers
    res.setHeader('X-AI-Requests-Remaining', result.remaining.toString());
    res.setHeader('X-AI-Requests-Limit', TIER_LIMITS[result.tier].aiRequests.toString());

    next();
}

/**
 * GET /api/usage - Get current usage stats
 */
router.get('/usage', async (req: any, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const [usage, percentage] = await Promise.all([
            usageTracker.getMonthlyUsage(userId),
            usageTracker.getUsagePercentage(userId)
        ]);

        const user = await prisma.user.findUnique({ where: { id: userId } });
        const tier = user?.membershipTier as MembershipTier;
        const limits = TIER_LIMITS[tier];

        res.json({
            tier,
            limits,
            usage,
            percentage,
            resetDate: getNextMonthStart()
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/tiers - Get all membership tiers
 */
router.get('/tiers', (req, res) => {
    res.json({
        tiers: Object.entries(TIER_LIMITS).map(([name, limits]) => ({
            name,
            ...limits
        }))
    });
});

/**
 * POST /api/upgrade - Upgrade membership tier
 */
router.post('/upgrade', async (req: any, res) => {
    try {
        const userId = req.user?.id;
        const { tier, paymentMethodId } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Validate tier
        if (!Object.values(MembershipTier).includes(tier)) {
            return res.status(400).json({ error: 'Invalid tier' });
        }

        // Process payment (Stripe integration)
        // TODO: Implement Stripe subscription creation

        // Update user tier
        await prisma.user.update({
            where: { id: userId },
            data: {
                membershipTier: tier,
                subscriptionStatus: 'active',
                subscriptionStartDate: new Date()
            }
        });

        res.json({
            success: true,
            tier,
            message: `Successfully upgraded to ${tier}!`
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/downgrade - Downgrade or cancel membership
 */
router.post('/downgrade', async (req: any, res) => {
    try {
        const userId = req.user?.id;
        const { tier } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Cancel Stripe subscription
        // TODO: Implement Stripe subscription cancellation

        // Update user tier
        await prisma.user.update({
            where: { id: userId },
            data: {
                membershipTier: tier || MembershipTier.FREE,
                subscriptionStatus: 'cancelled',
                subscriptionEndDate: new Date()
            }
        });

        res.json({
            success: true,
            tier: tier || MembershipTier.FREE,
            message: 'Subscription cancelled successfully'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

function getNextMonthStart(): Date {
    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    next.setDate(1);
    next.setHours(0, 0, 0, 0);
    return next;
}

export default router;
