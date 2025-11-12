const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding production database...');

  // Admin user
  const adminHash = await bcrypt.hash('Admin@2024!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@azora.world' },
    update: {},
    create: {
      email: 'admin@azora.world',
      password: adminHash,
      name: 'Azora Admin',
      role: 'ADMIN',
      profile: {
        create: {
          bio: 'System Administrator',
          location: 'Johannesburg, South Africa',
        },
      },
    },
  });
  console.log('✅ Admin user created');

  // Educator
  const educatorHash = await bcrypt.hash('Educator@2024!', 12);
  const educator = await prisma.user.upsert({
    where: { email: 'educator@azora.world' },
    update: {},
    create: {
      email: 'educator@azora.world',
      password: educatorHash,
      name: 'Dr. Sarah Johnson',
      role: 'EDUCATOR',
      profile: {
        create: {
          bio: 'Software Engineering Professor',
          location: 'Lagos, Nigeria',
        },
      },
    },
  });
  console.log('✅ Educator created');

  // Student
  const studentHash = await bcrypt.hash('Student@2024!', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@azora.world' },
    update: {},
    create: {
      email: 'student@azora.world',
      password: studentHash,
      name: 'John Doe',
      role: 'STUDENT',
      profile: {
        create: {
          bio: 'Aspiring software developer',
          location: 'Cape Town, South Africa',
        },
      },
    },
  });
  console.log('✅ Student created');

  // Courses
  const pythonCourse = await prisma.course.upsert({
    where: { id: 'python-basics-101' },
    update: {},
    create: {
      id: 'python-basics-101',
      title: 'Python Programming Basics',
      description: 'Learn Python from scratch with hands-on projects',
      instructor: educator.id,
      duration: 20,
      price: 99,
      status: 'PUBLISHED',
      modules: {
        create: [
          {
            title: 'Introduction to Python',
            content: 'Python basics, syntax, and setup',
            order: 1,
          },
          {
            title: 'Variables and Data Types',
            content: 'Understanding Python data types',
            order: 2,
          },
          {
            title: 'Control Flow',
            content: 'If statements, loops, and functions',
            order: 3,
          },
        ],
      },
    },
  });
  console.log('✅ Python course created');

  const webCourse = await prisma.course.upsert({
    where: { id: 'web-dev-101' },
    update: {},
    create: {
      id: 'web-dev-101',
      title: 'Web Development Fundamentals',
      description: 'HTML, CSS, JavaScript and modern web development',
      instructor: educator.id,
      duration: 30,
      price: 149,
      status: 'PUBLISHED',
      modules: {
        create: [
          {
            title: 'HTML Basics',
            content: 'Structure your web pages',
            order: 1,
          },
          {
            title: 'CSS Styling',
            content: 'Make your websites beautiful',
            order: 2,
          },
          {
            title: 'JavaScript Fundamentals',
            content: 'Add interactivity to your sites',
            order: 3,
          },
        ],
      },
    },
  });
  console.log('✅ Web dev course created');

  // Sample enrollment
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: student.id,
        courseId: pythonCourse.id,
      },
    },
    update: {},
    create: {
      userId: student.id,
      courseId: pythonCourse.id,
      status: 'ACTIVE',
      progress: 30,
    },
  });
  console.log('✅ Sample enrollment created');

  // Sample payments
  await prisma.payment.create({
    data: {
      userId: student.id,
      amount: 100,
      currency: 'AZR',
      type: 'DONATION',
      status: 'COMPLETED',
      description: 'Welcome bonus',
      transactionId: 'init_welcome_bonus',
      processedAt: new Date(),
    },
  });
  console.log('✅ Welcome bonus created');

  console.log('\n🎉 Seeding complete!\n');
  console.log('📧 Test Users:');
  console.log('   Admin:    admin@azora.world / Admin@2024!');
  console.log('   Educator: educator@azora.world / Educator@2024!');
  console.log('   Student:  student@azora.world / Student@2024!\n');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    prisma.$disconnect();
    process.exit(1);
  });
