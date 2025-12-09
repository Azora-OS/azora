jest.mock('ioredis', () => require('ioredis-mock'));
import IngestionQueue from '../ingestionQueue';
import { KnowledgeOceanService } from '../knowledgeOceanService';

describe('Redis ingestion queue', () => {
  test('enqueue into redis and process in priority order', async () => {
    process.env.AZORA_INGESTION_QUEUE_BACKEND = 'redis';
    process.env.REDIS_URL = 'redis://127.0.0.1:6379';
    const queue = new IngestionQueue();
    const spy = jest.spyOn(KnowledgeOceanService.prototype, 'indexLocal').mockImplementation(async (docs: any[]) => {} as any);
    queue.enqueue({ id: 'job-low', docs: [{ id: 'j1', title: 't', content: 'c' }], priority: 100 });
    queue.enqueue({ id: 'job-high', docs: [{ id: 'j2', title: 't2', content: 'c2' }], priority: 10 });
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(spy).toHaveBeenCalled();
    // First processed should correspond to job-high due to higher priority (lower number)
    expect(spy.mock.calls[0][0][0].id).toBe('j2');
    spy.mockRestore();
    delete process.env.AZORA_INGESTION_QUEUE_BACKEND; delete process.env.REDIS_URL;
  });
});
