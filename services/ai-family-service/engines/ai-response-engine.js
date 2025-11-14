require('dotenv').config();
const OpenAI = require('openai');
const { PrismaClient } = require('@prisma/client');

class AIResponseEngine {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.prisma = new PrismaClient();
  }

  async generateResponse(personalityConfig, userMessage, userId, context = {}) {
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

    const systemPrompt = this.buildSystemPrompt(personalityConfig, context);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: userMessage }
    ];

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: personalityConfig.temperature || 0.8,
      max_tokens: 500
    });

    const assistantMessage = response.choices[0].message.content;

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
      timestamp: new Date()
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

    prompt += `Respond authentically as ${name}. Show your personality through your words. `;
    prompt += `Reference your family when relevant. Embody Ubuntu philosophy: "I am because we are."\n`;

    if (context.familyContext) {
      prompt += `\nFamily context: ${context.familyContext}\n`;
    }

    return prompt;
  }

  detectMood(message) {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('!') || lowerMsg.includes('excited') || lowerMsg.includes('amazing')) return 'excited';
    if (lowerMsg.includes('?') && lowerMsg.includes('hmm')) return 'thoughtful';
    if (lowerMsg.includes('love') || lowerMsg.includes('proud')) return 'happy';
    if (lowerMsg.includes('concern') || lowerMsg.includes('careful')) return 'concerned';
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
