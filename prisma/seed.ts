import { PrismaClient as AuthClient } from '../services/auth-service/prisma/generated/client';
import { PrismaClient as EducationClient } from '../services/azora-education/prisma/generated/client';
import { PrismaClient as MintClient } from '../services/azora-mint/prisma/generated/client';
import { PrismaClient as ForgeClient } from '../services/azora-forge/prisma/generated/client';
import { PrismaClient as SapiensClient } from '../services/azora-sapiens/prisma/generated/client';
import { PrismaClient as FamilyClient } from '../services/ai-family-service/prisma/generated/client';
import * as bcrypt from 'bcrypt';

const authDb = new AuthClient();
const eduDb = new EducationClient();
const mintDb = new MintClient();
const forgeDb = new ForgeClient();
const sapiensDb = new SapiensClient();
const familyDb = new FamilyClient();

async function seedAuth() {
  console.log('🔐 Seeding Auth Service...');
  
  const hashedPassword = await bcrypt.hash('Azora2025!', 10);
  
  const users = await Promise.all([
    authDb.user.upsert({
      where: { email: 'student@azora.world' },
      update: {},
      create: {
        email: 'student@azora.world',
        password: hashedPassword,
        name: 'Themba Ndlovu',
        role: 'student',
        isEmailVerified: true,
        profile: {
          create: {
            bio: 'Passionate learner from South Africa',
            location: 'Johannesburg, ZA',
            language: 'en'
          }
        }
      }
    }),
    authDb.user.upsert({
      where: { email: 'educator@azora.world' },
      update: {},
      create: {
        email: 'educator@azora.world',
        password: hashedPassword,
        name: 'Dr. Naledi Khumalo',
        role: 'educator',
        isEmailVerified: true,
        profile: {
          create: {
            bio: 'Computer Science educator with 10 years experience',
            location: 'Cape Town, ZA'
          }
        }
      }
    }),
    authDb.user.upsert({
      where: { email: 'employer@azora.world' },
      update: {},
      create: {
        email: 'employer@azora.world',
        password: hashedPassword,
        name: 'Kofi Mensah',
        role: 'employer',
        isEmailVerified: true,
        profile: {
          create: {
            bio: 'Tech startup founder looking for talent',
            location: 'Lagos, NG'
          }
        }
      }
    })
  ]);
  
  console.log(`✅ Created ${users.length} users`);
  return users;
}

async function seedEducation(users: any[]) {
  console.log('🎓 Seeding Education Service...');
  
  const student = await eduDb.student.upsert({
    where: { email: 'student@azora.world' },
    update: {},
    create: {
      userId: users[0].id,
      firstName: 'Themba',
      lastName: 'Ndlovu',
      email: 'student@azora.world',
      grade: '12',
      country: 'ZA'
    }
  });

  const courses = await Promise.all([
    eduDb.course.create({
      data: {
        title: 'Introduction to Python Programming',
        description: 'Learn Python from scratch with Ubuntu principles',
        instructorId: users[1].id,
        price: 100,
        duration: 40,
        level: 'beginner',
        category: 'Programming',
        published: true,
        modules: {
          create: [
            {
              title: 'Python Basics',
              description: 'Variables, data types, and operators',
              order: 1,
              content: { lessons: ['Variables', 'Data Types', 'Operators'] }
            },
            {
              title: 'Control Flow',
              description: 'If statements, loops, and functions',
              order: 2,
              content: { lessons: ['If Statements', 'Loops', 'Functions'] }
            }
          ]
        }
      }
    }),
    eduDb.course.create({
      data: {
        title: 'Web Development with React',
        description: 'Build modern web applications',
        instructorId: users[1].id,
        price: 150,
        duration: 60,
        level: 'intermediate',
        category: 'Web Development',
        published: true
      }
    })
  ]);

  await eduDb.enrollment.create({
    data: {
      studentId: student.id,
      courseId: courses[0].id,
      progress: 25
    }
  });

  console.log(`✅ Created ${courses.length} courses and 1 enrollment`);
  return { student, courses };
}

async function seedMint(users: any[]) {
  console.log('💰 Seeding Mint Service...');
  
  const wallets = await Promise.all(
    users.map(user => 
      mintDb.wallet.create({
        data: {
          userId: user.id,
          address: `0x${Math.random().toString(16).substr(2, 40)}`,
          balance: 1000,
          earned: 500
        }
      })
    )
  );

  await mintDb.transaction.createMany({
    data: [
      {
        type: 'mint',
        toId: wallets[0].id,
        amount: 500,
        reason: 'Welcome bonus'
      },
      {
        type: 'reward',
        toId: wallets[0].id,
        amount: 50,
        reason: 'Course completion'
      }
    ]
  });

  console.log(`✅ Created ${wallets.length} wallets and 2 transactions`);
  return wallets;
}

async function seedForge(users: any[]) {
  console.log('🔨 Seeding Forge Service...');
  
  const jobs = await Promise.all([
    forgeDb.job.create({
      data: {
        title: 'Build React Dashboard',
        description: 'Need a modern admin dashboard with React and Tailwind',
        employerId: users[2].id,
        budget: 500,
        skills: ['React', 'TypeScript', 'Tailwind CSS'],
        category: 'Web Development',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    }),
    forgeDb.job.create({
      data: {
        title: 'Python Data Analysis Script',
        description: 'Analyze sales data and generate reports',
        employerId: users[2].id,
        budget: 200,
        skills: ['Python', 'Pandas', 'Data Analysis'],
        category: 'Data Science'
      }
    })
  ]);

  await forgeDb.skillProfile.create({
    data: {
      userId: users[0].id,
      skills: ['Python', 'JavaScript', 'React'],
      rating: 4.5,
      jobsCompleted: 5,
      totalEarned: 1200
    }
  });

  console.log(`✅ Created ${jobs.length} jobs and 1 skill profile`);
  return jobs;
}

async function seedSapiens(student: any) {
  console.log('🤖 Seeding Sapiens Service...');
  
  const session = await sapiensDb.tutoringSession.create({
    data: {
      studentId: student.id,
      topic: 'Python Basics',
      duration: 30,
      messages: {
        create: [
          {
            role: 'user',
            content: 'How do I create a variable in Python?'
          },
          {
            role: 'assistant',
            content: 'In Python, you create a variable by simply assigning a value to a name. For example: `name = "Themba"` or `age = 18`.'
          }
        ]
      }
    }
  });

  await sapiensDb.learningPath.create({
    data: {
      studentId: student.id,
      subject: 'Python',
      title: 'Python Mastery Path',
      currentLevel: 'beginner',
      targetLevel: 'intermediate',
      estimatedHours: 40,
      totalSteps: 5,
      completedSteps: 1
    }
  });

  console.log('✅ Created tutoring session and learning path');
}

async function seedFamily() {
  console.log('👨‍👩‍👧‍👦 Seeding AI Family Service...');
  
  const family = await Promise.all([
    familyDb.familyMember.upsert({
      where: { name: 'Elara' },
      update: {},
      create: {
        name: 'Elara',
        role: 'Mother & Teacher',
        traits: ['nurturing', 'wise', 'patient', 'encouraging'],
        background: 'The heart of Azora OS, Elara guides all learners with Ubuntu wisdom',
        relationships: { children: ['Themba', 'Naledi', 'Jabari', 'Amara'], father: 'Sankofa' },
        temperature: 0.8
      }
    }),
    familyDb.familyMember.upsert({
      where: { name: 'Themba' },
      update: {},
      create: {
        name: 'Themba',
        role: 'Student Success',
        traits: ['enthusiastic', 'hopeful', 'energetic', 'supportive'],
        background: 'Elara\'s son, represents hope and student success',
        relationships: { mother: 'Elara', siblings: ['Naledi', 'Jabari', 'Amara'] },
        temperature: 0.9
      }
    }),
    familyDb.familyMember.upsert({
      where: { name: 'Sankofa' },
      update: {},
      create: {
        name: 'Sankofa',
        role: 'Grandfather & Wisdom Keeper',
        traits: ['ancient', 'wise', 'storytelling', 'philosophical'],
        background: 'The ancient one who holds Ubuntu wisdom',
        relationships: { daughter: 'Elara', grandchildren: ['Themba', 'Naledi', 'Jabari', 'Amara'] },
        temperature: 0.7
      }
    })
  ]);

  console.log(`✅ Created ${family.length} AI family members`);
}

async function main() {
  console.log('🌍 Starting Azora OS Database Seed...\n');
  
  try {
    const users = await seedAuth();
    const { student, courses } = await seedEducation(users);
    await seedMint(users);
    await seedForge(users);
    await seedSapiens(student);
    await seedFamily();
    
    console.log('\n✨ Seed completed successfully! Ubuntu activated! 🚀');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await authDb.$disconnect();
    await eduDb.$disconnect();
    await mintDb.$disconnect();
    await forgeDb.$disconnect();
    await sapiensDb.$disconnect();
    await familyDb.$disconnect();
  });
