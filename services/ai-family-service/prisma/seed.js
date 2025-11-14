const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const personalitiesDir = path.join(__dirname, '../personalities');

async function main() {
  console.log('Seeding family members...');

  const personalityFiles = fs.readdirSync(personalitiesDir).filter(file => file.endsWith('.js'));

  for (const file of personalityFiles) {
    const personalityClass = require(path.join(personalitiesDir, file));
    const personality = new personalityClass();
    const config = personality.getConfig();

    await prisma.familyMember.upsert({
      where: { name: config.name },
      update: {
        role: config.role,
        traits: config.traits,
        background: config.background,
        relationships: config.relationships,
        temperature: config.temperature,
      },
      create: {
        name: config.name,
        role: config.role,
        traits: config.traits,
        background: config.background,
        relationships: config.relationships,
        temperature: config.temperature,
      },
    });
    console.log(`Seeded ${config.name}`);
  }

  console.log('Seeding complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
