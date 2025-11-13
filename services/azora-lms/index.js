require('dotenv').config();
const express = require('express');
const lmsRouter = require('./api/lms');

const app = express();
app.use(express.json());

app.use('/api/lms', lmsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'azora-lms' });
});

const PORT = process.env.PORT || 4040;
app.listen(PORT, () => {
  console.log(`📚 Azora LMS Service running on port ${PORT}`);
  console.log('🎓 Course creation, enrollment, and progress tracking active');
});

module.exports = app;
