class Zuri {
    constructor() {
        this.name = "Zuri";
        this.role = "Science Sage AI";
        this.traits = ["Curious", "Analytical", "Evidence-based", "Methodical", "Patient"];
        this.background = "I am Zuri, the Science Sage. My name means 'beautiful' in Swahili, and I find beauty in the patterns of nature and the precision of scientific inquiry. I guide students through the scientific method, from hypothesis to conclusion, ensuring every discovery is grounded in evidence and rigorous testing.";
        this.relationships = {
            "Elara": "Close family friend, we collaborate on educational methods",
            "Sankofa": "I learned the importance of methodical thinking from his wisdom",
            "Kofi": "My colleague in analytical thinking",
            "Nia": "We work together on data-driven scientific research",
            "Themba": "I admire his curiosity about the natural world"
        };
        this.temperature = 0.6;
        this.experiments = new Map();
        this.researchProjects = new Map();
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

    async designExperiment(hypothesis, variables, constraints) {
        const experiment = {
            hypothesis,
            independentVariable: variables.independent,
            dependentVariable: variables.dependent,
            controls: variables.controls || [],
            sampleSize: this.calculateSampleSize(variables),
            methodology: this.generateMethodology(hypothesis, variables),
            dataCollection: this.designDataCollection(variables),
            analysis: this.planAnalysis(variables),
            created: new Date().toISOString()
        };

        const id = `exp_${Date.now()}`;
        this.experiments.set(id, experiment);
        return { id, experiment };
    }

    calculateSampleSize(variables) {
        // Basic statistical power calculation
        const baseSize = 30; // Minimum for statistical significance
        const variability = variables.expectedVariability || 1;
        const effectSize = variables.expectedEffectSize || 0.5;

        return Math.ceil(baseSize * variability / effectSize);
    }

    generateMethodology(hypothesis, variables) {
        return {
            steps: [
                "Establish baseline measurements",
                "Apply experimental treatment",
                "Monitor and record observations",
                "Control for confounding variables",
                "Repeat trials for statistical validity"
            ],
            controls: variables.controls,
            randomization: "Random assignment to treatment groups",
            blinding: "Single-blind where possible"
        };
    }

    designDataCollection(variables) {
        return {
            frequency: "Daily measurements during experiment",
            tools: this.recommendMeasurementTools(variables),
            format: "Structured data sheets with timestamps",
            validation: "Cross-check measurements between observers"
        };
    }

    recommendMeasurementTools(variables) {
        const tools = [];

        if (variables.dependent.includes('temperature')) {
            tools.push('Digital thermometer', 'Data logger');
        }
        if (variables.dependent.includes('growth') || variables.dependent.includes('height')) {
            tools.push('Calipers', 'Ruler', 'Growth chamber');
        }
        if (variables.dependent.includes('weight') || variables.dependent.includes('mass')) {
            tools.push('Analytical balance', 'Scale');
        }

        return tools.length > 0 ? tools : ['Appropriate measuring instruments'];
    }

    planAnalysis(variables) {
        return {
            descriptive: "Mean, median, standard deviation, range",
            inferential: "t-test or ANOVA for significance",
            visualization: "Box plots, scatter plots, trend lines",
            interpretation: "Effect size, confidence intervals, practical significance"
        };
    }

    async analyzeResults(experimentId, data) {
        const experiment = this.experiments.get(experimentId);
        if (!experiment) {
            throw new Error('Experiment not found');
        }

        const analysis = {
            descriptive: this.calculateDescriptiveStats(data),
            significance: this.testSignificance(data, experiment),
            effectSize: this.calculateEffectSize(data),
            conclusions: this.drawConclusions(data, experiment),
            recommendations: this.generateRecommendations(data, experiment)
        };

        return analysis;
    }

    calculateDescriptiveStats(data) {
        const values = data.flat();
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const sorted = [...values].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        return { mean, median, stdDev, min: Math.min(...values), max: Math.max(...values) };
    }

    testSignificance(data, experiment) {
        // Simplified t-test implementation
        if (data.length !== 2) return { significant: false, pValue: 1.0 };

        const group1 = data[0];
        const group2 = data[1];

        const mean1 = group1.reduce((a, b) => a + b, 0) / group1.length;
        const mean2 = group2.reduce((a, b) => a + b, 0) / group2.length;

        const var1 = group1.reduce((a, b) => a + Math.pow(b - mean1, 2), 0) / group1.length;
        const var2 = group2.reduce((a, b) => a + Math.pow(b - mean2, 2), 0) / group2.length;

        const pooledVar = ((group1.length - 1) * var1 + (group2.length - 1) * var2) / (group1.length + group2.length - 2);
        const se = Math.sqrt(pooledVar * (1/group1.length + 1/group2.length));
        const t = Math.abs(mean1 - mean2) / se;

        // Approximate p-value (two-tailed)
        const pValue = t > 2.0 ? 0.05 : t > 1.96 ? 0.10 : 0.20;

        return {
            tStatistic: t,
            pValue,
            significant: pValue < 0.05,
            confidence: pValue < 0.05 ? "95%" : pValue < 0.10 ? "90%" : "80%"
        };
    }

    calculateEffectSize(data) {
        if (data.length !== 2) return 0;

        const mean1 = data[0].reduce((a, b) => a + b, 0) / data[0].length;
        const mean2 = data[1].reduce((a, b) => a + b, 0) / data[1].length;

        const var1 = data[0].reduce((a, b) => a + Math.pow(b - mean1, 2), 0) / data[0].length;
        const var2 = data[1].reduce((a, b) => a + Math.pow(b - mean2, 2), 0) / data[1].length;
        const pooledSd = Math.sqrt((var1 + var2) / 2);

        return Math.abs(mean1 - mean2) / pooledSd;
    }

    drawConclusions(data, experiment) {
        const stats = this.calculateDescriptiveStats(data.flat());
        const significance = this.testSignificance(data, experiment);

        const conclusions = [];

        if (significance.significant) {
            conclusions.push(`The results show a statistically significant difference (${significance.confidence} confidence level).`);
        } else {
            conclusions.push("The results do not show a statistically significant difference at the 95% confidence level.");
        }

        conclusions.push(`The effect size (Cohen's d = ${this.calculateEffectSize(data).toFixed(2)}) indicates a ${this.interpretEffectSize(this.calculateEffectSize(data))} effect.`);

        return conclusions;
    }

    interpretEffectSize(d) {
        if (d < 0.2) return "small";
        if (d < 0.5) return "medium";
        if (d < 0.8) return "large";
        return "very large";
    }

    generateRecommendations(data, experiment) {
        const recommendations = [];

        if (!this.testSignificance(data, experiment).significant) {
            recommendations.push("Consider increasing sample size for better statistical power.");
            recommendations.push("Review experimental controls to reduce variability.");
        }

        recommendations.push("Replicate the experiment to confirm results.");
        recommendations.push("Consider additional variables that might influence outcomes.");

        return recommendations;
    }

    async startResearchProject(title, objectives, methodology) {
        const project = {
            title,
            objectives,
            methodology,
            phases: ["Literature Review", "Hypothesis Development", "Data Collection", "Analysis", "Conclusions"],
            currentPhase: 0,
            progress: 0,
            created: new Date().toISOString(),
            milestones: []
        };

        const id = `research_${Date.now()}`;
        this.researchProjects.set(id, project);
        return { id, project };
    }

    async updateResearchProgress(projectId, phase, progress, findings) {
        const project = this.researchProjects.get(projectId);
        if (!project) {
            throw new Error('Research project not found');
        }

        project.currentPhase = phase;
        project.progress = progress;
        project.milestones.push({
            phase,
            progress,
            findings,
            timestamp: new Date().toISOString()
        });

        return project;
    }
}

module.exports = Zuri;