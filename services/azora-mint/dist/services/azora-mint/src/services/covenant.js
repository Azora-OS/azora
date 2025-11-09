// azora-mint/src/services/covenant.ts
import axios from 'axios';
const COVENANT_BASE_URL = process.env.COVENANT_BASE_URL || 'http://localhost:4400';
export class CovenantService {
    static async transferFromUBO(userId, economyId, amount) {
        try {
            const response = await axios.post(`${COVENANT_BASE_URL}/api/transfer/ubo`, {
                userId,
                economyId,
                amount,
                timestamp: new Date().toISOString()
            });
            return {
                hash: response.data.transactionHash,
                block: response.data.blockNumber,
                signer: response.data.signer,
                covenantFunction: 'transferFromUBO'
            };
        }
        catch (error) {
            console.error('Covenant transfer failed:', error);
            throw new Error('Blockchain transfer failed');
        }
    }
    static async getUBOBalance(economyId) {
        try {
            const response = await axios.get(`${COVENANT_BASE_URL}/api/balance/ubo/${economyId}`);
            return response.data.balance;
        }
        catch (error) {
            console.error('UBO balance check failed:', error);
            return 0;
        }
    }
}
