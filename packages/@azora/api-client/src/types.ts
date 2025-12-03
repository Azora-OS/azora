// Type definitions for Azora OS API

// User Types
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'student' | 'teacher' | 'admin' | 'enterprise';
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    role?: 'student' | 'teacher';
}

export interface AuthResponse {
    token: string;
    user: User;
}

// Course Types
export interface Course {
    id: string;
    title: string;
    description: string;
    instructor: string;
    price: number;
    duration: number; // in hours
    level: 'beginner' | 'intermediate' | 'advanced';
    thumbnail?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    progress: number; // 0-100
    startedAt: Date;
    completedAt?: Date;
}

// Financial Types
export interface Wallet {
    id: string;
    userId: string;
    balance: number;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Transaction {
    id: string;
    userId: string;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    status: 'pending' | 'completed' | 'failed';
    citadelFundAllocation?: number; // 10% for Citadel Fund
    createdAt: Date;
}

export interface RevenueSplit {
    total: number;
    ownerAmount: number; // 90%
    citadelFundAmount: number; // 10%
}

// Marketplace Types
export interface Job {
    id: string;
    title: string;
    description: string;
    company: string;
    location: string;
    salary?: string;
    type: 'full-time' | 'part-time' | 'contract' | 'freelance';
    skills: string[];
    postedAt: Date;
    expiresAt?: Date;
}

export interface JobApplication {
    id: string;
    jobId: string;
    userId: string;
    coverLetter: string;
    resume?: string;
    status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
    appliedAt: Date;
}

// AI Types
export interface AIMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface AIConversation {
    id: string;
    userId: string;
    messages: AIMessage[];
    context?: string;
    aiMember?: string; // e.g., 'Elara'
    createdAt: Date;
    updatedAt: Date;
}

export interface AIChatRequest {
    message: string;
    member?: string;
    context?: string;
}

export interface AIChatResponse {
    response: string;
    conversationId: string;
}

// Business Incubation Types
export interface Business {
    id: string;
    userId: string;
    name: string;
    description: string;
    type: string;
    revenue: number;
    citadelContribution: number; // 10% of revenue
    createdAt: Date;
    updatedAt: Date;
}

// API Response Types
export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
