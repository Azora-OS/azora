/**
 * Constitutional Audit Logging Middleware
 * 
 * Logs all Sapiens actions to ConstitutionalAuditLog entity for compliance
 * and governance tracking. Captures:
 * - Pre-check and post-check results
 * - Entity state before/after
 * - User identity and authorization
 * - Constitutional violations or concerns
 * - Evidence for compliance audits (FERPA, GDPR, POPIA)
 */

import { Request, Response, NextFunction } from 'express';

// ============================================================================
// Types
// ============================================================================

export interface AuditLogEntry {
  action: string;
  entityType: string;
  entityId: string;
  userEmail: string;
  preChecksPassed?: boolean;
  postChecksPassed?: boolean;
  constitutionalConcern?: boolean;
  evidence?: Record<string, any>;
  requestPath: string;
  requestMethod: string;
  statusCode?: number;
  timestamp: string;
}

// ============================================================================
// Audit Logging Middleware
// ============================================================================

/**
 * Middleware to log constitutional audit entries
 * Usage: router.post('/enrollments', logAudit('ENROLLMENT_CREATE'), ...)
 */
export function logAudit(action: string, entityType?: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Capture response status code
    const originalJson = res.json;
    let statusCode = 200;

    res.json = function (body) {
      statusCode = res.statusCode;
      return originalJson.call(this, body);
    };

    // Call next middleware
    next();

    // After route handler completes, log the audit entry
    setImmediate(async () => {
      try {
        const prisma = (req as any).prisma;
        if (!prisma) {
          console.warn('[AuditLog] Prisma client not available, skipping audit log');
          return;
        }

        const checkResult = (req as any).constitutionalCheckResult;
        const userEmail = req.user?.email || 'unknown';

        // Extract entity ID from request
        let entityId = '';
        if (req.params.id) {
          entityId = req.params.id;
        } else if (req.params.enrollmentId) {
          entityId = req.params.enrollmentId;
        } else if (req.params.attemptId) {
          entityId = req.params.attemptId;
        } else if (req.params.cohortId) {
          entityId = req.params.cohortId;
        } else if (req.params.sessionId) {
          entityId = req.params.sessionId;
        } else if (req.body?.id) {
          entityId = req.body.id;
        }

        // Determine if there was a constitutional concern
        const constitutionalConcern =
          statusCode === 403 ||
          (checkResult && !checkResult.passed) ||
          req.body?.integritySignals?.browserTabSwitches > 3;

        // Build evidence object
        const evidence = {
          ...checkResult?.evidence,
          statusCode,
          violations: checkResult?.violations,
          requestPath: req.path,
          requestMethod: req.method,
          // Include relevant request body fields for compliance
          ...(req.body?.courseId && { courseId: req.body.courseId }),
          ...(req.body?.type && { type: req.body.type }),
          ...(req.body?.integrityLevel && { integrityLevel: req.body.integrityLevel }),
          ...(req.params.courseId && { courseId: req.params.courseId })
        };

        // Create audit log entry
        const auditLog = await prisma.constitutionalAuditLog.create({
          data: {
            action,
            entityType: entityType || extractEntityType(action),
            entityId,
            userEmail,
            preChecksPassed: checkResult?.passed !== false,
            postChecksPassed: statusCode < 400,
            constitutionalConcern,
            evidence: JSON.stringify(evidence)
          }
        });

        // Log to console for debugging
        if (constitutionalConcern) {
          console.warn('[AuditLog] Constitutional concern detected:', {
            action,
            entityId,
            userEmail,
            violations: checkResult?.violations,
            statusCode
          });
        } else {
          console.log('[AuditLog]', action, 'by', userEmail, '- status:', statusCode);
        }
      } catch (error) {
        console.error('[AuditLog] Failed to write audit entry:', error);
        // Don't throw - audit logging failure shouldn't break the request
      }
    });
  };
}

/**
 * Extract entity type from action string
 * e.g., "ENROLLMENT_CREATE" -> "Enrollment"
 */
function extractEntityType(action: string): string {
  const parts = action.split('_');
  if (parts.length > 0) {
    const entityPart = parts[0];
    return entityPart.charAt(0).toUpperCase() + entityPart.slice(1).toLowerCase();
  }
  return 'Unknown';
}

/**
 * Query recent audit logs for a user (for compliance review)
 */
export async function getUserAuditLog(
  userEmail: string,
  days: number = 30,
  prisma: any
) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const logs = await prisma.constitutionalAuditLog.findMany({
    where: {
      userEmail,
      createdAt: { gte: since }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  return logs;
}

/**
 * Query audit logs by action type (for compliance review)
 */
export async function getAuditLogsByAction(
  action: string,
  days: number = 30,
  limit: number = 100,
  prisma: any
) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const logs = await prisma.constitutionalAuditLog.findMany({
    where: {
      action,
      createdAt: { gte: since }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  return logs;
}

/**
 * Query constitutional violations (for governance dashboard)
 */
export async function getConstitutionalViolations(
  days: number = 30,
  prisma: any
) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const violations = await prisma.constitutionalAuditLog.findMany({
    where: {
      constitutionalConcern: true,
      createdAt: { gte: since }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Parse and annotate violations
  return violations.map((log) => ({
    ...log,
    evidence: log.evidence ? JSON.parse(log.evidence) : {}
  }));
}

/**
 * Compliance report: FERPA violations (unauthorized access to student records)
 */
export async function generateFERPAReport(
  days: number = 90,
  prisma: any
) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Actions that could trigger FERPA concerns:
  // - Enrollment without proper authorization
  // - Assessment attempt by unauthorized user
  // - Assessment score access by non-instructor
  // - Credential verification without consent

  const potentialViolations = await prisma.constitutionalAuditLog.findMany({
    where: {
      createdAt: { gte: since },
      OR: [
        { action: 'ENROLLMENT_CREATE', postChecksPassed: false },
        { action: 'ASSESSMENT_SUBMIT', constitutionalConcern: true },
        { action: 'CREDENTIAL_VERIFY', postChecksPassed: false }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  return {
    reportType: 'FERPA_COMPLIANCE',
    periodDays: days,
    generatedAt: new Date().toISOString(),
    potentialViolations: potentialViolations.length,
    violations: potentialViolations.map((log) => ({
      timestamp: log.createdAt,
      action: log.action,
      entityType: log.entityType,
      userEmail: log.userEmail,
      concern: log.constitutionalConcern,
      evidence: log.evidence ? JSON.parse(log.evidence) : {}
    }))
  };
}

/**
 * Compliance report: GDPR compliance (data processing tracking)
 */
export async function generateGDPRReport(
  days: number = 90,
  prisma: any
) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Actions involving personal data:
  // - Enrollment (personal data processing)
  // - Assessment (performance data)
  // - Credential issuance (identity claims)
  // - Tutoring sessions (interaction data)

  const dataProcessingEvents = await prisma.constitutionalAuditLog.findMany({
    where: {
      createdAt: { gte: since },
      action: {
        in: [
          'ENROLLMENT_CREATE',
          'ASSESSMENT_SUBMIT',
          'CREDENTIAL_ISSUE',
          'TUTOR_SESSION_START',
          'TUTOR_MESSAGE'
        ]
      }
    }
  });

  // Count by action type
  const eventsByType = dataProcessingEvents.reduce((acc, event) => {
    acc[event.action] = (acc[event.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    reportType: 'GDPR_COMPLIANCE',
    periodDays: days,
    generatedAt: new Date().toISOString(),
    totalDataProcessingEvents: dataProcessingEvents.length,
    eventsByType,
    uniqueSubjects: new Set(dataProcessingEvents.map((e) => e.userEmail)).size,
    consentRecordsRequired: dataProcessingEvents
      .filter((e) => e.action === 'ENROLLMENT_CREATE')
      .map((e) => e.userEmail)
  };
}

/**
 * Compliance report: POPIA compliance (South African data protection)
 */
export async function generatePOPIAReport(
  days: number = 90,
  prisma: any
) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // POPIA applies to organizations processing personal information
  // Track consent and data minimization

  const consentRecords = await prisma.consentRecord.findMany({
    where: {
      timestamp: { gte: since }
    }
  });

  const unauthorizedAccess = await prisma.constitutionalAuditLog.findMany({
    where: {
      createdAt: { gte: since },
      constitutionalConcern: true
    }
  });

  return {
    reportType: 'POPIA_COMPLIANCE',
    periodDays: days,
    generatedAt: new Date().toISOString(),
    consentRecordsCollected: consentRecords.length,
    consentGranted: consentRecords.filter((c) => c.consentGiven).length,
    consentDenied: consentRecords.filter((c) => !c.consentGiven).length,
    unauthorizedAccessAttempts: unauthorizedAccess.length,
    dataMinimizationScore: await calculateDataMinimizationScore(prisma, since)
  };
}

/**
 * Calculate data minimization score (0-1 scale)
 * Higher score = more minimal data collection
 */
async function calculateDataMinimizationScore(prisma: any, since: Date): Promise<number> {
  // Simplified metric: ratio of minimal operations to total operations
  const totalOps = await prisma.constitutionalAuditLog.count({
    where: { createdAt: { gte: since } }
  });

  const minimalOps = await prisma.constitutionalAuditLog.count({
    where: {
      createdAt: { gte: since },
      // Operations that involve less data: reading vs writing
      action: { in: ['ACHIEVEMENTS_FETCH', 'COURSES_GET', 'BALANCE_CHECK'] }
    }
  });

  return totalOps === 0 ? 1.0 : Math.min(minimalOps / totalOps, 1.0);
}

export default logAudit;
