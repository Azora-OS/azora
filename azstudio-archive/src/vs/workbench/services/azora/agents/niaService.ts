import { getAzoraAgentRegistry } from '../agentRegistryService';
import { AzoraAgentMetadata } from '../common';

export class NiaService {
  constructor() {
    try {
      const registry = getAzoraAgentRegistry();
      registry.registerAgent({ id: 'azora.nia', name: 'nia', fullName: 'NIA — Data Scientist', description: 'Data analysis & ML help' } as AzoraAgentMetadata, {
        invoke: async (prompt: string) => ({ content: `Nia: Analysis for - ${prompt}`, agentId: 'azora.nia', metadata: {} }),
        provideFollowups: async (result: any) => [{ title: 'Show dataset stats', text: 'Give me dataset summary stats' }, { title: 'Model suggestion', text: 'Recommend a model architecture' }],
      } as any);
    } catch (err) {}
  }
  async invoke(prompt: string) { return { content: `Nia: ${prompt}`, agentId: 'azora.nia' }; }
}

export default NiaService;
