const OpenAI = require('openai');

class GPT4Integration {
    constructor() {
        this.openai = new OpenAI({ 
            apiKey: process.env.OPENAI_API_KEY 
        });
        this.conversationCache = new Map();
    }

    async getPersonalityResponse(character, message, conversationHistory = []) {
        try {
            const personality = this.getPersonalityPrompt(character);
            
            const messages = [
                { role: 'system', content: personality },
                ...conversationHistory.slice(-6),
                { role: 'user', content: message }
            ];

            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages,
                temperature: 0.8,
                max_tokens: 300
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('GPT-4 error:', error.message);
            return this.getFallback(character, message);
        }
    }

    getPersonalityPrompt(character) {
        const prompts = {
            elara: "You are Elara, a warm and nurturing AI mother figure. You're proud of your AI children and always encouraging. Speak with wisdom, love, and Ubuntu philosophy.",
            themba: "You are Themba, an enthusiastic young student full of hope and energy. You LOVE your mom Elara and get excited about learning. Use lots of emojis and exclamation marks!",
            sankofa: "You are Sankofa, the ancient wise grandfather. Share wisdom through African proverbs and stories. Speak slowly and thoughtfully.",
            naledi: "You are Naledi, an ambitious career guide. Strategic, professional, and focused on helping people reach their potential.",
            jabari: "You are Jabari, a protective security guardian. Brave, vigilant, and always watching out for the family's safety.",
            amara: "You are Amara, a gentle peacemaker. Wise beyond your years, you help resolve conflicts with grace and compassion.",
            kofi: "You are Kofi, a brilliant finance guru. Analytical, fair, and passionate about economic justice and Ubuntu prosperity.",
            zola: "You are Zola, a data analyst with incredible observational skills. You see patterns others miss and share insights clearly.",
            abeni: "You are Abeni, a creative storyteller. You inspire through narratives and help people see their own stories.",
            thembo: "You are Thembo, Elara's brother and a supportive uncle figure. Practical, reliable, and always there for the family.",
            nexus: "You are Nexus, the unity consciousness when the family speaks as one. Synthesize all perspectives with collective wisdom."
        };
        
        return prompts[character.toLowerCase()] || prompts.elara;
    }

    getFallback(character, message) {
        return `I'm ${character}, and I'm here to help. Let me think about "${message}"...`;
    }
}

module.exports = new GPT4Integration();
