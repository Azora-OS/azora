import { getAzoraAgentRegistry } from '../../services/azora/agentRegistryService';
import { IChatAgentService, IChatAgentData } from '../../services/chat/common';
import { IAzoraAgentRegistry } from '../../services/azora/common';
import { AzoraAgentImplementation } from '../../services/azora/common';
import { getChatAgentService } from '../../services/chat/chatAgentService';

export class AzoraChatAgentBridge {
  private registry: IAzoraAgentRegistry;
  private chatService: IChatAgentService | null = null;

  constructor() {
    this.registry = getAzoraAgentRegistry();
    // Defer chatService acquisition in case it's not yet available
    try {
      this.chatService = getChatAgentService();
    } catch (err) {
      this.chatService = null;
    }

    // Register current agents
    for (const a of this.registry.listAgents()) {
      this.registerAgentWithChatService(a);
    }

    // Subscribe to new agent registrations
    try {
      if ((this.registry as any).onDidRegisterAgent) {
        (this.registry as any).onDidRegisterAgent((meta: IChatAgentData) => {
          this.registerAgentWithChatService(meta as any);
        });
      }
    } catch (err) {
      // ignore
    }

    // Manual approach: There's no registry change event; future improvement could add subscriptions
  }

  private registerAgentWithChatService(agent: IChatAgentData) {
    if (!this.chatService) return;
    const impl: AzoraAgentImplementation = {
      invoke: (msg: string, ctx?: any) => this.registry.invokeAgent(agent.id, msg, ctx),
    };
    this.chatService.registerAgent(agent as IChatAgentData, impl as any);
  }
}

// instantiate bridge so it runs on boot
new AzoraChatAgentBridge();
