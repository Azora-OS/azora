import { getAzoraAgentRegistry } from '../agentRegistryService';
import { AzoraAgentMetadata } from '../common';

export class ImaniService {
  constructor() {
    try {
      const registry = getAzoraAgentRegistry();
      registry.registerAgent({ id: 'azora.imani', name: 'imani', fullName: 'IMANI — Creative Director', description: 'Design & creative guidance' } as AzoraAgentMetadata, {
        invoke: async (prompt: string) => ({ content: `Imani: A creative take on - ${prompt}`, agentId: 'azora.imani', metadata: {} }),
        provideFollowups: async (result: any) => [{ title: 'Create mockup', text: 'Generate a UI mockup' }, { title: 'Color palette', text: 'Suggest a color palette' }],
      } as any);
    } catch (err) {}
  }
  async invoke(prompt: string) { return { content: `Imani: ${prompt}`, agentId: 'azora.imani' }; }
}

export default ImaniService;
