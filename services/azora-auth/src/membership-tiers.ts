export enum MembershipTier {
    FREE = 'free',
    STUDENT = 'student',
    PROFESSIONAL = 'professional',
    ENTERPRISE = 'enterprise'
}

export interface TierLimits {
    aiRequests: number;        // AI requests per month (-1 = unlimited)
    storage: number;           // GB
    courses: number;           // Concurrent enrollments (-1 = unlimited)
    projects: number;          // Active projects (-1 = unlimited)
    features: string[];        // Enabled features
    price: number;             // Monthly price in USD
}

export const TIER_LIMITS: Record<MembershipTier, TierLimits> = {
    [MembershipTier.FREE]: {
        aiRequests: 100,          // 100 AI requests/month
        storage: 1,               // 1 GB
        courses: 3,               // 3 courses max
        projects: 5,              // 5 projects
        price: 0,
        features: [
            'basic-ai',
            'community-courses',
            'code-editor',
            'marketplace-browse'
        ]
    },
    [MembershipTier.STUDENT]: {
        aiRequests: 1000,         // 1000 AI requests/month
        storage: 10,              // 10 GB
        courses: 20,              // 20 courses
        projects: 50,             // 50 projects
        price: 9.99,
        features: [
            'advanced-ai',
            'all-courses',
            'code-review',
            'marketplace-sell',
            'priority-queue',
            'offline-mode'
        ]
    },
    [MembershipTier.PROFESSIONAL]: {
        aiRequests: 10000,        // 10K AI requests/month
        storage: 100,             // 100 GB
        courses: -1,              // Unlimited
        projects: 200,            // 200 projects
        price: 29.99,
        features: [
            'premium-ai',
            'all-courses',
            'priority-support',
            'custom-models',
            'api-access',
            'white-label',
            'analytics-advanced',
            'team-collaboration'
        ]
    },
    [MembershipTier.ENTERPRISE]: {
        aiRequests: -1,           // Unlimited
        storage: 1000,            // 1 TB
        courses: -1,              // Unlimited
        projects: -1,             // Unlimited
        price: 99.99,
        features: [
            'all',
            'dedicated-support',
            'custom-deployment',
            'sla-guarantee',
            'audit-logs',
            'sso',
            'custom-branding'
        ]
    }
};

export function getTierByName(tierName: string): MembershipTier {
    return MembershipTier[tierName.toUpperCase() as keyof typeof MembershipTier] || MembershipTier.FREE;
}

export function canAccessFeature(tier: MembershipTier, feature: string): boolean {
    const limits = TIER_LIMITS[tier];
    return limits.features.includes('all') || limits.features.includes(feature);
}

export function getSuggestedUpgrade(currentTier: MembershipTier): MembershipTier | null {
    const tiers = [MembershipTier.FREE, MembershipTier.STUDENT, MembershipTier.PROFESSIONAL, MembershipTier.ENTERPRISE];
    const currentIndex = tiers.indexOf(currentTier);

    if (currentIndex < tiers.length - 1) {
        return tiers[currentIndex + 1];
    }

    return null;
}
