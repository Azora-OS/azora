# 🎯 Azora Platform - Complete Data Requirements Summary

## Overview
This document outlines all data structures, services, and configurations needed for Azora to operate as a complete ecosystem for learning, building, and earning.

---

## 📊 CORE DATA ENTITIES

### 1. **User Management**
```
Users
├── Authentication (email, password_hash)
├── Profile (name, avatar, bio, location, timezone)
├── Role (STUDENT, EDUCATOR, ADMIN)
├── Preferences & Settings
└── Timestamps (created_at, updated_at)

UserProfile
├── Bio & Avatar
├── Location & Timezone
├── Learning Preferences
└── Accessibility Settings
```

**Required Data:**
- Email validation & uniqueness
- Password hashing (bcrypt/argon2)
- Role-based access control (RBAC)
- User preferences storage

---

### 2. **Education Platform (Azora Sapiens)**

#### Course Structure
```
Course
├── Metadata (title, description, category, level)
├── Instructor (instructorId)
├── Pricing (price, currency)
├── Status (DRAFT, PUBLISHED, ARCHIVED)
├── Metrics (rating, enrollmentCount)
└── Content (modules, lessons, assignments)

CourseModule
├── Title & Content
├── Order/Sequence
└── Lessons

Lesson
├── Title, Duration, Type (video, interactive, coding)
├── Content/URL
└── Order Index

Assignment
├── Title, Type (project, quiz, coding)
├── Points & Due Date
└── Submission Tracking
```

**Required Data:**
- 5+ sample courses (CS101, Web201, AI301, Bus101, Data201)
- Module structure (3-4 modules per course)
- Lesson content (4-5 lessons per module)
- Assignment definitions
- External content sources (Khan Academy, MIT OCW, etc.)

#### Enrollment & Progress
```
Enrollment
├── User-Course Mapping
├── Status (ACTIVE, COMPLETED, DROPPED)
├── Progress Percentage
└── Timestamps

LessonProgress
├── User-Lesson Mapping
├── Completion Status
├── Time Spent
└── Completion Timestamp

Assessment
├── Quiz/Exam/Assignment
├── Questions & Answers
├── Score & Max Score
├── Status (NOT_STARTED, IN_PROGRESS, SUBMITTED, GRADED)
└── Timestamps
```

**Required Data:**
- Sample enrollments for test users
- Progress tracking records
- Assessment questions & answers
- Grading rubrics

---

### 3. **Financial Services (Azora Mint, Pay, Treasury)**

#### Payment Processing
```
Payment
├── User & Course Reference
├── Amount & Currency
├── Stripe Integration (paymentIntentId)
├── Status (PENDING, COMPLETED, FAILED, REFUNDED)
├── Metadata & Error Handling
└── Timestamps

Receipt
├── Invoice Number & PDF URL
├── Payment Reference
├── Items & Amount
├── Email Tracking
└── Timestamps

Refund
├── Payment Reference
├── Amount & Reason
├── Stripe Refund ID
├── Status (PENDING, SUCCEEDED, FAILED)
└── Timestamps

IdempotencyKey
├── Unique Key for Idempotent Requests
├── Payment Result Cache
├── Expiration
└── User Reference
```

**Required Data:**
- Stripe API keys & webhook configuration
- Payment method templates
- Refund policies
- Invoice templates

#### Wallet & Transactions
```
Wallet
├── User Reference
├── Currency (AZR, BTC, ETH, USD, ZAR)
├── Balance
├── Blockchain Address
└── Timestamps

Transaction
├── Wallet Reference
├── Type (DEPOSIT, WITHDRAWAL, TRANSFER, MINING_REWARD, PAYMENT)
├── Amount & Currency
├── Status (PENDING, PROCESSING, COMPLETED, FAILED)
├── From/To Addresses
└── Metadata

MiningActivity
├── User Reference
├── Activity Type (COURSE_COMPLETION, ASSESSMENT_PASS, PEER_TEACHING, CONTENT_CREATION)
├── Tokens Earned
├── Status (PENDING, VERIFIED, REWARDED, REJECTED)
└── Timestamps
```

**Required Data:**
- Wallet initialization for test users
- Mining reward rates & rules
- Transaction fee structures
- Blockchain network configuration

#### Token System
```
TokenBalance
├── User Reference
├── Current Balance
└── Timestamps

TokenTransaction
├── User & Balance Reference
├── Amount & Type (EARN, REDEEM, TRANSFER, BONUS, PENALTY)
├── Reason & Metadata
├── Balance After Transaction
└── Timestamps

TokenSupply
├── Total Supply
├── Circulating Supply
├── Burned Supply
└── Last Updated

BurnTransaction
├── User Reference
├── Amount & Burn Rate
├── Transaction Type (COURSE_SALE, EARNINGS_WITHDRAWAL, TOKEN_REDEMPTION)
├── Blockchain Status
└── Timestamps

TokenRedemption
├── User Reference
├── Amount & Type (FEATURE_UNLOCK, PREMIUM_CONTENT, MERCHANDISE, DONATION)
├── Status (PENDING, APPROVED, COMPLETED, REJECTED)
└── Timestamps

LeaderboardEntry
├── User Reference
├── Rank & Score
├── Type (GLOBAL, FRIENDS, CLASS)
├── Period (global, weekly, monthly)
└── Timestamps
```

**Required Data:**
- Token supply configuration
- Burn rate policies (5%, 3%, 2%)
- Redemption options & values
- Leaderboard calculation rules

#### Subscriptions
```
Subscription
├── User Reference (unique)
├── Tier (FREE, PRO, ENTERPRISE)
├── Status (ACTIVE, PAUSED, CANCELLED, EXPIRED, PAST_DUE)
├── Stripe Integration
├── Period Dates & Renewal
├── Cancellation Info
└── Metadata

SubscriptionTierConfig
├── Tier Definition
├── Pricing (monthly, annual)
├── Features List
├── Limits (courses, upload, tokens)
├── Revenue Share %
├── Support Level
└── Active Status

BillingHistory
├── Subscription Reference
├── Amount & Currency
├── Status (PENDING, PROCESSING, PAID, FAILED, REFUNDED)
├── Invoice Details
├── Stripe Integration
├── Payment Dates
└── Failure Tracking
```

**Required Data:**
- Subscription tier definitions (FREE, PRO, ENTERPRISE)
- Pricing tiers & features
- Billing cycle configuration
- Revenue share percentages

---

### 4. **Marketplace Services (Azora Forge, Marketplace)**

#### Jobs & Careers
```
Job
├── Title, Description, Company
├── Location & Remote Status
├── Salary & Currency
├── Status (ACTIVE, FILLED, CLOSED, EXPIRED)
├── Requirements & Skills
└── Timestamps

JobApplication
├── User & Job Reference
├── Status (PENDING, REVIEWING, SHORTLISTED, INTERVIEWED, OFFERED, ACCEPTED, REJECTED)
├── Cover Letter & Resume
├── Match Score
└── Timestamps

Skill
├── Name & Category
├── Description
└── Timestamps

UserSkill
├── User & Skill Reference
├── Level (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
├── Verification Status
├── Endorsements Count
└── Timestamps

JobSkill
├── Job & Skill Reference
├── Required Status
├── Level
└── Timestamps
```

**Required Data:**
- Sample job listings (10-20)
- Skill taxonomy (50+ skills)
- User skill profiles
- Job requirements mapping

#### Course Reviews & Purchases
```
CourseReview
├── Course & User Reference
├── Rating (1-5)
├── Comment
└── Timestamps

CoursePurchase
├── Course & User Reference
├── Payment Reference
├── Price & Currency
├── Purchase Timestamp
└── Timestamps

InstructorEarnings
├── Course & Instructor Reference
├── Total/Paid/Pending Earnings
├── Last Paid Date
└── Timestamps
```

**Required Data:**
- Sample reviews & ratings
- Purchase history
- Earnings calculations

---

### 5. **AI Services (AI Family, Chat, Tutoring)**

#### Chat & Conversations
```
ChatSession
├── User Reference
├── AI Persona (elara, themba, sankofa, etc.)
├── Title & Context
└── Timestamps

ChatMessage
├── Session Reference
├── Role (user, assistant)
├── Content & Metadata
└── Timestamps

AIPersonality
├── Name & Role
├── Personality Description
├── Mood & Traits
├── Relationships
└── Timestamps
```

**Required Data:**
- AI personality definitions (ELARA, KOFI, ZURI, NIA, THEMBA, SANKOFA)
- Conversation templates
- Response patterns

#### AI Family Interactions
```
AIFamilyInteraction
├── User Reference
├── Family Member (AI persona)
├── Message & Response
├── Emotional State & Context
└── Timestamps

AIFamilyConsultation
├── User Reference
├── Topic
├── Insights & Response
└── Timestamps
```

**Required Data:**
- Family member personas
- Consultation topics
- Response templates

#### AI Routing System
```
QueryClassification
├── Query & Classification (SIMPLE, MODERATE, COMPLEX)
├── Confidence Score
├── Routing Tier (LOCAL_LLM, RAP_SYSTEM, EXTERNAL_LLM)
├── Response Time & Cost
├── User Reference
└── Timestamps

RoutingMetrics
├── Routing Tier
├── Request Statistics
├── Response Time Metrics
├── Cache Performance
└── Timestamps

AIRoutingCache
├── Query Hash & Query
├── Response & Routing Tier
├── Cost & TTL
├── Hit Count
└── Timestamps
```

**Required Data:**
- Query classification rules
- Routing tier configurations
- Cache policies

---

### 6. **Notifications & Events**

```
Notification
├── User Reference
├── Type (COURSE_UPDATE, PAYMENT_SUCCESS, MINING_REWARD, JOB_MATCH, etc.)
├── Title & Message
├── Data & Read Status
└── Timestamps

Event
├── Type & Source
├── Data & Status (PENDING, PROCESSING, COMPLETED, FAILED)
└── Timestamps
```

**Required Data:**
- Notification templates
- Event types & handlers
- Delivery preferences

---

### 7. **Enterprise Services**

#### Enterprise Licensing
```
EnterpriseLicense
├── Organization Reference
├── Tier (STARTER, PROFESSIONAL, ENTERPRISE, CUSTOM)
├── Status (ACTIVE, SUSPENDED, EXPIRED, CANCELLED)
├── License Key & Limits
├── Dates & Auto-Renewal
├── Features (custom domain, white label, SSO, API)
└── Timestamps

EnterpriseOrganization
├── License Reference
├── Organization Details
├── Contact Information
├── Industry & Location
└── Timestamps

EnterpriseUsageTracking
├── License Reference
├── Date & Metrics
├── Active Users, Courses, API Calls, Storage
└── Timestamps

EnterpriseSupportTicket
├── License Reference
├── Ticket Details
├── Priority & Status
├── Assignment & Resolution
└── Timestamps

EnterpriseCustomization
├── License Reference
├── Type (BRANDING, DOMAIN, SSO, API, FEATURE, INTEGRATION)
├── Key-Value Configuration
└── Timestamps
```

**Required Data:**
- Enterprise tier definitions
- Feature matrices
- Support SLA configurations
- Customization options

---

### 8. **Privacy & Compliance**

```
ConsentRecord
├── User Reference
├── Consent Type
├── Granted Status
├── IP Address & User Agent
└── Timestamps

ProofOfKnowledge
├── User & Course Reference
├── Completion Date
├── Certificate ID & Verification Hash
├── Expiry Date
└── Timestamps
```

**Required Data:**
- Consent types (marketing, analytics, data processing)
- Certificate templates
- Verification mechanisms

---

## 🔧 SERVICE CONFIGURATIONS

### 1. **Authentication & Authorization**
- JWT token configuration
- OAuth2 providers (Google, GitHub, etc.)
- Role-based access control (RBAC)
- Permission matrices

### 2. **Payment Gateway**
- Stripe API keys
- Webhook endpoints
- Currency configurations
- Tax settings

### 3. **Email Service**
- SMTP configuration
- Email templates
- Notification preferences
- Delivery tracking

### 4. **Storage & CDN**
- File upload limits
- Supported file types
- CDN configuration
- Backup policies

### 5. **Blockchain Integration**
- Network configuration (mainnet/testnet)
- Smart contract addresses
- Gas fee settings
- Transaction confirmation rules

### 6. **AI/ML Services**
- LLM API keys (OpenAI, Anthropic, etc.)
- Model configurations
- Rate limiting
- Cost tracking

### 7. **Analytics & Monitoring**
- Event tracking
- Performance metrics
- Error logging
- User behavior analysis

---

## 📋 INITIAL DATA SEEDING

### Sample Users
```json
{
  "students": [
    {"email": "student1@azora.world", "role": "STUDENT", "name": "Alice Johnson"},
    {"email": "student2@azora.world", "role": "STUDENT", "name": "Bob Smith"}
  ],
  "educators": [
    {"email": "educator1@azora.world", "role": "EDUCATOR", "name": "Dr. Sarah Lee"},
    {"email": "educator2@azora.world", "role": "EDUCATOR", "name": "Prof. James Wilson"}
  ],
  "admins": [
    {"email": "admin@azora.world", "role": "ADMIN", "name": "Admin User"}
  ]
}
```

### Sample Courses
- CS101: Introduction to Computer Science
- Web201: Full-Stack Web Development
- AI301: Artificial Intelligence & Machine Learning
- Bus101: Business Fundamentals
- Data201: Data Science & Analytics

### Sample Skills
- Programming (Python, JavaScript, Go, Rust)
- Web Development (React, Node.js, HTML/CSS)
- Data Science (Machine Learning, Statistics, SQL)
- Business (Management, Marketing, Finance)
- Design (UI/UX, Graphic Design, Animation)

### Sample Jobs
- Junior Developer
- Full-Stack Engineer
- Data Scientist
- Product Manager
- UX Designer

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1: Core (Week 1-2)
- [ ] User management & authentication
- [ ] Course structure & enrollment
- [ ] Basic payment processing
- [ ] Email notifications

### Phase 2: Monetization (Week 3-4)
- [ ] Token system & mining
- [ ] Wallet & transactions
- [ ] Subscription management
- [ ] Instructor earnings

### Phase 3: Advanced Features (Week 5-6)
- [ ] AI services & chat
- [ ] Marketplace & jobs
- [ ] Enterprise licensing
- [ ] Analytics & reporting

### Phase 4: Optimization (Week 7-8)
- [ ] Performance tuning
- [ ] Security hardening
- [ ] Compliance & privacy
- [ ] Production deployment

---

## 📊 KEY METRICS TO TRACK

### User Metrics
- Total users by role
- Active users (daily, weekly, monthly)
- User retention rate
- Churn rate

### Course Metrics
- Total courses
- Enrollment rate
- Completion rate
- Average rating
- Revenue per course

### Financial Metrics
- Total revenue
- Average transaction value
- Refund rate
- Token circulation
- Burn rate

### Engagement Metrics
- Average session duration
- Lesson completion rate
- Assignment submission rate
- Forum activity
- AI interaction frequency

---

## 🔐 Security Considerations

### Data Protection
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- PII masking in logs
- Regular backups

### Access Control
- Multi-factor authentication (MFA)
- API rate limiting
- IP whitelisting (enterprise)
- Audit logging

### Compliance
- GDPR compliance
- Data retention policies
- Right to be forgotten
- Data export capabilities

---

## 📈 Scaling Considerations

### Database
- Connection pooling (PgBouncer)
- Read replicas
- Sharding strategy
- Backup & recovery

### Caching
- Redis for sessions
- Query result caching
- CDN for static assets
- API response caching

### Infrastructure
- Load balancing
- Auto-scaling
- Multi-region deployment
- Disaster recovery

---

## 🎯 Next Steps

1. **Database Setup**: Initialize PostgreSQL with Prisma schema
2. **Seed Data**: Load sample courses, users, and configurations
3. **API Development**: Build REST/GraphQL endpoints
4. **Frontend Integration**: Connect UI to backend services
5. **Testing**: Unit, integration, and E2E tests
6. **Deployment**: Staging and production environments

---

**Last Updated**: 2025
**Status**: Complete Data Requirements Identified
**Next Review**: After Phase 1 Implementation
