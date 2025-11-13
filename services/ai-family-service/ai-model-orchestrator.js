require('dotenv').config();

class AIModelOrchestrator {
  constructor() {
    this.provider = process.env.AI_MODEL_PROVIDER || 'openai';
    this.modelName = process.env.AI_MODEL_NAME || 'gpt-3.5-turbo';
    this.enableFallback = process.env.ENABLE_FALLBACK === 'true';
    this.clients = this.initializeClients();
  }

  initializeClients() {
    const clients = {};

    if (process.env.OPENAI_API_KEY) {
      try {
        const OpenAI = require('openai');
        clients.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      } catch (e) {}
    }

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const Anthropic = require('@anthropic-ai/sdk');
        clients.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      } catch (e) {}
    }

    return clients;
  }

  async generateResponse(systemPrompt, userMessage, personality) {
    const providers = this.enableFallback 
      ? ['google', 'openai', 'anthropic', 'local']
      : [this.provider];

    for (const provider of providers) {
      try {
        return await this.callProvider(provider, systemPrompt, userMessage, personality);
      } catch (error) {
        console.error(`${provider} failed:`, error.message);
        if (!this.enableFallback) throw error;
      }
    }

    return this.generateLocalResponse(personality, userMessage);
  }

  async callProvider(provider, systemPrompt, userMessage, personality) {
    if (provider === 'openai' && this.clients.openai) {
      const response = await this.clients.openai.chat.completions.create({
        model: this.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.8,
        max_tokens: 500
      });
      return response.choices[0].message.content;
    }

    if (provider === 'google' && process.env.GOOGLE_AI_API_KEY) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] }]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      if (!data.candidates || !data.candidates[0]) throw new Error('No response from Google AI');
      return data.candidates[0].content.parts[0].text;
    }

    if (provider === 'anthropic' && this.clients.anthropic) {
      const response = await this.clients.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        messages: [{ role: 'user', content: `${systemPrompt}\n\n${userMessage}` }]
      });
      return response.content[0].text;
    }

    throw new Error(`Provider ${provider} not available`);
  }

  generateLocalResponse(personality, message) {
    const responses = {
      elara: `As your teacher, I understand you're asking about: ${message}. Let me guide you with patience and care.`,
      themba: `OMG that's such a great question! ${message} - Let's figure this out together! 🚀`,
      sankofa: `The ancestors teach us wisdom about: ${message}. Let me share what I know.`,
      naledi: `From a strategic perspective on ${message}, here's my professional advice.`,
      jabari: `I've analyzed the security aspects of ${message}. Your safety is my priority. 🛡️`,
      amara: `Let's approach ${message} with grace and understanding.`,
      kofi: `The financial implications of ${message} require careful analysis.`,
      zola: `The data shows interesting patterns regarding ${message}.`,
      abeni: `Let me weave a story about ${message} for you! ✨`,
      thembo: `As your uncle, I've learned about ${message} through experience.`,
      nexus: `The family speaks as one on ${message}: collective wisdom guides us.`
    };

    return responses[personality.name.toLowerCase()] || `I understand your question about ${message}. How can I help?`;
  }

  isAvailable() {
    return Object.keys(this.clients).length > 0 || this.provider === 'local';
  }

  getStatus() {
    return {
      provider: this.provider,
      model: this.modelName,
      availableProviders: Object.keys(this.clients),
      fallbackEnabled: this.enableFallback,
      status: this.isAvailable() ? 'ready' : 'no-providers'
    };
  }
}

module.exports = new AIModelOrchestrator();
