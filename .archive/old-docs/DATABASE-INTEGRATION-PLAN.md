# 🗄️ Database Integration Plan

## 🎯 Objective

Create a comprehensive, unified database schema for all Azora OS services by ingesting database schemas from GitHub repositories and integrating them into a single Prisma schema.

## 📋 Database Schema Sources

### 1. ✅ LMS Database Schemas
**Repositories:**
- `moodle/moodle` - Complete LMS schema with courses, enrollments, grades
- `openedx/edx-platform` - MOOC platform with assessments
- `instructure/canvas-lms` - Modern LMS with assignments
- `SakaiProject/sakai` - Enterprise LMS
- `opencraft/opencraft` - Open edX services

**What to Extract:**
- Course structure (courses, modules, lessons)
- Enrollment system
- Progress tracking
- Gradebook
- Assessment tables

---

### 2. ✅ Forum Database Schemas
**Repositories:**
- `discourse/discourse` - Advanced forum schema
- `Flarum/flarum` - Modern forum structure
- `NodeBB/NodeBB` - Node.js forum schema
- `getfider/fider` - Feature voting schema

**What to Extract:**
- Post/thread structure
- Comment threading
- Reaction system
- Moderation tables
- Search indexes

---

### 3. ✅ Chat/Messaging Schemas
**Repositories:**
- `RocketChat/Rocket.Chat` - Real-time messaging
- `mattermost/mattermost-server` - Enterprise chat
- `zulip/zulip` - Threaded chat schema

**What to Extract:**
- Message storage
- Room/channel structure
- Read receipts
- Presence tracking
- File attachments

---

### 4. ✅ Certification Schemas
**Repositories:**
- `mozilla/openbadges` - Badge schema
- `blockcerts/blockcerts` - Blockchain certificates

**What to Extract:**
- Certificate structure
- Badge system
- Blockchain integration
- Verification tables

---

### 5. ✅ Authentication Schemas
**Repositories:**
- `keycloak/keycloak` - Identity management
- `ory/kratos` - Identity server
- `authelia/authelia` - Auth server

**What to Extract:**
- User accounts
- Sessions
- OAuth/OIDC
- Role-based access
- 2FA tables

---

### 6. ✅ CMS Schemas
**Repositories:**
- `strapi/strapi` - Headless CMS
- `directus/directus` - SQL CMS
- `ghost/ghost` - Publishing platform
- `payloadcms/payload` - TypeScript CMS

**What to Extract:**
- Content structure
- Media library
- Version control
- Publishing workflow

---

## 🚀 Execution Plan

### Phase 1: Clone Database Schemas
```bash
./scripts/clone-database-schemas.sh
```

**Expected Output:**
- `database-schemas/` directory with cloned repos
- `extracted-schemas/` directory with schema files

---

### Phase 2: Analyze and Extract
```bash
# Review extracted schemas
find extracted-schemas -name "*.prisma" -o -name "*.sql"
```

**What to Look For:**
- Table structures
- Relationships
- Indexes
- Constraints
- Enums

---

### Phase 3: Create Unified Schema
```bash
# The unified schema is already created at:
# prisma/unified-schema.prisma
```

**Features Included:**
- ✅ User & Authentication
- ✅ Company & Organization
- ✅ LMS (Courses, Modules, Lessons)
- ✅ Enrollments & Progress
- ✅ Assessments & Quizzes
- ✅ Certifications & Badges
- ✅ Community Forums
- ✅ Live Chat
- ✅ Wallet & Transactions
- ✅ Audit & Compliance

---

### Phase 4: Create Database
```bash
./scripts/create-unified-database.sh
```

**This will:**
1. Generate Prisma Client
2. Create migration
3. Apply migration to database
4. Verify schema

---

## 📊 Unified Schema Structure

### Core Models

#### User & Auth
- `User` - Core user model with roles
- `Account` - OAuth accounts
- `Session` - User sessions
- `VerificationToken` - Email verification

#### LMS
- `Course` - Course catalog
- `Category` - Course categories
- `CourseModule` - Course structure
- `Lesson` - Individual lessons
- `Enrollment` - Student enrollments
- `CourseProgress` - Learning progress

#### Assessments
- `Quiz` - Quiz definitions
- `Question` - Quiz questions
- `QuestionOption` - Answer options
- `QuizAttempt` - Student attempts
- `QuizResponse` - Student answers
- `Submission` - Assignment submissions

#### Certifications
- `Certificate` - Issued certificates
- `Badge` - Badge definitions
- `UserBadge` - User badge awards

#### Community
- `Forum` - Forum categories
- `ForumCategory` - Category hierarchy
- `ForumPost` - Discussion posts
- `ForumComment` - Post comments
- `ForumReaction` - Likes/reactions

#### Chat
- `ChatRoom` - Chat rooms/channels
- `ChatRoomMember` - Room memberships
- `ChatMessage` - Messages
- `ChatReadReceipt` - Read receipts

#### Financial
- `Wallet` - User wallets
- `Transaction` - All transactions
- `Staking` - Staking records

#### Compliance
- `ComplianceAction` - Compliance tracking
- `AuditLog` - System audit logs
- `MicroserviceMeter` - Usage tracking

---

## 🔧 Database Setup

### Prerequisites
```bash
# Install dependencies
npm install

# Set DATABASE_URL
export DATABASE_URL="postgresql://user:password@localhost:5432/azora_os"
```

### Create Database
```bash
# Using the unified schema
./scripts/create-unified-database.sh
```

### Alternative: Use Existing Schema
```bash
# If you want to use the existing schema.prisma
npx prisma migrate dev
```

---

## 📝 Migration Strategy

### Option 1: Fresh Start
- Drop existing database
- Create new unified schema
- Run migrations

### Option 2: Incremental
- Keep existing tables
- Add new tables
- Migrate data gradually

### Option 3: Dual Schema
- Keep existing schema for legacy
- Use unified schema for new features
- Bridge between them

---

## ✅ Checklist

### Setup
- [x] Create schema cloning script
- [x] Create unified Prisma schema
- [x] Create database creation script
- [x] Document integration plan

### Execution
- [ ] Clone database schemas from GitHub
- [ ] Review extracted schemas
- [ ] Update unified schema if needed
- [ ] Create database migration
- [ ] Apply migration
- [ ] Verify schema

### Integration
- [ ] Update Prisma Client usage
- [ ] Migrate existing data
- [ ] Update API endpoints
- [ ] Test all features
- [ ] Update documentation

---

## 🎯 Success Criteria

1. ✅ All feature schemas included
2. ✅ Proper relationships defined
3. ✅ Indexes for performance
4. ✅ Constraints for data integrity
5. ✅ Migration successful
6. ✅ All features working

---

## 📚 Next Steps

1. **Review Unified Schema**
   - Check all relationships
   - Verify indexes
   - Test constraints

2. **Run Migration**
   ```bash
   ./scripts/create-unified-database.sh
   ```

3. **Update Code**
   - Update Prisma Client imports
   - Update API endpoints
   - Test all features

4. **Data Migration**
   - Migrate existing data
   - Verify data integrity
   - Test queries

---

**Status**: 🟢 Ready to Execute
**Next Step**: Run `./scripts/clone-database-schemas.sh` then `./scripts/create-unified-database.sh`

