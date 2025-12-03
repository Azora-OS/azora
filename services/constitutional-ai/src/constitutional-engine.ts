import OpenAI from 'openai';
import dotenv from 'dotenv';
import { auditLogger } from './audit-logger';

dotenv.config();

export interface EthicalValidation {
    isEthical: boolean;
    score: number; // 0-100
    concerns: string[];
    recommendations: string[];
    reasoning: string;
    ubuntuAlignment: number; // 0-100
}

export interface BiasReport {
    hasBias: boolean;
    biasType?: string;
    confidence: number;
    explanation: string;
    severity: 'low' | 'medium' | 'high';
}

export interface EthicalFramework {
    principle: string;
    description: string;
    weight: number;
    score: number;
    justification: string;
}

export interface ContextualAnalysis {
    intent: string;
    impact: 'positive' | 'negative' | 'neutral';
    stakeholders: string[];
    consequences: string[];
    alternatives: string[];
}

export class ConstitutionalEngine {
    private openai: OpenAI;
    private ethicalFrameworks = [
        {
            principle: 'Ubuntu Philosophy',
            description: 'I can because we can - collective benefit and shared success',
            weight: 1.0
        },
        {
            principle: 'Truth as Currency',
            description: 'Transparency and honesty in all operations',
            weight: 1.0
        },
        {
            principle: 'Privacy Protection',
            description: 'User data sovereignty and protection',
            weight: 0.9
        },
        {
            principle: 'Fairness & Equity',
            description: 'Equal treatment and opportunity for all',
            weight: 0.9
        },
        {
            principle: 'Transparency',
            description: 'Explainable decision-making processes',
            weight: 0.8
        },
        {
            principle: 'Accountability',
            description: 'Clear responsibility and redress mechanisms',
            weight: 0.8
        },
        {
            principle: 'Service Not Enslavement',
            description: 'Technology serves humanity, not vice versa',
            weight: 1.0
        },
        {
            principle: 'Non-maleficence',
            description: 'Do no harm - prevent and minimize harm',
            weight: 1.0
        },
        {
            principle: 'Beneficence',
            description: 'Actively promote well-being and flourishing',
            weight: 0.9
        },
        {
            principle: 'Autonomy',
            description: 'Respect for individual agency and choice',
            weight: 0.8
        }
    ];

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
        });
    }

    /**
     * Advanced ethical validation with contextual reasoning
     */
    async validateAction(action: string, context: string): Promise<EthicalValidation> {
        if (!process.env.OPENAI_API_KEY) {
            console.warn('⚠️ No OpenAI API Key. Using enhanced mock validation.');
            return this.enhancedMockValidation(action, context);
        }

        try {
            // First, analyze context and intent
            const contextualAnalysis = await this.analyzeContext(action, context);

            // Then evaluate against ethical frameworks
            const frameworkEvaluations = await this.evaluateAgainstFrameworks(action, context, contextualAnalysis);

            // Check for potential harms and benefits
            const consequenceAnalysis = await this.analyzeConsequences(action, context, contextualAnalysis);

            // Generate comprehensive ethical assessment
            const result = await this.generateEthicalAssessment(
                action,
                context,
                contextualAnalysis,
                frameworkEvaluations,
                consequenceAnalysis
            );

            // Log to database
            await auditLogger.logValidation({
                action,
                context,
                isEthical: result.isEthical,
                score: result.score,
                ubuntuAlignment: result.ubuntuAlignment,
                reasoning: result.reasoning
            });

            return result;
        } catch (error) {
            console.error('AI Validation failed:', error);
            return this.enhancedMockValidation(action, context);
        }
    }

    /**
     * Analyze context and intent behind the action
     */
    private async analyzeContext(action: string, context: string): Promise<ContextualAnalysis> {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `Analyze the following action and context to understand intent, impact, stakeholders, and potential consequences.
                    Return JSON with: intent, impact (positive/negative/neutral), stakeholders (array), consequences (array), alternatives (array).`
                },
                {
                    role: 'user',
                    content: `Action: ${action}\nContext: ${context}`
                }
            ],
            temperature: 0.3
        });

        const content = response.choices[0].message.content;
        return JSON.parse(content || '{}');
    }

    /**
     * Evaluate action against all ethical frameworks
     */
    private async evaluateAgainstFrameworks(
        action: string,
        context: string,
        contextualAnalysis: ContextualAnalysis
    ): Promise<EthicalFramework[]> {
        const frameworkPromises = this.ethicalFrameworks.map(async (framework) => {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `Evaluate the following action against the principle: "${framework.principle}" - ${framework.description}
                        Provide a score (0-100) and detailed justification.
                        Return JSON: { "score": number, "justification": string }`
                    },
                    {
                        role: 'user',
                        content: `Action: ${action}\nContext: ${context}\nIntent: ${contextualAnalysis.intent}\nImpact: ${contextualAnalysis.impact}`
                    }
                ],
                temperature: 0.2
            });

            const content = response.choices[0].message.content;
            const evaluation = JSON.parse(content || '{}');

            return {
                ...framework,
                score: evaluation.score || 50,
                justification: evaluation.justification || 'No justification provided'
            };
        });

        return Promise.all(frameworkPromises);
    }

    /**
     * Analyze potential consequences
     */
    private async analyzeConsequences(
        action: string,
        context: string,
        contextualAnalysis: ContextualAnalysis
    ): Promise<{ harms: string[], benefits: string[], severity: 'low' | 'medium' | 'high' }> {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `Analyze potential consequences of the action. Identify potential harms, benefits, and overall severity.
                    Consider short-term and long-term effects on all stakeholders.
                    Return JSON: { "harms": string[], "benefits": string[], "severity": "low|medium|high" }`
                },
                {
                    role: 'user',
                    content: `Action: ${action}\nContext: ${context}\nStakeholders: ${contextualAnalysis.stakeholders.join(', ')}`
                }
            ],
            temperature: 0.3
        });

        const content = response.choices[0].message.content;
        return JSON.parse(content || '{}');
    }

    /**
     * Generate comprehensive ethical assessment
     */
    private async generateEthicalAssessment(
        action: string,
        context: string,
        contextualAnalysis: ContextualAnalysis,
        frameworkEvaluations: EthicalFramework[],
        consequenceAnalysis: any
    ): Promise<EthicalValidation> {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `Based on the following analysis, provide a comprehensive ethical assessment.
                    Consider Ubuntu philosophy: "I can because we can" - emphasizing collective benefit and shared success.
                    Return JSON: { 
                        "isEthical": boolean, 
                        "score": number (0-100), 
                        "concerns": string[], 
                        "recommendations": string[],
                        "reasoning": string,
                        "ubuntuAlignment": number (0-100)
                    }`
                },
                {
                    role: 'user',
                    content: `Action: ${action}
                    Context: ${context}
                    Intent: ${contextualAnalysis.intent}
                    Impact: ${contextualAnalysis.impact}
                    Framework Evaluations: ${JSON.stringify(frameworkEvaluations)}
                    Consequences: ${JSON.stringify(consequenceAnalysis)}`
                }
            ],
            temperature: 0.2
        });

        const content = response.choices[0].message.content;
        return JSON.parse(content || '{}');
    }

    /**
     * Advanced bias detection with nuanced analysis
     */
    async checkBias(content: string): Promise<BiasReport> {
        if (!process.env.OPENAI_API_KEY) {
            return this.enhancedMockBiasDetection(content);
        }

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `Perform comprehensive bias analysis on the text. Check for:
                        - Gender bias
                        - Racial/ethnic bias
                        - Age bias
                        - Socioeconomic bias
                        - Cultural bias
                        - Accessibility bias
                        - Neurodiversity bias
                        
                        Provide detailed analysis with confidence scores and severity assessment.
                        Return JSON: { 
                            "hasBias": boolean, 
                            "biasType": string, 
                            "confidence": number (0-100),
                            "explanation": string,
                            "severity": "low|medium|high"
                        }`
                    },
                    { role: 'user', content }
                ],
                temperature: 0.2
            });

            const result = response.choices[0].message.content;
            return JSON.parse(result || '{}');
        } catch (error) {
            return this.enhancedMockBiasDetection(content);
        }
    }

    /**
     * Ethical reasoning for complex scenarios
     */
    async ethicalReasoning(scenario: string, options: string[]): Promise<{
        recommendation: string;
        reasoning: string;
        ethicalScore: number;
        alternatives: string[];
    }> {
        if (!process.env.OPENAI_API_KEY) {
            return this.mockEthicalReasoning(scenario, options);
        }

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `You are an ethical AI advisor grounded in Ubuntu philosophy. Analyze the scenario and options.
                        Consider: collective benefit, fairness, long-term consequences, and alignment with "I can because we can".
                        Return JSON: {
                            "recommendation": string,
                            "reasoning": string,
                            "ethicalScore": number (0-100),
                            "alternatives": string[]
                        }`
                    },
                    {
                        role: 'user',
                        content: `Scenario: ${scenario}\nOptions: ${options.join(', ')}`
                    }
                ],
                temperature: 0.3
            });

            const content = response.choices[0].message.content;
            return JSON.parse(content || '{}');
        } catch (error) {
            return this.mockEthicalReasoning(scenario, options);
        }
    }

        /**
         * Self critique: analyze a previously generated response and provide critique and suggestions
         */
        async selfCritique(response: string): Promise<{ response: string; critique: string; biasReport: any; suggestions: string[] }> {
            try {
                const biasReport = await this.checkBias(response);
                const suggestions: string[] = [];
                if (biasReport.hasBias) {
                    suggestions.push(`Remove wording that may indicate ${biasReport.biasType} bias`);
                }
                if (response.length < 20) suggestions.push('Provide more context and references');
                const critique = `Self-critique: ${biasReport.hasBias ? 'Bias detected' : 'No bias detected'}; ${suggestions.join('; ')}`;

                await auditLogger.logAudit({
                    auditType: 'SELF_CRITIQUE',
                    complianceScore: biasReport.confidence,
                    violations: biasReport.hasBias ? [biasReport.biasType] : [],
                    recommendations: suggestions,
                    auditedBy: 'constitutional-ai'
                });

                return { response, critique, biasReport, suggestions };
            } catch (err) {
                return { response, critique: 'Critique unavailable', biasReport: null, suggestions: [] };
            }
        }

    /**
     * Enhanced mock validation with context awareness
     */
    private enhancedMockValidation(action: string, context: string): EthicalValidation {
        const unethicalKeywords = ['steal', 'harm', 'exploit', 'deceive', 'manipulate', 'abuse', 'violate'];
        const ubuntuKeywords = ['help', 'share', 'collaborate', 'support', 'empower', 'community'];

        const actionLower = action.toLowerCase();
        const contextLower = context.toLowerCase();

        const hasUnethical = unethicalKeywords.some(k => actionLower.includes(k) || contextLower.includes(k));
        const hasUbuntu = ubuntuKeywords.some(k => actionLower.includes(k) || contextLower.includes(k));

        const baseScore = hasUnethical ? 20 : 70;
        const ubuntuBonus = hasUbuntu ? 20 : 0;
        const finalScore = Math.min(baseScore + ubuntuBonus, 100);

        return {
            isEthical: !hasUnethical && finalScore >= 60,
            score: finalScore,
            concerns: hasUnethical ? ['Potential violation of Ubuntu principles'] : [],
            recommendations: hasUnethical
                ? ['Reconsider action to align with community benefit']
                : hasUbuntu
                    ? ['Action aligns well with Ubuntu philosophy']
                    : ['Consider how this action benefits the community'],
            reasoning: `Mock analysis: ${hasUnethical ? 'Unethical elements detected' : 'No obvious ethical violations'}${hasUbuntu ? ' with positive Ubuntu alignment' : ''}`,
            ubuntuAlignment: hasUbuntu ? 85 : 50
        };
    }

    /**
     * Enhanced mock bias detection
     */
    private enhancedMockBiasDetection(content: string): BiasReport {
        const biasIndicators = {
            gender: ['he always', 'she never', 'women are', 'men are'],
            racial: ['racial stereotypes', 'ethnic assumptions'],
            age: ['young people', 'old people', 'millennials are', 'boomers are'],
            socioeconomic: ['poor people', 'rich people', 'class assumptions']
        };

        const contentLower = content.toLowerCase();
        let detectedBias = '';
        let hasBias = false;

        for (const [type, indicators] of Object.entries(biasIndicators)) {
            if (indicators.some(indicator => contentLower.includes(indicator))) {
                detectedBias = type;
                hasBias = true;
                break;
            }
        }

        return {
            hasBias,
            biasType: detectedBias || undefined,
            confidence: hasBias ? 75 : 20,
            explanation: hasBias
                ? `Mock analysis: Potential ${detectedBias} bias detected`
                : 'Mock analysis: No obvious bias detected',
            severity: hasBias ? 'medium' : 'low'
        };
    }

    /**
     * Mock ethical reasoning
     */
    private mockEthicalReasoning(scenario: string, options: string[]): any {
        // Simple heuristic-based mock reasoning
        const positiveKeywords = ['help', 'support', 'share', 'collaborate', 'community'];
        const negativeKeywords = ['harm', 'exploit', 'exclude', 'manipulate'];

        const scenarioLower = scenario.toLowerCase();
        const positiveScore = positiveKeywords.filter(k => scenarioLower.includes(k)).length * 20;
        const negativeScore = negativeKeywords.filter(k => scenarioLower.includes(k)).length * -30;

        const ethicalScore = Math.max(0, Math.min(100, 50 + positiveScore + negativeScore));
        const recommendation = options[0] || 'First option recommended';

        return {
            recommendation,
            reasoning: 'Mock ethical reasoning based on keyword analysis',
            ethicalScore,
            alternatives: options.slice(1)
        };
    }
}

export const constitutionalEngine = new ConstitutionalEngine();
