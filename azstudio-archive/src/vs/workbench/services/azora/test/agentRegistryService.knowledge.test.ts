import { AzoraAgentRegistryService } from '../agentRegistryService';

describe('AzoraAgentRegistryService knowledge ocean integration', () => {
  test('invokeAgent uses Knowledge Ocean answer when available', async () => {
    const registry = new AzoraAgentRegistryService();
    registry.registerAgent({ id: 'azora.testing', name: 'test', fullName: 'Test Agent' }, {
      invoke: async (prompt: string) => ({ content: `Agent fallback: ${prompt}`, agentId: 'azora.testing' }),
    } as any);

    const res = await registry.invokeAgent('azora.testing', 'Introduction to Computer Science');
    expect(res.agentId).toBe('azora.testing');
    expect(res.content).toMatch(/Introduction to Computer Science/);
    expect(res.metadata?.model).toBe('knowledge-ocean');
  });

  test('invokeAgentStreaming yields knowledge ocean chunk when available', async () => {
    const registry = new AzoraAgentRegistryService();
    registry.registerAgent({ id: 'azora.testing2', name: 'test2', fullName: 'Test Agent 2' }, {
      invoke: async (prompt: string) => ({ content: `Agent fallback: ${prompt}`, agentId: 'azora.testing2' }),
    } as any);

    const chunks: string[] = [];
    const resp = await registry.invokeAgentStreaming('azora.testing2', 'Introduction to Computer Science', (chunk, metadata) => { chunks.push(chunk); });
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.join('')).toMatch(/Introduction to Computer Science/);
    expect((resp as any).metadata.model).toBe('knowledge-ocean');
  });
});
