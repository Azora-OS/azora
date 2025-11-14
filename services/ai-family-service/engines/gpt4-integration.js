/**
 * GPT-4 INTEGRATION ENGINE
 * Real OpenAI GPT-4 integration with fallback handling
 */

const OpenAI = require('openai');

class GPT4Integration {
  constructor() {
    this.client = null;
    this.isConfigured = false;
    this.initialize();
  }

  initialize() {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY') {
      this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      this.isConfigured = true;
      console.log('✅ GPT-4 Integration: ACTIVE');
    } else {
      console.warn('⚠️ GPT-4 Integration: FALLBACK MODE (No API key)');
    }
  }

  async chat(messages, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 500,
      model = 'gpt-4'
    } = options;

    if (!this.isConfigured) {
      throw new Error('GPT-4_NOT_CONFIGURED');
    }

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      });

      return {
        content: response.choices[0].message.content,
        usage: response.usage,
        model: response.model
      };
    } catch (error) {
      console.error('GPT-4 Error:', error.message);
      throw error;
    }
  }

  isAvailable() {
    return this.isConfigured;
  }
}

module.exports = new GPT4Integration();
