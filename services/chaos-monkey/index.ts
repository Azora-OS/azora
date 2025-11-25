import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { ChaosScheduler } from './src/chaos-scheduler';
import { ChaosConfig } from './src/failure-types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3050;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Chaos configuration
const chaosConfig: ChaosConfig = {
    enabled: process.env.CHAOS_ENABLED === 'true',
    intensity: (process.env.CHAOS_INTENSITY as 'low' | 'medium' | 'high') || 'low',
    targetServices: [
        'azora-education',
        'azora-sapiens',
        'azora-marketplace',
        'azora-assessment'
    ],
    excludeServices: [
        'azora-auth',           // Never crash auth
        'azora-pay',            // Never crash payments
        'azora-mint',           // Never crash blockchain
        'constitutional-ai',    // Never crash the superego
        'phoenix-server'        // Never crash the recovery system
    ],
    schedule: {
        frequency: process.env.CHAOS_SCHEDULE || '0 2 * * *', // 2 AM daily
        duration: parseInt(process.env.CHAOS_DURATION || '30') // 30 minutes
    },
    requireApproval: process.env.CHAOS_REQUIRE_APPROVAL !== 'false'
};

const chaosScheduler = new ChaosScheduler(chaosConfig);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'chaos-monkey',
        enabled: chaosConfig.enabled,
        intensity: chaosConfig.intensity,
        timestamp: new Date().toISOString()
    });
});

// Get chaos history
app.get('/api/chaos/history', (req, res) => {
    try {
        const history = chaosScheduler.getHistory();
        res.json({
            success: true,
            data: history,
            count: history.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get active chaos events
app.get('/api/chaos/active', (req, res) => {
    try {
        const activeEvents = chaosScheduler.getActiveEvents();
        res.json({
            success: true,
            data: activeEvents,
            count: activeEvents.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Manually trigger chaos (requires approval)
app.post('/api/chaos/trigger', async (req, res) => {
    try {
        if (!chaosConfig.enabled) {
            return res.status(403).json({ error: 'Chaos Monkey is disabled' });
        }

        // This would trigger a single chaos event
        res.json({
            success: true,
            message: 'Manual chaos trigger not yet implemented'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start chaos scheduler if enabled
if (chaosConfig.enabled) {
    chaosScheduler.start();
    console.log('🐵 ChaosMonkey scheduler started');
} else {
    console.log('🐵 ChaosMonkey is DISABLED (set CHAOS_ENABLED=true to enable)');
}

app.listen(PORT, () => {
    console.log(`🐵 ChaosMonkey service running on port ${PORT}`);
});

export default app;
