const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@azora.world' },
    update: {},
    create: {
      email: 'admin@azora.world',
      passwordHash: adminPassword,
      name: 'Azora Admin',
      role: 'ADMIN',
      profile: {
        create: {
          bio: 'System Administrator',
          country: 'South Africa',
          city: 'Johannesburg'
        }
      },
      wallet: {
        create: {
          balance: 10000,
          currency: 'AZR'
        }
      }
    }
  });
  console.log('✅ Created admin user:', admin.email);

  // Create test student
  const studentPassword = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@azora.world' },
    update: {},
    create: {
      email: 'student@azora.world',
      passwordHash: studentPassword,
      name: 'Test Student',
      role: 'STUDENT',
      profile: {
        create: {
          bio: 'Eager to learn',
          country: 'South Africa',
          city: 'Cape Town'
        }
      },
      wallet: {
        create: {
          balance: 100,
          currency: 'AZR'
        }
      }
    }
  });
  console.log('✅ Created student user:', student.email);

  // Create test educator
  const educatorPassword = await bcrypt.hash('educator123', 10);
  const educator = await prisma.user.upsert({
    where: { email: 'educator@azora.world' },
    update: {},
    create: {
      email: 'educator@azora.world',
      passwordHash: educatorPassword,
      name: 'Test Educator',
      role: 'EDUCATOR',
      profile: {
        create: {
          bio: 'Passionate about teaching',
          country: 'Nigeria',
          city: 'Lagos'
        }
      },
      wallet: {
        create: {
          balance: 500,
          currency: 'AZR'
        }
      }
    }
  });
  console.log('✅ Created educator user:', educator.email);

  // Create test courses
  const course1 = await prisma.course.upsert({
    where: { id: 'course-1' },
    update: {},
    create: {
      id: 'course-1',
      title: 'Introduction to Python Programming',
      description: 'Learn Python from scratch with hands-on projects',
      instructorId: educator.id,
      duration: 20,
      price: 50,
      currency: 'AZR',
      difficulty: 'BEGINNER',
      isPublished: true,
      topics: ['Python', 'Programming', 'Basics'],
      lessons: {
        create: [
          {
            title: 'Getting Started with Python',
            content: 'Introduction to Python syntax and basic concepts',
            order: 1,
            duration: 30
          },
          {
            title: 'Variables and Data Types',
            content: 'Understanding Python data types and variables',
            order: 2,
            duration: 45
          },
          {
            title: 'Control Flow',
            content: 'If statements, loops, and control structures',
            order: 3,
            duration: 60
          }
        ]
      }
    }
  });
  console.log('✅ Created course:', course1.title);

  const course2 = await prisma.course.upsert({
    where: { id: 'course-2' },
    update: {},
    create: {
      id: 'course-2',
      title: 'Web Development Fundamentals',
      description: 'Build modern websites with HTML, CSS, and JavaScript',
      instructorId: educator.id,
      duration: 30,
      price: 75,
      currency: 'AZR',
      difficulty: 'BEGINNER',
      isPublished: true,
      topics: ['HTML', 'CSS', 'JavaScript', 'Web Development'],
      lessons: {
        create: [
          {
            title: 'HTML Basics',
            content: 'Structure your web pages with HTML',
            order: 1,
            duration: 40
          },
          {
            title: 'Styling with CSS',
            content: 'Make your websites beautiful with CSS',
            order: 2,
            duration: 50
          }
        ]
      }
    }
  });
  console.log('✅ Created course:', course2.title);

  // Enroll student in course
  const enrollment = await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: student.id,
        courseId: course1.id
      }
    },
    update: {},
    create: {
      userId: student.id,
      courseId: course1.id,
      status: 'ACTIVE'
    }
  });
  console.log('✅ Enrolled student in course');

  // Add some transactions
  await prisma.transaction.create({
    data: {
      userId: student.id,
      amount: 100,
      currency: 'AZR',
      type: 'CREDIT',
      status: 'COMPLETED',
      description: 'Welcome bonus'
    }
  });
  console.log('✅ Created welcome transaction');

  console.log('\n🎉 Seeding completed successfully!\n');
  console.log('📧 Test Users:');
  console.log('   Admin:    admin@azora.world / admin123');
  console.log('   Student:  student@azora.world / student123');
  console.log('   Educator: educator@azora.world / educator123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
