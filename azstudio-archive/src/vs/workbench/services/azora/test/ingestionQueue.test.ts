import IngestionQueue from '../ingestionQueue';
import { KnowledgeOceanService } from '../knowledgeOceanService';

describe('IngestionQueue', () => {
  test('enqueue uses KnowledgeOcean indexLocal', async () => {
    const queue = new IngestionQueue();
    const spy = jest.spyOn(KnowledgeOceanService.prototype, 'indexLocal').mockImplementation(async (docs: any[]) => {} as any);
    queue.enqueue({ id: 'job1', docs: [{ id: 'x', title: 'T', content: 'C' }] });
    // wait a short time for processing
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('dead letter and retry behavior (FS backend)', async () => {
    process.env.AZORA_INGESTION_QUEUE_BACKEND = 'fs';
    process.env.AZORA_INGESTION_MAX_RETRIES = '1';
    const queue = new IngestionQueue();
    // first attempt throws
    const spy = jest.spyOn(KnowledgeOceanService.prototype, 'indexLocal')
      .mockImplementationOnce(async (docs: any[]) => { throw new Error('boom'); })
      .mockImplementationOnce(async (docs: any[]) => { return; });
    const job = { id: 'job-retry', docs: [{ id: 'x', content: 'C' }] } as any;
    queue.enqueue(job);
    await new Promise(resolve => setTimeout(resolve, 200));
    const dead = await queue.listDeadLetter();
    expect(dead.find(d => d.id === job.id)).toBeTruthy();
    // Now retry
    const ok = await queue.retry(job.id);
    expect(ok).toBeTruthy();
    await new Promise(resolve => setTimeout(resolve, 200));
    const dead2 = await queue.listDeadLetter();
    expect(dead2.find(d => d.id === job.id)).toBeFalsy();
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });
});
