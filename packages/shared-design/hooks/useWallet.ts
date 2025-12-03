/**
 * React hooks for Azora Mint API
 * Provides easy access to wallet and token data
 */

import { useState, useEffect } from 'react';
import { mintClient, WalletResponse } from '../api/mint-client';

export interface TokenBalance {
    learn: number;
    azr: number;
    staked: number;
    earned: number;
    converted: number;
}

export interface UseWalletResult {
    balance: TokenBalance | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage wallet data
 * @param userId - The user's ID
 * @param autoFetch - Whether to automatically fetch on mount (default: true)
 */
export function useWallet(userId: string | null, autoFetch: boolean = true): UseWalletResult {
    const [balance, setBalance] = useState<TokenBalance | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchWallet = async () => {
        if (!userId) {
            setBalance(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Try to get existing wallet, create if doesn't exist
            let wallet: WalletResponse;
            try {
                wallet = await mintClient.getWallet(userId);
            } catch (err) {
                // Wallet doesn't exist, create it
                wallet = await mintClient.createWallet(userId);
            }

            // Transform API response to TokenBalance format
            const tokenBalance: TokenBalance = {
                learn: wallet.balance || 0,
                azr: 0, // TODO: Get from AZR token service
                staked: wallet.staked || 0,
                earned: wallet.earned || 0,
                converted: 0 // TODO: Track conversions
            };

            setBalance(tokenBalance);
        } catch (err) {
            console.error('Error fetching wallet:', err);
            setError(err as Error);

            // Set default balance on error
            setBalance({
                learn: 0,
                azr: 0,
                staked: 0,
                earned: 0,
                converted: 0
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (autoFetch) {
            fetchWallet();
        }
    }, [userId, autoFetch]);

    return {
        balance,
        loading,
        error,
        refetch: fetchWallet
    };
}

/**
 * Hook to award tokens for completing an activity
 */
export function useAwardTokens() {
    const [awarding, setAwarding] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const awardTokens = async (
        userId: string,
        activityId: string,
        activityType: 'course_completion' | 'job_completion' | 'skill_assessment',
        performance: number = 1.0
    ) => {
        setAwarding(true);
        setError(null);

        try {
            const result = await mintClient.startMining({
                userId,
                activityId,
                activityType,
                performance
            });

            return result;
        } catch (err) {
            console.error('Error awarding tokens:', err);
            setError(err as Error);
            throw err;
        } finally {
            setAwarding(false);
        }
    };

    return {
        awardTokens,
        awarding,
        error
    };
}

/**
 * Hook to stake tokens
 */
export function useStaking() {
    const [staking, setStaking] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const stake = async (userId: string, amount: number, duration: number = 30) => {
        setStaking(true);
        setError(null);

        try {
            const result = await mintClient.stake(userId, amount, duration);
            return result;
        } catch (err) {
            console.error('Error staking tokens:', err);
            setError(err as Error);
            throw err;
        } finally {
            setStaking(false);
        }
    };

    const unstake = async (stakeId: string) => {
        setStaking(true);
        setError(null);

        try {
            const result = await mintClient.unstake(stakeId);
            return result;
        } catch (err) {
            console.error('Error unstaking tokens:', err);
            setError(err as Error);
            throw err;
        } finally {
            setStaking(false);
        }
    };

    return {
        stake,
        unstake,
        staking,
        error
    };
}

/**
 * Hook to get mining stats
 */
export function useMiningStats(userId: string | null) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!userId) return;

        const fetchStats = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await mintClient.getMiningStats(userId);
                setStats(result);
            } catch (err) {
                console.error('Error fetching mining stats:', err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [userId]);

    return {
        stats,
        loading,
        error
    };
}
