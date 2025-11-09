/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Azora Nexus Event Bus
 * Mock implementation for development and testing
 */

export interface EventBusInterface {
  subscribe(event: string, handler: (event: any) => void): void;
  publish(event: string, data: any): Promise<void>;
  unsubscribe(event: string, handler: (event: any) => void): void;
  disconnect?(): Promise<void>;
}

class MockAzoraNexusEventBus implements EventBusInterface {
  private subscribers = new Map<string, ((event: any) => void)[]>();

  subscribe(event: string, handler: (event: any) => void): void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event)!.push(handler);
    console.log(`Subscribed to event: ${event}`);
  }

  async publish(event: string, data: any): Promise<void> {
    const handlers = this.subscribers.get(event);
    if (handlers) {
      console.log(`Publishing event: ${event}`, data);
      for (const handler of handlers) {
        try {
          await handler({ data, timestamp: new Date() });
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      }
    }
  }

  unsubscribe(event: string, handler: (event: any) => void): void {
    const handlers = this.subscribers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        console.log(`Unsubscribed from event: ${event}`);
      }
    }
  }

  async disconnect(): Promise<void> {
    this.subscribers.clear();
    console.log('Event bus disconnected');
  }
}

export class EventBus extends MockAzoraNexusEventBus {
  constructor(url?: string, name?: string) {
    super();
    console.log(`Creating EventBus with URL: ${url}, name: ${name}`);
  }
}

export function createAzoraNexusEventBus(config?: any): EventBusInterface {
  console.log('Creating mock Azora Nexus Event Bus');
  return new MockAzoraNexusEventBus();
}
