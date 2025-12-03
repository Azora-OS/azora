import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding KYC/AML Service database...');

    // Create sample KYC verifications
    const verification1 = await prisma.kYCVerification.create({
        data: {
            userId: 'user_001',
            documentType: 'passport',
            documentData: {
                number: 'P123456789',
                country: 'ZA',
                expiryDate: '2030-12-31',
            },
            status: 'APPROVED',
            riskLevel: 'LOW',
            reviewedBy: 'admin_001',
            reviewNotes: 'All documents verified successfully',
            reviewedAt: new Date(),
        },
    });

    const verification2 = await prisma.kYCVerification.create({
        data: {
            userId: 'user_002',
            documentType: 'drivers_license',
            documentData: {
                number: 'DL987654321',
                state: 'GP',
                expiryDate: '2028-06-30',
            },
            status: 'PENDING',
            riskLevel: 'LOW',
        },
    });

    // Create sample risk assessments
    const riskAssessment1 = await prisma.riskAssessment.create({
        data: {
            userId: 'user_001',
            assessmentType: 'AML',
            riskScore: 15,
            riskLevel: 'LOW',
            factors: {
                transactionVolume: 'normal',
                geographicRisk: 'low',
                industryRisk: 'low',
            },
            recommendations: 'Standard monitoring',
            assessedBy: 'system',
        },
    });

    const riskAssessment2 = await prisma.riskAssessment.create({
        data: {
            userId: 'user_002',
            assessmentType: 'FRAUD',
            riskScore: 25,
            riskLevel: 'LOW',
            factors: {
                accountAge: 'new',
                behaviorPattern: 'normal',
                deviceTrust: 'high',
            },
            recommendations: 'Continue monitoring',
            assessedBy: 'system',
        },
    });

    // Create sample compliance audits
    await prisma.complianceAudit.create({
        data: {
            userId: 'user_001',
            action: 'VERIFICATION_SUBMITTED',
            details: {
                documentType: 'passport',
                submissionMethod: 'web',
            },
            performedBy: 'user_001',
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0',
        },
    });

    await prisma.complianceAudit.create({
        data: {
            userId: 'user_001',
            action: 'VERIFICATION_APPROVED',
            details: {
                verificationId: verification1.id,
                reviewedBy: 'admin_001',
            },
            performedBy: 'admin_001',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0',
        },
    });

    await prisma.complianceAudit.create({
        data: {
            userId: 'user_001',
            action: 'RISK_ASSESSED',
            details: {
                assessmentType: 'AML',
                riskLevel: 'LOW',
                riskScore: 15,
            },
            performedBy: 'system',
        },
    });

    console.log('✅ KYC/AML Service database seeded successfully!');
    console.log(`   - Created ${2} KYC verifications`);
    console.log(`   - Created ${2} risk assessments`);
    console.log(`   - Created ${3} compliance audit entries`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
