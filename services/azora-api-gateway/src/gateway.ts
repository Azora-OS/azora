import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import { authMiddleware, optionalAuth } from './auth-middleware';
import { BlockchainService } from '../../azora-blockchain/src/blockchain-service';
import { ConstitutionalEngine } from '../../constitutional-ai/src/constitutional-engine';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Services
const blockchain = new BlockchainService();
const engine = new ConstitutionalEngine();

// Redis client for rate limiting
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    retryStrategy: () => null, // Don't retry if Redis is down (graceful degradation)
});

// Rate limiter configuration
const limiter = rateLimit({
    store: new RedisStore({
        // @ts-ignore - Type mismatch but works
        client: redis,
        prefix: 'rl:',
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(limiter);

// Logging Middleware
app.use((req, res, next) => {
    console.log(`[Gateway] ${req.method} ${req.path}`);
    next();
});

// Health Check (public)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'API Gateway' });
});

// --- Reputation Routes ---

app.get('/api/reputation/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const reputation = await blockchain.getReputationScore(address);
        res.json(reputation);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/reputation/update', async (req, res) => {
    try {
        const { address, change } = req.body;
        // In a real app, we'd verify the caller has admin rights or it's a system event
        const success = await blockchain.updateReputation(address, change);
        res.json({ success });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Auth endpoint (public) - for generating tokens
app.post('/api/auth/login', (req, res) => {
    // Mock login - in production, validate credentials
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    // Mock user validation
    const { generateToken } = require('./auth-middleware');
    const token = generateToken('user-123', email, 'user');

    res.json({ token, user: { id: 'user-123', email } });
});

// Service Routes Configuration
const routes = {
    '/api/blockchain': 'http://localhost:3001',
    '/api/mint': 'http://localhost:3002',
    '/api/constitutional': 'http://localhost:3003',
};

// Protected routes - require authentication
Object.entries(routes).forEach(([path, target]) => {
    app.use(path, authMiddleware, createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: {
            [`^${path}`]: '',
        },
        onError: (err, req, res) => {
            console.error(`[Gateway] Proxy error for ${path}:`, err.message);
            res.status(503).json({ error: 'Service temporarily unavailable' });
        },
    }));
});

// Export app for testing
export { app };

// Start Gateway only if run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`[Gateway] API Gateway running on port ${PORT}`);
        console.log(`[Gateway] Rate limiting: 100 req/15min per IP`);
        console.log(`[Gateway] JWT authentication: enabled`);
    });
}
