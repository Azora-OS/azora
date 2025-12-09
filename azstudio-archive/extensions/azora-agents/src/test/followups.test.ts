import { getAzoraAgentRegistry } from '../../../src/vs/workbench/services/azora/agentRegistryService';
import { KofiService } from '../../../src/vs/workbench/services/azora/agents/kofiService';

describe('Agent followups', () => {
  it('should provide followup options for Kofi', async () => {
    const registry = getAzoraAgentRegistry();
    if ((registry as any).clear) (registry as any).clear();
    new KofiService();
    const followups = await registry.getFollowups('azora.kofi', { content: 'some result' });
    expect(Array.isArray(followups)).toBeTruthy();
    expect(followups.length).toBeGreaterThan(0);
    expect(followups[0].title).toBeDefined();
  });
});
