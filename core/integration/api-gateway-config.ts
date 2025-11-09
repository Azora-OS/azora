/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

API GATEWAY CONFIGURATION
Connecting v0's frontend to Azora backend services
*/

export const AZORA_API_CONFIG = {
  gateway: {
    url: process.env.AZORA_GATEWAY_URL || 'http://localhost:4000',
    timeout: 30000,
    retries: 3
  },
  
  services: {
    education: '/api/education',
    mint: '/api/mint',
    forge: '/api/forge',
    sapiens: '/api/sapiens',
    aegis: '/api/aegis',
    nexus: '/api/nexus',
    ledger: '/api/ledger',
    blockchain: '/api/blockchain',
    wallet: '/api/wallet',
    nft: '/api/nft'
  },

  websocket: {
    url: process.env.AZORA_WS_URL || 'ws://localhost:4000',
    reconnect: true,
    reconnectInterval: 5000
  },

  auth: {
    tokenKey: 'azora_auth_token',
    refreshKey: 'azora_refresh_token',
    tokenExpiry: 3600000
  }
};

export class AzoraAPIClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = AZORA_API_CONFIG.gateway.url;
  }

  setToken(token: string) {
    this.token = token;
  }

  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers
    };

    let lastError;
    for (let i = 0; i < AZORA_API_CONFIG.gateway.retries; i++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers,
          signal: AbortSignal.timeout(AZORA_API_CONFIG.gateway.timeout)
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
      } catch (error) {
        lastError = error;
        if (i < AZORA_API_CONFIG.gateway.retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
    throw lastError;
  }

  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const azoraAPI = new AzoraAPIClient();
