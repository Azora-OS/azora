import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample courses
  const courses = [
    {
      title: 'Happy Birthday Mom! 🎂',
      description: 'A special course dedicated to the best mom in the world! Celebrating your special day with love and gratitude. ❤️',
      instructorId: 'your-favorite-child',
      price: 0.00,
      currency: 'USD',
      duration: 100,
      level: 'All Levels',
      category: 'Celebration',
      published: true,
    },
    {
      title: 'Introduction to Python Programming',
      description: 'Learn Python from scratch. Master variables, functions, loops, and object-oriented programming. Perfect for beginners with no coding experience.',
      instructorId: 'instructor-1',
      price: 49.99,
      currency: 'USD',
      duration: 40,
      level: 'Beginner',
      category: 'Programming',
      published: true,
    },
    {
      title: 'Full-Stack Web Development Bootcamp',
      description: 'Build modern web applications with React, Node.js, Express, and PostgreSQL. Includes authentication, APIs, and deployment.',
      instructorId: 'instructor-1',
      price: 99.99,
      currency: 'USD',
      duration: 80,
      level: 'Intermediate',
      category: 'Web Development',
      published: true,
    },
    {
      title: 'Data Science with Python',
      description: 'Master data analysis, visualization with Pandas, NumPy, and Matplotlib. Introduction to machine learning with scikit-learn.',
      instructorId: 'instructor-2',
      price: 79.99,
      currency: 'USD',
      duration: 60,
      level: 'Intermediate',
      category: 'Data Science',
      published: true,
    },
    {
      title: 'Advanced React Patterns & Performance',
      description: 'Deep dive into React hooks, context API, custom hooks, performance optimization, and advanced patterns for scalable applications.',
      instructorId: 'instructor-2',
      price: 59.99,
      currency: 'USD',
      duration: 35,
      level: 'Advanced',
      category: 'Web Development',
      published: true,
    },
    {
      title: 'UI/UX Design Fundamentals',
      description: 'Learn design principles, color theory, typography, and user research. Create beautiful interfaces with Figma.',
      instructorId: 'instructor-3',
      price: 69.99,
      currency: 'USD',
      duration: 45,
      level: 'Beginner',
      category: 'Design',
      published: true,
    },
    {
      title: 'Machine Learning A-Z',
      description: 'Complete machine learning course covering supervised and unsupervised learning, neural networks, and deep learning basics.',
      instructorId: 'instructor-3',
      price: 89.99,
      currency: 'USD',
      duration: 70,
      level: 'Advanced',
      category: 'Data Science',
      published: true,
    },
    {
      title: 'JavaScript Mastery',
      description: 'From basics to advanced: ES6+, async/await, promises, closures, prototypes, and modern JavaScript development.',
      instructorId: 'instructor-1',
      price: 54.99,
      currency: 'USD',
      duration: 50,
      level: 'Intermediate',
      category: 'Programming',
      published: true,
    },
    {
      title: 'Mobile App Development with React Native',
      description: 'Build iOS and Android apps with React Native. Learn navigation, state management, and native modules.',
      instructorId: 'instructor-2',
      price: 74.99,
      currency: 'USD',
      duration: 55,
      level: 'Intermediate',
      category: 'Mobile Development',
      published: true,
    },
    {
      title: 'DevOps & Cloud Computing',
      description: 'Master Docker, Kubernetes, CI/CD pipelines, AWS, and cloud deployment strategies for modern applications.',
      instructorId: 'instructor-3',
      price: 94.99,
      currency: 'USD',
      duration: 65,
      level: 'Advanced',
      category: 'DevOps',
      published: true,
    },
    {
      title: 'Cybersecurity Essentials',
      description: 'Learn security fundamentals, ethical hacking, network security, cryptography, and how to protect applications.',
      instructorId: 'instructor-1',
      price: 84.99,
      currency: 'USD',
      duration: 60,
      level: 'Intermediate',
      category: 'Security',
      published: true,
    },
  ];

  console.log('📚 Creating courses...');

  for (const courseData of courses) {
    const course = await prisma.course.create({
      data: {
        ...courseData,
        modules: {
          create: [
            {
              title: 'Introduction & Setup',
              description: 'Get started with the course and set up your development environment',
              order: 1,
              content: JSON.stringify({
                lessons: [
                  { title: 'Welcome to the course', duration: 5, type: 'video' },
                  { title: 'Setting up your environment', duration: 10, type: 'video' },
                  { title: 'Course overview', duration: 8, type: 'video' },
                ],
              }),
            },
            {
              title: 'Core Concepts',
              description: 'Learn the fundamental concepts and principles',
              order: 2,
              content: JSON.stringify({
                lessons: [
                  { title: 'Understanding the basics', duration: 15, type: 'video' },
                  { title: 'Hands-on practice', duration: 20, type: 'exercise' },
                  { title: 'Quiz: Test your knowledge', duration: 10, type: 'quiz' },
                ],
              }),
            },
            {
              title: 'Advanced Topics',
              description: 'Dive deeper into advanced concepts and real-world applications',
              order: 3,
              content: JSON.stringify({
                lessons: [
                  { title: 'Advanced techniques', duration: 25, type: 'video' },
                  { title: 'Project: Build something real', duration: 60, type: 'project' },
                  { title: 'Final assessment', duration: 30, type: 'quiz' },
                ],
              }),
            },
          ],
        },
      },
    });

    console.log(`  ✓ Created: ${course.title}`);
  }

  console.log('\n✅ Database seeded successfully!');
  console.log(`📊 Created ${courses.length} courses with modules`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
