/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

EVENT BUS SERVICE - AZORA NEXUS INTEGRATION
Provides event publishing and subscription for service communication
*/

import { EventEmitter } from 'events';
import { getServiceRegistry } from './service-registry';

export interface Event {
  id: string;
  type: string;
  source: string;
  payload: any;
  timestamp: Date;
  metadata?: {
    userId?: string;
    sessionId?: string;
    correlationId?: string;
  };
}

export interface EventSubscription {
  id: string;
  eventType: string;
  handler: (event: Event) => Promise<void> | void;
  filter?: (event: Event) => boolean;
}

/**
 * Event Bus Service - Azora Nexus Integration
 */
export class EventBusService extends EventEmitter {
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private eventHistory: Event[] = [];
  private maxHistorySize: number = 1000;

  constructor() {
    super();
    this.setupDefaultHandlers();
  }

  /**
   * Setup default event handlers
   */
  private setupDefaultHandlers(): void {
    // Log all events
    this.on('*', (event: Event) => {
      this.addToHistory(event);
    });
  }

  /**
   * Publish event
   */
  async publish(eventType: string, payload: any, metadata?: Event['metadata']): Promise<void> {
    const event: Event = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      source: metadata?.sessionId || 'system',
      payload,
      timestamp: new Date(),
      metadata,
    };

    // Emit to local subscribers
    this.emit(eventType, event);
    this.emit('*', event);

    // Forward to Azora Nexus if available
    await this.forwardToNexus(event);

    // Notify subscribers
    await this.notifySubscribers(event);
  }

  /**
   * Subscribe to event type
   */
  subscribe(
    eventType: string,
    handler: (event: Event) => Promise<void> | void,
    filter?: (event: Event) => boolean
  ): string {
    const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    const subscription: EventSubscription = {
      id: subscriptionId,
      eventType,
      handler,
      filter,
    };

    this.subscriptions.get(eventType)!.push(subscription);

    // Also listen to emitter
    this.on(eventType, async (event: Event) => {
      if (!filter || filter(event)) {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      }
    });

    return subscriptionId;
  }

  /**
   * Unsubscribe from event type
   */
  unsubscribe(subscriptionId: string): boolean {
    for (const [eventType, subscriptions] of this.subscriptions.entries()) {
      const index = subscriptions.findIndex(s => s.id === subscriptionId);
      if (index !== -1) {
        subscriptions.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Notify subscribers
   */
  private async notifySubscribers(event: Event): Promise<void> {
    const subscribers = this.subscriptions.get(event.type) || [];
    
    for (const subscription of subscribers) {
      if (!subscription.filter || subscription.filter(event)) {
        try {
          await subscription.handler(event);
        } catch (error) {
          console.error(`Error in subscription handler:`, error);
        }
      }
    }
  }

  /**
   * Forward event to Azora Nexus
   */
  private async forwardToNexus(event: Event): Promise<void> {
    try {
      const serviceRegistry = getServiceRegistry();
      const nexusService = serviceRegistry.getService('azora-nexus');
      
      if (nexusService && nexusService.health === 'healthy') {
        const nexusUrl = `${nexusService.url}:${nexusService.port}`;
        
        await fetch(`${nexusUrl}/api/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }).catch(() => {
          // Silently fail if Nexus is unavailable
        });
      }
    } catch (error) {
      // Silently fail if forwarding fails
    }
  }

  /**
   * Add event to history
   */
  private addToHistory(event: Event): void {
    this.eventHistory.push(event);
    
    // Keep history size manageable
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Get event history
   */
  getEventHistory(eventType?: string, limit: number = 100): Event[] {
    let history = this.eventHistory;
    
    if (eventType) {
      history = history.filter(e => e.type === eventType);
    }
    
    return history.slice(-limit);
  }

  /**
   * Get subscription count
   */
  getSubscriptionCount(eventType?: string): number {
    if (eventType) {
      return this.subscriptions.get(eventType)?.length || 0;
    }
    
    return Array.from(this.subscriptions.values()).reduce((sum, subs) => sum + subs.length, 0);
  }
}

// Export singleton instance
export const eventBus = new EventBusService();

export default eventBus;
