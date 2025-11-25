/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import { EventEmitter } from 'events';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

interface AuditLog {
  id: string;
  timestamp: Date;
  userId?: string;
  action: string;
  resource: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  ip: string;
  userAgent: string;
  status: 'success' | 'failure';
  details: any;
  hash: string;
}

interface ComplianceReport {
  period: string;
  totalLogs: number;
  userActions: number;
  systemActions: number;
  failedActions: number;
  topUsers: Array<{ userId: string; count: number }>;
  topActions: Array<{ action: string; count: number }>;
  complianceScore: number;
}

export class AuditLoggingService extends EventEmitter {
  private logs: AuditLog[] = [];
  private logFile = path.join(process.cwd(), 'logs', 'audit.log');
  private previousHash: string = '0';

  constructor() {
    super();
    this.ensureLogDirectory();
    console.log('📝 Audit Logging Service initialized');
  }

  // Log Action
  async log(entry: Omit<AuditLog, 'id' | 'timestamp' | 'hash'>): Promise<AuditLog> {
    const auditLog: AuditLog = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      hash: this.calculateHash(entry, this.previousHash)
    };

    this.logs.push(auditLog);
    this.previousHash = auditLog.hash;

    // Write to file
    await this.writeToFile(auditLog);

    this.emit('audit-logged', auditLog);

    if (auditLog.status === 'failure') {
      this.emit('audit-failure', auditLog);
    }

    return auditLog;
  }

  // Calculate hash for blockchain-like integrity
  private calculateHash(entry: any, previousHash: string): string {
    const data = JSON.stringify(entry) + previousHash;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Verify log integrity
  verifyIntegrity(): boolean {
    let prevHash = '0';
    
    for (const log of this.logs) {
      const expectedHash = this.calculateHash(
        { ...log, hash: undefined },
        prevHash
      );
      
      if (log.hash !== expectedHash) {
        console.error(`❌ Integrity violation at log ${log.id}`);
        return false;
      }
      
      prevHash = log.hash;
    }

    console.log('✅ Audit log integrity verified');
    return true;
  }

  // Write to file
  private async writeToFile(log: AuditLog): Promise<void> {
    try {
      const logLine = JSON.stringify(log) + '\n';
      await fs.appendFile(this.logFile, logLine);
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  // Ensure log directory exists
  private async ensureLogDirectory(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.logFile), { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }

  // Query logs
  query(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    status?: 'success' | 'failure';
  }): AuditLog[] {
    return this.logs.filter(log => {
      if (filters.userId && log.userId !== filters.userId) return false;
      if (filters.action && log.action !== filters.action) return false;
      if (filters.resource && log.resource !== filters.resource) return false;
      if (filters.status && log.status !== filters.status) return false;
      if (filters.startDate && log.timestamp < filters.startDate) return false;
      if (filters.endDate && log.timestamp > filters.endDate) return false;
      return true;
    });
  }

  // Get user activity
  getUserActivity(userId: string, limit: number = 100): AuditLog[] {
    return this.logs
      .filter(log => log.userId === userId)
      .slice(-limit);
  }

  // Get recent logs
  getRecentLogs(limit: number = 100): AuditLog[] {
    return this.logs.slice(-limit);
  }

  // Generate compliance report
  generateComplianceReport(startDate: Date, endDate: Date): ComplianceReport {
    const periodLogs = this.logs.filter(
      log => log.timestamp >= startDate && log.timestamp <= endDate
    );

    // Count by user
    const userCounts = new Map<string, number>();
    periodLogs.forEach(log => {
      if (log.userId) {
        userCounts.set(log.userId, (userCounts.get(log.userId) || 0) + 1);
      }
    });

    // Count by action
    const actionCounts = new Map<string, number>();
    periodLogs.forEach(log => {
      actionCounts.set(log.action, (actionCounts.get(log.action) || 0) + 1);
    });

    // Top users
    const topUsers = Array.from(userCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, count]) => ({ userId, count }));

    // Top actions
    const topActions = Array.from(actionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([action, count]) => ({ action, count }));

    // Compliance score (based on success rate)
    const successCount = periodLogs.filter(log => log.status === 'success').length;
    const complianceScore = periodLogs.length > 0 
      ? Math.round((successCount / periodLogs.length) * 100)
      : 100;

    const report: ComplianceReport = {
      period: `${startDate.toISOString()} to ${endDate.toISOString()}`,
      totalLogs: periodLogs.length,
      userActions: periodLogs.filter(log => log.userId).length,
      systemActions: periodLogs.filter(log => !log.userId).length,
      failedActions: periodLogs.filter(log => log.status === 'failure').length,
      topUsers,
      topActions,
      complianceScore
    };

    this.emit('compliance-report-generated', report);
    return report;
  }

  // Export logs
  async exportLogs(startDate: Date, endDate: Date, format: 'json' | 'csv' = 'json'): Promise<string> {
    const logs = this.query({ startDate, endDate });
    
    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

    // CSV format
    const headers = ['id', 'timestamp', 'userId', 'action', 'resource', 'method', 'ip', 'status'];
    const csv = [
      headers.join(','),
      ...logs.map(log => 
        headers.map(h => JSON.stringify(log[h as keyof AuditLog] || '')).join(',')
      )
    ].join('\n');

    return csv;
  }

  // Archive old logs
  async archiveLogs(daysToKeep: number = 90): Promise<number> {
    const cutoff = new Date(Date.now() - (daysToKeep * 86400000));
    const toArchive = this.logs.filter(log => log.timestamp < cutoff);
    
    if (toArchive.length > 0) {
      const archiveFile = path.join(
        path.dirname(this.logFile),
        `audit-archive-${Date.now()}.json`
      );
      await fs.writeFile(archiveFile, JSON.stringify(toArchive, null, 2));
      
      this.logs = this.logs.filter(log => log.timestamp >= cutoff);
      console.log(`📦 Archived ${toArchive.length} logs to ${archiveFile}`);
    }

    return toArchive.length;
  }

  // Get statistics
  getStatistics(): any {
    const now = Date.now();
    const last24h = this.logs.filter(log => now - log.timestamp.getTime() < 86400000);
    const last7d = this.logs.filter(log => now - log.timestamp.getTime() < 604800000);

    return {
      totalLogs: this.logs.length,
      logs24h: last24h.length,
      logs7d: last7d.length,
      failedActions24h: last24h.filter(log => log.status === 'failure').length,
      uniqueUsers24h: new Set(last24h.map(log => log.userId).filter(Boolean)).size,
      integrityVerified: this.verifyIntegrity(),
      lastLog: this.logs[this.logs.length - 1],
      timestamp: new Date().toISOString()
    };
  }
}

export const auditLoggingService = new AuditLoggingService();
export default auditLoggingService;
