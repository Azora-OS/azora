require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const routes = require('./routes');
const { notificationQueue } = require('./queue');

const app = express();
const PORT = process.env.PORT || 3037;

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'notification-service',
    queue: { waiting: notificationQueue.getWaitingCount(), active: notificationQueue.getActiveCount() },
    timestamp: new Date().toISOString() 
  });
});

app.use('/api', routes);

app.listen(PORT, () => console.log(`✅ Notification service on port ${PORT}`));

module.exports = app;
