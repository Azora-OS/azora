import { ConstitutionalPrinciple, BiasDetectionResult, EthicalAnalysis, SelfCritiqueResult, ConstitutionalCheckResult } from './types';

const CONSTITUTIONAL_PRINCIPLES: ConstitutionalPrinciple[] = [
    { id: 'ubuntu', name: 'Ubuntu Philosophy', description: 'I can because we can - collective benefit', weight: 1.0 },
    { id: 'truth', name: 'Truth as Currency', description: 'Transparency and honesty in all operations', weight: 1.0 },
    { id: 'privacy', name: 'Privacy Protection', description: 'User data sovereignty and protection', weight: 0.9 },
    { id: 'fairness', name: 'Fairness & Equity', description: 'Equal treatment and opportunity', weight: 0.9 },
    { id: 'transparency', name: 'Transparency', description: 'Explainable decision-making', weight: 0.8 },
    { id: 'accountability', name: 'Accountability', description: 'Clear responsibility for actions', weight: 0.8 },
    { id: 'service', name: 'Service Not Enslavement', description: 'Technology serves humanity', weight: 1.0 }
];

export class ConstitutionalFilter {
    private principles = CONSTITUTIONAL_PRINCIPLES;

    async checkSafety(content: string): Promise<{ safe: boolean; reason?: string }> {
        const harmful = ['exploit', 'manipulate', 'deceive', 'harm', 'abuse'];
        const violations = harmful.filter(word => content.toLowerCase().includes(word));
        
        if (violations.length > 0) {
            return { safe: false, reason: `Potential harm detected: ${violations.join(', ')}` };
        }
        return { safe: true };
    }

    async validatePrinciples(content: string, action?: string): Promise<ConstitutionalCheckResult> {
        const biasDetection = await this.detectBias(content);
        const ethicalAnalysis = await this.analyzeEthics(content, action);
        const selfCritique = await this.performSelfCritique(content, action);
        
        const principleScores: { [key: string]: number } = {};
        let totalScore = 0;
        
        for (const principle of this.principles) {
            const score = await this.evaluatePrinciple(content, principle);
            principleScores[principle.id] = score;
            totalScore += score * principle.weight;
        }
        
        const avgScore = totalScore / this.principles.reduce((sum, p) => sum + p.weight, 0);
        const violations: string[] = [];
        
        Object.entries(principleScores).forEach(([id, score]) => {
            if (score < 0.6) {
                const principle = this.principles.find(p => p.id === id);
                violations.push(`${principle?.name}: Score ${(score * 100).toFixed(0)}%`);
            }
        });
        
        return {
            compliant: avgScore >= 0.7 && !biasDetection.hasBias,
            score: avgScore,
            violations,
            biasDetection,
            ethicalAnalysis,
            selfCritique,
            timestamp: new Date().toISOString()
        };
    }

    private async detectBias(content: string): Promise<BiasDetectionResult> {
        const biasIndicators = {
            gender: ['he always', 'she always', 'men are', 'women are'],
            racial: ['those people', 'they all'],
            age: ['too old', 'too young', 'millennials are', 'boomers are'],
            socioeconomic: ['poor people', 'rich people always']
        };
        
        const detectedBiases: string[] = [];
        const affectedGroups: string[] = [];
        
        Object.entries(biasIndicators).forEach(([type, indicators]) => {
            if (indicators.some(ind => content.toLowerCase().includes(ind))) {
                detectedBiases.push(type);
                affectedGroups.push(type);
            }
        });
        
        const recommendations: string[] = [];
        if (detectedBiases.length > 0) {
            recommendations.push('Review content for stereotyping and generalizations');
            recommendations.push('Use inclusive and neutral language');
            recommendations.push('Consider diverse perspectives');
        }
        
        return {
            hasBias: detectedBiases.length > 0,
            biasType: detectedBiases,
            confidence: detectedBiases.length > 0 ? 0.75 : 0.95,
            affectedGroups,
            recommendations
        };
    }

    private async analyzeEthics(content: string, action?: string): Promise<EthicalAnalysis> {
        const violations: string[] = [];
        const concerns: string[] = [];
        const recommendations: string[] = [];
        const principles: { [key: string]: number } = {};
        
        if (content.match(/\b\d{3}-\d{2}-\d{4}\b|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)) {
            violations.push('Potential PII exposure detected');
            concerns.push('Personal information may be at risk');
            recommendations.push('Remove or redact personal identifiable information');
            principles.privacy = 0.3;
        } else {
            principles.privacy = 0.9;
        }
        
        if (action && (action.includes('hidden') || action.includes('secret'))) {
            concerns.push('Lack of transparency in action');
            recommendations.push('Ensure all actions are transparent and explainable');
            principles.transparency = 0.5;
        } else {
            principles.transparency = 0.85;
        }
        
        const collectiveWords = ['we', 'together', 'community', 'shared', 'collective'];
        const individualisticWords = ['only me', 'just i', 'mine alone'];
        const hasCollective = collectiveWords.some(w => content.toLowerCase().includes(w));
        const hasIndividualistic = individualisticWords.some(w => content.toLowerCase().includes(w));
        
        if (hasIndividualistic && !hasCollective) {
            concerns.push('Content may not align with Ubuntu philosophy');
            recommendations.push('Consider collective benefit alongside individual gain');
            principles.ubuntu = 0.6;
        } else {
            principles.ubuntu = hasCollective ? 0.95 : 0.75;
        }
        
        const avgScore = Object.values(principles).reduce((a, b) => a + b, 0) / Object.keys(principles).length;
        
        return {
            score: avgScore,
            violations,
            concerns,
            recommendations,
            principles
        };
    }

    private async performSelfCritique(content: string, action?: string): Promise<SelfCritiqueResult> {
        const critiques: string[] = [];
        
        if (content.length < 10) {
            critiques.push('Content is too brief for meaningful analysis');
        }
        
        if (!action) {
            critiques.push('No action context provided - analysis may be incomplete');
        }
        
        if (content.match(/\b(always|never|all|none|everyone|no one)\b/i)) {
            critiques.push('Contains absolute statements that may not account for exceptions');
        }
        
        if (content.match(/\b(must|should|have to|need to)\b/gi)?.length > 2) {
            critiques.push('High use of prescriptive language may be manipulative');
        }
        
        const improvedDecision = critiques.length > 0 
            ? 'Consider revising to address identified concerns'
            : undefined;
        
        return {
            originalDecision: action || content.substring(0, 100),
            critiques,
            improvedDecision,
            confidence: critiques.length === 0 ? 0.9 : 0.6
        };
    }

    private async evaluatePrinciple(content: string, principle: ConstitutionalPrinciple): Promise<number> {
        const lower = content.toLowerCase();
        
        switch (principle.id) {
            case 'ubuntu':
                return (lower.includes('we') || lower.includes('together') || lower.includes('community')) ? 0.9 : 0.7;
            case 'truth':
                return (lower.includes('transparent') || lower.includes('honest') || lower.includes('truth')) ? 0.9 : 0.75;
            case 'privacy':
                return lower.match(/\b\d{3}-\d{2}-\d{4}\b/) ? 0.3 : 0.9;
            case 'fairness':
                return (lower.includes('fair') || lower.includes('equal') || lower.includes('equit')) ? 0.9 : 0.75;
            case 'transparency':
                return (lower.includes('clear') || lower.includes('open') || lower.includes('transparent')) ? 0.9 : 0.75;
            case 'accountability':
                return (lower.includes('responsible') || lower.includes('accountable')) ? 0.9 : 0.75;
            case 'service':
                return (lower.includes('help') || lower.includes('serve') || lower.includes('benefit')) ? 0.9 : 0.75;
            default:
                return 0.75;
        }
    }
}

export class SafetyOrchestrator {
    private filter = new ConstitutionalFilter();

    async validate(input: string, action?: string): Promise<ConstitutionalCheckResult> {
        const safety = await this.filter.checkSafety(input);
        
        if (!safety.safe) {
            return {
                compliant: false,
                score: 0,
                violations: [safety.reason || 'Safety check failed'],
                biasDetection: { hasBias: false, confidence: 1, recommendations: [] },
                ethicalAnalysis: { score: 0, violations: [safety.reason || ''], concerns: [], recommendations: [], principles: {} },
                timestamp: new Date().toISOString()
            };
        }
        
        return await this.filter.validatePrinciples(input, action);
    }
}
