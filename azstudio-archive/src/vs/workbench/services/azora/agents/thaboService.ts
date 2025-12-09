import { getAzoraAgentRegistry } from '../agentRegistryService';
import { AzoraAgentMetadata } from '../common';

export class ThaboService {
  constructor() {
    try {
      const registry = getAzoraAgentRegistry();
      registry.registerAgent({ id: 'azora.thabo', name: 'thabo', fullName: 'THABO — DevOps & Infrastructure', description: 'Cloud, CI/CD, infra' } as AzoraAgentMetadata, {
        invoke: async (prompt: string) => ({ content: `Thabo: infra suggestion - ${prompt}`, agentId: 'azora.thabo', metadata: {} }),
      } as any);
    } catch (err) {}
  }
  async invoke(prompt: string) { return { content: `Thabo: ${prompt}`, agentId: 'azora.thabo' }; }
}

export default ThaboService;
