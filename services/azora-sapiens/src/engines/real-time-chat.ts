import OpenAI from 'openai';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  sessionId: string;
  studentId: string;
  subject: string;
  messages: ChatMessage[];
  startTime: Date;
  active: boolean;
}

interface ChatResponse {
  message: string;
  suggestions: string[];
  resources: string[];
}

class RealTimeChatEngine {
  private openai: OpenAI;
  private sessions: Map<string, ChatSession> = new Map();

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async startSession(studentId: string, subject: string): Promise<string> {
    const sessionId = `chat_${studentId}_${Date.now()}`;
    
    this.sessions.set(sessionId, {
      sessionId,
      studentId,
      subject,
      messages: [{
        role: 'system',
        content: `You are Elara, an AI tutor specializing in ${subject}. Use Ubuntu philosophy: "I can because we can". Be encouraging, patient, and adaptive.`,
        timestamp: new Date(),
      }],
      startTime: new Date(),
      active: true,
    });

    return sessionId;
  }

  async sendMessage(sessionId: string, userMessage: string): Promise<ChatResponse> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.active) {
      throw new Error('Invalid or inactive session');
    }

    session.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = session.messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = response.choices[0].message.content || 'I apologize, I could not generate a response.';

    session.messages.push({
      role: 'assistant',
      content: assistantMessage,
      timestamp: new Date(),
    });

    return {
      message: assistantMessage,
      suggestions: this.generateSuggestions(userMessage, session.subject),
      resources: this.recommendResources(session.subject),
    };
  }

  getSessionHistory(sessionId: string): ChatMessage[] {
    const session = this.sessions.get(sessionId);
    return session ? session.messages.filter(m => m.role !== 'system') : [];
  }

  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.active = false;
    }
  }

  private generateSuggestions(message: string, subject: string): string[] {
    const suggestions = [
      `Can you explain more about ${subject}?`,
      'Can you give me an example?',
      'What are the key concepts I should focus on?',
      'How can I practice this?',
    ];
    return suggestions.slice(0, 3);
  }

  private recommendResources(subject: string): string[] {
    return [
      `${subject} fundamentals course`,
      `Interactive ${subject} exercises`,
      `${subject} practice problems`,
    ];
  }
}

export default new RealTimeChatEngine();
