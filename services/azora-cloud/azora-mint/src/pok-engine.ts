import * as crypto from 'crypto';

interface Activity {
    type: string;
    userId: string;
    timestamp: number;
    score?: number;
    metadata?: {
        difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
        score?: number;
        timeSpent?: number;
    };
}

interface Proof {
    activityType: string;
    userId: string;
    timestamp: number;
    metadata: any;
    weight: number;
    verified: boolean;
}

interface ValidationResult {
    valid: boolean;
    reason?: string;
    proof?: Proof;
}

export class ProofOfKnowledgeEngine {
    activityTypes: {
        [key: string]: { weight: number; baseReward: number };
    };

    constructor() {
        this.activityTypes = {
            COURSE_COMPLETION: { weight: 1.0, baseReward: 100 },
            LESSON_COMPLETION: { weight: 0.3, baseReward: 10 },
            QUIZ_PASSED: { weight: 0.5, baseReward: 25 },
            ASSIGNMENT_SUBMITTED: { weight: 0.4, baseReward: 15 },
            PEER_TEACHING: { weight: 0.8, baseReward: 50 },
            DISCUSSION_CONTRIBUTION: { weight: 0.2, baseReward: 5 },
            PROJECT_COMPLETION: { weight: 1.2, baseReward: 150 },
            CERTIFICATION_EARNED: { weight: 2.0, baseReward: 500 },
        };
    }

    validateProof(activity: Activity): ValidationResult {
        if (!activity || !activity.type) {
            return { valid: false, reason: 'Invalid activity structure' };
        }

        const activityConfig = this.activityTypes[activity.type];
        if (!activityConfig) {
            return { valid: false, reason: 'Unknown activity type' };
        }

        if (!activity.userId || !activity.timestamp) {
            return { valid: false, reason: 'Missing required fields' };
        }

        if (activity.type === 'QUIZ_PASSED' && (!activity.score || activity.score < 70)) {
            return { valid: false, reason: 'Quiz score below passing threshold' };
        }

        const proof: Proof = {
            activityType: activity.type,
            userId: activity.userId,
            timestamp: activity.timestamp,
            metadata: activity.metadata || {},
            weight: activityConfig.weight,
            verified: true,
        };

        return { valid: true, proof };
    }

    calculateReward(proof: Proof): number {
        const config = this.activityTypes[proof.activityType];
        if (!config) {return 0;}

        let reward = config.baseReward * proof.weight;

        if (proof.metadata.difficulty) {
            const difficultyMultiplier = {
                beginner: 1.0,
                intermediate: 1.5,
                advanced: 2.0,
                expert: 3.0,
            }[proof.metadata.difficulty] || 1.0;
            reward *= difficultyMultiplier;
        }

        if (proof.metadata.score) {
            const scoreBonus = (proof.metadata.score - 70) / 30;
            reward *= (1 + Math.max(0, scoreBonus));
        }

        if (proof.metadata.timeSpent) {
            const engagementBonus = Math.min(proof.metadata.timeSpent / 3600, 0.5);
            reward *= (1 + engagementBonus);
        }

        return Math.round(reward * 100) / 100;
    }

    generateProofHash(proof: Proof): string {
        const data = JSON.stringify({
            type: proof.activityType,
            user: proof.userId,
            time: proof.timestamp,
            meta: proof.metadata,
        });
        return crypto.createHash('sha256').update(data).digest('hex');
    }
}
