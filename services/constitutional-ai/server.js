const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'constitutional-ai',
    ubuntu: 'I serve because we prosper together',
    timestamp: new Date().toISOString() 
  });
});

module.exports = app;