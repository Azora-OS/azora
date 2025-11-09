// azora-mint/src/services/aegis.ts

import axios from 'axios';
import { KnowledgeRewardRequest } from '../interfaces/Reward.js';

const AEGIS_BASE_URL = process.env.AEGIS_BASE_URL || 'http://localhost:4098';

export class AegisService {
    static async verifySignature(request: KnowledgeRewardRequest): Promise<{ isValid: boolean; reason?: string }> {
        try {
            const response = await axios.post(`${AEGIS_BASE_URL}/api/verify/signature`, {
                signature: request.signature,
                data: request
            });
            return {
                isValid: response.data.valid === true,
                reason: response.data.valid ? undefined : 'Invalid signature'
            };
        } catch (error) {
            console.error('Aegis signature verification failed:', error);
            return { isValid: false, reason: 'Signature verification service unavailable' };
        }
    }

    static async checkUserCompliance(userId: string): Promise<{ status: string; logId: string }> {
        try {
            const response = await axios.get(`${AEGIS_BASE_URL}/api/compliance/user/${userId}`);
            return {
                status: response.data.kycStatus,
                logId: response.data.complianceLogId
            };
        } catch (error) {
            console.error('Aegis compliance check failed:', error);
            return { status: 'ERROR', logId: 'N/A' };
        }
    }

    static async logTransactionToCitadel(rewardData: KnowledgeRewardRequest, transactionHash: string): Promise<void> {
        try {
            await axios.post(`${AEGIS_BASE_URL}/api/citadel/log/transaction`, {
                type: 'PROOF_OF_KNOWLEDGE',
                rewardData,
                transactionHash,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Citadel logging failed:', error);
            // Don't throw - this is not critical for the transaction
        }
    }
}
