export interface ReputationProfile {
    score: number;
    level: string;
    verifiedSkills: string[];
    completedJobs: number;
}

export class ReputationService {
    // In a real app, this would connect to the Blockchain Service via API Gateway

    async getReputation(userId: string): Promise<ReputationProfile> {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Mock logic to generate consistent data based on ID
        const mockScore = userId.charCodeAt(0) % 100;

        return {
            score: mockScore > 40 ? mockScore : 40 + (mockScore % 50), // Ensure decent scores for demo
            level: mockScore > 80 ? 'Expert' : (mockScore > 60 ? 'Pro' : 'Associate'),
            verifiedSkills: ['Solidity', 'React', 'TypeScript'],
            completedJobs: Math.floor(mockScore / 5)
        };
    }

    async submitReview(jobId: string, rating: number, comment: string): Promise<boolean> {
        console.log(`Submitting review for job ${jobId}: ${rating} stars - "${comment}"`);
        return true;
    }
}
