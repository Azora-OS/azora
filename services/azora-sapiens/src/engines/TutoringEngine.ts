export interface TutoringSession {
  id: string;
  studentId: string;
  subject: string;
  messages: Message[];
  insights: string[];
  startedAt: Date;
  lastActivity: Date;
}

export interface Message {
  role: 'student' | 'tutor';
  content: string;
  timestamp: Date;
}

export class TutoringEngine {
  private sessions: Map<string, TutoringSession> = new Map();

  createSession(studentId: string, subject: string): TutoringSession {
    const session: TutoringSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      subject,
      messages: [],
      insights: [],
      startedAt: new Date(),
      lastActivity: new Date()
    };
    this.sessions.set(session.id, session);
    return session;
  }

  sendMessage(sessionId: string, content: string, role: 'student' | 'tutor'): Message {
    const session = this.sessions.get(sessionId);
    if (!session) {throw new Error('Session not found');}

    const message: Message = { role, content, timestamp: new Date() };
    session.messages.push(message);
    session.lastActivity = new Date();

    if (role === 'student') {
      const response = this.generateResponse(content, session);
      session.messages.push({ role: 'tutor', content: response, timestamp: new Date() });
    }

    return message;
  }

  private generateResponse(question: string, session: TutoringSession): string {
    const q = question.toLowerCase();
    
    if (q.includes('help') || q.includes('explain')) {
      return `Let me help you understand ${session.subject}. ${this.getSubjectGuidance(session.subject)}`;
    }
    if (q.includes('example')) {
      return `Here's an example for ${session.subject}: ${this.getExample(session.subject)}`;
    }
    if (q.includes('practice') || q.includes('exercise')) {
      return `Great! Let's practice. ${this.getPracticeQuestion(session.subject)}`;
    }
    
    return `I understand you're asking about "${question}". In ${session.subject}, this relates to fundamental concepts. Would you like me to break this down step by step?`;
  }

  private getSubjectGuidance(subject: string): string {
    const guidance: Record<string, string> = {
      math: 'Start with the basics: understand the problem, identify what you know, and work step by step.',
      science: 'Observe, hypothesize, experiment, and conclude. Science is about asking questions.',
      english: 'Focus on structure, clarity, and expression. Read widely and practice writing.',
      history: 'Connect events, understand causes and effects, and see patterns over time.',
      default: 'Break complex topics into smaller parts and master each one.'
    };
    return guidance[subject.toLowerCase()] || guidance.default;
  }

  private getExample(subject: string): string {
    const examples: Record<string, string> = {
      math: 'If you have 5 apples and get 3 more, you have 5 + 3 = 8 apples.',
      science: 'Water boils at 100°C because heat energy breaks molecular bonds.',
      english: 'A metaphor: "Time is money" compares two unlike things.',
      default: 'Let me provide a relevant example for your question.'
    };
    return examples[subject.toLowerCase()] || examples.default;
  }

  private getPracticeQuestion(subject: string): string {
    const questions: Record<string, string> = {
      math: 'Try this: What is 15 × 4? Show your work.',
      science: 'Question: What are the three states of matter?',
      english: 'Write a sentence using a simile.',
      default: 'Here\'s a practice question to test your understanding.'
    };
    return questions[subject.toLowerCase()] || questions.default;
  }

  getSession(sessionId: string): TutoringSession | undefined {
    return this.sessions.get(sessionId);
  }

  getStudentSessions(studentId: string): TutoringSession[] {
    return Array.from(this.sessions.values()).filter(s => s.studentId === studentId);
  }

  addInsight(sessionId: string, insight: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {session.insights.push(insight);}
  }
}
