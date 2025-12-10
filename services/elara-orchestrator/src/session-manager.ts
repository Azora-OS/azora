/**
 * Session Manager
 * Manages conversation sessions and history
 */

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export class Session {
  id: string;
  createdAt: Date;
  history: Message[] = [];
  metadata: Record<string, unknown> = {};

  constructor(id: string) {
    this.id = id;
    this.createdAt = new Date();
  }

  addMessage(message: Message) {
    this.history.push({
      ...message,
      timestamp: message.timestamp || new Date()
    });
  }
}

export class SessionManager {
  private sessions: Map<string, Session> = new Map();

  getOrCreateSession(sessionId?: string): Session {
    const id = sessionId || this.generateId();

    if (this.sessions.has(id)) {
      return this.sessions.get(id)!;
    }

    const session = new Session(id);
    this.sessions.set(id, session);
    return session;
  }

  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  private generateId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
