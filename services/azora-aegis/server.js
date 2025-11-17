const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4006;

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'azora-aegis',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    security: 'active'
  });
});

// Security monitoring endpoints
app.get('/api/security/status', (req, res) => {
  res.json({
    threats: 0,
    alerts: 0,
    status: 'secure'
  });
});

app.post('/api/security/alert', (req, res) => {
  res.json({ received: true });
});

app.listen(PORT, () => {
  console.log(`Azora Aegis running on port ${PORT}`);
});