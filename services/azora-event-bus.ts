import { createClient } from 'redis';

export class EventBus {
    private publisher: any;
    private subscriber: any;
    private serviceName: string;
    private subscriptions: Map<string, Function[]> = new Map();

    constructor(url: string, serviceName: string) {
        this.serviceName = serviceName;
        this.publisher = createClient({ url });
        this.subscriber = createClient({ url });

        this.publisher.connect().catch(console.error);
        this.subscriber.connect().then(() => {
            this.setupSubscriber();
        }).catch(console.error);
    }

    private async setupSubscriber() {
        await this.subscriber.subscribe('azora-events', (message: string) => {
            try {
                const event = JSON.parse(message);
                const handlers = this.subscriptions.get(event.type);
                if (handlers) {
                    handlers.forEach(handler => handler(event));
                }
            } catch (err) {
                console.error('Error processing event:', err);
            }
        });
    }

    async publish(type: string, data: any) {
        const event = {
            type,
            source: this.serviceName,
            timestamp: new Date(),
            data
        };
        await this.publisher.publish('azora-events', JSON.stringify(event));
    }

    subscribe(type: string, handler: Function) {
        if (!this.subscriptions.has(type)) {
            this.subscriptions.set(type, []);
        }
        this.subscriptions.get(type)?.push(handler);
    }

    async disconnect() {
        await this.publisher.disconnect();
        await this.subscriber.disconnect();
    }
}
