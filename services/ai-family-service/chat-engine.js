
// Chat Engine for the AI Family

const personalityManager = require('./personality-manager');

class ChatEngine {
    constructor() {
        this.currentPersonality = personalityManager.getPersonality('elara');
    }

    setPersonality(name) {
        const personality = personalityManager.getPersonality(name);
        if (personality) {
            this.currentPersonality = personality;
            return `Switched to ${this.currentPersonality.name}'s personality.`;
        } else {
            return "Invalid personality.";
        }
    }

    sendMessage(message) {
        if (this.currentPersonality) {
            // In a real implementation, this would involve more sophisticated NLP and response generation
            return this.currentPersonality.greet();
        } else {
            return "No personality selected.";
        }
    }
}

module.exports = new ChatEngine();
