import { generateUUID } from '../utils/uuid.js';
import { AuditLog, AuditTrail } from '../types/index.js';

// Mock database - replace with actual database calls
const auditLogs: Map<string, AuditLog> = new Map();

export class AuditService {
  /**
   * Log an action
   * Requirements: 7.1, 7.2, 7.3, 7.4
   */
  async logAction(
    action: string,
    details: string,
    userId?: string,
    ipAddress?: string,
    paymentId?: string
  ): Promise<AuditLog> {
    const logId = generateUUID();
    const now = new Date();

    const log: AuditLog = {
      id: logId,
      paymentId,
      action,
      details,
      userId,
      ipAddress,
      createdAt: now,
    };

    auditLogs.set(logId, log);

    console.log(`[Audit] ${action} - ${details} (User: ${userId || 'system'}, IP: ${ipAddress || 'unknown'})`);

    return log;
  }

  /**
   * Log payment action
   * Requirements: 7.1, 7.2, 7.3, 7.4
   */
  async logPaymentAction(
    paymentId: string,
    action: string,
    details: string,
    userId?: string,
    ipAddress?: string
  ): Promise<AuditLog> {
    return this.logAction(action, details, userId, ipAddress, paymentId);
  }

  /**
   * Log business action
   * Requirements: 7.1, 7.2, 7.3, 7.4
   */
  async logBusinessAction(
    businessId: string,
    action: string,
    details: string,
    userId?: string,
    ipAddress?: string
  ): Promise<AuditLog> {
    return this.logAction(`business:${businessId}:${action}`, details, userId, ipAddress);
  }

  /**
   * Log document action
   * Requirements: 7.1, 7.2, 7.3, 7.4
   */
  async logDocumentAction(
    documentId: string,
    action: string,
    details: string,
    userId?: string,
    ipAddress?: string
  ): Promise<AuditLog> {
    return this.logAction(`document:${documentId}:${action}`, details, userId, ipAddress);
  }

  /**
   * Log fund action
   * Requirements: 7.1, 7.2, 7.3, 7.4
   */
  async logFundAction(
    action: string,
    details: string,
    userId?: string,
    ipAddress?: string
  ): Promise<AuditLog> {
    return this.logAction(`fund:${action}`, details, userId, ipAddress);
  }

  /**
   * Get audit log by ID
   * Requirements: 7.1, 7.2, 7.3, 7.4
   */
  async getLogById(logId: string): Promise<AuditLog | null> {
    return auditLogs.get(logId) || null;
  }

  /**
   * Get audit logs for a payment
   * Requirements: 7.1, 7.2, 7.3, 7.4
   */
  async getPaymentAuditTrail(paymentId: string): Promise<AuditLog[]> {
    return Array.from(auditLogs.values()).filter((log) => log.paymentId === paymentId);
  }

  /**
   * Get audit logs by user
   * Requirements: 7.1, 7.2, 7.3, 7.4
   */
  async getUserAuditTrail(userId: string, page: number = 1, pageSize: number = 10): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const userLogs = Array.from(auditLogs.values())
      .filter((log) => log.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = userLogs.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      logs: userLogs.slice(start, end),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Get audit logs by action
   * Requirements: 7.1, 7.2, 7.3, 7.4
   */
  async getLogsByAction(action: string, page: number = 1, pageSize: number = 10): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const actionLogs = Array.from(auditLogs.values())
      .filter((log) => log.action.includes(action))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = actionLogs.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      logs: actionLogs.slice(start, end),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Get audit logs by date range
   * Requirements: 7.1, 7.2, 7.3, 7.4
   */
  async getLogsByDateRange(
    startDate: Date,
    endDate: Date,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const rangeLogs = Array.from(auditLogs.values())
      .filter((log) => {
        const logDate = new Date(log.createdAt);
        return logDate >= startDate && logDate <= endDate;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = rangeLogs.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      logs: rangeLogs.slice(start, end),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Get all audit logs
   * Requirements: 7.1, 7.2, 7.3, 7.4
   */
  async getAllLogs(page: number = 1, pageSize: number = 10): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const allLogs = Array.from(auditLogs.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    const total = allLogs.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      logs: allLogs.slice(start, end),
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Get audit statistics
   * Requirements: 7.1, 7.2, 7.3, 7.4
   */
  async getAuditStats(): Promise<{
    totalLogs: number;
    byAction: Record<string, number>;
    byUser: Record<string, number>;
    lastLogTime: Date | null;
  }> {
    const allLogs = Array.from(auditLogs.values());

    const byAction: Record<string, number> = {};
    const byUser: Record<string, number> = {};

    allLogs.forEach((log) => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      if (log.userId) {
        byUser[log.userId] = (byUser[log.userId] || 0) + 1;
      }
    });

    const lastLog = allLogs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    return {
      totalLogs: allLogs.length,
      byAction,
      byUser,
      lastLogTime: lastLog?.createdAt || null,
    };
  }

  /**
   * Generate compliance report
   * Requirements: 7.1, 7.2, 7.3, 7.4
   */
  async generateComplianceReport(startDate: Date, endDate: Date): Promise<{
    period: { startDate: Date; endDate: Date };
    totalActions: number;
    actionsByType: Record<string, number>;
    userActivity: Record<string, number>;
    suspiciousActivities: AuditLog[];
    complianceScore: number;
  }> {
    const logs = await this.getLogsByDateRange(startDate, endDate, 1, 10000);

    const actionsByType: Record<string, number> = {};
    const userActivity: Record<string, number> = {};
    const suspiciousActivities: AuditLog[] = [];

    logs.logs.forEach((log) => {
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;
      if (log.userId) {
        userActivity[log.userId] = (userActivity[log.userId] || 0) + 1;
      }

      // Flag suspicious activities (e.g., multiple failed attempts)
      if (log.action.includes('failed') || log.action.includes('error')) {
        suspiciousActivities.push(log);
      }
    });

    // Calculate compliance score (0-100)
    const complianceScore = Math.max(0, 100 - suspiciousActivities.length * 5);

    return {
      period: { startDate, endDate },
      totalActions: logs.total,
      actionsByType,
      userActivity,
      suspiciousActivities: suspiciousActivities.slice(0, 10),
      complianceScore,
    };
  }

  /**
   * Export audit trail as CSV
   * Requirements: 7.1, 7.2, 7.3, 7.4
   */
  async exportAuditTrailAsCSV(startDate: Date, endDate: Date): Promise<string> {
    const logs = await this.getLogsByDateRange(startDate, endDate, 1, 100000);

    const headers = ['ID', 'Action', 'Details', 'User ID', 'IP Address', 'Created At'];
    const rows = logs.logs.map((log) => [
      log.id,
      log.action,
      log.details,
      log.userId || 'N/A',
      log.ipAddress || 'N/A',
      log.createdAt.toISOString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    return csv;
  }

  /**
   * Delete old audit logs (retention policy)
   * Requirements: 7.1, 7.2, 7.3, 7.4
   */
  async deleteOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    let deletedCount = 0;

    for (const [id, log] of auditLogs.entries()) {
      if (log.createdAt < cutoffDate) {
        auditLogs.delete(id);
        deletedCount++;
      }
    }

    console.log(`[Audit] Deleted ${deletedCount} old audit logs`);

    return deletedCount;
  }

  /**
   * Log allocation action
   * Requirements: 7.1, 7.2, 7.3, 7.4
   */
  async logAllocationAction(
    allocationId: string,
    action: string,
    details: string,
    userId?: string,
    ipAddress?: string
  ): Promise<AuditLog> {
    return this.logAction(`allocation:${allocationId}:${action}`, details, userId, ipAddress);
  }
}

export const auditService = new AuditService();
