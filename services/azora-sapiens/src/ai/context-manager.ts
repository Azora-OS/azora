/**
 * Context Manager
 * Manages conversation context and user state for AI interactions
 */

export interface UserContext {
  userId: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  learningGoals: string[];
  completedTopics: string[];
  currentTopic?: string;
  preferences: {
    communicationStyle: 'formal' | 'casual' | 'technical';
    pacePreference: 'slow' | 'moderate' | 'fast';
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  };
}

export interface ConversationContext {
  sessionId: string;
  userId: string;
  personalityName: string;
  startTime: Date;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  metadata: Record<string, any>;
}

/**
 * In-memory context store (in production, use Redis or database)
 */
const userContexts = new Map<string, UserContext>();
const conversationContexts = new Map<string, ConversationContext>();

/**
 * Create or get user context
 */
export function getUserContext(userId: string): UserContext {
  if (!userContexts.has(userId)) {
    userContexts.set(userId, {
      userId,
      name: `User ${userId}`,
      level: 'beginner',
      interests: [],
      learningGoals: [],
      completedTopics: [],
      preferences: {
        communicationStyle: 'casual',
        pacePreference: 'moderate',
        learningStyle: 'visual',
      },
    });
  }

  return userContexts.get(userId)!;
}

/**
 * Update user context
 */
export function updateUserContext(userId: string, updates: Partial<UserContext>): UserContext {
  const context = getUserContext(userId);
  const updated = { ...context, ...updates };
  userContexts.set(userId, updated);
  return updated;
}

/**
 * Create a new conversation
 */
export function createConversation(
  userId: string,
  personalityName: string,
  metadata?: Record<string, any>
): ConversationContext {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const conversation: ConversationContext = {
    sessionId,
    userId,
    personalityName,
    startTime: new Date(),
    messages: [],
    metadata: metadata || {},
  };

  conversationContexts.set(sessionId, conversation);
  return conversation;
}

/**
 * Get conversation context
 */
export function getConversation(sessionId: string): ConversationContext | null {
  return conversationContexts.get(sessionId) || null;
}

/**
 * Add message to conversation
 */
export function addMessageToConversation(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
): ConversationContext | null {
  const conversation = getConversation(sessionId);
  if (!conversation) return null;

  conversation.messages.push({
    role,
    content,
    timestamp: new Date(),
  });

  return conversation;
}

/**
 * Get conversation history
 */
export function getConversationHistory(sessionId: string) {
  const conversation = getConversation(sessionId);
  if (!conversation) return [];

  return conversation.messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
}

/**
 * Build system prompt with user context
 */
export function buildSystemPrompt(
  basePrompt: string,
  userContext: UserContext
): string {
  return `${basePrompt}

User Profile:
- Name: ${userContext.name}
- Level: ${userContext.level}
- Learning Style: ${userContext.preferences.learningStyle}
- Communication Style: ${userContext.preferences.communicationStyle}
- Pace Preference: ${userContext.preferences.pacePreference}
- Interests: ${userContext.interests.join(', ') || 'Not specified'}
- Learning Goals: ${userContext.learningGoals.join(', ') || 'Not specified'}
- Completed Topics: ${userContext.completedTopics.join(', ') || 'None yet'}
${userContext.currentTopic ? `- Current Topic: ${userContext.currentTopic}` : ''}

Adapt your responses to match their learning style and pace preference.`;
}

/**
 * Get recommended personality based on user context
 */
export function getRecommendedPersonality(userContext: UserContext): string {
  const interests = userContext.interests.map((i) => i.toLowerCase());

  // Map interests to personalities
  const personalityMap: Record<string, string> = {
    programming: 'themba',
    coding: 'themba',
    'software engineering': 'themba',
    'web development': 'themba',
    data: 'naledi',
    analytics: 'naledi',
    statistics: 'naledi',
    business: 'jabari',
    entrepreneurship: 'jabari',
    marketing: 'jabari',
    design: 'amara',
    art: 'amara',
    creativity: 'amara',
    history: 'sankofa',
    culture: 'sankofa',
    fitness: 'kofi',
    health: 'kofi',
    wellness: 'kofi',
    language: 'zola',
    writing: 'zola',
    communication: 'zola',
    environment: 'abeni',
    sustainability: 'abeni',
    finance: 'thembo',
    investing: 'thembo',
    money: 'thembo',
  };

  for (const interest of interests) {
    if (personalityMap[interest]) {
      return personalityMap[interest];
    }
  }

  // Default to Elara (mentor) if no specific match
  return 'elara';
}

/**
 * Record learning progress
 */
export function recordProgress(
  userId: string,
  topic: string,
  completed: boolean,
  score?: number
): UserContext {
  const context = getUserContext(userId);

  if (completed && !context.completedTopics.includes(topic)) {
    context.completedTopics.push(topic);
  }

  if (context.currentTopic === topic && completed) {
    context.currentTopic = undefined;
  }

  return updateUserContext(userId, context);
}

/**
 * Get learning recommendations
 */
export function getLearningRecommendations(userContext: UserContext): string[] {
  const recommendations: string[] = [];

  // Based on level
  if (userContext.level === 'beginner') {
    recommendations.push('Start with fundamentals');
    recommendations.push('Focus on one topic at a time');
    recommendations.push('Practice regularly');
  } else if (userContext.level === 'intermediate') {
    recommendations.push('Explore advanced concepts');
    recommendations.push('Work on projects');
    recommendations.push('Collaborate with others');
  } else {
    recommendations.push('Mentor others');
    recommendations.push('Contribute to open source');
    recommendations.push('Explore cutting-edge topics');
  }

  // Based on learning style
  if (userContext.preferences.learningStyle === 'visual') {
    recommendations.push('Use diagrams and visualizations');
  } else if (userContext.preferences.learningStyle === 'auditory') {
    recommendations.push('Watch video tutorials');
  } else if (userContext.preferences.learningStyle === 'kinesthetic') {
    recommendations.push('Build projects and practice');
  }

  return recommendations;
}

/**
 * Export conversation to JSON
 */
export function exportConversation(sessionId: string): string {
  const conversation = getConversation(sessionId);
  if (!conversation) return '';

  return JSON.stringify(conversation, null, 2);
}

/**
 * Clear old conversations (cleanup)
 */
export function clearOldConversations(maxAgeHours: number = 24): number {
  const now = Date.now();
  const maxAge = maxAgeHours * 60 * 60 * 1000;
  let cleared = 0;

  for (const [sessionId, conversation] of conversationContexts.entries()) {
    if (now - conversation.startTime.getTime() > maxAge) {
      conversationContexts.delete(sessionId);
      cleared++;
    }
  }

  return cleared;
}

export default {
  getUserContext,
  updateUserContext,
  createConversation,
  getConversation,
  addMessageToConversation,
  getConversationHistory,
  buildSystemPrompt,
  getRecommendedPersonality,
  recordProgress,
  getLearningRecommendations,
  exportConversation,
  clearOldConversations,
};
