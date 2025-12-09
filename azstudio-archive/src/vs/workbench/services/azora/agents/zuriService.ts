import { getAzoraAgentRegistry } from '../agentRegistryService';
import { AzoraAgentMetadata } from '../common';

export class ZuriService {
  constructor() {
    try {
      const registry = getAzoraAgentRegistry();
      registry.registerAgent({ id: 'azora.zuri', name: 'zuri', fullName: 'ZURI — Science Sage', description: 'Natural sciences and experimental design' } as AzoraAgentMetadata, {
        invoke: async (prompt: string) => ({ content: `Zuri: research summary - ${prompt}`, agentId: 'azora.zuri', metadata: {} }),
      } as any);
    } catch (err) {}
  }
  async invoke(prompt: string) { return { content: `Zuri: ${prompt}`, agentId: 'azora.zuri' }; }
}

export default ZuriService;
