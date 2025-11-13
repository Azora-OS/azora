require('dotenv').config();
const express = require('express');
const familyTreeRouter = require('./api/family-tree');
const chatRouter = require('./api/chat');

const app = express();
app.use(express.json());

app.use('/api/family', familyTreeRouter);
app.use('/api', chatRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'ai-family-service' });
});

const PORT = process.env.PORT || 4010;
app.listen(PORT, () => {
  console.log(`🤖 AI Family Service running on port ${PORT}`);
  console.log('👨‍👩‍👧‍👦 11 AI personalities ready: Elara, Themba, Naledi, Jabari, Amara, Sankofa, Kofi, Zola, Abeni, Thembo, Nexus');
});

module.exports = app;
