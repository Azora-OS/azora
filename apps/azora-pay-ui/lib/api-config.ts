export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  TIMEOUT: 30000
};

export class ApiClient {
  async get(endpoint: string) {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`);
    return response.json();
  }
}

export const apiClient = new ApiClient();
