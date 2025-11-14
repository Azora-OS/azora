const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class AzoraApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
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

  auth = {
    login: (email: string, password: string) =>
      this.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (data: any) =>
      this.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    profile: () => this.request('/api/auth/profile'),
  };

  education = {
    getCourses: () => this.request('/api/courses'),
    getCourse: (id: string) => this.request(`/api/courses/${id}`),
    enroll: (courseId: string, userId: string) =>
      this.request(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }),
    getProgress: (studentId: string) =>
      this.request(`/api/progress/${studentId}`),
  };

  wallet = {
    getBalance: () => this.request('/api/wallet/balance'),
    getTransactions: () => this.request('/api/transactions'),
  };

  payments = {
    createPayment: (amount: number, currency: string, userId: string) =>
      this.request('/api/payments/create-payment', {
        method: 'POST',
        body: JSON.stringify({ amount, currency, userId }),
      }),
  };

  tutor = {
    ask: (question: string, context: any) =>
      this.request('/api/tutor/ask', {
        method: 'POST',
        body: JSON.stringify({ question, context }),
      }),
    getLearningPath: (subject: string, level: string, goals: string[]) =>
      this.request('/api/tutor/learning-path', {
        method: 'POST',
        body: JSON.stringify({ subject, level, goals }),
      }),
  };

  jobs = {
    getJobs: () => this.request('/api/jobs'),
    apply: (jobId: string, userId: string) =>
      this.request(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }),
  };
}

export const apiClient = new AzoraApiClient();
export default AzoraApiClient;
