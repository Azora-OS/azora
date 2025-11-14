import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Azora LMS database...');

  const course = await prisma.course.create({
    data: {
      title: 'Python for Beginners',
      description: 'Learn Python from scratch',
      instructorId: 'instructor_001',
      category: 'Programming',
      level: 'beginner',
      price: 50,
      isPublished: true,
    },
  });

  const module1 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Introduction to Python',
      order: 1,
    },
  });

  await prisma.lesson.createMany({
    data: [
      {
        moduleId: module1.id,
        title: 'What is Python?',
        content: 'Python is a programming language...',
        type: 'video',
        duration: 600,
        order: 1,
      },
      {
        moduleId: module1.id,
        title: 'Installing Python',
        content: 'Download Python from...',
        type: 'text',
        order: 2,
      },
    ],
  });

  const enrollment = await prisma.enrollment.create({
    data: {
      courseId: course.id,
      studentId: 'user_themba_001',
      progress: 50,
    },
  });

  await prisma.review.create({
    data: {
      courseId: course.id,
      studentId: 'user_themba_001',
      rating: 5,
      comment: 'Great course!',
    },
  });

  console.log('✅ Seed data created successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
