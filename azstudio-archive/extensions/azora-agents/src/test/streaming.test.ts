import { getAzoraAgentRegistry } from '../../../src/vs/workbench/services/azora/agentRegistryService';
import { KofiService } from '../../../src/vs/workbench/services/azora/agents/kofiService';

describe('Agent streaming', () => {
  it('should stream chunks from Kofi', async () => {
    const registry = getAzoraAgentRegistry();
    if ((registry as any).clear) (registry as any).clear();
    new KofiService();
    let collected = '';
    await registry.invokeAgentStreaming('azora.kofi', 'test prompt', (chunk: string) => { collected += chunk; });
    expect(collected.length).toBeGreaterThan(0);
    expect(collected).toContain('Step 1:');
  });
});
