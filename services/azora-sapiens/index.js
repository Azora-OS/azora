require('dotenv').config();
const express = require('express');
const compression = require('compression');
const { helmetConfig, corsConfig, rateLimiters, errorHandler, authenticate } = require('../shared/middleware');

const app = express();
const PORT = process.env.PORT || 3075;

// Security middleware stack
app.use(helmetConfig);
app.use(corsConfig);
app.use(compression());
app.use(express.json());
app.use(rateLimiters.general);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'azora-sapiens',
    timestamp: new Date().toISOString()
  });
});

// Real-time tutoring chat
app.post('/api/chat/start', authenticate, async (req, res) => {
  try {
    const studentId = req.user.userId;
    const { subject } = req.body;
    const RealTimeChatEngine = require('./src/engines/real-time-chat').default;
    const sessionId = await RealTimeChatEngine.startSession(studentId, subject);
    res.json({ success: true, data: { sessionId } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/chat/message', authenticate, async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const RealTimeChatEngine = require('./src/engines/real-time-chat').default;
    const response = await RealTimeChatEngine.sendMessage(sessionId, message);
    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/chat/history/:sessionId', authenticate, async (req, res) => {
  try {
    const RealTimeChatEngine = require('./src/engines/real-time-chat').default;
    const history = RealTimeChatEngine.getSessionHistory(req.params.sessionId);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Personalized learning paths
app.post('/api/learning-path', authenticate, (req, res) => {
  try {
    const studentId = req.user.userId;
    const { goal } = req.body;
    const studentProfile = { ...req.body.studentProfile, studentId };
    const LearningPathEngine = require('./src/engines/learning-paths').default;
    const path = LearningPathEngine.generatePath(studentProfile, goal);
    res.json({ success: true, data: path });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Adaptive curriculum
app.post('/api/curriculum/adjust', authenticate, (req, res) => {
  try {
    const studentId = req.user.userId;
    const performance = { ...req.body, studentId };
    const AdaptiveCurriculum = require('./src/engines/adaptive-curriculum').default;
    const adjustment = AdaptiveCurriculum.adjustCurriculum(performance);
    res.json({ success: true, data: adjustment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Knowledge assessment
app.post('/api/assessment/diagnostic', authenticate, (req, res) => {
  try {
    const { subject, topics } = req.body;
    const KnowledgeAssessment = require('./src/engines/knowledge-assessment').default;
    const test = KnowledgeAssessment.createDiagnosticTest(subject, topics);
    res.json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/assessment/analyze', authenticate, (req, res) => {
  try {
    const studentId = req.user.userId;
    const { subject, topicScores } = req.body;
    const KnowledgeAssessment = require('./src/engines/knowledge-assessment').default;
    const results = KnowledgeAssessment.analyzeResults(studentId, subject, topicScores);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/assessment', authenticate, (req, res) => {
  try {
    const { subject, level, questionCount } = req.body;
    const AssessmentEngine = require('./src/engines/assessment-engine').default;
    const assessment = AssessmentEngine.createAssessment(subject, level, questionCount);
    res.json({ success: true, data: assessment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Progress tracking
app.post('/api/progress/track', authenticate, (req, res) => {
  try {
    const studentId = req.user.userId;
    const activity = { ...req.body, studentId };
    const ProgressTracker = require('./src/engines/progress-tracker').default;
    const progress = ProgressTracker.trackProgress(studentId, activity);
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/progress/:studentId', authenticate, (req, res) => {
  try {
    const { activities } = req.body;
    const ProgressTracker = require('./src/engines/progress-tracker').default;
    const summary = ProgressTracker.getStudentProgress(req.params.studentId, activities || []);
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🤖 Azora Sapiens (AI Tutor) running on port ${PORT}`);
  console.log(`🌍 Health: http://localhost:${PORT}/health`);
  console.log(`✅ Real-time chat enabled`);
  console.log(`✅ Personalized learning paths enabled`);
  console.log(`✅ Adaptive curriculum enabled`);
  console.log(`✅ Knowledge assessment enabled`);
  console.log(`✅ Progress tracking enabled`);
});

module.exports = app;
