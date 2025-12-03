// Ubuntu Service Integration Layer
export class UbuntuServiceClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey || '';
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : '',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        throw new Error(`Ubuntu Service Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Ubuntu Service Client Error:', error);
      throw error;
    }
  }

  // Citadel Fund Integration
  async getCitadelBalance() {
    return this.request('/api/balance');
  }

  async collectRevenue(amount: string, source: string) {
    return this.request('/api/collect', {
      method: 'POST',
      body: JSON.stringify({ amount, source }),
    });
  }

  async grantScholarship(studentId: string, amount: string) {
    return this.request('/api/scholarships', {
      method: 'POST',
      body: JSON.stringify({ studentId, amount }),
    });
  }

  // Proof of Value Integration
  async submitValueProof(contentHash: string, valueScore: number) {
    return this.request('/api/submit', {
      method: 'POST',
      body: JSON.stringify({ contentHash, valueScore }),
    });
  }

  async getUserValueProfile(userId: string) {
    return this.request(`/api/users/${userId}/profile`);
  }

  async getLeaderboard() {
    return this.request('/api/leaderboard');
  }

  // Constitutional AI Integration
  async validateContent(content: string) {
    return this.request('/api/validate', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async checkBias(content: string) {
    return this.request('/api/bias-check', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async getConstitutionalPrinciples() {
    return this.request('/api/principles');
  }

  // Blockchain Integration
  async getBalance(address: string) {
    return this.request(`/api/balance/${address}`);
  }

  async mintAZR(to: string, knowledgeProof: string, knowledgeLevel: number) {
    return this.request('/api/mint', {
      method: 'POST',
      body: JSON.stringify({ to, knowledgeProof, knowledgeLevel }),
    });
  }

  async mintCertificate(student: string, courseId: string, studentId: string, score: number) {
    return this.request('/api/certificate/mint', {
      method: 'POST',
      body: JSON.stringify({ student, courseId, studentId, score }),
    });
  }

  // NFT Minting Integration
  async mintNFT(collectionId: string, ownerId: string, type: string, metadata: any) {
    return this.request('/api/nfts/mint', {
      method: 'POST',
      body: JSON.stringify({ collectionId, ownerId, type, metadata }),
    });
  }

  async getUserNFTs(userId: string) {
    return this.request(`/api/users/${userId}/nfts`);
  }

  // Governance Integration
  async getProposals() {
    return this.request('/api/proposals');
  }

  async voteOnProposal(proposalId: string, support: boolean, reason: string) {
    return this.request(`/api/proposals/${proposalId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ support, reason }),
    });
  }

  // Event Bus Integration
  async publishEvent(type: string, data: any, source: string) {
    return this.request('/api/events/publish', {
      method: 'POST',
      body: JSON.stringify({ type, data, source }),
    });
  }

  async subscribeToEvents(topic: string, endpoint: string, subscriberId: string) {
    return this.request('/api/events/subscribe', {
      method: 'POST',
      body: JSON.stringify({ topic, endpoint, subscriberId }),
    });
  }

  // Education Integration
  async getCourses() {
    return this.request('/api/courses');
  }

  async enrollInCourse(courseId: string, userId: string) {
    return this.request(`/api/courses/${courseId}/enroll`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async updateProgress(courseId: string, userId: string, moduleId: string, completed: boolean) {
    return this.request(`/api/courses/${courseId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ userId, moduleId, completed }),
    });
  }

  // Treasury Integration
  async getTreasuryBalance() {
    return this.request('/api/balance');
  }

  async createBudget(name: string, category: string, amount: number) {
    return this.request('/api/budgets', {
      method: 'POST',
      body: JSON.stringify({ name, category, totalAmount: amount }),
    });
  }

  // Marketplace Integration
  async getProducts() {
    return this.request('/api/products');
  }

  async createOrder(productId: string, buyerId: string, quantity: number) {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ productId, buyerId, quantity }),
    });
  }

  // Auth Integration
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile(token: string) {
    return this.request('/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
  }
}

// Ubuntu Service Registry
export const UbuntuServices = {
  citadelFund: new UbuntuServiceClient('http://localhost:4010'),
  proofOfValue: new UbuntuServiceClient('http://localhost:4011'),
  constitutionalAI: new UbuntuServiceClient('http://localhost:4012'),
  blockchain: new UbuntuServiceClient('http://localhost:4009'),
  nftMinting: new UbuntuServiceClient('http://localhost:4017'),
  governance: new UbuntuServiceClient('http://localhost:4018'),
  events: new UbuntuServiceClient('http://localhost:4019'),
  education: new UbuntuServiceClient('http://localhost:4013'),
  treasury: new UbuntuServiceClient('http://localhost:4015'),
  auth: new UbuntuServiceClient('http://localhost:4016'),
  marketplace: new UbuntuServiceClient('http://localhost:4004'),
  apiGateway: new UbuntuServiceClient('http://localhost:4000'),
};

// Ubuntu Hooks for React
export const useUbuntuServices = () => {
  return UbuntuServices;
};

export const useCitadelFund = () => {
  return UbuntuServices.citadelFund;
};

export const useProofOfValue = () => {
  return UbuntuServices.proofOfValue;
};

export const useConstitutionalAI = () => {
  return UbuntuServices.constitutionalAI;
};

export const useBlockchain = () => {
  return UbuntuServices.blockchain;
};

export const useNFTMinting = () => {
  return UbuntuServices.nftMinting;
};

export const useGovernance = () => {
  return UbuntuServices.governance;
};

export const useEvents = () => {
  return UbuntuServices.events;
};

export const useEducation = () => {
  return UbuntuServices.education;
};

export const useTreasury = () => {
  return UbuntuServices.treasury;
};

export const useAuth = () => {
  return UbuntuServices.auth;
};

export const useMarketplace = () => {
  return UbuntuServices.marketplace;
};
