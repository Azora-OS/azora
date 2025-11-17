// Ubuntu API Client
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class UbuntuAPIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE) {
    this.baseURL = baseURL;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('ubuntu-token') : null;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ubuntu-token', token);
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      throw new Error(`Ubuntu API Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Authentication
  async login(email: string, password: string) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (result.token) {
      this.setToken(result.token);
    }
    
    return result;
  }

  // Education APIs
  async getCourses() {
    return this.request('/education/courses');
  }

  async enrollCourse(courseId: string) {
    return this.request(`/education/courses/${courseId}/enroll`, {
      method: 'POST',
    });
  }

  // Finance APIs
  async getWalletBalance() {
    return this.request('/finance/wallet/balance');
  }

  async startMining() {
    return this.request('/finance/mining/start', {
      method: 'POST',
    });
  }

  // Ubuntu Philosophy
  async getPhilosophy() {
    return this.request('/ubuntu/philosophy');
  }
}

export const ubuntuAPI = new UbuntuAPIClient();