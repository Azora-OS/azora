/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

WEBSOCKET CLIENT
Real-time event streaming with auto-reconnect
*/

import { AZORA_API_CONFIG } from './api-gateway-config';

type EventHandler = (data: any) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private handlers: Map<string, EventHandler[]> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;

  connect(token?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) return;
    
    this.isConnecting = true;
    const url = token 
      ? `${AZORA_API_CONFIG.websocket.url}?token=${token}`
      : AZORA_API_CONFIG.websocket.url;
    
    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      this.isConnecting = false;
      this.emit('connected', {});
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.emit(message.type, message.data);
    };
    
    this.ws.onerror = (error) => {
      this.emit('error', error);
    };
    
    this.ws.onclose = () => {
      this.isConnecting = false;
      this.emit('disconnected', {});
      this.scheduleReconnect();
    };
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) handlers.splice(index, 1);
    }
  }

  send(type: string, data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }

  private emit(event: string, data: any): void {
    this.handlers.get(event)?.forEach(handler => handler(data));
  }

  private scheduleReconnect(): void {
    if (!AZORA_API_CONFIG.websocket.reconnect) return;
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, AZORA_API_CONFIG.websocket.reconnectInterval);
  }
}

export const wsClient = new WebSocketClient();
