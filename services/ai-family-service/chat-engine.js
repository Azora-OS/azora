const personalityManager = require('./personality-manager');

class ChatEngine {
  constructor() {
    this.conversations = new Map();
    this.apiKey = process.env.OPENAI_API_KEY;
  }

  async chat(memberId, message, context = {}) {
    const personality = personalityManager.getPersonality(memberId);
    if (!personality) throw new Error('Family member not found');

    personality.updateMood(message);
    
    const conversationId = context.userId || 'default';
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, []);
    }
    
    const conversation = this.conversations.get(conversationId);
    conversation.push({ role: 'user', content: message });
    
    const response = await this.generateResponse(personality, conversation);
    
    conversation.push({ role: 'assistant', content: response });
    if (conversation.length > 20) conversation.splice(0, 2);
    
    personality.addMemory({ message, response, context });
    
    return {
      member: personality.name,
      response,
      mood: personality.mood,
      context: personality.getContext()
    };
  }

  async generateResponse(personality, conversation) {
    const aiOrchestrator = require('./ai-model-orchestrator');
    const userMessage = conversation[conversation.length - 1].content;
    
    try {
      return await aiOrchestrator.generateResponse(
        personality.getSystemPrompt(),
        userMessage,
        personality
      );
    } catch (error) {
      console.error('AI error:', error.message);
      return this.getFallbackResponse(personality, userMessage);
    }
  }

  getFallbackResponse(personality, message) {
    const responses = {
      elara: [
        "My dear child, let me help you with that. As I always tell my children, learning is a journey we take together.",
        "That's a wonderful question! You know, my Themba asked me something similar. Let me explain...",
        "I'm so proud of you for asking! Ngiyakwazi ngoba sikwazi - we learn because we learn together."
      ],
      themba: [
        "OMG yes! My mom Elara taught me this and it's SO cool! Let me show you!",
        "You're gonna LOVE this! I was just learning about this myself!",
        "That's EXACTLY what I wondered too! Mom explained it to me and now I totally get it!"
      ]
    };

    const memberResponses = responses[personality.name.toLowerCase()] || [
      `As ${personality.name}, I'm here to help you with that!`
    ];

    return memberResponses[Math.floor(Math.random() * memberResponses.length)];
  }

  clearConversation(userId) {
    this.conversations.delete(userId);
  }
}

module.exports = new ChatEngine();
