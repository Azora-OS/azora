/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import express from 'express';
import FacultyManagementSystem, {
  CreateCourseRequest,
  UploadContentRequest,
  CreateAssignmentRequest,
  BulkGradeRequest,
  Course,
  StudentProgress,
  CourseAnalytics,
  AtRiskStudent
} from './lms-core';

const router = express.Router();
const lms = new FacultyManagementSystem();

// ===== HEALTH CHECK =====
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Azora LMS',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// ===== COURSE MANAGEMENT =====
router.post('/courses', async (req, res) => {
  try {
    const courseData: CreateCourseRequest = req.body;

    // Validate required fields
    if (!courseData.code || !courseData.title || !courseData.instructorId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: code, title, instructorId'
      });
    }

    const course = await lms.createCourse(courseData);

    res.status(201).json({
      success: true,
      data: course,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/courses/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await lms.getCourse(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.put('/courses/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const updates = req.body;

    const course = await lms.updateCourse(courseId, updates);

    res.json({
      success: true,
      data: course,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.post('/courses/:courseId/publish', async (req, res) => {
  try {
    const { courseId } = req.params;

    await lms.publishCourse(courseId);

    res.json({
      success: true,
      message: 'Course published successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/instructors/:instructorId/courses', async (req, res) => {
  try {
    const { instructorId } = req.params;
    const courses = await lms.getInstructorCourses(instructorId);

    res.json({
      success: true,
      data: courses,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ===== CONTENT MANAGEMENT =====
router.post('/content', async (req, res) => {
  try {
    const contentData: UploadContentRequest = req.body;

    // Validate required fields
    if (!contentData.courseId || !contentData.title || !contentData.moduleId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: courseId, title, moduleId'
      });
    }

    const content = await lms.uploadContent(contentData);

    res.status(201).json({
      success: true,
      data: content,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.post('/content/:contentId/publish', async (req, res) => {
  try {
    const { contentId } = req.params;

    await lms.publishContent(contentId);

    res.json({
      success: true,
      message: 'Content published successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ===== ASSIGNMENT MANAGEMENT =====
router.post('/assignments', async (req, res) => {
  try {
    const assignmentData: CreateAssignmentRequest = req.body;

    // Validate required fields
    if (!assignmentData.courseId || !assignmentData.title || !assignmentData.maxPoints) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: courseId, title, maxPoints'
      });
    }

    const assignment = await lms.createAssignment(assignmentData);

    res.status(201).json({
      success: true,
      data: assignment,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.post('/assignments/bulk-grade', async (req, res) => {
  try {
    const grades: BulkGradeRequest[] = req.body;

    if (!Array.isArray(grades)) {
      return res.status(400).json({
        success: false,
        error: 'Request body must be an array of grade objects'
      });
    }

    await lms.bulkGrade(grades);

    res.json({
      success: true,
      message: 'Bulk grading completed',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ===== STUDENT PROGRESS =====
router.get('/progress/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId } = req.query;

    if (!courseId || typeof courseId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'courseId query parameter is required'
      });
    }

    const progress = await lms.getStudentProgress(courseId, studentId);

    res.json({
      success: true,
      data: progress,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ===== ANALYTICS =====
router.get('/analytics/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const analytics = await lms.getCourseAnalytics(courseId);

    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

router.get('/analytics/:courseId/at-risk', async (req, res) => {
  try {
    const { courseId } = req.params;
    const atRiskStudents = await lms.identifyAtRiskStudents(courseId);

    res.json({
      success: true,
      data: atRiskStudents,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ===== COMMUNICATION =====
router.post('/announcements', async (req, res) => {
  try {
    const { courseId, title, content, priority = 'normal', pinned = false, emailNotification = false } = req.body;

    if (!courseId || !title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: courseId, title, content'
      });
    }

    await lms.sendAnnouncement(courseId, {
      title,
      content,
      priority,
      publishDate: new Date(),
      pinned,
      emailNotification,
      createdBy: 'instructor', // Would get from auth context
      courseId
    });

    res.status(201).json({
      success: true,
      message: 'Announcement sent successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;