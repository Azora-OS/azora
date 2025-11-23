import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { requireRole, AuthorizedRequest } from '../middleware/authorization.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validators } from '../utils/validators.js';
import { AppError } from '../middleware/errorHandler.js';
import { fundService } from '../services/fund.service.js';

const router = Router();

// Get Citadel Fund status
router.get(
  '/status',
  asyncHandler(async (_req: any, res: Response) => {
    const fund = await fundService.getFundStatus();
    const impactMetrics = await fundService.getImpactMetrics();
    
    res.json({
      success: true,
      data: {
        ...fund,
        contributionRate: 10,
        distributionRate: fund.totalContributions > 0 
          ? (fund.totalDistributions / fund.totalContributions) * 100 
          : 0,
        impactMetrics,
      },
    });
  })
);

// Get fund balance
router.get(
  '/balance',
  asyncHandler(async (_req: any, res: Response) => {
    const balance = await fundService.getBalance();
    
    res.json({
      success: true,
      data: {
        balance,
        currency: 'USD',
        lastUpdated: new Date(),
      },
    });
  })
);

// Get fund contributions
router.get(
  '/contributions',
  asyncHandler(async (req: any, res: Response) => {
    const { page, pageSize } = validators.validatePagination(req.query.page, req.query.pageSize);
    const { startDate, endDate } = req.query;
    
    // TODO: Call fund service to get contributions
    // const contributions = await fundService.getContributions(page, pageSize, startDate, endDate);
    
    res.json({
      success: true,
      data: [],
      pagination: {
        page,
        pageSize,
        total: 0,
        totalPages: 0,
      },
      summary: {
        totalContributions: 0,
        averageContribution: 0,
        period: {
          startDate: startDate || new Date(),
          endDate: endDate || new Date(),
        },
      },
    });
  })
);

// Get fund distributions
router.get(
  '/distributions',
  asyncHandler(async (req: any, res: Response) => {
    const { page, pageSize } = validators.validatePagination(req.query.page, req.query.pageSize);
    const { type } = req.query;
    
    const result = await fundService.getDistributions(page, pageSize, type);
    const stats = await fundService.getDistributionStats();
    
    res.json({
      success: true,
      data: result.distributions,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
      summary: {
        totalDistributions: stats.totalDistributions,
        totalDistributedAmount: stats.totalDistributedAmount,
        averageDistribution: stats.averageDistribution,
        byType: stats.byType,
      },
    });
  })
);

// Create fund distribution
router.post(
  '/distributions',
  authMiddleware,
  requireRole(['admin', 'manager']),
  asyncHandler(async (req: AuthorizedRequest, res: Response) => {
    const validatedData = validators.validateFundDistribution(req.body);
    
    // Validate distribution before creating
    const validation = fundService.validateDistribution(validatedData);
    if (!validation.valid) {
      throw new AppError(400, validation.errors.join(', '));
    }
    
    const distribution = await fundService.createDistribution(validatedData);
    
    res.status(201).json({
      success: true,
      message: 'Fund distribution created successfully',
      data: distribution,
    });
  })
);

// Get distribution by ID
router.get(
  '/distributions/:distributionId',
  asyncHandler(async (req: any, res: Response) => {
    const { distributionId } = req.params;
    
    if (!validators.validateUUID(distributionId)) {
      throw new AppError(400, 'Invalid distribution ID format');
    }
    
    const distribution = await fundService.getDistributionById(distributionId);
    
    res.json({
      success: true,
      data: distribution,
    });
  })
);

// Update distribution status
router.put(
  '/distributions/:distributionId/status',
  authMiddleware,
  requireRole(['admin', 'manager']),
  asyncHandler(async (req: AuthorizedRequest, res: Response) => {
    const { distributionId } = req.params;
    const { status } = req.body;
    
    if (!validators.validateUUID(distributionId)) {
      throw new AppError(400, 'Invalid distribution ID format');
    }
    
    const validStatuses = ['pending', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      throw new AppError(400, 'Invalid distribution status');
    }
    
    const distribution = await fundService.updateDistributionStatus(distributionId, status);
    
    res.json({
      success: true,
      message: 'Distribution status updated successfully',
      data: distribution,
    });
  })
);

// Get fund impact metrics
router.get(
  '/impact/metrics',
  asyncHandler(async (req: any, res: Response) => {
    const metrics = await fundService.getImpactMetrics();
    
    res.json({
      success: true,
      data: {
        ...metrics,
        totalFundsDistributed: metrics.totalImpactAmount,
      },
    });
  })
);

// Get fund analytics
router.get(
  '/analytics/summary',
  authMiddleware,
  requireRole(['admin', 'manager']),
  asyncHandler(async (req: AuthorizedRequest, res: Response) => {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    const analytics = await fundService.getAnalytics(startDate, endDate);
    
    res.json({
      success: true,
      data: analytics,
    });
  })
);

// Get fund audit trail
router.get(
  '/audit/trail',
  authMiddleware,
  requireRole(['admin', 'manager']),
  asyncHandler(async (req: AuthorizedRequest, res: Response) => {
    const { page, pageSize } = validators.validatePagination((req as any).query.page, (req as any).query.pageSize);
    
    const auditTrail = await fundService.getAuditTrail(page, pageSize);
    
    res.json({
      success: true,
      data: auditTrail.entries,
      pagination: {
        page: auditTrail.page,
        pageSize: auditTrail.pageSize,
        total: auditTrail.total,
        totalPages: auditTrail.totalPages,
      },
    });
  })
);

// Trigger fund distribution (batch distribution)
router.post(
  '/distributions/trigger',
  authMiddleware,
  requireRole(['admin']),
  asyncHandler(async (req: AuthorizedRequest, res: Response) => {
    const { amount, type, description } = req.body;
    
    if (!amount || !type || !description) {
      throw new AppError(400, 'amount, type, and description are required');
    }
    
    const validation = fundService.validateDistribution({ amount, type, description });
    if (!validation.valid) {
      throw new AppError(400, validation.errors.join(', '));
    }
    
    const distribution = await fundService.createDistribution({ amount, type, description });
    
    res.json({
      success: true,
      message: 'Fund distribution triggered successfully',
      data: {
        distributionId: distribution.id,
        status: distribution.status,
        triggeredAt: distribution.distributedAt,
        estimatedCompletionTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  })
);

// Get fund configuration
router.get(
  '/config',
  authMiddleware,
  requireRole(['admin', 'manager']),
  asyncHandler(async (req: AuthorizedRequest, res: Response) => {
    res.json({
      success: true,
      data: {
        contributionPercentage: 10,
        minDistributionAmount: 100,
        maxDistributionAmount: 100000,
        distributionFrequency: 'monthly',
        nextDistributionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoDistributionEnabled: true,
      },
    });
  })
);

// Update fund configuration
router.put(
  '/config',
  authMiddleware,
  requireRole(['admin']),
  asyncHandler(async (req: AuthorizedRequest, res: Response) => {
    res.json({
      success: true,
      message: 'Fund configuration updated successfully',
      data: {
        ...req.body,
        updatedAt: new Date(),
      },
    });
  })
);

export default router;
