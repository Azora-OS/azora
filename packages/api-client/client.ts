/**
 * Minimal API Client with error handling
 */

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = 'http://localhost:4000') {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('azora_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('azora_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('azora_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers
      });

      if (response.status === 401) {
        this.clearToken();
        throw new ApiError(401, 'Unauthorized');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new ApiError(response.status, error.message || `HTTP ${response.status}`, error);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, error instanceof Error ? error.message : 'Network error');
    }
  }

  // Auth
  login = (email: string, password: string) =>
    this.request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

  register = (data: any) =>
    this.request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });

  getProfile = () => this.request('/api/auth/profile');

  // Courses
  getCourses = () => this.request('/api/courses');
  
  getCourse = (id: string) => this.request(`/api/courses/${id}`);
  
  enrollCourse = (courseId: string) =>
    this.request(`/api/courses/${courseId}/enroll`, { method: 'POST' });

  // Enrollments
  getEnrollments = () => this.request('/api/enrollments');
  
  updateProgress = (enrollmentId: string, progress: number) =>
    this.request(`/api/enrollments/${enrollmentId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress })
    });

  // Wallet
  getWallet = () => this.request('/api/wallet');
  
  getTransactions = () => this.request('/api/transactions');
  
  earnTokens = (data: any) =>
    this.request('/api/earn', { method: 'POST', body: JSON.stringify(data) });

  // Health
  health = () => this.request('/health');
}

export const createClient = (baseUrl?: string) => new ApiClient(baseUrl);
