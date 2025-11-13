#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SERVICES_DIR = path.join(__dirname, '../services');

// Schema templates by service category
const SCHEMA_TEMPLATES = {
  auth: `
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  role          UserRole @default(STUDENT)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?
  
  @@index([email])
  @@map("users")
}

enum UserRole {
  STUDENT
  TEACHER
  ADMIN
  ENTERPRISE
}`,

  payment: `
model Transaction {
  id            String            @id @default(uuid())
  userId        String
  amount        Decimal           @db.Decimal(18, 8)
  currency      String            @default("AZR")
  type          TransactionType
  status        TransactionStatus @default(PENDING)
  metadata      Json?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
  
  @@index([userId])
  @@index([status])
  @@map("transactions")
}

enum TransactionType {
  DEPOSIT
  WITHDRAWAL
  TRANSFER
  MINING_REWARD
  PAYMENT
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  CANCELLED
}`,

  education: `
model Course {
  id          String   @id @default(uuid())
  title       String
  description String?
  instructorId String
  isPublished Boolean  @default(false)
  price       Decimal  @db.Decimal(10, 2)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
  
  @@index([instructorId])
  @@map("courses")
}

model Enrollment {
  id         String   @id @default(uuid())
  studentId  String
  courseId   String
  progress   Int      @default(0)
  status     EnrollmentStatus @default(ACTIVE)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@unique([studentId, courseId])
  @@index([studentId])
  @@index([courseId])
  @@map("enrollments")
}

enum EnrollmentStatus {
  ACTIVE
  COMPLETED
  DROPPED
  SUSPENDED
}`,

  marketplace: `
model Job {
  id          String    @id @default(uuid())
  title       String
  description String
  employerId  String
  salary      Decimal?  @db.Decimal(10, 2)
  status      JobStatus @default(OPEN)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?
  
  @@index([employerId])
  @@index([status])
  @@map("jobs")
}

enum JobStatus {
  OPEN
  CLOSED
  FILLED
  CANCELLED
}`,

  infrastructure: `
model Log {
  id        String   @id @default(uuid())
  level     LogLevel
  message   String
  service   String
  metadata  Json?
  createdAt DateTime @default(now())
  
  @@index([service])
  @@index([level])
  @@index([createdAt])
  @@map("logs")
}

enum LogLevel {
  DEBUG
  INFO
  WARN
  ERROR
  FATAL
}`,

  generic: `
model Record {
  id        String   @id @default(uuid())
  data      Json
  status    String   @default("active")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?
  
  @@map("records")
}`
};

const SERVICE_CATEGORIES = {
  auth: ['auth', 'auth-service-simple', 'user-service', 'session-service'],
  payment: ['azora-pay-service', 'azora-payments', 'payment-gateway', 'virtual-cards'],
  education: ['ai-tutor-service', 'assessment-service', 'course-service', 'enrollment-service', 'azora-classroom', 'azora-credentials'],
  marketplace: ['marketplace-service', 'job-matching-service', 'azora-careers'],
  infrastructure: ['audit-logging-service', 'logger-service', 'monitoring-service', 'health-monitor']
};

function getSchemaTemplate(serviceName) {
  for (const [category, services] of Object.entries(SERVICE_CATEGORIES)) {
    if (services.some(s => serviceName.includes(s))) {
      return SCHEMA_TEMPLATES[category];
    }
  }
  return SCHEMA_TEMPLATES.generic;
}

function createPrismaSchema(serviceName, serviceDir) {
  const prismaDir = path.join(serviceDir, 'prisma');
  const schemaPath = path.join(prismaDir, 'schema.prisma');
  
  if (fs.existsSync(schemaPath)) {
    console.log(`✓ ${serviceName} - Schema already exists`);
    return false;
  }
  
  if (!fs.existsSync(prismaDir)) {
    fs.mkdirSync(prismaDir, { recursive: true });
  }
  
  const modelTemplate = getSchemaTemplate(serviceName);
  
  const schema = `// Azora OS - ${serviceName} Database Schema
// Ubuntu Principle: "My data strengthens our foundation"

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

${modelTemplate}

// Constitutional Compliance
model ConstitutionalLog {
  id        String   @id @default(uuid())
  action    String
  userId    String?
  metadata  Json?
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([createdAt])
  @@map("constitutional_logs")
}
`;
  
  fs.writeFileSync(schemaPath, schema);
  console.log(`✓ ${serviceName} - Schema created`);
  return true;
}

function main() {
  console.log('🗄️  Generating Missing Database Schemas\n');
  
  const services = fs.readdirSync(SERVICES_DIR)
    .filter(name => {
      const servicePath = path.join(SERVICES_DIR, name);
      return fs.statSync(servicePath).isDirectory();
    });
  
  let created = 0;
  let existing = 0;
  
  services.forEach(serviceName => {
    const serviceDir = path.join(SERVICES_DIR, serviceName);
    const wasCreated = createPrismaSchema(serviceName, serviceDir);
    
    if (wasCreated) {
      created++;
    } else {
      existing++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Created: ${created}`);
  console.log(`   Existing: ${existing}`);
  console.log(`   Total: ${services.length}`);
  console.log(`\n✅ Schema generation complete!`);
}

main();
