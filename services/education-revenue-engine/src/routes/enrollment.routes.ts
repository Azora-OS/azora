import { Router, Request, Response, NextFunction } from 'express';
import { enrollmentService } from '../services/enrollment.service';

const router = Router();

// POST /api/v1/enrollments - Enroll a student in a course
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollment = await enrollmentService.enrollStudent(req.body);
    res.status(201).json({
      success: true,
      data: enrollment,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/enrollments/:id - Get a specific enrollment
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const enrollment = await enrollmentService.getEnrollment(req.params.id);
    
    if (!enrollment) {
      res.status(404).json({
        success: false,
        error: 'Enrollment not found',
        timestamp: new Date(),
      });
      return;
    }

    res.json({
      success: true,
      data: enrollment,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/enrollments/student/:studentId - Get all enrollments for a student
router.get('/student/:studentId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollments = await enrollmentService.getStudentEnrollments(req.params.studentId);
    res.json({
      success: true,
      data: enrollments,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/enrollments/:id/progress - Update enrollment progress
router.put('/:id/progress', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { progress } = req.body;
    
    if (typeof progress !== 'number') {
      res.status(400).json({
        success: false,
        error: 'Progress must be a number',
        timestamp: new Date(),
      });
      return;
    }

    const enrollment = await enrollmentService.updateProgress(req.params.id, progress);
    res.json({
      success: true,
      data: enrollment,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/enrollments/:id/complete - Mark enrollment as completed
router.post('/:id/complete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollment = await enrollmentService.completeEnrollment(req.params.id);
    res.json({
      success: true,
      data: enrollment,
      message: 'Enrollment completed successfully',
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/enrollments/:id/drop - Drop an enrollment
router.post('/:id/drop', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollment = await enrollmentService.dropEnrollment(req.params.id);
    res.json({
      success: true,
      data: enrollment,
      message: 'Enrollment dropped successfully',
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
