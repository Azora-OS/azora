# 🗄️ Azora OS Database Guide

**Ubuntu Principle:** *"My data strengthens our foundation"*

Complete guide to Azora OS database architecture, schemas, and management.

---

## 📊 Database Architecture

### Multi-Database Strategy

Azora OS uses a **microservices database pattern** where each service has its own database:

```
┌─────────────────────────────────────────────────────────┐
│                    PostgreSQL Server                     │
├─────────────────────────────────────────────────────────┤
│  azora_auth          │  Auth & Identity Management      │
│  azora_education     │  Courses & Learning              │
│  azora_mint          │  Financial & Wallets             │
│  azora_forge         │  Jobs & Marketplace              │
│  azora_sapiens       │  AI Tutoring                     │
│  azora_nexus         │  Event Bus & Integration         │
│  azora_family        │  AI Family System                │
│  azora_notifications │  Notifications                   │
│  azora_health        │  System Monitoring               │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Install PostgreSQL 15+
# Windows: Download from postgresql.org
# Ubuntu: sudo apt install postgresql-15

# Verify installation
psql --version
```

### 2. Setup Databases

```bash
# Clone repository
git clone https://github.com/Sizwe780/azora-os.git
cd azora-os

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Run database setup
npm run db:setup

# Seed test data
npm run db:seed
```

### 3. Verify Setup

```bash
# Open Prisma Studio
npx prisma studio

# Or check with psql
psql -U postgres -l
```

---

## 📋 Core Schemas

### 🔐 Auth Service

**Database:** `azora_auth`

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  password        String
  name            String
  role            String    @default("student")
  isEmailVerified Boolean   @default(false)
  sessions        Session[]
  tokens          Token[]
  mfaSettings     MFASettings?
  profile         UserProfile?
}
```

**Key Features:**
- Multi-factor authentication
- Session management
- OAuth integration ready
- Audit logging

### 🎓 Education Service

**Database:** `azora_education`

```prisma
model Student {
  id          String       @id @default(cuid())
  userId      String       @unique
  enrollments Enrollment[]
  progress    LearningProgress[]
  wallet      Wallet?
}

model Course {
  id          String   @id @default(cuid())
  title       String
  modules     Module[]
  enrollments Enrollment[]
  published   Boolean  @default(false)
}
```

**Key Features:**
- Course management
- Progress tracking
- Assessment system
- Integrated wallet

### 💰 Mint Service

**Database:** `azora_mint`

```prisma
model Wallet {
  id      String  @id @default(cuid())
  userId  String  @unique
  balance Decimal @db.Decimal(18, 8)
  staked  Decimal @db.Decimal(18, 8)
  earned  Decimal @db.Decimal(18, 8)
}

model Transaction {
  type   String  // mint, transfer, stake, reward
  amount Decimal @db.Decimal(18, 8)
  status String  @default("completed")
}
```

**Key Features:**
- Multi-currency support
- Staking mechanism
- Mining rewards
- Transaction history

### 🔨 Forge Service

**Database:** `azora_forge`

```prisma
model Job {
  id          String  @id @default(cuid())
  title       String
  budget      Decimal @db.Decimal(18, 8)
  skills      String[]
  status      String  @default("open")
  applications Application[]
  contracts   Contract[]
}

model Contract {
  id         String     @id @default(cuid())
  amount     Decimal    @db.Decimal(18, 8)
  status     String     @default("active")
  milestones Milestone[]
  disputes   Dispute[]
}
```

**Key Features:**
- Job marketplace
- Smart contracts
- Milestone tracking
- Dispute resolution

### 🤖 Sapiens Service

**Database:** `azora_sapiens`

```prisma
model TutoringSession {
  id       String    @id @default(uuid())
  studentId String
  messages Message[]
  insights LearningInsight[]
}

model LearningPath {
  id            String     @id @default(uuid())
  studentId     String
  subject       String
  totalSteps    Int
  completedSteps Int
  steps         PathStep[]
}
```

**Key Features:**
- AI tutoring sessions
- Personalized learning paths
- Progress analytics
- Adaptive assessments

### 👨👩👧👦 AI Family Service

**Database:** `azora_family`

```prisma
model FamilyMember {
  id            String         @id @default(uuid())
  name          String         @unique
  role          String
  traits        String[]
  relationships Json
  conversations Conversation[]
}

model Conversation {
  id       String    @id @default(uuid())
  memberId String
  userId   String
  messages Message[]
}
```

**Key Features:**
- 11 AI family members
- Contextual conversations
- Relationship tracking
- Mood-based responses

---

## 🛠️ Database Management

### Migrations

```bash
# Create migration
cd services/[service-name]
npx prisma migrate dev --name description

# Apply migrations
npx prisma migrate deploy

# Reset database (DEV ONLY)
npx prisma migrate reset
```

### Prisma Studio

```bash
# Open visual database editor
npx prisma studio

# Access at http://localhost:5555
```

### Backup & Restore

```bash
# Backup all databases
./scripts/db-backup.sh

# Restore from backup
./scripts/db-restore.sh backup-2025-01-10.sql
```

---

## 📈 Performance Optimization

### Indexing Strategy

All schemas include strategic indexes:

```prisma
model User {
  email String @unique
  
  @@index([email])      // Fast email lookups
  @@index([role])       // Filter by role
  @@index([createdAt])  // Time-based queries
}
```

### Connection Pooling

```env
# .env configuration
DATABASE_URL="postgresql://user:pass@localhost:5432/azora_auth?connection_limit=10"
```

### Query Optimization

```typescript
// Use select to fetch only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true
  }
});

// Use include for relations
const student = await prisma.student.findUnique({
  where: { id },
  include: {
    enrollments: {
      include: { course: true }
    }
  }
});
```

---

## 🔒 Security Best Practices

### 1. Environment Variables

```env
# Never commit these!
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
ENCRYPTION_KEY="..."
```

### 2. Row-Level Security

```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_isolation ON users
  USING (id = current_user_id());
```

### 3. Audit Logging

```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String
  resource  String?
  metadata  Json?
  createdAt DateTime @default(now())
}
```

---

## 🧪 Testing

### Test Database Setup

```bash
# Use separate test database
export DATABASE_URL="postgresql://localhost:5432/azora_test"

# Run tests
npm run test:db
```

### Seed Data

```bash
# Seed development data
npm run db:seed

# Seed production data (minimal)
npm run db:seed:prod
```

---

## 📊 Monitoring

### Health Checks

```typescript
// Check database connection
async function checkHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy' };
  } catch (error) {
    return { status: 'unhealthy', error };
  }
}
```

### Metrics

- Connection pool usage
- Query performance
- Database size
- Active connections

---

## 🆘 Troubleshooting

### Common Issues

**1. Connection Refused**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection string
echo $DATABASE_URL
```

**2. Migration Conflicts**
```bash
# Reset migrations (DEV ONLY)
npx prisma migrate reset

# Force push schema
npx prisma db push --force-reset
```

**3. Prisma Client Out of Sync**
```bash
# Regenerate client
npx prisma generate
```

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Design Best Practices](./DATABASE-DESIGN.md)
- [Schema Migration Guide](./MIGRATIONS.md)

---

## 🤝 Contributing

When adding new schemas:

1. Follow Ubuntu naming conventions
2. Add appropriate indexes
3. Include audit logging
4. Document relationships
5. Add seed data
6. Update this guide

---

**Ubuntu Principle:** *"My data strengthens our foundation"*

Every database schema is designed to support collective prosperity while maintaining individual sovereignty.
