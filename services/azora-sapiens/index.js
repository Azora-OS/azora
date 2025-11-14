require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3075;

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'azora-sapiens',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/tutor', async (req, res) => {
  try {
    const { studentId, subject, question } = req.body;
    const TutorEngine = require('./src/engines/tutor-engine').default;
    const result = await TutorEngine.tutorSession(studentId, subject, question);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/learning-path', (req, res) => {
  try {
    const { studentProfile, goal } = req.body;
    const LearningPathEngine = require('./src/engines/learning-paths').default;
    const path = LearningPathEngine.generatePath(studentProfile, goal);
    res.json({ success: true, data: path });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/assessment', (req, res) => {
  try {
    const { subject, level, questionCount } = req.body;
    const AssessmentEngine = require('./src/engines/assessment-engine').default;
    const assessment = AssessmentEngine.createAssessment(subject, level, questionCount);
    res.json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🤖 Azora Sapiens (AI Tutor) running on port ${PORT}`);
  console.log(`🌍 Health: http://localhost:${PORT}/health`);
});

module.exports = app;
