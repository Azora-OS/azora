import { getAzoraAgentRegistry } from '../../../src/vs/workbench/services/azora/agentRegistryService';

function generateId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export type ChatMessage = { id: string; role: 'user' | 'agent' | 'system'; content: string; timestamp: number; metadata?: any };
export type AgentSession = { id: string; agentId: string; messages: ChatMessage[]; createdAt: number };

class AgentSessionManager {
  private sessions: Map<string, AgentSession> = new Map();

  createSession(agentId: string): AgentSession {
    const id = generateId('sess_');
    const s: AgentSession = { id, agentId, messages: [], createdAt: Date.now() };
    this.sessions.set(id, s);
    return s;
  }

  listSessions(): AgentSession[] {
    return Array.from(this.sessions.values());
  }

  async sendMessage(sessionId: string, message: string): Promise<ChatMessage> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    const msg: ChatMessage = { id: generateId('msg_'), role: 'user', content: message, timestamp: Date.now() };
    session.messages.push(msg);

    // Invoke agent and append response
    const registry = getAzoraAgentRegistry();
    const resp = await registry.invokeAgent(session.agentId, message);
    const agentMsg: ChatMessage = { id: generateId('msg_'), role: 'agent', content: resp.content, timestamp: Date.now(), metadata: resp.metadata };
    session.messages.push(agentMsg);
    return agentMsg;
  }

  getSession(sessionId: string): AgentSession | undefined {
    return this.sessions.get(sessionId);
  }
}

export const agentSessionManager = new AgentSessionManager();
export default agentSessionManager;
