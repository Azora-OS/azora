import KnowledgeOceanService from '../knowledgeOceanService';

describe('KnowledgeOceanService relevance', () => {
  it('should return the most relevant snippet first', async () => {
    const svc = new KnowledgeOceanService();
    await svc.indexLocal([
      { id: 'n1', title: 'Sorting Overview', content: 'Sorting algorithms: quicksort, mergesort, bubblesort' },
      { id: 'n2', title: 'Trees in Depth', content: 'Binary trees, AVL trees, balancing techniques' }
    ]);
    const snippets = await svc.querySnippets('quicksort', 2);
    expect(snippets.length).toBeGreaterThanOrEqual(1);
    expect(snippets[0].title).toMatch(/sorting|quicksort/i);
  });
});
