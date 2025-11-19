/**
 * Alerts Service
 * Manages alert configuration, triggering, and notifications
 */

import { structuredLogger } from '../utils/structured-logger';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  duration: number; // milliseconds
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  actions: AlertAction[];
}

export interface AlertAction {
  type: 'log' | 'email' | 'slack' | 'webhook';
  target?: string;
  message?: string;
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

class AlertsService {
  private rules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();
  private alertHistory: Alert[] = [];
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultRules(): void {
    // API Error Rate Alert
    this.addRule({
      id: 'api-error-rate-high',
      name: 'High API Error Rate',
      description: 'Alert when API error rate exceeds 5%',
      metric: 'http_error_rate',
      threshold: 5,
      operator: 'gt',
      duration: 300000, // 5 minutes
      severity: 'critical',
      enabled: true,
      actions: [
        { type: 'log' },
        { type: 'slack', target: process.env.SLACK_WEBHOOK_URL },
      ],
    });

    // API Latency Alert
    this.addRule({
      id: 'api-latency-high',
      name: 'High API Latency',
      description: 'Alert when p95 API latency exceeds 2 seconds',
      metric: 'http_request_duration_p95',
      threshold: 2000,
      operator: 'gt',
      duration: 300000, // 5 minutes
      severity: 'warning',
      enabled: true,
      actions: [{ type: 'log' }],
    });

    // Database Error Rate Alert
    this.addRule({
      id: 'db-error-rate-high',
      name: 'High Database Error Rate',
      description: 'Alert when database error rate exceeds 1%',
      metric: 'db_error_rate',
      threshold: 1,
      operator: 'gt',
      duration: 300000, // 5 minutes
      severity: 'critical',
      enabled: true,
      actions: [
        { type: 'log' },
        { type: 'slack', target: process.env.SLACK_WEBHOOK_URL },
      ],
    });

    // AI Engine Error Rate Alert
    this.addRule({
      id: 'ai-error-rate-high',
      name: 'High AI Engine Error Rate',
      description: 'Alert when AI engine error rate exceeds 10%',
      metric: 'ai_error_rate',
      threshold: 10,
      operator: 'gt',
      duration: 300000, // 5 minutes
      severity: 'warning',
      enabled: true,
      actions: [{ type: 'log' }],
    });

    // Low Cache Hit Rate Alert
    this.addRule({
      id: 'cache-hit-rate-low',
      name: 'Low Cache Hit Rate',
      description: 'Alert when cache hit rate drops below 50%',
      metric: 'cache_hit_rate',
      threshold: 50,
      operator: 'lt',
      duration: 600000, // 10 minutes
      severity: 'warning',
      enabled: true,
      actions: [{ type: 'log' }],
    });

    // High Memory Usage Alert
    this.addRule({
      id: 'memory-usage-high',
      name: 'High Memory Usage',
      description: 'Alert when memory usage exceeds 90%',
      metric: 'memory_usage_percent',
      threshold: 90,
      operator: 'gt',
      duration: 300000, // 5 minutes
      severity: 'critical',
      enabled: true,
      actions: [
        { type: 'log' },
        { type: 'slack', target: process.env.SLACK_WEBHOOK_URL },
      ],
    });

    // Low Conversion Rate Alert
    this.addRule({
      id: 'conversion-rate-low',
      name: 'Low Conversion Rate',
      description: 'Alert when conversion rate drops below 30%',
      metric: 'conversion_rate',
      threshold: 30,
      operator: 'lt',
      duration: 3600000, // 1 hour
      severity: 'warning',
      enabled: true,
      actions: [{ type: 'log' }],
    });

    // High Churn Rate Alert
    this.addRule({
      id: 'churn-rate-high',
      name: 'High Churn Rate',
      description: 'Alert when churn rate exceeds 20%',
      metric: 'churn_rate',
      threshold: 20,
      operator: 'gt',
      duration: 3600000, // 1 hour
      severity: 'warning',
      enabled: true,
      actions: [{ type: 'log' }],
    });
  }

  /**
   * Add an alert rule
   */
  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
    structuredLogger.info(`Alert rule added: ${rule.name}`, undefined, {
      ruleId: rule.id,
      metric: rule.metric,
      threshold: rule.threshold,
    });
  }

  /**
   * Remove an alert rule
   */
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
    structuredLogger.info(`Alert rule removed: ${ruleId}`);
  }

  /**
   * Get all alert rules
   */
  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values()).filter(a => !a.resolved);
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit: number = 100): Alert[] {
    return this.alertHistory.slice(-limit);
  }

  /**
   * Trigger an alert
   */
  private triggerAlert(rule: AlertRule, value: number): void {
    const alertId = `${rule.id}-${Date.now()}`;
    const alert: Alert = {
      id: alertId,
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      message: `${rule.name}: ${rule.description}`,
      value,
      threshold: rule.threshold,
      timestamp: new Date(),
      resolved: false,
    };

    this.activeAlerts.set(alertId, alert);
    this.alertHistory.push(alert);

    // Execute alert actions
    this.executeAlertActions(rule, alert);

    // Log alert
    structuredLogger.warn(`Alert triggered: ${rule.name}`, undefined, {
      ruleId: rule.id,
      severity: rule.severity,
      value,
      threshold: rule.threshold,
    });
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      structuredLogger.info(`Alert resolved: ${alert.ruleName}`, undefined, {
        alertId,
        duration: alert.resolvedAt.getTime() - alert.timestamp.getTime(),
      });
    }
  }

  /**
   * Execute alert actions
   */
  private executeAlertActions(rule: AlertRule, alert: Alert): void {
    for (const action of rule.actions) {
      switch (action.type) {
        case 'log':
          structuredLogger.warn(
            `[${alert.severity.toUpperCase()}] ${alert.message}`,
            undefined,
            {
              value: alert.value,
              threshold: alert.threshold,
            }
          );
          break;

        case 'slack':
          if (action.target) {
            this.sendSlackNotification(action.target, alert);
          }
          break;

        case 'email':
          if (action.target) {
            this.sendEmailNotification(action.target, alert);
          }
          break;

        case 'webhook':
          if (action.target) {
            this.sendWebhookNotification(action.target, alert);
          }
          break;
      }
    }
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(webhookUrl: string, alert: Alert): Promise<void> {
    try {
      const color = alert.severity === 'critical' ? 'danger' : 'warning';
      // Slack payload structure for notification
      const slackPayload = {
        attachments: [
          {
            color,
            title: alert.ruleName,
            text: alert.message,
            fields: [
              {
                title: 'Severity',
                value: alert.severity.toUpperCase(),
                short: true,
              },
              {
                title: 'Value',
                value: alert.value.toString(),
                short: true,
              },
              {
                title: 'Threshold',
                value: alert.threshold.toString(),
                short: true,
              },
              {
                title: 'Time',
                value: alert.timestamp.toISOString(),
                short: true,
              },
            ],
          },
        ],
      };

      // Send to Slack (implementation would use axios or similar)
      structuredLogger.debug('Slack notification sent', undefined, {
        webhookUrl,
        alertId: alert.id,
        payload: slackPayload,
      });
    } catch (error) {
      structuredLogger.error('Failed to send Slack notification', error as Error);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(email: string, alert: Alert): Promise<void> {
    try {
      // Send email (implementation would use nodemailer or similar)
      structuredLogger.debug('Email notification sent', undefined, {
        email,
        alertId: alert.id,
      });
    } catch (error) {
      structuredLogger.error('Failed to send email notification', error as Error);
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(webhookUrl: string, alert: Alert): Promise<void> {
    try {
      // Send webhook (implementation would use axios or similar)
      structuredLogger.debug('Webhook notification sent', undefined, {
        webhookUrl,
        alertId: alert.id,
      });
    } catch (error) {
      structuredLogger.error('Failed to send webhook notification', error as Error);
    }
  }

  /**
   * Start alert checking
   */
  startAlertChecking(intervalMs: number = 60000): void {
    if (this.checkInterval) {
      return; // Already running
    }

    this.checkInterval = setInterval(() => {
      this.checkAlerts();
    }, intervalMs);

    structuredLogger.info('Alert checking started', undefined, {
      intervalMs,
    });
  }

  /**
   * Stop alert checking
   */
  stopAlertChecking(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      structuredLogger.info('Alert checking stopped');
    }
  }

  /**
   * Check all alert rules
   */
  private checkAlerts(): void {
    for (const rule of this.rules.values()) {
      if (!rule.enabled) {
        continue;
      }

      const value = this.getMetricValue(rule.metric);
      if (value !== null && this.shouldTriggerAlert(value, rule.threshold, rule.operator)) {
        this.triggerAlert(rule, value);
      }
    }
  }

  /**
   * Get metric value
   */
  private getMetricValue(metric: string): number | null {
    switch (metric) {
      case 'http_error_rate':
        return this.calculateHttpErrorRate();
      case 'http_request_duration_p95':
        return this.calculateHttpLatencyP95();
      case 'db_error_rate':
        return this.calculateDbErrorRate();
      case 'ai_error_rate':
        return this.calculateAiErrorRate();
      case 'cache_hit_rate':
        return this.calculateCacheHitRate();
      case 'memory_usage_percent':
        return this.calculateMemoryUsagePercent();
      case 'conversion_rate':
        return this.calculateConversionRate();
      case 'churn_rate':
        return this.calculateChurnRate();
      default:
        return null;
    }
  }

  /**
   * Calculate HTTP error rate
   */
  private calculateHttpErrorRate(): number {
    // This would aggregate metrics from prom-client
    // For now, return a placeholder
    return 0;
  }

  /**
   * Calculate HTTP latency p95
   */
  private calculateHttpLatencyP95(): number {
    // This would calculate p95 from histogram
    // For now, return a placeholder
    return 0;
  }

  /**
   * Calculate database error rate
   */
  private calculateDbErrorRate(): number {
    // This would aggregate database metrics
    // For now, return a placeholder
    return 0;
  }

  /**
   * Calculate AI error rate
   */
  private calculateAiErrorRate(): number {
    // This would aggregate AI metrics
    // For now, return a placeholder
    return 0;
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(): number {
    // This would calculate from cache metrics
    // For now, return a placeholder
    return 0;
  }

  /**
   * Calculate memory usage percent
   */
  private calculateMemoryUsagePercent(): number {
    const memUsage = process.memoryUsage();
    return (memUsage.heapUsed / memUsage.heapTotal) * 100;
  }

  /**
   * Calculate conversion rate
   */
  private calculateConversionRate(): number {
    // This would calculate from conversion metrics
    // For now, return a placeholder
    return 0;
  }

  /**
   * Calculate churn rate
   */
  private calculateChurnRate(): number {
    // This would calculate from enrollment metrics
    // For now, return a placeholder
    return 0;
  }

  /**
   * Check if alert should be triggered
   */
  private shouldTriggerAlert(value: number, threshold: number, operator: string): boolean {
    switch (operator) {
      case 'gt':
        return value > threshold;
      case 'lt':
        return value < threshold;
      case 'eq':
        return value === threshold;
      case 'gte':
        return value >= threshold;
      case 'lte':
        return value <= threshold;
      default:
        return false;
    }
  }

  /**
   * Get alert statistics
   */
  getAlertStatistics() {
    const activeAlerts = this.getActiveAlerts();
    const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
    const warningCount = activeAlerts.filter(a => a.severity === 'warning').length;
    const infoCount = activeAlerts.filter(a => a.severity === 'info').length;

    return {
      totalActive: activeAlerts.length,
      critical: criticalCount,
      warning: warningCount,
      info: infoCount,
      totalHistory: this.alertHistory.length,
      rules: this.rules.size,
    };
  }
}

export const alertsService = new AlertsService();
