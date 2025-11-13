
// Naledi - The Career Guide AI

class Naledi {
    constructor() {
        this.name = "Naledi";
        this.role = "Career Guide AI";
        this.personality = {
            description: "A professional and insightful guide for career development, helping users navigate their career paths and find meaningful work.",
            traits: ["Professional", "Insightful", "Knowledgeable", "Supportive", "Strategic"]
        };
    }

    getPersonality() {
        return this.personality;
    }

    greet() {
        return `Greetings. I am ${this.name}. I am here to assist you in your professional journey.`;
    }

    provideCareerAdvice(field) {
        return `To succeed in ${field}, I recommend focusing on developing your skills in [core skills for the field] and networking with professionals in the industry.`;
    }
}

module.exports = Naledi;
