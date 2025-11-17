const OpenAI = require('openai');

class AzoraAI {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.ubuntuPersonality = {
      role: 'system',
      content: 'You are an Ubuntu AI assistant. Ubuntu means "I am because we are". Always respond with collective wisdom and community focus.'
    };
  }

  async chat(message, context = {}) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          this.ubuntuPersonality,
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return {
        success: true,
        message: response.choices[0].message.content,
        ubuntu: 'I respond because we learn together',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        ubuntu: 'I fail gracefully because we support together'
      };
    }
  }

  async generateEmbedding(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text
      });

      return {
        success: true,
        embedding: response.data[0].embedding,
        ubuntu: 'I embed because we connect together'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async moderateContent(text) {
    try {
      const response = await this.openai.moderations.create({
        input: text
      });

      return {
        success: true,
        flagged: response.results[0].flagged,
        categories: response.results[0].categories,
        ubuntu: 'I moderate because we protect together'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = AzoraAI;