const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for educational content
});

// Initialize OpenAI for AI-powered assessments
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'education-service' });
});

// Create curriculum
app.post('/curricula', async (req, res) => {
  try {
    const { title, description, subject, grade, objectives } = req.body;

    if (!title || !subject || !grade) {
      return res.status(400).json({ error: 'Title, subject, and grade are required' });
    }

    const curriculum = await prisma.curriculum.create({
      data: {
        title,
        description,
        subject,
        grade,
        objectives: objectives ? JSON.parse(objectives) : null
      }
    });

    res.json({ success: true, curriculum });
  } catch (error) {
    console.error('Create curriculum error:', error);
    res.status(500).json({ error: 'Failed to create curriculum' });
  }
});

// Get curricula
app.get('/curricula', async (req, res) => {
  try {
    const { subject, grade, status } = req.query;
    const where = {};

    if (subject) where.subject = subject;
    if (grade) where.grade = grade;
    if (status) where.status = status;

    const curricula = await prisma.curriculum.findMany({
      where,
      include: {
        _count: {
          select: { modules: true, assessments: true }
        }
      }
    });

    res.json({ curricula });
  } catch (error) {
    console.error('Get curricula error:', error);
    res.status(500).json({ error: 'Failed to get curricula' });
  }
});

// Get curriculum details
app.get('/curricula/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const curriculum = await prisma.curriculum.findUnique({
      where: { id },
      include: {
        modules: {
          include: {
            lessons: true,
            _count: {
              select: { lessons: true }
            }
          },
          orderBy: { order: 'asc' }
        },
        assessments: true
      }
    });

    if (!curriculum) {
      return res.status(404).json({ error: 'Curriculum not found' });
    }

    res.json({ curriculum });
  } catch (error) {
    console.error('Get curriculum error:', error);
    res.status(500).json({ error: 'Failed to get curriculum' });
  }
});

// Create module
app.post('/curricula/:curriculumId/modules', async (req, res) => {
  try {
    const { curriculumId } = req.params;
    const { title, description, order, content, duration, prerequisites } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const module = await prisma.module.create({
      data: {
        curriculumId,
        title,
        description,
        order: order || 0,
        content: content ? JSON.parse(content) : null,
        duration: duration ? parseInt(duration) : null,
        prerequisites: prerequisites ? JSON.parse(prerequisites) : null
      }
    });

    res.json({ success: true, module });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ error: 'Failed to create module' });
  }
});

// Create lesson
app.post('/modules/:moduleId/lessons', async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, content, type, resources, order } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const lesson = await prisma.lesson.create({
      data: {
        moduleId,
        title,
        content,
        type: type || 'text',
        resources: resources ? JSON.parse(resources) : null,
        order: order || 0
      }
    });

    res.json({ success: true, lesson });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// Create assessment
app.post('/curricula/:curriculumId/assessments', async (req, res) => {
  try {
    const { curriculumId } = req.params;
    const { title, description, type, questions, passingScore, timeLimit, attempts } = req.body;

    if (!title || !questions) {
      return res.status(400).json({ error: 'Title and questions are required' });
    }

    const assessment = await prisma.assessment.create({
      data: {
        curriculumId,
        title,
        description,
        type: type || 'quiz',
        questions: JSON.parse(questions),
        passingScore: passingScore ? parseFloat(passingScore) : 70,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        attempts: attempts ? parseInt(attempts) : 1
      }
    });

    res.json({ success: true, assessment });
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

// Start assessment
app.post('/assessments/:assessmentId/start', async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: 'studentId is required' });
    }

    const assessment = await prisma.assessment.findUnique({
      where: { assessmentId }
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Check attempt limit
    const previousSubmissions = await prisma.submission.count({
      where: {
        assessmentId,
        studentId
      }
    });

    if (previousSubmissions >= assessment.attempts) {
      return res.status(400).json({ error: 'Maximum attempts reached' });
    }

    const submission = await prisma.submission.create({
      data: {
        assessmentId,
        studentId,
        attemptNumber: previousSubmissions + 1
      }
    });

    res.json({ success: true, submission, assessment });
  } catch (error) {
    console.error('Start assessment error:', error);
    res.status(500).json({ error: 'Failed to start assessment' });
  }
});

// Submit assessment
app.post('/submissions/:submissionId/submit', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { answers } = req.body;

    if (!answers) {
      return res.status(400).json({ error: 'Answers are required' });
    }

    const submission = await prisma.submission.findUnique({
      where: { submissionId },
      include: { assessment: true }
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (submission.submittedAt) {
      return res.status(400).json({ error: 'Assessment already submitted' });
    }

    // Calculate score (simplified - would need more complex grading logic)
    const score = calculateScore(submission.assessment.questions, JSON.parse(answers));
    const passed = score >= submission.assessment.passingScore;

    const updatedSubmission = await prisma.submission.update({
      where: { submissionId },
      data: {
        answers: JSON.parse(answers),
        score,
        passed,
        submittedAt: new Date(),
        gradedAt: new Date()
      }
    });

    res.json({ success: true, submission: updatedSubmission });
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({ error: 'Failed to submit assessment' });
  }
});

// Get student submissions
app.get('/students/:studentId/submissions', async (req, res) => {
  try {
    const { studentId } = req.params;

    const submissions = await prisma.submission.findMany({
      where: { studentId },
      include: {
        assessment: {
          include: {
            curriculum: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    res.json({ submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to get submissions' });
  }
});

// Create certification
app.post('/certifications', async (req, res) => {
  try {
    const { curriculumId, title, description, issuer, criteria, template, validFor } = req.body;

    if (!title || !issuer || !criteria) {
      return res.status(400).json({ error: 'Title, issuer, and criteria are required' });
    }

    const certification = await prisma.certification.create({
      data: {
        curriculumId,
        title,
        description,
        issuer,
        criteria: JSON.parse(criteria),
        template: template ? JSON.parse(template) : null,
        validFor: validFor ? parseInt(validFor) : null
      }
    });

    res.json({ success: true, certification });
  } catch (error) {
    console.error('Create certification error:', error);
    res.status(500).json({ error: 'Failed to create certification' });
  }
});

// Award certification
app.post('/certifications/:certificationId/award', async (req, res) => {
  try {
    const { certificationId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: 'studentId is required' });
    }

    const certification = await prisma.certification.findUnique({
      where: { certificationId }
    });

    if (!certification) {
      return res.status(404).json({ error: 'Certification not found' });
    }

    const expiresAt = certification.validFor
      ? new Date(Date.now() + certification.validFor * 30 * 24 * 60 * 60 * 1000)
      : null;

    const award = await prisma.certificationAward.create({
      data: {
        certificationId,
        studentId,
        expiresAt
      }
    });

    res.json({ success: true, award });
  } catch (error) {
    console.error('Award certification error:', error);
    res.status(500).json({ error: 'Failed to award certification' });
  }
});

// Get student certifications
app.get('/students/:studentId/certifications', async (req, res) => {
  try {
    const { studentId } = req.params;

    const awards = await prisma.certificationAward.findMany({
      where: { studentId },
      include: {
        certification: true
      }
    });

    res.json({ certifications: awards });
  } catch (error) {
    console.error('Get certifications error:', error);
    res.status(500).json({ error: 'Failed to get certifications' });
  }
});

// Helper function to calculate assessment score
function calculateScore(questions, answers) {
  let totalScore = 0;
  let maxScore = 0;

  questions.forEach((question, index) => {
    maxScore += question.points || 1;
    const userAnswer = answers[index];

    if (userAnswer && userAnswer === question.correctAnswer) {
      totalScore += question.points || 1;
    }
  });

  return maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = process.env.PORT || 3007;
app.listen(PORT, async () => {
  console.log(`🎓 Azora Education Service running on port ${PORT}`);
  console.log(`📚 Curricula: GET/POST http://localhost:${PORT}/curricula`);
  console.log(`📖 Modules: POST http://localhost:${PORT}/curricula/:id/modules`);
  console.log(`📝 Assessments: POST http://localhost:${PORT}/curricula/:id/assessments`);
  console.log(`🏆 Certifications: GET/POST http://localhost:${PORT}/certifications`);

  try {
    await prisma.$connect();
    console.log('🗄️  Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
});