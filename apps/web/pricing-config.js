/**
 * AZORA EDUCATION - PRICING & TRIAL CONFIGURATION
 * Learn-to-Earn Model: Mine crypto through learning to extend your trial!
 */

const PRICING_TIERS = {
    // 2-Week Free Trial (No payment required)
    FREE_TRIAL: {
        id: 'free-trial',
        name: '2-Week Free Trial',
        price: 0,
        currency: 'ZAR',
        duration: 14, // days
        features: {
            // Full Access During Trial
            aiTutoring: true,
            elaraChat: true,
            interactiveSimulations: true,
            videoLessons: true,
            quizzes: true,
            assessments: true,
            codeExecution: true,

            // Learning Features
            courses: 'unlimited',
            lessons: 'unlimited',
            practiceExercises: 'unlimited',

            // Mining & Earning
            cryptoMining: true,
            miningRate: 1.0, // 100% mining rate
            withdrawals: false, // Can't withdraw during trial

            // Revenue Projects
            revenueProjects: 1, // Can create 1 project
            projectEarnings: '50%', // Keep 50% during trial

            // Community
            studyGroups: true,
            peerHelp: true,
            mentorship: false,

            // Advanced Features
            vrLessons: false,
            arContent: false,
            liveClasses: false,
            certificateAccess: false,
        },

        // Trial Extension Rules
        extensionRules: {
            enabled: true,
            minedTokensRequired: 100, // Need 100 AZR to extend 1 day
            maxExtensionDays: 76, // 14 days base + 76 days extension = 90 DAYS TOTAL
            learningRequirements: {
                lessonsCompleted: 5, // Must complete 5 lessons/week
                quizzesPassed: 3, // Must pass 3 quizzes/week
                averageScore: 70, // Must maintain 70% average
            }
        }
    },

    // Freemium (After trial, if not enough mining)
    FREEMIUM: {
        id: 'freemium',
        name: 'Freemium',
        price: 0,
        currency: 'ZAR',
        features: {
            // Limited AI Access
            aiTutoring: 'limited', // 10 questions/day
            elaraChat: 'limited', // 20 messages/day
            interactiveSimulations: 'limited', // 3/day
            videoLessons: 'limited', // 5/week
            quizzes: true,
            assessments: 'limited', // 2/week
            codeExecution: 'limited', // 10 runs/day

            // Learning Features
            courses: 3, // Max 3 active courses
            lessons: 'unlimited',
            practiceExercises: 'unlimited',

            // Mining & Earning
            cryptoMining: true,
            miningRate: 0.5, // 50% mining rate
            withdrawals: true,
            minWithdrawal: 500, // Need 500 AZR to withdraw

            // Revenue Projects
            revenueProjects: 0, // No revenue projects
            projectEarnings: '0%',

            // Community
            studyGroups: 'limited', // Join only, can't create
            peerHelp: true,
            mentorship: false,

            // Advanced Features
            vrLessons: false,
            arContent: false,
            liveClasses: false,
            certificateAccess: false,

            // Ads
            adsEnabled: true, // Show ads in freemium
        }
    },

    // Premium Student CEO
    PREMIUM: {
        id: 'premium',
        name: 'Student CEO',
        price: 499,
        currency: 'ZAR',
        billing: 'monthly',
        features: {
            // Full AI Access
            aiTutoring: true,
            elaraChat: true,
            interactiveSimulations: true,
            videoLessons: true,
            quizzes: true,
            assessments: true,
            codeExecution: true,

            // Learning Features
            courses: 'unlimited',
            lessons: 'unlimited',
            practiceExercises: 'unlimited',

            // Mining & Earning
            cryptoMining: true,
            miningRate: 2.0, // 200% mining rate (DOUBLE!)
            withdrawals: true,
            minWithdrawal: 100, // Lower withdrawal threshold

            // Revenue Projects
            revenueProjects: 'unlimited',
            projectEarnings: '90%', // Keep 90% of earnings!
            projectSupport: true,
            marketplaceAccess: true,

            // Community
            studyGroups: 'unlimited',
            peerHelp: true,
            mentorship: true,
            expertAccess: true,

            // Advanced Features
            vrLessons: true,
            arContent: true,
            liveClasses: true,
            certificateAccess: true,
            prioritySupport: true,

            // Exclusive
            aiPersonalization: 'advanced',
            careerGuidance: true,
            industryConnections: true,

            // No Ads
            adsEnabled: false,
        }
    },

    // Enterprise (Schools, Universities, Corporations)
    ENTERPRISE: {
        id: 'enterprise',
        name: 'Enterprise',
        price: 'custom',
        currency: 'ZAR',
        features: {
            // Everything in Premium +
            ...this.PREMIUM?.features, // Use optional chaining to avoid error if PREMIUM is undefined during init

            // Enterprise Exclusive
            whiteLabel: true,
            customBranding: true,
            dedicatedSupport: true,
            sla: '99.9%',
            analytics: 'advanced',
            reporting: 'custom',
            integrations: 'unlimited',
            apiAccess: 'full',

            // Bulk Features
            bulkEnrollment: true,
            groupManagement: true,
            adminDashboard: true,
            roleBasedAccess: true,
        }
    }
};

// Fix for circular reference in ENTERPRISE features
// We manually copy the features since 'this' context might not be ready
PRICING_TIERS.ENTERPRISE.features = {
    ...PRICING_TIERS.PREMIUM.features,
    ...PRICING_TIERS.ENTERPRISE.features
};


// Mining Rewards Configuration
const MINING_REWARDS = {
    // Learning Activities
    LESSON_COMPLETE: 10, // 10 AZR per lesson
    QUIZ_PASSED: 25, // 25 AZR per quiz (70%+)
    QUIZ_PERFECT: 50, // 50 AZR for perfect score
    ASSESSMENT_PASSED: 100, // 100 AZR per assessment
    PROJECT_SUBMITTED: 200, // 200 AZR per project

    // Engagement
    DAILY_LOGIN: 5, // 5 AZR for logging in
    STUDY_STREAK_7: 50, // 50 AZR for 7-day streak
    STUDY_STREAK_30: 250, // 250 AZR for 30-day streak
    HELP_PEER: 15, // 15 AZR for helping others

    // Achievements
    FIRST_COURSE: 100,
    MASTER_LEVEL: 500,
    TOP_PERFORMER: 1000,

    // Multipliers
    PREMIUM_MULTIPLIER: 2.0, // Premium users earn 2x
    FREEMIUM_MULTIPLIER: 0.5, // Freemium users earn 0.5x
    TRIAL_MULTIPLIER: 1.0, // Trial users earn 1x
};

// Trial Extension Calculator
function calculateTrialExtension(userStats) {
    const { minedTokens, lessonsCompleted, quizzesPassed, averageScore } = userStats;

    // Check learning requirements
    const meetsRequirements =
        lessonsCompleted >= 5 &&
        quizzesPassed >= 3 &&
        averageScore >= 70;

    if (!meetsRequirements) {
        return {
            canExtend: false,
            reason: 'Learning requirements not met',
            requirements: PRICING_TIERS.FREE_TRIAL.extensionRules.learningRequirements
        };
    }

    // Calculate extension days
    const tokensRequired = PRICING_TIERS.FREE_TRIAL.extensionRules.minedTokensRequired;
    const extensionDays = Math.floor(minedTokens / tokensRequired);
    const maxDays = PRICING_TIERS.FREE_TRIAL.extensionRules.maxExtensionDays;

    return {
        canExtend: extensionDays > 0,
        extensionDays: Math.min(extensionDays, maxDays),
        tokensUsed: extensionDays * tokensRequired,
        tokensRemaining: minedTokens - (extensionDays * tokensRequired)
    };
}

// Upgrade Incentives
const UPGRADE_INCENTIVES = {
    // What you get when upgrading from Freemium to Premium
    FREEMIUM_TO_PREMIUM: {
        bonusTokens: 1000, // 1000 AZR welcome bonus
        firstMonthDiscount: 0.5, // 50% off first month
        unlockFeatures: [
            'Unlimited AI tutoring',
            '2x mining rate',
            'Revenue projects (90% earnings)',
            'VR/AR lessons',
            'Live classes',
            'Expert mentorship',
            'Priority support'
        ]
    },

    // What you get when upgrading from Trial to Premium
    TRIAL_TO_PREMIUM: {
        bonusTokens: 2000, // 2000 AZR welcome bonus
        firstMonthDiscount: 0.3, // 30% off first month
        keepTrialProgress: true,
        unlockFeatures: [
            'Keep all trial progress',
            '2x mining rate',
            'Revenue projects (90% earnings)',
            'Withdraw your mined tokens',
            'All premium features'
        ]
    }
};

// Feature Access Control
function checkFeatureAccess(userTier, feature) {
    const tier = PRICING_TIERS[userTier];
    if (!tier) return false;

    const access = tier.features[feature];

    if (access === true) return { allowed: true, unlimited: true };
    if (access === false) return { allowed: false };
    if (access === 'limited') return { allowed: true, limited: true };
    if (typeof access === 'number') return { allowed: true, limit: access };
    if (typeof access === 'string') return { allowed: true, value: access };

    return { allowed: false };
}

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PRICING_TIERS,
        MINING_REWARDS,
        UPGRADE_INCENTIVES,
        calculateTrialExtension,
        checkFeatureAccess
    };
}
