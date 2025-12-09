import { IChatAgentService, IChatAgentData, ChatAgentImplementation } from './common';
import { registerSingleton, InstantiationType } from '../../platform/instantiation/common/simpleExtensions.js';

export class ChatAgentService implements IChatAgentService {
  private agents: Map<string, { data: IChatAgentData; impl: ChatAgentImplementation }> = new Map();

  registerAgent(agent: IChatAgentData, impl: ChatAgentImplementation): void {
    this.agents.set(agent.id, { data: agent, impl });
  }

  listAgents(): IChatAgentData[] {
    return Array.from(this.agents.values()).map(v => v.data);
  }

  async invokeAgent(id: string, message: string, context?: any): Promise<{ content: string; metadata?: any }> {
    const entry = this.agents.get(id);
    if (!entry) throw new Error(`Chat agent not found: ${id}`);
    return entry.impl.invoke(message, context);
  }
}

registerSingleton(IChatAgentService as any, ChatAgentService as any, InstantiationType.Delayed);
// Provide a global instance for non-DI code usage (similar to `getAzoraAgentRegistry`)
const globalChatAgentService = new ChatAgentService();
export function getChatAgentService(): ChatAgentService { return globalChatAgentService; }

export default ChatAgentService;
