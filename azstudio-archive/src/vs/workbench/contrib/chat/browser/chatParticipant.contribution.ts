import { getAzoraAgentRegistry } from '../../services/azora/agentRegistryService';
import { getChatAgentService } from '../../services/chat/chatAgentService';

// Lightweight chat participant contribution that maps Azora agents to workbench chat
export class ChatParticipantContribution {
  constructor() {
    try {
      const registry = getAzoraAgentRegistry();
      const chat = getChatAgentService();
      const agents = registry.listAgents();
      for (const a of agents) {
        chat.registerAgent({ id: a.id, name: a.name, description: a.fullName || a.description }, { invoke: (m: string) => registry.invokeAgent(a.id, m) });
      }
      // subscribe for future agents
      if ((registry as any).onDidRegisterAgent) {
        (registry as any).onDidRegisterAgent((meta: any) => {
          chat.registerAgent({ id: meta.id, name: meta.name, description: meta.fullName || meta.description }, { invoke: (m: string) => registry.invokeAgent(meta.id, m) });
        });
      }
    } catch (err) {
      // If DI isn't ready, ignore: the extension will do the manually in its activation
    }
  }
}

new ChatParticipantContribution();
