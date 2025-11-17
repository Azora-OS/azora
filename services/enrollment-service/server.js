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

// 📚 AZORA ENROLLMENT - COURSE REGISTRATION
console.log('🌟 Azora Enrollment Service - Initializing...');

const enrollments = new Map();
const waitlists = new Map();

// 🎯 API ROUTES
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'enrollment-service',
    ubuntu: 'I enroll because we learn together',
    enrollments: enrollments.size,
    timestamp: new Date().toISOString()
  });
});

// Enroll in course
app.post('/api/enrollments', (req, res) => {
  try {
    const { userId, courseId, paymentId } = req.body;
    
    const enrollment = {
      id: `enroll_${Date.now()}`,
      userId,
      courseId,
      paymentId,
      status: 'ACTIVE',
      enrolledAt: new Date().toISOString()
    };
    
    enrollments.set(enrollment.id, enrollment);
    
    res.status(201).json({
      success: true,
      message: 'Enrollment successful',
      data: enrollment
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to enroll' });
  }
});

// Get user enrollments
app.get('/api/users/:userId/enrollments', (req, res) => {
  try {
    const { userId } = req.params;
    
    const userEnrollments = Array.from(enrollments.values())
      .filter(e => e.userId === userId);
    
    res.json({
      success: true,
      data: userEnrollments,
      total: userEnrollments.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

const PORT = process.env.PORT || 3025;
app.listen(PORT, () => {
  console.log('🌟 Azora Enrollment Service running on port', PORT);
});

module.exports = app;