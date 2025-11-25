#!/usr/bin/env node
/**
 * AZORA UNIVERSAL DATABASE SEEDER
 * 
 * Generates realistic seed data for all Azora services
 * 
 * Usage:
 *   npm run seed              # Seed all services
 *   npm run seed -- --service auth  # Seed specific service
 *   npm run seed -- --clean   # Clean and reseed
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// ============================================
// SEED DATA GENERATORS
// ============================================

/**
 * Generate realistic South African names
 */
const FIRST_NAMES = [
    'Themba', 'Naledi', 'Sipho', 'Zanele', 'Thabo', 'Nomsa',
    'Mandla', 'Precious', 'Bongani', 'Lindiwe', 'Sizwe', 'Nkosi'
];

const LAST_NAMES = [
    'Ndlovu', 'Khumalo', 'Dlamini', 'Nkosi', 'Mthembu', 'Zulu',
    'Mokoena', 'Molefe', 'Sithole', 'Mahlangu', 'Ngwenya', 'Buthelezi'
];

const CITIES = [
    'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth',
    'Bloemfontein', 'Nelspruit', 'Polokwane', 'Kimberley', 'East London'
];

function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEmail(firstName, lastName, domain = 'azora.world') {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
}

// ============================================
// SEED FUNCTIONS
// ============================================

async function seedUsers() {
    console.log('👥 Seeding Users...');

    const hashedPassword = await bcrypt.hash('Azora2025!', 10);

    const users = [];

    // Admin user
    users.push(await prisma.user.upsert({
        where: { email: 'admin@azora.world' },
        update: {},
        create: {
            email: 'admin@azora.world',
            name: 'Sizwe Ngwenya',
            password: hashedPassword,
            role: 'ADMIN',
            profile: {
                create: {
                    bio: 'Founding Architect of Azora OS',
                    location: 'Johannesburg, ZA',
                    timezone: 'Africa/Johannesburg',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sizwe'
                }
            }
        }
    }));

    // Generate 20 students
    for (let i = 0; i < 20; i++) {
        const firstName = randomItem(FIRST_NAMES);
        const lastName = randomItem(LAST_NAMES);
        const email = generateEmail(firstName, lastName);

        try {
            const user = await prisma.user.create({
                data: {
                    email,
                    name: `${firstName} ${lastName}`,
                    password: hashedPassword,
                    role: 'STUDENT',
                    profile: {
                        create: {
                            bio: `Passionate learner from South Africa`,
                            location: `${randomItem(CITIES)}, ZA`,
                            timezone: 'Africa/Johannesburg',
                            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}`
                        }
                    }
                }
            });
            users.push(user);
        } catch (e) {
            // Skip if user already exists
        }
    }

    // Generate 5 educators
    for (let i = 0; i < 5; i++) {
        const firstName = randomItem(FIRST_NAMES);
        const lastName = randomItem(LAST_NAMES);
        const email = generateEmail(firstName, lastName, 'educator.azora.world');

        try {
            const user = await prisma.user.create({
                data: {
                    email,
                    name: `Dr. ${firstName} ${lastName}`,
                    password: hashedPassword,
                    role: 'EDUCATOR',
                    profile: {
                        create: {
                            bio: `Experienced educator specializing in ${randomItem(['Mathematics', 'Science', 'Technology', 'Business', 'Languages'])}`,
                            location: `${randomItem(CITIES)}, ZA`,
                            timezone: 'Africa/Johannesburg',
                            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Dr${firstName}`
                        }
                    }
                }
            });
            users.push(user);
        } catch (e) {
            // Skip if user already exists
        }
    }

    console.log(`✅ Created ${users.length} users`);
    return users;
}

async function seedCourses(educators) {
    console.log('📚 Seeding Courses...');

    const courseData = [
        {
            title: 'Introduction to Python Programming',
            description: 'Learn Python from scratch with hands-on projects and Ubuntu principles',
            category: 'Programming',
            level: 'BEGINNER',
            duration: 2400, // 40 hours in minutes
            price: 499.00,
            status: 'PUBLISHED'
        },
        {
            title: 'Web Development with React',
            description: 'Build modern web applications with React, Next.js, and Tailwind CSS',
            category: 'Web Development',
            level: 'INTERMEDIATE',
            duration: 3600,
            price: 799.00,
            status: 'PUBLISHED'
        },
        {
            title: 'Data Science with Python',
            description: 'Master data analysis, visualization, and machine learning',
            category: 'Data Science',
            level: 'INTERMEDIATE',
            duration: 4800,
            price: 999.00,
            status: 'PUBLISHED'
        },
        {
            title: 'Mobile App Development',
            description: 'Build cross-platform mobile apps with React Native',
            category: 'Mobile Development',
            level: 'INTERMEDIATE',
            duration: 3000,
            price: 899.00,
            status: 'PUBLISHED'
        },
        {
            title: 'Blockchain Fundamentals',
            description: 'Understand blockchain technology and build your first DApp',
            category: 'Blockchain',
            level: 'ADVANCED',
            duration: 3600,
            price: 1299.00,
            status: 'PUBLISHED'
        },
        {
            title: 'Business Strategy & Entrepreneurship',
            description: 'Learn to build and scale a successful startup',
            category: 'Business',
            level: 'INTERMEDIATE',
            duration: 2400,
            price: 699.00,
            status: 'PUBLISHED'
        },
        {
            title: 'Digital Marketing Mastery',
            description: 'Master SEO, social media, and content marketing',
            category: 'Marketing',
            level: 'BEGINNER',
            duration: 1800,
            price: 599.00,
            status: 'PUBLISHED'
        },
        {
            title: 'AI & Machine Learning',
            description: 'Build intelligent systems with TensorFlow and PyTorch',
            category: 'Artificial Intelligence',
            level: 'ADVANCED',
            duration: 6000,
            price: 1499.00,
            status: 'PUBLISHED'
        }
    ];

    const courses = [];

    for (const data of courseData) {
        const instructor = randomItem(educators);

        const course = await prisma.course.create({
            data: {
                ...data,
                instructorId: instructor.id,
                thumbnail: `https://picsum.photos/seed/${data.title}/800/600`,
                rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
                enrollmentCount: randomInt(50, 500),
                modules: {
                    create: [
                        {
                            title: 'Getting Started',
                            content: 'Introduction and setup',
                            order: 1
                        },
                        {
                            title: 'Core Concepts',
                            content: 'Fundamental principles and theory',
                            order: 2
                        },
                        {
                            title: 'Practical Projects',
                            content: 'Hands-on projects and exercises',
                            order: 3
                        },
                        {
                            title: 'Advanced Topics',
                            content: 'Deep dive into advanced concepts',
                            order: 4
                        }
                    ]
                }
            }
        });

        courses.push(course);
    }

    console.log(`✅ Created ${courses.length} courses`);
    return courses;
}

async function seedEnrollments(students, courses) {
    console.log('📝 Seeding Enrollments...');

    let enrollmentCount = 0;

    // Each student enrolls in 1-3 random courses
    for (const student of students) {
        const numCourses = randomInt(1, 3);
        const selectedCourses = [];

        for (let i = 0; i < numCourses; i++) {
            const course = randomItem(courses);

            // Avoid duplicate enrollments
            if (selectedCourses.includes(course.id)) continue;
            selectedCourses.push(course.id);

            try {
                await prisma.enrollment.create({
                    data: {
                        userId: student.id,
                        studentId: student.id,
                        courseId: course.id,
                        status: randomItem(['ACTIVE', 'ACTIVE', 'ACTIVE', 'COMPLETED']), // 75% active
                        progress: randomInt(0, 100)
                    }
                });
                enrollmentCount++;
            } catch (e) {
                // Skip if enrollment already exists
            }
        }
    }

    console.log(`✅ Created ${enrollmentCount} enrollments`);
}

async function seedWallets(users) {
    console.log('💰 Seeding Wallets...');

    const wallets = [];

    for (const user of users) {
        // Create AZR wallet
        const wallet = await prisma.wallet.create({
            data: {
                userId: user.id,
                currency: 'AZR',
                balance: randomInt(100, 10000),
                address: `0x${Math.random().toString(16).substr(2, 40)}`
            }
        });

        wallets.push(wallet);

        // Create some transactions
        const numTransactions = randomInt(2, 5);
        for (let i = 0; i < numTransactions; i++) {
            await prisma.transaction.create({
                data: {
                    walletId: wallet.id,
                    type: randomItem(['MINING_REWARD', 'DEPOSIT', 'TRANSFER']),
                    amount: randomInt(10, 500),
                    currency: 'AZR',
                    status: 'COMPLETED',
                    description: randomItem([
                        'Course completion reward',
                        'Daily login bonus',
                        'Assessment passed',
                        'Peer teaching reward'
                    ])
                }
            });
        }
    }

    console.log(`✅ Created ${wallets.length} wallets`);
    return wallets;
}

async function seedJobs() {
    console.log('💼 Seeding Jobs...');

    const jobData = [
        {
            title: 'Full Stack Developer',
            description: 'Build scalable web applications with React and Node.js',
            company: 'TechCo ZA',
            location: 'Johannesburg, ZA',
            remote: true,
            salary: 45000,
            currency: 'ZAR',
            status: 'ACTIVE'
        },
        {
            title: 'Data Scientist',
            description: 'Analyze data and build ML models',
            company: 'DataHub Africa',
            location: 'Cape Town, ZA',
            remote: false,
            salary: 55000,
            currency: 'ZAR',
            status: 'ACTIVE'
        },
        {
            title: 'Mobile App Developer',
            description: 'Create beautiful mobile experiences',
            company: 'AppWorks',
            location: 'Durban, ZA',
            remote: true,
            salary: 40000,
            currency: 'ZAR',
            status: 'ACTIVE'
        },
        {
            title: 'DevOps Engineer',
            description: 'Manage cloud infrastructure and CI/CD',
            company: 'CloudFirst',
            location: 'Pretoria, ZA',
            remote: true,
            salary: 50000,
            currency: 'ZAR',
            status: 'ACTIVE'
        }
    ];

    const jobs = [];

    for (const data of jobData) {
        const job = await prisma.job.create({
            data
        });
        jobs.push(job);
    }

    console.log(`✅ Created ${jobs.length} jobs`);
    return jobs;
}

async function seedSkills() {
    console.log('🎯 Seeding Skills...');

    const skillData = [
        { name: 'JavaScript', category: 'Programming' },
        { name: 'Python', category: 'Programming' },
        { name: 'React', category: 'Frontend' },
        { name: 'Node.js', category: 'Backend' },
        { name: 'TypeScript', category: 'Programming' },
        { name: 'SQL', category: 'Database' },
        { name: 'MongoDB', category: 'Database' },
        { name: 'AWS', category: 'Cloud' },
        { name: 'Docker', category: 'DevOps' },
        { name: 'Git', category: 'Tools' }
    ];

    const skills = [];

    for (const data of skillData) {
        const skill = await prisma.skill.create({
            data
        });
        skills.push(skill);
    }

    console.log(`✅ Created ${skills.length} skills`);
    return skills;
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function main() {
    console.log('🌍 Starting Azora Universal Database Seed...\n');

    try {
        // Seed in order (respecting foreign key constraints)
        const users = await seedUsers();

        const students = users.filter(u => u.role === 'STUDENT');
        const educators = users.filter(u => u.role === 'EDUCATOR');

        const courses = await seedCourses(educators);
        await seedEnrollments(students, courses);
        await seedWallets(users);
        await seedJobs();
        await seedSkills();

        console.log('\n✨ Universal seed completed successfully!');
        console.log('🚀 Azora OS is ready for launch!\n');

        // Print summary
        console.log('📊 Seed Summary:');
        console.log(`   Users: ${users.length}`);
        console.log(`   Courses: ${courses.length}`);
        console.log(`   Jobs: 4`);
        console.log(`   Skills: 10`);
        console.log('\n🔐 Test Credentials:');
        console.log('   Email: admin@azora.world');
        console.log('   Password: Azora2025!');

    } catch (error) {
        console.error('❌ Seed failed:', error);
        throw error;
    }
}

// Run seed
main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
