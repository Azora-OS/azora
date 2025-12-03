const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4013;

// Ubuntu Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}));
app.use(express.json());

// Ubuntu Rate Limiting
const ubuntuLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Ubuntu rate limit exceeded', ubuntu: 'Please slow down for community harmony' }
});
app.use(ubuntuLimiter);

// Ubuntu Health Check
app.get('/health', (req, res) => {
  res.json({
    service: 'azora-education',
    status: 'healthy',
    ubuntu: 'I teach because we learn together',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Ubuntu Philosophy Endpoint
app.get('/api/ubuntu/philosophy', (req, res) => {
  res.json({
    philosophy: 'Ngiyakwazi ngoba sikwazi - I can because we can',
    principles: [
      'My success enables your success',
      'My knowledge becomes our knowledge',
      'My work strengthens our foundation',
      'My security ensures our freedom'
    ],
    service: 'azora-education',
    ubuntu: 'Ubuntu education through shared knowledge'
  });
});

// Education State
let courses = [];
let enrollments = [];
let certificates = [];
let progress = {};

// Course Categories
const CourseCategories = {
  BLOCKCHAIN: 'blockchain',
  AI: 'artificial-intelligence',
  UBUNTU: 'ubuntu-philosophy',
  DEVELOPMENT: 'software-development',
  BUSINESS: 'business-entrepreneurship',
  RESEARCH: 'research-methodology'
};

// Create Course
app.post('/api/courses', async (req, res) => {
  try {
    const { title, description, category, difficulty, duration, instructor, price, modules } = req.body;
    
    const course = {
      id: 'course-' + Date.now(),
      title,
      description,
      category,
      difficulty,
      duration,
      instructor,
      price: price || 0, // Ubuntu: Many courses are free
      modules: modules || [],
      status: 'published',
      createdAt: new Date().toISOString(),
      enrolled: 0,
      completed: 0,
      rating: 0,
      ubuntu: category === CourseCategories.UBUNTU ? 'Ubuntu philosophy course' : 'Standard course'
    };
    
    courses.push(course);
    
    console.log(`📚 Course Created: ${title} by ${instructor}`);
    
    res.json({ 
      success: true, 
      course: {
        id: course.id,
        title,
        category,
        difficulty,
        price: course.price,
        ubuntu: course.ubuntu
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Courses
app.get('/api/courses', async (req, res) => {
  try {
    const category = req.query.category;
    const difficulty = req.query.difficulty;
    const free = req.query.free === 'true';
    
    let filteredCourses = courses;
    
    if (category) {
      filteredCourses = filteredCourses.filter(c => c.category === category);
    }
    
    if (difficulty) {
      filteredCourses = filteredCourses.filter(c => c.difficulty === difficulty);
    }
    
    if (free) {
      filteredCourses = filteredCourses.filter(c => c.price === 0);
    }
    
    res.json({ 
      courses: filteredCourses.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        category: c.category,
        difficulty: c.difficulty,
        duration: c.duration,
        instructor: c.instructor,
        price: c.price,
        enrolled: c.enrolled,
        completed: c.completed,
        rating: c.rating,
        ubuntu: c.ubuntu
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enroll in Course
app.post('/api/courses/:courseId/enroll', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.body;
    
    const course = courses.find(c => c.id === courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const existingEnrollment = enrollments.find(e => e.courseId === courseId && e.userId === userId);
    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled' });
    }
    
    const enrollment = {
      id: 'enrollment-' + Date.now(),
      courseId,
      userId,
      status: 'active',
      enrolledAt: new Date().toISOString(),
      progress: 0,
      completedModules: [],
      ubuntu: 'Ubuntu learning journey begins'
    };
    
    enrollments.push(enrollment);
    course.enrolled += 1;
    
    // Initialize progress tracking
    if (!progress[userId]) {
      progress[userId] = {};
    }
    progress[userId][courseId] = {
      started: new Date().toISOString(),
      currentModule: 0,
      completedModules: [],
      totalProgress: 0,
      ubuntu: 'Ubuntu progress tracking'
    };
    
    console.log(`🎓 Enrollment: ${userId} enrolled in ${course.title}`);
    
    res.json({ 
      success: true, 
      enrollment: {
        id: enrollment.id,
        courseId,
        status: 'active',
        enrolledAt: enrollment.enrolledAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Progress
app.post('/api/courses/:courseId/progress', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId, moduleId, completed } = req.body;
    
    const enrollment = enrollments.find(e => e.courseId === courseId && e.userId === userId);
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    const course = courses.find(c => c.id === courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Update progress
    if (!progress[userId][courseId].completedModules.includes(moduleId)) {
      progress[userId][courseId].completedModules.push(moduleId);
    }
    
    const totalModules = course.modules.length;
    const completedModules = progress[userId][courseId].completedModules.length;
    const totalProgress = Math.round((completedModules / totalModules) * 100);
    
    progress[userId][courseId].totalProgress = totalProgress;
    enrollment.progress = totalProgress;
    
    // Auto-complete course if 100%
    if (totalProgress === 100 && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date().toISOString();
      course.completed += 1;
      
      // Generate certificate
      const certificate = {
        id: 'cert-' + Date.now(),
        userId,
        courseId,
        courseTitle: course.title,
        instructor: course.instructor,
        completedAt: enrollment.completedAt,
        score: totalProgress,
        blockchainVerified: false,
        ubuntu: 'Ubuntu certificate of completion'
      };
      
      certificates.push(certificate);
      
      console.log(`🏆 Course Completed: ${userId} completed ${course.title}`);
    }
    
    res.json({ 
      success: true, 
      progress: {
        totalProgress,
        completedModules,
        totalModules,
        status: enrollment.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User Progress
app.get('/api/users/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userEnrollments = enrollments.filter(e => e.userId === userId);
    const userCertificates = certificates.filter(c => c.userId === userId);
    const userProgress = progress[userId] || {};
    
    const progressData = Object.entries(userProgress).map(([courseId, data]) => {
      const course = courses.find(c => c.id === courseId);
      return {
        courseId,
        courseTitle: course?.title,
        totalProgress: data.totalProgress,
        completedModules: data.completedModules.length,
        totalModules: course?.modules.length || 0,
        started: data.started,
        ubuntu: data.ubuntu
      };
    });
    
    res.json({
      userId,
      enrollments: userEnrollments.length,
      certificates: userCertificates.length,
      progress: progressData,
      ubuntu: 'Ubuntu learning journey progress'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Certificates
app.get('/api/users/:userId/certificates', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userCertificates = certificates.filter(c => c.userId === userId);
    
    res.json({
      certificates: userCertificates.map(cert => ({
        id: cert.id,
        courseTitle: cert.courseTitle,
        instructor: cert.instructor,
        completedAt: cert.completedAt,
        score: cert.score,
        blockchainVerified: cert.blockchainVerified,
        ubuntu: cert.ubuntu
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ubuntu Scholarship Integration
app.post('/api/scholarships/apply', async (req, res) => {
  try {
    const { userId, courseId, reason, financialNeed } = req.body;
    
    const course = courses.find(c => c.id === courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const scholarship = {
      id: 'scholarship-' + Date.now(),
      userId,
      courseId,
      courseTitle: course.title,
      reason,
      financialNeed,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      ubuntu: 'Ubuntu scholarship application'
    };
    
    console.log(`💰 Scholarship Application: ${userId} for ${course.title}`);
    
    res.json({ 
      success: true, 
      scholarship: {
        id: scholarship.id,
        status: 'pending',
        appliedAt: scholarship.appliedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Default Ubuntu Routes
app.get('/api/status', (req, res) => {
  res.json({
    service: 'azora-education',
    status: 'operational',
    ubuntu: 'Ubuntu education service ready'
  });
});

// Ubuntu Error Handling
app.use((error, req, res, next) => {
  console.error('Ubuntu Service Error:', error);
  res.status(500).json({
    error: 'Ubuntu service error',
    ubuntu: 'We handle errors with Ubuntu grace',
    timestamp: new Date().toISOString()
  });
});

// Start Ubuntu Service
app.listen(PORT, () => {
  console.log(`📚 Azora Education service running on port ${PORT}`);
  console.log('⚡ Ubuntu: "I teach because we learn together!"');
  console.log(`🎓 Courses: ${courses.length}, Enrollments: ${enrollments.length}`);
});
