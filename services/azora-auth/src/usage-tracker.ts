import { MembershipTier, TIER_LIMITS } from './membership-tiers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UsageStats {
    aiRequests: number;
    storage: number;
    activeCourses: number;
    activeProjects: number;
    lastReset: Date;
}

export class UsageTracker {
    /**
     * Track an AI request and check if user has exceeded limits
     */
    async trackAIRequest(userId: string): Promise<{ allowed: boolean; remaining: number; tier: MembershipTier }> {
        const user = await this.getUser(userId);
        const tier = user.membershipTier as MembershipTier;
        const limits = TIER_LIMITS[tier];

        // Get current month's usage
        const usage = await this.getMonthlyUsage(userId);

        // Check if user has exceeded limits
        if (limits.aiRequests !== -1 && usage.aiRequests >= limits.aiRequests) {
            return {
                allowed: false,
                remaining: 0,
                tier
            };
        }

        // Increment usage
        await this.incrementUsage(userId, 'aiRequests');

        const remaining = limits.aiRequests === -1
            ? -1
            : limits.aiRequests - (usage.aiRequests + 1);

        return {
            allowed: true,
            remaining,
            tier
        };
    }

    /**
     * Get current month's usage for a user
     */
    async getMonthlyUsage(userId: string): Promise<UsageStats> {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const usage = await prisma.usage.findFirst({
            where: {
                userId,
                createdAt: {
                    gte: startOfMonth
                }
            }
        });

        if (!usage) {
            // Create new usage record for this month
            return await prisma.usage.create({
                data: {
                    userId,
                    aiRequests: 0,
                    storage: 0,
                    activeCourses: 0,
                    activeProjects: 0,
                    lastReset: startOfMonth
                }
            });
        }

        return usage;
    }

    /**
     * Increment usage counter
     */
    async incrementUsage(userId: string, field: keyof Omit<UsageStats, 'lastReset'>): Promise<void> {
        const usage = await this.getMonthlyUsage(userId);

        await prisma.usage.update({
            where: { id: usage.id },
            data: {
                [field]: {
                    increment: 1
                }
            }
        });
    }

    /**
     * Check if user can perform an action
     */
    async canPerformAction(userId: string, action: 'ai' | 'course' | 'project'): Promise<boolean> {
        const user = await this.getUser(userId);
        const tier = user.membershipTier as MembershipTier;
        const limits = TIER_LIMITS[tier];
        const usage = await this.getMonthlyUsage(userId);

        switch (action) {
            case 'ai':
                return limits.aiRequests === -1 || usage.aiRequests < limits.aiRequests;
            case 'course':
                return limits.courses === -1 || usage.activeCourses < limits.courses;
            case 'project':
                return limits.projects === -1 || usage.activeProjects < limits.projects;
            default:
                return false;
        }
    }

    /**
     * Get usage percentage for display
     */
    async getUsagePercentage(userId: string): Promise<Record<string, number>> {
        const user = await this.getUser(userId);
        const tier = user.membershipTier as MembershipTier;
        const limits = TIER_LIMITS[tier];
        const usage = await this.getMonthlyUsage(userId);

        return {
            aiRequests: limits.aiRequests === -1 ? 0 : (usage.aiRequests / limits.aiRequests) * 100,
            storage: (usage.storage / limits.storage) * 100,
            courses: limits.courses === -1 ? 0 : (usage.activeCourses / limits.courses) * 100,
            projects: limits.projects === -1 ? 0 : (usage.activeProjects / limits.projects) * 100
        };
    }

    /**
     * Reset usage counters (called monthly by cron)
     */
    async resetMonthlyUsage(): Promise<void> {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        await prisma.usage.updateMany({
            where: {
                lastReset: {
                    lt: startOfMonth
                }
            },
            data: {
                aiRequests: 0,
                storage: 0,
                activeCourses: 0,
                activeProjects: 0,
                lastReset: startOfMonth
            }
        });
    }

    private async getUser(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }
}

export default new UsageTracker();
