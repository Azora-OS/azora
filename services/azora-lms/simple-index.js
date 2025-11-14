const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'azora-ubuntu-constitutional-ai-secret-2025';

// Mock courses database
const courses = [
  {
    id: 1,
    title: 'Introduction to Ubuntu Philosophy',
    description: 'Learn the foundational principles of Ubuntu: "I am because we are"',
    isPublished: true,
    instructor: 'Elara AI',
    duration: '4 weeks',
    students: 1250
  },
  {
    id: 2,
    title: 'Constitutional AI Fundamentals',
    description: 'Understanding how AI systems can embody constitutional principles',
    isPublished: true,
    instructor: 'Sankofa AI',
    duration: '6 weeks',
    students: 890
  },
  {
    id: 3,
    title: 'Azora Token Economics',
    description: 'Master the AZR cryptocurrency and proof-of-knowledge mining',
    isPublished: true,
    instructor: 'Kofi AI',
    duration: '3 weeks',
    students: 567
  }
];

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'lms' });
});

// Get all courses
app.get('/api/courses', authenticateToken, (req, res) => {
  res.json({ success: true, data: courses });
});

// Get specific course
app.get('/api/courses/:id', authenticateToken, (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if (!course) {
    return res.status(404).json({ success: false, error: 'Course not found' });
  }
  res.json({ success: true, data: course });
});

// Enroll in course
app.post('/api/courses/:id/enroll', authenticateToken, (req, res) => {
  const course = courses.find(c => c.id === parseInt(req.params.id));
  if (!course) {
    return res.status(404).json({ success: false, error: 'Course not found' });
  }
  
  res.json({ 
    success: true, 
    message: `Successfully enrolled in ${course.title}`,
    enrollment: {
      courseId: course.id,
      userId: req.user.userId,
      enrolledAt: new Date().toISOString(),
      progress: 0
    }
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🎓 Simple LMS Service running on port ${PORT}`);
});