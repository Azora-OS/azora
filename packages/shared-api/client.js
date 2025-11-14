class AzoraAPIClient {
  constructor(baseURL = 'http://localhost:4000/api') {
    this.baseURL = baseURL;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Education API
  education = {
    getCourses: () => this.request('/education/courses'),
    getCourse: (id) => this.request(`/education/courses/${id}`),
    enroll: (courseId, userId) => this.request('/education/enroll', {
      method: 'POST',
      body: JSON.stringify({ courseId, userId })
    }),
    getProgress: (studentId) => this.request(`/education/progress/${studentId}`)
  };

  // Mint API
  mint = {
    getWallet: (address) => this.request(`/mint/wallet/${address}`),
    createWallet: (userId) => this.request('/mint/wallet', {
      method: 'POST',
      body: JSON.stringify({ userId })
    }),
    startMining: (userId, activity) => this.request('/mint/mine', {
      method: 'POST',
      body: JSON.stringify({ userId, activity })
    }),
    getTransactions: (walletId) => this.request(`/mint/transactions/${walletId}`)
  };

  // Forge API
  forge = {
    getJobs: () => this.request('/forge/jobs'),
    getJob: (id) => this.request(`/forge/jobs/${id}`),
    apply: (jobId, userId, data) => this.request('/forge/apply', {
      method: 'POST',
      body: JSON.stringify({ jobId, userId, ...data })
    }),
    getApplications: (userId) => this.request(`/forge/applications/${userId}`)
  };

  // AI Family API
  ai = {
    chat: (character, message, history) => this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ character, message, conversationHistory: history })
    }),
    getFamily: () => this.request('/ai/family'),
    getGreeting: (userId, character) => this.request('/ai/greeting', {
      method: 'POST',
      body: JSON.stringify({ userId, character })
    })
  };

  // Payment API
  payment = {
    createIntent: (amount, currency, userId) => this.request('/payments/intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency, userId })
    }),
    processPayment: (paymentIntentId) => this.request('/payments/process', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId })
    })
  };

  // Auth API
  auth = {
    login: (email, password) => this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),
    register: (userData) => this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    getProfile: () => this.request('/auth/profile')
  };
}

module.exports = AzoraAPIClient;
