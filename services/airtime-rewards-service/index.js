const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3023;

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'airtime-rewards-service', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => console.log(`airtime-rewards-service running on port ${PORT}`));

module.exports = app;
