/**
 * Unified API Client for Azora Ecosystem
 * Handles authentication, retries, and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// API Configuration
const API_CONFIG = {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
};

// Create axios instance
export const apiClient: AxiosInstance = axios.create(API_CONFIG);

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('azora_token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle errors and retries
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 - Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Try to refresh token
            try {
                const refreshToken = localStorage.getItem('azora_refresh_token');
                const { data } = await axios.post(`${API_CONFIG.baseURL}/auth/refresh`, {
                    refreshToken,
                });

                localStorage.setItem('azora_token', data.token);

                // Retry original request
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${data.token}`;
                }
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed - logout user
                localStorage.removeItem('azora_token');
                localStorage.removeItem('azora_refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle 429 - Rate limiting (retry with exponential backoff)
        if (error.response?.status === 429 && !originalRequest._retry) {
            originalRequest._retry = true;
            const retryAfter = parseInt(error.response.headers['retry-after'] || '1', 10);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            return apiClient(originalRequest);
        }

        return Promise.reject(error);
    }
);

// API Methods
export const api = {
    // Auth
    auth: {
        login: (email: string, password: string) =>
            apiClient.post('/auth/login', { email, password }),
        register: (data: any) =>
            apiClient.post('/auth/register', data),
        logout: () =>
            apiClient.post('/auth/logout'),
        refreshToken: (refreshToken: string) =>
            apiClient.post('/auth/refresh', { refreshToken }),
    },

    // Wallet
    wallet: {
        getBalance: (userId: string) =>
            apiClient.get(`/wallet/${userId}`),
        getTransactions: (userId: string, params?: any) =>
            apiClient.get(`/wallet/${userId}/transactions`, { params }),
        sendTokens: (data: any) =>
            apiClient.post('/transactions/send', data),
    },

    // Mining
    mining: {
        start: (userId: string) =>
            apiClient.post('/mining/start', { userId }),
        stop: (userId: string) =>
            apiClient.post('/mining/stop', { userId }),
        getStats: (userId: string) =>
            apiClient.get(`/mining/stats/${userId}`),
    },

    // Staking
    staking: {
        stake: (data: any) =>
            apiClient.post('/staking/stake', data),
        unstake: (stakeId: string) =>
            apiClient.post(`/staking/unstake/${stakeId}`),
        getPositions: (userId: string) =>
            apiClient.get(`/staking/positions/${userId}`),
    },

    // Rewards
    rewards: {
        claim: (rewardId: string) =>
            apiClient.post(`/rewards/claim/${rewardId}`),
        claimAll: (userId: string) =>
            apiClient.post(`/rewards/claim-all/${userId}`),
        getRewards: (userId: string) =>
            apiClient.get(`/rewards/${userId}`),
    },

    // Oracle - Insights
    insights: {
        getAll: (params?: any) =>
            apiClient.get('/insights', { params }),
        getById: (id: string) =>
            apiClient.get(`/insights/${id}`),
        dismiss: (id: string) =>
            apiClient.post(`/insights/${id}/dismiss`),
    },

    // Oracle - Workflows
    workflows: {
        getAll: (params?: any) =>
            apiClient.get('/workflows', { params }),
        getById: (id: string) =>
            apiClient.get(`/workflows/${id}`),
        create: (data: any) =>
            apiClient.post('/workflows', data),
        update: (id: string, data: any) =>
            apiClient.put(`/workflows/${id}`, data),
        delete: (id: string) =>
            apiClient.delete(`/workflows/${id}`),
        pause: (id: string) =>
            apiClient.post(`/workflows/${id}/pause`),
        resume: (id: string) =>
            apiClient.post(`/workflows/${id}/resume`),
        getTemplates: () =>
            apiClient.get('/workflows/templates'),
    },

    // Oracle - Analytics
    analytics: {
        getReports: (params?: any) =>
            apiClient.get('/analytics/reports', { params }),
        createReport: (data: any) =>
            apiClient.post('/analytics/reports', data),
        getForecast: (params?: any) =>
            apiClient.get('/analytics/forecast', { params }),
    },

    // Classroom - Sessions
    sessions: {
        getAll: (params?: any) =>
            apiClient.get('/sessions', { params }),
        getById: (id: string) =>
            apiClient.get(`/sessions/${id}`),
        create: (data: any) =>
            apiClient.post('/sessions', data),
        join: (id: string) =>
            apiClient.post(`/sessions/${id}/join`),
        leave: (id: string) =>
            apiClient.post(`/sessions/${id}/leave`),
    },

    // Classroom - Recordings
    recordings: {
        getAll: (params?: any) =>
            apiClient.get('/recordings', { params }),
        getById: (id: string) =>
            apiClient.get(`/recordings/${id}`),
        download: (id: string) =>
            apiClient.get(`/recordings/${id}/download`, { responseType: 'blob' }),
    },

    // Classroom - Schedule
    schedule: {
        get: (params?: any) =>
            apiClient.get('/schedule', { params }),
        create: (data: any) =>
            apiClient.post('/schedule', data),
        update: (id: string, data: any) =>
            apiClient.put(`/schedule/${id}`, data),
        delete: (id: string) =>
            apiClient.delete(`/schedule/${id}`),
    },

    // Library - Resources
    resources: {
        search: (query: string, params?: any) =>
            apiClient.post('/resources/search', { query, ...params }),
        getById: (id: string) =>
            apiClient.get(`/resources/${id}`),
        download: (id: string) =>
            apiClient.get(`/resources/${id}/download`, { responseType: 'blob' }),
    },

    // Library - Collections
    collections: {
        getAll: (params?: any) =>
            apiClient.get('/collections', { params }),
        getById: (id: string) =>
            apiClient.get(`/collections/${id}`),
        subscribe: (id: string) =>
            apiClient.post(`/collections/${id}/subscribe`),
    },

    // Research - Projects
    projects: {
        getAll: (params?: any) =>
            apiClient.get('/projects', { params }),
        getById: (id: string) =>
            apiClient.get(`/projects/${id}`),
        create: (data: any) =>
            apiClient.post('/projects', data),
        update: (id: string, data: any) =>
            apiClient.put(`/projects/${id}`, data),
    },

    // Research - Publications
    publications: {
        getAll: (params?: any) =>
            apiClient.get('/publications', { params }),
        getById: (id: string) =>
            apiClient.get(`/publications/${id}`),
        download: (id: string) =>
            apiClient.get(`/publications/${id}/download`, { responseType: 'blob' }),
    },

    // Research - Grants
    grants: {
        getAll: (params?: any) =>
            apiClient.get('/grants', { params }),
        getById: (id: string) =>
            apiClient.get(`/grants/${id}`),
        apply: (data: any) =>
            apiClient.post('/grants/apply', data),
    },

    // Master - Admin
    admin: {
        getUsers: (params?: any) =>
            apiClient.get('/admin/users', { params }),
        getServices: () =>
            apiClient.get('/admin/services'),
        getLogs: (params?: any) =>
            apiClient.get('/admin/logs', { params }),
        updateService: (id: string, action: 'start' | 'stop' | 'restart') =>
            apiClient.post(`/admin/services/${id}/${action}`),
    },
};

export default api;
