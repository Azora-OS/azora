/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/
class MockAzoraNexusEventBus {
    constructor() {
        this.subscribers = new Map();
    }
    subscribe(event, handler) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, []);
        }
        this.subscribers.get(event).push(handler);
        console.log(`Subscribed to event: ${event}`);
    }
    async publish(event, data) {
        const handlers = this.subscribers.get(event);
        if (handlers) {
            console.log(`Publishing event: ${event}`, data);
            for (const handler of handlers) {
                try {
                    await handler({ data, timestamp: new Date() });
                }
                catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            }
        }
    }
    unsubscribe(event, handler) {
        const handlers = this.subscribers.get(event);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
                console.log(`Unsubscribed from event: ${event}`);
            }
        }
    }
    async disconnect() {
        this.subscribers.clear();
        console.log('Event bus disconnected');
    }
}
export class EventBus extends MockAzoraNexusEventBus {
    constructor(url, name) {
        super();
        console.log(`Creating EventBus with URL: ${url}, name: ${name}`);
    }
}
export function createAzoraNexusEventBus(config) {
    console.log('Creating mock Azora Nexus Event Bus');
    return new MockAzoraNexusEventBus();
}
