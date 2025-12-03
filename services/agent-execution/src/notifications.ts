import { EventBus } from '../../../packages/shared/event-bus/src/index';
import { logger } from './logger';

interface Notification {
  type: 'email' | 'websocket' | 'webhook';
  recipient: string;
  subject?: string;
  message: string;
  data?: any;
}

export class NotificationService {
  private bus: EventBus;

  constructor(bus?: EventBus) {
    this.bus = bus ?? new EventBus();
    this.setupHandlers();
  }

  private setupHandlers() {
    this.bus.subscribe('task.completed', (data) => {
      this.notify({
        type: 'websocket',
        recipient: data.agentId || 'system',
        message: `Task ${data.taskId} completed`,
        data
      });
    });

    this.bus.subscribe('task.failed', (data) => {
      this.notify({
        type: 'email',
        recipient: 'admin@azora.world',
        subject: 'Task Failed',
        message: `Task ${data.taskId} failed: ${data.error}`,
        data
      });
    });
  }

  async notify(notification: Notification): Promise<void> {
    logger.info({ notification }, 'Sending notification');
    
    switch (notification.type) {
      case 'websocket':
        await this.bus.publish('notification.websocket', notification);
        break;
      case 'email':
        await this.bus.publish('notification.email', notification);
        break;
      case 'webhook':
        await this.bus.publish('notification.webhook', notification);
        break;
    }
  }
}
