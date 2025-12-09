import { registerSingleton, InstantiationType } from '../../../platform/instantiation/common/simpleExtensions';
import StorageService from '../azora/storageService';

export const IChatSessionsService = Symbol('IChatSessionsService');

export type ChatSessionMessage = { role: 'user' | 'agent' | 'system'; content: string; timestamp?: number };
export type ChatSession = { id: string; agentId: string; messages: ChatSessionMessage[]; createdAt: number; userContext?: any; state?: 'active' | 'archived' };

export interface IChatSessionsService {
  createSession(agentId: string, userContext?: any): ChatSession;
  listSessions(): ChatSession[];
  sendMessage(sessionId: string, message: string): Promise<{ content: string; metadata?: any }>;
  sendMessageWithProgress(sessionId: string, message: string, onChunk: (chunk: string, metadata?: any) => Promise<void> | void): Promise<{ content: string; metadata?: any }>;
  getSession(sessionId: string): ChatSession | undefined;
  archiveSession(sessionId: string): void;
  updateSessionContext(sessionId: string, context: any): void;
}

class ChatSessionsService implements IChatSessionsService {
  private sessions: Map<string, ChatSession> = new Map();
  private storage: StorageService;
  private genId(prefix=''): string { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

  constructor() {
    this.storage = new StorageService();
    this.initialize();
  }

  private async initialize() {
    const persisted = await this.storage.readJson<ChatSession[]>('chatSessions.json');
    if (persisted && Array.isArray(persisted)) {
      for (const s of persisted) {
        s.messages = (s.messages || []).map(m => ({ ...m, timestamp: m.timestamp || Date.now() }));
        this.sessions.set(s.id, s);
      }
    }
  }

  createSession(agentId: string, userContext?: any): ChatSession {
    const id = this.genId('s_');
    const s: ChatSession = { id, agentId, messages: [], createdAt: Date.now(), userContext, state: 'active' };
    this.sessions.set(id, s);
    this.persistSessions();
    return s;
  }

  listSessions(): ChatSession[] { 
    return Array.from(this.sessions.values());
  }

  async sendMessage(sessionId: string, message: string): Promise<{ content: string; metadata?: any }> {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error('Session not found');
    s.messages.push({ role: 'user', content: message, timestamp: Date.now() });
    // We rely on ChatAgentService or agentRegistry for actual agent execution
    const registry = require('../azora/agentRegistryService').getAzoraAgentRegistry();
    const resp = await registry.invokeAgent(s.agentId, message);
    s.messages.push({ role: 'agent', content: resp.content, timestamp: Date.now() });
    this.persistSessions();
    return { content: resp.content, metadata: resp.metadata };
  }

  async sendMessageWithProgress(sessionId: string, message: string, onChunk: (chunk: string, metadata?: any) => Promise<void> | void): Promise<{ content: string; metadata?: any }> {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error('Session not found');
    s.messages.push({ role: 'user', content: message, timestamp: Date.now() });
    const registry = require('../azora/agentRegistryService').getAzoraAgentRegistry();
    let finalContent = '';
    await registry.invokeAgentStreaming(s.agentId, message, async (chunk: string, metadata?: any) => {
      finalContent += chunk;
      // Store incremental messages as agent fragments
      s.messages.push({ role: 'agent', content: chunk, timestamp: Date.now() });
      await onChunk(chunk, metadata);
    });
    this.persistSessions();
    return { content: finalContent, metadata: {} };
  }

  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  archiveSession(sessionId: string): void {
    const s = this.sessions.get(sessionId);
    if (s) {
      s.state = 'archived';
      this.persistSessions();
    }
  }

  updateSessionContext(sessionId: string, context: any): void {
    const s = this.sessions.get(sessionId);
    if (s) {
      s.userContext = { ...s.userContext, ...context };
      this.persistSessions();
    }
  }

  private persistSessions(): void {
    try { 
      void this.storage.writeJson('chatSessions.json', Array.from(this.sessions.values())); 
    } catch (e) { /* ignore */ }
  }
}

registerSingleton(IChatSessionsService as any, ChatSessionsService as any, InstantiationType.Delayed);
// Provide global helper like other services
const globalChatSessionsService = new ChatSessionsService();
export function getChatSessionsService(): ChatSessionsService { return globalChatSessionsService; }

export default ChatSessionsService;
