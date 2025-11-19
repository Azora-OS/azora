import { Router, Request, Response, NextFunction } from 'express';
import { contextRetrievalService } from '../integrations/knowledge-ocean-integration';

const router = Router();

// POST /api/v1/context/retrieve - Retrieve context for a query
router.post('/retrieve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId, courseId, moduleId, query, language, topK } = req.body;

    const result = await contextRetrievalService.retrieveContext({
      studentId,
      courseId,
      moduleId,
      query,
      language,
      topK,
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

// GET /api/v1/context/language/:courseId/:moduleId/:language - Get language-specific resources
router.get(
  '/language/:courseId/:moduleId/:language',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resources = await contextRetrievalService.getLanguageSpecificResources(
        req.params.courseId,
        req.params.moduleId,
        req.params.language
      );

      res.json({
        success: true,
        data: {
          courseId: req.params.courseId,
          moduleId: req.params.moduleId,
          language: req.params.language,
          resources,
          count: resources.length,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/context/rank - Rank resources by relevance
router.post('/rank', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resources } = req.body;

    if (!resources || !Array.isArray(resources)) {
      res.status(400).json({
        success: false,
        error: 'Resources array is required',
        timestamp: new Date(),
      });
      return;
    }

    const rankedResources = await contextRetrievalService.rankResources(resources);

    res.json({
      success: true,
      data: {
        resources: rankedResources,
        count: rankedResources.length,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
