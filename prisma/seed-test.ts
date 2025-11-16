import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('🌱 Seeding test data...\n');

  try {
    // Create test users
    console.log('👥 Creating test users...');
    const users: any[] = [];
    
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await prisma.user.create({
        data: {
          ...user,
          password: hashedPassword,
        },
      });
    }
    console.log(`  ✅ Created ${users.length} test users\n`);

    // Create test courses
    console.log('📚 Creating test courses...');
    const courses: any[] = [];
    
    for (const course of courses) {
      await prisma.course.create({
        data: course,
      });
    }
    console.log(`  ✅ Created ${courses.length} test courses\n`);

    // Create test enrollments
    console.log('📝 Creating test enrollments...');
    const students = users.filter((u: any) => u.role === 'student').slice(0, 10);
    const testCourses = courses.slice(0, 5);
    
    let enrollmentCount = 0;
    for (const student of students) {
      for (const course of testCourses) {
        await prisma.enrollment.create({
          data: {
            studentId: student.id!,
            courseId: course.id!,
            status: 'active',
            enrolledAt: new Date(),
          },
        });
        enrollmentCount++;
      }
    }
    console.log(`  ✅ Created ${enrollmentCount} test enrollments\n`);

    // Create test wallets
    console.log('💰 Creating test wallets...');
    for (const user of users) {
      await prisma.wallet.create({
        data: {
          userId: user.id!,
          balance: Math.random() * 1000,
          currency: 'AZR',
        },
      });
    }
    console.log(`  ✅ Created ${users.length} test wallets\n`);

    console.log('✅ Test data seeding complete!\n');
    console.log('Summary:');
    console.log(`  - Users: ${users.length}`);
    console.log(`  - Courses: ${courses.length}`);
    console.log(`  - Enrollments: ${enrollmentCount}`);
    console.log(`  - Wallets: ${users.length}`);

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData();
