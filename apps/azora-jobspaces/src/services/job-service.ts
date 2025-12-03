import { config } from '../config';

export class JobService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = config.apiBaseUrl;
    }

    private async request(endpoint: string, method: string = 'GET', body?: any) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-user-token'
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    }

    async postJob(jobDetails: any) {
        // Validate job posting ethically before submission
        const validation = await this.request('/constitutional/validate', 'POST', {
            type: 'post_job',
            payload: jobDetails
        });

        if (!validation.isAllowed) {
            throw new Error(`Job posting rejected: ${validation.critique}`);
        }

        // If valid, submit to job service (mock endpoint for now)
        return this.request('/jobs/create', 'POST', jobDetails);
    }

    async applyForJob(jobId: string, applicantId: string) {
        return this.request(`/jobs/${jobId}/apply`, 'POST', { applicantId });
    }
}
