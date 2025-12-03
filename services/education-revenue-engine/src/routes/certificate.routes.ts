import { Router, Request, Response } from 'express';
import { certificateService } from '../services/certificate.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /certificates/generate
 * Generate a digital certificate upon course completion
 * Requirements: 1.1, 1.2
 */
router.post('/certificates/generate', async (req: Request, res: Response) => {
  try {
    const { enrollmentId } = req.body;

    if (!enrollmentId) {
      return res.status(400).json({
        success: false,
        error: 'enrollmentId is required',
      });
    }

    const certificate = await certificateService.generateCertificate(enrollmentId);

    res.status(201).json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    logger.error('Error generating certificate', { error });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate certificate',
    });
  }
});

/**
 * GET /certificates/:id
 * Get certificate by ID
 * Requirements: 1.1, 1.2
 */
router.get('/certificates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const certificate = await certificateService.getCertificateById(id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found',
      });
    }

    res.json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    logger.error('Error fetching certificate', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch certificate',
    });
  }
});

/**
 * GET /certificates/:studentId
 * Get all certificates for a student
 * Requirements: 1.1, 1.2
 */
router.get('/certificates/student/:studentId', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const certificates = await certificateService.getCertificatesByStudentId(studentId);

    res.json({
      success: true,
      data: certificates,
      count: certificates.length,
    });
  } catch (error) {
    logger.error('Error fetching student certificates', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch certificates',
    });
  }
});

/**
 * GET /verify/:verificationUrl
 * Verify certificate by verification URL
 * Requirements: 1.1, 1.2
 */
router.get('/verify/:verificationUrl', async (req: Request, res: Response) => {
  try {
    const { verificationUrl } = req.params;
    const fullUrl = `${process.env.CERTIFICATE_BASE_URL || 'https://azora.edu'}/verify/${verificationUrl}`;

    const certificate = await certificateService.verifyCertificate(fullUrl);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found or invalid verification URL',
      });
    }

    res.json({
      success: true,
      data: certificate,
      verified: true,
    });
  } catch (error) {
    logger.error('Error verifying certificate', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to verify certificate',
    });
  }
});

/**
 * POST /certificates/generate/:enrollmentId/:language
 * Generate certificate in a specific language
 * Requirements: 1.1, 1.2
 */
router.post('/certificates/generate/:enrollmentId/:language', async (req: Request, res: Response) => {
  try {
    const { enrollmentId, language } = req.params;

    // Validate language code
    if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(language)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid language code format',
      });
    }

    const certificate = await certificateService.generateCertificateInLanguage(
      enrollmentId,
      language
    );

    res.status(201).json({
      success: true,
      data: certificate,
      language,
    });
  } catch (error) {
    logger.error('Error generating certificate in language', { error });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate certificate',
    });
  }
});

export default router;
