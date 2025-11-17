const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3021;

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'azora-corporate-learning' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// In-memory storage for courses, enrollments, and employees (in production, use a database)
const courses = new Map();
const enrollments = new Map();
const employees = new Map();
const progressRecords = new Map();
const certificates = new Map();

// Initialize with sample data
courses.set('course_1', {
  id: 'course_1',
  title: 'Leadership Fundamentals',
  category: 'Leadership',
  duration: '4 weeks',
  level: 'Beginner',
  description: 'Essential leadership skills for managers',
  modules: 8,
  prerequisites: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'active'
});

courses.set('course_2', {
  id: 'course_2',
  title: 'Advanced Data Analytics',
  category: 'Technology',
  duration: '6 weeks',
  level: 'Advanced',
  description: 'Advanced techniques in data analysis and visualization',
  modules: 12,
  prerequisites: ['Data Analysis Basics'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'active'
});

employees.set('emp_1', {
  id: 'emp_1',
  name: 'John Smith',
  email: 'john.smith@azora.com',
  department: 'Engineering',
  position: 'Software Engineer',
  hireDate: '2022-01-15',
  createdAt: new Date().toISOString()
});

employees.set('emp_2', {
  id: 'emp_2',
  name: 'Jane Doe',
  email: 'jane.doe@azora.com',
  department: 'Marketing',
  position: 'Marketing Manager',
  hireDate: '2021-03-22',
  createdAt: new Date().toISOString()
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'azora-corporate-learning', 
    timestamp: new Date().toISOString() 
  });
});

// Get all training courses
app.get('/api/courses', (req, res) => {
  try {
    const courseList = Array.from(courses.values());
    
    res.json({
      success: true,
      data: courseList,
      count: courseList.length
    });
  } catch (error) {
    logger.error('Error fetching courses:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific training course
app.get('/api/courses/:courseId', (req, res) => {
  try {
    const { courseId } = req.params;
    const course = courses.get(courseId);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    logger.error('Error fetching course:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new training course
app.post('/api/courses', (req, res) => {
  try {
    const { title, category, duration, level, description, modules, prerequisites } = req.body;
    
    // Validate input
    if (!title || !category || !duration || !level) {
      return res.status(400).json({ error: 'Title, category, duration, and level are required' });
    }
    
    const courseId = uuidv4();
    const course = {
      id: courseId,
      title,
      category,
      duration,
      level,
      description: description || '',
      modules: modules || 0,
      prerequisites: prerequisites || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };
    
    courses.set(courseId, course);
    
    logger.info(`Training course ${courseId} created`);
    
    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    logger.error('Error creating course:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update training course
app.put('/api/courses/:courseId', (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, category, duration, level, description, modules, prerequisites, status } = req.body;
    
    const course = courses.get(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Update course
    course.title = title || course.title;
    course.category = category || course.category;
    course.duration = duration || course.duration;
    course.level = level || course.level;
    course.description = description || course.description;
    course.modules = modules !== undefined ? modules : course.modules;
    course.prerequisites = prerequisites || course.prerequisites;
    course.status = status || course.status;
    course.updatedAt = new Date().toISOString();
    
    courses.set(courseId, course);
    
    logger.info(`Training course ${courseId} updated`);
    
    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    logger.error('Error updating course:', error);
    res.status(500).json({ error: error.message });
  }
});

// Employee enrollment endpoint
app.post('/api/enrollments', (req, res) => {
  try {
    const { courseId, employeeId } = req.body;
    
    // Validate input
    if (!courseId || !employeeId) {
      return res.status(400).json({ error: 'Course ID and employee ID are required' });
    }
    
    // Check if course exists
    const course = courses.get(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Check if employee exists
    const employee = employees.get(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Check if already enrolled
    const existingEnrollment = Array.from(enrollments.values()).find(
      enrollment => enrollment.courseId === courseId && enrollment.employeeId === employeeId
    );
    
    if (existingEnrollment) {
      return res.status(409).json({ error: 'Employee already enrolled in this course' });
    }
    
    const enrollmentId = uuidv4();
    const enrollment = {
      id: enrollmentId,
      courseId,
      courseTitle: course.title,
      employeeId,
      employeeName: employee.name,
      status: 'enrolled',
      progress: 0,
      enrolledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    enrollments.set(enrollmentId, enrollment);
    
    logger.info(`Employee ${employeeId} enrolled in course ${courseId}`);
    
    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    logger.error('Error enrolling employee:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all enrollments
app.get('/api/enrollments', (req, res) => {
  try {
    const enrollmentList = Array.from(enrollments.values());
    
    res.json({
      success: true,
      data: enrollmentList,
      count: enrollmentList.length
    });
  } catch (error) {
    logger.error('Error fetching enrollments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific enrollment
app.get('/api/enrollments/:enrollmentId', (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const enrollment = enrollments.get(enrollmentId);
    
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    res.json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    logger.error('Error fetching enrollment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update enrollment status and progress
app.put('/api/enrollments/:enrollmentId', (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { status, progress, completedAt } = req.body;
    
    const enrollment = enrollments.get(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    // Update enrollment
    enrollment.status = status || enrollment.status;
    enrollment.progress = progress !== undefined ? progress : enrollment.progress;
    enrollment.completedAt = completedAt || enrollment.completedAt;
    enrollment.updatedAt = new Date().toISOString();
    
    enrollments.set(enrollmentId, enrollment);
    
    // If course is completed, create a progress record
    if (status === 'completed' && progress === 100) {
      const progressId = uuidv4();
      const progressRecord = {
        id: progressId,
        employeeId: enrollment.employeeId,
        courseId: enrollment.courseId,
        courseTitle: enrollment.courseTitle,
        completionDate: new Date().toISOString(),
        score: null, // Would be set when assessment is completed
        createdAt: new Date().toISOString()
      };
      
      progressRecords.set(progressId, progressRecord);
      
      // Create a certificate
      const certificateId = uuidv4();
      const certificate = {
        id: certificateId,
        employeeId: enrollment.employeeId,
        employeeName: enrollment.employeeName,
        courseId: enrollment.courseId,
        courseTitle: enrollment.courseTitle,
        issuedAt: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
      };
      
      certificates.set(certificateId, certificate);
    }
    
    logger.info(`Enrollment ${enrollmentId} updated`);
    
    res.json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    logger.error('Error updating enrollment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Learning progress endpoint
app.get('/api/progress/:employeeId', (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Check if employee exists
    const employee = employees.get(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Get employee's enrollments
    const employeeEnrollments = Array.from(enrollments.values()).filter(
      enrollment => enrollment.employeeId === employeeId
    );
    
    // Count completed and in-progress courses
    const completedCourses = employeeEnrollments.filter(enrollment => enrollment.status === 'completed').length;
    const inProgressCourses = employeeEnrollments.filter(enrollment => enrollment.status === 'enrolled').length;
    
    // Get employee's certificates
    const employeeCertificates = Array.from(certificates.values()).filter(
      certificate => certificate.employeeId === employeeId
    );
    
    const progress = {
      employeeId,
      employeeName: employee.name,
      completedCourses,
      inProgressCourses,
      totalEnrollments: employeeEnrollments.length,
      certificates: employeeCertificates,
      overallProgress: employeeEnrollments.length > 0 
        ? Math.round((completedCourses / employeeEnrollments.length) * 100) 
        : 0
    };
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    logger.error('Error fetching progress:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all employees
app.get('/api/employees', (req, res) => {
  try {
    const employeeList = Array.from(employees.values());
    
    res.json({
      success: true,
      data: employeeList,
      count: employeeList.length
    });
  } catch (error) {
    logger.error('Error fetching employees:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific employee
app.get('/api/employees/:employeeId', (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = employees.get(employeeId);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    logger.error('Error fetching employee:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new employee
app.post('/api/employees', (req, res) => {
  try {
    const { name, email, department, position, hireDate } = req.body;
    
    // Validate input
    if (!name || !email || !department || !position) {
      return res.status(400).json({ error: 'Name, email, department, and position are required' });
    }
    
    const employeeId = uuidv4();
    const employee = {
      id: employeeId,
      name,
      email,
      department,
      position,
      hireDate: hireDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    
    employees.set(employeeId, employee);
    
    logger.info(`Employee ${employeeId} created`);
    
    res.status(201).json({
      success: true,
      data: employee
    });
  } catch (error) {
    logger.error('Error creating employee:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search courses by category or level
app.get('/api/courses/search', (req, res) => {
  try {
    const { category, level } = req.query;
    
    const filteredCourses = Array.from(courses.values()).filter(course => {
      const categoryMatch = !category || course.category.toLowerCase().includes(category.toLowerCase());
      const levelMatch = !level || course.level.toLowerCase() === level.toLowerCase();
      return categoryMatch && levelMatch;
    });
    
    res.json({
      success: true,
      data: filteredCourses,
      count: filteredCourses.length
    });
  } catch (error) {
    logger.error('Error searching courses:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get employee's certificates
app.get('/api/certificates/:employeeId', (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Check if employee exists
    const employee = employees.get(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Get employee's certificates
    const employeeCertificates = Array.from(certificates.values()).filter(
      certificate => certificate.employeeId === employeeId
    );
    
    res.json({
      success: true,
      data: employeeCertificates,
      count: employeeCertificates.length
    });
  } catch (error) {
    logger.error('Error fetching certificates:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  logger.info(`Azora Corporate Learning Service running on port ${PORT}`);
});

module.exports = app;