const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3010;

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json());

// Mock data
const tokens = [
    { id: 'tkn_1', name: 'Azora Coin', symbol: 'AZC', supply: 1000000 },
    { id: 'tkn_2', name: 'Education Token', symbol: 'EDT', supply: 500000 }
];

const wallets = [
    { id: 'wlt_1', address: '0x123...abc', balance: 1000, token: 'AZC' },
    { id: 'wlt_2', address: '0x456...def', balance: 500, token: 'EDT' }
];

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'azora-mint', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api/tokens', (req, res) => {
    res.json({ success: true, data: tokens });
});

const requireMintRole = (req, res, next) => {
    const auth = req.headers['authorization'] || req.headers['Authorization'];
    if (!auth || typeof auth !== 'string') return res.status(401).json({ success: false, error: 'Missing authorization header' });
    const token = auth.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, error: 'Missing token' });
    try {
        const jwt = require('jsonwebtoken');
        const secret = process.env.JWT_SECRET || 'dev-secret';
        const payload = jwt.verify(token, secret);
        const roles = (payload && payload.roles) || [];
        if (!roles.includes('mint:tokens')) return res.status(403).json({ success: false, error: 'Insufficient role to mint' });
        next();
    } catch (e) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

app.post('/api/mint', requireMintRole, (req, res) => {
    const { name, symbol, amount } = req.body;
    const newToken = {
        id: `tkn_${Date.now()}`,
        name,
        symbol,
        supply: amount
    };
    tokens.push(newToken);
    res.status(201).json({ success: true, data: newToken });
});

app.get('/api/wallets/:address', (req, res) => {
    const wallet = wallets.find(w => w.address === req.params.address);
    if (!wallet) return res.status(404).json({ success: false, error: 'Wallet not found' });
    res.json({ success: true, data: wallet });
});

const server = app.listen(PORT, () => {
    console.log(`🪙 Azora Mint running on port ${PORT}`);
});

module.exports = app; // export the app for testing
