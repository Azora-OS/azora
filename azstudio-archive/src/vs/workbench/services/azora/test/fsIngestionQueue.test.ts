import IngestionQueue from '../ingestionQueue';
import { KnowledgeOceanService } from '../knowledgeOceanService';

describe('FS IngestionQueue priority', () => {
  test('enqueue into fs queue processes high priority first', async () => {
    const queue = new IngestionQueue();
    const spy = jest.spyOn(KnowledgeOceanService.prototype, 'indexLocal').mockImplementation(async (docs: any[]) => {} as any);
    queue.enqueue({ id: 'job1', docs: [{ id: 'a', title: '1', content: 'x' }], priority: 100 });
    queue.enqueue({ id: 'job2', docs: [{ id: 'b', title: '2', content: 'y' }], priority: 10 });
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(spy.mock.calls[0][0][0].id).toBe('b');
    spy.mockRestore();
  });
});
