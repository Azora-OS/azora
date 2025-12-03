export enum FailureType {
    SERVICE_CRASH = 'SERVICE_CRASH',
    NETWORK_LATENCY = 'NETWORK_LATENCY',
    DATABASE_DISCONNECT = 'DATABASE_DISCONNECT',
    MEMORY_LEAK = 'MEMORY_LEAK',
    CPU_SPIKE = 'CPU_SPIKE',
    TIMEOUT = 'TIMEOUT',
    RATE_LIMIT = 'RATE_LIMIT'
}

export interface ChaosEvent {
    id: string;
    type: FailureType;
    targetService: string;
    timestamp: string;
    duration: number; // milliseconds
    intensity: 'low' | 'medium' | 'high';
    metadata?: Record<string, any>;
}

export interface ChaosConfig {
    enabled: boolean;
    intensity: 'low' | 'medium' | 'high';
    targetServices: string[];
    excludeServices: string[]; // Critical services never touched
    schedule: {
        frequency: string; // cron expression
        duration: number; // minutes
    };
    requireApproval: boolean; // Require Constitutional AI approval
}

export interface ChaosResult {
    eventId: string;
    success: boolean;
    impact: {
        servicesAffected: string[];
        errorRate: number;
        recoveryTime: number; // milliseconds
    };
    learnings: string[];
}
