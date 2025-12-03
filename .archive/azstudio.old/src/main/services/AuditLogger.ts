import * as fs from 'fs/promises';
import * as path from 'path';
import { app } from 'electron';

/**
 * Audit event types
 */
export type AuditEventType =
  | 'ai:request'
  | 'ai:response'
  | 'file:read'
  | 'file:write'
  | 'file:delete'
  | 'file:create'
  | 'network:request'
  | 'network:response'
  | 'permission:grant'
  | 'permission:deny'
  | 'secret:read'
  | 'secret:write'
  | 'secret:delete'
  | 'git:commit'
  | 'git:push'
  | 'git:pull'
  | 'project:open'
  | 'project:close'
  | 'code:execute'
  | 'code:generate';

/**
 * Audit event severity levels
 */
export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Audit event entry
 */
export interface AuditEvent {
  id: string;
  timestamp: Date;
  type: AuditEventType;
  severity: AuditSeverity;
  actor: string; // User or system component
  resource: string;
  action: string;
  details?: Record<string, any>;
  metadata?: {
    projectPath?: string;
    fileSize?: number;
    duration?: number;
    success?: boolean;
    errorMessage?: string;
  };
}

/**
 * Audit log query options
 */
export interface AuditQueryOptions {
  startDate?: Date;
  endDate?: Date;
  types?: AuditEventType[];
  severities?: AuditSeverity[];
  actor?: string;
  resource?: string;
  limit?: number;
  offset?: number;
}

/**
 * Audit log statistics
 */
export interface AuditStatistics {
  totalEvents: number;
  eventsByType: Record<AuditEventType, number>;
  eventsBySeverity: Record<AuditSeverity, number>;
  recentErrors: AuditEvent[];
  topResources: Array<{ resource: string; count: number }>;
}

/**
 * AuditLogger provides comprehensive audit logging for all sensitive operations
 * in AzStudio including AI actions, file modifications, network requests, and
 * permission grants.
 * 
 * Features:
 * - Structured event logging with metadata
 * - Queryable audit trail
 * - Automatic log rotation
 * - Export capabilities
 * - Real-time statistics
 */
export class AuditLogger {
  private static readonly MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly MAX_LOG_FILES = 5;
  private static readonly FLUSH_INTERVAL = 5000; // 5 seconds

  private logPath: string;
  private currentLogFile: string;
  private events: AuditEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private eventCounter = 0;

  constructor(projectPath?: string) {
    if (projectPath) {
      this.logPath = path.join(projectPath, '.azstudio', 'audit-logs');
    } else {
      this.logPath = path.join(app.getPath('userData'), 'audit-logs');
    }
    
    this.currentLogFile = path.join(this.logPath, `audit-${Date.now()}.jsonl`);
  }

  /**
   * Initialize the audit logger
   */
  async initialize(): Promise<void> {
    // Ensure log directory exists
    await fs.mkdir(this.logPath, { recursive: true });

    // Start periodic flush
    this.startPeriodicFlush();

    // Rotate logs if needed
    await this.rotateLogs();
  }

  /**
   * Log an audit event
   */
  async log(
    type: AuditEventType,
    action: string,
    resource: string,
    options?: {
      severity?: AuditSeverity;
      actor?: string;
      details?: Record<string, any>;
      metadata?: AuditEvent['metadata'];
    }
  ): Promise<void> {
    const event: AuditEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      type,
      severity: options?.severity || 'info',
      actor: options?.actor || 'system',
      resource,
      action,
      details: options?.details,
      metadata: options?.metadata,
    };

    this.events.push(event);

    // Flush if buffer is large
    if (this.events.length >= 100) {
      await this.flush();
    }
  }

  /**
   * Log AI request
   */
  async logAIRequest(
    model: string,
    prompt: string,
    options?: {
      tokens?: number;
      cost?: number;
      projectPath?: string;
    }
  ): Promise<void> {
    await this.log('ai:request', 'AI request sent', model, {
      severity: 'info',
      details: {
        promptLength: prompt.length,
        tokens: options?.tokens,
        cost: options?.cost,
      },
      metadata: {
        projectPath: options?.projectPath,
      },
    });
  }

  /**
   * Log AI response
   */
  async logAIResponse(
    model: string,
    success: boolean,
    options?: {
      tokens?: number;
      duration?: number;
      errorMessage?: string;
    }
  ): Promise<void> {
    await this.log('ai:response', 'AI response received', model, {
      severity: success ? 'info' : 'error',
      details: {
        tokens: options?.tokens,
      },
      metadata: {
        success,
        duration: options?.duration,
        errorMessage: options?.errorMessage,
      },
    });
  }

  /**
   * Log file operation
   */
  async logFileOperation(
    operation: 'read' | 'write' | 'delete' | 'create',
    filePath: string,
    options?: {
      fileSize?: number;
      success?: boolean;
      errorMessage?: string;
    }
  ): Promise<void> {
    const typeMap = {
      read: 'file:read' as AuditEventType,
      write: 'file:write' as AuditEventType,
      delete: 'file:delete' as AuditEventType,
      create: 'file:create' as AuditEventType,
    };

    await this.log(typeMap[operation], `File ${operation}`, filePath, {
      severity: options?.success === false ? 'error' : 'info',
      metadata: {
        fileSize: options?.fileSize,
        success: options?.success,
        errorMessage: options?.errorMessage,
      },
    });
  }

  /**
   * Log network request
   */
  async logNetworkRequest(
    url: string,
    method: string,
    options?: {
      duration?: number;
      statusCode?: number;
      success?: boolean;
      errorMessage?: string;
    }
  ): Promise<void> {
    await this.log('network:request', `${method} request`, url, {
      severity: options?.success === false ? 'warning' : 'info',
      details: {
        method,
        statusCode: options?.statusCode,
      },
      metadata: {
        duration: options?.duration,
        success: options?.success,
        errorMessage: options?.errorMessage,
      },
    });
  }

  /**
   * Log permission grant/deny
   */
  async logPermission(
    permissionType: string,
    resource: string,
    granted: boolean,
    reason?: string
  ): Promise<void> {
    await this.log(
      granted ? 'permission:grant' : 'permission:deny',
      granted ? 'Permission granted' : 'Permission denied',
      resource,
      {
        severity: granted ? 'info' : 'warning',
        details: {
          permissionType,
          reason,
        },
        metadata: {
          success: granted,
        },
      }
    );
  }

  /**
   * Log secret access
   */
  async logSecretAccess(
    operation: 'read' | 'write' | 'delete',
    key: string,
    scope: string
  ): Promise<void> {
    const typeMap = {
      read: 'secret:read' as AuditEventType,
      write: 'secret:write' as AuditEventType,
      delete: 'secret:delete' as AuditEventType,
    };

    await this.log(typeMap[operation], `Secret ${operation}`, key, {
      severity: 'info',
      details: {
        scope,
      },
    });
  }

  /**
   * Log Git operation
   */
  async logGitOperation(
    operation: 'commit' | 'push' | 'pull',
    repository: string,
    options?: {
      branch?: string;
      success?: boolean;
      errorMessage?: string;
    }
  ): Promise<void> {
    const typeMap = {
      commit: 'git:commit' as AuditEventType,
      push: 'git:push' as AuditEventType,
      pull: 'git:pull' as AuditEventType,
    };

    await this.log(typeMap[operation], `Git ${operation}`, repository, {
      severity: options?.success === false ? 'error' : 'info',
      details: {
        branch: options?.branch,
      },
      metadata: {
        success: options?.success,
        errorMessage: options?.errorMessage,
      },
    });
  }

  /**
   * Log code execution
   */
  async logCodeExecution(
    action: 'execute' | 'generate',
    description: string,
    options?: {
      projectPath?: string;
      filesAffected?: number;
      success?: boolean;
      errorMessage?: string;
    }
  ): Promise<void> {
    const type = action === 'execute' ? 'code:execute' : 'code:generate';

    await this.log(type, description, options?.projectPath || 'unknown', {
      severity: options?.success === false ? 'error' : 'info',
      details: {
        filesAffected: options?.filesAffected,
      },
      metadata: {
        projectPath: options?.projectPath,
        success: options?.success,
        errorMessage: options?.errorMessage,
      },
    });
  }

  /**
   * Query audit events
   */
  async query(options: AuditQueryOptions = {}): Promise<AuditEvent[]> {
    const allEvents = await this.loadAllEvents();
    
    let filtered = allEvents;

    // Filter by date range
    if (options.startDate) {
      filtered = filtered.filter(e => e.timestamp >= options.startDate!);
    }
    if (options.endDate) {
      filtered = filtered.filter(e => e.timestamp <= options.endDate!);
    }

    // Filter by type
    if (options.types && options.types.length > 0) {
      filtered = filtered.filter(e => options.types!.includes(e.type));
    }

    // Filter by severity
    if (options.severities && options.severities.length > 0) {
      filtered = filtered.filter(e => options.severities!.includes(e.severity));
    }

    // Filter by actor
    if (options.actor) {
      filtered = filtered.filter(e => e.actor === options.actor);
    }

    // Filter by resource
    if (options.resource) {
      filtered = filtered.filter(e => e.resource.includes(options.resource!));
    }

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || filtered.length;
    
    return filtered.slice(offset, offset + limit);
  }

  /**
   * Get audit statistics
   */
  async getStatistics(): Promise<AuditStatistics> {
    const allEvents = await this.loadAllEvents();

    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    const resourceCounts: Record<string, number> = {};

    for (const event of allEvents) {
      // Count by type
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;

      // Count by severity
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;

      // Count by resource
      resourceCounts[event.resource] = (resourceCounts[event.resource] || 0) + 1;
    }

    // Get recent errors
    const recentErrors = allEvents
      .filter(e => e.severity === 'error' || e.severity === 'critical')
      .slice(-10);

    // Get top resources
    const topResources = Object.entries(resourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([resource, count]) => ({ resource, count }));

    return {
      totalEvents: allEvents.length,
      eventsByType: eventsByType as Record<AuditEventType, number>,
      eventsBySeverity: eventsBySeverity as Record<AuditSeverity, number>,
      recentErrors,
      topResources,
    };
  }

  /**
   * Export audit log to file
   */
  async export(outputPath: string, options: AuditQueryOptions = {}): Promise<void> {
    const events = await this.query(options);
    const json = JSON.stringify(events, null, 2);
    await fs.writeFile(outputPath, json, 'utf-8');
  }

  /**
   * Clear old audit logs
   */
  async clearOldLogs(daysToKeep: number = 30): Promise<number> {
    const files = await fs.readdir(this.logPath);
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    let deletedCount = 0;

    for (const file of files) {
      if (!file.startsWith('audit-') || !file.endsWith('.jsonl')) {
        continue;
      }

      const filePath = path.join(this.logPath, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime < cutoffDate) {
        await fs.unlink(filePath);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Flush buffered events to disk
   */
  async flush(): Promise<void> {
    if (this.events.length === 0) {
      return;
    }

    const eventsToWrite = [...this.events];
    this.events = [];

    // Write events as JSONL (one JSON object per line)
    const lines = eventsToWrite.map(e => JSON.stringify(e)).join('\n') + '\n';
    
    try {
      await fs.appendFile(this.currentLogFile, lines, 'utf-8');
    } catch (error) {
      // If write fails, put events back in buffer
      this.events.unshift(...eventsToWrite);
      throw error;
    }

    // Check if log rotation is needed
    await this.rotateLogs();
  }

  /**
   * Shutdown the audit logger
   */
  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    await this.flush();
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `${Date.now()}-${this.eventCounter++}`;
  }

  /**
   * Start periodic flush timer
   */
  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush().catch(console.error);
    }, AuditLogger.FLUSH_INTERVAL);
  }

  /**
   * Rotate logs if current file is too large
   */
  private async rotateLogs(): Promise<void> {
    try {
      const stats = await fs.stat(this.currentLogFile);
      
      if (stats.size >= AuditLogger.MAX_LOG_SIZE) {
        // Create new log file
        this.currentLogFile = path.join(this.logPath, `audit-${Date.now()}.jsonl`);

        // Delete old log files if we have too many
        await this.cleanupOldLogs();
      }
    } catch (error) {
      // File doesn't exist yet, that's fine
    }
  }

  /**
   * Clean up old log files
   */
  private async cleanupOldLogs(): Promise<void> {
    const files = await fs.readdir(this.logPath);
    const logFiles = files
      .filter(f => f.startsWith('audit-') && f.endsWith('.jsonl'))
      .map(f => ({
        name: f,
        path: path.join(this.logPath, f),
      }));

    if (logFiles.length <= AuditLogger.MAX_LOG_FILES) {
      return;
    }

    // Sort by modification time
    const filesWithStats = await Promise.all(
      logFiles.map(async f => ({
        ...f,
        stats: await fs.stat(f.path),
      }))
    );

    filesWithStats.sort((a, b) => a.stats.mtime.getTime() - b.stats.mtime.getTime());

    // Delete oldest files
    const toDelete = filesWithStats.slice(0, filesWithStats.length - AuditLogger.MAX_LOG_FILES);
    await Promise.all(toDelete.map(f => fs.unlink(f.path)));
  }

  /**
   * Load all events from log files
   */
  private async loadAllEvents(): Promise<AuditEvent[]> {
    const files = await fs.readdir(this.logPath);
    const logFiles = files
      .filter(f => f.startsWith('audit-') && f.endsWith('.jsonl'))
      .map(f => path.join(this.logPath, f));

    const allEvents: AuditEvent[] = [];

    for (const file of logFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.trim().split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            const event = JSON.parse(line);
            event.timestamp = new Date(event.timestamp);
            allEvents.push(event);
          }
        }
      } catch (error) {
        console.error(`Error reading log file ${file}:`, error);
      }
    }

    // Sort by timestamp
    allEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return allEvents;
  }
}
