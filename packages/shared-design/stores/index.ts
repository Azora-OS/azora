/**
 * Zustand Stores for Global State Management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// User Store
interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
}

interface UserStore {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User) => void;
    logout: () => void;
}

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            setUser: (user) => set({ user, isAuthenticated: true }),
            logout: () => {
                localStorage.removeItem('azora_token');
                localStorage.removeItem('azora_refresh_token');
                set({ user: null, isAuthenticated: false });
            },
        }),
        { name: 'azora-user' }
    )
);

// Wallet Store
interface WalletStore {
    balance: {
        learn: number;
        azr: number;
        staked: number;
        earned: number;
    };
    transactions: any[];
    setBalance: (balance: any) => void;
    addTransaction: (transaction: any) => void;
}

export const useWalletStore = create<WalletStore>()((set) => ({
    balance: { learn: 0, azr: 0, staked: 0, earned: 0 },
    transactions: [],
    setBalance: (balance) => set({ balance }),
    addTransaction: (transaction) =>
        set((state) => ({ transactions: [transaction, ...state.transactions] })),
}));

// Mining Store
interface MiningStore {
    isActive: boolean;
    hashRate: number;
    tokensEarned: number;
    uptime: number;
    difficulty: number;
    setMiningStatus: (isActive: boolean) => void;
    updateStats: (stats: any) => void;
}

export const useMiningStore = create<MiningStore>()((set) => ({
    isActive: false,
    hashRate: 0,
    tokensEarned: 0,
    uptime: 0,
    difficulty: 1,
    setMiningStatus: (isActive) => set({ isActive }),
    updateStats: (stats) => set(stats),
}));

// Session Store (for Classroom)
interface SessionStore {
    activeSessions: any[];
    currentSession: any | null;
    participants: any[];
    setActiveSessions: (sessions: any[]) => void;
    joinSession: (session: any) => void;
    leaveSession: () => void;
    updateParticipants: (participants: any[]) => void;
}

export const useSessionStore = create<SessionStore>()((set) => ({
    activeSessions: [],
    currentSession: null,
    participants: [],
    setActiveSessions: (sessions) => set({ activeSessions: sessions }),
    joinSession: (session) => set({ currentSession: session }),
    leaveSession: () => set({ currentSession: null, participants: [] }),
    updateParticipants: (participants) => set({ participants }),
}));

// Notification Store
interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
}

interface NotificationStore {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotification: (id: string) => void;
    clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>()((set) => ({
    notifications: [],
    unreadCount: 0,
    addNotification: (notification) =>
        set((state) => {
            const newNotification: Notification = {
                ...notification,
                id: Date.now().toString(),
                timestamp: Date.now(),
                read: false,
            };
            return {
                notifications: [newNotification, ...state.notifications],
                unreadCount: state.unreadCount + 1,
            };
        }),
    markAsRead: (id) =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
        })),
    markAllAsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
        })),
    clearNotification: (id) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        })),
    clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
