import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'marketplace-service' },
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

// In-memory storage for courses and reviews (in production, use a database)
const courses = new Map();
const reviews = new Map();

// Initialize with sample data
courses.set('course_1', {
  id: 'course_1',
  title: 'Introduction to Quantum Computing',
  description: 'Learn the fundamentals of quantum computing and its applications',
  instructor: 'Dr. Quantum Smith',
  price: 99.99,
  rating: 4.8,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

reviews.set('review_1', {
  id: 'review_1',
  courseId: 'course_1',
  userId: 'user_123',
  rating: 5,
  comment: 'Excellent course! Very informative and well-structured.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'marketplace-service',
    timestamp: new Date().toISOString()
  });
});

// Get all courses
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific course
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new course
app.post('/api/courses', (req, res) => {
  try {
    const { title, description, instructor, price } = req.body;
    
    // Validate input
    if (!title || !description || !instructor) {
      return res.status(400).json({ error: 'Title, description, and instructor are required' });
    }
    
    const courseId = uuidv4();
    const course = {
      id: courseId,
      title,
      description,
      instructor,
      price: price || 0,
      rating: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    courses.set(courseId, course);
    
    logger.info(`Course ${courseId} created by ${instructor}`);
    
    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    logger.error('Error creating course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update course
app.put('/api/courses/:courseId', (req, res) => {
  try {
    const { courseId } = req.params;
    const updates = req.body;
    
    const course = courses.get(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Update course fields
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'createdAt') {
        course[key] = updates[key];
      }
    });
    
    course.updatedAt = new Date().toISOString();
    
    courses.set(courseId, course);
    
    logger.info(`Course ${courseId} updated`, { courseId, updates });
    
    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    logger.error('Error updating course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all reviews
app.get('/api/reviews', (req, res) => {
  try {
    const reviewList = Array.from(reviews.values());
    
    res.json({
      success: true,
      data: reviewList,
      count: reviewList.length
    });
  } catch (error) {
    logger.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get reviews for a specific course
app.get('/api/courses/:courseId/reviews', (req, res) => {
  try {
    const { courseId } = req.params;
    const courseReviews = Array.from(reviews.values()).filter(review => review.courseId === courseId);
    
    res.json({
      success: true,
      data: courseReviews,
      count: courseReviews.length
    });
  } catch (error) {
    logger.error('Error fetching course reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new review
app.post('/api/reviews', (req, res) => {
  try {
    const { courseId, userId, rating, comment } = req.body;
    
    // Validate input
    if (!courseId || !userId || !rating) {
      return res.status(400).json({ error: 'Course ID, user ID, and rating are required' });
    }
    
    const reviewId = uuidv4();
    const review = {
      id: reviewId,
      courseId,
      userId,
      rating,
      comment: comment || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    reviews.set(reviewId, review);
    
    logger.info(`Review ${reviewId} created for course ${courseId} by user ${userId}`);
    
    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    logger.error('Error creating review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req: any, res: any) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;