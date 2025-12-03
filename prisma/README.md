# Azora OS Database Schema

## Overview

This directory contains the complete Prisma schema for Azora OS, covering all core services:

- **Education Services**: Courses, Enrollments, Assessments, Learning Paths
- **Financial Services**: Wallets, Transactions, Mining Activities
- **Marketplace Services**: Jobs, Applications, Skills
- **AI Services**: Chat Sessions, AI Personalities
- **Infrastructure**: Notifications, Events, User Management

## Quick Start

### 1. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and set your DATABASE_URL
# Example: DATABASE_URL="postgresql://user:password@localhost:5432/azora"
```

### 2. Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed with test data
npm run db:seed

# Or do all at once
npm run db:setup
```

### 3. Explore Database

```bash
# Open Prisma Studio (GUI)
npm run db:studio
```

## Schema Structure

### Core Models

#### User Management
- `User` - Core user accounts
- `UserProfile` - Extended user information
- `Token` - Authentication tokens

#### Education (🎓)
- `Course` - Course catalog
- `CourseModule` - Course content modules
- `Enrollment` - Student enrollments
- `Assessment` - Quizzes, exams, assignments
- `LearningPath` - Curated learning journeys

#### Finance (💰)
- `Wallet` - Multi-currency wallets (AZR, BTC, ETH, USD)
- `Transaction` - All financial transactions
- `MiningActivity` - Proof-of-Knowledge mining
- `Payment` - Payment processing

#### Marketplace (💼)
- `Job` - Job listings
- `JobApplication` - Job applications
- `Skill` - Skills catalog
- `UserSkill` - User skill profiles
- `JobSkill` - Job requirements

#### AI Services (🤖)
- `AIPersonality` - AI family members (Elara, Themba, etc.)
- `ChatSession` - User chat sessions
- `ChatMessage` - Chat history

#### Infrastructure (🛡️)
- `Notification` - User notifications
- `Event` - System events
- `SafetyIncident` - Safety reporting

## Database Commands

```bash
# Generate Prisma Client after schema changes
npm run db:generate

# Create a new migration
npm run db:migrate

# Reset database (WARNING: deletes all data)
npm run db:reset

# Seed database with test data
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

## Seed Data

The seed script (`seed.js`) creates:

- ✅ 3 AI Personalities (Elara, Sankofa, Themba)
- ✅ 3 Users (Student, Educator, Admin)
- ✅ 5 Skills (JavaScript, Python, React, Node.js, SQL)
- ✅ 2 Courses with modules
- ✅ 2 Jobs with requirements
- ✅ Wallets with AZR and ZAR balances
- ✅ Mining activities and transactions
- ✅ Enrollments and assessments
- ✅ Chat sessions with messages
- ✅ Job applications
- ✅ Notifications

## Schema Relationships

```
User
├── UserProfile (1:1)
├── Wallet[] (1:many)
├── Enrollment[] (1:many)
├── JobApplication[] (1:many)
├── UserSkill[] (1:many)
├── Assessment[] (1:many)
├── ChatSession[] (1:many)
└── Notification[] (1:many)

Course
├── CourseModule[] (1:many)
└── Enrollment[] (1:many)

Job
├── JobApplication[] (1:many)
└── JobSkill[] (1:many)

Skill
├── UserSkill[] (1:many)
└── JobSkill[] (1:many)
```

## Migration Strategy

1. **Development**: Use `npm run db:migrate` to create and apply migrations
2. **Production**: Use `npx prisma migrate deploy` for zero-downtime deployments
3. **Rollback**: Migrations are versioned in `migrations/` directory

## Best Practices

- Always run `db:generate` after schema changes
- Test migrations on staging before production
- Use transactions for complex operations
- Index frequently queried fields
- Use `@@map()` for custom table names
- Use enums for fixed value sets

## Troubleshooting

### Connection Issues
```bash
# Check DATABASE_URL in .env
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

### Migration Conflicts
```bash
# Reset and start fresh (dev only)
npm run db:reset
```

### Seed Errors
```bash
# Check seed.js for errors
node prisma/seed.js
```

## Next Steps

1. ✅ Schema created with 20+ models
2. ✅ Seed data for testing
3. 🔄 Add service-specific schemas as needed
4. 🔄 Implement soft deletes
5. 🔄 Add audit logging
6. 🔄 Optimize indexes for performance

## Support

For issues or questions:
- Check [Prisma Docs](https://www.prisma.io/docs)
- Review schema comments
- Contact: dev@azora.world
