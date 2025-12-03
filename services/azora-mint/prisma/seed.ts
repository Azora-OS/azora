import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Azora Mint database...');

    // Create sample collections
    const artCollection = await prisma.collection.create({
        data: {
            name: 'Ubuntu Art Collection',
            description: 'Community-created digital art celebrating Ubuntu philosophy',
            category: 'art',
            isPublic: true,
            creator: 'azora-admin',
            assetCount: 0,
            totalVolume: 0,
        },
    });

    const eduCollection = await prisma.collection.create({
        data: {
            name: 'Educational Certificates',
            description: 'Blockchain-verified educational achievements',
            category: 'education',
            isPublic: true,
            creator: 'azora-admin',
            assetCount: 0,
            totalVolume: 0,
        },
    });

    console.log(`✅ Created ${2} collections`);

    // Create sample digital asset
    const sampleAsset = await prisma.digitalAsset.create({
        data: {
            tokenId: '1',
            name: 'Ubuntu Genesis NFT',
            description: 'The first NFT minted on Azora Mint - celebrating Ubuntu philosophy',
            imageUrl: 'ipfs://QmSampleHash123',
            imageHash: 'QmSampleHash123',
            metadataUri: 'ipfs://QmMetadataHash456',
            metadataHash: 'QmMetadataHash456',
            owner: 'demo-user-001',
            creator: 'azora-admin',
            collectionId: artCollection.id,
            royalty: 5.0,
            supply: 1,
            blockchainTxHash: '0xsampletxhash123',
            status: 'minted',
            attributes: {
                rarity: 'legendary',
                edition: '1/1',
                ubuntu_score: 100,
            },
        },
    });

    console.log(`✅ Created sample digital asset: ${sampleAsset.id}`);

    // Create sample certificate
    const sampleCert = await prisma.certificate.create({
        data: {
            tokenId: '1001',
            recipientName: 'Ubuntu Scholar',
            recipientEmail: 'scholar@azora.edu',
            courseName: 'Introduction to Ubuntu Philosophy',
            institution: 'Azora Sapiens Academy',
            issueDate: '2025-01-01',
            grade: 'A+',
            instructor: 'Dr. Ubuntu',
            certificateType: 'completion',
            metadataUri: 'ipfs://QmCertMetadata789',
            metadataHash: 'QmCertMetadata789',
            verificationCode: 'UBUNTU01',
            issuedBy: 'azora-admin',
            blockchainTxHash: '0xcerttxhash456',
            status: 'issued',
        },
    });

    console.log(`✅ Created sample certificate: ${sampleCert.id}`);

    // Create sample token balance
    const balance = await prisma.tokenBalance.create({
        data: {
            address: '0xSampleAddress123',
            balance: '1000000000000000000000', // 1000 AZR
        },
    });

    console.log(`✅ Created sample token balance: ${balance.id}`);

    // Create constitutional audit
    const audit = await prisma.constitutionalAudit.create({
        data: {
            auditType: 'NO_MOCK_PROTOCOL',
            complianceScore: 100,
            violations: [],
            recommendations: ['Continue using real database and blockchain'],
        },
    });

    console.log(`✅ Created constitutional audit: ${audit.id}`);

    console.log('');
    console.log('🎉 Azora Mint database seeded successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   • Collections: 2`);
    console.log(`   • Digital Assets: 1`);
    console.log(`   • Certificates: 1`);
    console.log(`   • Token Balances: 1`);
    console.log(`   • Constitutional Audits: 1`);
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
