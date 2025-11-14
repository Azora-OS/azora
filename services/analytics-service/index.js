require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const routes = require('./routes');

const app = express();
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'analytics-service', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

const PORT = process.env.PORT || 3050;
app.listen(PORT, () => console.log(`✅ Analytics service on port ${PORT}`));
module.exports = app;
