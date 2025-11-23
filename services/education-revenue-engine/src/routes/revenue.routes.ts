import { Router, Request, Response, NextFunction } from 'express';
import { revenueService } from '../services/revenue.service';
import { prisma } from '../index';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/v1/revenue/summary
 * Get revenue summary for a period
 * Requirements: 3.1, 5.1
 */
router.get('/summary', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { period } = req.query;

    if (!period || typeof period !== 'string') {
      res.status(400).json({
        success: false,
        error: 'period is required (format: YYYY-MM)',
        timestamp: new Date(),
      });
      return;
    }

    const totalRevenue = await revenueService.getRevenueByPeriod(period);
    const conversionMetrics = await revenueService.getConversionMetrics(period);

    // Calculate average revenue per user
    const totalUsers = conversionMetrics.totalUsers || 1;
    const averageRevenuePerUser = totalRevenue / totalUsers;

    res.json({
      success: true,
      data: {
        period,
        totalRevenue,
        averageRevenuePerUser: Math.round(averageRevenuePerUser * 100) / 100,
        conversionMetrics,
        timestamp: new Date(),
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error fetching revenue summary:', error);
    next(error);
  }
});

/**
 * GET /api/v1/revenue/by-course
 * Get revenue breakdown by course
 * Requirements: 3.1, 5.1
 */
router.get('/by-course', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { period } = req.query;

    if (!period || typeof period !== 'string') {
      res.status(400).json({
        success: false,
        error: 'period is required (format: YYYY-MM)',
        timestamp: new Date(),
      });
      return;
    }

    // Get revenue grouped by course
    const courseRevenue = await prisma.payment.groupBy({
      by: ['courseId'],
      where: {
        period,
        status: 'completed',
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Enrich with course details
    const enrichedData = await Promise.all(
      courseRevenue.map(async (cr: any) => {
        const course = await prisma.course.findUnique({
          where: { id: cr.courseId },
          select: { id: true, title: true, instructorId: true },
        });

        return {
          courseId: cr.courseId,
          courseTitle: course?.title || 'Unknown Course',
          instructorId: course?.instructorId,
          totalRevenue: cr._sum.amount ? Number(cr._sum.amount) : 0,
          paymentCount: cr._count.id,
          averagePayment: cr._count.id > 0 ? (cr._sum.amount ? Number(cr._sum.amount) / cr._count.id : 0) : 0,
        };
      })
    );

    res.json({
      success: true,
      data: {
        period,
        courses: enrichedData,
        totalCourses: enrichedData.length,
        totalRevenue: enrichedData.reduce((sum: number, c: any) => sum + c.totalRevenue, 0),
        timestamp: new Date(),
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error fetching revenue by course:', error);
    next(error);
  }
});

/**
 * GET /api/v1/revenue/by-instructor
 * Get revenue breakdown by instructor with 70/30 split
 * Requirements: 3.1, 5.1
 */
router.get('/by-instructor', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { period } = req.query;

    if (!period || typeof period !== 'string') {
      res.status(400).json({
        success: false,
        error: 'period is required (format: YYYY-MM)',
        timestamp: new Date(),
      });
      return;
    }

    // Get revenue grouped by instructor through courses
    const courseRevenue = await prisma.payment.groupBy({
      by: ['courseId'],
      where: {
        period,
        status: 'completed',
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Map to instructors and calculate 70/30 split
    const instructorMap = new Map<string, any>();

    for (const cr of courseRevenue) {
      const course = await prisma.course.findUnique({
        where: { id: cr.courseId },
        select: { instructorId: true, title: true },
      });

      if (course?.instructorId) {
        const totalRevenue = cr._sum.amount ? Number(cr._sum.amount) : 0;
        const instructorCut = totalRevenue * 0.7; // 70% to instructor
        const azoraCut = totalRevenue * 0.3; // 30% to Azora

        if (!instructorMap.has(course.instructorId)) {
          instructorMap.set(course.instructorId, {
            instructorId: course.instructorId,
            courses: [],
            totalRevenue: 0,
            instructorCut: 0,
            azoraCut: 0,
            paymentCount: 0,
          });
        }

        const instructor = instructorMap.get(course.instructorId);
        instructor.courses.push({
          courseId: cr.courseId,
          courseTitle: course.title,
          courseRevenue: totalRevenue,
          courseInstructorCut: instructorCut,
          courseAzoraCut: azoraCut,
        });
        instructor.totalRevenue += totalRevenue;
        instructor.instructorCut += instructorCut;
        instructor.azoraCut += azoraCut;
        instructor.paymentCount += cr._count.id;
      }
    }

    const instructorData = Array.from(instructorMap.values());

    res.json({
      success: true,
      data: {
        period,
        instructors: instructorData,
        totalInstructors: instructorData.length,
        totalRevenue: instructorData.reduce((sum: number, i: any) => sum + i.totalRevenue, 0),
        totalInstructorCut: instructorData.reduce((sum: number, i: any) => sum + i.instructorCut, 0),
        totalAzoraCut: instructorData.reduce((sum: number, i: any) => sum + i.azoraCut, 0),
        revenueSplit: {
          instructorPercentage: 70,
          azoraPlatformPercentage: 30,
        },
        timestamp: new Date(),
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error fetching revenue by instructor:', error);
    next(error);
  }
});

/**
 * GET /api/v1/revenue/instructor/:instructorId
 * Get revenue details for a specific instructor
 * Requirements: 3.1, 5.1
 */
router.get('/instructor/:instructorId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { instructorId } = req.params;
    const { period } = req.query;

    if (!instructorId) {
      res.status(400).json({
        success: false,
        error: 'instructorId is required',
        timestamp: new Date(),
      });
      return;
    }

    // Get instructor's courses
    const courses = await prisma.course.findMany({
      where: { instructorId },
      select: { id: true, title: true },
    });

    const courseIds = courses.map((c: any) => c.id);

    // Get revenue for instructor's courses
    const query: any = {
      courseId: { in: courseIds },
      status: 'completed',
    };

    if (period && typeof period === 'string') {
      query.period = period;
    }

    const payments = await prisma.payment.findMany({
      where: query,
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals
    const totalRevenue = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    const instructorCut = totalRevenue * 0.7;
    const azoraCut = totalRevenue * 0.3;

    // Group by course
    const courseBreakdown = courses.map((course: any) => {
      const coursePayments = payments.filter((p: any) => p.courseId === course.id);
      const courseRevenue = coursePayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);

      return {
        courseId: course.id,
        courseTitle: course.title,
        totalRevenue: courseRevenue,
        instructorCut: courseRevenue * 0.7,
        azoraCut: courseRevenue * 0.3,
        paymentCount: coursePayments.length,
      };
    });

    res.json({
      success: true,
      data: {
        instructorId,
        period: period || 'all-time',
        totalRevenue,
        instructorCut: Math.round(instructorCut * 100) / 100,
        azoraCut: Math.round(azoraCut * 100) / 100,
        paymentCount: payments.length,
        courseBreakdown,
        revenueSplit: {
          instructorPercentage: 70,
          azoraPlatformPercentage: 30,
        },
        timestamp: new Date(),
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error fetching instructor revenue:', error);
    next(error);
  }
});

/**
 * GET /api/v1/revenue/payment-status
 * Get payment status breakdown
 * Requirements: 5.1
 */
router.get('/payment-status', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { period } = req.query;

    const query: any = {};
    if (period && typeof period === 'string') {
      query.period = period;
    }

    // Get payment counts by status
    const statusBreakdown = await prisma.payment.groupBy({
      by: ['status'],
      where: query,
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
    });

    const breakdown = statusBreakdown.map((sb: any) => ({
      status: sb.status,
      count: sb._count.id,
      totalAmount: sb._sum.amount ? Number(sb._sum.amount) : 0,
    }));

    const totalPayments = breakdown.reduce((sum: number, b: any) => sum + b.count, 0);
    const totalAmount = breakdown.reduce((sum: number, b: any) => sum + b.totalAmount, 0);

    res.json({
      success: true,
      data: {
        period: period || 'all-time',
        breakdown,
        totalPayments,
        totalAmount,
        timestamp: new Date(),
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error fetching payment status:', error);
    next(error);
  }
});

/**
 * GET /api/v1/revenue/report
 * Generate comprehensive revenue report
 * Requirements: 3.1, 5.1
 */
router.get('/report', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { period } = req.query;

    if (!period || typeof period !== 'string') {
      res.status(400).json({
        success: false,
        error: 'period is required (format: YYYY-MM)',
        timestamp: new Date(),
      });
      return;
    }

    // Get all revenue data
    const totalRevenue = await revenueService.getRevenueByPeriod(period);
    const conversionMetrics = await revenueService.getConversionMetrics(period);

    // Get course breakdown
    const courseRevenue = await prisma.payment.groupBy({
      by: ['courseId'],
      where: {
        period,
        status: 'completed',
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get payment status breakdown
    const statusBreakdown = await prisma.payment.groupBy({
      by: ['status'],
      where: { period },
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
    });

    // Calculate instructor payouts
    const instructorPayouts = await prisma.payment.groupBy({
      by: ['courseId'],
      where: {
        period,
        status: 'completed',
      },
      _sum: {
        amount: true,
      },
    });

    let totalInstructorCut = 0;
    let totalAzoraCut = 0;

    for (const payout of instructorPayouts) {
      const amount = payout._sum.amount ? Number(payout._sum.amount) : 0;
      totalInstructorCut += amount * 0.7;
      totalAzoraCut += amount * 0.3;
    }

    res.json({
      success: true,
      data: {
        period,
        summary: {
          totalRevenue,
          totalInstructorCut: Math.round(totalInstructorCut * 100) / 100,
          totalAzoraCut: Math.round(totalAzoraCut * 100) / 100,
          revenueSplit: {
            instructorPercentage: 70,
            azoraPlatformPercentage: 30,
          },
        },
        conversionMetrics,
        paymentStatus: statusBreakdown.map((sb: any) => ({
          status: sb.status,
          count: sb._count.id,
          amount: sb._sum.amount ? Number(sb._sum.amount) : 0,
        })),
        topCourses: courseRevenue
          .sort((a: any, b: any) => Number(b._sum.amount || 0) - Number(a._sum.amount || 0))
          .slice(0, 10)
          .map((cr: any) => ({
            courseId: cr.courseId,
            revenue: cr._sum.amount ? Number(cr._sum.amount) : 0,
            paymentCount: cr._count.id,
          })),
        timestamp: new Date(),
      },
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error generating revenue report:', error);
    next(error);
  }
});

export default router;
