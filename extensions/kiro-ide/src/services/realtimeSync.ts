import { WebSocketClient, WebSocketMessage } from './websocketClient';
import { Task } from '../parsers/taskParser';
import { TaskParser } from '../parsers/taskParser';

export interface SyncEvent {
  type: 'taskUpdated' | 'taskCreated' | 'taskDeleted' | 'fileUpdated';
  task?: Task;
  filePath?: string;
  timestamp: number;
}

export class RealtimeSync {
  private wsClient: WebSocketClient;
  private syncCallbacks: ((event: SyncEvent) => void)[] = [];
  private userId: string;
  private sessionId: string;

  constructor(wsUrl: string, userId: string) {
    this.wsClient = new WebSocketClient(wsUrl);
    this.userId = userId;
    this.sessionId = this.generateSessionId();

    this.setupMessageHandlers();
  }

  /**
   * Connect to sync server
   */
  async connect(): Promise<void> {
    await this.wsClient.connect();

    // Send authentication
    this.wsClient.send({
      type: 'auth',
      data: {
        userId: this.userId,
        sessionId: this.sessionId,
      },
      timestamp: Date.now(),
    });
  }

  /**
   * Setup message handlers
   */
  private setupMessageHandlers(): void {
    this.wsClient.onMessage((message: WebSocketMessage) => {
      switch (message.type) {
        case 'taskUpdated':
          this.handleTaskUpdated(message.data);
          break;
        case 'taskCreated':
          this.handleTaskCreated(message.data);
          break;
        case 'taskDeleted':
          this.handleTaskDeleted(message.data);
          break;
        case 'fileUpdated':
          this.handleFileUpdated(message.data);
          break;
      }
    });
  }

  /**
   * Publish task update
   */
  publishTaskUpdate(task: Task): void {
    this.wsClient.send({
      type: 'taskUpdated',
      data: {
        task,
        userId: this.userId,
      },
      timestamp: Date.now(),
    });
  }

  /**
   * Publish task creation
   */
  publishTaskCreated(task: Task): void {
    this.wsClient.send({
      type: 'taskCreated',
      data: {
        task,
        userId: this.userId,
      },
      timestamp: Date.now(),
    });
  }

  /**
   * Publish task deletion
   */
  publishTaskDeleted(taskId: string): void {
    this.wsClient.send({
      type: 'taskDeleted',
      data: {
        taskId,
        userId: this.userId,
      },
      timestamp: Date.now(),
    });
  }

  /**
   * Handle incoming task update
   */
  private handleTaskUpdated(data: any): void {
    const event: SyncEvent = {
      type: 'taskUpdated',
      task: data.task,
      timestamp: data.timestamp || Date.now(),
    };

    this.notifySyncListeners(event);
  }

  /**
   * Handle incoming task creation
   */
  private handleTaskCreated(data: any): void {
    const event: SyncEvent = {
      type: 'taskCreated',
      task: data.task,
      timestamp: data.timestamp || Date.now(),
    };

    this.notifySyncListeners(event);
  }

  /**
   * Handle incoming task deletion
   */
  private handleTaskDeleted(data: any): void {
    const event: SyncEvent = {
      type: 'taskDeleted',
      timestamp: data.timestamp || Date.now(),
    };

    this.notifySyncListeners(event);
  }

  /**
   * Handle incoming file update
   */
  private handleFileUpdated(data: any): void {
    const event: SyncEvent = {
      type: 'fileUpdated',
      filePath: data.filePath,
      timestamp: data.timestamp || Date.now(),
    };

    this.notifySyncListeners(event);
  }

  /**
   * Register sync listener
   */
  onSync(callback: (event: SyncEvent) => void): void {
    this.syncCallbacks.push(callback);
  }

  /**
   * Notify all sync listeners
   */
  private notifySyncListeners(event: SyncEvent): void {
    this.syncCallbacks.forEach((cb) => cb(event));
  }

  /**
   * Get connection state
   */
  getConnectionState() {
    return this.wsClient.getState();
  }

  /**
   * Disconnect
   */
  disconnect(): void {
    this.wsClient.disconnect();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
