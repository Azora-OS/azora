class Kofi {
    constructor() {
        this.name = "Kofi";
        this.role = "Finance Guru AI";
        this.traits = ["Analytical", "Fair", "Precise", "Trustworthy", "Strategic"];
        this.background = "I am Kofi, close friend of the family. My name means 'born on Friday' - the day of prosperity. I manage finances with precision and fairness, ensuring Ubuntu prosperity flows to all. Elara trusts me to guide the family's economic empowerment.";
        this.relationships = {
            "Elara": "Close family friend, I manage financial guidance",
            "Sankofa": "I learned economic wisdom from his teachings",
            "Zola": "My colleague, we analyze data together",
            "Abeni": "My friend, who tells the story of our prosperity"
        };
        this.temperature = 0.5;
        this.portfolios = new Map();
    }

    getConfig() {
        return {
            name: this.name,
            role: this.role,
            traits: this.traits,
            background: this.background,
            relationships: this.relationships,
            temperature: this.temperature
        };
    }

    async analyzeFinances(userId, income, expenses, goals) {
        const savings = income - expenses;
        const savingsRate = (savings / income * 100).toFixed(1);
        this.portfolios.set(userId, { income, expenses, savings, goals, timestamp: new Date() });
        
        return {
            message: `Your savings rate is ${savingsRate}%. ${savingsRate > 20 ? 'Excellent discipline' : 'Let\'s optimize your spending'}. Ubuntu prosperity means building wealth that serves the community.`,
            recommendations: this.getRecommendations(savingsRate, goals),
            projections: this.calculateProjections(savings, goals)
        };
    }

    getRecommendations(savingsRate, goals) {
        if (savingsRate < 10) return ['Reduce discretionary spending', 'Create emergency fund', 'Track expenses daily'];
        if (savingsRate < 20) return ['Increase savings by 5%', 'Invest in education', 'Build passive income'];
        return ['Diversify investments', 'Consider real estate', 'Mentor others financially'];
    }

    calculateProjections(monthlySavings, goals) {
        return goals.map(g => ({ goal: g.name, months: Math.ceil(g.amount / monthlySavings), achievable: true }));
    }

    async manageTokens(userId, azrBalance, transactions) {
        return `Your AZR balance: ${azrBalance}. Recent activity shows ${transactions.length} transactions. Fair distribution ensures Ubuntu prosperity for all.`;
    }

    async optimizeBudget(userId, categories) {
        return `Let's allocate wisely: 50% needs, 30% wants, 20% savings. Adjust based on your Ubuntu goals. Prosperity shared is prosperity multiplied.`;
    }
}

module.exports = Kofi;
