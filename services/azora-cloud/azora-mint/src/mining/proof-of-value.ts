import { ValueCalculator, ValueContribution, ValueScore } from './value-calculator';
import crypto from 'crypto';

export interface MiningReward {
    userId: string;
    amount: number;
    valueScore: number;
    difficulty: number;
    attributionBonus: number;
    timestamp: string;
    transactionId: string;
}

export class ProofOfValue {
    private valueCalculator: ValueCalculator;
    private baseReward: number;
    private difficultyAdjustment: number;

    constructor(baseReward: number = 10) {
        this.valueCalculator = new ValueCalculator();
        this.baseReward = baseReward;
        this.difficultyAdjustment = 1.0;
    }

    /**
     * Mine AZR tokens based on value contribution
     */
    async mine(contribution: ValueContribution): Promise<MiningReward> {
        console.log(`⛏️ PoV Mining: ${contribution.type} by ${contribution.userId}`);

        // Calculate value score
        const valueScore = this.valueCalculator.updateUserScore(contribution);

        // Calculate reward
        const contributionValue = this.valueCalculator.calculateContributionValue(contribution);
        const attributionBonus = this.calculateAttributionBonus(contribution);

        const reward = this.calculateReward(
            contributionValue,
            this.difficultyAdjustment,
            attributionBonus
        );

        // Create mining reward
        const miningReward: MiningReward = {
            userId: contribution.userId,
            amount: reward,
            valueScore: contributionValue,
            difficulty: this.difficultyAdjustment,
            attributionBonus,
            timestamp: new Date().toISOString(),
            transactionId: `pov-${crypto.randomUUID()}`
        };

        // Mint tokens (integrate with blockchain)
        await this.mintTokens(miningReward);

        console.log(`✅ Mined ${reward} AZR for ${contribution.userId}`);

        return miningReward;
    }

    /**
     * Calculate mining reward
     */
    private calculateReward(
        valueScore: number,
        difficulty: number,
        attributionBonus: number
    ): number {
        return this.baseReward * (valueScore / 100) * difficulty * (1 + attributionBonus);
    }

    /**
     * Calculate attribution bonus
     */
    private calculateAttributionBonus(contribution: ValueContribution): number {
        // Bonus for properly attributing others
        if (contribution.metadata.attributedCreators) {
            const count = contribution.metadata.attributedCreators.length;
            return Math.min(0.5, count * 0.1); // Max 50% bonus, 10% per attribution
        }
        return 0;
    }

    /**
     * Mint tokens to user's wallet
     */
    private async mintTokens(reward: MiningReward): Promise<void> {
        try {
            // Integrate with blockchain
            await fetch('http://localhost:3011/api/blockchain/transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: 'ubo-fund', // Ubuntu fund mints new tokens
                    to: reward.userId,
                    amount: reward.amount,
                    currency: 'AZR',
                    type: 'Mining',
                    data: {
                        proofOfValue: true,
                        valueScore: reward.valueScore,
                        difficulty: reward.difficulty,
                        attributionBonus: reward.attributionBonus
                    }
                })
            });
        } catch (error) {
            console.error('Failed to mint tokens:', error);
            throw error;
        }
    }

    /**
     * Adjust difficulty based on network activity
     */
    adjustDifficulty(networkHashRate: number): void {
        // Increase difficulty if too many tokens being mined
        if (networkHashRate > 1000) {
            this.difficultyAdjustment *= 1.1;
        } else if (networkHashRate < 100) {
            this.difficultyAdjustment *= 0.9;
        }

        console.log(`⚙️ Difficulty adjusted to ${this.difficultyAdjustment}`);
    }

    /**
     * Get mining statistics
     */
    getStats() {
        return {
            baseReward: this.baseReward,
            difficulty: this.difficultyAdjustment,
            leaderboard: this.valueCalculator.getLeaderboard(10)
        };
    }

    /**
     * Get user's value score
     */
    getUserScore(userId: string): ValueScore | undefined {
        return this.valueCalculator.getUserScore(userId);
    }
}

export default ProofOfValue;
