const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { courses } = require('./seed-data');

const app = express();
const PORT = process.env.PORT || 3007;

// Middleware
app.use(helmet());
app.use(cors({
    origin: true, // Allow all origins for demo
    credentials: true
}));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000
});
app.use(limiter);

// Health Check
app.get('/health', (req, res) => {
    res.json({
        service: 'azora-education',
        status: 'healthy',
        ubuntu: 'I serve because we prosper together',
        timestamp: new Date().toISOString(),
        port: PORT,
        database: process.env.DATABASE_URL ? 'configured' : 'not configured',
        coursesAvailable: courses.length
    });
});

// Get all courses
app.get('/api/courses', (req, res) => {
    const { level, category, free } = req.query;

    let filteredCourses = [...courses];

    if (level) {
        filteredCourses = filteredCourses.filter(c => c.level === level);
    }

    if (category) {
        filteredCourses = filteredCourses.filter(c => c.category === category);
    }

    if (free === 'true') {
        filteredCourses = filteredCourses.filter(c => c.price === 0);
    }

    res.json({
        courses: filteredCourses,
        total: filteredCourses.length,
        ubuntu: 'Knowledge shared is knowledge multiplied'
    });
});

// Get course by ID
app.get('/api/courses/:id', (req, res) => {
    const courseId = parseInt(req.params.id);
    const course = courses.find(c => c.id === courseId);

    if (!course) {
        return res.status(404).json({
            error: 'Course not found',
            ubuntu: 'We learn together, we grow together'
        });
    }

    res.json({
        course,
        ubuntu: 'Your learning journey begins here'
    });
});

// Get course categories
app.get('/api/categories', (req, res) => {
    const categories = [...new Set(courses.map(c => c.category))];

    res.json({
        categories: categories.map(cat => ({
            name: cat,
            count: courses.filter(c => c.category === cat).length
        })),
        ubuntu: 'Diverse knowledge for diverse minds'
    });
});

// Get course statistics
app.get('/api/stats', (req, res) => {
    res.json({
        totalCourses: courses.length,
        totalEnrolled: courses.reduce((sum, c) => sum + c.enrolled, 0),
        freeCourses: courses.filter(c => c.price === 0).length,
        paidCourses: courses.filter(c => c.price > 0).length,
        averageRating: (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(2),
        categories: [...new Set(courses.map(c => c.category))].length,
        ubuntu: 'Together we achieve more'
    });
});

// Enroll in course (simplified for MVP)
app.post('/api/enrollments', (req, res) => {
    const { courseId, userId } = req.body;

    if (!courseId || !userId) {
        return res.status(400).json({
            error: 'courseId and userId are required',
            ubuntu: 'Clear communication builds strong foundations'
        });
    }

    const course = courses.find(c => c.id === parseInt(courseId));

    if (!course) {
        return res.status(404).json({
            error: 'Course not found',
            ubuntu: 'We learn together, we grow together'
        });
    }

    res.json({
        message: 'Enrollment successful',
        enrollment: {
            id: Math.floor(Math.random() * 10000),
            courseId: course.id,
            courseName: course.title,
            userId,
            enrolledAt: new Date().toISOString(),
            progress: 0
        },
        ubuntu: 'Your learning journey has begun!'
    });
});

// Get user enrollments (mock data for MVP)
app.get('/api/enrollments/user/:userId', (req, res) => {
    res.json({
        enrollments: [
            {
                id: 1,
                courseId: 1,
                courseName: 'Introduction to Constitutional AI',
                progress: 45,
                enrolledAt: '2025-11-20T10:00:00Z'
            },
            {
                id: 2,
                courseId: 6,
                courseName: 'K-12 Mathematics Mastery',
                progress: 78,
                enrolledAt: '2025-11-15T14:30:00Z'
            }
        ],
        ubuntu: 'Continuous learning, continuous growth'
    });
});

// Service status
app.get('/api/status', (req, res) => {
    res.json({
        service: 'azora-education',
        status: 'operational',
        version: '1.0.0',
        features: [
            'Course catalog',
            'Course search and filtering',
            'Enrollment management',
            'Statistics and analytics'
        ],
        ubuntu: 'Ubuntu service ready'
    });
});

// Error Handling
app.use((error, req, res, next) => {
    console.error('Service Error:', error);
    res.status(500).json({
        error: 'Service error',
        ubuntu: 'We handle errors with Ubuntu grace',
        timestamp: new Date().toISOString()
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        ubuntu: 'The path you seek does not exist, but we can help you find your way',
        availableEndpoints: [
            'GET /health',
            'GET /api/courses',
            'GET /api/courses/:id',
            'GET /api/categories',
            'GET /api/stats',
            'POST /api/enrollments',
            'GET /api/enrollments/user/:userId'
        ]
    });
});

// Start Service
app.listen(PORT, () => {
    console.log(`🚀 azora-education running on port ${PORT}`);
    console.log('⚡ Ubuntu: "I serve because we prosper together!"');
    console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    console.log(`📚 Courses Available: ${courses.length}`);
    console.log(`👥 Total Enrolled: ${courses.reduce((sum, c) => sum + c.enrolled, 0).toLocaleString()}`);
    console.log('\nAvailable Endpoints:');
    console.log('  GET  /health');
    console.log('  GET  /api/courses');
    console.log('  GET  /api/courses/:id');
    console.log('  GET  /api/categories');
    console.log('  GET  /api/stats');
    console.log('  POST /api/enrollments');
    console.log('  GET  /api/enrollments/user/:userId');
});
