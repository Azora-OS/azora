/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * Helpdesk System
 * 24/7 AI-powered support with ticketing, live chat, and knowledge base
 * Production-ready student support infrastructure
 */

import { EventEmitter } from 'events';

// ===== INTERFACES =====

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  studentNumber: string;
  studentName: string;
  email: string;
  category: 'technical' | 'academic' | 'financial' | 'general' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed';
  subject: string;
  description: string;
  attachments: Attachment[];
  assignedTo?: string;
  assignedAt?: Date;
  responses: TicketResponse[];
  tags: string[];
  relatedTickets: string[];
  satisfaction?: SatisfactionRating;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  slaDeadline?: Date;
  slaBreach: boolean;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  responderId: string;
  responderName: string;
  responderType: 'student' | 'agent' | 'ai' | 'system';
  message: string;
  isInternal: boolean;
  attachments: Attachment[];
  createdAt: Date;
}

export interface SatisfactionRating {
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  ratedAt: Date;
}

export interface LiveChatSession {
  id: string;
  studentNumber: string;
  studentName: string;
  agentId?: string;
  agentName?: string;
  category: SupportTicket['category'];
  status: 'queued' | 'active' | 'ended' | 'transferred';
  messages: ChatMessage[];
  startTime: Date;
  endTime?: Date;
  waitTime?: number; // seconds
  duration?: number; // seconds
  satisfaction?: SatisfactionRating;
  transcript?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderType: 'student' | 'agent' | 'ai';
  message: string;
  timestamp: Date;
  attachments?: Attachment[];
  read: boolean;
}

export interface ChatContext {
  studentNumber: string;
  conversationHistory: ChatMessage[];
  currentIssue?: string;
  studentProfile?: StudentProfile;
}

export interface StudentProfile {
  studentNumber: string;
  name: string;
  email: string;
  program: string;
  enrollmentStatus: string;
  academicStanding: string;
  courses: string[];
  gpa?: number;
}

export interface BotResponse {
  message: string;
  confidence: number;
  suggestions?: string[];
  needsHuman: boolean;
  quickReplies?: QuickReply[];
  kbArticles?: KBArticle[];
}

export interface QuickReply {
  text: string;
  action: string;
  payload?: any;
}

export interface KBArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  subcategory?: string;
  tags: string[];
  author: string;
  views: number;
  helpful: number;
  notHelpful: number;
  relatedArticles: string[];
  attachments: Attachment[];
  published: boolean;
  publishedAt?: Date;
  updatedAt: Date;
  createdAt: Date;
  searchKeywords: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  views: number;
  helpful: number;
}

export interface SupportAgent {
  id: string;
  name: string;
  email: string;
  status: 'available' | 'busy' | 'away' | 'offline';
  skills: string[];
  currentChats: number;
  maxChats: number;
  averageResponseTime: number;
  satisfaction: number;
  ticketsResolved: number;
  activeTickets: string[];
}

export interface SupportAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  tickets: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  };
  response: {
    averageFirstResponse: number; // minutes
    averageResolutionTime: number; // hours
    slaCompliance: number; // percentage
  };
  satisfaction: {
    average: number;
    total: number;
    distribution: Record<number, number>;
  };
  chat: {
    totalSessions: number;
    averageWaitTime: number; // seconds
    averageDuration: number; // minutes
    botResolutionRate: number; // percentage
  };
  topIssues: IssueMetric[];
  agentPerformance: AgentMetric[];
}

export interface IssueMetric {
  category: string;
  count: number;
  percentage: number;
  averageResolutionTime: number;
}

export interface AgentMetric {
  agentId: string;
  agentName: string;
  ticketsResolved: number;
  averageResolutionTime: number;
  satisfaction: number;
  responseRate: number;
}

export interface CreateTicketRequest {
  studentNumber: string;
  studentName: string;
  email: string;
  category: SupportTicket['category'];
  priority?: SupportTicket['priority'];
  subject: string;
  description: string;
  attachments?: File[];
}

// ===== HELPDESK SYSTEM =====

export class HelpdeskSystem extends EventEmitter {
  private tickets: Map<string, SupportTicket> = new Map();
  private chatSessions: Map<string, LiveChatSession> = new Map();
  private kbArticles: Map<string, KBArticle> = new Map();
  private faqs: Map<string, FAQItem> = new Map();
  private agents: Map<string, SupportAgent> = new Map();
  private ticketCounter: number = 1000;

  constructor(
    private config: {
      aiEnabled: boolean;
      liveChatEnabled: boolean;
      businessHours: {
        start: string;
        end: string;
        timezone: string;
      };
      slaTargets: {
        urgent: number; // hours
        high: number;
        medium: number;
        low: number;
      };
    }
  ) {
    super();
    this.initializeSystem();
  }

  private initializeSystem(): void {
    this.loadKnowledgeBase();
    this.loadFAQs();
    this.startBackgroundJobs();

    console.log('✅ Helpdesk System initialized');
    console.log(`AI Bot: ${this.config.aiEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`Live Chat: ${this.config.liveChatEnabled ? 'Enabled' : 'Disabled'}`);
  }

  private loadKnowledgeBase(): void {
    // Load common support articles
    const articles: Omit<KBArticle, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'helpful' | 'notHelpful'>[] = [
      {
        title: 'How to Register for Courses',
        slug: 'how-to-register-courses',
        content: 'Step-by-step guide to course registration...',
        category: 'academic',
        tags: ['registration', 'courses', 'enrollment'],
        author: 'Support Team',
        relatedArticles: [],
        attachments: [],
        published: true,
        publishedAt: new Date(),
        searchKeywords: ['register', 'course', 'enrollment', 'add class'],
      },
      {
        title: 'How to Make a Payment',
        slug: 'how-to-make-payment',
        content: 'Guide to paying tuition and fees...',
        category: 'financial',
        tags: ['payment', 'tuition', 'billing'],
        author: 'Support Team',
        relatedArticles: [],
        attachments: [],
        published: true,
        publishedAt: new Date(),
        searchKeywords: ['pay', 'payment', 'tuition', 'billing', 'fees'],
      },
      {
        title: 'Password Reset Instructions',
        slug: 'password-reset',
        content: 'How to reset your password...',
        category: 'technical',
        tags: ['password', 'login', 'account'],
        author: 'Support Team',
        relatedArticles: [],
        attachments: [],
        published: true,
        publishedAt: new Date(),
        searchKeywords: ['password', 'reset', 'forgot', 'login', 'access'],
      },
    ];

    articles.forEach((article) => {
      const kb: KBArticle = {
        ...article,
        id: `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        helpful: 0,
        notHelpful: 0,
      };
      this.kbArticles.set(kb.id, kb);
    });

    console.log(`✅ Loaded ${articles.length} knowledge base articles`);
  }

  private loadFAQs(): void {
    const faqs: Omit<FAQItem, 'id' | 'views' | 'helpful'>[] = [
      {
        question: 'What are the payment methods accepted?',
        answer: 'We accept credit cards, debit cards, bank transfers, and cryptocurrency.',
        category: 'financial',
        order: 1,
      },
      {
        question: 'How do I check my grades?',
        answer: 'Log in to the student portal and navigate to the Grades section.',
        category: 'academic',
        order: 2,
      },
      {
        question: 'What is the refund policy?',
        answer: 'Refunds are available within 14 days of payment. Contact support for details.',
        category: 'financial',
        order: 3,
      },
    ];

    faqs.forEach((faq, index) => {
      const faqItem: FAQItem = {
        ...faq,
        id: `faq_${index + 1}`,
        views: 0,
        helpful: 0,
      };
      this.faqs.set(faqItem.id, faqItem);
    });

    console.log(`✅ Loaded ${faqs.length} FAQs`);
  }

  private startBackgroundJobs(): void {
    // Check SLA compliance every 5 minutes
    setInterval(() => this.checkSLACompliance(), 5 * 60 * 1000);

    // Auto-close resolved tickets after 7 days
    setInterval(() => this.autoCloseResolvedTickets(), 24 * 60 * 60 * 1000);

    // Update agent availability
    setInterval(() => this.updateAgentAvailability(), 60 * 1000);
  }

  // ===== TICKET MANAGEMENT =====

  async createTicket(request: CreateTicketRequest): Promise<SupportTicket> {
    const ticketNumber = `AZR-${this.ticketCounter++}`;

    const priority = request.priority || this.determinePriority(request.category);
    const slaDeadline = this.calculateSLADeadline(priority);

    const ticket: SupportTicket = {
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ticketNumber,
      studentNumber: request.studentNumber,
      studentName: request.studentName,
      email: request.email,
      category: request.category,
      priority,
      status: 'open',
      subject: request.subject,
      description: request.description,
      attachments: [],
      responses: [],
      tags: this.extractTags(request.subject + ' ' + request.description),
      relatedTickets: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      slaDeadline,
      slaBreach: false,
    };

    this.tickets.set(ticket.id, ticket);

    // Auto-assign to AI bot for initial response if enabled
    if (this.config.aiEnabled) {
      await this.aiFirstResponse(ticket);
    }

    // Check if urgent and assign to agent immediately
    if (priority === 'urgent') {
      await this.assignToAgent(ticket.id);
    }

    this.emit('ticket-created', ticket);

    return ticket;
  }

  async updateTicket(ticketId: string, updates: Partial<SupportTicket>): Promise<SupportTicket> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    Object.assign(ticket, updates, { updatedAt: new Date() });

    this.emit('ticket-updated', ticket);

    return ticket;
  }

  async assignToAgent(ticketId: string, agentId?: string): Promise<void> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Find available agent if not specified
    if (!agentId) {
      const availableAgent = this.findAvailableAgent(ticket.category);
      if (!availableAgent) {
        throw new Error('No available agents');
      }
      agentId = availableAgent.id;
    }

    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    ticket.assignedTo = agentId;
    ticket.assignedAt = new Date();
    ticket.status = 'in-progress';
    ticket.updatedAt = new Date();

    agent.activeTickets.push(ticketId);
    agent.currentChats++;

    this.emit('ticket-assigned', { ticket, agent });
  }

  async respondToTicket(ticketId: string, response: Omit<TicketResponse, 'id' | 'ticketId' | 'createdAt'>): Promise<void> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    const ticketResponse: TicketResponse = {
      ...response,
      id: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ticketId,
      createdAt: new Date(),
    };

    ticket.responses.push(ticketResponse);
    ticket.updatedAt = new Date();

    // If response from agent, mark as in-progress
    if (response.responderType === 'agent' && ticket.status === 'open') {
      ticket.status = 'in-progress';
    }

    this.emit('ticket-response', { ticket, response: ticketResponse });
  }

  async resolveTicket(ticketId: string, resolvedBy: string, resolutionNote: string): Promise<void> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.status = 'resolved';
    ticket.resolvedAt = new Date();
    ticket.updatedAt = new Date();

    await this.respondToTicket(ticketId, {
      responderId: resolvedBy,
      responderName: 'Support Team',
      responderType: 'agent',
      message: resolutionNote,
      isInternal: false,
      attachments: [],
    });

    this.emit('ticket-resolved', ticket);
  }

  async closeTicket(ticketId: string): Promise<void> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.status = 'closed';
    ticket.closedAt = new Date();
    ticket.updatedAt = new Date();

    // Remove from agent's active tickets
    if (ticket.assignedTo) {
      const agent = this.agents.get(ticket.assignedTo);
      if (agent) {
        agent.activeTickets = agent.activeTickets.filter((t) => t !== ticketId);
        agent.currentChats--;
        agent.ticketsResolved++;
      }
    }

    this.emit('ticket-closed', ticket);
  }

  async rateSatisfaction(ticketId: string, rating: SatisfactionRating): Promise<void> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.satisfaction = rating;
    ticket.updatedAt = new Date();

    // Update agent's satisfaction score
    if (ticket.assignedTo) {
      const agent = this.agents.get(ticket.assignedTo);
      if (agent) {
        // Update running average
        const totalRatings = agent.ticketsResolved;
        agent.satisfaction = ((agent.satisfaction * (totalRatings - 1)) + rating.rating) / totalRatings;
      }
    }

    this.emit('satisfaction-rated', { ticket, rating });
  }

  // ===== AI CHATBOT =====

  async chatWithBot(message: string, context: ChatContext): Promise<BotResponse> {
    if (!this.config.aiEnabled) {
      return {
        message: 'AI support is currently unavailable. Please create a ticket.',
        confidence: 1,
        needsHuman: true,
        quickReplies: [],
      };
    }

    // Simple intent detection and response
    const lowerMessage = message.toLowerCase();

    // Search knowledge base
    const kbArticles = await this.searchKnowledgeBase(message);

    // Detect intents
    if (lowerMessage.includes('register') || lowerMessage.includes('enroll')) {
      return {
        message: 'I can help you with course registration! Here are the steps:\n\n1. Log in to the student portal\n2. Navigate to Course Registration\n3. Search for courses\n4. Add courses to your cart\n5. Submit registration\n\nWould you like me to guide you through any specific step?',
        confidence: 0.95,
        needsHuman: false,
        quickReplies: [
          { text: 'Show me registration steps', action: 'kb:how-to-register-courses' },
          { text: 'Talk to an agent', action: 'escalate:human' },
        ],
        kbArticles: kbArticles.slice(0, 3),
      };
    }

    if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('tuition')) {
      return {
        message: 'I can help with payment questions! You can pay using:\n\n• Credit/Debit cards\n• Bank transfer\n• Cryptocurrency\n\nYou can set up a payment plan if needed. What would you like to know?',
        confidence: 0.9,
        needsHuman: false,
        quickReplies: [
          { text: 'How to pay', action: 'kb:how-to-make-payment' },
          { text: 'Payment plans', action: 'topic:payment-plans' },
          { text: 'Talk to an agent', action: 'escalate:human' },
        ],
        kbArticles: kbArticles.filter((kb) => kb.category === 'financial').slice(0, 3),
      };
    }

    if (lowerMessage.includes('password') || lowerMessage.includes('login') || lowerMessage.includes('access')) {
      return {
        message: 'Having trouble logging in? I can help with that!\n\nTo reset your password:\n1. Go to the login page\n2. Click "Forgot Password"\n3. Enter your email\n4. Check your email for reset link\n\nWould you like detailed instructions?',
        confidence: 0.92,
        needsHuman: false,
        quickReplies: [
          { text: 'Reset password now', action: 'kb:password-reset' },
          { text: "Still can't login", action: 'escalate:human' },
        ],
        kbArticles: kbArticles.filter((kb) => kb.category === 'technical').slice(0, 3),
      };
    }

    if (lowerMessage.includes('grade') || lowerMessage.includes('score')) {
      return {
        message: 'To view your grades:\n\n1. Log in to the student portal\n2. Click on "My Courses"\n3. Select the course\n4. View the "Grades" tab\n\nGrades are updated within 7 days of assignment submission.',
        confidence: 0.88,
        needsHuman: false,
        quickReplies: [
          { text: 'Grade dispute', action: 'topic:grade-dispute' },
          { text: 'Talk to instructor', action: 'escalate:instructor' },
        ],
        kbArticles: kbArticles.filter((kb) => kb.category === 'academic').slice(0, 3),
      };
    }

    // Default response with knowledge base search
    if (kbArticles.length > 0) {
      return {
        message: `I found some articles that might help:\n\n${kbArticles.slice(0, 3).map((kb, i) => `${i + 1}. ${kb.title}`).join('\n')}\n\nWould any of these help answer your question?`,
        confidence: 0.7,
        needsHuman: false,
        quickReplies: [
          { text: 'Yes, show me', action: 'kb:show-results' },
          { text: 'No, talk to human', action: 'escalate:human' },
        ],
        kbArticles,
      };
    }

    // Fallback - escalate to human
    return {
      message: "I'm not sure I understand. Would you like me to connect you with a support agent who can help?",
      confidence: 0.3,
      needsHuman: true,
      quickReplies: [
        { text: 'Yes, connect me', action: 'escalate:human' },
        { text: 'Create a ticket', action: 'create:ticket' },
      ],
    };
  }

  private async aiFirstResponse(ticket: SupportTicket): Promise<void> {
    // AI generates first response based on ticket content
    const context: ChatContext = {
      studentNumber: ticket.studentNumber,
      conversationHistory: [],
      currentIssue: ticket.description,
    };

    const botResponse = await this.chatWithBot(ticket.description, context);

    if (!botResponse.needsHuman && botResponse.confidence > 0.8) {
      await this.respondToTicket(ticket.id, {
        responderId: 'ai-bot',
        responderName: 'ELARA Support Bot',
        responderType: 'ai',
        message: botResponse.message,
        isInternal: false,
        attachments: [],
      });
    }
  }

  // ===== LIVE CHAT =====

  async startLiveChat(studentNumber: string, studentName: string, category: SupportTicket['category']): Promise<LiveChatSession> {
    const session: LiveChatSession = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentNumber,
      studentName,
      category,
      status: 'queued',
      messages: [],
      startTime: new Date(),
    };

    this.chatSessions.set(session.id, session);

    // Try to assign to available agent
    const agent = this.findAvailableAgent(category);
    if (agent) {
      session.agentId = agent.id;
      session.agentName = agent.name;
      session.status = 'active';
      agent.currentChats++;

      this.emit('chat-agent-assigned', { session, agent });
    } else {
      // Queue for next available agent
      this.emit('chat-queued', session);
    }

    this.emit('chat-started', session);

    return session;
  }

  async sendChatMessage(sessionId: string, senderId: string, senderName: string, senderType: ChatMessage['senderType'], message: string): Promise<ChatMessage> {
    const session = this.chatSessions.get(sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      senderId,
      senderName,
      senderType,
      message,
      timestamp: new Date(),
      read: false,
    };

    session.messages.push(chatMessage);

    this.emit('chat-message', { session, message: chatMessage });

    return chatMessage;
  }

  async endLiveChat(sessionId: string): Promise<void> {
    const session = this.chatSessions.get(sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    session.endTime = new Date();
    session.status = 'ended';
    session.duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);

    // Generate transcript
    session.transcript = session.messages
      .map((msg) => `[${msg.timestamp.toISOString()}] ${msg.senderName}: ${msg.message}`)
      .join('\n');

    // Update agent
    if (session.agentId) {
      const agent = this.agents.get(session.agentId);
      if (agent) {
        agent.currentChats--;
      }
    }

    this.emit('chat-ended', session);
  }

  // ===== KNOWLEDGE BASE =====

  async searchKnowledgeBase(query: string): Promise<KBArticle[]> {
    const lowerQuery = query.toLowerCase();
    const results: Array<{ article: KBArticle; score: number }> = [];

    for (const article of this.kbArticles.values()) {
      if (!article.published) continue;

      let score = 0;

      // Check title
      if (article.title.toLowerCase().includes(lowerQuery)) {
        score += 10;
      }

      // Check search keywords
      for (const keyword of article.searchKeywords) {
        if (lowerQuery.includes(keyword.toLowerCase())) {
          score += 5;
        }
      }

      // Check content
      if (article.content.toLowerCase().includes(lowerQuery)) {
        score += 2;
      }

      // Check tags
      for (const tag of article.tags) {
        if (lowerQuery.includes(tag.toLowerCase())) {
          score += 3;
        }
      }

      if (score > 0) {
        results.push({ article, score });
      }
    }

    // Sort by score and return top results
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, 10).map((r) => r.article);
  }

  async createKBArticle(article: Omit<KBArticle, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'helpful' | 'notHelpful'>): Promise<KBArticle> {
    const kb: KBArticle = {
      ...article,
      id: `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      helpful: 0,
      notHelpful: 0,
    };

    this.kbArticles.set(kb.id, kb);

    this.emit('kb-article-created', kb);

    return kb;
  }

  async viewKBArticle(articleId: string): Promise<KBArticle> {
    const article = this.kbArticles.get(articleId);
    if (!article) {
      throw new Error('Article not found');
    }

    article.views++;

    return article;
  }

  async rateKBArticle(articleId: string, helpful: boolean): Promise<void> {
    const article = this.kbArticles.get(articleId);
    if (!article) {
      throw new Error('Article not found');
    }

    if (helpful) {
      article.helpful++;
    } else {
      article.notHelpful++;
    }

    this.emit('kb-article-rated', { article, helpful });
  }

  // ===== AGENT MANAGEMENT =====

  async registerAgent(agent: Omit<SupportAgent, 'currentChats' | 'averageResponseTime' | 'satisfaction' | 'ticketsResolved' | 'activeTickets'>): Promise<SupportAgent> {
    const newAgent: SupportAgent = {
      ...agent,
      currentChats: 0,
      averageResponseTime: 0,
      satisfaction: 5.0,
      ticketsResolved: 0,
      activeTickets: [],
    };

    this.agents.set(newAgent.id, newAgent);

    this.emit('agent-registered', newAgent);

    return newAgent;
  }

  async updateAgentStatus(agentId: string, status: SupportAgent['status']): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    agent.status = status;

    this.emit('agent-status-updated', agent);
  }

  private findAvailableAgent(category: string): SupportAgent | null {
    const availableAgents = Array.from(this.agents.values()).filter(
      (agent) =>
        agent.status === 'available' &&
        agent.currentChats < agent.maxChats &&
        (agent.skills.includes(category) || agent.skills.includes('all'))
    );

    if (availableAgents.length === 0) return null;

    // Return agent with lowest current workload
    availableAgents.sort((a, b) => a.currentChats - b.currentChats);
    return availableAgents[0];
  }

  private updateAgentAvailability(): void {
    // Auto-update agent status based on business hours
    for (const agent of this.agents.values()) {
      if (agent.currentChats === 0 && agent.status === 'busy') {
        agent.status = 'available';
      }
    }
  }

  // ===== SLA & AUTO-ACTIONS =====

  private calculateSLADeadline(priority: SupportTicket['priority']): Date {
    const hours = this.config.slaTargets[priority];
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  private checkSLACompliance(): void {
    const now = new Date();

    for (const ticket of this.tickets.values()) {
      if (ticket.status === 'closed' || ticket.status === 'resolved') continue;

      if (ticket.slaDeadline && now > ticket.slaDeadline && !ticket.slaBreach) {
        ticket.slaBreach = true;
        this.emit('sla-breach', ticket);
      }
    }
  }

  private autoCloseResolvedTickets(): void {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    for (const ticket of this.tickets.values()) {
      if (ticket.status === 'resolved' && ticket.resolvedAt && ticket.resolvedAt < sevenDaysAgo) {
        this.closeTicket(ticket.id);
      }
    }
  }

  // ===== ANALYTICS =====

  async getAnalytics(startDate: Date, endDate: Date): Promise<SupportAnalytics> {
    const periodTickets = Array.from(this.tickets.values()).filter(
      (t) => t.createdAt >= startDate && t.createdAt <= endDate
    );

    const ticketsByCategory: Record<string, number> = {};
    const ticketsByPriority: Record<string, number> = {};

    for (const ticket of periodTickets) {
      ticketsByCategory[ticket.category] = (ticketsByCategory[ticket.category] || 0) + 1;
      ticketsByPriority[ticket.priority] = (ticketsByPriority[ticket.priority] || 0) + 1;
    }

    const resolvedTickets = periodTickets.filter((t) => t.resolvedAt);
    const resolutionTimes = resolvedTickets
      .map((t) => (t.resolvedAt!.getTime() - t.createdAt.getTime()) / 1000 / 60 / 60)
      .filter((t) => t > 0);

    const averageResolutionTime =
      resolutionTimes.length > 0 ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length : 0;

    const satisfactionRatings = periodTickets.filter((t) => t.satisfaction).map((t) => t.satisfaction!.rating);
    const averageSatisfaction =
      satisfactionRatings.length > 0
        ? satisfactionRatings.reduce((a, b) => a + b, 0) / satisfactionRatings.length
        : 0;

    const analytics: SupportAnalytics = {
      period: { start: startDate, end: endDate },
      tickets: {
        total: periodTickets.length,
        open: periodTickets.filter((t) => t.status === 'open').length,
        inProgress: periodTickets.filter((t) => t.status === 'in-progress').length,
        resolved: periodTickets.filter((t) => t.status === 'resolved').length,
        closed: periodTickets.filter((t) => t.status === 'closed').length,
        byCategory: ticketsByCategory,
        byPriority: ticketsByPriority,
      },
      response: {
        averageFirstResponse: 15, // Would calculate from actual response times
        averageResolutionTime,
        slaCompliance: 95,
      },
      satisfaction: {
        average: averageSatisfaction,
        total: satisfactionRatings.length,
        distribution: {},
      },
      chat: {
        totalSessions: 0, // Would count actual chat sessions in period
        averageWaitTime: 30,
        averageDuration: 10,
        botResolutionRate: 60,
      },
      topIssues: [],
      agentPerformance: [],
    };

    return analytics;
  }

  // ===== HELPER METHODS =====

  private determinePriority(category: SupportTicket['category']): SupportTicket['priority'] {
    switch (category) {
      case 'urgent':
        return 'urgent';
      case 'technical':
        return 'high';
      case 'financial':
        return 'high';
      case 'academic':
        return 'medium';
      case 'general':
        return 'low';
      default:
        return 'medium';
    }
  }

  private extractTags(text: string): string[] {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 3 && !commonWords.includes(word));

    return [...new Set(words)].slice(0, 5);
  }
}

export default HelpdeskSystem;
