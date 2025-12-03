import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
    console.log(`[Gateway] ${req.method} ${req.path}`);
    next();
});

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'API Gateway' });
});

// Service Routes Configuration
const routes = {
    '/api/blockchain': 'http://localhost:3001', // Placeholder for azora-blockchain
    '/api/mint': 'http://localhost:3002',       // Placeholder for azora-mint
    '/api/constitutional': 'http://localhost:3003', // Placeholder for constitutional-ai
};

// Setup Proxy Routes
Object.entries(routes).forEach(([path, target]) => {
    app.use(path, createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: {
            [`^${path}`]: '',
        },
    }));
});

// Export app for testing
export { app };

// Start Gateway only if run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`[Gateway] API Gateway running on port ${PORT}`);
    });
}
