jest.mock('ioredis', () => require('ioredis-mock'));
import RedisIngestionQueue from '../redisIngestionQueue';

describe('RedisIngestionQueue unit', () => {
  test('zadd and zpopmin order enforced by priority', async () => {
    const q = new RedisIngestionQueue('redis://127.0.0.1:6379');
    await q.enqueue({ id: 'a' }, 100);
    await q.enqueue({ id: 'b' }, 10);
    const first = await q.dequeue();
    expect(first.id).toBe('b');
    const second = await q.dequeue();
    expect(second.id).toBe('a');
  });
});
