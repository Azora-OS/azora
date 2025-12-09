import { IElaraAgentService, IAIOrchestrator, AzoraAgentMetadata } from './common';
import { getAzoraAgentRegistry } from './agentRegistryService';
import { registerSingleton, InstantiationType } from '../../../platform/instantiation/common/simpleExtensions.js';

export class ElaraService implements IElaraAgentService {
  private orchestrator: IAIOrchestrator | null = null;

  constructor() {
    // Register this agent with the global registry for discovery
    try {
      const registry = getAzoraAgentRegistry();
      const metadata: AzoraAgentMetadata = this.getMetadata();
      registry.registerAgent(metadata, {
        invoke: async (prompt: string, context?: any) => this.invoke(prompt),
      });
    } catch (err) {
      // Non-fatal if registry isn't available
      console.warn('[ElaraService] Failed to register with agent registry');
    }
  }

  async invoke(prompt: string): Promise<{ content: string; agentId?: string; metadata?: any }> {
    // Simple stub response for now
    return {
      content: `Hello from Elara! I received your prompt: "${prompt}". This is a placeholder response while the full implementation is being completed.`,
      agentId: 'azora.elara',
      metadata: { stub: true }
    };
  }

  getMetadata() {
    return {
      id: 'azora.elara',
      name: 'elara',
      fullName: 'ELARA — Master Orchestrator',
      systemPrompt: 'You are Elara, a master orchestrator who synthesizes knowledge and coordinates agents. Use clear educational tone.'
    };
  }
}

registerSingleton(IElaraAgentService as any, ElaraService as any, InstantiationType.Delayed);
