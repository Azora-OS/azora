import { AttributionTracker, Attribution } from './attribution-tracker';

export class TransferValidator {
    private attributionTracker: AttributionTracker;

    constructor(attributionTracker: AttributionTracker) {
        this.attributionTracker = attributionTracker;
    }

    /**
     * Validate transfer includes proper attribution
     */
    validateTransfer(
        from: string,
        to: string,
        amount: number,
        attribution?: Attribution
    ): { valid: boolean; error?: string; royalties?: Map<string, number> } {
        // Check if attribution is required
        if (amount > 0 && !attribution) {
            return {
                valid: false,
                error: 'Attribution required for all value transfers'
            };
        }

        if (!attribution) {
            return { valid: true }; // Zero-value transfers don't need attribution
        }

        // Validate attribution structure
        if (!attribution.originalCreator) {
            return {
                valid: false,
                error: 'Original creator must be specified'
            };
        }

        if (!attribution.valueChain || attribution.valueChain.length === 0) {
            return {
                valid: false,
                error: 'Value chain must be specified'
            };
        }

        // Calculate royalty distribution
        const royalties = this.attributionTracker.calculateRoyaltyDistribution(
            attribution,
            amount
        );

        return {
            valid: true,
            royalties
        };
    }

    /**
     * Process transfer with attribution
     */
    async processAttributedTransfer(
        from: string,
        to: string,
        amount: number,
        attribution: Attribution
    ): Promise<{ success: boolean; royalties: Map<string, number> }> {
        // Validate transfer
        const validation = this.validateTransfer(from, to, amount, attribution);

        if (!validation.valid) {
            throw new Error(validation.error);
        }

        // Calculate royalties
        const royalties = validation.royalties || new Map();
        const royaltyTotal = Array.from(royalties.values()).reduce((sum, val) => sum + val, 0);
        const netAmount = amount - royaltyTotal;

        console.log(`🔗 Processing attributed transfer:`);
        console.log(`   From: ${from} → To: ${to}`);
        console.log(`   Amount: ${amount} AZR`);
        console.log(`   Net: ${netAmount} AZR`);
        console.log(`   Royalties: ${royaltyTotal} AZR`);

        // Distribute royalties
        for (const [recipient, royaltyAmount] of royalties.entries()) {
            await this.transferRoyalty(from, recipient, royaltyAmount, attribution);
        }

        // Transfer net amount
        await this.executeTransfer(from, to, netAmount);

        return {
            success: true,
            royalties
        };
    }

    /**
     * Transfer royalty to creator
     */
    private async transferRoyalty(
        from: string,
        to: string,
        amount: number,
        attribution: Attribution
    ): Promise<void> {
        try {
            await fetch('http://localhost:3011/api/blockchain/transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from,
                    to,
                    amount,
                    currency: 'AZR',
                    type: 'Transfer',
                    data: {
                        royalty: true,
                        attribution
                    }
                })
            });
            console.log(`   💰 Royalty: ${amount} AZR → ${to}`);
        } catch (error) {
            console.error('Royalty transfer failed:', error);
        }
    }

    /**
     * Execute main transfer
     */
    private async executeTransfer(from: string, to: string, amount: number): Promise<void> {
        try {
            await fetch('http://localhost:3011/api/blockchain/transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from,
                    to,
                    amount,
                    currency: 'AZR',
                    type: 'Transfer'
                })
            });
        } catch (error) {
            console.error('Transfer failed:', error);
            throw error;
        }
    }
}

export default TransferValidator;
