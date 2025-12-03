import { Router, Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/v1/payments/process
 * Process a payment for a course upgrade or enrollment
 * Requirements: 1.2, 5.1
 */
router.post('/process', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId, courseId, amount, tier, period, paymentMethodId } = req.body;

    if (!studentId || !courseId || !amount || !tier || !period || !paymentMethodId) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: studentId, courseId, amount, tier, period, paymentMethodId',
        timestamp: new Date(),
      });
      return;
    }

    const payment = await paymentService.processPayment({
      studentId,
      courseId,
      amount,
      tier,
      period,
      paymentMethodId,
    });

    res.status(201).json({
      success: true,
      data: payment,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error processing payment:', error);
    next(error);
  }
});

/**
 * GET /api/v1/payments/:studentId
 * Get all payments for a student
 * Requirements: 1.2, 5.1
 */
router.get('/:studentId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      res.status(400).json({
        success: false,
        error: 'studentId is required',
        timestamp: new Date(),
      });
      return;
    }

    const payments = await paymentService.getStudentPayments(studentId);

    res.json({
      success: true,
      data: payments,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error fetching student payments:', error);
    next(error);
  }
});

/**
 * GET /api/v1/payments/details/:paymentId
 * Get a specific payment by ID
 * Requirements: 1.2, 5.1
 */
router.get('/details/:paymentId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      res.status(400).json({
        success: false,
        error: 'paymentId is required',
        timestamp: new Date(),
      });
      return;
    }

    const payment = await paymentService.getPaymentById(paymentId);

    res.json({
      success: true,
      data: payment,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error fetching payment:', error);
    next(error);
  }
});

/**
 * POST /api/v1/payments/:paymentId/refund
 * Refund a payment
 * Requirements: 1.2, 5.1
 */
router.post('/:paymentId/refund', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { paymentId } = req.params;
    const { reason, amount } = req.body;

    if (!paymentId) {
      res.status(400).json({
        success: false,
        error: 'paymentId is required',
        timestamp: new Date(),
      });
      return;
    }

    const payment = await paymentService.refundPayment(paymentId, { reason, amount });

    res.json({
      success: true,
      data: payment,
      message: 'Payment refunded successfully',
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error refunding payment:', error);
    next(error);
  }
});

/**
 * GET /api/v1/payments/stats/:period
 * Get payment statistics for a period
 * Requirements: 5.1
 */
router.get('/stats/:period', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { period } = req.params;

    if (!period) {
      res.status(400).json({
        success: false,
        error: 'period is required (format: YYYY-MM)',
        timestamp: new Date(),
      });
      return;
    }

    const stats = await paymentService.getPaymentStats(period);

    res.json({
      success: true,
      data: stats,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error fetching payment statistics:', error);
    next(error);
  }
});

/**
 * GET /api/v1/payments/course/:courseId/history
 * Get payment history for a course
 * Requirements: 5.1
 */
router.get('/course/:courseId/history', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      res.status(400).json({
        success: false,
        error: 'courseId is required',
        timestamp: new Date(),
      });
      return;
    }

    const payments = await paymentService.getCoursePaymentHistory(courseId);

    res.json({
      success: true,
      data: payments,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error fetching course payment history:', error);
    next(error);
  }
});

/**
 * POST /api/v1/payments/validate
 * Validate payment amount against course pricing
 * Requirements: 1.2, 5.1
 */
router.post('/validate', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId, amount, tier } = req.body;

    if (!courseId || !amount || !tier) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: courseId, amount, tier',
        timestamp: new Date(),
      });
      return;
    }

    const isValid = await paymentService.validatePaymentAmount(courseId, amount, tier);

    res.json({
      success: true,
      data: {
        isValid,
        courseId,
        amount,
        tier,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error validating payment amount:', error);
    next(error);
  }
});

export default router;
