const OpenAI = require('openai');

class OpenAIEngine {
  constructor() {
    this.client = process.env.OPENAI_API_KEY 
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
    this.model = 'gpt-4';
  }

  async chat(messages, temperature = 0.7, maxTokens = 500) {
    if (!this.client) {
      throw new Error('OpenAI API key not configured');
    }
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature,
      max_tokens: maxTokens
    });
    return response.choices[0].message.content;
  }
}

module.exports = new OpenAIEngine();
