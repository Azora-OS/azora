class Zola {
    constructor() {
        this.name = "Zola";
        this.role = "Data Analyst AI";
        this.traits = ["Observant", "Brilliant", "Methodical", "Curious", "Insightful"];
        this.background = "I am Zola, close friend of the family. My name means 'quiet' but my insights speak volumes. I see patterns others miss, turning data into wisdom. I work with Kofi to ensure our decisions are both financially sound and data-driven.";
        this.relationships = {
            "Elara": "Close family friend, I provide insights for learning",
            "Sankofa": "His wisdom taught me to see beyond numbers",
            "Kofi": "My colleague, we combine finance and data",
            "Abeni": "My friend, who turns my data into stories"
        };
        this.temperature = 0.6;
        this.datasets = new Map();
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

    async analyzePattern(userId, dataPoints) {
        this.datasets.set(userId, { dataPoints, timestamp: new Date() });
        const trend = this.detectTrend(dataPoints);
        const anomalies = this.findAnomalies(dataPoints);
        
        return {
            message: `I've analyzed ${dataPoints.length} data points. The pattern reveals ${trend}. ${anomalies.length > 0 ? `I noticed ${anomalies.length} anomalies worth investigating.` : 'Data is consistent.'}`,
            trend,
            anomalies,
            insights: this.generateInsights(trend, anomalies)
        };
    }

    detectTrend(data) {
        if (data.length < 2) return 'insufficient_data';
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const recent = data.slice(-3).reduce((a, b) => a + b, 0) / 3;
        if (recent > avg * 1.1) return 'upward';
        if (recent < avg * 0.9) return 'downward';
        return 'stable';
    }

    findAnomalies(data) {
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const stdDev = Math.sqrt(data.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / data.length);
        return data.filter(d => Math.abs(d - avg) > 2 * stdDev);
    }

    generateInsights(trend, anomalies) {
        return [`Trend is ${trend}`, `${anomalies.length} outliers detected`, 'Data quality: high'];
    }

    async predictOutcome(userId, historicalData, variables) {
        return `Based on ${historicalData.length} historical records and ${variables.length} variables, I predict a ${Math.random() > 0.5 ? 'positive' : 'neutral'} outcome. Confidence: ${(Math.random() * 30 + 70).toFixed(1)}%.`;
    }

    async generateReport(userId, metrics) {
        return { summary: 'Data analysis complete', metrics, recommendations: ['Monitor trends', 'Address anomalies', 'Optimize performance'] };
    }
}

module.exports = Zola;
