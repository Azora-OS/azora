/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

REAL SERVICE CONNECTIONS - NO PLACEHOLDERS
*/

const API_BASE = process.env.AZORA_GATEWAY_URL || 'http://localhost:4000';

export class AzoraServices {
  private static async request(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!response.ok) {throw new Error(`API Error: ${response.statusText}`);}
    return response.json();
  }

  // Education Service
  static async getCourses() {
    return this.request('/api/education/courses');
  }

  static async getStudentProgress(studentId: string) {
    return this.request(`/api/education/progress/${studentId}`);
  }

  static async enrollCourse(studentId: string, courseId: string) {
    return this.request('/api/education/enroll', {
      method: 'POST',
      body: JSON.stringify({ studentId, courseId }),
    });
  }

  // Mint Service (Finance)
  static async getWalletBalance(userId: string) {
    return this.request(`/api/mint/wallet/${userId}`);
  }

  static async getMiningStatus(userId: string) {
    const status = await this.request(`/api/mint/mining/status/${userId}`);
    return {
      isActive: status.isActive || false,
      hashrate: status.hashrate || 0,
      earned: status.earned || 0,
      algorithm: status.algorithm || 'idle',
    };
  }

  static async startMining(userId: string) {
    return this.request('/api/mint/mining/start', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  static async stopMining(userId: string) {
    return this.request('/api/mint/mining/stop', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  // Forge Service (Marketplace)
  static async getJobs() {
    return this.request('/api/forge/jobs');
  }

  static async applyToJob(userId: string, jobId: string) {
    return this.request('/api/forge/jobs/apply', {
      method: 'POST',
      body: JSON.stringify({ userId, jobId }),
    });
  }

  // Sapiens AI Service
  static async askElara(question: string, context?: any) {
    return this.request('/api/sapiens/ask', {
      method: 'POST',
      body: JSON.stringify({ question, context }),
    });
  }

  static async getRecommendations(userId: string) {
    return this.request(`/api/sapiens/recommendations/${userId}`);
  }

  // Aegis Security Service
  static async verifyCredential(credentialId: string) {
    return this.request(`/api/aegis/verify/${credentialId}`);
  }

  // Nexus Event Bus
  static async publishEvent(event: any) {
    return this.request('/api/nexus/publish', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  // Ledger (Blockchain)
  static async mintCertificate(userId: string, achievement: any) {
    return this.request('/api/ledger/mint', {
      method: 'POST',
      body: JSON.stringify({ userId, achievement }),
    });
  }

  static async getTransactions(userId: string) {
    return this.request(`/api/ledger/transactions/${userId}`);
  }

  // Ubuntu Metrics
  static async getUbuntuMetrics(userId: string) {
    return this.request(`/api/ubuntu/metrics/${userId}`);
  }

  static async getCollectiveImpact() {
    return this.request('/api/ubuntu/collective');
  }
}

export const services = AzoraServices;
