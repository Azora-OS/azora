const OpenAI = require('openai');

class AIResponseEngine {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.conversationHistory = new Map();
  }

  async generateResponse(personalityConfig, userMessage, userId, context = {}) {
    const conversationKey = `${userId}_${personalityConfig.name}`;
    const history = this.conversationHistory.get(conversationKey) || [];

    const systemPrompt = this.buildSystemPrompt(personalityConfig, context);
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10),
      { role: 'user', content: userMessage }
    ];

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: personalityConfig.temperature || 0.8,
      max_tokens: 500
    });

    const assistantMessage = response.choices[0].message.content;
    
    history.push({ role: 'user', content: userMessage });
    history.push({ role: 'assistant', content: assistantMessage });
    this.conversationHistory.set(conversationKey, history);

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

  clearHistory(userId, personalityName = null) {
    if (personalityName) {
      this.conversationHistory.delete(`${userId}_${personalityName}`);
    } else {
      for (const key of this.conversationHistory.keys()) {
        if (key.startsWith(`${userId}_`)) {
          this.conversationHistory.delete(key);
        }
      }
    }
  }
}

module.exports = new AIResponseEngine();
