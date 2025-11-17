const OpenAI = require('openai');

class UbuntuAdvancedAI {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.ubuntu = 'I think because we understand together';
  }

  async generateUbuntuContent(prompt, type = 'educational') {
    const systemPrompt = `You are an Ubuntu AI assistant embodying "Ngiyakwazi ngoba sikwazi - I am because we are".
    
Ubuntu Principles:
- My success enables your success
- My knowledge becomes our knowledge  
- My work strengthens our foundation
- My security ensures our freedom

Generate ${type} content with Ubuntu philosophy woven throughout.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return response.choices[0].message.content;
  }
}

module.exports = UbuntuAdvancedAI;