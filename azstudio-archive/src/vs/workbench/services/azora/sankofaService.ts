import { IAzoraAgentRegistry } from './common';
import { getAzoraAgentRegistry } from './agentRegistryService';

// Minimal Sankofa service — stubbed for now
export class SankofaService {
  constructor() {
    try {
      const registry = getAzoraAgentRegistry();
      registry.registerAgent({ id: 'azora.sankofa', name: 'sankofa', fullName: 'SANKOFA — Code Architect', description: 'Architecture and debugging specialist' }, {
        invoke: async (prompt: string, ctx?: any) => ({ content: `Sankofa stub response to: ${prompt}`, agentId: 'azora.sankofa', metadata: {} }),
      });
    } catch (err) {
      // ignore
    }
  }

  async invoke(prompt: string) {
    return { content: `Sankofa stub response to: ${prompt}`, agentId: 'azora.sankofa', metadata: {} };
  }
}

export default SankofaService;
