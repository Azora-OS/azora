/**
 * Error Tracking Service
 * 
 * Captures stack traces and context, groups similar errors,
 * sends notifications, and provides actionable insights.
 */

import * as crypto from 'crypto';

export interface ErrorEvent {
  id: string;
  message: string;
  stack?: string;
  type: string;
  timestamp: Date;
  service: string;
  environment: string;
  context: ErrorContext;
  fingerprint: string;
  resolved: boolean;
}

export interface ErrorContext {
  user?: {
    id?: string;
    email?: string;
  };
  request?: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: any;
  };
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

export interface ErrorGroup {
  fingerprint: string;
  message: string;
  type: string;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
  events: ErrorEvent[];
  status: 'unresolved' | 'resolved' | 'ignored';
  assignee?: string;
}

export interface ErrorInsight {
  type: 'suggestion' | 'documentation' | 'similar_issue';
  title: string;
  description: string;
  link?: string;
}

export interface ErrorNotification {
  id: string;
  errorId: string;
  channel: 'email' | 'slack' | 'webhook';
  recipient: string;
  sent: boolean;
  sentAt?: Date;
}

export class ErrorTracking {
  private errorGroups: Map<string, ErrorGroup> = new Map();
  private notifications: ErrorNotification[] = [];
  private notificationRules: NotificationRule[] = [];

  /**
   * Capture an error event
   */
  captureError(error: Error | string, context?: ErrorContext, service?: string): ErrorEvent {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    const event: ErrorEvent = {
      id: this.generateId(),
      message: errorObj.message,
      stack: errorObj.stack,
      type: errorObj.name || 'Error',
      timestamp: new Date(),
      service: service || 'unknown',
      environment: process.env.NODE_ENV || 'development',
      context: context || {},
      fingerprint: this.generateFingerprint(errorObj),
      resolved: false,
    };

    this.addToGroup(event);
    this.checkNotificationRules(event);

    return event;
  }

  /**
   * Generate unique error fingerprint for grouping
   */
  private generateFingerprint(error: Error): string {
    // Use error type and first few lines of stack trace
    const stackLines = error.stack?.split('\n').slice(0, 3).join('\n') || '';
    const content = `${error.name}:${error.message}:${stackLines}`;
    
    return crypto
      .createHash('md5')
      .update(content)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Add error event to a group
   */
  private addToGroup(event: ErrorEvent): void {
    const existing = this.errorGroups.get(event.fingerprint);

    if (existing) {
      existing.count++;
      existing.lastSeen = event.timestamp;
      existing.events.push(event);
      
      // Keep only last 100 events per group
      if (existing.events.length > 100) {
        existing.events = existing.events.slice(-100);
      }
    } else {
      this.errorGroups.set(event.fingerprint, {
        fingerprint: event.fingerprint,
        message: event.message,
        type: event.type,
        count: 1,
        firstSeen: event.timestamp,
        lastSeen: event.timestamp,
        events: [event],
        status: 'unresolved',
      });
    }
  }

  /**
   * Get all error groups
   */
  getErrorGroups(filter?: {
    status?: 'unresolved' | 'resolved' | 'ignored';
    service?: string;
    since?: Date;
  }): ErrorGroup[] {
    let groups = Array.from(this.errorGroups.values());

    if (filter?.status) {
      groups = groups.filter(g => g.status === filter.status);
    }

    if (filter?.service) {
      groups = groups.filter(g => 
        g.events.some(e => e.service === filter.service)
      );
    }

    if (filter?.since) {
      groups = groups.filter(g => g.lastSeen >= filter.since);
    }

    // Sort by last seen (most recent first)
    return groups.sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());
  }

  /**
   * Get error group by fingerprint
   */
  getErrorGroup(fingerprint: string): ErrorGroup | undefined {
    return this.errorGroups.get(fingerprint);
  }

  /**
   * Get error event by ID
   */
  getErrorEvent(eventId: string): ErrorEvent | undefined {
    for (const group of this.errorGroups.values()) {
      const event = group.events.find(e => e.id === eventId);
      if (event) return event;
    }
    return undefined;
  }

  /**
   * Update error group status
   */
  updateGroupStatus(fingerprint: string, status: 'unresolved' | 'resolved' | 'ignored'): void {
    const group = this.errorGroups.get(fingerprint);
    if (group) {
      group.status = status;
      
      // Mark all events as resolved
      if (status === 'resolved') {
        group.events.forEach(e => e.resolved = true);
      }
    }
  }

  /**
   * Assign error group to user
   */
  assignGroup(fingerprint: string, assignee: string): void {
    const group = this.errorGroups.get(fingerprint);
    if (group) {
      group.assignee = assignee;
    }
  }

  /**
   * Get error insights and suggestions
   */
  getErrorInsights(fingerprint: string): ErrorInsight[] {
    const group = this.errorGroups.get(fingerprint);
    if (!group) return [];

    const insights: ErrorInsight[] = [];

    // Common error patterns
    if (group.message.includes('ECONNREFUSED')) {
      insights.push({
        type: 'suggestion',
        title: 'Connection Refused',
        description: 'The service is not running or not accessible. Check if the service is started and the port is correct.',
      });
    }

    if (group.message.includes('Cannot read property') || group.message.includes('Cannot read properties of undefined')) {
      insights.push({
        type: 'suggestion',
        title: 'Null/Undefined Reference',
        description: 'Add null checks or optional chaining (?.) before accessing properties.',
      });
    }

    if (group.message.includes('CORS')) {
      insights.push({
        type: 'suggestion',
        title: 'CORS Error',
        description: 'Configure CORS headers on your server to allow requests from your frontend origin.',
        link: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS',
      });
    }

    if (group.message.includes('401') || group.message.includes('Unauthorized')) {
      insights.push({
        type: 'suggestion',
        title: 'Authentication Error',
        description: 'Check if the authentication token is valid and properly included in the request headers.',
      });
    }

    if (group.message.includes('timeout')) {
      insights.push({
        type: 'suggestion',
        title: 'Request Timeout',
        description: 'The request took too long. Consider increasing timeout limits or optimizing the operation.',
      });
    }

    // Stack trace analysis
    if (group.events[0]?.stack) {
      const stack = group.events[0].stack;
      
      if (stack.includes('node_modules')) {
        insights.push({
          type: 'documentation',
          title: 'Third-party Library Error',
          description: 'This error originates from a third-party library. Check the library documentation or update to the latest version.',
        });
      }
    }

    return insights;
  }

  /**
   * Get error statistics
   */
  getStatistics(timeRange?: { start: Date; end: Date }): {
    totalErrors: number;
    uniqueErrors: number;
    errorsByService: Record<string, number>;
    errorsByType: Record<string, number>;
    errorRate: number;
  } {
    const groups = timeRange 
      ? this.getErrorGroups({ since: timeRange.start })
      : Array.from(this.errorGroups.values());

    const totalErrors = groups.reduce((sum, g) => sum + g.count, 0);
    const uniqueErrors = groups.length;

    const errorsByService: Record<string, number> = {};
    const errorsByType: Record<string, number> = {};

    for (const group of groups) {
      for (const event of group.events) {
        errorsByService[event.service] = (errorsByService[event.service] || 0) + 1;
        errorsByType[event.type] = (errorsByType[event.type] || 0) + 1;
      }
    }

    // Calculate error rate (errors per hour)
    const timeWindowHours = timeRange 
      ? (timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60)
      : 24;
    const errorRate = totalErrors / timeWindowHours;

    return {
      totalErrors,
      uniqueErrors,
      errorsByService,
      errorsByType,
      errorRate,
    };
  }

  /**
   * Add notification rule
   */
  addNotificationRule(rule: NotificationRule): void {
    this.notificationRules.push(rule);
  }

  /**
   * Check if error matches notification rules
   */
  private checkNotificationRules(event: ErrorEvent): void {
    for (const rule of this.notificationRules) {
      if (this.matchesRule(event, rule)) {
        this.sendNotification(event, rule);
      }
    }
  }

  /**
   * Check if error matches a rule
   */
  private matchesRule(event: ErrorEvent, rule: NotificationRule): boolean {
    if (rule.service && event.service !== rule.service) return false;
    if (rule.environment && event.environment !== rule.environment) return false;
    if (rule.errorType && event.type !== rule.errorType) return false;
    if (rule.messagePattern && !event.message.match(new RegExp(rule.messagePattern))) return false;
    
    return true;
  }

  /**
   * Send notification
   */
  private sendNotification(event: ErrorEvent, rule: NotificationRule): void {
    const notification: ErrorNotification = {
      id: this.generateId(),
      errorId: event.id,
      channel: rule.channel,
      recipient: rule.recipient,
      sent: false,
    };

    // Simulate sending notification
    setTimeout(() => {
      notification.sent = true;
      notification.sentAt = new Date();
      console.log(`[Notification] Sent ${rule.channel} to ${rule.recipient} for error: ${event.message}`);
    }, 100);

    this.notifications.push(notification);
  }

  /**
   * Get notifications
   */
  getNotifications(filter?: { errorId?: string; sent?: boolean }): ErrorNotification[] {
    let notifications = this.notifications;

    if (filter?.errorId) {
      notifications = notifications.filter(n => n.errorId === filter.errorId);
    }

    if (filter?.sent !== undefined) {
      notifications = notifications.filter(n => n.sent === filter.sent);
    }

    return notifications;
  }

  /**
   * Clear old errors
   */
  clearOldErrors(olderThan: Date): number {
    let cleared = 0;

    for (const [fingerprint, group] of this.errorGroups) {
      if (group.lastSeen < olderThan) {
        this.errorGroups.delete(fingerprint);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * Export errors for external analysis
   */
  exportErrors(fingerprints?: string[]): ErrorGroup[] {
    if (fingerprints) {
      return fingerprints
        .map(fp => this.errorGroups.get(fp))
        .filter((g): g is ErrorGroup => g !== undefined);
    }

    return Array.from(this.errorGroups.values());
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

interface NotificationRule {
  channel: 'email' | 'slack' | 'webhook';
  recipient: string;
  service?: string;
  environment?: string;
  errorType?: string;
  messagePattern?: string;
}
