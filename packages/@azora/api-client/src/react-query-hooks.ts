import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AzoraAPIClient } from './index';

let clientInstance: AzoraAPIClient | null = null;

export const getApiClient = () => {
    if (!clientInstance) {
        clientInstance = new AzoraAPIClient();
    }
    return clientInstance;
};

// Auth hooks
export const useAuthMutation = () => {
    const client = getApiClient();
    const queryClient = useQueryClient();

    const login = useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) =>
            client.auth.login({ email, password }),
        onSuccess: (data) => {
            if (data.token) {
                client.setToken(data.token);
                queryClient.invalidateQueries({ queryKey: ['profile'] });
            }
        }
    });

    const register = useMutation({
        mutationFn: (data: any) => client.auth.register(data)
    });

    const logout = () => {
        client.clearToken();
        queryClient.clear();
    };

    return { login, register, logout };
};

export const useProfile = () => {
    const client = getApiClient();
    return useQuery({
        queryKey: ['profile'],
        queryFn: () => client.auth.getCurrentUser()
    });
};

// Education hooks
export const useCoursesQuery = (params?: any) => {
    const client = getApiClient();
    return useQuery({
        queryKey: ['courses', params],
        queryFn: () => client.education.getCourses(params?.page, params?.pageSize)
    });
};

export const useEnrollmentMutation = () => {
    const client = getApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ courseId }: { courseId: string }) =>
            client.education.enrollInCourse(courseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            queryClient.invalidateQueries({ queryKey: ['enrollments'] });
        }
    });
};

export const useEnrollmentsQuery = () => {
    const client = getApiClient();
    return useQuery({
        queryKey: ['enrollments'],
        queryFn: () => client.education.getEnrollments('current-user') // TODO: Get actual user ID
    });
};

// Finance/Wallet hooks
export const useWalletQuery = (userId?: string) => {
    const client = getApiClient();
    return useQuery({
        queryKey: ['wallet', userId],
        queryFn: () => client.finance.getWallet(userId || 'current-user'),
        enabled: !!userId
    });
};

export const useTransactionsQuery = (userId?: string, params?: any) => {
    const client = getApiClient();
    return useQuery({
        queryKey: ['transactions', userId, params],
        queryFn: () => client.finance.getTransactions(userId || 'current-user', params?.page)
    });
};

// Marketplace/Jobs hooks
export const useJobsQuery = (params?: any) => {
    const client = getApiClient();
    return useQuery({
        queryKey: ['jobs', params],
        queryFn: () => client.marketplace.getJobs(params?.page)
    });
};

export const useMarketplaceListingsQuery = (params?: any) => {
    const client = getApiClient();
    return useQuery({
        queryKey: ['marketplace', 'listings', params],
        queryFn: () => client.marketplace.getJobs(params?.page) // Using jobs as marketplace listings
    });
};

export const useJobApplicationMutation = () => {
    const client = getApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ jobId, userId }: { jobId: string; userId: string }) =>
            client.marketplace.applyToJob(jobId, { userId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        }
    });
};

export const useApplicationsQuery = () => {
    const client = getApiClient();
    return useQuery({
        queryKey: ['applications'],
        queryFn: () => client.marketplace.getApplications('current-user') // TODO: Get actual user ID
    });
};

// Dashboard hooks
export const useDashboardOverviewQuery = () => {
    const client = getApiClient();
    return useQuery({
        queryKey: ['dashboard', 'overview'],
        queryFn: async () => {
            // Mock data for now since dashboard endpoint doesn't exist in new client
            return {
                data: {
                    stats: {
                        totalCourses: 0,
                        activeCourses: 0,
                        completedCourses: 0,
                        totalEarnings: 0
                    }
                }
            };
        }
    });
};

export const useDashboardMetricsQuery = (timeRange?: string) => {
    const client = getApiClient();
    return useQuery({
        queryKey: ['dashboard', 'metrics', timeRange],
        queryFn: async () => {
            // Mock data for now
            return {
                data: {
                    metrics: []
                }
            };
        }
    });
};

export const useDashboardActivityQuery = () => {
    const client = getApiClient();
    return useQuery({
        queryKey: ['dashboard', 'activity'],
        queryFn: async () => {
            // Mock data for now
            return {
                data: {
                    activities: []
                }
            };
        }
    });
};

// Health/System hooks
export const useHealthCheckQuery = () => {
    const client = getApiClient();
    return useQuery({
        queryKey: ['health', 'check'],
        queryFn: async () => {
            // Mock health check
            return {
                data: {
                    status: 'healthy',
                    timestamp: new Date().toISOString()
                }
            };
        }
    });
};

export const useServiceStatusQuery = () => {
    const client = getApiClient();
    return useQuery({
        queryKey: ['health', 'status'],
        queryFn: async () => {
            // Mock service status
            return {
                data: {
                    services: []
                }
            };
        }
    });
};

// Cloud hooks (mock for now)
export const useInstancesQuery = () => {
    const client = getApiClient();
    return useQuery({
        queryKey: ['cloud', 'instances'],
        queryFn: async () => ({ data: { instances: [] } })
    });
};

export const useMetricsQuery = () => {
    const client = getApiClient();
    return useQuery({
        queryKey: ['cloud', 'metrics'],
        queryFn: async () => ({ data: { metrics: [] } })
    });
};

// Compliance hooks (mock for now)
export const useComplianceQuery = () => {
    const client = getApiClient();
    return useQuery({
        queryKey: ['compliance'],
        queryFn: async () => ({ data: { status: 'compliant' } })
    });
};

// AI/Elara hooks
export const useElaraQueryMutation = () => {
    const client = getApiClient();
    return useMutation({
        mutationFn: ({ query, context }: { query: string; context?: any }) =>
            client.ai.sendMessage({ message: query, context })
    });
};

export const useElaraAskMutation = () => {
    const client = getApiClient();
    return useMutation({
        mutationFn: ({ question, context }: { question: string; context?: any }) =>
            client.ai.sendMessage({ message: question, context })
    });
};

// Study Spaces hooks
export const useStudySpacesQuery = (filter?: 'my' | 'all') => {
    const client = getApiClient();
    return useQuery({
        queryKey: ['spaces', filter],
        queryFn: async () => {
            // Mock study spaces data
            return {
                data: [
                    {
                        id: '1',
                        name: 'Mathematics Study Group',
                        description: 'Advanced calculus and linear algebra',
                        members: 12,
                        maxMembers: 20,
                        privacy: 'PUBLIC',
                        tags: ['Math', 'Calculus', 'Linear Algebra'],
                        isMember: filter === 'my',
                        activeSession: true
                    },
                    {
                        id: '2',
                        name: 'Physics Lab',
                        description: 'Quantum mechanics and thermodynamics',
                        members: 8,
                        maxMembers: 15,
                        privacy: 'PRIVATE',
                        tags: ['Physics', 'Quantum', 'Thermodynamics'],
                        isMember: filter === 'my',
                        activeSession: false
                    }
                ]
            };
        }
    });
};

export const useCreateSpaceMutation = () => {
    const client = getApiClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            // Mock create space
            return { data: { id: Date.now().toString(), ...data } };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['spaces'] });
        }
    });
};

// Business/Incubator hooks
export const useBusinessesQuery = () => {
    const client = getApiClient();
    return useQuery({
        queryKey: ['businesses'],
        queryFn: () => client.incubator.getBusinesses('current-user') // TODO: Get actual user ID
    });
};

export const useCreateBusinessMutation = () => {
    const client = getApiClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => client.incubator.createBusiness(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['businesses'] });
        }
    });
};

// Simulations hooks
export const useSimulationsQuery = (params?: { subject?: string; grade?: number }) => {
    const client = getApiClient();
    return useQuery({
        queryKey: ['simulations', params],
        queryFn: async () => {
            // Mock simulations data
            return {
                data: [
                    {
                        id: '1',
                        title: 'Physics Simulation',
                        description: 'Interactive physics experiments',
                        subject: params?.subject || 'Physics',
                        grade: params?.grade || 10
                    }
                ]
            };
        }
    });
};
