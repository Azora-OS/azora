import { Router, Request, Response } from 'express';
import { teacherAnalyticsService } from '../services/teacher-analytics.service';
import { logger } from '../utils/logger';

const router = Router();

router.get('/teacher/analytics/:courseId', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const analytics = await teacherAnalyticsService.getCourseAnalytics(courseId);
    res.json({ success: true, data: analytics });
  } catch (error) {
    logger.error('Error fetching course analytics', { error });
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

router.get('/teacher/analytics/:courseId/students', async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const students = await teacherAnalyticsService.getStudentAnalytics(courseId);
    res.json({ success: true, data: students });
  } catch (error) {
    logger.error('Error fetching student analytics', { error });
    res.status(500).json({ success: false, error: 'Failed to fetch student analytics' });
  }
});

router.get('/teacher/revenue/:instructorId', async (req: Request, res: Response) => {
  try {
    const { instructorId } = req.params;
    const report = await teacherAnalyticsService.getRevenueReport(instructorId);
    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('Error fetching revenue report', { error });
    res.status(500).json({ success: false, error: 'Failed to fetch revenue report' });
  }
});

export default router;
