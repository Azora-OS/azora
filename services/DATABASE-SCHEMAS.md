# Azora OS Database Schemas

**Last Updated:** 2025-01-10  
**Database:** PostgreSQL 15+  
**ORM:** Prisma 5.7.1

## 📊 Overview

All Azora OS services now have proper Prisma database schemas with:
- ✅ Proper relationships and indexes
- ✅ UUID primary keys
- ✅ Timestamps (createdAt, updatedAt)
- ✅ Optimized queries with indexes
- ✅ Data integrity constraints

**Statistics:**
- 📦 Total Services with Schemas: **18**
- 🗄️ Total Database Models: **60**
- 💰 Financial Services: 9 services, 27 models
- 🎓 Education Services: 4 services, 27 models
- 🔧 Infrastructure Services: 5 services, 6 models

## 🗄️ Service Schemas

### 1. Billing Service (Port 3009)

**Models:** Subscription, Plan, Invoice

```prisma
Subscription {
  - Manages user subscriptions
  - Links to plans and invoices
  - Tracks billing periods
}

Plan {
  - Defines subscription tiers
  - Pricing and features
  - Interval-based billing
}

Invoice {
  - Billing records
  - Payment tracking
  - Due date management
}
```

**Key Features:**
- Multi-tier subscription support
- Automated invoice generation
- Payment status tracking

---

### 2. Lending Service (Port 3010)

**Models:** Loan, Collateral, Repayment

```prisma
Loan {
  - Micro-lending records
  - Interest rate management
  - Collateral linking
}

Collateral {
  - Asset backing for loans
  - Value tracking
  - Status management
}

Repayment {
  - Payment schedules
  - Due date tracking
  - Payment history
}
```

**Key Features:**
- Collateral-backed lending
- Flexible repayment schedules
- Risk assessment integration

---

### 3. Exchange Rate Service (Port 3008)

**Models:** ExchangeRate, CurrencyPair, Conversion

```prisma
ExchangeRate {
  - Real-time currency rates
  - Historical data
  - Multi-source support
}

CurrencyPair {
  - Supported currency pairs
  - Active/inactive status
}

Conversion {
  - Conversion history
  - User tracking
  - Rate snapshots
}
```

**Key Features:**
- Multi-currency support (AZR, BTC, ETH, USD)
- Historical rate tracking
- Conversion audit trail

---

### 4. Virtual Card Service (Port 3007)

**Models:** VirtualCard, Transaction

```prisma
VirtualCard {
  - Virtual card issuance
  - Balance management
  - Card status control
}

Transaction {
  - Purchase tracking
  - Merchant records
  - Transaction history
}
```

**Key Features:**
- Instant card generation
- Real-time balance updates
- Transaction monitoring

---

### 5. KYC/AML Service (Port 3043)

**Models:** KycVerification, AmlCheck, SuspiciousActivity

```prisma
KycVerification {
  - Identity verification
  - Document management
  - Verification levels
}

AmlCheck {
  - Anti-money laundering checks
  - Risk scoring
  - Compliance tracking
}

SuspiciousActivity {
  - Activity monitoring
  - Risk assessment
  - Reporting system
}
```

**Key Features:**
- Multi-level KYC verification
- Automated AML screening
- Suspicious activity reporting

---

### 6. Security Service (Port 3044)

**Models:** SecurityEvent, BlockedEntity, SessionValidation

```prisma
SecurityEvent {
  - Threat detection
  - Event logging
  - Severity tracking
}

BlockedEntity {
  - IP/User blocking
  - Temporary/permanent blocks
  - Expiration management
}

SessionValidation {
  - Session security
  - Validation tracking
  - IP monitoring
}
```

**Key Features:**
- Real-time threat detection
- Entity blocking system
- Session security validation

---

### 7. Payment Gateway (Port 3038)

**Models:** Payment, PaymentMethod, Refund

```prisma
Payment {
  - Payment processing
  - Multi-provider support
  - Status tracking
}

PaymentMethod {
  - Saved payment methods
  - Default method selection
  - Provider integration
}

Refund {
  - Refund processing
  - Reason tracking
  - Status management
}
```

**Key Features:**
- Multi-provider support
- Saved payment methods
- Automated refund processing

---

### 8. Payment Service (Port 3039)

**Models:** Transaction, Wallet, TransactionFee

```prisma
Transaction {
  - Internal transactions
  - Account transfers
  - Reference tracking
}

Wallet {
  - Multi-currency wallets
  - Balance management
  - Locked balance support
}

TransactionFee {
  - Fee calculation
  - Fee tracking
  - Multiple fee types
}
```

**Key Features:**
- Multi-currency wallet support
- Transaction fee management
- Balance locking for escrow

---

### 9. Student Earnings Service (Port 3040)

**Models:** Earning, Milestone, Withdrawal

```prisma
Earning {
  - Student rewards
  - Multiple earning sources
  - Processing status
}

Milestone {
  - Achievement tracking
  - Reward amounts
  - Completion status
}

Withdrawal {
  - Earnings withdrawal
  - Multiple methods
  - Processing tracking
}
```

**Key Features:**
- Proof-of-Knowledge rewards
- Milestone-based earnings
- Flexible withdrawal options

---

### 10. Azora Education (Port 4200)

**Models:** Student, Course, Enrollment, Module, Lesson, Progress, Achievement

```prisma
Student {
  - Student profiles
  - Enrollment tracking
  - Progress monitoring
}

Course {
  - Course catalog
  - Module structure
  - Instructor management
}

Enrollment {
  - Course enrollment
  - Progress tracking
  - Completion status
}
```

**Key Features:**
- Complete student management
- Course catalog and discovery
- Progress tracking and analytics
- Achievement and gamification system

---

### 11. Azora LMS (Port 4015)

**Models:** Faculty, CourseManagement, Assignment, Submission, Grade, Certificate

```prisma
Faculty {
  - Instructor profiles
  - Department management
  - Course assignments
}

Assignment {
  - Assignment creation
  - Due date management
  - Grading rubrics
}

Certificate {
  - Certificate issuance
  - Blockchain verification
  - Expiration tracking
}
```

**Key Features:**
- Faculty course management
- Assignment and grading system
- Certificate generation
- Blockchain verification

---

### 12. Azora Sapiens (Port 4011)

**Models:** TutoringSession, Message, LearningInsight, LearningPath, PathStep, Question

```prisma
TutoringSession {
  - AI tutoring sessions
  - Duration tracking
  - Session history
}

LearningPath {
  - Personalized paths
  - Difficulty levels
  - Progress tracking
}

Question {
  - Q&A history
  - Topic categorization
  - Answer tracking
}
```

**Key Features:**
- AI-powered tutoring with Elara
- Personalized learning paths
- Learning insights and analytics
- Q&A history tracking

---

### 13. Azora Assessment (Port 4016)

**Models:** Quiz, Question, QuestionOption, QuizAttempt, Answer, Gradebook

```prisma
Quiz {
  - Quiz creation
  - Time limits
  - Passing scores
}

QuizAttempt {
  - Student attempts
  - Score tracking
  - Time spent
}

Gradebook {
  - Overall grades
  - Letter grade conversion
  - Status tracking
}
```

**Key Features:**
- Quiz and exam creation
- Auto-grading system
- Multiple attempt tracking
- Comprehensive gradebook

---

### 14. Cache Service (Port 3070)

**Models:** CacheEntry

```prisma
CacheEntry {
  - Key-value storage
  - TTL expiration
  - Timestamp tracking
}
```

**Key Features:**
- Distributed caching
- TTL-based expiration
- High-performance lookups

---

### 15. Notification Service (Port 3037)

**Models:** Notification

```prisma
Notification {
  - User notifications
  - Read/unread status
  - Type categorization
}
```

**Key Features:**
- Multi-channel notifications
- Read status tracking
- User-scoped queries

---

### 16. Analytics Service

**Models:** Event, Metric

```prisma
Event {
  - User events
  - Event properties
  - Timestamp tracking
}

Metric {
  - System metrics
  - Value tracking
  - Tag-based filtering
}
```

**Key Features:**
- Event tracking
- Metrics aggregation
- Time-series data

---

### 17. API Gateway (Port 4000)

**Models:** ApiLog, RateLimit

```prisma
ApiLog {
  - Request logging
  - Performance tracking
  - User attribution
}

RateLimit {
  - Rate limiting
  - Reset tracking
  - Key-based limits
}
```

**Key Features:**
- Request logging
- Rate limiting
- Performance monitoring

---

### 18. Email Service (Port 3030)

**Models:** Email

```prisma
Email {
  - Email queue
  - Delivery status
  - Timestamp tracking
}
```

**Key Features:**
- Email queue management
- Delivery tracking
- Status monitoring

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd services/<service-name>
npm install
```

### 2. Configure Database

```bash
# Copy environment template
cp .env.example .env

# Edit DATABASE_URL
nano .env
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Push Schema to Database

```bash
# Development (no migrations)
npm run db:push

# Production (with migrations)
npm run db:migrate
```

### 5. Open Prisma Studio (Optional)

```bash
npm run db:studio
```

## 📊 Database Architecture

### Shared Patterns

All schemas follow these patterns:

1. **UUID Primary Keys**
   ```prisma
   id String @id @default(uuid())
   ```

2. **Timestamps**
   ```prisma
   createdAt DateTime @default(now())
   updatedAt DateTime @updatedAt
   ```

3. **Indexes**
   ```prisma
   @@index([userId])
   @@index([status])
   ```

4. **Relationships**
   ```prisma
   user User @relation(fields: [userId], references: [id])
   ```

### Database Naming Conventions

- **Tables:** snake_case (e.g., `user_balances`)
- **Columns:** camelCase (e.g., `userId`)
- **Indexes:** Automatic naming
- **Foreign Keys:** Automatic naming

## 🔐 Security Considerations

1. **Sensitive Data**
   - Card numbers encrypted at rest
   - CVV never stored in plain text
   - PII data encrypted

2. **Access Control**
   - Row-level security (RLS)
   - User-scoped queries
   - Admin-only operations

3. **Audit Trail**
   - All modifications logged
   - Timestamp tracking
   - User attribution

## 📈 Performance Optimization

1. **Indexes**
   - User ID indexes on all user-related tables
   - Status indexes for filtering
   - Composite indexes for common queries

2. **Relationships**
   - Efficient foreign key constraints
   - Cascade deletes where appropriate
   - Lazy loading support

3. **Queries**
   - Optimized with Prisma query engine
   - Connection pooling
   - Query result caching

## 🧪 Testing

```bash
# Test database connection
npm run db:push

# Verify schema
npm run db:studio

# Run migrations
npm run db:migrate
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)
- [Database Design Patterns](https://www.postgresql.org/docs/current/ddl.html)

---

**"Ngiyakwazi ngoba sikwazi" - "I can because we can"**

*Building robust data foundations with Ubuntu philosophy* 🚀
