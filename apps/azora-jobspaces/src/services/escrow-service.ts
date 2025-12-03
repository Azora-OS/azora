import { ApiClient } from './api-client';

export interface EscrowTransaction {
    id: string;
    jobId: string;
    employer: string;
    freelancer: string;
    amount: number;
    status: 'funded' | 'released' | 'disputed' | 'refunded';
    createdAt: string;
}

export class EscrowService {
    private apiClient: ApiClient;

    constructor() {
        this.apiClient = new ApiClient();
    }

    async createEscrow(jobId: string, freelancerAddress: string, amount: number): Promise<{ success: boolean; escrowId?: string; error?: string }> {
        try {
            const response = await fetch(`${this.apiClient['baseUrl']}/escrow/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ jobId, freelancerAddress, amount })
            });

            if (!response.ok) {
                const error = await response.json();
                return { success: false, error: error.message || 'Failed to create escrow' };
            }

            const data = await response.json();
            return { success: true, escrowId: data.escrowId };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    async releasePayment(escrowId: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
        try {
            const response = await fetch(`${this.apiClient['baseUrl']}/escrow/${escrowId}/release`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                return { success: false, error: error.message || 'Failed to release payment' };
            }

            const data = await response.json();
            return { success: true, txHash: data.txHash };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    async disputeEscrow(escrowId: string, reason: string): Promise<{ success: boolean; disputeId?: string; error?: string }> {
        try {
            const response = await fetch(`${this.apiClient['baseUrl']}/escrow/${escrowId}/dispute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ reason })
            });

            if (!response.ok) {
                const error = await response.json();
                return { success: false, error: error.message || 'Failed to raise dispute' };
            }

            const data = await response.json();
            return { success: true, disputeId: data.disputeId };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
}
