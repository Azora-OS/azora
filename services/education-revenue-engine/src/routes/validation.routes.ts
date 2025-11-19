import { Router, Request, Response, NextFunction } from 'express';
import { contentValidationService } from '../integrations/constitutional-ai-integration';

const router = Router();

// POST /api/v1/validation/course - Validate course content
router.post('/course', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId, content, title, language } = req.body;

    const result = await contentValidationService.validateCourseContent({
      courseId,
      contentType: 'course',
      content,
      title,
      language,
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

// POST /api/v1/validation/assessment - Validate assessment questions
router.post('/assessment', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { assessmentId } = req.body;

    const result = await contentValidationService.validateAssessmentQuestions(assessmentId);

    res.status(201).json({
      success: true,
      data: result,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/validation/feedback - Validate teacher feedback
router.post('/feedback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { enrollmentId, feedback } = req.body;

    const result = await contentValidationService.validateTeacherFeedback(enrollmentId, feedback);

    res.status(201).json({
      success: true,
      data: result,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/validation/bias - Check for bias
router.post('/bias', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body;

    if (!content) {
      res.status(400).json({
        success: false,
        error: 'Content is required',
        timestamp: new Date(),
      });
      return;
    }

    const result = await contentValidationService.checkForBias(content);

    res.json({
      success: true,
      data: result,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/validation/accuracy - Check for accuracy
router.post('/accuracy', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, context } = req.body;

    if (!content) {
      res.status(400).json({
        success: false,
        error: 'Content is required',
        timestamp: new Date(),
      });
      return;
    }

    const result = await contentValidationService.checkForAccuracy(content, context);

    res.json({
      success: true,
      data: result,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/validation/clarity - Check for clarity
router.post('/clarity', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body;

    if (!content) {
      res.status(400).json({
        success: false,
        error: 'Content is required',
        timestamp: new Date(),
      });
      return;
    }

    const result = await contentValidationService.checkForClarity(content);

    res.json({
      success: true,
      data: result,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/validation/safety - Check for safety
router.post('/safety', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body;

    if (!content) {
      res.status(400).json({
        success: false,
        error: 'Content is required',
        timestamp: new Date(),
      });
      return;
    }

    const result = await contentValidationService.checkForSafety(content);

    res.json({
      success: true,
      data: result,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
