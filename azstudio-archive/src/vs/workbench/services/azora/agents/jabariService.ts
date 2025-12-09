import { getAzoraAgentRegistry } from '../agentRegistryService';
import { AzoraAgentMetadata } from '../common';

export class JabariService {
  constructor() {
    try {
      const registry = getAzoraAgentRegistry();
      registry.registerAgent({ id: 'azora.jabari', name: 'jabari', fullName: 'JABARI — Business Strategist', description: 'Business strategy & monetization' } as AzoraAgentMetadata, {
        invoke: async (prompt: string) => ({ content: `Jabari: strategy on - ${prompt}`, agentId: 'azora.jabari', metadata: {} }),
      } as any);
    } catch (err) {}
  }
  async invoke(prompt: string) { return { content: `Jabari: ${prompt}`, agentId: 'azora.jabari' }; }
}

export default JabariService;
