import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4010;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'payments',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Payment endpoints
app.post('/api/payments', (req, res) => {
  res.json({
    success: true,
    transactionId: `tx_${Date.now()}`,
    amount: req.body.amount,
    currency: req.body.currency || 'AZR',
    status: 'completed'
  });
});

app.get('/api/payments/:id', (req, res) => {
  res.json({
    id: req.params.id,
    amount: 100,
    currency: 'AZR',
    status: 'completed',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/balance/:userId', (req, res) => {
  res.json({
    userId: req.params.userId,
    balance: 1500,
    currency: 'AZR',
    lastUpdated: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`💳 Payments service running on port ${PORT}`);
  console.log(`💰 Payments: http://localhost:${PORT}/api/payments`);
  console.log(`💵 Balance: http://localhost:${PORT}/api/balance/:userId`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});