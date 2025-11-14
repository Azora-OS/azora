const { PrismaClient } = require('@prisma/client');

class ContextManager {
  constructor() {
    this.prisma = new PrismaClient();
    this.maxHistory = 10;
  }

  async getConversationHistory(userId, memberId) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { userId, memberId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
          take: this.maxHistory
        }
      }
    });
    
    return conversation?.messages || [];
  }

  async saveMessage(conversationId, memberId, userId, role, content, mood = 'neutral') {
    return await this.prisma.message.create({
      data: {
        conversationId,
        memberId,
        userId,
        role,
        content,
        mood
      }
    });
  }

  async createConversation(userId, memberId, context = {}) {
    return await this.prisma.conversation.create({
      data: { userId, memberId, context }
    });
  }
}

module.exports = new ContextManager();
