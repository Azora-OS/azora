const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
    credentials: true
}));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: { error: 'Rate limit exceeded', ubuntu: 'Please slow down for community harmony' }
});
app.use(limiter);

// Health Check
app.get('/health', (req, res) => {
    res.json({
        service: 'azora-auth',
        status: 'healthy',
        ubuntu: 'I serve because we prosper together',
        timestamp: new Date().toISOString(),
        port: PORT,
        database: process.env.DATABASE_URL ? 'configured' : 'not configured'
    });
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
    res.json({
        philosophy: 'Ngiyakwazi ngoba sikwazi - I can because we can',
        principles: [
            'My success enables your success',
            'My knowledge becomes our knowledge',
            'My work strengthens our foundation',
            'My security ensures our freedom'
        ],
        service: 'azora-auth',
        ubuntu: 'Ubuntu service excellence'
    });
});

// Basic auth endpoints (simplified for Phase 1)
app.post('/api/auth/register', (req, res) => {
    res.json({
        message: 'Registration endpoint - Phase 1 MVP',
        ubuntu: 'Full implementation in Phase 2'
    });
});

app.post('/api/auth/login', (req, res) => {
    res.json({
        message: 'Login endpoint - Phase 1 MVP',
        ubuntu: 'Full implementation in Phase 2'
    });
});

app.get('/api/auth/status', (req, res) => {
    res.json({
        service: 'azora-auth',
        status: 'operational',
        ubuntu: 'Ubuntu service ready'
    });
});

// Error Handling
app.use((error, req, res, next) => {
    console.error('Service Error:', error);
    res.status(500).json({
        error: 'Service error',
        ubuntu: 'We handle errors with Ubuntu grace',
        timestamp: new Date().toISOString()
    });
});

// Start Service
app.listen(PORT, () => {
    console.log(`🚀 azora-auth running on port ${PORT}`);
    console.log('⚡ Ubuntu: "I serve because we prosper together!"');
    console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});
