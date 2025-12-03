interface UserActivity {
    score: number;
}

interface User {
    id: string;
    activity: UserActivity;
}

interface Distribution {
    userId: string;
    amount: number;
    timestamp: Date;
}

interface Metrics {
    totalSupply: number;
    circulatingSupply: number;
    velocity: number;
    activeUsers: number;
}

interface EconomicHealth {
    supplyRatio: number;
    velocityScore: 'high' | 'healthy' | 'low';
    userEngagement: number;
    recommendation: 'maintain' | 'increase_supply' | 'increase_incentives';
}

export class EconomicPolicyEngine {
    ubiRate: number;
    ubiInterval: number;
    lastUBIDistribution: number;

    constructor() {
        this.ubiRate = 10;
        this.ubiInterval = 86400000; // 24 hours
        this.lastUBIDistribution = Date.now();
    }

    calculateUBI(userActivity: UserActivity): number {
        const baseUBI = this.ubiRate;
        const activityMultiplier = Math.min(2.0, 1 + (userActivity.score / 100));
        return Math.floor(baseUBI * activityMultiplier);
    }

    shouldDistributeUBI(): boolean {
        return Date.now() - this.lastUBIDistribution >= this.ubiInterval;
    }

    distributeUBI(users: User[]): { distributed: boolean; reason?: string; count?: number; totalAmount?: number; distributions?: Distribution[] } {
        if (!this.shouldDistributeUBI()) {
            return { distributed: false, reason: 'Too soon' };
        }

        const distributions: Distribution[] = users.map(user => ({
            userId: user.id,
            amount: this.calculateUBI(user.activity),
            timestamp: new Date(),
        }));

        this.lastUBIDistribution = Date.now();

        return {
            distributed: true,
            count: distributions.length,
            totalAmount: distributions.reduce((sum, d) => sum + d.amount, 0),
            distributions,
        };
    }

    monitorEconomy(metrics: Metrics): EconomicHealth {
        const { totalSupply, circulatingSupply, velocity, activeUsers } = metrics;

        const health: EconomicHealth = {
            supplyRatio: circulatingSupply / totalSupply,
            velocityScore: velocity > 1.5 ? 'high' : velocity > 0.8 ? 'healthy' : 'low',
            userEngagement: activeUsers / 1000,
            recommendation: 'maintain',
        };

        if (health.supplyRatio > 0.9) {
            health.recommendation = 'increase_supply';
        } else if (health.velocityScore === 'low') {
            health.recommendation = 'increase_incentives';
        }

        return health;
    }

    adjustPolicy(economicHealth: EconomicHealth): { newUBIRate: number; reason: string } {
        if (economicHealth.recommendation === 'increase_supply') {
            this.ubiRate = Math.min(20, this.ubiRate * 1.1);
        } else if (economicHealth.recommendation === 'increase_incentives') {
            this.ubiRate = Math.min(15, this.ubiRate * 1.05);
        }

        return {
            newUBIRate: this.ubiRate,
            reason: economicHealth.recommendation,
        };
    }

    // Added methods from the original implementation for compatibility
    mintTokens(amount: number, reason: string): { success: boolean, minted: number, newSupply: number } {
        // This is a simplified placeholder. In a real scenario, this would interact with a blockchain or a ledger.
        console.log(`Minting ${amount} tokens for ${reason}`);
        return { success: true, minted: amount, newSupply: 0 }; // `newSupply` should be updated properly
    }

    validateTransaction(amount: number, balance: number): { valid: boolean, message?: string } {
        if (amount > balance) {
            return { valid: false, message: "Insufficient funds" };
        }
        return { valid: true };
    }

    calculateStakingReward(amount: number, duration: number): number {
        // Simplified staking reward calculation
        const annualRate = 0.05; // 5% APR
        const dailyRate = annualRate / 365;
        return amount * dailyRate * duration;
    }
}
