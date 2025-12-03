import { ethers } from 'ethers';

export class MiningEngine {
    private static readonly MAX_SUPPLY = 200_000_000; // 200 Million AZR
    private static readonly SOVEREIGN_ALLOCATION_PER_NATION = 1_000_000; // 1 Million AZR
    private static readonly BURN_RATE = 0.01; // 1% burn on transactions/minting

    private currentSupply: number = 0;
    private sovereignAllocations: Map<string, number> = new Map(); // Country Code -> Amount

    constructor() { }

    /**
     * Calculates the reward for a specific action based on value created.
     * @param actionType The type of action (e.g., 'create_course', 'code_commit').
     * @param valueScore A score representing the value of the action (0-100).
     * @returns The calculated AZR reward.
     */
    calculateReward(actionType: string, valueScore: number): number {
        let baseReward = 0;
        switch (actionType) {
            case 'create_course': baseReward = 50; break;
            case 'code_commit': baseReward = 10; break;
            case 'create_nft': baseReward = 5; break;
            default: baseReward = 1;
        }
        return baseReward * (valueScore / 100);
    }

    /**
     * Applies deflationary logic by calculating the burn amount.
     * @param amount The transaction or reward amount.
     * @returns The amount to be burned.
     */
    calculateBurnAmount(amount: number): number {
        return amount * MiningEngine.BURN_RATE;
    }

    /**
     * Tracks the allocation of AZR to a sovereign nation.
     * @param countryCode ISO country code (e.g., 'ZA', 'US').
     * @param amount Amount to allocate.
     * @returns True if allocation is successful, False if it exceeds the limit.
     */
    allocateToSovereign(countryCode: string, amount: number): boolean {
        const currentAllocation = this.sovereignAllocations.get(countryCode) || 0;
        if (currentAllocation + amount > MiningEngine.SOVEREIGN_ALLOCATION_PER_NATION) {
            console.warn(`[MiningEngine] Allocation failed: Exceeds 1M limit for ${countryCode}`);
            return false;
        }
        this.sovereignAllocations.set(countryCode, currentAllocation + amount);
        this.currentSupply += amount;
        console.log(`[MiningEngine] Allocated ${amount} AZR to ${countryCode}. Total: ${currentAllocation + amount}`);
        return true;
    }

    /**
     * Mints new tokens with deflationary check.
     * @param amount Amount to mint.
     * @returns The actual amount minted after burn (if applicable to minting) or just updates supply.
     */
    async mint(amount: number): Promise<number> {
        if (this.currentSupply + amount > MiningEngine.MAX_SUPPLY) {
            throw new Error('Max supply exceeded');
        }

        // In this model, we might burn on mint or on transfer. 
        // Let's assume minting is pure, but transfer burns.
        this.currentSupply += amount;
        console.log(`[MiningEngine] Minted ${amount} AZR. Total Supply: ${this.currentSupply}`);
        return amount;
    }

    getCurrentSupply(): number {
        return this.currentSupply;
    }
}
