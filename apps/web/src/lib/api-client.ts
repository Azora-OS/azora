// Azora API Client - Centralized API communication
// Connects to all backend services running locally

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

// Service ports (from actual infrastructure)
const SERVICES = {
    API_GATEWAY: 4000,
    AUTH: 4001,
    EDUCATION: 4002,
    FINANCE: 4003,
    MARKETPLACE: 4004,
    HEALTH: 4005,
    AEGIS: 4006,
    REVENUE_ENGINE: 4007,
    ELARA_AI: 4008,
    ONBOARDING: 4009,
    PAYMENT: 4010,
    AI_ROUTING: 4011,
    CONSTITUTIONAL_AI: 4012,
};

class AzoraAPIClient {
    private token: string | null = null;

    constructor() {
        // Load token from localStorage
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
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(this.token && { Authorization: `Bearer ${this.token}` }),
            ...options.headers,
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            if (response.status === 401) {
                this.clearToken();
                throw new Error('Unauthorized - please login');
            }
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    }

    // ==================== AUTH SERVICE ====================
    async login(email: string, password: string) {
        const data = await this.request<{ token: string; user: any }>('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        this.setToken(data.token);
        return data;
    }

    async register(userData: { email: string; password: string; name: string }) {
        return this.request('/api/v1/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async getCurrentUser() {
        return this.request('/api/v1/auth/me');
    }

    // ==================== AZORA EDUCATION ====================
    async getCourses(filters?: { search?: string; level?: string; status?: string }) {
        const params = new URLSearchParams(filters as any);
        return this.request(`/api/v1/courses?${params}`);
    }

    async getCourse(courseId: string) {
        return this.request(`/api/v1/courses/${courseId}`);
    }

    async enrollCourse(courseId: string) {
        return this.request(`/api/v1/enrollments`, {
            method: 'POST',
            body: JSON.stringify({ courseId }),
        });
    }

    async getMyEnrollments() {
        return this.request('/api/v1/enrollments/my');
    }

    async getCourseProgress(courseId: string) {
        return this.request(`/api/v1/progress/${courseId}`);
    }

    // ==================== PRIMARY EDUCATION ====================
    async getPrimaryGrades() {
        return this.request('/api/v1/primary/grades');
    }

    async enrollPrimary(studentId: string, gradeLevel: string, preferences?: any) {
        return this.request('/api/v1/primary/enroll', {
            method: 'POST',
            body: JSON.stringify({ studentId, gradeLevel, preferences }),
        });
    }

    async getPrimaryStudent(studentId: string) {
        return this.request(`/api/v1/primary/student/${studentId}`);
    }

    // ==================== SECONDARY EDUCATION ====================
    async getSecondaryGrades() {
        return this.request('/api/v1/secondary/grades');
    }

    async getSecondaryStreams() {
        return this.request('/api/v1/secondary/streams');
    }

    async enrollSecondary(studentId: string, gradeLevel: string, streamId?: string) {
        return this.request('/api/v1/secondary/enroll', {
            method: 'POST',
            body: JSON.stringify({ studentId, gradeLevel, streamId }),
        });
    }

    async getSecondaryStudent(studentId: string) {
        return this.request(`/api/v1/secondary/student/${studentId}`);
    }

    // ==================== UNIVERSITY ====================
    async getUniversityProgrammes() {
        return this.request('/api/v1/university/programmes');
    }

    async getUniversityFaculties() {
        return this.request('/api/v1/university/faculties');
    }

    async enrollUniversity(studentId: string, programmeId: string) {
        return this.request('/api/v1/university/enroll', {
            method: 'POST',
            body: JSON.stringify({ studentId, programmeId }),
        });
    }

    async getUniversityStudent(studentId: string) {
        return this.request(`/api/v1/university/student/${studentId}`);
    }

    // ==================== AZORA MINT ====================
    async getWallet() {
        return this.request('/api/v1/wallet');
    }

    async getTransactions(limit = 10) {
        return this.request(`/api/v1/transactions?limit=${limit}`);
    }

    async getStakingInfo() {
        return this.request('/api/v1/staking');
    }

    async stakeTokens(amount: number, duration: number) {
        return this.request('/api/v1/staking/stake', {
            method: 'POST',
            body: JSON.stringify({ amount, duration }),
        });
    }

    async getMiningStats() {
        return this.request('/api/v1/mining/stats');
    }

    async claimRewards() {
        return this.request('/api/v1/mining/claim', {
            method: 'POST',
        });
    }

    // ==================== AZORA FORGE ====================
    async getJobs(filters?: { search?: string; type?: string }) {
        const params = new URLSearchParams(filters as any);
        return this.request(`/api/v1/jobs?${params}`);
    }

    async getJob(jobId: string) {
        return this.request(`/api/v1/jobs/${jobId}`);
    }

    async applyToJob(jobId: string, application: any) {
        return this.request(`/api/v1/jobs/${jobId}/apply`, {
            method: 'POST',
            body: JSON.stringify(application),
        });
    }

    async getMyApplications() {
        return this.request('/api/v1/applications/my');
    }

    // ==================== AZORA STUDYSPACES ====================
    async getStudySpaces(filter?: 'my' | 'all') {
        return this.request(`/api/spaces${filter === 'my' ? '/my' : ''}`);
    }

    async getStudySpace(spaceId: string) {
        return this.request(`/api/spaces/${spaceId}`);
    }

    async createStudySpace(data: any) {
        return this.request('/api/spaces', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async joinStudySpace(spaceId: string) {
        return this.request(`/api/spaces/${spaceId}/members`, {
            method: 'POST',
        });
    }

    async getSpaceMessages(spaceId: string) {
        return this.request(`/api/spaces/${spaceId}/messages`);
    }

    async sendSpaceMessage(spaceId: string, content: string) {
        return this.request(`/api/spaces/${spaceId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
    }

    // ==================== ELARA INCUBATOR ====================
    async getBusinesses() {
        return this.request('/api/v1/businesses');
    }

    async getBusiness(businessId: string) {
        return this.request(`/api/v1/businesses/${businessId}`);
    }

    async createBusiness(data: any) {
        return this.request('/api/v1/businesses', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateBusinessWizard(businessId: string, stepId: number, data: any) {
        return this.request(`/api/v1/businesses/${businessId}/wizard/${stepId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async launchBusiness(businessId: string) {
        return this.request(`/api/v1/businesses/${businessId}/launch`, {
            method: 'POST',
        });
    }

    async getBusinessRevenue(businessId: string) {
        return this.request(`/api/v1/payments/revenue/${businessId}`);
    }

    async getCitadelFundStatus() {
        return this.request('/api/v1/fund/status');
    }

    // ==================== ELARA AI ORCHESTRATOR ====================
    async chatWithElara(message: string, personality?: string) {
        return this.request('/api/v1/chat', {
            method: 'POST',
            body: JSON.stringify({ message, personality }),
        });
    }

    async getConversationHistory() {
        return this.request('/api/v1/chat/history');
    }

    async getAIPersonalities() {
        return this.request('/api/v1/personalities');
    }

    // ==================== TOKENS SERVICE ====================
    async getLeaderboard(limit = 100) {
        return this.request(`/api/v1/leaderboard?limit=${limit}`);
    }

    async getMyRank() {
        return this.request('/api/v1/leaderboard/my-rank');
    }

    async getRewards() {
        return this.request('/api/v1/rewards');
    }

    // ==================== DASHBOARD AGGREGATION ====================
    async getDashboardStats() {
        // Aggregate data from multiple services
        const [wallet, enrollments, applications, rank] = await Promise.all([
            this.getWallet().catch(() => null),
            this.getMyEnrollments().catch(() => null),
            this.getMyApplications().catch(() => null),
            this.getMyRank().catch(() => null),
        ]);

        return {
            wallet,
            enrollments,
            applications,
            rank,
        };
    }

    // ==================== AI TUTOR ====================
    async askAITutor(question: string, context: string) {
        return this.request('/api/v1/ai/tutor', {
            method: 'POST',
            body: JSON.stringify({ question, context }),
        });
    }

    async generateLearningPath(strengths: string[], weaknesses: string[]) {
        return this.request('/api/v1/ai/learning-path', {
            method: 'POST',
            body: JSON.stringify({ strengths, weaknesses }),
        });
    }

    async generateQuiz(topic: string, difficulty: number) {
        return this.request('/api/v1/ai/quiz', {
            method: 'POST',
            body: JSON.stringify({ topic, difficulty }),
        });
    }

    // ==================== SIMULATIONS ====================
    async getSimulations(subject?: string, grade?: number) {
        const params = new URLSearchParams();
        if (subject) params.append('subject', subject);
        if (grade) params.append('grade', grade.toString());
        return this.request(`/api/v1/simulations?${params.toString()}`);
    }

    async getSimulation(simId: string) {
        return this.request(`/api/v1/simulations/${simId}`);
    }

    // ==================== PREMIUM SUBSCRIPTIONS ====================
    async getSubscription() {
        return this.request('/api/v1/subscription');
    }

    async subscribe(tier: 'basic' | 'advanced' | 'elite') {
        return this.request('/api/v1/subscription', {
            method: 'POST',
            body: JSON.stringify({ tier }),
        });
    }

    async upgradeSubscription(tier: string) {
        return this.request('/api/v1/subscription/upgrade', {
            method: 'POST',
            body: JSON.stringify({ tier }),
        });
    }
}

// Export singleton instance
export const apiClient = new AzoraAPIClient();

// Export types
export interface Course {
    id: string;
    title: string;
    description: string;
    instructor: string;
    duration: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    rating: number;
    students: number;
    progress?: number;
    thumbnail: string;
    tags: string[];
}

export interface Wallet {
    balance: number;
    staked: number;
    earned: number;
    pendingRewards: number;
}

export interface Transaction {
    id: string;
    type: 'earn' | 'transfer' | 'stake' | 'unstake';
    amount: number;
    description: string;
    timestamp: Date;
}

export interface StudySpace {
    id: string;
    name: string;
    description: string;
    members: number;
    maxMembers: number;
    privacy: 'PUBLIC' | 'PRIVATE' | 'COURSE_ONLY';
    tags: string[];
    isOwner: boolean;
    isMember: boolean;
    activeSession?: boolean;
}

export interface Business {
    id: string;
    name: string;
    type: string;
    status: 'draft' | 'active' | 'pending';
    revenue: number;
    citadelContribution: number;
    wizardProgress: number;
}
