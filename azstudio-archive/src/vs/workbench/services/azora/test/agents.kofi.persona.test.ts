import { getAzoraAgentRegistry } from '../agentRegistryService';
// Ensure kofi service is loaded and registers itself when imported
import '../../agents/kofiService';

describe('Kofi agent persona context', () => {
  test('Kofi receives `agentMetadata` context during invocation', async () => {
    const registry = getAzoraAgentRegistry();
    registry.clear();
    // Ensure the agent is registered
    registry.registerAgent({ id: 'azora.kofi', name: 'kofi', fullName: 'KOFI — Math Maestro', systemPrompt: 'You are Kofi! Explain math like a professor.' }, {
      invoke: async (prompt: string, context?: any) => ({ content: `received persona: ${context?.agentMetadata?.systemPrompt || 'none'}`, agentId: 'azora.kofi' }),
    } as any);

    const res = await registry.invokeAgent('azora.kofi', 'what is 2+2?');
    expect(res.content).toMatch(/You are Kofi/);
  });
});
