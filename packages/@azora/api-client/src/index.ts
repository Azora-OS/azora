import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
    User,
    LoginCredentials,
    RegisterData,
    AuthResponse,
    Course,
    Enrollment,
    Wallet,
    Transaction,
    RevenueSplit,
    Job,
    JobApplication,
    AIChatRequest,
    AIChatResponse,
    Business,
    APIResponse,
    PaginatedResponse,
} from './types';

export interface AzoraAPIClientConfig {
    baseURL?: string;
    token?: string;
}

export class AzoraAPIClient {
    private client: AxiosInstance;

    constructor(config: AzoraAPIClientConfig = {}) {
        this.client = axios.create({
            baseURL: config.baseURL || 'http://localhost:4000',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (config.token) {
            this.setToken(config.token);
        }

        // Request interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                // Handle auth errors globally
                if (error.response?.status === 401) {
                    // Token expired or invalid
                    this.clearToken();
                }
                return Promise.reject(error);
            }
        );
    }

    // Token management
    setToken(token: string) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        if (typeof window !== 'undefined') {
            localStorage.setItem('azora_token', token);
        }
    }

    clearToken() {
        delete this.client.defaults.headers.common['Authorization'];
        if (typeof window !== 'undefined') {
            localStorage.removeItem('azora_token');
        }
    }

    // Auth Service (Port 4001)
    auth = {
        login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
            const { data } = await this.client.post<APIResponse<AuthResponse>>(
                '/auth/login',
                credentials
            );
            if (data.data?.token) {
                this.setToken(data.data.token);
            }
            return data.data!;
        },

        register: async (userData: RegisterData): Promise<AuthResponse> => {
            const { data } = await this.client.post<APIResponse<AuthResponse>>(
                '/auth/register',
                userData
            );
            if (data.data?.token) {
                this.setToken(data.data.token);
            }
            return data.data!;
        },

        logout: async (): Promise<void> => {
            await this.client.post('/auth/logout');
            this.clearToken();
        },

        getCurrentUser: async (): Promise<User> => {
            const { data } = await this.client.get<APIResponse<User>>('/auth/me');
            return data.data!;
        },

        refreshToken: async (): Promise<string> => {
            const { data } = await this.client.post<APIResponse<{ token: string }>>(
                '/auth/refresh'
            );
            if (data.data?.token) {
                this.setToken(data.data.token);
            }
            return data.data!.token;
        },
    };

    // Education Service (Port 4002)
    education = {
        getCourses: async (page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Course>> => {
            const { data } = await this.client.get<PaginatedResponse<Course>>(
                `/courses?page=${page}&pageSize=${pageSize}`
            );
            return data;
        },

        getCourse: async (courseId: string): Promise<Course> => {
            const { data } = await this.client.get<APIResponse<Course>>(`/courses/${courseId}`);
            return data.data!;
        },

        enrollInCourse: async (courseId: string): Promise<Enrollment> => {
            const { data } = await this.client.post<APIResponse<Enrollment>>(
                `/courses/${courseId}/enroll`
            );
            return data.data!;
        },

        getEnrollments: async (userId: string): Promise<Enrollment[]> => {
            const { data } = await this.client.get<APIResponse<Enrollment[]>>(
                `/users/${userId}/enrollments`
            );
            return data.data!;
        },

        getProgress: async (userId: string, courseId: string): Promise<number> => {
            const { data } = await this.client.get<APIResponse<{ progress: number }>>(
                `/users/${userId}/courses/${courseId}/progress`
            );
            return data.data!.progress;
        },
    };

    // Finance Service (Port 4003)
    finance = {
        getWallet: async (userId: string): Promise<Wallet> => {
            const { data } = await this.client.get<APIResponse<Wallet>>(`/wallet/${userId}`);
            return data.data!;
        },

        getTransactions: async (userId: string, page: number = 1): Promise<PaginatedResponse<Transaction>> => {
            const { data } = await this.client.get<PaginatedResponse<Transaction>>(
                `/wallet/${userId}/transactions?page=${page}`
            );
            return data;
        },

        createTransaction: async (transaction: Partial<Transaction>): Promise<Transaction> => {
            const { data } = await this.client.post<APIResponse<Transaction>>(
                '/transactions',
                transaction
            );
            return data.data!;
        },

        calculateRevenueSplit: (amount: number): RevenueSplit => {
            const citadelFundAmount = amount * 0.1;
            const ownerAmount = amount * 0.9;
            return {
                total: amount,
                ownerAmount,
                citadelFundAmount,
            };
        },

        getCitadelFundTotal: async (): Promise<number> => {
            const { data } = await this.client.get<APIResponse<{ total: number }>>(
                '/citadel-fund/total'
            );
            return data.data!.total;
        },
    };

    // Marketplace Service (Port 4004)
    marketplace = {
        getJobs: async (page: number = 1): Promise<PaginatedResponse<Job>> => {
            const { data } = await this.client.get<PaginatedResponse<Job>>(
                `/jobs?page=${page}`
            );
            return data;
        },

        getJob: async (jobId: string): Promise<Job> => {
            const { data } = await this.client.get<APIResponse<Job>>(`/jobs/${jobId}`);
            return data.data!;
        },

        postJob: async (job: Partial<Job>): Promise<Job> => {
            const { data } = await this.client.post<APIResponse<Job>>('/jobs', job);
            return data.data!;
        },

        applyToJob: async (jobId: string, application: Partial<JobApplication>): Promise<JobApplication> => {
            const { data } = await this.client.post<APIResponse<JobApplication>>(
                `/jobs/${jobId}/apply`,
                application
            );
            return data.data!;
        },

        getApplications: async (userId: string): Promise<JobApplication[]> => {
            const { data } = await this.client.get<APIResponse<JobApplication[]>>(
                `/users/${userId}/applications`
            );
            return data.data!;
        },
    };

    // AI Orchestrator (Port 4008)
    ai = {
        sendMessage: async (request: AIChatRequest): Promise<AIChatResponse> => {
            const { data } = await this.client.post<APIResponse<AIChatResponse>>(
                '/ai/chat',
                request
            );
            return data.data!;
        },

        getConversations: async (userId: string): Promise<any[]> => {
            const { data } = await this.client.get<APIResponse<any[]>>(
                `/users/${userId}/conversations`
            );
            return data.data!;
        },
    };

    // Business Incubator
    incubator = {
        getBusinesses: async (userId: string): Promise<Business[]> => {
            const { data } = await this.client.get<APIResponse<Business[]>>(
                `/users/${userId}/businesses`
            );
            return data.data!;
        },

        createBusiness: async (business: Partial<Business>): Promise<Business> => {
            const { data } = await this.client.post<APIResponse<Business>>(
                '/businesses',
                business
            );
            return data.data!;
        },

        getBusiness: async (businessId: string): Promise<Business> => {
            const { data } = await this.client.get<APIResponse<Business>>(
                `/businesses/${businessId}`
            );
            return data.data!;
        },

        updateBusiness: async (businessId: string, updates: Partial<Business>): Promise<Business> => {
            const { data } = await this.client.patch<APIResponse<Business>>(
                `/businesses/${businessId}`,
                updates
            );
            return data.data!;
        },
    };
}

// Export types
export * from './types';
