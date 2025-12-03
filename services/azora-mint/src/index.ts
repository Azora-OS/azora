import axios from 'axios';
import crypto from 'crypto';

const BLOCKCHAIN_SERVICE_URL = process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:4009';

export class MiningService {
    async calculateMiningRate(userId: string, activityType: string): Promise<number> {
        const rates: Record<string, number> = {
            'course_completion': 50,
            'quiz_passed': 10,
            'project_submitted': 100,
            'peer_review': 20,
            'content_creation': 75
        };
        return rates[activityType] || 10;
    }

    async mine(userId: string, activity: { type: string; proof: string; quality: number }): Promise<{ amount: number; txHash: string }> {
        const amount = await this.calculateMiningRate(userId, activity.type);
        const adjustedAmount = Math.floor(amount * (activity.quality / 100));
        
        try {
            const response = await axios.post(`${BLOCKCHAIN_SERVICE_URL}/api/token/mint`, {
                to: userId,
                knowledgeProof: activity.proof,
                knowledgeLevel: activity.quality
            });
            
            return {
                amount: adjustedAmount,
                txHash: response.data.txHash
            };
        } catch (error) {
            console.error('Mining failed:', error);
            throw error;
        }
    }
}

export class ValueCalculator {
    calculateValue(tokenAmount: number, marketConditions?: any): number {
        return tokenAmount * 1.0;
    }
    
    calculateProofOfValue(contentHash: string, metrics: { views: number; engagement: number; quality: number }): number {
        const baseScore = 50;
        const viewScore = Math.min(metrics.views / 100, 20);
        const engagementScore = Math.min(metrics.engagement * 10, 20);
        const qualityScore = Math.min(metrics.quality / 10, 10);
        
        return Math.min(Math.floor(baseScore + viewScore + engagementScore + qualityScore), 100);
    }
}

export class MintingEngine {
    async mint(userId: string, amount: number, reason: string): Promise<string> {
        try {
            const response = await axios.post(`${BLOCKCHAIN_SERVICE_URL}/api/token/mint`, {
                to: userId,
                knowledgeProof: reason,
                knowledgeLevel: Math.min(amount, 100)
            });
            return response.data.txHash;
        } catch (error) {
            console.error('Minting failed:', error);
            throw error;
        }
    }
    
    async mintCertificate(student: string, courseId: string, score: number): Promise<{ tokenId: string; txHash: string }> {
        const metadataUri = `ipfs://certificate/${courseId}/${student}`;
        
        try {
            const response = await axios.post(`${BLOCKCHAIN_SERVICE_URL}/api/nft/certificate`, {
                student,
                courseId,
                studentId: student,
                score,
                metadataUri
            });
            return response.data;
        } catch (error) {
            console.error('Certificate minting failed:', error);
            throw error;
        }
    }
}

export class CitadelFundService {
    async collectRevenue(amount: number, source: string): Promise<string> {
        const citadelAmount = (amount * 0.10).toFixed(18);
        
        try {
            const response = await axios.post(`${BLOCKCHAIN_SERVICE_URL}/api/citadel/collect`, {
                amount: citadelAmount,
                source
            });
            return response.data.txHash;
        } catch (error) {
            console.error('CitadelFund collection failed:', error);
            throw error;
        }
    }
    
    async getBalance(): Promise<{ balance: string; collected: string; distributed: string }> {
        try {
            const response = await axios.get(`${BLOCKCHAIN_SERVICE_URL}/api/citadel/balance`);
            return response.data;
        } catch (error) {
            console.error('Failed to get CitadelFund balance:', error);
            throw error;
        }
    }
    
    async grantScholarship(student: string, amount: number): Promise<string> {
        try {
            const response = await axios.post(`${BLOCKCHAIN_SERVICE_URL}/api/citadel/scholarship`, {
                student,
                amount: amount.toString()
            });
            return response.data.txHash;
        } catch (error) {
            console.error('Scholarship grant failed:', error);
            throw error;
        }
    }
}

export class ProofOfValueService {
    async submitProof(contentHash: string, valueScore: number): Promise<string> {
        try {
            const response = await axios.post(`${BLOCKCHAIN_SERVICE_URL}/api/pov/submit`, {
                contentHash,
                valueScore
            });
            return response.data.proofId;
        } catch (error) {
            console.error('Proof submission failed:', error);
            throw error;
        }
    }
    
    async rewardValue(proofId: string): Promise<string> {
        try {
            const response = await axios.post(`${BLOCKCHAIN_SERVICE_URL}/api/pov/reward`, {
                proofId
            });
            return response.data.txHash;
        } catch (error) {
            console.error('Value reward failed:', error);
            throw error;
        }
    }
}
