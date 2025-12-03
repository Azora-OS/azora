import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export enum CredentialType {
    MICRO_CREDENTIAL = 'micro_credential',
    CERTIFICATE = 'certificate',
    DIPLOMA = 'diploma',
    PROFESSIONAL_QUALIFICATION = 'professional_qualification'
}

export interface CreditRecord {
    userId: string;
    type: 'learning' | 'building';
    credits: number;
    source: string;
    sourceId: string;
    earnedAt: Date;
}

export class CreditTracker {
    /**
     * Track learning credits from courses
     */
    async trackLearningCredit(
        userId: string,
        courseId: string,
        credits: number,
        activityType: 'video' | 'quiz' | 'assignment' | 'project'
    ): Promise<void> {
        await prisma.learningCredit.create({
            data: {
                userId,
                courseId,
                credits,
                activityType,
                earnedAt: new Date()
            }
        });

        console.log(`✅ Tracked ${credits} LC for user ${userId} from ${activityType}`);
    }

    /**
     * Track building credits from projects
     */
    async trackBuildingCredit(
        userId: string,
        projectId: string,
        hours: number,
        activityType: 'coding' | 'commit' | 'pr' | 'deployment'
    ): Promise<void> {
        // Calculate credits based on activity
        let credits = 0;
        switch (activityType) {
            case 'coding':
                credits = hours; // 1 hour = 1 BC
                break;
            case 'commit':
                credits = 0.1;
                break;
            case 'pr':
                credits = 1;
                break;
            case 'deployment':
                credits = 10;
                break;
        }

        await prisma.buildingCredit.create({
            data: {
                userId,
                projectId,
                hours,
                credits,
                activityType,
                earnedAt: new Date()
            }
        });

        console.log(`✅ Tracked ${credits} BC for user ${userId} from ${activityType}`);
    }

    /**
     * Get total credits for a user
     */
    async getTotalCredits(userId: string): Promise<{
        learningCredits: number;
        buildingCredits: number;
        totalHours: number;
    }> {
        const [learningSum, buildingSum] = await Promise.all([
            prisma.learningCredit.aggregate({
                where: { userId },
                _sum: { credits: true }
            }),
            prisma.buildingCredit.aggregate({
                where: { userId },
                _sum: { credits: true, hours: true }
            })
        ]);

        return {
            learningCredits: learningSum._sum.credits || 0,
            buildingCredits: buildingSum._sum.credits || 0,
            totalHours: buildingSum._sum.hours || 0
        };
    }

    /**
     * Check if user qualifies for a credential
     */
    async checkCredentialEligibility(
        userId: string,
        credentialType: CredentialType
    ): Promise<{
        eligible: boolean;
        currentLC: number;
        currentBC: number;
        requiredLC: number;
        requiredBC: number;
    }> {
        const credits = await this.getTotalCredits(userId);

        // Define requirements
        const requirements = {
            [CredentialType.MICRO_CREDENTIAL]: { LC: 15, BC: 7 },
            [CredentialType.CERTIFICATE]: { LC: 75, BC: 40 },
            [CredentialType.DIPLOMA]: { LC: 300, BC: 225 },
            [CredentialType.PROFESSIONAL_QUALIFICATION]: { LC: 750, BC: 750 }
        };

        const required = requirements[credentialType];

        return {
            eligible: credits.learningCredits >= required.LC && credits.buildingCredits >= required.BC,
            currentLC: credits.learningCredits,
            currentBC: credits.buildingCredits,
            requiredLC: required.LC,
            requiredBC: required.BC
        };
    }
}

export default new CreditTracker();
