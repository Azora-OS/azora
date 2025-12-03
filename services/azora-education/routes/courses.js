const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Load courses data
const coursesPath = path.join(__dirname, '../../..', 'data', 'courses.json');
let courses = [];

try {
  if (fs.existsSync(coursesPath)) {
    courses = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
  }
} catch (error) {
  console.error('Error loading courses:', error);
}

// GET /api/courses - Get all courses
router.get('/', (req, res) => {
  const { category, level, search } = req.query;
  
  let filteredCourses = courses;
  
  if (category) {
    filteredCourses = filteredCourses.filter(course => 
      course.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  if (level) {
    filteredCourses = filteredCourses.filter(course => 
      course.level.toLowerCase() === level.toLowerCase()
    );
  }
  
  if (search) {
    filteredCourses = filteredCourses.filter(course => 
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json({
    success: true,
    data: filteredCourses,
    total: filteredCourses.length
  });
});

// GET /api/courses/:id - Get specific course
router.get('/:id', (req, res) => {
  const course = courses.find(c => c.id === req.params.id);
  
  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found'
    });
  }
  
  res.json({
    success: true,
    data: course
  });
});

// POST /api/courses/:id/enroll - Enroll in course
router.post('/:id/enroll', (req, res) => {
  const { userId } = req.body;
  const courseId = req.params.id;
  
  const course = courses.find(c => c.id === courseId);
  
  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found'
    });
  }
  
  // In a real implementation, this would save to database
  res.json({
    success: true,
    message: 'Successfully enrolled in course',
    data: {
      courseId,
      userId,
      enrolledAt: new Date().toISOString(),
      progress: 0
    }
  });
});

// GET /api/courses/:id/progress - Get course progress
router.get('/:id/progress/:userId', (req, res) => {
  const { id: courseId, userId } = req.params;
  
  // Mock progress data
  const progress = {
    courseId,
    userId,
    overallProgress: Math.floor(Math.random() * 100),
    completedLessons: Math.floor(Math.random() * 20),
    totalLessons: 25,
    timeSpent: Math.floor(Math.random() * 3600), // seconds
    lastAccessed: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: progress
  });
});

// GET /api/categories - Get course categories
router.get('/meta/categories', (req, res) => {
  const categories = [...new Set(courses.map(course => course.category))];
  
  res.json({
    success: true,
    data: categories
  });
});

// GET /api/levels - Get course levels
router.get('/meta/levels', (req, res) => {
  const levels = [...new Set(courses.map(course => course.level))];
  
  res.json({
    success: true,
    data: levels
  });
});

module.exports = router;
