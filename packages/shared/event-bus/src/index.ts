import EventEmitter from 'events';
import Redis from 'ioredis';

export class EventBus {
  private emitter = new EventEmitter();
  private redisPub: Redis | null = null;
  private redisSub: Redis | null = null;

  constructor() {
    if (process.env.USE_REDIS === 'true' && process.env.REDIS_URL) {
      this.redisPub = new Redis(process.env.REDIS_URL);
      this.redisSub = new Redis(process.env.REDIS_URL);
      this.redisSub.on('message', (channel, message) => {
        try { this.emitter.emit(channel, JSON.parse(message)); } catch { }
      });
    }
  }

  async publish(topic: string, payload: any) {
    if (this.redisPub) await this.redisPub.publish(topic, JSON.stringify(payload));
    this.emitter.emit(topic, payload);
  }

  subscribe(topic: string, handler: (payload: any) => void) {
    this.emitter.on(topic, handler);
    if (this.redisSub) this.redisSub.subscribe(topic);
  }

  unsubscribe(topic: string, handler: (payload: any) => void) {
    this.emitter.off(topic, handler);
    if (this.redisSub) this.redisSub.unsubscribe(topic);
  }
}
