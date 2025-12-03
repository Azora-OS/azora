import { InMemoryIndexer } from '../src/indexer';
import { AIProviderRouter } from '../src/aiRouter';

describe('InMemoryIndexer', () => {
  it('indexes and finds content', async () => {
    const indexer = new InMemoryIndexer();
    const ai = new AIProviderRouter();
    const node = { id: 'a', path: 'a.txt', type: 'file', content: 'hello world' } as any;
    node.embedding = await ai.embedText(node.content);

    await indexer.indexNodes([node]);
    const results = await indexer.search('hello');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].embedding).toBeDefined();
  });
});
