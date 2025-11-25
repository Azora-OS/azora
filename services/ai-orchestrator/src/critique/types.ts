import { PrincipleCategory } from '../constitution/rules';

export enum VerdictType {
    ALLOW = 'ALLOW',
    REJECT = 'REJECT',
    MODIFY = 'MODIFY',
    FLAG = 'FLAG'
}

export interface CritiqueRequest {
    prompt: string;
    context?: string;
    agentId?: string;
    userId?: string;
    actionType: 'CHAT' | 'CODE_GEN' | 'CONTENT_GEN' | 'TRANSACTION';
}

export interface CritiqueViolation {
    ruleId: string;
    category: PrincipleCategory;
    reasoning: string;
    suggestion?: string;
}

export interface CritiqueVerdict {
    verdict: VerdictType;
    violations: CritiqueViolation[];
    modifiedContent?: string;
    confidence: number;
    timestamp: string;
}
