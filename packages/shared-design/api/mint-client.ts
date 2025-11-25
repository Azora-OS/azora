/**
 * Azora Mint API Client
 * Connects to azora-mint service for token operations
 */

const MINT_API_URL = process.env.NEXT_PUBLIC_MINT_API_URL || 'http://localhost:3080';

export interface WalletResponse {
    id: string;
    userId: string;
    address: string;
    balance: number;
    staked: number;
    earned: number;
}

export interface MiningResponse {
    success: boolean;
    reward: number;
    wallet: WalletResponse;
}

export interface StakeResponse {
    success: boolean;
    stake: {
        id: string;
        amount: number;
        rewardRate: number;
        endDate: string;
    };
    expectedReward: number;
}

export class AzoraMintClient {
    private baseUrl: string;

    constructor(baseUrl: string = MINT_API_URL) {
        this.baseUrl = baseUrl;
    }

    // Wallet Management
    async createWallet(userId: string): Promise<WalletResponse> {
        const response = await fetch(`${this.baseUrl}/api/wallet/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        const data = await response.json();
        return data.wallet;
    }

    async getWallet(userId: string): Promise<WalletResponse> {
        const response = await fetch(`${this.baseUrl}/api/wallet/${userId}`);
        const data = await response.json();
        return data.wallet;
    }

    async getBalance(userId: string): Promise<number> {
        const response = await fetch(`${this.baseUrl}/api/wallet/${userId}/balance`);
        const data = await response.json();
        return data.balance;
    }

    // Mining (Earning Tokens)
    async startMining(params: {
        userId: string;
        activityId: string;
        activityType: 'course_completion' | 'job_completion' | 'skill_assessment';
        performance?: number;
    }): Promise<MiningResponse> {
        const response = await fetch(`${this.baseUrl}/api/mining/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });
        return response.json();
    }

    async getMiningHistory(userId: string): Promise<any[]> {
        const response = await fetch(`${this.baseUrl}/api/mining/history/${userId}`);
        const data = await response.json();
        return data.history;
    }

    async getMiningStats(userId: string): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/mining/stats/${userId}`);
        return response.json();
    }

    // Staking
    async stake(userId: string, amount: number, duration: number = 30): Promise<StakeResponse> {
        const response = await fetch(`${this.baseUrl}/api/stake`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, amount, duration })
        });
        return response.json();
    }

    async unstake(stakeId: string): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/unstake`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stakeId })
        });
        return response.json();
    }

    async getStakes(userId: string): Promise<any[]> {
        const response = await fetch(`${this.baseUrl}/api/stakes/${userId}`);
        const data = await response.json();
        return data.stakes;
    }

    // Transactions
    async transfer(fromUserId: string, toUserId: string, amount: number, reason?: string): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/transfer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fromUserId, toUserId, amount, reason })
        });
        return response.json();
    }

    async getTransactions(userId: string): Promise<any[]> {
        const response = await fetch(`${this.baseUrl}/api/transactions?userId=${userId}`);
        const data = await response.json();
        return data.transactions;
    }

    // Economics
    async getEconomicStats(): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/economics/stats`);
        return response.json();
    }

    // Exchange
    async getExchangeRate(from: string, to: string): Promise<number> {
        const response = await fetch(`${this.baseUrl}/api/exchange/rate?from=${from}&to=${to}`);
        const data = await response.json();
        return data.rate;
    }

    async convert(userId: string, amount: number, from: string, to: string): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/exchange/convert`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, amount, from, to })
        });
        return response.json();
    }
}

// Singleton instance
export const mintClient = new AzoraMintClient();

export default mintClient;
