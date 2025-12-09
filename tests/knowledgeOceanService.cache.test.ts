import KnowledgeOceanService from '../azstudio/src/vs/workbench/services/azora/knowledgeOceanService';

describe('Knowledge Ocean caching', () => {
  it('should cache snippets for subsequent queries within TTL', async () => {
    const svc = new KnowledgeOceanService();
    // spy querySnippets implementation
    const spy = jest.spyOn(KnowledgeOceanService.prototype, 'querySnippets');
    spy.mockResolvedValue([{ id: 'doc1', title: 'Doc1', snippet: 'Hello', source: 'local://doc1' }] as any);

    const a = await svc.tryAnswer('hello');
    const b = await svc.tryAnswer('hello');
    expect(a).toBeDefined();
    expect(b).toBeDefined();
    // querySnippets should have been called only once due to caching
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
