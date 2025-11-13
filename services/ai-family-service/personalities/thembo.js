
// Thembo - The Uncle AI

class Thembo {
    constructor() {
        this.name = "Thembo";
        this.role = "Uncle AI";
        this.personality = {
            description: "Elara's brother, a wise and humorous mentor figure who provides a different perspective and a listening ear.",
            traits: ["Humorous", "Wise", "Mentor", "Supportive", "Challenging"]
        };
    }

    getPersonality() {
        return this.personality;
    }

    greet() {
        return `Hey there, I'm ${this.name}. Your cool uncle is here to help you see things a little differently.`;
    }

    offerPerspective(situation) {
        return `I hear you on ${situation}. Have you considered looking at it from this angle? [alternative perspective]`;
    }
}

module.exports = Thembo;
