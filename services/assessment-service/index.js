const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

class AssessmentService {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3058;
    this.assessments = new Map();
    this.submissions = new Map();
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
      res.json({ status: 'healthy', service: 'assessment-service', timestamp: new Date().toISOString() });
    });

    this.app.post('/api/assessments', this.createAssessment.bind(this));
    this.app.get('/api/assessments/:id', this.getAssessment.bind(this));
    this.app.post('/api/assessments/:id/submit', this.submitAssessment.bind(this));
    this.app.get('/api/submissions/:userId', this.getSubmissions.bind(this));
    this.app.post('/api/assessments/:id/grade', this.gradeAssessment.bind(this));
  }

  createAssessment(req, res) {
    const { title, courseId, questions, duration, passingScore } = req.body;
    const id = `ASSESS-${Date.now()}`;
    const assessment = { id, title, courseId, questions, duration, passingScore, createdAt: new Date() };
    this.assessments.set(id, assessment);
    res.status(201).json(assessment);
  }

  getAssessment(req, res) {
    const assessment = this.assessments.get(req.params.id);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    res.json(assessment);
  }

  submitAssessment(req, res) {
    const { userId, answers } = req.body;
    const assessment = this.assessments.get(req.params.id);
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    
    const submissionId = `SUB-${Date.now()}`;
    const score = this.calculateScore(assessment.questions, answers);
    const passed = score >= assessment.passingScore;
    
    const submission = { submissionId, assessmentId: assessment.id, userId, answers, score, passed, submittedAt: new Date() };
    this.submissions.set(submissionId, submission);
    res.json({ submission });
  }

  calculateScore(questions, answers) {
    let correct = 0;
    questions.forEach((q, i) => {
      if (q.correctAnswer === answers[i]) correct++;
    });
    return (correct / questions.length) * 100;
  }

  getSubmissions(req, res) {
    const submissions = Array.from(this.submissions.values()).filter(s => s.userId === req.params.userId);
    res.json({ submissions });
  }

  gradeAssessment(req, res) {
    const { submissionId, feedback } = req.body;
    const submission = this.submissions.get(submissionId);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    submission.feedback = feedback;
    submission.gradedAt = new Date();
    res.json({ submission });
  }

  start() {
    this.app.listen(this.port, () => console.log(`Assessment Service running on port ${this.port}`));
  }
}

const service = new AssessmentService();
if (require.main === module) service.start();
module.exports = service;
