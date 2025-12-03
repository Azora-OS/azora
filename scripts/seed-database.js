const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // 1. Seed Users
    const users = [
        {
            email: 'student@azora.com',
            name: 'Student User',
            role: 'STUDENT',
            password: 'hashed_password_123', // In real app, use bcrypt
        },
        {
            email: 'educator@azora.com',
            name: 'Educator User',
            role: 'EDUCATOR',
            password: 'hashed_password_123',
        },
        {
            email: 'admin@azora.com',
            name: 'Admin User',
            role: 'ADMIN',
            password: 'hashed_password_123',
        },
    ];

    for (const user of users) {
        const existingUser = await prisma.user.findUnique({ where: { email: user.email } });
        if (!existingUser) {
            await prisma.user.create({ data: user });
            console.log(`Created user: ${user.email}`);
        }
    }

    // 2. Seed Courses
    const instructor = await prisma.user.findUnique({ where: { email: 'educator@azora.com' } });
    if (instructor) {
        const courses = [
            {
                title: 'Introduction to Blockchain',
                description: 'Learn the basics of blockchain technology.',
                category: 'Technology',
                level: 'BEGINNER',
                price: 0,
                instructorId: instructor.id,
                modules: {
                    create: [
                        { title: 'Module 1: What is Blockchain?', content: 'Content for module 1', order: 1 },
                        { title: 'Module 2: How Bitcoin Works', content: 'Content for module 2', order: 2 },
                    ],
                },
            },
            {
                title: 'Advanced AI Agents',
                description: 'Build autonomous agents with LLMs.',
                category: 'AI',
                level: 'ADVANCED',
                price: 49.99,
                instructorId: instructor.id,
                modules: {
                    create: [
                        { title: 'Module 1: Agent Architecture', content: 'Content for module 1', order: 1 },
                    ],
                },
            },
        ];

        for (const course of courses) {
            const existingCourse = await prisma.course.findFirst({ where: { title: course.title } });
            if (!existingCourse) {
                await prisma.course.create({ data: course });
                console.log(`Created course: ${course.title}`);
            }
        }
    }

    // 3. Seed Wallets
    const allUsers = await prisma.user.findMany();
    for (const user of allUsers) {
        const existingWallet = await prisma.wallet.findUnique({
            where: { userId_currency: { userId: user.id, currency: 'AZR' } },
        });

        if (!existingWallet) {
            await prisma.wallet.create({
                data: {
                    userId: user.id,
                    currency: 'AZR',
                    balance: 1000.00,
                    address: `0x${user.id.replace(/-/g, '')}`, // Mock address
                },
            });
            console.log(`Created wallet for user: ${user.email}`);
        }
    }

    // 4. Seed Jobs
    const jobs = [
        {
            title: 'Senior Frontend Engineer',
            company: 'TechCorp',
            description: 'We are looking for a React expert.',
            location: 'Remote',
            status: 'ACTIVE',
        },
        {
            title: 'Blockchain Developer',
            company: 'CryptoStart',
            description: 'Build smart contracts.',
            location: 'New York, NY',
            status: 'ACTIVE',
        },
    ];

    for (const job of jobs) {
        const existingJob = await prisma.job.findFirst({ where: { title: job.title } });
        if (!existingJob) {
            await prisma.job.create({ data: job });
            console.log(`Created job: ${job.title}`);
        }
    }

    console.log('✅ Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
