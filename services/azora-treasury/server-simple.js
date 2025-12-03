const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3028;

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json());

// Mock data
const assets = [
    { id: 'ast_1', name: 'US Dollar Reserve', type: 'fiat', value: 1000000, currency: 'USD' },
    { id: 'ast_2', name: 'Azora Coin Reserve', type: 'crypto', value: 5000000, currency: 'AZC' }
];

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'azora-treasury', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api/assets', (req, res) => {
    res.json({ success: true, data: assets });
});

app.get('/api/assets/:id', (req, res) => {
    const asset = assets.find(a => a.id === req.params.id);
    if (!asset) return res.status(404).json({ success: false, error: 'Asset not found' });
    res.json({ success: true, data: asset });
});

app.listen(PORT, () => {
    console.log(`🏦 Azora Treasury running on port ${PORT}`);
});
