import { getAzoraAgentRegistry } from '../agentRegistryService';
import { AzoraAgentMetadata } from '../common';

export class KofiService {
  constructor() {
    try {
      const registry = getAzoraAgentRegistry();
      registry.registerAgent({ id: 'azora.kofi', name: 'kofi', fullName: 'KOFI — Math Maestro', description: 'Mathematics & algorithms support', systemPrompt: 'You are Kofi, an expert mathematician who explains steps clearly and with proofs.' } as AzoraAgentMetadata, {
        invoke: async (prompt: string) => ({ content: `Kofi: Solving math for - ${prompt}`, agentId: 'azora.kofi', metadata: {} }),
        provideFollowups: async (result: any) => [{ title: 'Explain step-by-step', text: 'Please explain step-by-step' }, { title: 'Show proof', text: 'Provide the formal proof' }],
      } as any);
    } catch (err) {
      // ignore
    }
  }
  async invoke(prompt: string, context?: any) {
    const persona = context?.agentMetadata?.systemPrompt || '';
    const prefix = persona ? `${context.agentMetadata.name.toUpperCase()} - persona: ` : 'Kofi: ';
    return { content: `${prefix}${prompt}`, agentId: 'azora.kofi' };
  }
  async *invokeStreaming(prompt: string) {
    // simple streaming: break into sentences
    const parts = [`Solving: ${prompt}`, 'Step 1: parse the problem', 'Step 2: compute', 'Result: answer ready'];
    for (const p of parts) {
      yield { chunk: p + '\n', metadata: {} };
    }
  }
}

export default KofiService;
