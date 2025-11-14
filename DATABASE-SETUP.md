# Database Setup Guide

## ✅ Completed Schemas

### Core Services
1. **Azora Mint** - Financial engine with wallets, transactions, staking, mining
2. **Azora Forge** - Marketplace with jobs, contracts, milestones, disputes
3. **Azora Pay** - Payment processing, escrow, invoicing
4. **Auth Service** - Users, sessions, MFA, audit logs
5. **Azora LMS** - Courses, modules, lessons, enrollments, certificates

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd services/azora-mint && npm install
cd ../azora-forge && npm install
cd ../azora-pay && npm install
cd ../auth-service && npm install
cd ../azora-lms && npm install
```

### 2. Setup Environment Variables
Create `.env` in each service directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/azora_mint"
```

### 3. Run Migrations
```bash
# For each service
npx prisma migrate dev
npx prisma generate
```

### 4. Seed Test Data
```bash
# For each service
npx prisma db seed
```

## 📊 Schema Overview

### Azora Mint (Financial)
- Wallet - User balances and staking
- Transaction - All financial movements
- Stake - Active staking records
- MiningRecord - Proof-of-Knowledge rewards
- EconomicMetrics - System-wide tracking

### Azora Forge (Marketplace)
- Job - Available opportunities
- Application - Job applications
- Contract - Active work agreements
- Milestone - Payment milestones
- Dispute - Conflict resolution
- SkillProfile - User capabilities

### Azora Pay (Payments)
- Payment - Transaction records
- Escrow - Locked funds
- PaymentMethod - User payment options
- Invoice - Billing records

### Auth Service (Identity)
- User - Account information
- Session - Active sessions
- RefreshToken - JWT refresh tokens
- MFASettings - Multi-factor auth
- UserProfile - Extended user data
- AuditLog - Security tracking

### Azora LMS (Learning)
- Course - Educational content
- Module - Course sections
- Lesson - Individual lessons
- Enrollment - Student registrations
- Progress - Learning tracking
- Review - Course ratings
- Certificate - Completion records

## 🔄 Database Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View database in browser
npx prisma studio

# Seed database
npx prisma db seed
```

## 🧪 Testing

Each service includes seed data for testing:
- Sample users (Themba, Naledi)
- Test transactions
- Example courses and jobs
- Mock payment records

## 📝 Next Steps

1. Create schemas for remaining services:
   - Azora Nexus (Event Bus)
   - Azora Aegis (Security)
   - Azora Sapiens (AI Tutoring)
   - Health Monitor
   - API Gateway

2. Add database connection pooling
3. Setup database backups
4. Configure read replicas for scaling
5. Add database monitoring

## 🛡️ Ubuntu Principles

Each schema follows Ubuntu philosophy:
- **Mint**: "My success enables your success"
- **Forge**: "My work strengthens our foundation"
- **Pay**: "My success enables your success"
- **Auth**: "My security ensures our freedom"
- **LMS**: "My knowledge becomes our knowledge"
