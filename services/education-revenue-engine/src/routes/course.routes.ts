import { Router, Request, Response, NextFunction } from 'express';
import { courseService } from '../services/course.service';

const router = Router();

// GET /api/v1/courses - List all courses
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tier, language, page = 1, pageSize = 10 } = req.query;
    
    const result = await courseService.listCourses(
      tier as string | undefined,
      language as string | undefined,
      parseInt(page as string),
      parseInt(pageSize as string)
    );

    res.json({
      success: true,
      data: result.courses,
      pagination: {
        total: result.total,
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
        totalPages: Math.ceil(result.total / parseInt(pageSize as string)),
      },
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/courses - Create a new course
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await courseService.createCourse(req.body);
    res.status(201).json({
      success: true,
      data: course,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/courses/:id - Get a specific course
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const course = await courseService.getCourse(req.params.id);
    
    if (!course) {
      res.status(404).json({
        success: false,
        error: 'Course not found',
        timestamp: new Date(),
      });
      return;
    }

    res.json({
      success: true,
      data: course,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/v1/courses/:id - Update a course
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await courseService.updateCourse(req.params.id, req.body);
    res.json({
      success: true,
      data: course,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/courses/:id - Delete a course
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await courseService.deleteCourse(req.params.id);
    res.json({
      success: true,
      message: 'Course deleted successfully',
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/courses/:id/modules - Create a module
router.post('/:id/modules', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const module = await courseService.createModule({
      ...req.body,
      courseId: req.params.id,
    });
    res.status(201).json({
      success: true,
      data: module,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/courses/:id/assessments - Create an assessment
router.post('/:id/assessments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assessment = await courseService.createAssessment({
      ...req.body,
      courseId: req.params.id,
    });
    res.status(201).json({
      success: true,
      data: assessment,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
