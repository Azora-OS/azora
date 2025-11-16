import * as vscode from 'vscode';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  actions?: NotificationAction[];
  timeout?: number;
  timestamp: number;
}

export interface NotificationAction {
  label: string;
  callback: () => void;
}

export class NotificationService {
  private notifications: Map<string, Notification> = new Map();
  private notificationCallbacks: ((notification: Notification) => void)[] = [];

  /**
   * Show info notification
   */
  showInfo(message: string, actions?: NotificationAction[]): void {
    this.show({
      title: 'Info',
      message,
      type: 'info',
      actions,
    });
  }

  /**
   * Show warning notification
   */
  showWarning(message: string, actions?: NotificationAction[]): void {
    this.show({
      title: 'Warning',
      message,
      type: 'warning',
      actions,
    });
  }

  /**
   * Show error notification
   */
  showError(message: string, actions?: NotificationAction[]): void {
    this.show({
      title: 'Error',
      message,
      type: 'error',
      actions,
    });
  }

  /**
   * Show success notification
   */
  showSuccess(message: string, actions?: NotificationAction[]): void {
    this.show({
      title: 'Success',
      message,
      type: 'success',
      actions,
      timeout: 3000,
    });
  }

  /**
   * Show notification
   */
  private show(options: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    actions?: NotificationAction[];
    timeout?: number;
  }): void {
    const notification: Notification = {
      id: this.generateId(),
      title: options.title,
      message: options.message,
      type: options.type,
      actions: options.actions,
      timeout: options.timeout,
      timestamp: Date.now(),
    };

    this.notifications.set(notification.id, notification);
    this.notifyListeners(notification);

    // Show in VS Code
    this.showInVsCode(notification);

    // Auto-dismiss if timeout specified
    if (options.timeout) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, options.timeout);
    }
  }

  /**
   * Show notification in VS Code
   */
  private showInVsCode(notification: Notification): void {
    const message = `${notification.title}: ${notification.message}`;

    switch (notification.type) {
      case 'info':
        vscode.window.showInformationMessage(message, ...(notification.actions?.map((a) => a.label) || []));
        break;
      case 'warning':
        vscode.window.showWarningMessage(message, ...(notification.actions?.map((a) => a.label) || []));
        break;
      case 'error':
        vscode.window.showErrorMessage(message, ...(notification.actions?.map((a) => a.label) || []));
        break;
      case 'success':
        vscode.window.showInformationMessage(message);
        break;
    }
  }

  /**
   * Dismiss notification
   */
  dismiss(id: string): void {
    this.notifications.delete(id);
  }

  /**
   * Get all notifications
   */
  getAll(): Notification[] {
    return Array.from(this.notifications.values());
  }

  /**
   * Register notification listener
   */
  onNotification(callback: (notification: Notification) => void): void {
    this.notificationCallbacks.push(callback);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(notification: Notification): void {
    this.notificationCallbacks.forEach((cb) => cb(notification));
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
