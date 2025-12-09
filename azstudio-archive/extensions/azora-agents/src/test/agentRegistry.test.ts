import { getAzoraAgentRegistry } from '../../../src/vs/workbench/services/azora/agentRegistryService';

describe('AzoraAgentRegistry', () => {
  it('should allow registering and invoking an agent', async () => {
    const registry = getAzoraAgentRegistry();
    // Reset registry to avoid test state leakage
    if ((registry as any).clear) (registry as any).clear();
    registry.registerAgent({ id: 'test.agent', name: 'tester' }, { invoke: async (prompt: string) => ({ content: `echo: ${prompt}`, agentId: 'test.agent' }) });
    const agents = registry.listAgents();
    expect(agents.some(a => a.id === 'test.agent')).toBeTruthy();
    const resp = await registry.invokeAgent('test.agent', 'hello');
    expect(resp.content).toBe('echo: hello');
  });
});
