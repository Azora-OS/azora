const { createLogger, LogLevel } = require('@azora/shared-services/logging');
const { EventBus } = require('@azora/shared-services/event-bus');

class AuditLoggingService {
  constructor() {
    this.logger = createLogger('AuditLoggingService');
    this.eventBus = new EventBus();
    this.auditLogs = [];
  }

  /**
   * Log a security-related event
   */
  logSecurityEvent(userId, action, resource, details = {}) {
    const auditEntry = {
      id: this.generateId(),
      type: 'security',
      userId,
      action,
      resource,
      timestamp: new Date(),
      details,
      severity: this.determineSeverity(action, details)
    };

    this.auditLogs.push(auditEntry);
    this.logger.info(`Security event logged: ${action} on ${resource}`, { userId, action, resource });

    // Emit event for real-time monitoring
    this.eventBus.publish('audit.security', auditEntry);

    return auditEntry;
  }

  /**
   * Log a user action event
   */
  logUserAction(userId, action, resource, details = {}) {
    const auditEntry = {
      id: this.generateId(),
      type: 'user_action',
      userId,
      action,
      resource,
      timestamp: new Date(),
      details
    };

    this.auditLogs.push(auditEntry);
    this.logger.info(`User action logged: ${action} on ${resource}`, { userId, action, resource });

    // Emit event for real-time monitoring
    this.eventBus.publish('audit.user_action', auditEntry);

    return auditEntry;
  }

  /**
   * Log a system event
   */
  logSystemEvent(service, action, details = {}) {
    const auditEntry = {
      id: this.generateId(),
      type: 'system',
      service,
      action,
      timestamp: new Date(),
      details
    };

    this.auditLogs.push(auditEntry);
    this.logger.info(`System event logged: ${action} in ${service}`, { service, action });

    // Emit event for real-time monitoring
    this.eventBus.publish('audit.system', auditEntry);

    return auditEntry;
  }

  /**
   * Log a data access event
   */
  logDataAccess(userId, action, resource, details = {}) {
    const auditEntry = {
      id: this.generateId(),
      type: 'data_access',
      userId,
      action,
      resource,
      timestamp: new Date(),
      details
    };

    this.auditLogs.push(auditEntry);
    this.logger.info(`Data access logged: ${action} on ${resource}`, { userId, action, resource });

    // Emit event for real-time monitoring
    this.eventBus.publish('audit.data_access', auditEntry);

    return auditEntry;
  }

  /**
   * Get audit logs with filtering options
   */
  getAuditLogs(filters = {}) {
    let filteredLogs = [...this.auditLogs];

    // Apply filters
    if (filters.type) {
      filteredLogs = filteredLogs.filter(log => log.type === filters.type);
    }

    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }

    if (filters.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action);
    }

    if (filters.resource) {
      filteredLogs = filteredLogs.filter(log => log.resource === filters.resource);
    }

    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= new Date(filters.endDate));
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp - a.timestamp);

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      logs: filteredLogs.slice(startIndex, endIndex),
      total: filteredLogs.length,
      page,
      limit
    };
  }

  /**
   * Generate a unique ID for audit entries
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Determine severity level for security events
   */
  determineSeverity(action, details) {
    const highSeverityActions = [
      'login_failed', 'password_reset', 'account_locked',
      'unauthorized_access', 'data_breach', 'suspicious_activity'
    ];

    const mediumSeverityActions = [
      'login_success', 'logout', 'password_changed',
      'profile_updated', 'permission_changed'
    ];

    if (highSeverityActions.includes(action)) {
      return 'high';
    } else if (mediumSeverityActions.includes(action)) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Get security statistics
   */
  getSecurityStats() {
    const securityLogs = this.auditLogs.filter(log => log.type === 'security');

    const stats = {
      totalEvents: securityLogs.length,
      highSeverity: securityLogs.filter(log => log.severity === 'high').length,
      mediumSeverity: securityLogs.filter(log => log.severity === 'medium').length,
      lowSeverity: securityLogs.filter(log => log.severity === 'low').length,
      recentEvents: securityLogs.slice(-10)
    };

    return stats;
  }

  /**
   * Clear old audit logs (retention policy)
   */
  clearOldLogs(retentionDays = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const initialCount = this.auditLogs.length;
    this.auditLogs = this.auditLogs.filter(log => log.timestamp >= cutoffDate);
    const removedCount = initialCount - this.auditLogs.length;

    this.logger.info(`Cleared ${removedCount} old audit logs`, { retentionDays });

    return removedCount;
  }
}

module.exports = new AuditLoggingService();
