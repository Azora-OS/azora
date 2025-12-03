import { createClient, RedisClientType } from 'redis';

interface Event {
  type: string;
  source: string;
  timestamp: Date;
  data: any;
  id?: string;
}

interface EventHandler {
  (event: Event): Promise<void> | void;
}

class EventBus {
  private publisher: RedisClientType | null = null;
  private subscriber: RedisClientType | null = null;
  private serviceName: string;
  private handlers: Map<string, EventHandler[]> = new Map();
  private deadLetterQueue: Event[] = [];

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  async connect(redisUrl: string) {
    this.publisher = createClient({ url: redisUrl });
    this.subscriber = createClient({ url: redisUrl });

    this.publisher.on('error', (err) => console.error('Publisher error:', err));
    this.subscriber.on('error', (err) => console.error('Subscriber error:', err));

    await this.publisher.connect();
    await this.subscriber.connect();

    await this.subscriber.subscribe('azora-events', (message) => this.handleMessage(message));
  }

  private async handleMessage(message: string) {
    try {
      const event: Event = JSON.parse(message);
      const handlers = this.handlers.get(event.type) || [];
      
      for (const handler of handlers) {
        try {
          await Promise.resolve(handler(event));
        } catch (err) {
          console.error(`Handler error for ${event.type}:`, err);
          this.deadLetterQueue.push(event);
        }
      }
    } catch (err) {
      console.error('Message parse error:', err);
    }
  }

  async publish(type: string, data: any) {
    const event: Event = {
      type,
      source: this.serviceName,
      timestamp: new Date(),
      data,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    try {
      await this.publisher!.publish('azora-events', JSON.stringify(event));
    } catch (err) {
      console.error('Publish error:', err);
      this.deadLetterQueue.push(event);
    }
  }

  subscribe(type: string, handler: EventHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }

  async getDeadLetterQueue() {
    return this.deadLetterQueue;
  }

  async clearDeadLetterQueue() {
    this.deadLetterQueue = [];
  }

  async disconnect() {
    if (this.publisher) await this.publisher.disconnect();
    if (this.subscriber) await this.subscriber.disconnect();
  }
}

export { EventBus, Event, EventHandler };
