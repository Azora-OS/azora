const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3012;

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json());

// Mock data
const transactions = [
    { id: 'tx_1', type: 'transfer', amount: 100, currency: 'AZC', from: 'wlt_1', to: 'wlt_2', status: 'completed', timestamp: new Date().toISOString() },
    { id: 'tx_2', type: 'mint', amount: 500, currency: 'EDT', to: 'wlt_2', status: 'completed', timestamp: new Date().toISOString() }
];

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'azora-ledger', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api/transactions', (req, res) => {
    res.json({ success: true, data: transactions });
});

app.post('/api/transactions', (req, res) => {
    const { type, amount, currency, from, to } = req.body;
    const newTx = {
        id: `tx_${Date.now()}`,
        type,
        amount,
        currency,
        from,
        to,
        status: 'pending',
        timestamp: new Date().toISOString()
    };
    transactions.push(newTx);
    res.status(201).json({ success: true, data: newTx });
});

app.get('/api/transactions/:id', (req, res) => {
    const tx = transactions.find(t => t.id === req.params.id);
    if (!tx) return res.status(404).json({ success: false, error: 'Transaction not found' });
    res.json({ success: true, data: tx });
});

app.listen(PORT, () => {
    console.log(`📒 Azora Ledger running on port ${PORT}`);
});
