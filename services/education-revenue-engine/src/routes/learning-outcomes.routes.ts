import { Router, Request, Response } from 'express';
import { learningOutcomesService } from '../services/learning-outcomes.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /analytics/outcomes/:studentId/:courseId
 * Get comprehensive learning analytics for a student in a specific course
 */
router.get('/outcomes/:studentId/:courseId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, courseId } = req.params;

    if (!studentId || !courseId) {
      res.status(400).json({
        success: false,
        error: 'studentId and courseId are required',
      });
      return;
    }

    const analytics = await learningOutcomesService.getStudentCourseAnalytics(studentId, courseId);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error('Error getting student course analytics:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /analytics/outcomes/:studentId
 * Get learning analytics for all courses a student is enrolled in
 */
router.get('/outcomes/:studentId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      res.status(400).json({
        success: false,
        error: 'studentId is required',
      });
      return;
    }

    const analytics = await learningOutcomesService.getStudentOverallAnalytics(studentId);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    logger.error('Error getting student overall analytics:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /analytics/course/:courseId/outcomes
 * Get all learning outcomes for a specific course
 */
router.get('/course/:courseId/outcomes', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      res.status(400).json({
        success: false,
        error: 'courseId is required',
      });
      return;
    }

    const outcomes = await learningOutcomesService.getCourseOutcomes(courseId);

    res.json({
      success: true,
      data: outcomes,
    });
  } catch (error) {
    logger.error('Error getting course outcomes:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /analytics/enrollment/:enrollmentId/outcomes
 * Get learning outcomes for a specific enrollment
 */
router.get('/enrollment/:enrollmentId/outcomes', async (req: Request, res: Response): Promise<void> => {
  try {
    const { enrollmentId } = req.params;

    if (!enrollmentId) {
      res.status(400).json({
        success: false,
        error: 'enrollmentId is required',
      });
      return;
    }

    const outcomes = await learningOutcomesService.getEnrollmentOutcomes(enrollmentId);

    res.json({
      success: true,
      data: outcomes,
    });
  } catch (error) {
    logger.error('Error getting enrollment outcomes:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /analytics/course/:courseId/completion-rate
 * Get completion rate for a course
 */
router.get('/course/:courseId/completion-rate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      res.status(400).json({
        success: false,
        error: 'courseId is required',
      });
      return;
    }

    const completionData = await learningOutcomesService.calculateCourseCompletionRate(courseId);

    res.json({
      success: true,
      data: completionData,
    });
  } catch (error) {
    logger.error('Error calculating course completion rate:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /analytics/course/:courseId/time-to-mastery
 * Get average time to mastery for a course
 */
router.get('/course/:courseId/time-to-mastery', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      res.status(400).json({
        success: false,
        error: 'courseId is required',
      });
      return;
    }

    const timeData = await learningOutcomesService.calculateCourseTimeToMastery(courseId);

    res.json({
      success: true,
      data: timeData,
    });
  } catch (error) {
    logger.error('Error calculating course time to mastery:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /analytics/course/:courseId/average-score
 * Get average assessment score for a course
 */
router.get('/course/:courseId/average-score', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      res.status(400).json({
        success: false,
        error: 'courseId is required',
      });
      return;
    }

    const scoreData = await learningOutcomesService.calculateCourseAverageScore(courseId);

    res.json({
      success: true,
      data: scoreData,
    });
  } catch (error) {
    logger.error('Error calculating course average score:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /analytics/course/:courseId/at-risk-students
 * Identify at-risk students in a course
 */
router.get('/course/:courseId/at-risk-students', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { scoreThreshold = 50 } = req.query;

    if (!courseId) {
      res.status(400).json({
        success: false,
        error: 'courseId is required',
      });
      return;
    }

    const threshold = typeof scoreThreshold === 'string' ? parseInt(scoreThreshold, 10) : 50;
    const atRiskData = await learningOutcomesService.identifyAtRiskStudents(courseId, threshold);

    res.json({
      success: true,
      data: atRiskData,
    });
  } catch (error) {
    logger.error('Error identifying at-risk students:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /analytics/course/:courseId/skill-proficiency
 * Get skill proficiency distribution for a course
 */
router.get('/course/:courseId/skill-proficiency', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      res.status(400).json({
        success: false,
        error: 'courseId is required',
      });
      return;
    }

    const proficiencyData = await learningOutcomesService.getSkillProficiencyDistribution(courseId);

    res.json({
      success: true,
      data: proficiencyData,
    });
  } catch (error) {
    logger.error('Error getting skill proficiency distribution:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /analytics/course/:courseId/modules
 * Get module-level analytics for a course
 */
router.get('/course/:courseId/modules', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      res.status(400).json({
        success: false,
        error: 'courseId is required',
      });
      return;
    }

    const moduleAnalytics = await learningOutcomesService.getModuleAnalytics(courseId);

    res.json({
      success: true,
      data: moduleAnalytics,
    });
  } catch (error) {
    logger.error('Error getting module analytics:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

export default router;
