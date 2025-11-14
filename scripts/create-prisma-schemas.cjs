#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SCHEMAS = {
  'azora-lms': `
model Course {
  id          String   @id @default(uuid())
  title       String
  description String?
  instructorId String
  isPublished Boolean  @default(false)
  price       Decimal  @db.Decimal(10, 2)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  lessons     Lesson[]
  
  @@map("courses")
}

model Lesson {
  id        String   @id @default(uuid())
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id])
  title     String
  content   String
  order     Int
  createdAt DateTime @default(now())
  
  @@map("lessons")
}`,

  'azora-pay-service': `
model Payment {
  id        String   @id @default(uuid())
  userId    String
  amount    Decimal  @db.Decimal(10, 2)
  currency  String   @default("USD")
  status    String   @default("PENDING")
  method    String
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@map("payments")
}`,

  'azora-sapiens': `
model ChatMessage {
  id        String   @id @default(uuid())
  userId    String
  message   String
  role      String
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@map("chat_messages")
}`,

  'azora-assessment': `
model Assessment {
  id          String       @id @default(uuid())
  title       String
  courseId    String
  totalPoints Int
  createdAt   DateTime     @default(now())
  submissions Submission[]
  
  @@map("assessments")
}

model Submission {
  id           String     @id @default(uuid())
  assessmentId String
  assessment   Assessment @relation(fields: [assessmentId], references: [id])
  studentId    String
  answers      Json
  score        Int?
  createdAt    DateTime   @default(now())
  
  @@map("submissions")
}`,

  'azora-credentials': `
model Credential {
  id        String   @id @default(uuid())
  userId    String
  type      String
  title     String
  issueDate DateTime @default(now())
  hash      String   @unique
  
  @@index([userId])
  @@map("credentials")
}`,

  'azora-careers': `
model CareerProfile {
  id        String   @id @default(uuid())
  userId    String   @unique
  skills    Json
  experience Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("career_profiles")
}

model CareerRecommendation {
  id        String   @id @default(uuid())
  userId    String
  jobTitle  String
  score     Float
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@map("career_recommendations")
}`,

  'analytics-service': `
model UserAnalytics {
  id         String   @id @default(uuid())
  userId     String   @unique
  engagement Float    @default(0)
  lastActive DateTime @default(now())
  
  @@map("user_analytics")
}`,

  'messaging-service': `
model Message {
  id          String   @id @default(uuid())
  senderId    String
  recipientId String
  content     String
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  @@index([recipientId])
  @@map("messages")
}`
};

const SCHEMA_TEMPLATE = (models) => `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

${models}
`;

function createSchema(serviceName) {
  const servicePath = path.join(__dirname, '../services', serviceName);
  const prismaDir = path.join(servicePath, 'prisma');
  const schemaPath = path.join(prismaDir, 'schema.prisma');
  
  if (fs.existsSync(schemaPath)) {
    return false;
  }
  
  const models = SCHEMAS[serviceName];
  if (!models) {
    return false;
  }
  
  if (!fs.existsSync(prismaDir)) {
    fs.mkdirSync(prismaDir, { recursive: true });
  }
  
  fs.writeFileSync(schemaPath, SCHEMA_TEMPLATE(models));
  return true;
}

function main() {
  console.log('📦 Creating Prisma Schemas\n');
  
  let created = 0;
  
  Object.keys(SCHEMAS).forEach(serviceName => {
    if (createSchema(serviceName)) {
      console.log(`✓ ${serviceName}`);
      created++;
    }
  });
  
  console.log(`\n✅ Created ${created} schemas`);
}

main();
