import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const router = express.Router();

// Basic create audit endpoint
router.post('/api/constitutional-ai/audit', async (req, res) => {
  try {
    const { auditType, complianceScore, violations, recommendations, auditedBy } = req.body;
    const audit = await prisma.constitutionalAudit.create({
      data: { auditType, complianceScore, violations: violations || [], recommendations: recommendations || [], auditedBy },
    });
    res.json({ success: true, audit });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch audit
router.get('/api/constitutional-ai/audit/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const audit = await prisma.constitutionalAudit.findUnique({ where: { id } });
    if (!audit) return res.status(404).json({ success: false, error: 'Audit not found' });
    res.json({ success: true, audit });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
/**
 * Constitutional AI Audit Controller
 * Ubuntu Philosophy: "My security ensures our freedom"
 */

import { PrismaClient } from '@prisma/client';
import { getLogger } from '../../../shared/monitoring/logger';

const prisma = new PrismaClient();
const logger = getLogger('constitutional-audit');

export interface AuditRecord {
  id: string;
  content: string;
  action?: string;
  result: {
    compliant: boolean;
    score: number;
    violations: string[];
    biasDetection: any;
    ethicalAnalysis: any;
    selfCritique: any;
  };
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface AuditQuery {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  compliant?: boolean;
  minScore?: number;
  maxScore?: number;
  limit?: number;
  offset?: number;
}

export class ConstitutionalAuditController {
  async createAuditRecord(auditData: Omit<AuditRecord, 'id' | 'timestamp'>): Promise<AuditRecord> {
    try {
      const record = await prisma.constitutionalAudit.create({
        data: {
          content: auditData.content,
          action: auditData.action,
          compliant: auditData.result.compliant,
          score: auditData.result.score,
          violations: auditData.result.violations,
          biasDetection: auditData.result.biasDetection,
          ethicalAnalysis: auditData.result.ethicalAnalysis,
          selfCritique: auditData.result.selfCritique,
          userId: auditData.userId,
          ipAddress: auditData.ipAddress,
          userAgent: auditData.userAgent,
          metadata: {
            timestamp: new Date().toISOString(),
            ubuntu: 'Constitutional AI audit - My security ensures our freedom'
          }
        }
      });

      logger.info('Audit record created', {
        auditId: record.id,
        userId: auditData.userId,
        compliant: auditData.result.compliant,
        score: auditData.result.score
      });

      return {
        id: record.id,
        content: record.content,
        action: record.action,
        result: {
          compliant: record.compliant,
          score: record.score,
          violations: record.violations as string[],
          biasDetection: record.biasDetection,
          ethicalAnalysis: record.ethicalAnalysis,
          selfCritique: record.selfCritique
        },
        userId: record.userId,
        ipAddress: record.ipAddress,
        userAgent: record.userAgent,
        timestamp: record.createdAt
      };
    } catch (error) {
      logger.error('Failed to create audit record', { error, auditData });
      throw error;
    }
  }

  async getAuditRecord(id: string): Promise<AuditRecord | null> {
    try {
      const record = await prisma.constitutionalAudit.findUnique({
        where: { id }
      });

      if (!record) {
        return null;
      }

      return {
        id: record.id,
        content: record.content,
        action: record.action,
        result: {
          compliant: record.compliant,
          score: record.score,
          violations: record.violations as string[],
          biasDetection: record.biasDetection,
          ethicalAnalysis: record.ethicalAnalysis,
          selfCritique: record.selfCritique
        },
        userId: record.userId,
        ipAddress: record.ipAddress,
        userAgent: record.userAgent,
        timestamp: record.createdAt
      };
    } catch (error) {
      logger.error('Failed to get audit record', { error, id });
      throw error;
    }
  }

  async queryAuditRecords(query: AuditQuery): Promise<{ records: AuditRecord[]; total: number }> {
    try {
      const where: any = {};

      if (query.userId) {
        where.userId = query.userId;
      }

      if (query.startDate || query.endDate) {
        where.createdAt = {};
        if (query.startDate) {
          where.createdAt.gte = query.startDate;
        }
        if (query.endDate) {
          where.createdAt.lte = query.endDate;
        }
      }

      if (query.compliant !== undefined) {
        where.compliant = query.compliant;
      }

      if (query.minScore !== undefined || query.maxScore !== undefined) {
        where.score = {};
        if (query.minScore !== undefined) {
          where.score.gte = query.minScore;
        }
        if (query.maxScore !== undefined) {
          where.score.lte = query.maxScore;
        }
      }

      const [records, total] = await Promise.all([
        prisma.constitutionalAudit.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: query.limit || 50,
          skip: query.offset || 0
        }),
        prisma.constitutionalAudit.count({ where })
      ]);

      const formattedRecords = records.map(record => ({
        id: record.id,
        content: record.content,
        action: record.action,
        result: {
          compliant: record.compliant,
          score: record.score,
          violations: record.violations as string[],
          biasDetection: record.biasDetection,
          ethicalAnalysis: record.ethicalAnalysis,
          selfCritique: record.selfCritique
        },
        userId: record.userId,
        ipAddress: record.ipAddress,
        userAgent: record.userAgent,
        timestamp: record.createdAt
      }));

      return { records: formattedRecords, total };
    } catch (error) {
      logger.error('Failed to query audit records', { error, query });
      throw error;
    }
  }

  async getAuditStatistics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{
    totalAudits: number;
    compliantCount: number;
    nonCompliantCount: number;
    averageScore: number;
    commonViolations: Array<{ violation: string; count: number }>;
    biasDetectionRate: number;
  }> {
    try {
      const startDate = this.getTimeframeStartDate(timeframe);

      const [
        totalAudits,
        compliantCount,
        averageScore,
        violationsData,
        biasDetectionCount
      ] = await Promise.all([
        prisma.constitutionalAudit.count({
          where: { createdAt: { gte: startDate } }
        }),
        prisma.constitutionalAudit.count({
          where: { createdAt: { gte: startDate }, compliant: true }
        }),
        prisma.constitutionalAudit.aggregate({
          where: { createdAt: { gte: startDate } },
          _avg: { score: true }
        }),
        prisma.constitutionalAudit.findMany({
          where: { createdAt: { gte: startDate }, violations: { not: [] } },
          select: { violations: true }
        }),
        prisma.constitutionalAudit.count({
          where: {
            createdAt: { gte: startDate },
            biasDetection: { not: null }
          }
        })
      ]);

      // Count common violations
      const violationCounts = new Map<string, number>();
      violationsData.forEach(record => {
        const violations = record.violations as string[];
        violations.forEach(violation => {
          violationCounts.set(violation, (violationCounts.get(violation) || 0) + 1);
        });
      });

      const commonViolations = Array.from(violationCounts.entries())
        .map(([violation, count]) => ({ violation, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const nonCompliantCount = totalAudits - compliantCount;
      const biasDetectionRate = totalAudits > 0 ? biasDetectionCount / totalAudits : 0;

      return {
        totalAudits,
        compliantCount,
        nonCompliantCount,
        averageScore: averageScore._avg.score || 0,
        commonViolations,
        biasDetectionRate
      };
    } catch (error) {
      logger.error('Failed to get audit statistics', { error, timeframe });
      throw error;
    }
  }

  async deleteAuditRecord(id: string, userId?: string): Promise<boolean> {
    try {
      const where: any = { id };
      if (userId) {
        where.userId = userId;
      }

      const result = await prisma.constitutionalAudit.deleteMany({ where });

      logger.info('Audit record deleted', {
        auditId: id,
        userId,
        deletedCount: result.count
      });

      return result.count > 0;
    } catch (error) {
      logger.error('Failed to delete audit record', { error, id, userId });
      throw error;
    }
  }

  async exportAuditData(query: AuditQuery): Promise<string> {
    try {
      const { records } = await this.queryAuditRecords({
        ...query,
        limit: 10000 // Large limit for export
      });

      const csvHeader = [
        'ID',
        'Timestamp',
        'User ID',
        'Action',
        'Compliant',
        'Score',
        'Violations',
        'Bias Detected',
        'IP Address',
        'User Agent'
      ].join(',');

      const csvRows = records.map(record => [
        record.id,
        record.timestamp.toISOString(),
        record.userId || '',
        record.action || '',
        record.result.compliant,
        record.result.score,
        `"${record.result.violations.join('; ')}"`,
        record.result.biasDetection?.hasBias || false,
        record.ipAddress || '',
        `"${record.userAgent || ''}"`
      ].join(','));

      return [csvHeader, ...csvRows].join('\n');
    } catch (error) {
      logger.error('Failed to export audit data', { error, query });
      throw error;
    }
  }

  private getTimeframeStartDate(timeframe: 'day' | 'week' | 'month'): Date {
    const now = new Date();
    
    switch (timeframe) {
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }
}

export default ConstitutionalAuditController;
