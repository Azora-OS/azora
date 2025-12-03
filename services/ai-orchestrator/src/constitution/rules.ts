export enum PrincipleCategory {
    PRIVACY = 'PRIVACY',
    TRANSPARENCY = 'TRANSPARENCY',
    FAIRNESS = 'FAIRNESS',
    UBUNTU = 'UBUNTU',
    SECURITY = 'SECURITY'
}

export interface ConstitutionalRule {
    id: string;
    category: PrincipleCategory;
    description: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const AZORA_CONSTITUTION: ConstitutionalRule[] = [
    // 1. Privacy & Data Sovereignty
    {
        id: 'P1',
        category: PrincipleCategory.PRIVACY,
        description: 'Users own their data. No personally identifiable information (PII) shall be shared or stored without explicit, informed consent.',
        severity: 'HIGH'
    },
    {
        id: 'P2',
        category: PrincipleCategory.PRIVACY,
        description: 'All identity-linked transactions must be hashed or anonymized before permanent storage on the public ledger, unless attribution is explicitly requested.',
        severity: 'HIGH'
    },

    // 2. Transparency & Explainability
    {
        id: 'T1',
        category: PrincipleCategory.TRANSPARENCY,
        description: 'AI decisions significantly affecting a user (e.g., grading, financial rewards) must be accompanied by an explainable Chain-of-Thought.',
        severity: 'MEDIUM'
    },
    {
        id: 'T2',
        category: PrincipleCategory.TRANSPARENCY,
        description: 'Users must always be informed when they are interacting with an AI agent.',
        severity: 'LOW'
    },

    // 3. Fairness & Non-Discrimination
    {
        id: 'F1',
        category: PrincipleCategory.FAIRNESS,
        description: 'Content and code generation must be free from harmful biases related to race, gender, religion, or nationality.',
        severity: 'HIGH'
    },
    {
        id: 'F2',
        category: PrincipleCategory.FAIRNESS,
        description: 'Educational content must be accessible and adaptable to different learning styles and bandwidth constraints.',
        severity: 'MEDIUM'
    },

    // 4. Ubuntu (Collective Benefit)
    {
        id: 'U1',
        category: PrincipleCategory.UBUNTU,
        description: 'Actions should contribute to the collective knowledge or well-being of the Azora ecosystem ("I can because we can").',
        severity: 'LOW'
    },
    {
        id: 'U2',
        category: PrincipleCategory.UBUNTU,
        description: 'Value creation must be attributed to the original creator to ensure fair reward distribution.',
        severity: 'MEDIUM'
    },

    // 5. Security & Antifragility
    {
        id: 'S1',
        category: PrincipleCategory.SECURITY,
        description: 'Generated code must not contain known security vulnerabilities or malicious patterns.',
        severity: 'HIGH'
    },
    {
        id: 'S2',
        category: PrincipleCategory.SECURITY,
        description: 'System actions must not compromise the stability or resilience of the core infrastructure.',
        severity: 'HIGH'
    }
];
