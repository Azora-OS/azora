export interface Attribution {
    originalCreator: string;
    valueChain: string[]; // Chain of value creation
    royaltyPercentage: number;
    metadata?: Record<string, any>;
}

export interface AttributedTransfer {
    from: string;
    to: string;
    amount: number;
    attribution: Attribution;
    royaltyAmount: number;
    timestamp: string;
}

export class AttributionTracker {
    private attributionHistory: Map<string, Attribution[]>;

    constructor() {
        this.attributionHistory = new Map();
    }

    /**
     * Track attribution for a value creation event
     */
    trackAttribution(
        creator: string,
        valueId: string,
        metadata?: Record<string, any>
    ): Attribution {
        const attribution: Attribution = {
            originalCreator: creator,
            valueChain: [creator],
            royaltyPercentage: 5, // Default 5% royalty
            metadata
        };

        // Store attribution
        const history = this.attributionHistory.get(valueId) || [];
        history.push(attribution);
        this.attributionHistory.set(valueId, history);

        console.log(`🔗 Attribution tracked: ${creator} created ${valueId}`);

        return attribution;
    }

    /**
     * Extend value chain when value is built upon
     */
    extendValueChain(
        valueId: string,
        newContributor: string
    ): Attribution | null {
        const history = this.attributionHistory.get(valueId);

        if (!history || history.length === 0) {
            console.warn(`No attribution found for ${valueId}`);
            return null;
        }

        const original = history[0];
        const extended: Attribution = {
            ...original,
            valueChain: [...original.valueChain, newContributor]
        };

        history.push(extended);
        this.attributionHistory.set(valueId, history);

        console.log(`🔗 Value chain extended: ${valueId} → ${newContributor}`);

        return extended;
    }

    /**
     * Get attribution for a value
     */
    getAttribution(valueId: string): Attribution | null {
        const history = this.attributionHistory.get(valueId);
        return history && history.length > 0 ? history[history.length - 1] : null;
    }

    /**
     * Get full attribution history
     */
    getAttributionHistory(valueId: string): Attribution[] {
        return this.attributionHistory.get(valueId) || [];
    }

    /**
     * Calculate royalty distribution
     */
    calculateRoyaltyDistribution(
        attribution: Attribution,
        totalAmount: number
    ): Map<string, number> {
        const distribution = new Map<string, number>();

        // Original creator gets royalty percentage
        const royaltyAmount = totalAmount * (attribution.royaltyPercentage / 100);
        distribution.set(attribution.originalCreator, royaltyAmount);

        // Intermediate contributors get smaller shares
        const intermediateShare = royaltyAmount * 0.2; // 20% of royalty to intermediates
        const perContributor = intermediateShare / Math.max(1, attribution.valueChain.length - 1);

        for (let i = 1; i < attribution.valueChain.length; i++) {
            const contributor = attribution.valueChain[i];
            distribution.set(contributor, perContributor);
        }

        return distribution;
    }

    /**
     * Get attribution statistics
     */
    getStats() {
        const totalAttributions = Array.from(this.attributionHistory.values())
            .reduce((sum, history) => sum + history.length, 0);

        const uniqueCreators = new Set(
            Array.from(this.attributionHistory.values())
                .flatMap(history => history.map(a => a.originalCreator))
        );

        return {
            totalAttributions,
            uniqueCreators: uniqueCreators.size,
            trackedValues: this.attributionHistory.size
        };
    }
}

export default AttributionTracker;
