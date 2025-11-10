const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  const hash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@azora.world' },
    update: {},
    create: {
      email: 'admin@azora.world',
      password: hash,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const course = await prisma.course.create({
    data: {
      title: 'Python Basics',
      description: 'Learn Python programming',
      instructor: admin.id,
      duration: 10,
      price: 99,
      status: 'PUBLISHED',
      modules: {
        create: [
          { title: 'Introduction', content: 'Welcome to Python', order: 1 },
          { title: 'Variables', content: 'Learn about variables', order: 2 },
        ],
      },
    },
  });

  console.log('✅ Created:', { admin: admin.email, course: course.title });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
