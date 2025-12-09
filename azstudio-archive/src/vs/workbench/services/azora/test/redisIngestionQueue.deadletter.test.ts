jest.mock('ioredis', () => require('ioredis-mock'));
import IngestionQueue from '../ingestionQueue';
import { KnowledgeOceanService } from '../knowledgeOceanService';

describe('Redis IngestionQueue dead letter handling', () => {
  test('dead letter and retry with redis backend', async () => {
    process.env.AZORA_INGESTION_QUEUE_BACKEND = 'redis';
    process.env.AZORA_INGESTION_MAX_RETRIES = '1';
    const queue = new IngestionQueue();
    const spy = jest.spyOn(KnowledgeOceanService.prototype, 'indexLocal')
      .mockImplementationOnce(async () => { throw new Error('boom'); })
      .mockImplementationOnce(async () => { return; });
    const job = { id: 'rjob', docs: [{ id: 'd', content: 'C' }] } as any;
    queue.enqueue(job);
    await new Promise(resolve => setTimeout(resolve, 200));
    const dead = await queue.listDeadLetter();
    expect(dead.find(d => d.id === job.id)).toBeTruthy();
    const ok = await queue.retry(job.id);
    expect(ok).toBeTruthy();
    await new Promise(resolve => setTimeout(resolve, 200));
    const dead2 = await queue.listDeadLetter();
    expect(dead2.find(d => d.id === job.id)).toBeFalsy();
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });
});
