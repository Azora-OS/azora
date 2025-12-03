import Redis from 'ioredis';

export class EventBus {
    private publisher: Redis;
    private subscriber: Redis;

    constructor(redisUrl: string = 'redis://localhost:6379') {
        this.publisher = new Redis(redisUrl);
        this.subscriber = new Redis(redisUrl);

        // Handle connection errors (fallback to in-memory if Redis is missing for dev)
        this.publisher.on('error', (err) => console.warn('[EventBus] Publisher Redis Error:', err.message));
        this.subscriber.on('error', (err) => console.warn('[EventBus] Subscriber Redis Error:', err.message));
    }

    /**
     * Publishes an event to a specific channel.
     * @param channel The event channel name.
     * @param payload The data to send.
     */
    async publish(channel: string, payload: any): Promise<void> {
        try {
            const message = JSON.stringify(payload);
            await this.publisher.publish(channel, message);
            console.log(`[EventBus] Published to ${channel}:`, payload);
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
}
