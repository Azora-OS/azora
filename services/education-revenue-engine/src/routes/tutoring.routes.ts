import { Router, Request, Response, NextFunction } from 'express';
import { tutoringService } from '../integrations/elara-integration';

const router = Router();

// POST /api/v1/tutoring/ask - Ask a tutoring question
router.post('/ask', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId, enrollmentId, courseId, moduleId, question, context } = req.body;

    const result = await tutoringService.askQuestion({
      studentId,
      enrollmentId,
      courseId,
      moduleId,
      question,
      context,
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

// GET /api/v1/tutoring/history/:studentId - Get tutoring history
router.get('/history/:studentId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await tutoringService.getTutoringHistory(req.params.studentId);

    res.json({
      success: true,
      data: history,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/tutoring/recommendations/:studentId/:enrollmentId - Get personalized recommendations
router.get(
  '/recommendations/:studentId/:enrollmentId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recommendations = await tutoringService.getRecommendations(
        req.params.studentId,
        req.params.enrollmentId
      );

      res.json({
        success: true,
        data: recommendations,
        timestamp: new Date(),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
