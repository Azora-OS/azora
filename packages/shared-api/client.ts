import axios, { AxiosInstance } from 'axios';

class AzoraAPIClient {
  private client: AxiosInstance;
  private csrfToken: string | null = null;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    });

    this.client.interceptors.request.use(
      (config) => {
        if (this.csrfToken) config.headers['X-CSRF-Token'] = this.csrfToken;
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => {
        const csrf = response.headers['x-csrf-token'];
        if (csrf) this.csrfToken = csrf;
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('azora_token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string | null) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  async getCsrfToken() {
    const { data } = await this.client.get('/auth/csrf');
    this.csrfToken = data.token;
    return data.token;
  }

  education = {
    getCourses: () => this.client.get('/education/courses').then(r => r.data),
    getCourse: (id: string) => this.client.get(`/education/courses/${id}`).then(r => r.data),
    enroll: (courseId: string, userId: string) => 
      this.client.post('/education/enrollments', { courseId, studentId: userId }).then(r => r.data),
    getProgress: (studentId: string) => 
      this.client.get(`/education/students/${studentId}`).then(r => r.data),
    updateProgress: (data: any) => this.client.post('/education/progress', data).then(r => r.data)
  };

  mint = {
    getWallet: (userId: string) => this.client.get(`/mint/wallet/${userId}`).then(r => r.data),
    getBalance: (userId: string) => this.client.get(`/mint/wallet/${userId}/balance`).then(r => r.data),
    transfer: (data: any) => this.client.post('/mint/transfer', data).then(r => r.data),
    stake: (data: any) => this.client.post('/mint/stake', data).then(r => r.data),
    unstake: (data: any) => this.client.post('/mint/unstake', data).then(r => r.data),
    startMining: (data: any) => this.client.post('/mint/mining/start', data).then(r => r.data),
    getMiningHistory: (userId: string) => this.client.get(`/mint/mining/history/${userId}`).then(r => r.data)
  };

  forge = {
    getJobs: () => this.client.get('/forge/jobs').then(r => r.data),
    getJob: (id: string) => this.client.get(`/forge/jobs/${id}`).then(r => r.data),
    applyToJob: (jobId: string, data: any) => 
      this.client.post(`/forge/jobs/${jobId}/apply`, data).then(r => r.data),
    assessSkills: (data: any) => this.client.post('/forge/skills/assess', data).then(r => r.data),
    findMatches: (userId: string) => this.client.post('/forge/match', { userId }).then(r => r.data)
  };

  auth = {
    login: (email: string, password: string) => 
      this.client.post('/auth/login', { email, password }).then(r => r.data),
    register: (data: any) => this.client.post('/auth/register', data).then(r => r.data),
    logout: () => this.client.post('/auth/logout').then(r => r.data),
    getProfile: () => this.client.get('/auth/profile').then(r => r.data),
    setupMfa: () => this.client.post('/auth/mfa/setup').then(r => r.data),
    verifyMfa: (token: string) => this.client.post('/auth/mfa/verify', { token }).then(r => r.data)
  };
}

export default AzoraAPIClient;
