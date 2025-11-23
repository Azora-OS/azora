import { Router, Request, Response } from 'express';
import { revenueService } from '../services/revenue.service.js';
import { auth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Record a revenue transaction
router.post('/:businessId/transactions', auth, async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const { amount, currency, source, receivedAt } = req.body;

    const transaction = await revenueService.recordTransaction(businessId, {
      amount,
      currency,
      source,
      receivedAt,
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

// Get revenue transactions for a business
router.get('/:businessId/transactions', auth, async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const result = await revenueService.getTransactions(businessId, page, pageSize);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

// Get revenue breakdown for a business
router.get('/:businessId/breakdown', auth, async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const { startDate, endDate } = req.query;

    const breakdown = await revenueService.getBreakdown(
      businessId,
      startDate as string,
      endDate as string
    );

    res.json({
      success: true,
      data: breakdown,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

// Get revenue statistics for a business
router.get('/:businessId/statistics', auth, async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const { startDate, endDate } = req.query;

    const stats = await revenueService.getStatistics(
      businessId,
      startDate as string,
      endDate as string
    );

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

// Get revenue trend for a business
router.get('/:businessId/trend', auth, async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const days = parseInt(req.query.days as string) || 30;

    const trend = await revenueService.getRevenueTrend(businessId, days);

    res.json({
      success: true,
      data: trend,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

// Get transaction by ID
router.get('/:businessId/transactions/:transactionId', auth, async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;

    const transaction = await revenueService.getTransactionById(transactionId);

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

// Update transaction status
router.patch('/:businessId/transactions/:transactionId/status', auth, async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const { status } = req.body;

    const transaction = await revenueService.updateTransactionStatus(transactionId, status);

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

export default router;
