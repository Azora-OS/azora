/**
 * Azora Service Registry
 * Central configuration for all Azora educational and AI services
 */

export interface ServiceConfig {
    name: string;
    displayName: string;
    description: string;
    baseURL: string;
    port: number;
    status: 'online' | 'offline' | 'unknown';
    category: 'education' | 'ai' | 'finance' | 'careers' | 'business' | 'infrastructure';
    endpoints: {
        health?: string;
        api?: string;
        chat?: string;
    };
}

export const AZORA_SERVICES: Record<string, ServiceConfig> = {
    // Core AI Services
    'azora-sapiens': {
        name: 'azora-sapiens',
        displayName: 'Elara (Sapiens 2.0)',
        description: 'AI tutoring, personalized learning, homework help',
        baseURL: process.env.NEXT_PUBLIC_SAPIENS_URL || 'http://localhost:3001',
        port: 3001,
        status: 'unknown',
        category: 'ai',
        endpoints: {
            health: '/health',
            api: '/api',
            chat: '/api/chat',
        },
    },

    // Education Services
    'azora-education': {
        name: 'azora-education',
        displayName: 'Education Core',
        description: 'Course management, curriculum, assessments',
        baseURL: process.env.NEXT_PUBLIC_EDUCATION_URL || 'http://localhost:3002',
        port: 3002,
        status: 'unknown',
        category: 'education',
        endpoints: {
            health: '/health',
            api: '/api',
        },
    },

    'azora-classroom': {
        name: 'azora-classroom',
        displayName: 'Virtual Classroom',
        description: 'Live classes, collaboration, group learning',
        baseURL: process.env.NEXT_PUBLIC_CLASSROOM_URL || 'http://localhost:3003',
        port: 3003,
        status: 'unknown',
        category: 'education',
        endpoints: {
            health: '/health',
            api: '/api',
        },
    },

    'azora-assessment': {
        name: 'azora-assessment',
        displayName: 'Assessment Engine',
        description: 'Quizzes, tests, grading, analytics',
        baseURL: process.env.NEXT_PUBLIC_ASSESSMENT_URL || 'http://localhost:3004',
        port: 3004,
        status: 'unknown',
        category: 'education',
        endpoints: {
            health: '/health',
            api: '/api',
        },
    },

    'azora-library': {
        name: 'azora-library',
        displayName: 'Digital Library',
        description: 'Learning resources, books, videos, materials',
        baseURL: process.env.NEXT_PUBLIC_LIBRARY_URL || 'http://localhost:3005',
        port: 3005,
        status: 'unknown',
        category: 'education',
        endpoints: {
            health: '/health',
            api: '/api',
        },
    },

    'azora-studyspaces': {
        name: 'azora-studyspaces',
        displayName: 'Study Spaces',
        description: 'Virtual study rooms, peer collaboration',
        baseURL: process.env.NEXT_PUBLIC_STUDYSPACES_URL || 'http://localhost:3006',
        port: 3006,
        status: 'unknown',
        category: 'education',
        endpoints: {
            health: '/health',
            api: '/api',
        },
    },

    // AI Family Services
    'elara-incubator': {
        name: 'elara-incubator',
        displayName: 'Elara Incubator',
        description: 'Business idea incubation, mentorship',
        baseURL: process.env.NEXT_PUBLIC_INCUBATOR_URL || 'http://localhost:3007',
        port: 3007,
        status: 'unknown',
        category: 'business',
        endpoints: {
            health: '/health',
            api: '/api',
        },
    },

    'azora-careers': {
        name: 'azora-careers',
        displayName: 'Themba (Careers)',
        description: 'Career guidance, job matching, skill development',
        baseURL: process.env.NEXT_PUBLIC_CAREERS_URL || 'http://localhost:3008',
        port: 3008,
        status: 'unknown',
        category: 'careers',
        endpoints: {
            health: '/health',
            api: '/api',
        },
    },

    'azora-finance': {
        name: 'azora-finance',
        displayName: 'Kofi (Finance)',
        description: 'Financial literacy, budgeting, investment guidance',
        baseURL: process.env.NEXT_PUBLIC_FINANCE_URL || 'http://localhost:3009',
        port: 3009,
        status: 'unknown',
        category: 'finance',
        endpoints: {
            health: '/health',
            api: '/api',
        },
    },

    // Project & Revenue Services
    'azora-forge': {
        name: 'azora-forge',
        displayName: 'AZORA Forge',
        description: 'Project creation, revenue generation, student CEO platform',
        baseURL: process.env.NEXT_PUBLIC_FORGE_URL || 'http://localhost:3010',
        port: 3010,
        status: 'unknown',
        category: 'business',
        endpoints: {
            health: '/health',
            api: '/api',
        },
    },

    'education-revenue-engine': {
        name: 'education-revenue-engine',
        displayName: 'Revenue Engine',
        description: 'Student project monetization, revenue tracking',
        baseURL: process.env.NEXT_PUBLIC_REVENUE_URL || 'http://localhost:3011',
        port: 3011,
        status: 'unknown',
        category: 'business',
        endpoints: {
            health: '/health',
            api: '/api',
        },
    },

    'azora-marketplace': {
        name: 'azora-marketplace',
        displayName: 'Marketplace',
        description: 'Buy/sell student projects, services, skills',
        baseURL: process.env.NEXT_PUBLIC_MARKETPLACE_URL || 'http://localhost:3012',
        port: 3012,
        status: 'unknown',
        category: 'business',
        endpoints: {
            health: '/health',
            api: '/api',
        },
    },

    // Infrastructure Services
    'auth-service': {
        name: 'auth-service',
        displayName: 'Authentication',
        description: 'User identity, security, session management',
        baseURL: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:4000',
        port: 4000,
        status: 'unknown',
        category: 'infrastructure',
        endpoints: {
            health: '/health',
            api: '/api',
        },
    },

    'elara-onboarding': {
        name: 'elara-onboarding',
        displayName: 'Onboarding Service',
        description: 'User onboarding, profile setup, mining activation',
        baseURL: process.env.NEXT_PUBLIC_ONBOARDING_URL || 'http://localhost:5000',
        port: 5000,
        status: 'unknown',
        category: 'infrastructure',
        endpoints: {
            health: '/health',
            api: '/api',
        },
    },
};

/**
 * Service Discovery - Check which services are online
 */
export async function discoverServices(): Promise<Record<string, ServiceConfig>> {
    const services = { ...AZORA_SERVICES };

    await Promise.all(
        Object.keys(services).map(async (key) => {
            const service = services[key];
            try {
                const response = await fetch(`${service.baseURL}${service.endpoints.health || '/health'}`, {
                    method: 'GET',
                    signal: AbortSignal.timeout(2000), // 2 second timeout
                });
                services[key].status = response.ok ? 'online' : 'offline';
            } catch (error) {
                services[key].status = 'offline';
            }
        })
    );

    return services;
}

/**
 * Get services by category
 */
export function getServicesByCategory(category: ServiceConfig['category']): ServiceConfig[] {
    return Object.values(AZORA_SERVICES).filter((service) => service.category === category);
}

/**
 * Get online services
 */
export function getOnlineServices(services: Record<string, ServiceConfig>): ServiceConfig[] {
    return Object.values(services).filter((service) => service.status === 'online');
}
