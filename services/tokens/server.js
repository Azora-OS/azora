const express = require('express');
const app = express();
app.use(express.json());
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'tokens', ubuntu: 'I serve because we prosper together' });
});
module.exports = app;