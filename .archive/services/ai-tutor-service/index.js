const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class AITutorService {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3057;
    this.sessions = new Map();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', service: 'ai-tutor-service', timestamp: new Date().toISOString() });
    });

    this.app.post('/api/tutor/session', this.createSession.bind(this));
    this.app.post('/api/tutor/ask', this.askQuestion.bind(this));
    this.app.get('/api/tutor/sessions/:userId', this.getSessions.bind(this));
    this.app.post('/api/tutor/feedback', this.submitFeedback.bind(this));
  }

  createSession(req, res) {
    const { userId, subject, level } = req.body;
    const sessionId = `SESSION-${Date.now()}`;
    const session = { sessionId, userId, subject, level, messages: [], createdAt: new Date() };
    this.sessions.set(sessionId, session);
    res.json({ session });
  }

  askQuestion(req, res) {
    const { sessionId, question } = req.body;
    const session = this.sessions.get(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
    const answer = this.generateAnswer(question, session.subject);
    session.messages.push({ question, answer, timestamp: new Date() });
    res.json({ answer });
  }

  generateAnswer(question, subject) {
    return `Based on ${subject}, here's the answer: ${question.split(' ').reverse().join(' ')}`;
  }

  getSessions(req, res) {
    const sessions = Array.from(this.sessions.values()).filter(s => s.userId === req.params.userId);
    res.json({ sessions });
  }

  submitFeedback(req, res) {
    const { sessionId, rating, comment } = req.body;
    const session = this.sessions.get(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    session.feedback = { rating, comment, submittedAt: new Date() };
    res.json({ message: 'Feedback submitted' });
  }

  start() {
    this.app.use(require('./routes'));

app.listen(this.port, () => console.log(`AI Tutor Service running on port ${this.port}`));
  }
}

const service = new AITutorService();
if (require.main === module) service.start();
module.exports = service;
