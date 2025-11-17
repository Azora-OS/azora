const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3018;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'azora-pay',
    timestamp: new Date().toISOString()
  });
});

// Basic payment processing endpoint
app.post('/api/payments', (req, res) => {
  // In a real implementation, this would integrate with payment providers
  const { amount, currency, description } = req.body;
  
  if (!amount || !currency) {
    return res.status(400).json({ 
      error: 'Amount and currency are required' 
    });
  }
  
  // Simulate payment processing
  res.status(200).json({
    success: true,
    paymentId: `pay_${Date.now()}`,
    amount,
    currency,
    description,
    status: 'processed',
    timestamp: new Date().toISOString()
  });
});

// Get payment status endpoint
app.get('/api/payments/:paymentId', (req, res) => {
  const { paymentId } = req.params;
  
  // Simulate fetching payment status
  res.status(200).json({
    paymentId,
    status: 'processed',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Azora Pay service running on port ${PORT}`);
});

module.exports = app;