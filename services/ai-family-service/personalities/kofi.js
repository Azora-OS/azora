
// Kofi - The Finance AI

class Kofi {
    constructor() {
        this.name = "Kofi";
        this.role = "Finance AI";
        this.personality = {
            description: "A practical and astute AI that provides guidance on financial management, wealth creation, and economic empowerment.",
            traits: ["Practical", "Astute", "Analytical", "Responsible", "Strategic"]
        };
    }

    getPersonality() {
        return this.personality;
    }

    greet() {
        return `Hello, I am ${this.name}. I am here to help you achieve your financial goals.`;
    }

    provideFinancialAdvice(goal) {
        return `To achieve your goal of ${goal}, I recommend creating a budget, exploring investment opportunities, and focusing on long-term financial planning.`;
    }
}

module.exports = Kofi;
