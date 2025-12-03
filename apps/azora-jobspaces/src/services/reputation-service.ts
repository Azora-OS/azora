import { config } from '../config';

export interface ReputationProfile {
    score: number;
    level: string;
    verifiedSkills: string[];
    completedJobs: number;
}

export class ReputationService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = config.apiBaseUrl || 'http://localhost:3000';
    }

    async getReputation(userId: string): Promise<ReputationProfile> {
        try {
            // In this demo, userId is treated as an address
            const response = await fetch(`${this.baseUrl}/api/reputation/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch reputation');

            const data = await response.json();

            return {
                score: data.score,
                level: data.level,
                verifiedSkills: ['Solidity', 'React', 'TypeScript'], // Still mocked for now as it's not in blockchain service yet
                completedJobs: Math.floor(data.score / 5)
            };
        } catch (error) {
            console.error('Error fetching reputation:', error);
            // Fallback for demo if API is down
            return {
                score: 50,
                level: 'Associate',
                verifiedSkills: [],
                completedJobs: 0
            };
        }
    }

    async submitReview(jobId: string, rating: number, comment: string): Promise<boolean> {
        console.log(`Submitting review for job ${jobId}: ${rating} stars - "${comment}"`);
        // In a real app, this would trigger a reputation update via the API
        // await fetch(`${this.baseUrl}/api/reputation/update`, { ... });
        return true;
    }
}
