export interface ConstitutionalPrinciple {
    id: string;
    name: string;
    description: string;
    weight: number;
}

export interface BiasDetectionResult {
    hasBias: boolean;
    biasType?: string[];
    confidence: number;
    affectedGroups?: string[];
    recommendations: string[];
}

export interface EthicalAnalysis {
    score: number;
    violations: string[];
    concerns: string[];
    recommendations: string[];
    principles: { [key: string]: number };
}

export interface SelfCritiqueResult {
    originalDecision: string;
    critiques: string[];
    improvedDecision?: string;
    confidence: number;
}

export interface ConstitutionalCheckResult {
    compliant: boolean;
    score: number;
    violations: string[];
    biasDetection: BiasDetectionResult;
    ethicalAnalysis: EthicalAnalysis;
    selfCritique?: SelfCritiqueResult;
    timestamp: string;
}
