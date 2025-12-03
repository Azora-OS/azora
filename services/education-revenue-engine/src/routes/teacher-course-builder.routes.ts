import { Router, Request, Response } from 'express';
import { teacherCourseBuilderService } from '../services/teacher-course-builder.service';
import { logger } from '../utils/logger';

const router = Router();

router.post('/teacher/courses', async (req: Request, res: Response) => {
  try {
    const { instructorId, title, description, tier, language } = req.body;
    const course = await teacherCourseBuilderService.createCourse(instructorId, { title, description, tier, language });
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    logger.error('Error creating course', { error });
    res.status(500).json({ success: false, error: 'Failed to create course' });
  }
});

router.put('/teacher/courses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = await teacherCourseBuilderService.updateCourse(id, req.body);
    res.json({ success: true, data: course });
  } catch (error) {
    logger.error('Error updating course', { error });
    res.status(500).json({ success: false, error: 'Failed to update course' });
  }
});

router.delete('/teacher/courses/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await teacherCourseBuilderService.deleteCourse(id);
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    logger.error('Error deleting course', { error });
    res.status(500).json({ success: false, error: 'Failed to delete course' });
  }
});

router.post('/teacher/courses/:id/modules', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const module = await teacherCourseBuilderService.addModule(id, req.body);
    res.status(201).json({ success: true, data: module });
  } catch (error) {
    logger.error('Error adding module', { error });
    res.status(500).json({ success: false, error: 'Failed to add module' });
  }
});

router.post('/teacher/courses/:id/publish', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await teacherCourseBuilderService.publishCourse(id);
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Error publishing course', { error });
    res.status(500).json({ success: false, error: 'Failed to publish course' });
  }
});

export default router;
