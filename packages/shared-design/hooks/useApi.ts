/**
 * React Query Hooks for Data Fetching
 * Provides easy-to-use hooks for all API endpoints
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api-client';
import { useNotificationStore } from '../stores';

// Wallet Hooks
export function useWalletBalance(userId: string) {
    return useQuery({
        queryKey: ['wallet', 'balance', userId],
        queryFn: () => api.wallet.getBalance(userId).then(res => res.data),
        enabled: !!userId,
        refetchInterval: 30000, // Refetch every 30s
    });
}

export function useWalletTransactions(userId: string) {
    return useQuery({
        queryKey: ['wallet', 'transactions', userId],
        queryFn: () => api.wallet.getTransactions(userId).then(res => res.data),
        enabled: !!userId,
    });
}

export function useSendTokens() {
    const queryClient = useQueryClient();
    const { addNotification } = useNotificationStore();

    return useMutation({
        mutationFn: (data: any) => api.wallet.sendTokens(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
            addNotification({
                type: 'success',
                title: 'Transaction Sent',
                message: 'Your tokens have been sent successfully',
            });
        },
        onError: (error: any) => {
            addNotification({
                type: 'error',
                title: 'Transaction Failed',
                message: error.response?.data?.message || 'Failed to send tokens',
            });
        },
    });
}

// Mining Hooks
export function useMiningStats(userId: string) {
    return useQuery({
        queryKey: ['mining', 'stats', userId],
        queryFn: () => api.mining.getStats(userId).then(res => res.data),
        enabled: !!userId,
        refetchInterval: 5000, // Refetch every 5s for real-time stats
    });
}

export function useStartMining() {
    const queryClient = useQueryClient();
    const { addNotification } = useNotificationStore();

    return useMutation({
        mutationFn: (userId: string) => api.mining.start(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mining'] });
            addNotification({
                type: 'success',
                title: 'Mining Started',
                message: 'You are now mining LEARN tokens',
            });
        },
    });
}

export function useStopMining() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => api.mining.stop(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mining'] });
        },
    });
}

// Staking Hooks
export function useStakingPositions(userId: string) {
    return useQuery({
        queryKey: ['staking', 'positions', userId],
        queryFn: () => api.staking.getPositions(userId).then(res => res.data),
        enabled: !!userId,
    });
}

export function useStake() {
    const queryClient = useQueryClient();
    const { addNotification } = useNotificationStore();

    return useMutation({
        mutationFn: (data: any) => api.staking.stake(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staking'] });
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
            addNotification({
                type: 'success',
                title: 'Tokens Staked',
                message: 'Your tokens have been staked successfully',
            });
        },
    });
}

// Rewards Hooks
export function useRewards(userId: string) {
    return useQuery({
        queryKey: ['rewards', userId],
        queryFn: () => api.rewards.getRewards(userId).then(res => res.data),
        enabled: !!userId,
    });
}

export function useClaimReward() {
    const queryClient = useQueryClient();
    const { addNotification } = useNotificationStore();

    return useMutation({
        mutationFn: (rewardId: string) => api.rewards.claim(rewardId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rewards'] });
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
            addNotification({
                type: 'success',
                title: 'Reward Claimed',
                message: 'Your reward has been added to your wallet',
            });
        },
    });
}

// Oracle - Insights Hooks
export function useInsights(params?: any) {
    return useQuery({
        queryKey: ['insights', params],
        queryFn: () => api.insights.getAll(params).then(res => res.data),
    });
}

export function useInsight(id: string) {
    return useQuery({
        queryKey: ['insights', id],
        queryFn: () => api.insights.getById(id).then(res => res.data),
        enabled: !!id,
    });
}

// Oracle - Workflows Hooks
export function useWorkflows(params?: any) {
    return useQuery({
        queryKey: ['workflows', params],
        queryFn: () => api.workflows.getAll(params).then(res => res.data),
    });
}

export function useWorkflowTemplates() {
    return useQuery({
        queryKey: ['workflows', 'templates'],
        queryFn: () => api.workflows.getTemplates().then(res => res.data),
    });
}

export function useCreateWorkflow() {
    const queryClient = useQueryClient();
    const { addNotification } = useNotificationStore();

    return useMutation({
        mutationFn: (data: any) => api.workflows.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workflows'] });
            addNotification({
                type: 'success',
                title: 'Workflow Created',
                message: 'Your workflow has been created successfully',
            });
        },
    });
}

// Classroom - Sessions Hooks
export function useSessions(params?: any) {
    return useQuery({
        queryKey: ['sessions', params],
        queryFn: () => api.sessions.getAll(params).then(res => res.data),
    });
}

export function useCreateSession() {
    const queryClient = useQueryClient();
    const { addNotification } = useNotificationStore();

    return useMutation({
        mutationFn: (data: any) => api.sessions.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
            addNotification({
                type: 'success',
                title: 'Session Created',
                message: 'Your classroom session has been scheduled',
            });
        },
    });
}

// Library - Resources Hooks
export function useResourceSearch(query: string, params?: any) {
    return useQuery({
        queryKey: ['resources', 'search', query, params],
        queryFn: () => api.resources.search(query, params).then(res => res.data),
        enabled: query.length > 0,
    });
}

export function useResource(id: string) {
    return useQuery({
        queryKey: ['resources', id],
        queryFn: () => api.resources.getById(id).then(res => res.data),
        enabled: !!id,
    });
}

// Research - Projects Hooks
export function useProjects(params?: any) {
    return useQuery({
        queryKey: ['projects', params],
        queryFn: () => api.projects.getAll(params).then(res => res.data),
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();
    const { addNotification } = useNotificationStore();

    return useMutation({
        mutationFn: (data: any) => api.projects.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            addNotification({
                type: 'success',
                title: 'Project Created',
                message: 'Your research project has been created',
            });
        },
    });
}

// Admin Hooks
export function useAdminUsers(params?: any) {
    return useQuery({
        queryKey: ['admin', 'users', params],
        queryFn: () => api.admin.getUsers(params).then(res => res.data),
    });
}

export function useAdminServices() {
    return useQuery({
        queryKey: ['admin', 'services'],
        queryFn: () => api.admin.getServices().then(res => res.data),
        refetchInterval: 10000, // Refetch every 10s
    });
}

export function useAdminLogs(params?: any) {
    return useQuery({
        queryKey: ['admin', 'logs', params],
        queryFn: () => api.admin.getLogs(params).then(res => res.data),
    });
}
