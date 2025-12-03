import axios from 'axios';

export interface Event {
    id: string;
    type: string;
    payload: any;
    timestamp: string;
}

export interface Subscription {
    serviceUrl: string;
    events: string[];
}

export class EventBus {
    private subscribers: Subscription[] = [];
    private deadLetterQueue: Event[] = [];

    subscribe(serviceUrl: string, events: string[]) {
        const existing = this.subscribers.find(s => s.serviceUrl === serviceUrl);
        if (existing) {
            existing.events = [...new Set([...existing.events, ...events])];
        } else {
            this.subscribers.push({ serviceUrl, events });
        }
        console.log(`📢 Service ${serviceUrl} subscribed to: ${events.join(', ')}`);
    }

    async publish(event: Omit<Event, 'id' | 'timestamp'>) {
        const fullEvent: Event = {
            ...event,
            id: `evt_${Date.now()}`,
            timestamp: new Date().toISOString()
        };

        console.log(`📨 Publishing event: ${fullEvent.type}`);

        const targets = this.subscribers.filter(s => s.events.includes(fullEvent.type));

        for (const target of targets) {
            try {
                await axios.post(`${target.serviceUrl}/events`, fullEvent);
            } catch (error: any) {
                console.error(`❌ Failed to deliver event to ${target.serviceUrl}:`, error.message);
                // Retry logic could go here
                this.deadLetterQueue.push(fullEvent);
            }
        }
    }

    getDeadLetterQueue() {
        return this.deadLetterQueue;
    }
}

export const eventBus = new EventBus();
