import * as vscode from 'vscode';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface ConnectionState {
  connected: boolean;
  reconnecting: boolean;
  lastConnected?: Date;
  error?: string;
}

export class WebSocketClient {
  private ws: WebSocket | undefined;
  private url: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private messageQueue: WebSocketMessage[] = [];
  private connectionState: ConnectionState = {
    connected: false,
    reconnecting: false,
  };

  private onMessageCallbacks: ((message: WebSocketMessage) => void)[] = [];
  private onConnectCallbacks: (() => void)[] = [];
  private onDisconnectCallbacks: (() => void)[] = [];

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.connectionState.connected = true;
          this.connectionState.reconnecting = false;
          this.connectionState.lastConnected = new Date();
          this.reconnectAttempts = 0;

          // Flush message queue
          this.flushMessageQueue();

          // Notify listeners
          this.onConnectCallbacks.forEach((cb) => cb());

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.onMessageCallbacks.forEach((cb) => cb(message));
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (event) => {
          this.connectionState.error = 'WebSocket error';
          console.error('WebSocket error:', event);
          reject(new Error('WebSocket connection failed'));
        };

        this.ws.onclose = () => {
          this.connectionState.connected = false;
          this.onDisconnectCallbacks.forEach((cb) => cb());

          // Attempt reconnection
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Reconnect with exponential backoff
   */
  private reconnect(): void {
    this.connectionState.reconnecting = true;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Send message to server
   */
  send(message: WebSocketMessage): void {
    if (this.connectionState.connected && this.ws) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for later
      this.messageQueue.push(message);
    }
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.ws) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  /**
   * Register message handler
   */
  onMessage(callback: (message: WebSocketMessage) => void): void {
    this.onMessageCallbacks.push(callback);
  }

  /**
   * Register connection handler
   */
  onConnect(callback: () => void): void {
    this.onConnectCallbacks.push(callback);
  }

  /**
   * Register disconnection handler
   */
  onDisconnect(callback: () => void): void {
    this.onDisconnectCallbacks.push(callback);
  }

  /**
   * Get connection state
   */
  getState(): ConnectionState {
    return { ...this.connectionState };
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
    this.connectionState.connected = false;
  }
}
