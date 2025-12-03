import { config } from '../config';

export class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = config.apiBaseUrl;
    }

    private async request(endpoint: string, method: string = 'GET', body?: any) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-user-token' // Placeholder for real auth
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

    async getWalletBalance(address: string) {
        return this.request(`/mint/balance/${address}`);
    }

    async mintToken(amount: number) {
        return this.request('/mint/mint', 'POST', { amount });
    }

    async submitEthicalAction(actionType: string, payload: any) {
        return this.request('/constitutional/validate', 'POST', {
            type: actionType,
            payload
        });
    }
}
