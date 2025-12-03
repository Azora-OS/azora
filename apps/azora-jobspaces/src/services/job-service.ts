export interface Job {
    id: string;
    title: string;
    description: string;
    budget: number;
    skills: string[];
    ethicalCheck: boolean;
}

export class JobService {
    async getJobs(): Promise<Job[]> {
        // Mock implementation
        return [
            { id: '1', title: 'Smart Contract Developer', description: 'Build DeFi protocols', budget: 5000, skills: ['Solidity', 'React'], ethicalCheck: true },
            { id: '2', title: 'UI/UX Designer', description: 'Design Azora mobile app', budget: 3000, skills: ['Figma', 'Mobile'], ethicalCheck: true },
        ];
    }
}
