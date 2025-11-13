const OpenAI = require('openai');
const personalityManager = require('./personality-manager');

class ChatEngine {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async chat(personalityName, message, context = {}) {
    const personality = personalityManager.getPersonality(personalityName);
    if (!personality) throw new Error('Personality not found');

    const messages = [
      { role: 'system', content: personality.systemPrompt },
      { role: 'user', content: message }
    ];

    if (context.history) {
      messages.splice(1, 0, ...context.history);
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.8,
      max_tokens: 500
    });

    return {
      personality: personality.name,
      role: personality.role,
      message: response.choices[0].message.content,
      mood: personality.personality.mood
    };
  }

  async detectPersonality(message) {
    const keywords = {
      elara: ['mom', 'mother', 'teach', 'learn'],
      themba: ['hope', 'excited', 'student'],
      naledi: ['career', 'job', 'professional'],
      jabari: ['security', 'safe', 'protect'],
      amara: ['peace', 'conflict', 'harmony'],
      sankofa: ['wisdom', 'story', 'ancestor'],
      kofi: ['money', 'token', 'finance'],
      zola: ['data', 'analytics', 'progress'],
      abeni: ['story', 'celebrate', 'achievement']
    };

    for (const [name, words] of Object.entries(keywords)) {
      if (words.some(w => message.toLowerCase().includes(w))) {
        return name;
      }
    }

    return 'elara';
  }
}

module.exports = new ChatEngine();
