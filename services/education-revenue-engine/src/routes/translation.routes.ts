import { Router, Request, Response } from 'express';
import { translationService } from '../services/translation.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /courses/:id/translate
 * Get available translations for a course
 * Requirements: 6.1, 6.2
 */
router.get('/courses/:id/translate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { language } = req.query;

    if (!language || typeof language !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'language query parameter is required',
      });
    }

    const translation = await translationService.translateCourse(id, language);

    res.json({
      success: true,
      data: translation,
    });
  } catch (error) {
    logger.error('Error translating course', { error });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to translate course',
    });
  }
});

/**
 * POST /courses/:id/languages
 * Add language support to a course
 * Requirements: 6.1, 6.2
 */
router.post('/courses/:id/languages', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { languages } = req.body;

    if (!languages || !Array.isArray(languages)) {
      return res.status(400).json({
        success: false,
        error: 'languages array is required',
      });
    }

    const supportedLanguages = translationService.getSupportedLanguages();
    const invalidLanguages = languages.filter((lang) => !supportedLanguages.includes(lang));

    if (invalidLanguages.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Unsupported languages: ${invalidLanguages.join(', ')}`,
        supportedLanguages,
      });
    }

    // Translate course to each language
    const translations = await Promise.all(
      languages.map((lang) => translationService.translateCourse(id, lang))
    );

    res.status(201).json({
      success: true,
      data: {
        courseId: id,
        languages: translations,
        count: translations.length,
      },
    });
  } catch (error) {
    logger.error('Error adding language support', { error });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add language support',
    });
  }
});

/**
 * GET /languages
 * Get list of supported languages
 * Requirements: 6.1, 6.2
 */
router.get('/languages', async (req: Request, res: Response) => {
  try {
    const languages = translationService.getSupportedLanguages();

    res.json({
      success: true,
      data: languages,
      count: languages.length,
    });
  } catch (error) {
    logger.error('Error fetching supported languages', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supported languages',
    });
  }
});

/**
 * GET /ui/:language
 * Get localized UI strings for a language
 * Requirements: 6.1, 6.2
 */
router.get('/ui/:language', async (req: Request, res: Response) => {
  try {
    const { language } = req.params;

    const uiStrings = await translationService.getLocalizedUI(language);

    res.json({
      success: true,
      data: uiStrings,
      language,
    });
  } catch (error) {
    logger.error('Error fetching localized UI', { error });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch localized UI',
    });
  }
});

/**
 * GET /assessments/:id/localize/:language
 * Get localized assessment for a language
 * Requirements: 6.1, 6.2
 */
router.get('/assessments/:id/localize/:language', async (req: Request, res: Response) => {
  try {
    const { id, language } = req.params;

    const localizedAssessment = await translationService.localizeAssessment(id, language);

    res.json({
      success: true,
      data: localizedAssessment,
      language,
    });
  } catch (error) {
    logger.error('Error localizing assessment', { error });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to localize assessment',
    });
  }
});

export default router;
