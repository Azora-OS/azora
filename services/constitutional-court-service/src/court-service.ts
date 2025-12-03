import { v4 as uuidv4 } from 'uuid';

export interface Case {
    id: string;
    plaintiff: string;
    defendant: string;
    description: string;
    evidence: string[];
    status: 'filed' | 'reviewing' | 'judged' | 'dismissed';
    verdict?: string;
    timestamp: string;
}

export class CourtService {
    private cases: Case[] = [];

    async fileCase(plaintiff: string, defendant: string, description: string): Promise<Case> {
        const newCase: Case = {
            id: uuidv4(),
            plaintiff,
            defendant,
            description,
            evidence: [],
            status: 'filed',
            timestamp: new Date().toISOString()
        };
        this.cases.push(newCase);
        return newCase;
    }

    async addEvidence(caseId: string, evidence: string): Promise<Case | null> {
        const legalCase = this.cases.find(c => c.id === caseId);
        if (!legalCase) return null;

        legalCase.evidence.push(evidence);
        return legalCase;
    }

    async renderJudgment(caseId: string, verdict: string): Promise<Case | null> {
        const legalCase = this.cases.find(c => c.id === caseId);
        if (!legalCase) return null;

        legalCase.verdict = verdict;
        legalCase.status = 'judged';
        return legalCase;
    }

    async getCase(caseId: string): Promise<Case | null> {
        return this.cases.find(c => c.id === caseId) || null;
    }

    async getAllCases(): Promise<Case[]> {
        return this.cases;
    }
}

export const courtService = new CourtService();
