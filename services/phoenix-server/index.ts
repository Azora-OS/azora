import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { HealthMonitor } from './src/health-monitor';
import { RecoveryStrategies } from './src/recovery-strategies';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3051;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize health monitor and recovery
const healthMonitor = new HealthMonitor(30000); // Check every 30 seconds
const recoveryStrategies = new RecoveryStrategies();

// Register all 58 services for monitoring
const services = [
    { name: 'ai-orchestrator', port: 3014 },
    { name: 'azora-auth', port: 4001 },
    { name: 'azora-pay', port: 3010 },
    { name: 'azora-mint', port: 3011 },
    { name: 'azora-education', port: 3002 },
    { name: 'azora-sapiens', port: 3003 },
    { name: 'azora-marketplace', port: 3004 },
    { name: 'azora-assessment', port: 3005 },
    { name: 'constitutional-ai', port: 3015 },
    { name: 'chaos-monkey', port: 3050 }
    // Add all other services...
];

services.forEach(service => {
    healthMonitor.registerService(service.name, `http://localhost:${service.port}`);
});

// Start health monitoring
healthMonitor.start();

// Auto-recovery loop
setInterval(async () => {
    const unhealthyServices = healthMonitor.getUnhealthyServices();

    for (const service of unhealthyServices) {
        console.log(`🔥 Phoenix: Detected unhealthy service: ${service.name} (${service.status})`);
        await recoveryStrategies.attemptRecovery(service);
    }
}, 60000); // Check for recovery every minute

// Listen to recovery events
recoveryStrategies.on('recovery-attempted', (incident) => {
    console.log(`🔥 Phoenix Recovery:`, incident);
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'phoenix-server',
        monitoring: healthMonitor.getAllHealth().length,
        timestamp: new Date().toISOString()
    });
});

// Get all service health
app.get('/api/phoenix/services', (req, res) => {
    try {
        const services = healthMonitor.getAllHealth();
        res.json({
            success: true,
            data: services,
            count: services.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get unhealthy services
app.get('/api/phoenix/unhealthy', (req, res) => {
    try {
        const unhealthy = healthMonitor.getUnhealthyServices();
        res.json({
            success: true,
            data: unhealthy,
            count: unhealthy.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get recovery incidents
app.get('/api/phoenix/incidents', (req, res) => {
    try {
        const incidents = recoveryStrategies.getIncidents();
        res.json({
            success: true,
            data: incidents,
            count: incidents.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get recovery statistics
app.get('/api/phoenix/stats', (req, res) => {
    try {
        const stats = recoveryStrategies.getStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🔥 PhoenixServer running on port ${PORT}`);
    console.log(`   Monitoring ${services.length} services`);
    console.log(`   Auto-recovery: ACTIVE`);
});

export default app;
