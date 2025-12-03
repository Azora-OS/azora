const express = require('express');
const compression = require('compression');
const { PrismaClient } = require('@prisma/client');
const { helmetConfig, corsConfig, createRateLimiter, errorHandler } = require('../shared/middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;
const SERVICE_NAME = process.env.SERVICE_NAME || 'azora-assessment';

// Initialize Prisma Client
const prisma = new PrismaClient();

// Security middleware stack
app.use(helmetConfig);
app.use(corsConfig);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(createRateLimiter(100));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: SERVICE_NAME,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Documentation
app.get('/', (req, res) => {
  res.json({ 
    service: SERVICE_NAME,
    version: '1.0.0',
    description: 'Azora Assessment Service - Quiz creation, auto-grading, performance analytics',
    endpoints: {
      'POST /api/assessments': 'Create a new assessment',
      'GET /api/assessments/:id': 'Get assessment by ID',
      'PUT /api/assessments/:id': 'Update assessment',
      'DELETE /api/assessments/:id': 'Delete assessment',
      'POST /api/assessments/:id/submit': 'Submit assessment answers',
      'GET /api/assessments/:id/results': 'Get assessment results',
      'GET /api/users/:userId/assessments': 'Get all assessments for a user',
      'GET /api/courses/:courseId/assessments': 'Get all assessments for a course',
      'POST /api/assessments/:id/grade': 'Grade assessment manually',
      'GET /api/analytics/user/:userId': 'Get user assessment analytics'
    }
  });
});

// Create a new assessment
app.post('/api/assessments', async (req, res) => {
  try {
    const { userId, courseId, type, title, questions, maxScore } = req.body;
    
    const assessment = await prisma.assessment.create({
      data: {
        userId,
        courseId,
        type,
        title,
        questions,
        maxScore,
        status: 'NOT_STARTED'
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Assessment created successfully',
      data: assessment 
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create assessment',
      message: error.message 
    });
  }
});

// Get assessment by ID
app.get('/api/assessments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const assessment = await prisma.assessment.findUnique({
      where: { id }
    });
    
    if (!assessment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Assessment not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: assessment 
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch assessment',
      message: error.message 
    });
  }
});

// Update assessment
app.put('/api/assessments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const assessment = await prisma.assessment.update({
      where: { id },
      data: updateData
    });
    
    res.json({ 
      success: true, 
      message: 'Assessment updated successfully',
      data: assessment 
    });
  } catch (error) {
    console.error('Error updating assessment:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Assessment not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update assessment',
      message: error.message 
    });
  }
});

// Delete assessment
app.delete('/api/assessments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.assessment.delete({
      where: { id }
    });
    
    res.json({ 
      success: true, 
      message: 'Assessment deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Assessment not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete assessment',
      message: error.message 
    });
  }
});

// Submit assessment answers
app.post('/api/assessments/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, answers } = req.body;
    
    // Fetch the assessment
    const assessment = await prisma.assessment.findUnique({
      where: { id }
    });
    
    if (!assessment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Assessment not found' 
      });
    }
    
    // Auto-grade the assessment
    const { score, maxScore } = autoGradeAssessment(assessment.questions, answers);
    const percentage = (score / maxScore) * 100;
    const passed = percentage >= 70; // Assuming 70% is passing
    
    // Update assessment status
    const updatedAssessment = await prisma.assessment.update({
      where: { id },
      data: {
        answers,
        score,
        status: 'GRADED',
        completedAt: new Date()
      }
    });
    
    // Create mining activity for assessment completion
    if (passed) {
      await prisma.miningActivity.create({
        data: {
          userId,
          activityType: 'ASSESSMENT_PASS',
          tokensEarned: 10, // Example token reward
          metadata: {
            assessmentId: id,
            score: percentage
          },
          status: 'VERIFIED'
        }
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Assessment submitted and graded successfully',
      data: {
        assessment: updatedAssessment,
        score,
        maxScore,
        percentage,
        passed
      }
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit assessment',
      message: error.message 
    });
  }
});

// Get assessment results
app.get('/api/assessments/:id/results', async (req, res) => {
  try {
    const { id } = req.params;
    
    const assessment = await prisma.assessment.findUnique({
      where: { id }
    });
    
    if (!assessment) {
      return res.status(404).json({ 
        success: false, 
        error: 'Assessment not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: {
        id: assessment.id,
        title: assessment.title,
        type: assessment.type,
        score: assessment.score,
        maxScore: assessment.maxScore,
        percentage: assessment.score && assessment.maxScore ? (assessment.score / assessment.maxScore) * 100 : null,
        status: assessment.status,
        completedAt: assessment.completedAt,
        passed: assessment.score && assessment.maxScore ? (assessment.score / assessment.maxScore) * 100 >= 70 : null
      }
    });
  } catch (error) {
    console.error('Error fetching assessment results:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch assessment results',
      message: error.message 
    });
  }
});

// Get all assessments for a user
app.get('/api/users/:userId/assessments', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const assessments = await prisma.assessment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      data: assessments 
    });
  } catch (error) {
    console.error('Error fetching user assessments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user assessments',
      message: error.message 
    });
  }
});

// Get all assessments for a course
app.get('/api/courses/:courseId/assessments', async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const assessments = await prisma.assessment.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ 
      success: true, 
      data: assessments 
    });
  } catch (error) {
    console.error('Error fetching course assessments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch course assessments',
      message: error.message 
    });
  }
});

// Grade assessment manually
app.post('/api/assessments/:id/grade', async (req, res) => {
  try {
    const { id } = req.params;
    const { score, feedback } = req.body;
    
    const assessment = await prisma.assessment.update({
      where: { id },
      data: {
        score,
        status: 'GRADED',
        completedAt: new Date()
      }
    });
    
    res.json({ 
      success: true, 
      message: 'Assessment graded successfully',
      data: assessment 
    });
  } catch (error) {
    console.error('Error grading assessment:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        success: false, 
        error: 'Assessment not found' 
      });
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to grade assessment',
      message: error.message 
    });
  }
});

// Get user assessment analytics
app.get('/api/analytics/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const assessments = await prisma.assessment.findMany({
      where: { userId }
    });
    
    const totalAssessments = assessments.length;
    const completedAssessments = assessments.filter(a => a.status === 'GRADED').length;
    const passedAssessments = assessments.filter(a => a.score && a.maxScore && (a.score / a.maxScore) * 100 >= 70).length;
    
    const averageScore = assessments.reduce((sum, a) => {
      if (a.score && a.maxScore) {
        return sum + (a.score / a.maxScore) * 100;
      }
      return sum;
    }, 0) / (assessments.filter(a => a.score && a.maxScore).length || 1);
    
    const passRate = totalAssessments > 0 ? (passedAssessments / totalAssessments) * 100 : 0;
    
    res.json({ 
      success: true, 
      data: {
        userId,
        totalAssessments,
        completedAssessments,
        passedAssessments,
        passRate,
        averageScore
      }
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user analytics',
      message: error.message 
    });
  }
});

// Auto-grade assessment function
function autoGradeAssessment(questions, answers) {
  let score = 0;
  let maxScore = 0;
  
  questions.forEach((question, index) => {
    maxScore += question.points || 1;
    
    const userAnswer = answers[index];
    const correctAnswer = question.correctAnswer;
    
    // For multiple choice questions
    if (question.type === 'multiple-choice' && userAnswer === correctAnswer) {
      score += question.points || 1;
    }
    // For true/false questions
    else if (question.type === 'true-false' && userAnswer === correctAnswer) {
      score += question.points || 1;
    }
    // For text-based questions, we'll need manual grading
    else if (question.type === 'text') {
      // Text questions require manual grading, so we don't add to score yet
    }
  });
  
  return { score, maxScore };
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ ${SERVICE_NAME} running on port ${PORT}`);
  });
}

// Export the autoGradeAssessment function for testing
module.exports = {
  app,
  autoGradeAssessment
};