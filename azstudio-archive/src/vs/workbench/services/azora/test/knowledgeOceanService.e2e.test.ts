import KnowledgeOceanService from '../knowledgeOceanService';
import LocalVectorOcean from '../knowledgeOceanLocal';

describe('KnowledgeOceanService E2E', () => {
  it('should use local index and return provenance in snippets', async () => {
    const svc = new KnowledgeOceanService();
    // index a small doc and confirm it's queryable
    const docs = [{ id: 'doc1', title: 'Test Doc', content: 'This document explains how to open a test environment and includes sample code' }];
    await svc.indexLocal(docs as any);

    const answer = await svc.tryAnswer('How to open a test environment');
    expect(answer).toBeDefined();
    expect(answer).toContain('From Knowledge Ocean');
    expect(answer).toContain('Test Doc');
  });

  it('should redact emails and numbers and enforce provenance in context', async () => {
    const svc = new KnowledgeOceanService();
    const docs = [{ id: 'doc2', title: 'Secrets', content: 'Contact admin at secret@test.org or call 5551234567 to get access' }];
    await svc.indexLocal(docs as any);
    const ctx = await svc.getRelevantContext('how to get access', 1);
    expect(ctx).toContain('(source: local://doc2)');
    expect(ctx).toContain('[REDACTED_EMAIL]');
    expect(ctx).not.toContain('5551234567');
  });
});
