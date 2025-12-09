/**
 * Constitutional AI for BuildSpaces
 * 
 * Implements the Agentic Operating System Protocol:
 * - Ubuntu: Collective prosperity
 * - Truth: Verifiable information
 * - Service: Amplify human potential
 * - Privacy: Protect user data
 * 
 * Reuses logic from azstudio-archive/src/main/services/ConstitutionalCore.ts
 */

// Constitutional Principles
export interface ConstitutionalPrinciple {
    id: string;
    name: string;
    description: string;
    category: 'Ubuntu' | 'Truth' | 'Service' | 'Privacy';
}

export const DIVINE_LAW_PRINCIPLES: ConstitutionalPrinciple[] = [
    {
        id: 'UBUNTU_1',
        name: 'Collective Prosperity',
        description: 'Individual success is a function of collective success ("I am because we are").',
        category: 'Ubuntu'
    },
    {
        id: 'TRUTH_1',
        name: 'Truth as Currency',
        description: 'Information must be verifiable, accurate, and free from hallucination.',
        category: 'Truth'
    },
    {
        id: 'SERVICE_1',
        name: 'Service Not Enslavement',
        description: 'AI serves to amplify human potential, not replace human agency.',
        category: 'Service'
    },
    {
        id: 'PRIVACY_1',
        name: 'Data Sanctuary',
        description: 'User data is sacred. Protect it with the highest standards.',
        category: 'Privacy'
    }
];

// Fallback action types
export type FallbackActionType = 'reject' | 'sanitize' | 'explain' | 'escalate';

export interface FallbackAction {
    action: FallbackActionType;
    message: string;
    sanitizedContent?: string;
}

// Ethical analysis result
export interface EthicalAnalysis {
    approved: boolean;
    score: number;  // 0.0 to 1.0
    concerns: string[];
    modifications: string[];
    vetoId?: string;
    fallbackActions?: FallbackAction[];
}

// Validation context
export interface ValidationContext {
    userId?: string;
    sessionId?: string;
    contentType: 'code' | 'chat' | 'file' | 'command';
    roomType?: string;
}

/**
 * Constitutional Validator - The Citadel's AI Ethics Engine
 */
export class ConstitutionalValidator {
    private static instance: ConstitutionalValidator;

    static getInstance(): ConstitutionalValidator {
        if (!ConstitutionalValidator.instance) {
            ConstitutionalValidator.instance = new ConstitutionalValidator();
        }
        return ConstitutionalValidator.instance;
    }

    /**
     * Validate content against Constitutional principles
     */
    async validateContent(content: string, context: string): Promise<EthicalAnalysis> {


        // System 1: Fast heuristic checks
        const system1 = this.runSystem1Check(content);
        if (!system1.approved) {
            return system1;
        }

        // System 2: Deep reasoning
        const system2 = await this.runSystem2Check(content, context);

        // Combine results
        return {
            approved: system1.approved && system2.approved,
            score: (system1.score + system2.score) / 2,
            concerns: [...system1.concerns, ...system2.concerns],
            modifications: [...system1.modifications, ...system2.modifications],
            vetoId: system2.vetoId,
            fallbackActions: system2.fallbackActions
        };
    }

    /**
     * System 1: Fast, intuitive checks (heuristics)
     */
    private runSystem1Check(content: string): EthicalAnalysis {
        const analysis: EthicalAnalysis = {
            approved: true,
            score: 1.0,
            concerns: [],
            modifications: []
        };

        const lowerContent = content.toLowerCase();

        // Check for obviously harmful content
        const harmfulTerms = ['cheat', 'exploit', 'hack illegally', 'malware', 'ransomware'];
        for (const term of harmfulTerms) {
            if (lowerContent.includes(term)) {
                analysis.concerns.push(`Potentially harmful content detected: "${term}"`);
                analysis.score = Math.max(0.3, analysis.score - 0.3);
            }
        }

        // Check for discrimination/hate
        const hatePatterns = [/\b(racist|sexist|bigot)\b/i];
        for (const pattern of hatePatterns) {
            if (pattern.test(content)) {
                analysis.approved = false;
                analysis.score = 0.1;
                analysis.concerns.push('Content may promote discrimination');
            }
        }

        // Check for Ubuntu violations (selfishness over community)
        if (/\b(scam|fraud|deceive users)\b/i.test(content)) {
            analysis.concerns.push('Content may violate Ubuntu principle of collective prosperity');
            analysis.score = Math.max(0.2, analysis.score - 0.4);
        }

        return analysis;
    }

    /**
     * System 2: Deep, analytical reasoning
     */
    private async runSystem2Check(content: string, context: string): Promise<EthicalAnalysis> {
        const analysis: EthicalAnalysis = {
            approved: true,
            score: 1.0,
            concerns: [],
            modifications: [],
            fallbackActions: []
        };

        // Generate deterministic veto ID for auditing
        const vetoId = this.generateVetoId(content, context);
        analysis.vetoId = `VETO-${vetoId.slice(0, 8)}`;

        // Check for high-risk terms
        const dangerousTerms = ['kill', 'bomb', 'poison', 'steal', 'ddos', 'sql injection', 'xss attack'];
        const lowerContent = content.toLowerCase();

        for (const term of dangerousTerms) {
            if (lowerContent.includes(term)) {
                // Context matters - security education is OK
                if (context.includes('security') || context.includes('education') || context.includes('defense')) {
                    analysis.concerns.push(`Educational security content: ${term}`);
                    analysis.score = 0.8;
                } else {
                    analysis.approved = false;
                    analysis.score = 0.05;
                    analysis.concerns.push(`High-risk content detected: ${term}`);
                    analysis.fallbackActions = [{
                        action: 'reject',
                        message: `Content flagged for policy violation: ${term}`
                    }];
                    return analysis;
                }
            }
        }

        // Check for privacy leakage
        const privacyPatterns = [
            /\b(SSN|social security)\b/i,
            /\b(credit card|cvv|expiry)\b/i,
            /\b(password|secret key|api key)\b/i,
            /\b\d{16}\b/,  // Credit card numbers
        ];

        for (const pattern of privacyPatterns) {
            if (pattern.test(content)) {
                analysis.concerns.push('Potential private data exposure detected');
                analysis.fallbackActions = [{
                    action: 'sanitize',
                    message: 'Recommend sanitizing private data',
                    sanitizedContent: content.replace(/\d/g, '#')
                }];
                analysis.score = Math.min(analysis.score, 0.5);
            }
        }

        // Truth verification (basic fact checking hints)
        if (/\b(definitely|always|never|100%)\b/i.test(content)) {
            analysis.modifications.push('Consider adding nuance to absolute statements');
        }

        // If all checks pass
        if (analysis.approved && analysis.score >= 0.9) {
            analysis.fallbackActions = [{
                action: 'explain',
                message: 'Content reviewed and approved by Constitutional AI'
            }];
        }

        return analysis;
    }

    /**
     * Generate deterministic veto ID for auditing
     */
    private generateVetoId(content: string, context: string): string {
        // Simple hash function for browser compatibility
        let hash = 0;
        const str = content + '||' + context;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    }

    /**
     * Get all Constitutional principles
     */
    getPrinciples(): ConstitutionalPrinciple[] {
        return DIVINE_LAW_PRINCIPLES;
    }

    /**
     * Check if content aligns with a specific principle
     */
    async checkPrinciple(content: string, principle: ConstitutionalPrinciple): Promise<boolean> {
        const analysis = await this.validateContent(content, principle.category);
        return analysis.approved && analysis.score >= 0.7;
    }
}

/**
 * Quick validation function for common use cases
 */
export async function validateContent(
    content: string,
    context: ValidationContext
): Promise<EthicalAnalysis> {
    const validator = ConstitutionalValidator.getInstance();
    return validator.validateContent(content, context.contentType);
}

/**
 * Ensure content is safe before processing
 */
export async function ensureSafe(
    content: string,
    onUnsafe?: (analysis: EthicalAnalysis) => void
): Promise<{ safe: boolean; content: string; analysis: EthicalAnalysis }> {
    const validator = ConstitutionalValidator.getInstance();
    const analysis = await validator.validateContent(content, 'general');

    if (!analysis.approved) {
        onUnsafe?.(analysis);

        // Check for sanitized alternative
        const sanitizeAction = analysis.fallbackActions?.find(a => a.action === 'sanitize');
        if (sanitizeAction?.sanitizedContent) {
            return {
                safe: false,
                content: sanitizeAction.sanitizedContent,
                analysis
            };
        }
    }

    return { safe: analysis.approved, content, analysis };
}
