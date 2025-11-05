// azora-mint/src/interfaces/Reward.ts

export interface KnowledgeRewardRequest {
    transactionId: string;
    userId: string;
    economyId: string;
    amount: number;
    knowledgeType: string;
    knowledgeId: string;
    signature: string;
    userEmail: string;
}

export interface RewardValidationResult {
    isValid: boolean;
    reason?: string;
    error?: string;
    code?: string;
}

export interface TransferResult {
    hash: string;
    block?: number;
    signer?: string;
    covenantFunction?: string;
}

export interface AuditLogEntry {
    auditReportId: string;
    status: "SUCCESS" | "FAILURE" | "ALREADY_PAID";
    genesisTimestamp: string;
    serviceInitiator: string;
    destinationService: string;
    rewardDetails: {
        userId: string;
        economyId: string;
        rewardAmount: number;
        sourceTransactionId: string;
    };
    complianceCheck: {
        kycStatus: string;
        complianceLogId: string;
        idempotencyCheck: boolean;
    };
    fundStatusSnapshot: {
        uboBalanceBefore: number;
        uboBalanceAfter: number;
        transferExecuted: number;
    };
    blockchainDetails?: {
        hash: string;
        block: number;
        signer: string;
        covenantFunction: string;
    };
    auditCheckpoints: Record<string, boolean | string>;
    errorDetails?: string;
}