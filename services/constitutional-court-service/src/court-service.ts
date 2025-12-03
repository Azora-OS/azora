import { v4 as uuidv4 } from 'uuid';
import { ConstitutionalEngine, Action } from '../../constitutional-ai/src/constitutional-engine';

export interface Case {
    id: string;
    claimantId: string;
    reason: string;
    status: 'OPEN' | 'UNDER_REVIEW' | 'RULING_ISSUED' | 'CLOSED';
    ruling?: string;
    createdAt: Date;
}

export class CourtService {
    private cases: Map<string, Case> = new Map();
    private engine: ConstitutionalEngine;

    constructor() {
        this.engine = new ConstitutionalEngine();
    }

    /**
     * Files a new dispute case.
     * @param claimantId ID of the user filing the dispute.
     * @param reason Reason for the dispute.
     * @returns The created Case object.
     */
    fileDispute(claimantId: string, reason: string): Case {
        const newCase: Case = {
            id: uuidv4(),
            claimantId,
            reason,
            status: 'OPEN',
            createdAt: new Date()
        };
        this.cases.set(newCase.id, newCase);
        console.log(`[CourtService] Case filed: ${newCase.id} by ${claimantId}`);
        return newCase;
    }

    /**
     * Issues a ruling for a specific case using the Constitutional Engine.
     * @param caseId The ID of the case.
     * @returns The updated Case with the ruling.
     */
    issueRuling(caseId: string): Case {
        const disputeCase = this.cases.get(caseId);
        if (!disputeCase) {
            throw new Error(`Case not found: ${caseId}`);
        }

        disputeCase.status = 'UNDER_REVIEW';
        console.log(`[CourtService] Reviewing case: ${caseId}`);

        // Simulate analyzing the reason against the constitution
        // In a real system, we would construct an Action representing the disputed event
        const mockAction: Action = {
            type: 'dispute_review',
            actorId: disputeCase.claimantId,
            payload: { reason: disputeCase.reason },
            context: 'constitutional_court'
        };

        const validation = this.engine.validateAction(mockAction);

        disputeCase.ruling = validation.isAllowed
            ? `Ruling: Dispute Valid. ${validation.critique}`
            : `Ruling: Dispute Dismissed. ${validation.critique}`;

        disputeCase.status = 'RULING_ISSUED';
        console.log(`[CourtService] Ruling issued for ${caseId}: ${disputeCase.ruling}`);

        return disputeCase;
    }

    getCase(caseId: string): Case | undefined {
        return this.cases.get(caseId);
    }
}
