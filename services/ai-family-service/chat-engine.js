const personalityManager = require('./personality-manager');
const aiResponseEngine = require('./engines/ai-response-engine');

class ChatEngine {
    async chat(personalityName, userMessage, userId, context = {}) {
        const personality = personalityManager.getPersonality(personalityName);
        if (!personality) {
            throw new Error(`Personality '${personalityName}' not found`);
        }

        const config = personality.getConfig();
        const response = await aiResponseEngine.generateResponse(config, userMessage, userId, context);
        
        return {
            personality: personalityName,
            message: response.message,
            mood: response.mood,
            timestamp: response.timestamp
        };
    }

    async multiPersonalityChat(personalityNames, userMessage, userId) {
        const responses = await Promise.all(
            personalityNames.map(name => this.chat(name, userMessage, userId))
        );
        return responses;
    }

    clearHistory(userId, personalityName = null) {
        aiResponseEngine.clearHistory(userId, personalityName);
    }
}

module.exports = new ChatEngine();
