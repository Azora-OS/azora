const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(compression());

// Input validation middleware
const validateInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/<script[^>]*>.*?<\/script>/gi, '');
        req.body[key] = req.body[key].replace(/javascript:/gi, '');
      }
    });
  }
  next();
};
app.use(validateInput);

app.use(express.json({ limit: '10mb' }));

// 📝 AZORA ASSESSMENT - INTELLIGENT TESTING
console.log('🌟 Azora Assessment Engine - Initializing...');

// Assessment data storage
const assessments = new Map();
const questions = new Map();
const results = new Map();

// 🎯 API ROUTES
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'azora-assessment',
    ubuntu: 'I assess because we learn together',
    assessments: assessments.size,
    questions: questions.size,
    timestamp: new Date().toISOString()
  });
});

// Create assessment
app.post('/api/assessments', (req, res) => {
  try {
    const { title, description, courseId, questions: questionList, timeLimit } = req.body;
    
    const assessment = {
      id: `assess_${Date.now()}`,
      title,
      description,
      courseId,
      questions: questionList || [],
      timeLimit: timeLimit || 60,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    
    assessments.set(assessment.id, assessment);
    
    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: assessment
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

// Get assessments
app.get('/api/assessments', (req, res) => {
  try {
    const { courseId } = req.query;
    let assessmentList = Array.from(assessments.values());
    
    if (courseId) {
      assessmentList = assessmentList.filter(a => a.courseId === courseId);
    }
    
    res.json({
      success: true,
      data: assessmentList,
      total: assessmentList.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// Submit assessment
app.post('/api/assessments/:id/submit', (req, res) => {
  try {
    const { id } = req.params;
    const { userId, answers } = req.body;
    
    const assessment = assessments.get(id);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    // Calculate score (simplified)
    const totalQuestions = assessment.questions.length;
    const correctAnswers = answers.filter((answer, index) => 
      answer === assessment.questions[index]?.correctAnswer
    ).length;
    
    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    
    const result = {
      id: `result_${Date.now()}`,
      assessmentId: id,
      userId,
      answers,
      score,
      totalQuestions,
      correctAnswers,
      submittedAt: new Date().toISOString()
    };
    
    results.set(result.id, result);
    
    res.json({
      success: true,
      message: 'Assessment submitted successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit assessment' });
  }
});

const PORT = process.env.PORT || 3011;
app.listen(PORT, () => {
  console.log('🌟 Azora Assessment Engine running on port', PORT);
  console.log('📝 Features: Intelligent Testing, Auto-grading, Analytics');
});

module.exports = app;