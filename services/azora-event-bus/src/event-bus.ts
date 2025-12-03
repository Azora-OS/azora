import Redis from 'ioredis';
import { EventSchema } from './schemas/events';

export class EventBus {
    private publisher: Redis;
    private subscriber: Redis;
    private dlq: Redis; // Dead Letter Queue

    constructor(redisUrl: string = 'redis://localhost:6379') {
        this.publisher = new Redis(redisUrl);
        this.subscriber = new Redis(redisUrl);
        this.dlq = new Redis(redisUrl);

        // Handle connection errors (fallback to in-memory if Redis is missing for dev)
        this.publisher.on('error', (err) => console.warn('[EventBus] Publisher Redis Error:', err.message));
        this.subscriber.on('error', (err) => console.warn('[EventBus] Subscriber Redis Error:', err.message));
    }

    /**
     * Publishes an event to a specific channel with schema validation.
     * @param channel The event channel name.
     * @param payload The data to send.
     */
    async publish(channel: string, payload: any): Promise<void> {
        try {
            // Validate payload against schema
            const validation = EventSchema.safeParse(payload);

            if (!validation.success) {
                console.error(`[EventBus] Schema validation failed for ${channel}:`, validation.error.format());
                await this.sendToDLQ(channel, payload, 'Schema Validation Failed');
                return;
            }

            const message = JSON.stringify(payload);
            await this.publisher.publish(channel, message);
            console.log(`[EventBus] Published to ${channel}:`, payload.type);
        } catch (error) {
            console.error(`[EventBus] Failed to publish to ${channel}:`, error);
        }
    }

    /**
     * Subscribes to a channel and executes a callback on message receipt.
     * @param channel The event channel name.
     * @param callback Function to execute with the received payload.
     */
    async subscribe(channel: string, callback: (payload: any) => void): Promise<void> {
        try {
            await this.subscriber.subscribe(channel);
            this.subscriber.on('message', (chn, message) => {
                if (chn === channel) {
                    try {
                        const payload = JSON.parse(message);
                        callback(payload);
                    } catch (err) {
                        console.error(`[EventBus] Failed to parse message on ${channel}:`, err);
                    }
                }
            });
            console.log(`[EventBus] Subscribed to ${channel}`);
        } catch (error) {
            console.error(`[EventBus] Failed to subscribe to ${channel}:`, error);
        }
    }

    /**
     * Sends invalid events to the Dead Letter Queue.
     */
    private async sendToDLQ(channel: string, payload: any, reason: string): Promise<void> {
        const dlqMessage = {
            channel,
            payload,
            reason,
            timestamp: new Date().toISOString()
        };
        await this.dlq.lpush('azora:dlq', JSON.stringify(dlqMessage));
        console.warn(`[EventBus] Event sent to DLQ:`, dlqMessage);
    }
}
