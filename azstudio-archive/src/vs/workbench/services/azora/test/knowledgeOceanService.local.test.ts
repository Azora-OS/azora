import KnowledgeOceanService from '../knowledgeOceanService';

describe('KnowledgeOceanService local integration', () => {
  test('indexLocal and getRelevantContext should return a relevant snippet', async () => {
    const svc = new KnowledgeOceanService();
    await svc.indexLocal([
      { id: 'n1', title: 'Data Structures', content: 'Arrays, lists, stacks, queues, trees and hash maps.' },
      { id: 'n2', title: 'Algo Excellence', content: 'Detailed explanation of sorting algorithms: quicksort, mergesort, heapsort.' },
    ]);
    const ctx = await svc.getRelevantContext('quicksort');
    expect(ctx).toMatch(/quicksort|sorting/i);
  });
});
