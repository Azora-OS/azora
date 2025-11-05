/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import compression from 'compression';
import cron from 'node-cron';
import natural from 'natural';
import brain from 'brain.js';
import * as math from 'mathjs';
import katex from 'katex';
import { marked } from 'marked';
// import hljs from 'highlight.js/lib/common';

import 'dotenv/config';

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"]
  }
});

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'azora-education' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Enable compression for educational content delivery
app.use(compression({
  level: 9,
  threshold: 0,
  filter: (req, res) => {
    return compression.filter(req, res);
  }
}));

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the UI build directory
app.use(express.static(path.join(process.cwd(), '..', '..', 'ui', 'dist')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// File upload configuration for educational materials
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'education');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/azora-education')
.then(() => logger.info('Connected to MongoDB'))
.catch(err => logger.error('MongoDB connection error:', err));

// AI Models for educational assistance
class EducationAI {
  constructor() {
    this.lessonPlanner = new brain.NeuralNetwork();
    this.assessmentAnalyzer = new brain.NeuralNetwork();
    this.personalizationEngine = new brain.recurrent.LSTM();
    this.isTrained = false;
  }

  async trainModels() {
    // Train lesson planning model
    const lessonData = [
      { input: [0.1, 0.2, 0.3], output: [0.8] }, // grade, subject, difficulty -> engagement
      { input: [0.2, 0.1, 0.4], output: [0.6] },
      // Add more training data...
    ];

    this.lessonPlanner.train(lessonData);

    // Train assessment analyzer
    const assessmentData = [
      { input: [0.9, 0.8, 0.7], output: [0.85] }, // scores -> overall performance
      { input: [0.6, 0.5, 0.4], output: [0.5] },
    ];

    this.assessmentAnalyzer.train(assessmentData);

    this.isTrained = true;
    logger.info('AI models trained successfully');
  }

  generateLessonPlan(subject, grade, studentLevel, objectives) {
    if (!this.isTrained) return null;

    const input = [
      grade / 12, // normalize grade
      this.getSubjectIndex(subject) / 10, // normalize subject
      studentLevel / 5 // normalize student level
    ];

    const engagement = this.lessonPlanner.run(input)[0];

    return {
      subject,
      grade,
      duration: Math.ceil(engagement * 90), // 30-90 minutes
      activities: this.generateActivities(subject, objectives),
      assessment: this.generateAssessment(subject, grade),
      materials: this.generateMaterials(subject, grade),
      aiConfidence: engagement
    };
  }

  analyzeAssessment(scores, subject, grade) {
    if (!this.isTrained) return null;

    const input = [
      scores.average / 100,
      scores.consistency / 100,
      scores.improvement / 100
    ];

    const performance = this.assessmentAnalyzer.run(input)[0];

    return {
      overallScore: performance * 100,
      strengths: this.identifyStrengths(scores),
      weaknesses: this.identifyWeaknesses(scores),
      recommendations: this.generateRecommendations(scores, subject, grade)
    };
  }

  getSubjectIndex(subject) {
    const subjects = {
      'mathematics': 1, 'english': 2, 'science': 3, 'history': 4, 'geography': 5,
      'art': 6, 'music': 7, 'physical-education': 8, 'computer-science': 9, 'health': 10
    };
    return subjects[subject.toLowerCase()] || 0;
  }

  generateActivities(subject, objectives) {
    const activities = {
      mathematics: ['Problem solving exercises', 'Interactive games', 'Real-world applications'],
      english: ['Reading comprehension', 'Creative writing', 'Grammar exercises'],
      science: ['Experiments', 'Observation activities', 'Research projects']
    };

    return activities[subject.toLowerCase()] || ['Interactive learning', 'Practice exercises', 'Project work'];
  }

  generateAssessment(subject, grade) {
    return {
      type: 'mixed',
      questions: 20,
      format: ['multiple-choice', 'short-answer', 'essay'],
      duration: 60,
      passingScore: 70
    };
  }

  generateMaterials(subject, grade) {
    const baseMaterials = ['Textbook', 'Workbook', 'Online resources'];
    const subjectMaterials = {
      mathematics: ['Calculator', 'Ruler', 'Graph paper'],
      science: ['Lab equipment', 'Microscope', 'Safety gear'],
      art: ['Art supplies', 'Canvas', 'Paint brushes']
    };

    return [...baseMaterials, ...(subjectMaterials[subject.toLowerCase()] || [])];
  }

  identifyStrengths(scores) {
    const strengths = [];
    if (scores.average > 80) strengths.push('Strong overall performance');
    if (scores.consistency > 0.8) strengths.push('Consistent results');
    if (scores.improvement > 0.1) strengths.push('Showing improvement');
    return strengths;
  }

  identifyWeaknesses(scores) {
    const weaknesses = [];
    if (scores.average < 60) weaknesses.push('Needs improvement in core concepts');
    if (scores.consistency < 0.6) weaknesses.push('Inconsistent performance');
    return weaknesses;
  }

  generateRecommendations(scores, subject, grade) {
    const recommendations = [];
    if (scores.average < 70) {
      recommendations.push('Additional tutoring sessions recommended');
      recommendations.push('Focus on foundational concepts');
    }
    if (scores.consistency < 0.7) {
      recommendations.push('Practice with varied difficulty levels');
    }
    recommendations.push('Continue with current learning pace');
    return recommendations;
  }
}

// Initialize AI
const educationAI = new EducationAI();

// Department of Education Standards Compliance
const EducationStandards = {
  COMMON_CORE: {
    mathematics: {
      'K-2': ['Counting', 'Addition', 'Subtraction', 'Shapes', 'Measurement'],
      '3-5': ['Multiplication', 'Division', 'Fractions', 'Geometry', 'Data Analysis'],
      '6-8': ['Ratios', 'Expressions', 'Equations', 'Functions', 'Statistics'],
      '9-12': ['Algebra', 'Geometry', 'Statistics', 'Calculus', 'Discrete Math']
    },
    english: {
      'K-2': ['Phonics', 'Vocabulary', 'Comprehension', 'Writing'],
      '3-5': ['Reading', 'Writing', 'Speaking', 'Listening'],
      '6-8': ['Literature', 'Informational Text', 'Writing', 'Language'],
      '9-12': ['Literature', 'Informational Text', 'Writing', 'Language', 'Presentation']
    }
  },

  validateCurriculum: function(subject, grade, topics) {
    const standards = this.COMMON_CORE[subject.toLowerCase()];
    if (!standards) return { valid: false, message: 'Subject not found in standards' };

    const gradeRange = this.getGradeRange(grade);
    const requiredTopics = standards[gradeRange] || [];

    const missingTopics = requiredTopics.filter(topic =>
      !topics.some(studentTopic =>
        studentTopic.toLowerCase().includes(topic.toLowerCase())
      )
    );

    return {
      valid: missingTopics.length === 0,
      missingTopics,
      compliance: ((requiredTopics.length - missingTopics.length) / requiredTopics.length) * 100
    };
  },

  getGradeRange: function(grade) {
    if (grade <= 2) return 'K-2';
    if (grade <= 5) return '3-5';
    if (grade <= 8) return '6-8';
    return '9-12';
  },

  generateProgressReport: function(student, assessments) {
    const report = {
      studentName: student.name,
      grade: student.grade,
      subjects: {},
      overallGPA: 0,
      attendance: student.attendance || 100,
      recommendations: []
    };

    const subjects = [...new Set(assessments.map(a => a.subject))];

    subjects.forEach(subject => {
      const subjectAssessments = assessments.filter(a => a.subject === subject);
      const average = subjectAssessments.reduce((sum, a) => sum + a.score, 0) / subjectAssessments.length;

      report.subjects[subject] = {
        average: Math.round(average),
        assessments: subjectAssessments.length,
        trend: this.calculateTrend(subjectAssessments),
        standards: this.validateCurriculum(subject, student.grade, subjectAssessments.map(a => a.topic))
      };
    });

    report.overallGPA = Math.round(
      Object.values(report.subjects).reduce((sum, subj) => sum + subj.average, 0) /
      Object.keys(report.subjects).length
    );

    report.recommendations = this.generateRecommendations(report);

    return report;
  },

  calculateTrend: function(assessments) {
    if (assessments.length < 2) return 'insufficient-data';

    const sorted = assessments.sort((a, b) => new Date(a.date) - new Date(b.date));
    const recent = sorted.slice(-3);
    const older = sorted.slice(-6, -3);

    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, a) => sum + a.score, 0) / recent.length;
    const olderAvg = older.reduce((sum, a) => sum + a.score, 0) / older.length;

    const change = recentAvg - olderAvg;

    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
  },

  generateRecommendations: function(report) {
    const recommendations = [];

    if (report.overallGPA < 70) {
      recommendations.push('Consider additional tutoring support');
    }

    Object.entries(report.subjects).forEach(([subject, data]) => {
      if (data.average < 70) {
        recommendations.push(`Focus on improving ${subject} fundamentals`);
      }
      if (data.trend === 'declining') {
        recommendations.push(`Address declining trend in ${subject}`);
      }
      if (!data.standards.valid) {
        recommendations.push(`Complete missing ${subject} standards: ${data.standards.missingTopics.join(', ')}`);
      }
    });

    if (report.attendance < 90) {
      recommendations.push('Improve attendance to support learning progress');
    }

    return recommendations;
  }
};

// Database Models
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  role: { type: String, enum: ['parent', 'student', 'teacher', 'admin'], default: 'parent' },
  avatar: String,
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
  preferences: {
    notifications: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' }
  }
});

const StudentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  grade: { type: Number, required: true, min: 1, max: 12 },
  dateOfBirth: Date,
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  school: String,
  enrollmentDate: { type: Date, default: Date.now },
  graduationDate: Date,
  subjects: [{
    name: String,
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    currentLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' }
  }],
  attendance: { type: Number, default: 100, min: 0, max: 100 },
  specialNeeds: [String],
  achievements: [{
    title: String,
    description: String,
    date: { type: Date, default: Date.now },
    category: String
  }]
});

const CurriculumSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  grade: { type: Number, required: true },
  title: { type: String, required: true },
  description: String,
  standards: [String], // Department of Education standards alignment
  objectives: [String],
  topics: [{
    title: String,
    description: String,
    duration: Number, // in minutes
    resources: [{
      type: { type: String, enum: ['video', 'document', 'quiz', 'activity'] },
      title: String,
      url: String,
      content: String
    }],
    prerequisites: [String],
    order: Number
  }],
  assessments: [{
    title: String,
    type: { type: String, enum: ['quiz', 'test', 'project', 'presentation'] },
    questions: [{
      question: String,
      type: { type: String, enum: ['multiple-choice', 'short-answer', 'essay', 'true-false'] },
      options: [String],
      correctAnswer: String,
      points: { type: Number, default: 1 }
    }],
    passingScore: { type: Number, default: 70 },
    duration: Number
  }],
  aiGenerated: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const LessonPlanSchema = new mongoose.Schema({
  curriculum: { type: mongoose.Schema.Types.ObjectId, ref: 'Curriculum', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  title: String,
  objectives: [String],
  activities: [{
    title: String,
    description: String,
    duration: Number,
    type: { type: String, enum: ['lecture', 'practice', 'assessment', 'project', 'discussion'] },
    materials: [String],
    instructions: String
  }],
  schedule: {
    startDate: Date,
    endDate: Date,
    dailySchedule: [{
      day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
      startTime: String,
      endTime: String,
      activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LessonPlan.activities' }]
    }]
  },
  progress: {
    completedActivities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LessonPlan.activities' }],
    currentActivity: { type: mongoose.Schema.Types.ObjectId, ref: 'LessonPlan.activities' },
    overallProgress: { type: Number, default: 0, min: 0, max: 100 },
    timeSpent: { type: Number, default: 0 }, // in minutes
    lastAccessed: Date
  },
  aiGenerated: { type: Boolean, default: false },
  aiConfidence: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const AssessmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  curriculum: { type: mongoose.Schema.Types.ObjectId, ref: 'Curriculum' },
  lessonPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'LessonPlan' },
  type: { type: String, enum: ['quiz', 'test', 'project', 'presentation', 'homework'], required: true },
  title: String,
  subject: String,
  grade: Number,
  topic: String,
  questions: [{
    question: String,
    studentAnswer: String,
    correctAnswer: String,
    points: { type: Number, default: 1 },
    earnedPoints: { type: Number, default: 0 },
    feedback: String
  }],
  totalPoints: { type: Number, default: 0 },
  earnedPoints: { type: Number, default: 0 },
  percentage: { type: Number, default: 0, min: 0, max: 100 },
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'graded'], default: 'pending' },
  startedAt: Date,
  completedAt: Date,
  gradedAt: Date,
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  aiGraded: { type: Boolean, default: false },
  feedback: String,
  recommendations: [String],
  timeSpent: Number, // in minutes
  createdAt: { type: Date, default: Date.now }
});

const ProgressReportSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  period: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    type: { type: String, enum: ['weekly', 'monthly', 'quarterly', 'semesterly', 'yearly'], required: true }
  },
  subjects: [{
    name: String,
    grade: Number,
    assessments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' }],
    average: Number,
    trend: { type: String, enum: ['improving', 'stable', 'declining', 'insufficient-data'] },
    standardsCompliance: {
      valid: Boolean,
      compliance: Number,
      missingTopics: [String]
    }
  }],
  overallGPA: { type: Number, min: 0, max: 100 },
  attendance: { type: Number, min: 0, max: 100 },
  achievements: [{
    title: String,
    description: String,
    category: String,
    date: Date
  }],
  recommendations: [String],
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  aiGenerated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Student = mongoose.model('Student', StudentSchema);
const Curriculum = mongoose.model('Curriculum', CurriculumSchema);
const LessonPlan = mongoose.model('LessonPlan', LessonPlanSchema);
const Assessment = mongoose.model('Assessment', AssessmentSchema);
const ProgressReport = mongoose.model('ProgressReport', ProgressReportSchema);

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'azora-education-secret');
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Routes

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'parent' } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'azora-education-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'azora-education-secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Student management routes
app.post('/api/students', authenticateToken, authorizeRoles('parent', 'admin'), async (req, res) => {
  try {
    const { firstName, lastName, grade, dateOfBirth, subjects, specialNeeds } = req.body;

    // Create user account for student
    const studentEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@homeschool.local`;
    const studentPassword = Math.random().toString(36).slice(-12);

    const hashedPassword = await bcrypt.hash(studentPassword, 12);

    const studentUser = new User({
      email: studentEmail,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'student'
    });

    await studentUser.save();

    const student = new Student({
      user: studentUser._id,
      grade,
      dateOfBirth: new Date(dateOfBirth),
      parent: req.user._id,
      subjects: subjects || [],
      specialNeeds: specialNeeds || []
    });

    await student.save();

    res.status(201).json({
      message: 'Student created successfully',
      student: {
        id: student._id,
        userId: studentUser._id,
        firstName: studentUser.firstName,
        lastName: studentUser.lastName,
        grade: student.grade,
        email: studentUser.email,
        temporaryPassword: studentPassword
      }
    });
  } catch (error) {
    logger.error('Create student error:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

app.get('/api/students', authenticateToken, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'parent') {
      query.parent = req.user._id;
    } else if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (!student) {
        return res.status(404).json({ error: 'Student profile not found' });
      }
      query._id = student._id;
    }

    const students = await Student.find(query)
      .populate('user', 'firstName lastName email')
      .populate('parent', 'firstName lastName email');

    res.json({ students });
  } catch (error) {
    logger.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Curriculum management routes
app.post('/api/curriculum', authenticateToken, authorizeRoles('teacher', 'admin'), async (req, res) => {
  try {
    const { subject, grade, title, description, standards, objectives, topics, assessments } = req.body;

    const curriculum = new Curriculum({
      subject,
      grade,
      title,
      description,
      standards: standards || [],
      objectives: objectives || [],
      topics: topics || [],
      assessments: assessments || [],
      createdBy: req.user._id
    });

    await curriculum.save();

    res.status(201).json({
      message: 'Curriculum created successfully',
      curriculum
    });
  } catch (error) {
    logger.error('Create curriculum error:', error);
    res.status(500).json({ error: 'Failed to create curriculum' });
  }
});

app.get('/api/curriculum', authenticateToken, async (req, res) => {
  try {
    const { subject, grade } = req.query;
    let query = {};

    if (subject) query.subject = new RegExp(subject, 'i');
    if (grade) query.grade = parseInt(grade);

    const curricula = await Curriculum.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ curricula });
  } catch (error) {
    logger.error('Get curriculum error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI-powered lesson planning
app.post('/api/ai/lesson-plan', authenticateToken, authorizeRoles('parent', 'teacher', 'admin'), async (req, res) => {
  try {
    const { studentId, subject, objectives, duration } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const lessonPlan = educationAI.generateLessonPlan(subject, student.grade, 3, objectives);

    if (!lessonPlan) {
      return res.status(503).json({ error: 'AI service temporarily unavailable' });
    }

    // Save the AI-generated lesson plan
    const savedLessonPlan = new LessonPlan({
      curriculum: null, // AI-generated, not tied to specific curriculum
      student: studentId,
      title: `${subject} Lesson Plan - Grade ${student.grade}`,
      objectives: objectives || lessonPlan.activities.map(a => a.title),
      activities: lessonPlan.activities,
      aiGenerated: true,
      aiConfidence: lessonPlan.aiConfidence
    });

    await savedLessonPlan.save();

    res.json({
      message: 'AI-generated lesson plan created',
      lessonPlan: savedLessonPlan,
      aiInsights: {
        confidence: lessonPlan.aiConfidence,
        estimatedEngagement: Math.round(lessonPlan.aiConfidence * 100),
        recommendedDuration: lessonPlan.duration
      }
    });
  } catch (error) {
    logger.error('AI lesson plan error:', error);
    res.status(500).json({ error: 'Failed to generate lesson plan' });
  }
});

// Assessment routes
app.post('/api/assessments', authenticateToken, authorizeRoles('teacher', 'admin'), async (req, res) => {
  try {
    const { studentId, type, title, subject, questions } = req.body;

    const assessment = new Assessment({
      student: studentId,
      type,
      title,
      subject,
      questions: questions || [],
      totalPoints: questions ? questions.reduce((sum, q) => sum + (q.points || 1), 0) : 0
    });

    await assessment.save();

    res.status(201).json({
      message: 'Assessment created successfully',
      assessment
    });
  } catch (error) {
    logger.error('Create assessment error:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

app.post('/api/assessments/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { answers } = req.body;
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Verify student access
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (!student || student._id.toString() !== assessment.student.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    // Grade the assessment
    let earnedPoints = 0;
    assessment.questions.forEach((question, index) => {
      const studentAnswer = answers[index];
      question.studentAnswer = studentAnswer;

      if (studentAnswer === question.correctAnswer) {
        question.earnedPoints = question.points;
        earnedPoints += question.points;
      } else {
        question.earnedPoints = 0;
      }
    });

    assessment.earnedPoints = earnedPoints;
    assessment.percentage = (earnedPoints / assessment.totalPoints) * 100;
    assessment.status = 'completed';
    assessment.completedAt = new Date();

    await assessment.save();

    res.json({
      message: 'Assessment submitted successfully',
      assessment: {
        id: assessment._id,
        score: assessment.percentage,
        earnedPoints,
        totalPoints: assessment.totalPoints,
        status: assessment.status
      }
    });
  } catch (error) {
    logger.error('Submit assessment error:', error);
    res.status(500).json({ error: 'Failed to submit assessment' });
  }
});

// Progress reports
app.post('/api/progress-reports', authenticateToken, authorizeRoles('parent', 'teacher', 'admin'), async (req, res) => {
  try {
    const { studentId, period } = req.body;

    const student = await Student.findById(studentId).populate('user');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get assessments for the period
    const assessments = await Assessment.find({
      student: studentId,
      createdAt: {
        $gte: new Date(period.startDate),
        $lte: new Date(period.endDate)
      }
    });

    const report = EducationStandards.generateProgressReport(student, assessments);

    const progressReport = new ProgressReport({
      student: studentId,
      period,
      subjects: report.subjects,
      overallGPA: report.overallGPA,
      attendance: report.attendance,
      recommendations: report.recommendations,
      generatedBy: req.user._id,
      aiGenerated: false
    });

    await progressReport.save();

    res.json({
      message: 'Progress report generated',
      report: progressReport
    });
  } catch (error) {
    logger.error('Generate progress report error:', error);
    res.status(500).json({ error: 'Failed to generate progress report' });
  }
});

// File upload for educational materials
app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Process the uploaded file based on type
    let processedContent = null;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    if (fileExtension === '.pdf') {
      // Process PDF content
      const pdfParse = await import('pdf-parse');
      const data = await pdfParse.default(fs.readFileSync(req.file.path));
      processedContent = {
        type: 'pdf',
        text: data.text,
        pages: data.numpages
      };
    } else if (fileExtension === '.docx') {
      // Process Word document
      const mammoth = await import('mammoth');
      const result = await mammoth.default.extractRawText({ path: req.file.path });
      processedContent = {
        type: 'docx',
        text: result.value
      };
    }

    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        processedContent
      }
    });
  } catch (error) {
    logger.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Math problem solving endpoint
app.post('/api/math/solve', authenticateToken, async (req, res) => {
  try {
    const { expression, steps = false } = req.body;

    let result;
    if (steps) {
      // Provide step-by-step solution
      result = {
        expression,
        steps: math.simplify(expression).toString(),
        finalAnswer: math.evaluate(expression)
      };
    } else {
      result = {
        expression,
        result: math.evaluate(expression)
      };
    }

    res.json(result);
  } catch (error) {
    logger.error('Math solve error:', error);
    res.status(400).json({ error: 'Invalid mathematical expression' });
  }
});

// Real-time collaboration for virtual classrooms
io.on('connection', (socket) => {
  logger.info('User connected:', socket.id);

  socket.on('join-classroom', (classroomId) => {
    socket.join(classroomId);
    logger.info(`User ${socket.id} joined classroom ${classroomId}`);
  });

  socket.on('leave-classroom', (classroomId) => {
    socket.leave(classroomId);
    logger.info(`User ${socket.id} left classroom ${classroomId}`);
  });

  socket.on('send-message', (data) => {
    const { classroomId, message, userId, userName } = data;
    io.to(classroomId).emit('new-message', {
      message,
      userId,
      userName,
      timestamp: new Date(),
    });
  });

  socket.on('share-screen', (data) => {
    const { classroomId, streamData } = data;
    socket.to(classroomId).emit('screen-shared', {
      from: socket.id,
      streamData
    });
  });

  socket.on('disconnect', () => {
    logger.info('User disconnected:', socket.id);
  });
});

// Scheduled tasks for educational maintenance
cron.schedule('0 0 * * 1', async () => {
  // Weekly progress report generation
  try {
    logger.info('Generating weekly progress reports...');

    const students = await Student.find({});
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    for (const student of students) {
      const assessments = await Assessment.find({
        student: student._id,
        createdAt: { $gte: startDate, $lte: endDate }
      });

      if (assessments.length > 0) {
        const report = EducationStandards.generateProgressReport(student, assessments);
        // Save or notify parents
        logger.info(`Generated progress report for student ${student.user}`);
      }
    }

    logger.info('Weekly progress reports completed');
  } catch (error) {
    logger.error('Weekly progress report error:', error);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'azora-education',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    ai: {
      trained: educationAI.isTrained,
      models: ['lessonPlanner', 'assessmentAnalyzer', 'personalizationEngine']
    }
  });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), '..', '..', 'ui', 'dist', 'index.html'));
});

// Initialize AI models on startup
educationAI.trainModels().catch(error => {
  logger.error('Failed to train AI models:', error);
});

// Start server
const PORT = process.env.PORT || 4200;
server.listen(PORT, () => {
  logger.info(`Azora Education service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(async () => {
    await mongoose.connection.close();
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(async () => {
    await mongoose.connection.close();
    logger.info('Process terminated');
    process.exit(0);
  });
});

export default app;