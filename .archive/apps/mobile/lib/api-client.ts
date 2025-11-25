import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  private async loadToken() {
    this.token = await AsyncStorage.getItem('auth_token');
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  }

  async login(email: string, password: string) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.token = data.token;
    await AsyncStorage.setItem('auth_token', data.token);
    return data;
  }

  async getCourses() {
    return this.request('/api/courses');
  }

  async getWallet() {
    return this.request('/api/wallet/balance');
  }

  async getProfile() {
    return this.request('/api/auth/profile');
  }
}

export const apiClient = new ApiClient(API_URL);
