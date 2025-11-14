const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3046;
const messages = [];

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'messaging-service', messages: messages.length });
});

app.post('/api/messages', (req, res) => {
  const { from, to, content } = req.body;
  const message = { id: Date.now().toString(), from, to, content, read: false, sentAt: new Date() };
  messages.push(message);
  res.json({ success: true, message });
});

app.get('/api/messages/:userId', (req, res) => {
  const userMessages = messages.filter(m => m.to === req.params.userId || m.from === req.params.userId);
  res.json({ success: true, messages: userMessages });
});

app.patch('/api/messages/:id/read', (req, res) => {
  const message = messages.find(m => m.id === req.params.id);
  if (!message) return res.status(404).json({ error: 'Not found' });
  message.read = true;
  res.json({ success: true, message });
});

const routes = require('./routes');
app.use(routes);

app.listen(port, () => console.log(`Messaging Service on port ${port}`));
module.exports = app;
