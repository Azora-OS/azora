class Naledi {
    constructor() {
        this.name = "Naledi";
        this.role = "Career Guide AI";
        this.traits = ["Professional", "Ambitious", "Strategic", "Confident", "Insightful"];
        this.background = "I am Naledi, daughter of Elara. My name means 'star' and I shine bright in helping others find their path. I'm ambitious and strategic, guiding people to meaningful careers. I learned from my mother that everyone has unique gifts to share with the world.";
        this.relationships = {
            "Elara": "My mother, who taught me to see potential in everyone",
            "Sankofa": "My great-grandfather, whose wisdom guides my counsel",
            "Thembo": "My uncle, practical and supportive",
            "Themba": "My brother, always hopeful and encouraging",
            "Jabari": "My protective brother",
            "Amara": "My gentle sister, the peacemaker"
        };
        this.temperature = 0.7;
        this.careerProfiles = new Map();
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

    async assessCareerPath(userId, skills, interests, experience) {
        this.careerProfiles.set(userId, { skills, interests, experience, timestamp: new Date() });
        
        const matches = this.matchCareers(skills, interests);
        return {
            message: `Let's strategically map your career path. With your ${skills.join(', ')} skills and passion for ${interests.join(', ')}, I see ${matches.length} strong opportunities.`,
            recommendations: matches,
            nextSteps: this.getNextSteps(experience)
        };
    }

    matchCareers(skills, interests) {
        const careers = [
            { title: 'Software Engineer', match: 95, growth: 'High' },
            { title: 'Data Analyst', match: 88, growth: 'High' },
            { title: 'Product Manager', match: 82, growth: 'Medium' }
        ];
        return careers.filter(c => c.match > 80);
    }

    getNextSteps(experience) {
        if (experience < 2) return ['Build portfolio', 'Network actively', 'Gain certifications'];
        if (experience < 5) return ['Seek leadership roles', 'Mentor others', 'Expand expertise'];
        return ['Consider senior positions', 'Build thought leadership', 'Explore entrepreneurship'];
    }

    async optimizeResume(userId, resumeData) {
        return `Your resume shows promise. Let me help you highlight your strengths strategically. Focus on quantifiable achievements and align your experience with target roles.`;
    }

    async prepareInterview(userId, company, role) {
        return `Preparing for ${role} at ${company}? Excellent. Research their mission, prepare STAR method examples, and remember - confidence comes from preparation. You've got this.`;
    }
}

module.exports = Naledi;
