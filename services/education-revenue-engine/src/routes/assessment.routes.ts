import { Router, Request, Response, NextFunction } from 'express';
import { assessmentService } from '../services/assessment.service';

const router = Router();

// POST /api/v1/assessments/:id/submit - Submit an assessment
router.post('/:id/submit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { enrollmentId, answers, timeSpent } = req.body;

    const result = await assessmentService.submitAssessment({
      enrollmentId,
      assessmentId: req.params.id,
      answers,
      timeSpent,
    });

    res.status(201).json({
      success: true,
      data: result,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/assessments/:id/results - Get assessment results
router.get('/:id/results', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await assessmentService.getAssessmentResults(req.params.id);

    res.json({
      success: true,
      data: results,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/assessments/student/:studentId/history - Get student assessment history
router.get('/student/:studentId/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await assessmentService.getStudentAssessmentHistory(req.params.studentId);

    res.json({
      success: true,
      data: history,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
