export enum ValueType {
    EDUCATIONAL_CONTRIBUTION = 'EDUCATIONAL_CONTRIBUTION',
    CODE_CONTRIBUTION = 'CODE_CONTRIBUTION',
    COMMUNITY_BUILDING = 'COMMUNITY_BUILDING',
    CONTENT_CREATION = 'CONTENT_CREATION',
    ECONOMIC_ACTIVITY = 'ECONOMIC_ACTIVITY'
}

export interface ValueContribution {
    userId: string;
    type: ValueType;
    description: string;
    timestamp: string;
    metadata: Record<string, any>;
}

export interface ValueScore {
    userId: string;
    totalScore: number;
    breakdown: {
        educational: number;
        code: number;
        community: number;
        content: number;
        economic: number;
    };
    lastUpdated: string;
}

export class ValueCalculator {
    private userScores: Map<string, ValueScore>;

    constructor() {
        this.userScores = new Map();
    }

    /**
     * Calculate value score for a contribution
     */
    calculateContributionValue(contribution: ValueContribution): number {
        switch (contribution.type) {
            case ValueType.EDUCATIONAL_CONTRIBUTION:
                return this.calculateEducationalValue(contribution);
            case ValueType.CODE_CONTRIBUTION:
                return this.calculateCodeValue(contribution);
            case ValueType.COMMUNITY_BUILDING:
                return this.calculateCommunityValue(contribution);
            case ValueType.CONTENT_CREATION:
                return this.calculateContentValue(contribution);
            case ValueType.ECONOMIC_ACTIVITY:
                return this.calculateEconomicValue(contribution);
            default:
                return 0;
        }
    }

    /**
     * Calculate educational contribution value
     */
    private calculateEducationalValue(contribution: ValueContribution): number {
        const { metadata } = contribution;
        let score = 0;

        // Course creation
        if (metadata.courseCreated) {
            score += 100;
        }

        // Question answered
        if (metadata.questionAnswered) {
            score += 10;
            if (metadata.answerAccepted) {
                score += 20; // Bonus for accepted answer
            }
        }

        // Tutoring session
        if (metadata.tutoringSession) {
            score += 50 * (metadata.sessionDuration || 1); // Per hour
        }

        // Student helped
        if (metadata.studentsHelped) {
            score += 5 * metadata.studentsHelped;
        }

        return score;
    }

    /**
     * Calculate code contribution value
     */
    private calculateCodeValue(contribution: ValueContribution): number {
        const { metadata } = contribution;
        let score = 0;

        // Project created
        if (metadata.projectCreated) {
            score += 200;
        }

        // Pull request merged
        if (metadata.prMerged) {
            score += 50;
            score += (metadata.linesChanged || 0) * 0.1; // 0.1 per line
        }

        // Bug fixed
        if (metadata.bugFixed) {
            score += 30;
            if (metadata.criticalBug) {
                score += 70; // Critical bugs worth more
            }
        }

        // Code review
        if (metadata.codeReview) {
            score += 20;
        }

        return score;
    }

    /**
     * Calculate community building value
     */
    private calculateCommunityValue(contribution: ValueContribution): number {
        const { metadata } = contribution;
        let score = 0;

        // Mentoring
        if (metadata.mentoring) {
            score += 100 * (metadata.menteesCount || 1);
        }

        // Event organized
        if (metadata.eventOrganized) {
            score += 150;
            score += (metadata.attendees || 0) * 2; // 2 per attendee
        }

        // Community support
        if (metadata.communitySupport) {
            score += 25;
        }

        return score;
    }

    /**
     * Calculate content creation value
     */
    private calculateContentValue(contribution: ValueContribution): number {
        const { metadata } = contribution;
        let score = 0;

        // Article written
        if (metadata.articleWritten) {
            score += 75;
            score += (metadata.views || 0) * 0.5; // 0.5 per view
        }

        // Video created
        if (metadata.videoCreated) {
            score += 100;
            score += (metadata.views || 0) * 0.5;
        }

        // Documentation
        if (metadata.documentation) {
            score += 50;
        }

        return score;
    }

    /**
     * Calculate economic activity value
     */
    private calculateEconomicValue(contribution: ValueContribution): number {
        const { metadata } = contribution;
        let score = 0;

        // Transaction volume
        if (metadata.transactionAmount) {
            score += metadata.transactionAmount * 0.01; // 1% of transaction value
        }

        // Marketplace sale
        if (metadata.marketplaceSale) {
            score += metadata.saleAmount * 0.05; // 5% of sale value
        }

        return score;
    }

    /**
     * Update user's total value score
     */
    updateUserScore(contribution: ValueContribution): ValueScore {
        const value = this.calculateContributionValue(contribution);

        let userScore = this.userScores.get(contribution.userId);

        if (!userScore) {
            userScore = {
                userId: contribution.userId,
                totalScore: 0,
                breakdown: {
                    educational: 0,
                    code: 0,
                    community: 0,
                    content: 0,
                    economic: 0
                },
                lastUpdated: new Date().toISOString()
            };
        }

        // Update breakdown
        switch (contribution.type) {
            case ValueType.EDUCATIONAL_CONTRIBUTION:
                userScore.breakdown.educational += value;
                break;
            case ValueType.CODE_CONTRIBUTION:
                userScore.breakdown.code += value;
                break;
            case ValueType.COMMUNITY_BUILDING:
                userScore.breakdown.community += value;
                break;
            case ValueType.CONTENT_CREATION:
                userScore.breakdown.content += value;
                break;
            case ValueType.ECONOMIC_ACTIVITY:
                userScore.breakdown.economic += value;
                break;
        }

        // Update total
        userScore.totalScore += value;
        userScore.lastUpdated = new Date().toISOString();

        this.userScores.set(contribution.userId, userScore);

        return userScore;
    }

    /**
     * Get user's value score
     */
    getUserScore(userId: string): ValueScore | undefined {
        return this.userScores.get(userId);
    }

    /**
     * Get leaderboard
     */
    getLeaderboard(limit: number = 10): ValueScore[] {
        return Array.from(this.userScores.values())
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, limit);
    }
}

export default ValueCalculator;
