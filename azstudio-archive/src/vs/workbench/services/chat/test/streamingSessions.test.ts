import { getChatSessionsService } from '../chatSessionsService';
import { getAzoraAgentRegistry } from '../../azora/agentRegistryService';
import { KofiService } from '../../azora/agents/kofiService';

describe('ChatSessionsService streaming', () => {
  it('should stream using sendMessageWithProgress', async () => {
    const registry = getAzoraAgentRegistry(); if ((registry as any).clear) (registry as any).clear();
    new KofiService();
    const sessions = getChatSessionsService();
    const s = sessions.createSession('azora.kofi');
    let collected = '';
    await sessions.sendMessageWithProgress(s.id, 'test prompt', (chunk) => { collected += chunk; });
    expect(collected.length).toBeGreaterThan(0);
    expect(collected).toContain('Step 1:');
  });
});
