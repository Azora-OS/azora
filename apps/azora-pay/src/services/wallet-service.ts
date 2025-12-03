import { config } from '../config';

export interface Transaction {
    id: string;
    type: 'send' | 'receive' | 'mint' | 'burn';
    amount: number;
    from: string;
    to: string;
    timestamp: string;
    status: 'pending' | 'confirmed' | 'failed';
    txHash?: string;
}

export interface WalletBalance {
    azr: number;
    usd: number;
    eth: number;
}

export class WalletService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = config.apiBaseUrl;
    }

    async getBalance(address: string): Promise<WalletBalance> {
        try {
            const response = await fetch(`${this.baseUrl}/mint/balance/${address}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch balance');
            }

            const data = await response.json();
            return {
                azr: data.balance || 0,
                usd: (data.balance || 0) * 1.5, // Mock conversion rate
                eth: (data.balance || 0) * 0.0005 // Mock conversion rate
            };
        } catch (error) {
            console.error('Balance fetch error:', error);
            return { azr: 0, usd: 0, eth: 0 };
        }
    }

    async sendAZR(to: string, amount: number): Promise<{ success: boolean; txHash?: string; error?: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/mint/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ to, amount })
            });

            if (!response.ok) {
                const error = await response.json();
                return { success: false, error: error.message || 'Transfer failed' };
            }

            const data = await response.json();
            return { success: true, txHash: data.txHash };
        } catch (error) {
            console.error('Send error:', error);
            return { success: false, error: 'Network error' };
        }
    }

    async getTransactionHistory(address: string, limit: number = 50): Promise<Transaction[]> {
        try {
            const response = await fetch(`${this.baseUrl}/mint/transactions/${address}?limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                return [];
            }

            return await response.json();
        } catch (error) {
            console.error('Transaction history error:', error);
            return [];
        }
    }

    async getWalletAddress(): Promise<string> {
        // In production, this would derive from user's account
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.walletAddress || '0x0000000000000000000000000000000000000000';
    }
}
