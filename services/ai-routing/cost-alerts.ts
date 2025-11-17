/**
 * Cost Alerts
 * Monitors spending thresholds and triggers alerts for budget overages
 */

import { PrismaClient } from '@prisma/client';

/**
 * Alert threshold configuration
 */
export interface AlertThreshold {
  userId: string;
  monthlyBudget: number;
  warningThreshold: number;
  criticalThreshold: number;
  dailyLimit?: number;
  hourlyLimit?: number;
}

/**
 * Alert event
 */
export interface AlertEvent {
  id: string;
  userId: string;
  alertType: 'warning' | 'critical' | 'daily_limit' | 'hourly_limit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  currentSpending: number;
  threshold: number;
  percentageUsed: number;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
}

/**
 * Notification channel
 */
export type NotificationChannel = 'email' | 'sms' | 'webhook' | 'in-app';

/**
 * Notification configuration
 */
export interface NotificationConfig {
  userId: string;
  channels: NotificationChannel[];
  emailAddress?: string;
  phoneNumber?: string;
  webhookUrl?: string;
  enableWarnings: boolean;
  enableCritical: boolean;
  enableDailyLimit: boolean;
  enableHourlyLimit: boolean;
}

/**
 * Cost Alert Manager Implementation
 */
export class CostAlertManager {
  private prisma: PrismaClient;
  private alertThresholds: Map<string, AlertThreshold> = new Map();
  private notificationConfigs: Map<string, NotificationConfig> = new Map();
  private alertHistory: Map<string, AlertEvent[]> = new Map();
  private spendingTracker: Map<string, { daily: number; hourly: number; lastHourReset: Date }> =
    new Map();

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Set alert threshold for a user
   */
  async setAlertThreshold(threshold: AlertThreshold): Promise<void> {
    this.alertThresholds.set(threshold.userId, threshold);

    try {
      await this.prisma.costAlertThreshold.upsert({
        where: { userId: threshold.userId },
        update: {
          monthlyBudget: threshold.monthlyBudget,
          warningThreshold: threshold.warningThreshold,
          criticalThreshold: threshold.criticalThreshold,
          dailyLimit: threshold.dailyLimit,
          hourlyLimit: threshold.hourlyLimit
        },
        create: {
          userId: threshold.userId,
          monthlyBudget: threshold.monthlyBudget,
          warningThreshold: threshold.warningThreshold,
          criticalThreshold: threshold.criticalThreshold,
          dailyLimit: threshold.dailyLimit,
          hourlyLimit: threshold.hourlyLimit
        }
      });
    } catch (error) {
      console.error(`Error setting alert threshold for user ${threshold.userId}:`, error);
    }
  }

  /**
   * Get alert threshold for a user
   */
  async getAlertThreshold(userId: string): Promise<AlertThreshold | null> {
    return this.alertThresholds.get(userId) || null;
  }

  /**
   * Set notification configuration for a user
   */
  async setNotificationConfig(config: NotificationConfig): Promise<void> {
    this.notificationConfigs.set(config.userId, config);

    try {
      await this.prisma.notificationConfig.upsert({
        where: { userId: config.userId },
        update: {
          channels: config.channels,
          emailAddress: config.emailAddress,
          phoneNumber: config.phoneNumber,
          webhookUrl: config.webhookUrl,
          enableWarnings: config.enableWarnings,
          enableCritical: config.enableCritical,
          enableDailyLimit: config.enableDailyLimit,
          enableHourlyLimit: config.enableHourlyLimit
        },
        create: {
          userId: config.userId,
          channels: config.channels,
          emailAddress: config.emailAddress,
          phoneNumber: config.phoneNumber,
          webhookUrl: config.webhookUrl,
          enableWarnings: config.enableWarnings,
          enableCritical: config.enableCritical,
          enableDailyLimit: config.enableDailyLimit,
          enableHourlyLimit: config.enableHourlyLimit
        }
      });
    } catch (error) {
      console.error(`Error setting notification config for user ${config.userId}:`, error);
    }
  }

  /**
   * Get notification configuration for a user
   */
  async getNotificationConfig(userId: string): Promise<NotificationConfig | null> {
    return this.notificationConfigs.get(userId) || null;
  }

  /**
   * Check spending against thresholds and trigger alerts
   */
  async checkSpendingThresholds(
    userId: string,
    currentSpending: number,
    monthlyBudget: number
  ): Promise<AlertEvent[]> {
    const threshold = this.alertThresholds.get(userId);
    if (!threshold) {
      return [];
    }

    const alerts: AlertEvent[] = [];
    const percentageUsed = (currentSpending / monthlyBudget) * 100;

    if (percentageUsed >= threshold.criticalThreshold * 100) {
      const alert = await this.createAlert(
        userId,
        'critical',
        'critical',
        `Critical: You have used ${percentageUsed.toFixed(1)}% of your monthly budget`,
        currentSpending,
        monthlyBudget * threshold.criticalThreshold,
        percentageUsed
      );
      alerts.push(alert);
    } else if (percentageUsed >= threshold.warningThreshold * 100) {
      const alert = await this.createAlert(
        userId,
        'warning',
        'medium',
        `Warning: You have used ${percentageUsed.toFixed(1)}% of your monthly budget`,
        currentSpending,
        monthlyBudget * threshold.warningThreshold,
        percentageUsed
      );
      alerts.push(alert);
    }

    return alerts;
  }

  /**
   * Check daily spending limit
   */
  async checkDailyLimit(userId: string, dailySpending: number): Promise<AlertEvent | null> {
    const threshold = this.alertThresholds.get(userId);
    if (!threshold || !threshold.dailyLimit) {
      return null;
    }

    if (dailySpending >= threshold.dailyLimit) {
      return this.createAlert(
        userId,
        'daily_limit',
        'high',
        `Daily limit reached: $${dailySpending.toFixed(2)} / $${threshold.dailyLimit.toFixed(2)}`,
        dailySpending,
        threshold.dailyLimit,
        (dailySpending / threshold.dailyLimit) * 100
      );
    }

    return null;
  }

  /**
   * Check hourly spending limit
   */
  async checkHourlyLimit(userId: string, hourlySpending: number): Promise<AlertEvent | null> {
    const threshold = this.alertThresholds.get(userId);
    if (!threshold || !threshold.hourlyLimit) {
      return null;
    }

    if (hourlySpending >= threshold.hourlyLimit) {
      return this.createAlert(
        userId,
        'hourly_limit',
        'high',
        `Hourly limit reached: $${hourlySpending.toFixed(2)} / $${threshold.hourlyLimit.toFixed(2)}`,
        hourlySpending,
        threshold.hourlyLimit,
        (hourlySpending / threshold.hourlyLimit) * 100
      );
    }

    return null;
  }

  /**
   * Create an alert event
   */
  private async createAlert(
    userId: string,
    alertType: 'warning' | 'critical' | 'daily_limit' | 'hourly_limit',
    severity: 'low' | 'medium' | 'high' | 'critical',
    message: string,
    currentSpending: number,
    threshold: number,
    percentageUsed: number
  ): Promise<AlertEvent> {
    const alert: AlertEvent = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      alertType,
      severity,
      message,
      currentSpending,
      threshold,
      percentageUsed,
      timestamp: new Date(),
      acknowledged: false
    };

    if (!this.alertHistory.has(userId)) {
      this.alertHistory.set(userId, []);
    }
    this.alertHistory.get(userId)!.push(alert);

    await this.persistAlert(alert);

    const config = this.notificationConfigs.get(userId);
    if (config) {
      await this.sendNotifications(alert, config);
    }

    return alert;
  }

  /**
   * Persist alert to database
   */
  private async persistAlert(alert: AlertEvent): Promise<void> {
    try {
      await this.prisma.costAlert.create({
        data: {
          id: alert.id,
          userId: alert.userId,
          alertType: alert.alertType,
          severity: alert.severity,
          message: alert.message,
          currentSpending: alert.currentSpending,
          threshold: alert.threshold,
          percentageUsed: alert.percentageUsed,
          timestamp: alert.timestamp,
          acknowledged: alert.acknowledged
        }
      });
    } catch (error) {
      console.error(`Error persisting alert for user ${alert.userId}:`, error);
    }
  }

  /**
   * Send notifications through configured channels
   */
  private async sendNotifications(alert: AlertEvent, config: NotificationConfig): Promise<void> {
    if (alert.alertType === 'warning' && !config.enableWarnings) return;
    if (alert.alertType === 'critical' && !config.enableCritical) return;
    if (alert.alertType === 'daily_limit' && !config.enableDailyLimit) return;
    if (alert.alertType === 'hourly_limit' && !config.enableHourlyLimit) return;

    for (const channel of config.channels) {
      try {
        switch (channel) {
          case 'email':
            if (config.emailAddress) {
              await this.sendEmailNotification(alert, config.emailAddress);
            }
            break;
          case 'sms':
            if (config.phoneNumber) {
              await this.sendSMSNotification(alert, config.phoneNumber);
            }
            break;
          case 'webhook':
            if (config.webhookUrl) {
              await this.sendWebhookNotification(alert, config.webhookUrl);
            }
            break;
          case 'in-app':
            await this.sendInAppNotification(alert);
            break;
        }
      } catch (error) {
        console.error(`Error sending ${channel} notification for alert ${alert.id}:`, error);
      }
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(alert: AlertEvent, email: string): Promise<void> {
    console.log(`[EMAIL] Sending alert to ${email}: ${alert.message}`);
  }

  /**
   * Send SMS notification
   */
  private async sendSMSNotification(alert: AlertEvent, phone: string): Promise<void> {
    console.log(`[SMS] Sending alert to ${phone}: ${alert.message}`);
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(alert: AlertEvent, webhookUrl: string): Promise<void> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      });

      if (!response.ok) {
        console.error(`Webhook returned status ${response.status}`);
      }
    } catch (error) {
      console.error(`Error sending webhook notification:`, error);
    }
  }

  /**
   * Send in-app notification
   */
  private async sendInAppNotification(alert: AlertEvent): Promise<void> {
    console.log(`[IN-APP] Alert for user ${alert.userId}: ${alert.message}`);
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    for (const alerts of this.alertHistory.values()) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
        alert.acknowledgedAt = new Date();

        try {
          await this.prisma.costAlert.update({
            where: { id: alertId },
            data: {
              acknowledged: true,
              acknowledgedAt: new Date()
            }
          });
        } catch (error) {
          console.error(`Error acknowledging alert ${alertId}:`, error);
        }

        return;
      }
    }
  }

  /**
   * Get alert history for a user
   */
  async getAlertHistory(userId: string, limit: number = 50): Promise<AlertEvent[]> {
    const alerts = this.alertHistory.get(userId) || [];
    return alerts.slice(-limit);
  }

  /**
   * Get unacknowledged alerts for a user
   */
  async getUnacknowledgedAlerts(userId: string): Promise<AlertEvent[]> {
    const alerts = this.alertHistory.get(userId) || [];
    return alerts.filter(a => !a.acknowledged);
  }

  /**
   * Track hourly spending
   */
  async trackHourlySpending(userId: string, cost: number): Promise<void> {
    let tracker = this.spendingTracker.get(userId);

    if (!tracker) {
      tracker = {
        daily: 0,
        hourly: 0,
        lastHourReset: new Date()
      };
      this.spendingTracker.set(userId, tracker);
    }

    const now = new Date();
    const hoursPassed = (now.getTime() - tracker.lastHourReset.getTime()) / (1000 * 60 * 60);

    if (hoursPassed >= 1) {
      tracker.hourly = 0;
      tracker.lastHourReset = now;
    }

    tracker.hourly += cost;
    tracker.daily += cost;
  }

  /**
   * Get current hourly spending
   */
  async getCurrentHourlySpending(userId: string): Promise<number> {
    const tracker = this.spendingTracker.get(userId);
    if (!tracker) return 0;

    const now = new Date();
    const hoursPassed = (now.getTime() - tracker.lastHourReset.getTime()) / (1000 * 60 * 60);

    if (hoursPassed >= 1) {
      tracker.hourly = 0;
      tracker.lastHourReset = now;
    }

    return tracker.hourly;
  }

  /**
   * Get current daily spending
   */
  async getCurrentDailySpending(userId: string): Promise<number> {
    const tracker = this.spendingTracker.get(userId);
    return tracker?.daily || 0;
  }

  /**
   * Reset daily spending
   */
  async resetDailySpending(userId: string): Promise<void> {
    const tracker = this.spendingTracker.get(userId);
    if (tracker) {
      tracker.daily = 0;
    }
  }

  /**
   * Get alert statistics for a user
   */
  async getAlertStatistics(userId: string): Promise<{
    totalAlerts: number;
    acknowledgedAlerts: number;
    unacknowledgedAlerts: number;
    alertsByType: Record<string, number>;
    alertsBySeverity: Record<string, number>;
  }> {
    const alerts = this.alertHistory.get(userId) || [];

    const alertsByType: Record<string, number> = {};
    const alertsBySeverity: Record<string, number> = {};

    for (const alert of alerts) {
      alertsByType[alert.alertType] = (alertsByType[alert.alertType] || 0) + 1;
      alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;
    }

    return {
      totalAlerts: alerts.length,
      acknowledgedAlerts: alerts.filter(a => a.acknowledged).length,
      unacknowledgedAlerts: alerts.filter(a => !a.acknowledged).length,
      alertsByType,
      alertsBySeverity
    };
  }
}
