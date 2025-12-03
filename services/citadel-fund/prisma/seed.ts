import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding CitadelFund database...');

    // Create initial balance
    const balance = await prisma.citadelBalance.create({
        data: {
            totalBalance: 0,
            totalDistributed: 0,
            totalScholarships: 0,
        },
    });

    console.log('✅ Created initial CitadelBalance:', balance.id);

    // Create sample revenue distributions
    const distributions = await Promise.all([
        prisma.revenueDistribution.create({
            data: {
                sourceService: 'azora-pay',
                sourceReference: 'payment-001',
                amount: 1000,
                percentage: 10,
                metadata: {
                    description: 'Course enrollment payment',
                },
            },
        }),
        prisma.revenueDistribution.create({
            data: {
                sourceService: 'azora-mint',
                sourceReference: 'nft-sale-001',
                amount: 500,
                percentage: 10,
                metadata: {
                    description: 'NFT certificate sale',
                },
            },
        }),
    ]);

    console.log(`✅ Created ${distributions.length} revenue distributions`);

    // Create sample scholarships
    const scholarships = await Promise.all([
        prisma.scholarship.create({
            data: {
                studentId: 'student-001',
                studentName: 'Ubuntu Scholar 1',
                studentEmail: 'scholar1@azora.edu',
                amount: 500,
                reason: 'Academic Excellence',
                status: 'APPROVED',
            },
        }),
        prisma.scholarship.create({
            data: {
                studentId: 'student-002',
                studentName: 'Ubuntu Scholar 2',
                studentEmail: 'scholar2@azora.edu',
                amount: 750,
                reason: 'Financial Need & Ubuntu Contribution',
                status: 'PENDING',
            },
        }),
    ]);

    console.log(`✅ Created ${scholarships.length} scholarships`);

    // Create community impact metrics
    const impact = await prisma.communityImpact.create({
        data: {
            period: '2025-Q1',
            studentsSupported: 2,
            totalDisbursed: 500,
            averageScholarship: 250,
            ubuntuScore: 85,
            collectiveImpact: 92,
        },
    });

    console.log('✅ Created community impact metrics:', impact.id);

    // Create constitutional audit
    const audit = await prisma.constitutionalAudit.create({
        data: {
            auditType: 'NO_MOCK_PROTOCOL',
            complianceScore: 100,
            violations: [],
            recommendations: ['Continue using real database'],
        },
    });

    console.log('✅ Created constitutional audit:', audit.id);

    console.log('');
    console.log('🎉 CitadelFund database seeded successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   • Balance: ${balance.id}`);
    console.log(`   • Revenue Distributions: ${distributions.length}`);
    console.log(`   • Scholarships: ${scholarships.length}`);
    console.log(`   • Community Impact: ${impact.id}`);
    console.log(`   • Constitutional Audit: ${audit.id}`);
    console.log('');
    console.log('"Ngiyakwazi ngoba sikwazi" - "I can because we can"');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
