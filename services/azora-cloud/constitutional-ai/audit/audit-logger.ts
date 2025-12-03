/**
 * Constitutional AI Audit Logger
 * Handles persistent audit logging with encryption
 */

import crypto from 'crypto';
import {
  ConstitutionalResult,
  ConstitutionalAuditLog,
  Violation
} from '../types';

/**
 * Audit logger configuration
 */
export interface AuditLoggerConfig {
  enabled: boolean;
  encryptionEnabled: boolean;
  encryptionKey?: string;
  retentionDays: number;
  batchSize: number;
  flushInterval: number; // milliseconds
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: AuditLoggerConfig = {
  enabled: true,
  encryptionEnabled: true,
  encryptionKey: process.env.AUDIT_LOG_ENCRYPTION_KEY,
  retentionDays: 90,
  batchSize: 100,
  flushInterval: 5000
};

/**
 * Audit log entry for storage
 */
interface StoredAuditLog {
  id: string;
  userId: string;
  query: string;
  originalOutput: string;
  validatedOutput: string;
  violations: string; // JSON string (encrypted if enabled)
  complianceScore: number;
  timestamp: Date;
  tier: string;
  processingTime: number;
  encrypted: boolean;
}

/**
 * Audit Logger Implementation
 */
export class AuditLogger {
  private config: AuditLoggerConfig;
  private logBuffer: ConstitutionalAuditLog[];
  private flushTimer: NodeJS.Timeout | null;
  private encryptionAlgorithm: string = 'aes-256-gcm';

  constructor(config: Partial<AuditLoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logBuffer = [];
    this.flushTimer = null;
    
    // Validate encryption key if encryption is enabled
    if (this.config.encryptionEnabled && !this.config.encryptionKey) {
      console.warn('Audit log encryption enabled but no key provided. Disabling encryption.');
      this.config.encryptionEnabled = false;
    }
    
    // Start flush timer
    if (this.config.enabled) {
      this.startFlushTimer();
    }
  }

  /**
   * Log a constitutional validation result
   */
  async log(
    result: ConstitutionalResult,
    userId: string,
    query: string,
    originalOutput: string,
    tier: string = 'unknown',
    processingTime: number = 0
  ): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    const auditLog: ConstitutionalAuditLog = {
      id: this.generateLogId(),
      userId,
      query,
      originalOutput,
      validatedOutput: result.validatedOutput,
      violations: result.violations,
      complianceScore: result.complianceScore,
      timestamp: result.timestamp,
      tier,
      processingTime
    };

    // Add to buffer
    this.logBuffer.push(auditLog);

    // Flush if buffer is full
    if (this.logBuffer.length >= this.config.batchSize) {
      await this.flush();
    }
  }

  /**
   * Flush buffered logs to storage
   */
  async flush(): Promise<void> {
    if (this.logBuffer.length === 0) {
      return;
    }

    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    try {
      // Prepare logs for storage
      const storedLogs = await Promise.all(
        logsToFlush.map(log => this.prepareForStorage(log))
      );

      // In production, this would write to database
      // For now, we'll simulate storage
      await this.persistLogs(storedLogs);

      console.log(`Flushed ${storedLogs.length} audit logs`);
    } catch (error) {
      console.error('Failed to flush audit logs:', error);
      // Re-add logs to buffer for retry
      this.logBuffer.unshift(...logsToFlush);
    }
  }

  /**
   * Prepare log entry for storage
   */
  private async prepareForStorage(log: ConstitutionalAuditLog): Promise<StoredAuditLog> {
    // Serialize violations
    const violationsJson = JSON.stringify(log.violations);

    // Encrypt sensitive data if enabled
    const encrypted = this.config.encryptionEnabled;
    const encryptedViolations = encrypted
      ? await this.encrypt(violationsJson)
      : violationsJson;

    return {
      id: log.id,
      userId: log.userId,
      query: log.query,
      originalOutput: log.originalOutput,
      validatedOutput: log.validatedOutput,
      violations: encryptedViolations,
      complianceScore: log.complianceScore,
      timestamp: log.timestamp,
      tier: log.tier,
      processingTime: log.processingTime,
      encrypted
    };
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  private async encrypt(data: string): Promise<string> {
    if (!this.config.encryptionKey) {
      throw new Error('Encryption key not configured');
    }

    try {
      // Generate IV
      const iv = crypto.randomBytes(16);

      // Create cipher
      const key = crypto.scryptSync(this.config.encryptionKey, 'salt', 32);
      const cipher = crypto.createCipheriv(this.encryptionAlgorithm, key, iv);

      // Encrypt
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get auth tag
      const authTag = cipher.getAuthTag();

      // Combine IV + authTag + encrypted data
      const result = {
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        data: encrypted
      };

      return JSON.stringify(result);
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt audit log data');
    }
  }

  /**
   * Decrypt data
   */
  private async decrypt(encryptedData: string): Promise<string> {
    if (!this.config.encryptionKey) {
      throw new Error('Encryption key not configured');
    }

    try {
      const { iv, authTag, data } = JSON.parse(encryptedData);

      // Create decipher
      const key = crypto.scryptSync(this.config.encryptionKey, 'salt', 32);
      const decipher = crypto.createDecipheriv(
        this.encryptionAlgorithm,
        key,
        Buffer.from(iv, 'hex')
      );

      // Set auth tag
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));

      // Decrypt
      let decrypted = decipher.update(data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt audit log data');
    }
  }

  /**
   * Persist logs to storage
   * In production, this would write to PostgreSQL/MongoDB
   */
  private async persistLogs(logs: StoredAuditLog[]): Promise<void> {
    // Simulate database write
    // In production, use Prisma or similar ORM:
    // await prisma.constitutionalAuditLog.createMany({ data: logs });
    
    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Audit] Persisting ${logs.length} logs`);
    }
  }

  /**
   * Retrieve audit logs for a user
   */
  async getLogsForUser(
    userId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<ConstitutionalAuditLog[]> {
    // In production, query from database
    // For now, return empty array
    return [];
  }

  /**
   * Get compliance statistics
   */
  async getComplianceStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalLogs: number;
    averageComplianceScore: number;
    violationsByType: Record<string, number>;
    successRate: number;
  }> {
    // In production, aggregate from database
    return {
      totalLogs: 0,
      averageComplianceScore: 0,
      violationsByType: {},
      successRate: 0
    };
  }

  /**
   * Clean up old logs based on retention policy
   */
  async cleanupOldLogs(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    // In production, delete from database:
    // const result = await prisma.constitutionalAuditLog.deleteMany({
    //   where: { timestamp: { lt: cutoffDate } }
    // });
    // return result.count;

    return 0;
  }

  /**
   * Start automatic flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush().catch(error => {
        console.error('Auto-flush error:', error);
      });
    }, this.config.flushInterval);
  }

  /**
   * Stop flush timer
   */
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `audit_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Shutdown logger gracefully
   */
  async shutdown(): Promise<void> {
    this.stopFlushTimer();
    await this.flush();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AuditLoggerConfig>): void {
    this.config = { ...this.config, ...config };

    // Restart flush timer if interval changed
    if (config.flushInterval !== undefined) {
      this.startFlushTimer();
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): AuditLoggerConfig {
    return { ...this.config };
  }

  /**
   * Get buffer size
   */
  getBufferSize(): number {
    return this.logBuffer.length;
  }
}

/**
 * Factory function
 */
export function createAuditLogger(config?: Partial<AuditLoggerConfig>): AuditLogger {
  return new AuditLogger(config);
}

/**
 * Export default instance
 */
export default createAuditLogger();
