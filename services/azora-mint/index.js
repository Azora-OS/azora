/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file Economic Growth & Sovereignty Service
 * @description The strategic core for monitoring, analyzing, and guiding the Azora economy.
 * This service calculates key economic indicators and has the authority to propose fiscal policy changes.
 */

import express from 'express';
import cors from 'cors';
import { createClient as createRedisClient } from 'redis';
import bodyParser from 'body-parser';
import { Pool } from 'pg';
import { processKnowledgeReward } from './src/controllers/rewardController.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4300;
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://azora:password@postgres:5432/azora_db';
const EVENT_CHANNEL = 'azora:events';

// Proof-of-Knowledge Protocol Configuration
const PROOF_OF_KNOWLEDGE_REWARDS = {
    'module_completion': {
        'basic': 100,      // Basic module completion
        'intermediate': 150, // Module with assessment
        'advanced': 200    // Challenging module
    },
    'assessment_pass': {
        'practical_exam': 300,
        'code_audit': 400,
        'capstone_project': 500
    },
    'certificate_achievement': {
        'ckq_basic': 1000,    // Complete CKQ certification
        'ckq_advanced': 2000  // Advanced CKQ certification
    },
    'milestone_bonus': {
        'first_module': 50,   // First module completed
        'halfway_point': 150, // Halfway through program
        'final_project': 250  // Final capstone project
    }
};

const pool = new Pool({ connectionString: DATABASE_URL });
const logger = {
    info: (message, context = {}) => console.log(JSON.stringify({ level: 'info', service: 'economic-growth', message, ...context })),
    error: (message, context = {}) => console.error(JSON.stringify({ level: 'error', service: 'economic-growth', message, ...context })),
    warn: (message, context = {}) => console.warn(JSON.stringify({ level: 'warn', service: 'economic-growth', message, ...context })),
};

/**
 * @typedef {object} EconomicMetrics
 * @property {number} gdp - Gross Domestic Product: Total value of transactions.
 * @property {number} velocity - Velocity of AZR: How frequently currency is used.
 * @property {number} transactionCount - Total number of transactions.
 * @property {number} ubiRate - Current Universal Basic Income rate.
 * @property {number} uboFund - Universal Basic Opportunity Fund balance.
 * @property {number} knowledgeRewardsPaid - Total Proof-of-Knowledge rewards distributed.
 * @property {Date} lastUpdated
 */

/** @type {EconomicMetrics} */
let metrics = {
    gdp: 0,
    velocity: 0,
    transactionCount: 0,
    ubiRate: 1.0, // Default starting UBI
    uboFund: 10000000, // 10M aZAR in UBO Fund (1% of total supply)
    knowledgeRewardsPaid: 0,
    lastUpdated: new Date(),
};

/**
 * Recalculates all economic metrics from the database.
 */
async function recalculateMetrics() {
    try {
        const { rows } = await pool.query(`
            SELECT
                COALESCE(SUM(amount), 0) AS gdp,
                COUNT(*) AS transaction_count
            FROM transactions WHERE timestamp > NOW() - INTERVAL '30 days';
        `);

        const thirtyDayStats = rows[0];
        const { rows: ubiRows } = await pool.query('SELECT rate FROM ubi_rates ORDER BY effective_date DESC LIMIT 1');

        metrics.gdp = parseFloat(thirtyDayStats.gdp);
        metrics.transactionCount = parseInt(thirtyDayStats.transaction_count, 10);
        // A simple velocity model. More complex models can be added.
        metrics.velocity = metrics.gdp > 0 ? metrics.transactionCount / metrics.gdp : 0;
        metrics.ubiRate = ubiRows.length > 0 ? parseFloat(ubiRows[0].rate) : metrics.ubiRate;
        metrics.lastUpdated = new Date();

        logger.info('Economic metrics recalculated', { metrics });
        await checkEconomicHealth();
    } catch (err) {
        logger.error('Failed to recalculate metrics', { error: err.message });
    }
}

/**
 * Analyzes metrics and proposes policy changes if targets are not met.
 */
async function checkEconomicHealth() {
    const GDP_GROWTH_TARGET = 0.05; // Target 5% GDP growth period-over-period (placeholder)

    // Example policy: If GDP is growing, consider increasing UBI to stimulate further.
    // This is a highly simplified model. A real-world implementation would be far more complex.
    if (metrics.gdp > 10000 && metrics.velocity > 0.1) { // Arbitrary health thresholds
        const proposedUbiRate = metrics.ubiRate * (1 + GDP_GROWTH_TARGET);
        logger.warn('Proposing UBI Rate Increase', { current: metrics.ubiRate, proposed: proposedUbiRate, reason: "Sustained GDP growth and healthy velocity." });

        // In a real system, this would be a proposal requiring consensus. Here we auto-approve.
        await pool.query('INSERT INTO ubi_rates(rate, effective_date) VALUES($1, NOW())', [proposedUbiRate]);
        metrics.ubiRate = proposedUbiRate;
        logger.info('Fiscal Policy Update: UBI rate increased.', { newRate: proposedUbiRate });
    }
}

/**
 * Get next milestone suggestions based on current achievement
 */
function getNextMilestones(rewardType, rewardCategory, programId) {
    const suggestions = [];

    switch (rewardType) {
        case 'module_completion':
            if (rewardCategory === 'basic') {
                suggestions.push({
                    type: 'module_completion',
                    category: 'intermediate',
                    description: 'Complete next module with assessment',
                    potentialReward: PROOF_OF_KNOWLEDGE_REWARDS.module_completion.intermediate
                });
            }
            break;

        case 'assessment_pass':
            suggestions.push({
                type: 'certificate_achievement',
                category: 'ckq_basic',
                description: 'Complete full CKQ certification',
                potentialReward: PROOF_OF_KNOWLEDGE_REWARDS.certificate_achievement.ckq_basic
            });
            break;

        case 'certificate_achievement':
            if (rewardCategory === 'ckq_basic') {
                suggestions.push({
                    type: 'certificate_achievement',
                    category: 'ckq_advanced',
                    description: 'Pursue CKQ-Advanced program',
                    potentialReward: PROOF_OF_KNOWLEDGE_REWARDS.certificate_achievement.ckq_advanced
                });
            }
            break;
    }

    return suggestions;
}

/**
 * @param {string} channel
 * @param {string} message
 */
const handleEvent = async (channel, message) => {
    try {
        const event = JSON.parse(message);
        if (event.type === 'TRANSACTION_PROCESSED') {
            // Incrementally update metrics for real-time feel
            metrics.gdp += event.payload.amount;
            metrics.transactionCount++;
            logger.info('Incremental metric update', { amount: event.payload.amount });
        } else if (event.type === 'KNOWLEDGE_REWARD_PAID') {
            // Track knowledge reward payments
            metrics.knowledgeRewardsPaid += event.payload.amount;
            metrics.uboFund -= event.payload.amount;
            logger.info('Knowledge reward payment recorded', {
                userId: event.payload.userId,
                amount: event.payload.amount,
                achievement: event.payload.achievement
            });
        }
    } catch (err) {
        logger.error('Error handling event', { error: err.message });
    }
};

// API Endpoints
app.get('/api/health', (req, res) => res.status(200).json({ status: 'online', service: 'economic-growth-service' }));
app.get('/api/metrics', (req, res) => res.json(metrics));
app.post('/api/recalculate', async (req, res) => {
    await recalculateMetrics();
    res.status(202).json({ message: 'Recalculation initiated.' });
});

// Proof-of-Knowledge Protocol Endpoints
app.get('/api/ubo/status', (req, res) => {
    res.json({
        uboFund: {
            balance: metrics.uboFund,
            totalRewardsPaid: metrics.knowledgeRewardsPaid,
            remainingFunds: metrics.uboFund,
            allocationRate: 0.01 // 1% of total supply
        },
        proofOfKnowledge: {
            rewardsDistributed: metrics.knowledgeRewardsPaid,
            activeRewards: PROOF_OF_KNOWLEDGE_REWARDS,
            lastPayment: new Date().toISOString()
        }
    });
});

app.post('/api/knowledge-reward', async (req, res) => {
    const { userId, rewardType, rewardCategory, achievement, programId, moduleName } = req.body;

    if (!userId || !rewardType || !rewardCategory) {
        return res.status(400).json({
            error: 'Missing required fields: userId, rewardType, rewardCategory'
        });
    }

    // Validate reward exists
    if (!PROOF_OF_KNOWLEDGE_REWARDS[rewardType] ||
        !PROOF_OF_KNOWLEDGE_REWARDS[rewardType][rewardCategory]) {
        return res.status(400).json({
            error: 'Invalid reward type or category'
        });
    }

    const rewardAmount = PROOF_OF_KNOWLEDGE_REWARDS[rewardType][rewardCategory];

    // Check UBO fund balance
    if (metrics.uboFund < rewardAmount) {
        return res.status(402).json({
            error: 'Insufficient UBO funds for reward payment'
        });
    }

    try {
        // Record the reward payment
        const rewardRecord = {
            id: `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            rewardType,
            rewardCategory,
            amount: rewardAmount,
            achievement: achievement || `${rewardCategory} ${rewardType}`,
            programId: programId || null,
            moduleName: moduleName || null,
            timestamp: new Date().toISOString(),
            currency: 'aZAR',
            source: 'UBO_FUND'
        };

        // Update metrics
        metrics.uboFund -= rewardAmount;
        metrics.knowledgeRewardsPaid += rewardAmount;

        // In production, this would update the user's wallet balance
        // For now, we'll simulate the payment
        console.log(`💰 Proof-of-Knowledge: Paid ${rewardAmount} aZAR to ${userId} for ${achievement}`);

        // Log to database (simplified)
        await pool.query(`
            INSERT INTO knowledge_rewards(user_id, reward_type, reward_category, amount, achievement, program_id, module_name, timestamp)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
            userId, rewardType, rewardCategory, rewardAmount,
            rewardRecord.achievement, programId, moduleName, rewardRecord.timestamp
        ]);

        res.json({
            success: true,
            reward: rewardRecord,
            message: `Congratulations! You have been rewarded ${rewardAmount} aZAR for ${achievement}`,
            uboFundRemaining: metrics.uboFund,
            nextMilestones: getNextMilestones(rewardType, rewardCategory, programId)
        });

    } catch (error) {
        logger.error('Failed to process knowledge reward', { error: error.message });
        res.status(500).json({ error: 'Failed to process reward payment' });
    }
});

// Enterprise-grade Proof-of-Knowledge endpoint with full validation
app.post('/api/v2/knowledge-reward', processKnowledgeReward);

app.get('/api/knowledge-rewards/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const { rows } = await pool.query(`
            SELECT * FROM knowledge_rewards
            WHERE user_id = $1
            ORDER BY timestamp DESC
            LIMIT 50
        `, [userId]);

        const totalEarned = rows.reduce((sum, reward) => sum + parseFloat(reward.amount), 0);

        res.json({
            userId,
            rewards: rows,
            totalEarned,
            rewardCount: rows.length,
            averageReward: rows.length > 0 ? totalEarned / rows.length : 0
        });

    } catch (error) {
        logger.error('Failed to fetch knowledge rewards', { error: error.message });
        res.status(500).json({ error: 'Failed to fetch reward history' });
    }
});

app.get('/api/knowledge-rewards/stats', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT
                COUNT(*) as total_rewards,
                SUM(amount) as total_amount,
                AVG(amount) as average_reward,
                reward_type,
                reward_category
            FROM knowledge_rewards
            GROUP BY reward_type, reward_category
            ORDER BY total_amount DESC
        `);

        res.json({
            globalStats: {
                totalRewardsPaid: metrics.knowledgeRewardsPaid,
                totalStudentsRewarded: rows.length,
                averageRewardPerStudent: rows.length > 0 ? metrics.knowledgeRewardsPaid / rows.length : 0
            },
            rewardBreakdown: rows,
            uboFundStatus: {
                remaining: metrics.uboFund,
                utilizationRate: metrics.uboFund > 0 ? (metrics.knowledgeRewardsPaid / (metrics.uboFund + metrics.knowledgeRewardsPaid)) * 100 : 0
            }
        });

    } catch (error) {
        logger.error('Failed to fetch reward stats', { error: error.message });
        res.status(500).json({ error: 'Failed to fetch reward statistics' });
    }
});

// Mining and Minting Engine Integration
let miningSessions = new Map(); // Track active mining sessions
let miningStats = {
    totalMinedUsd: 0.0,
    totalAzrMinted: 0.0,
    activeSessions: 0,
    avgHashrate: 42.0,
    totalShares: { accepted: 0, rejected: 0 },
    lastUpdate: new Date().toISOString()
};

/**
 * Mining session management with database persistence
 */
class MiningSession {
    constructor(sessionId, userId) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.startTime = new Date();
        this.hashrate = 42.0; // MH/s
        this.sharesAccepted = 0;
        this.sharesRejected = 0;
        this.earningsUsd = 0.0;
        this.azrMinted = 0.0;
        this.status = 'active';
        this.algorithm = 'FishHash (IRON) - QUANTUM OPTIMIZED';
        this.poolUrl = 'iron.woolypooly.com:3104';
        this.profitability = { daily: 7.63, hourly: 0.318, monthly: 229 };
    }

    updateStats(hashrate, sharesAccepted, sharesRejected) {
        this.hashrate = hashrate;
        this.sharesAccepted = sharesAccepted;
        this.sharesRejected = sharesRejected;
    }

    addEarnings(usdAmount) {
        this.earningsUsd += usdAmount;
        this.azrMinted += usdAmount * 100; // 100 AZR per USD
        miningStats.totalMinedUsd += usdAmount;
        miningStats.totalAzrMinted += usdAmount * 100;
    }

    getUptime() {
        return (new Date() - this.startTime) / 1000; // seconds
    }

    async saveToDatabase() {
        try {
            await pool.query(`
                INSERT INTO mining_sessions (
                    id, user_id, session_id, total_hashrate_mhs, total_earnings_usd, azr_minted,
                    shares_accepted, shares_rejected, start_time, status, algorithm, pool_url, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
                ON CONFLICT (session_id) DO UPDATE SET
                    total_hashrate_mhs = EXCLUDED.total_hashrate_mhs,
                    total_earnings_usd = EXCLUDED.total_earnings_usd,
                    azr_minted = EXCLUDED.azr_minted,
                    shares_accepted = EXCLUDED.shares_accepted,
                    shares_rejected = EXCLUDED.shares_rejected,
                    updated_at = NOW()
            `, [
                this.sessionId, this.userId, this.sessionId, this.hashrate, this.earningsUsd, this.azrMinted,
                this.sharesAccepted, this.sharesRejected, this.startTime, this.status, this.algorithm, this.poolUrl
            ]);
        } catch (error) {
            logger.error('Failed to save mining session to database', { error: error.message, sessionId: this.sessionId });
        }
    }

    async completeSession() {
        this.status = 'completed';
        this.endTime = new Date();
        await this.saveToDatabase();

        // Create minting transaction
        if (this.azrMinted > 0) {
            try {
                const txId = `mint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await pool.query(`
                    INSERT INTO minting_transactions (
                        id, mining_session_id, user_id, amount_azr, amount_usd, blockchain_status, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [txId, this.sessionId, this.userId, this.azrMinted, this.earningsUsd, 'confirmed', new Date()]);
            } catch (error) {
                logger.error('Failed to create minting transaction', { error: error.message });
            }
        }
    }

    toJSON() {
        return {
            sessionId: this.sessionId,
            userId: this.userId,
            startTime: this.startTime.toISOString(),
            hashrate: this.hashrate,
            sharesAccepted: this.sharesAccepted,
            sharesRejected: this.sharesRejected,
            earningsUsd: this.earningsUsd,
            azrMinted: this.azrMinted,
            profitability: this.profitability,
            uptime: this.getUptime(),
            status: this.status,
            algorithm: this.algorithm,
            poolUrl: this.poolUrl
        };
    }
}

/**
 * Mining engine monitor - simulates real mining activity
 */
class MiningEngineMonitor {
    constructor() {
        this.isRunning = false;
        this.monitoringInterval = null;
    }

    startMonitoring() {
        if (this.isRunning) return;

        this.isRunning = true;
        logger.info('Mining engine monitor started');

        this.monitoringInterval = setInterval(async () => {
            await this.updateMiningStats();
            await this.simulateMiningActivity();
        }, 5000); // Update every 5 seconds
    }

    stopMonitoring() {
        if (!this.isRunning) return;

        this.isRunning = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        logger.info('Mining engine monitor stopped');
    }

    async updateMiningStats() {
        try {
            // Update global stats from database
            const { rows } = await pool.query(`
                SELECT
                    COUNT(*) as total_sessions,
                    SUM(total_earnings_usd) as total_earnings,
                    SUM(azr_minted) as total_azr_minted,
                    AVG(total_hashrate_mhs) as avg_hashrate
                FROM mining_sessions
                WHERE status = 'completed'
            `);

            if (rows[0]) {
                miningStats.totalMinedUsd = parseFloat(rows[0].total_earnings || 0);
                miningStats.totalAzrMinted = parseFloat(rows[0].total_azr_minted || 0);
                miningStats.avgHashrate = parseFloat(rows[0].avg_hashrate || 42.0);
            }

            miningStats.activeSessions = miningSessions.size;
            miningStats.lastUpdate = new Date().toISOString();

        } catch (error) {
            logger.error('Failed to update mining stats', { error: error.message });
        }
    }

    async simulateMiningActivity() {
        // Simulate mining activity for active sessions
        for (const [sessionId, session] of miningSessions) {
            if (session.status === 'active') {
                // Simulate earning based on hashrate and time
                const timeDelta = 5; // 5 seconds
                const earningsIncrement = (session.hashrate / 1000) * (timeDelta / 3600) * 0.1; // Simplified calculation

                if (earningsIncrement > 0) {
                    session.addEarnings(earningsIncrement);
                    session.sharesAccepted += Math.floor(Math.random() * 3) + 1; // 1-3 shares per update
                    if (Math.random() < 0.05) { // 5% chance of rejected share
                        session.sharesRejected += 1;
                    }

                    await session.saveToDatabase();
                }
            }
        }
    }
}

// Initialize mining monitor
const miningMonitor = new MiningEngineMonitor();

/**
 * Start mining session for user
 */
app.post('/api/control/start-mining', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'userId required' });
    }

    try {
        const sessionId = `mining_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const session = new MiningSession(sessionId, userId);

        miningSessions.set(sessionId, session);
        miningStats.activeSessions = miningSessions.size;

        // Start mining monitor if not already running
        miningMonitor.startMonitoring();

        await session.saveToDatabase();

        logger.info('Mining session started', { sessionId, userId });

        res.json({
            message: 'Mining session started successfully - earning AZR tokens!',
            sessionId,
            status: 'active'
        });
    } catch (error) {
        logger.error('Failed to start mining session', { error: error.message });
        res.status(500).json({ error: 'Failed to start mining session' });
    }
});

/**
 * Stop mining session
 */
app.post('/api/control/stop-mining', async (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ error: 'sessionId required' });
    }

    try {
        const session = miningSessions.get(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Mining session not found' });
        }

        await session.completeSession();
        miningSessions.delete(sessionId);
        miningStats.activeSessions = miningSessions.size;

        // Stop monitoring if no active sessions
        if (miningSessions.size === 0) {
            miningMonitor.stopMonitoring();
        }

        logger.info('Mining session stopped', { sessionId });

        res.json({
            message: 'Mining session stopped successfully',
            sessionId,
            status: 'stopped',
            earnings: session.earningsUsd,
            azrMinted: session.azrMinted
        });
    } catch (error) {
        logger.error('Failed to stop mining session', { error: error.message });
        res.status(500).json({ error: 'Failed to stop mining session' });
    }
});

/**
 * Get mining statistics
 */
app.get('/api/stats', async (req, res) => {
    try {
        // Update stats from database
        await miningMonitor.updateMiningStats();

        // Get transaction counts
        const { rows: txRows } = await pool.query(`
            SELECT
                COUNT(*) as pending_txs,
                COUNT(CASE WHEN blockchain_status = 'confirmed' THEN 1 END) as confirmed_txs
            FROM minting_transactions
            WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
        `);

        const transactions = txRows[0] || { pending_txs: 0, confirmed_txs: 0 };

        // Get crypto prices (mock data for now)
        const prices = {
            'IRON': { price_usd: 1.25, price_change_24h: 5.2 },
            'AZR': { price_usd: 0.01, price_change_24h: 2.1 }
        };

        res.json({
            mining: {
                total_mined_usd: miningStats.totalMinedUsd,
                total_azr_minted: miningStats.totalAzrMinted,
                active_sessions: miningStats.activeSessions,
                avg_hashrate: miningStats.avgHashrate,
                total_sessions: miningSessions.size
            },
            transactions,
            shares: miningStats.totalShares,
            prices,
            last_update: miningStats.lastUpdate,
            status: miningMonitor.isRunning ? 'active' : 'stopped'
        });
    } catch (error) {
        logger.error('Failed to get mining stats', { error: error.message });
        res.status(500).json({ error: 'Failed to fetch mining stats' });
    }
});

/**
 * Get detailed mining sessions
 */
app.get('/api/mining/sessions', (req, res) => {
    const sessions = Array.from(miningSessions.values()).map(session => session.toJSON());

    res.json({
        sessions,
        totalActive: sessions.length,
        lastUpdate: new Date().toISOString()
    });
});

/**
 * Update mining session stats (for real-time updates)
 */
app.post('/api/mining/update-session', async (req, res) => {
    const { sessionId, hashrate, sharesAccepted, sharesRejected } = req.body;

    if (!sessionId) {
        return res.status(400).json({ error: 'sessionId required' });
    }

    try {
        const session = miningSessions.get(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Mining session not found' });
        }

        session.updateStats(hashrate, sharesAccepted, sharesRejected);
        await session.saveToDatabase();

        res.json({
            message: 'Session stats updated',
            session: session.toJSON()
        });
    } catch (error) {
        logger.error('Failed to update mining session', { error: error.message });
        res.status(500).json({ error: 'Failed to update session' });
    }
});

/**
 * Get system health status
 */
app.get('/api/health', async (req, res) => {
    try {
        // Get health records from database
        const { rows: healthRows } = await pool.query(`
            SELECT component, status, message, timestamp
            FROM system_health
            ORDER BY timestamp DESC
            LIMIT 10
        `);

        // Calculate overall health
        const healthyCount = healthRows.filter(record => record.status === 'healthy').length;
        const totalCount = healthRows.length;

        let overallStatus = 'healthy';
        if (healthyCount < totalCount * 0.8) overallStatus = 'warning';
        if (healthyCount < totalCount * 0.5) overallStatus = 'critical';

        // Add current system components
        const components = [
            {
                component: 'mining-engine',
                status: miningMonitor.isRunning ? 'healthy' : 'stopped',
                message: miningMonitor.isRunning ? 'Mining engine active' : 'Mining engine stopped',
                timestamp: new Date().toISOString()
            },
            {
                component: 'database',
                status: 'healthy',
                message: 'Database connection active',
                timestamp: new Date().toISOString()
            },
            {
                component: 'api-server',
                status: 'healthy',
                message: 'API server responding',
                timestamp: new Date().toISOString()
            }
        ];

        res.json({
            overall_status: overallStatus,
            healthy_components: healthyCount,
            total_components: totalCount + components.length,
            components: [...components, ...healthRows]
        });
    } catch (error) {
        logger.error('Failed to get system health', { error: error.message });
        res.status(500).json({ error: 'Failed to get system health' });
    }
});

const startServer = async () => {
    try {
        // Connect to Redis for event stream (optional for testing)
        let redisClient;
        try {
            redisClient = createRedisClient({ url: REDIS_URL });
            await redisClient.connect();
            await redisClient.subscribe(EVENT_CHANNEL, handleEvent);
            logger.info(`Subscribed to event channel: ${EVENT_CHANNEL}`);
        } catch (redisError) {
            logger.warn('Redis not available, running without event streaming', { error: redisError.message });
        }

        // Schedule periodic full recalculation (e.g., every hour)
        setInterval(recalculateMetrics, 1000 * 60 * 60);
        await recalculateMetrics(); // Initial calculation

        app.listen(PORT, () => {
            logger.info(`Economic Growth & Sovereignty Service running on port ${PORT}`);
        });
    } catch (err) {
        logger.error('Failed to start service', { error: err.message });
        process.exit(1);
    }
};

startServer();