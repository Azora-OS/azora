const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3059; // Dedicated port for Alerting

// Logger Setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' })
    ]
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'azora-alerting',
        timestamp: new Date().toISOString()
    });
});

// Alert Ingestion Endpoint
app.post('/api/alerts', (req, res) => {
    const { source, severity, message, metadata } = req.body;

    logger.info('Alert received', { source, severity, message, metadata });

    // TODO: Implement notification logic (Email, Slack, SMS)
    // TODO: Implement integration with Azora Event Bus

    res.status(202).json({ status: 'received', id: Date.now().toString() });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚨 Azora Alerting Service running on port ${PORT}`);
});
