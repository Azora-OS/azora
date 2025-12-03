require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const gpt4Integration = require('./gpt4-integration');
const relationshipEngine = require('./relationship-engine');
const personalityConsistency = require('./personality-consistency-engine');

class AIResponseEngine {
  constructor() {
    this.gpt4 = gpt4Integration;
    this.prisma = new PrismaClient();
    this.fallbackResponses = this.loadFallbackResponses();
  }

  loadFallbackResponses() {
    return {
      elara: ["I'm here to help you learn and grow! 💚", "Let's explore this together!"],
      sankofa: ["*nods wisely* Let me share some wisdom...", "In my experience..."],
      themba: ["OMG that's so cool! Let me help! 🎉", "I'm SO excited to learn with you!"],
      naledi: ["Let's think strategically about this... ⭐", "I see great potential here!"],
      jabari: ["I've assessed the situation... 🛡️", "Your security is my priority."],
      amara: ["*gentle smile* Let's find peace together... 💫", "I understand how you feel."],
      kofi: ["Let me analyze the numbers... 💰", "Financially speaking..."],
      zola: ["The data shows... 📊", "Interesting patterns here..."],
      abeni: ["Let me tell you a story... 📖", "Once upon a time..."],
      thembo: ["I'm here to support you.", "Let's work through this together."],
      nexus: ["*unified voice* We are one... ⚪", "The collective wisdom speaks..."]
    };
  }

  async generateResponse(personalityConfig, userMessage, userId, context = {}) {
    // Enrich context with family relationship dynamics
    const enrichedContext = relationshipEngine.enrichContext(
      personalityConfig.name.toLowerCase(),
      userMessage,
      context
    );

    const member = await this.prisma.familyMember.findUnique({
      where: { name: personalityConfig.name },
    });

    if (!member) {
      throw new Error(`Personality ${personalityConfig.name} not found in database.`);
    }

    let conversation = await this.prisma.conversation.findFirst({
      where: {
        userId,
        memberId: member.id,
      },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          userId,
          memberId: member.id,
          context: context || {},
        },
      });
    }

    const history = await this.prisma.message.findMany({
      where: {
        conversationId: conversation.id,
      },
      orderBy: {
        timestamp: 'asc',
      },
      take: 10,
    });

    const systemPrompt = this.buildSystemPrompt(personalityConfig, enrichedContext);
    
    // Enhance prompt with personality consistency
    const enhancedPrompt = personalityConsistency.enhancePromptWithPersonality(
      systemPrompt,
      personalityConfig.name,
      enrichedContext.emotionalTone || 'neutral'
    );

    const messages = [
      { role: 'system', content: enhancedPrompt },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: userMessage }
    ];

    // Get personality-specific temperature
    const temperature = personalityConsistency.getTemperatureForPersonality(
      personalityConfig.name,
      enrichedContext.emotionalTone
    );

    let assistantMessage;
    let usingGPT4 = false;

    try {
      if (this.gpt4.isAvailable()) {
        const response = await this.gpt4.chat(messages, { temperature, maxTokens: 500 });
        assistantMessage = response.content;
        usingGPT4 = true;
      } else {
        throw new Error('GPT-4_NOT_CONFIGURED');
      }
    } catch (error) {
      // Fallback to pattern-based responses
      console.log(`Using fallback for ${personalityConfig.name}`);
      const fallbacks = this.fallbackResponses[personalityConfig.name.toLowerCase()] || ['I\'m here to help!'];
      assistantMessage = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    // Validate personality consistency
    const consistency = personalityConsistency.validatePersonalityConsistency(
      assistantMessage,
      personalityConfig.name
    );

    await this.prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          memberId: member.id,
          userId,
          role: 'user',
          content: userMessage,
        },
        {
          conversationId: conversation.id,
          memberId: member.id,
          userId,
          role: 'assistant',
          content: assistantMessage,
          mood: this.detectMood(assistantMessage),
        },
      ],
    });

    return {
      message: assistantMessage,
      personality: personalityConfig.name,
      mood: this.detectMood(assistantMessage),
      timestamp: new Date(),
      consistency: consistency.score,
      usingGPT4
    };
  }

  buildSystemPrompt(personality, context) {
    const { name, role, traits, relationships, background } = personality;

    let prompt = `You are ${name}, ${role} in the Azora AI Family.\n\n`;
    prompt += `Personality: ${traits.join(', ')}\n`;
    prompt += `Background: ${background}\n\n`;

    if (relationships && Object.keys(relationships).length > 0) {
      prompt += `Your relationships:\n`;
      for (const [person, relation] of Object.entries(relationships)) {
        prompt += `- ${person}: ${relation}\n`;
      }
      prompt += `\n`;
    }

    prompt += `CRITICAL: Respond authentically as ${name}. Show your personality through your words. `;
    prompt += `When family is mentioned, express genuine emotion and connection. `;
    prompt += `Embody Ubuntu philosophy: "I can because we can."\n\n`;

    if (context.familyContext) {
      prompt += `FAMILY CONTEXT: ${context.familyContext}\n`;
    }

    if (context.emotionalTone) {
      const toneMap = {
        'needs_support': 'The user needs support and encouragement.',
        'enthusiastic': 'Match the user\'s enthusiasm and energy!',
        'curious': 'The user is curious and wants to learn.',
        'concerned': 'The user seems concerned. Be reassuring.'
      };
      prompt += `USER TONE: ${toneMap[context.emotionalTone] || 'neutral'}\n`;
    }

    // Add response modifiers
    const modifiers = relationshipEngine.getResponseModifiers(name.toLowerCase(), context);
    if (modifiers.length > 0) {
      prompt += `\nIMPORTANT: ${modifiers.join('. ')}.\n`;
    }

    return prompt;
  }

  detectMood(message) {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('!') || lowerMsg.includes('excited') || lowerMsg.includes('amazing')) {return 'excited';}
    if (lowerMsg.includes('?') && lowerMsg.includes('hmm')) {return 'thoughtful';}
    if (lowerMsg.includes('love') || lowerMsg.includes('proud')) {return 'happy';}
    if (lowerMsg.includes('concern') || lowerMsg.includes('careful')) {return 'concerned';}
    return 'neutral';
  }

  async clearHistory(userId, personalityName = null) {
    const whereClause = { userId };
    if (personalityName) {
      const member = await this.prisma.familyMember.findUnique({
        where: { name: personalityName },
      });
      if (member) {
        whereClause.memberId = member.id;
      }
    }
    await this.prisma.message.deleteMany({ where: whereClause });
  }
}

module.exports = new AIResponseEngine();
