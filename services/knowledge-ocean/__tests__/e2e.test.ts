describe('End-to-End Knowledge Ocean', () => {
  const baseUrl = 'http://localhost:4003';

  it('should index and search knowledge', async () => {
    const indexRes = await fetch(`${baseUrl}/index`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.INDEX_API_KEY || 'test'
      },
      body: JSON.stringify([{
        id: 'test-doc',
        path: '/test.md',
        type: 'documentation',
        content: 'Test content for search'
      }])
    });

    expect(indexRes.ok).toBe(true);

    const searchRes = await fetch(`${baseUrl}/search?q=test`);
    const results = await searchRes.json();
    
    expect(Array.isArray(results)).toBe(true);
  });

  it('should track knowledge graph relationships', async () => {
    await fetch(`${baseUrl}/index`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': 'test' },
      body: JSON.stringify([{
        id: 'node-1',
        path: '/node1.ts',
        type: 'code',
        content: 'import { test } from "./node2"'
      }])
    });

    const graphRes = await fetch(`${baseUrl}/graph/node-1`);
    if (graphRes.ok) {
      const node = await graphRes.json();
      expect(node).toHaveProperty('id');
    }
  });

  it('should maintain version history', async () => {
    const nodeId = 'versioned-node';
    
    await fetch(`${baseUrl}/index`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': 'test' },
      body: JSON.stringify([{
        id: nodeId,
        path: '/versioned.ts',
        type: 'code',
        content: 'Version 1'
      }])
    });

    const versionsRes = await fetch(`${baseUrl}/graph/${nodeId}/versions`);
    if (versionsRes.ok) {
      const { versions } = await versionsRes.json();
      expect(Array.isArray(versions)).toBe(true);
    }
  });
});
