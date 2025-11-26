/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

EVENT BUS SERVICE
Simple in-memory event bus for cross-component communication
*/

export interface EventPayload {
    [key: string]: any;
}

export interface Event {
    name: string;
    payload: EventPayload;
    timestamp: Date;
}

export type EventHandler = (payload: EventPayload) => void | Promise<void>;

export class EventBus {
    private handlers: Map<string, EventHandler[]> = new Map();
    private history: Event[] = [];
    private maxHistory: number = 1000;

    /**
     * Subscribe to an event
     */
    subscribe(eventName: string, handler: EventHandler): () => void {
        if (!this.handlers.has(eventName)) {
            this.handlers.set(eventName, []);
        }

        this.handlers.get(eventName)?.push(handler);

        // Return unsubscribe function
        return () => {
            const handlers = this.handlers.get(eventName);
            if (handlers) {
                const index = handlers.indexOf(handler);
                if (index > -1) {
                    handlers.splice(index, 1);
                }
            }
        };
    }

    /**
     * Publish an event
     */
    async publish(eventName: string, payload: EventPayload = {}): Promise<void> {
        const event: Event = {
            name: eventName,
            payload,
            timestamp: new Date()
        };

        // Add to history
        this.history.unshift(event);
        if (this.history.length > this.maxHistory) {
            this.history.pop();
        }

        // Notify subscribers
        const handlers = this.handlers.get(eventName);
        if (handlers) {
            await Promise.all(handlers.map(handler => {
                try {
                    return Promise.resolve(handler(payload));
                } catch (error) {
                    console.error(`Error in event handler for ${eventName}:`, error);
                    return Promise.resolve();
                }
            }));
        }
    }

    /**
     * Get event history
     */
    getEventHistory(eventName?: string): Event[] {
        if (eventName) {
            return this.history.filter(e => e.name === eventName);
        }
        return [...this.history];
    }

    /**
     * Clear history
     */
    clearHistory(): void {
        this.history = [];
    }
}

// Export singleton instance
export const eventBus = new EventBus();
export default eventBus;
