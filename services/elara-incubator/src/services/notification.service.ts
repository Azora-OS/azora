import { generateUUID } from '../utils/uuid.js';
import { Notification, NotificationRequest } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

// Mock database - replace with actual database calls
const notifications: Map<string, Notification> = new Map();

export class NotificationService {
  /**
   * Create a notification
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  async createNotification(userId: string, data: NotificationRequest): Promise<Notification> {
    const notificationId = generateUUID();
    const now = new Date();

    const notification: Notification = {
      id: notificationId,
      userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data,
      read: false,
      createdAt: now,
    };

    notifications.set(notificationId, notification);

    // TODO: Send notification via email, SMS, push notification, etc.
    await this.sendNotification(notification);

    return notification;
  }

  /**
   * Get notifications for a user
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  async getUserNotifications(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
    unreadOnly: boolean = false
  ): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    let userNotifications = Array.from(notifications.values()).filter((n) => n.userId === userId);

    if (unreadOnly) {
      userNotifications = userNotifications.filter((n) => !n.read);
    }

    // Sort by creation date (newest first)
    userNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = userNotifications.length;
    const unreadCount = userNotifications.filter((n) => !n.read).length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      notifications: userNotifications.slice(start, end),
      total,
      unreadCount,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Get notification by ID
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  async getNotificationById(notificationId: string, userId: string): Promise<Notification> {
    const notification = notifications.get(notificationId);

    if (!notification) {
      throw new AppError(404, 'Notification not found');
    }

    if (notification.userId !== userId) {
      throw new AppError(403, 'Unauthorized access to this notification');
    }

    return notification;
  }

  /**
   * Mark notification as read
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.getNotificationById(notificationId, userId);

    notification.read = true;
    notifications.set(notificationId, notification);

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  async markAllAsRead(userId: string): Promise<number> {
    let count = 0;

    for (const notification of notifications.values()) {
      if (notification.userId === userId && !notification.read) {
        notification.read = true;
        notifications.set(notification.id, notification);
        count++;
      }
    }

    return count;
  }

  /**
   * Delete notification
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await this.getNotificationById(notificationId, userId);
    notifications.delete(notification.id);
  }

  /**
   * Delete all notifications for a user
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  async deleteAllNotifications(userId: string): Promise<number> {
    let count = 0;

    for (const notification of notifications.values()) {
      if (notification.userId === userId) {
        notifications.delete(notification.id);
        count++;
      }
    }

    return count;
  }

  /**
   * Create payment notification
   * Requirements: 8.1
   */
  async notifyPayment(
    userId: string,
    paymentId: string,
    amount: number,
    status: string
  ): Promise<Notification> {
    const title = `Payment ${status}`;
    const message = `Your payment of $${amount.toFixed(2)} has been ${status}.`;

    return this.createNotification(userId, {
      type: 'payment',
      title,
      message,
      data: {
        paymentId,
        amount,
        status,
      },
    });
  }

  /**
   * Create milestone notification
   * Requirements: 8.2
   */
  async notifyMilestone(
    userId: string,
    businessId: string,
    milestoneName: string,
    description: string
  ): Promise<Notification> {
    const title = `Milestone Reached: ${milestoneName}`;
    const message = description;

    return this.createNotification(userId, {
      type: 'milestone',
      title,
      message,
      data: {
        businessId,
        milestoneName,
      },
    });
  }

  /**
   * Create mentorship notification
   * Requirements: 8.3
   */
  async notifyMentorship(
    userId: string,
    businessId: string,
    mentorshipType: string,
    recommendation: string
  ): Promise<Notification> {
    const title = `Elara AI Mentorship: ${mentorshipType}`;
    const message = recommendation;

    return this.createNotification(userId, {
      type: 'mentorship',
      title,
      message,
      data: {
        businessId,
        mentorshipType,
      },
    });
  }

  /**
   * Create fund distribution notification
   * Requirements: 8.4
   */
  async notifyFundDistribution(
    userId: string,
    distributionId: string,
    amount: number,
    distributionType: string
  ): Promise<Notification> {
    const title = `Citadel Fund Distribution: ${distributionType}`;
    const message = `A fund distribution of $${amount.toFixed(2)} has been made for ${distributionType}.`;

    return this.createNotification(userId, {
      type: 'fund_distribution',
      title,
      message,
      data: {
        distributionId,
        amount,
        distributionType,
      },
    });
  }

  /**
   * Create reminder notification
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  async notifyReminder(
    userId: string,
    businessId: string,
    reminderType: string,
    details: string
  ): Promise<Notification> {
    const title = `Reminder: ${reminderType}`;
    const message = details;

    return this.createNotification(userId, {
      type: 'reminder',
      title,
      message,
      data: {
        businessId,
        reminderType,
      },
    });
  }

  /**
   * Get unread notification count for a user
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  async getUnreadCount(userId: string): Promise<number> {
    return Array.from(notifications.values()).filter((n) => n.userId === userId && !n.read)
      .length;
  }

  /**
   * Get notifications by type
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  async getNotificationsByType(
    userId: string,
    type: 'payment' | 'milestone' | 'mentorship' | 'fund_distribution' | 'reminder'
  ): Promise<Notification[]> {
    return Array.from(notifications.values()).filter((n) => n.userId === userId && n.type === type);
  }

  /**
   * Send notification (placeholder for actual implementation)
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  private async sendNotification(notification: Notification): Promise<void> {
    // TODO: Implement actual notification sending
    // - Email notification
    // - SMS notification
    // - Push notification
    // - In-app notification (already stored)

    console.log(`[Notification] Sending ${notification.type} notification to user ${notification.userId}`);
    console.log(`  Title: ${notification.title}`);
    console.log(`  Message: ${notification.message}`);
  }

  /**
   * Schedule reminder notification
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  async scheduleReminder(
    userId: string,
    businessId: string,
    reminderType: string,
    details: string,
    scheduledFor: Date
  ): Promise<{
    scheduled: boolean;
    scheduledFor: Date;
  }> {
    // TODO: Implement actual scheduling (e.g., using a job queue)
    console.log(
      `[Scheduled Reminder] ${reminderType} for user ${userId} at ${scheduledFor.toISOString()}`
    );

    return {
      scheduled: true,
      scheduledFor,
    };
  }

  /**
   * Get notification statistics for a user
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  async getStatistics(userId: string): Promise<{
    totalNotifications: number;
    unreadNotifications: number;
    byType: Record<string, number>;
    readPercentage: number;
  }> {
    const userNotifications = Array.from(notifications.values()).filter((n) => n.userId === userId);

    const unreadCount = userNotifications.filter((n) => !n.read).length;
    const byType: Record<string, number> = {};

    userNotifications.forEach((n) => {
      byType[n.type] = (byType[n.type] || 0) + 1;
    });

    const readPercentage =
      userNotifications.length > 0
        ? Math.round(((userNotifications.length - unreadCount) / userNotifications.length) * 100)
        : 0;

    return {
      totalNotifications: userNotifications.length,
      unreadNotifications: unreadCount,
      byType,
      readPercentage,
    };
  }
}

export const notificationService = new NotificationService();
