const OpenAI = require('openai');

class TutorEngine {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async tutorSession(studentId, subject, question, context = {}) {
    const systemPrompt = `You are Elara, an AI tutor from Azora OS. You teach ${subject} with patience and Ubuntu philosophy. Break down complex concepts, use examples, and encourage the student. Adapt to their level.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question }
    ];

    if (context.previousMessages) {
      messages.splice(1, 0, ...context.previousMessages);
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7
    });

    return {
      answer: response.choices[0].message.content,
      subject,
      studentId,
      timestamp: new Date()
    };
  }

  async explainConcept(concept, level = 'intermediate') {
    const prompt = `Explain ${concept} at ${level} level with examples and analogies.`;
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert educator explaining concepts clearly.' },
        { role: 'user', content: prompt }
      ]
    });

    return response.choices[0].message.content;
  }
}

module.exports = new TutorEngine();
