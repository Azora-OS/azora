import { IElaraAgentService, IAzoraAgentRegistry, AzoraAgentMetadata } from '../../services/azora/common';
import { getChatSessionsService, ChatSession } from '../../services/chat/chatSessionsService';
import { getChatAgentService } from '../../services/chat/chatAgentService';
import { getAzoraAgentRegistry } from '../../services/azora/agentRegistryService';

export interface ChatParticipant {
  id: string;
  name: string;
  role: 'user' | 'agent' | 'system';
  agentMetadata?: AzoraAgentMetadata;
}

export interface InlineChatOptions {
  sessionId?: string;
  agentId?: string;
  participants?: ChatParticipant[];
  context?: { files?: any[]; metadata?: any };
  onProgress?: (status: { type: 'starting' | 'streaming' | 'complete'; chunk?: string; metadata?: any }) => void;
  onError?: (error: Error) => void;
}

// Full-featured Inline Chat controller with streaming, session management, and multi-agent support
export class AzoraInlineChatController {
  private registry: IAzoraAgentRegistry;
  private currentSession: ChatSession | null = null;
  private participants: Map<string, ChatParticipant> = new Map();

  constructor(registryOrAgent?: IAzoraAgentRegistry | any) {
    // Backwards compatible constructor: accept either a registry instance, or an agent implementation
    if (registryOrAgent && typeof registryOrAgent.invoke === 'function') {
      // It's an agent implementation (ElaraService); create a tiny adapter registry
      const agent = registryOrAgent;
      this.registry = {
        registerAgent: (meta: any, impl: any) => {},
        listAgents: () => [{ id: 'azora.elara', name: 'elara' }],
        invokeAgent: async (id: string, prompt: string) => agent.invoke(prompt),
        invokeAgentStreaming: async (id: string, prompt: string, onChunk: any) => {
          const resp = await agent.invoke(prompt);
          await onChunk(resp.content, resp.metadata);
          return resp;
        },
        onDidRegisterAgent: () => {},
      } as any;
    } else {
      this.registry = (registryOrAgent as IAzoraAgentRegistry) || getAzoraAgentRegistry();
    }
    this.initializeParticipants();
  }

  private initializeParticipants() {
    // Initialize built-in participants from registry
    for (const agent of this.registry.listAgents()) {
      this.participants.set(agent.id, {
        id: agent.id,
        name: agent.name,
        role: 'agent',
        agentMetadata: agent,
      });
    }
  }

  getParticipants(): ChatParticipant[] {
    return Array.from(this.participants.values());
  }

  addParticipant(participant: ChatParticipant): void {
    this.participants.set(participant.id, participant);
  }

  async startSession(agentId: string, userContext?: any): Promise<ChatSession> {
    const sessions = getChatSessionsService();
    this.currentSession = sessions.createSession(agentId);
    if (userContext) {
      this.currentSession.messages.push({
        role: 'system',
        content: JSON.stringify(userContext),
      });
    }
    return this.currentSession;
  }

  async sendMessage(prompt: string, options?: InlineChatOptions): Promise<{ content: string; sessionId: string; agentId: string; metadata?: any }> {
    let sessionId = options?.sessionId || this.currentSession?.id;
    let agentId = options?.agentId || this.currentSession?.agentId || 'azora.elara';

    if (!sessionId) {
      const newSession = await this.startSession(agentId, options?.context);
      sessionId = newSession.id;
    }

    const sessions = getChatSessionsService();
    try {
      if (options?.onProgress) {
        options.onProgress({ type: 'starting' });
      }

      // Use streaming if handler provided
      if (options?.onProgress) {
        let fullContent = '';
        await sessions.sendMessageWithProgress(sessionId, prompt, async (chunk: string, metadata?: any) => {
          fullContent += chunk;
          if (options.onProgress) {
            options.onProgress({ type: 'streaming', chunk, metadata });
          }
        });
        if (options.onProgress) {
          options.onProgress({ type: 'complete' });
        }
        return { content: fullContent, sessionId, agentId, metadata: {} };
      } else {
        const resp = await sessions.sendMessage(sessionId, prompt);
        return { content: resp.content, sessionId, agentId, metadata: resp.metadata };
      }
    } catch (err: any) {
      if (options?.onError) {
        options.onError(err);
      }
      throw err;
    }
  }

  async switchAgent(newAgentId: string): Promise<void> {
    if (!this.participants.has(newAgentId)) {
      throw new Error(`Agent not found: ${newAgentId}`);
    }
    if (!this.currentSession) {
      throw new Error('No active session');
    }
    this.currentSession.agentId = newAgentId;
    this.currentSession.messages.push({
      role: 'system',
      content: `[Agent switched to ${newAgentId}]`,
    });
  }

  getCurrentSession(): ChatSession | null {
    return this.currentSession;
  }

  async getSessionHistory(sessionId: string): Promise<ChatSession | undefined> {
    const sessions = getChatSessionsService();
    return sessions.getSession(sessionId);
  }

  async listAllSessions(): Promise<ChatSession[]> {
    const sessions = getChatSessionsService();
    return sessions.listSessions();
  }

  // Backwards compat: ask(prompt) instead of ask(agentId, prompt)
  async ask(agentOrPrompt: string, maybePrompt?: string, options?: InlineChatOptions) {
    let agentId: string;
    let prompt: string;
    if (maybePrompt === undefined) {
      // Only prompt passed, default to Elara
      agentId = 'azora.elara';
      prompt = agentOrPrompt;
    } else {
      agentId = agentOrPrompt;
      prompt = maybePrompt;
    }
    return this.sendMessage(prompt, { agentId, ...options });
  }
}
