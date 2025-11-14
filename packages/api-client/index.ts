/**
 * Azora OS API Client - Unified backend service connections
 */

export interface ApiConfig {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class AzoraApiClient {
  private baseUrl: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(config: ApiConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    this.timeout = config.timeout || 30000;
    this.headers = { 'Content-Type': 'application/json', ...config.headers };
  }

  setAuthToken(token: string) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...this.headers, ...options.headers },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  auth = {
    login: (email: string, password: string) =>
      this.request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (data: any) =>
      this.request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    profile: () => this.request('/api/auth/profile')
  };

  education = {
    getStudents: () => this.request('/api/students'),
    createStudent: (data: any) =>
      this.request('/api/students', { method: 'POST', body: JSON.stringify(data) }),
    getCurriculum: (params?: any) =>
      this.request(`/api/curriculum${params ? '?' + new URLSearchParams(params) : ''}`)
  };

  lms = {
    getCourses: (params?: any) =>
      this.request(`/api/education/courses${params ? '?' + new URLSearchParams(params) : ''}`),
    getCourse: (id: string) => this.request(`/api/education/courses/${id}`),
    enroll: (courseId: string, studentId: string) =>
      this.request('/api/education/enrollments', { method: 'POST', body: JSON.stringify({ courseId, studentId }) }),
    getEnrollments: (studentId: string) => this.request(`/api/education/enrollments/${studentId}`)
  };

  sapiens = {
    startTutoring: (studentId: string, subject: string) =>
      this.request('/api/tutoring/start', { method: 'POST', body: JSON.stringify({ studentId, subject }) }),
    sendMessage: (sessionId: string, message: string) =>
      this.request(`/api/tutoring/${sessionId}/message`, { method: 'POST', body: JSON.stringify({ message }) }),
    getLearningPaths: () => this.request('/api/learning-paths')
  };

  assessment = {
    createAssessment: (data: any) =>
      this.request('/api/assessments', { method: 'POST', body: JSON.stringify(data) }),
    submitAssessment: (id: string, studentId: string, answers: any[]) =>
      this.request(`/api/assessments/${id}/submit`, { method: 'POST', body: JSON.stringify({ studentId, answers }) }),
    getGradebook: (studentId: string) => this.request(`/api/gradebook/${studentId}`)
  };

  payment = {
    getBalance: (userId: string) => this.request(`/api/wallet/${userId}/balance`),
    createPayment: (data: any) =>
      this.request('/api/payments', { method: 'POST', body: JSON.stringify(data) })
  };

  mint = {
    getWallet: (userId: string) => this.request(`/api/wallet/${userId}`),
    startMining: (userId: string) =>
      this.request('/api/mining/start', { method: 'POST', body: JSON.stringify({ userId }) })
  };

  marketplace = {
    getJobs: (params?: any) =>
      this.request(`/api/jobs${params ? '?' + new URLSearchParams(params) : ''}`),
    applyToJob: (jobId: string, userId: string) =>
      this.request(`/api/jobs/${jobId}/apply`, { method: 'POST', body: JSON.stringify({ userId }) })
  };

  billing = {
    getPlans: () => this.request('/api/plans'),
    createSubscription: (data: any) =>
      this.request('/api/subscriptions', { method: 'POST', body: JSON.stringify(data) }),
    getSubscription: (userId: string) => this.request(`/api/subscriptions/${userId}`),
    cancelSubscription: (userId: string) =>
      this.request(`/api/subscriptions/${userId}`, { method: 'DELETE' })
  };

  lending = {
    applyForLoan: (data: any) =>
      this.request('/api/loans/apply', { method: 'POST', body: JSON.stringify(data) }),
    getLoans: (userId: string) => this.request(`/api/loans/${userId}`),
    repayLoan: (loanId: string, amount: number) =>
      this.request(`/api/loans/${loanId}/repay`, { method: 'POST', body: JSON.stringify({ amount }) })
  };

  exchange = {
    getRates: (base?: string) =>
      this.request(`/api/rates${base ? '?base=' + base : ''}`),
    convert: (amount: number, from: string, to: string) =>
      this.request('/api/convert', { method: 'POST', body: JSON.stringify({ amount, from, to }) })
  };

  virtualCard = {
    issueCard: (data: any) =>
      this.request('/api/cards/issue', { method: 'POST', body: JSON.stringify(data) }),
    getCard: (cardId: string) => this.request(`/api/cards/${cardId}`),
    freezeCard: (cardId: string) =>
      this.request(`/api/cards/${cardId}/freeze`, { method: 'POST' }),
    processTransaction: (cardId: string, data: any) =>
      this.request(`/api/cards/${cardId}/transaction`, { method: 'POST', body: JSON.stringify(data) })
  };

  kyc = {
    verifyKYC: (data: any) =>
      this.request('/api/kyc/verify', { method: 'POST', body: JSON.stringify(data) }),
    getKYCStatus: (userId: string) => this.request(`/api/kyc/${userId}`),
    checkAML: (data: any) =>
      this.request('/api/aml/check', { method: 'POST', body: JSON.stringify(data) })
  };

  security = {
    scanThreat: (data: any) =>
      this.request('/api/security/scan', { method: 'POST', body: JSON.stringify(data) }),
    validateSession: (data: any) =>
      this.request('/api/security/validate-session', { method: 'POST', body: JSON.stringify(data) }),
    encryptData: (data: any, key?: string) =>
      this.request('/api/security/encrypt', { method: 'POST', body: JSON.stringify({ data, key }) })
  };

  courses = {
    create: (data: any) =>
      this.request('/api/courses', { method: 'POST', body: JSON.stringify(data) }),
    getAll: () => this.request('/api/courses'),
    get: (id: string) => this.request(`/api/courses/${id}`),
    enroll: (courseId: string, studentId: string) =>
      this.request(`/api/courses/${courseId}/enroll`, { method: 'POST', body: JSON.stringify({ studentId }) }),
    updateProgress: (courseId: string, studentId: string, progress: number) =>
      this.request(`/api/courses/${courseId}/progress`, { method: 'POST', body: JSON.stringify({ studentId, progress }) })
  };

  jobs = {
    post: (data: any) =>
      this.request('/api/jobs', { method: 'POST', body: JSON.stringify(data) }),
    getAll: () => this.request('/api/jobs'),
    apply: (jobId: string, data: any) =>
      this.request(`/api/jobs/${jobId}/apply`, { method: 'POST', body: JSON.stringify(data) }),
    match: (data: any) =>
      this.request('/api/match', { method: 'POST', body: JSON.stringify(data) })
  };

  tutor = {
    createSession: (data: any) =>
      this.request('/api/tutor/session', { method: 'POST', body: JSON.stringify(data) }),
    ask: (sessionId: string, question: string) =>
      this.request('/api/tutor/ask', { method: 'POST', body: JSON.stringify({ sessionId, question }) }),
    getSessions: (userId: string) => this.request(`/api/tutor/sessions/${userId}`)
  };

  earnings = {
    getEarnings: (studentId: string) => this.request(`/api/earnings/${studentId}`),
    getMilestones: (studentId: string) => this.request(`/api/milestones/${studentId}`),
    requestWithdrawal: (studentId: string, amount: number, method: string) =>
      this.request('/api/withdrawals', { method: 'POST', body: JSON.stringify({ studentId, amount, method }) }),
    getWithdrawals: (studentId: string) => this.request(`/api/withdrawals/${studentId}`)
  };
}

export const createApiClient = (config?: ApiConfig) => new AzoraApiClient(config);
export default AzoraApiClient;
