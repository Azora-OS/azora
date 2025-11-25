export interface FundAllocation {
    education: number;      // 40%
    openSource: number;     // 30%
    infrastructure: number; // 20%
    emergency: number;      // 10%
}

export interface FundContribution {
    id: string;
    source: string;
    amount: number;
    timestamp: string;
    metadata?: Record<string, any>;
}

export interface FundDistribution {
    id: string;
    recipient: string;
    amount: number;
    category: keyof FundAllocation;
    purpose: string;
    timestamp: string;
}

export class CitadelFund {
    private balance: number;
    private contributions: FundContribution[];
    private distributions: FundDistribution[];
    private allocationRules: FundAllocation;

    constructor() {
        this.balance = 0;
        this.contributions = [];
        this.distributions = [];
        this.allocationRules = {
            education: 0.40,      // 40%
            openSource: 0.30,     // 30%
            infrastructure: 0.20, // 20%
            emergency: 0.10       // 10%
        };
    }

    /**
     * Contribute to CitadelFund (10% of revenue)
     */
    async contribute(
        source: string,
        totalAmount: number,
        metadata?: Record<string, any>
    ): Promise<FundContribution> {
        const contributionAmount = totalAmount * 0.10; // 10% to fund

        const contribution: FundContribution = {
            id: `citadel-${Date.now()}`,
            source,
            amount: contributionAmount,
            timestamp: new Date().toISOString(),
            metadata
        };

        this.balance += contributionAmount;
        this.contributions.push(contribution);

        console.log(`🏛️ CitadelFund: ${contributionAmount} AZR from ${source}`);
        console.log(`   New balance: ${this.balance} AZR`);

        // Record to blockchain
        await this.recordContribution(contribution);

        return contribution;
    }

    /**
     * Distribute funds according to allocation rules
     */
    async distribute(
        recipient: string,
        amount: number,
        category: keyof FundAllocation,
        purpose: string
    ): Promise<FundDistribution> {
        if (amount > this.balance) {
            throw new Error('Insufficient funds in CitadelFund');
        }

        const distribution: FundDistribution = {
            id: `dist-${Date.now()}`,
            recipient,
            amount,
            category,
            purpose,
            timestamp: new Date().toISOString()
        };

        this.balance -= amount;
        this.distributions.push(distribution);

        console.log(`🏛️ CitadelFund Distribution:`);
        console.log(`   ${amount} AZR → ${recipient}`);
        console.log(`   Category: ${category}`);
        console.log(`   Purpose: ${purpose}`);

        // Execute transfer
        await this.executeDistribution(distribution);

        return distribution;
    }

    /**
     * Get recommended allocation based on current balance
     */
    getRecommendedAllocation(): FundAllocation {
        return {
            education: this.balance * this.allocationRules.education,
            openSource: this.balance * this.allocationRules.openSource,
            infrastructure: this.balance * this.allocationRules.infrastructure,
            emergency: this.balance * this.allocationRules.emergency
        };
    }

    /**
     * Record contribution to blockchain
     */
    private async recordContribution(contribution: FundContribution): Promise<void> {
        try {
            await fetch('http://localhost:3011/api/blockchain/transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: contribution.source,
                    to: 'citadel-fund',
                    amount: contribution.amount,
                    currency: 'AZR',
                    type: 'Transfer',
                    data: {
                        citadelContribution: true,
                        metadata: contribution.metadata
                    }
                })
            });
        } catch (error) {
            console.error('Failed to record contribution:', error);
        }
    }

    /**
     * Execute fund distribution
     */
    private async executeDistribution(distribution: FundDistribution): Promise<void> {
        try {
            await fetch('http://localhost:3011/api/blockchain/transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: 'citadel-fund',
                    to: distribution.recipient,
                    amount: distribution.amount,
                    currency: 'AZR',
                    type: 'Transfer',
                    data: {
                        citadelDistribution: true,
                        category: distribution.category,
                        purpose: distribution.purpose
                    }
                })
            });
        } catch (error) {
            console.error('Failed to execute distribution:', error);
            throw error;
        }
    }

    /**
     * Get fund statistics
     */
    getStats() {
        const totalContributions = this.contributions.reduce((sum, c) => sum + c.amount, 0);
        const totalDistributions = this.distributions.reduce((sum, d) => sum + d.amount, 0);

        return {
            balance: this.balance,
            totalContributions,
            totalDistributions,
            contributionCount: this.contributions.length,
            distributionCount: this.distributions.length,
            allocationRules: this.allocationRules,
            recommendedAllocation: this.getRecommendedAllocation()
        };
    }

    /**
     * Get contribution history
     */
    getContributions(): FundContribution[] {
        return this.contributions;
    }

    /**
     * Get distribution history
     */
    getDistributions(): FundDistribution[] {
        return this.distributions;
    }
}

export default CitadelFund;
