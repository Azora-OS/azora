const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 3008;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/webhook', express.raw({ type: 'application/json' }));

app.use('/api/payments', paymentRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'payment-service',
    features: ['Stripe', 'Webhooks', 'Transactions']
  });
});

app.listen(PORT, () => {
  console.log(`💳 Payment Service running on port ${PORT}`);
  console.log('✅ Stripe Integration: Active');
});

module.exports = app;
