# Azora Ecosystem - Data Seeding Requirements

This document outlines the data requirements for each backend service in the Azora ecosystem. Use this as a checklist for populating the system with realistic data for development, testing, and demos.

## 📚 Education Platform (`azora-education`)

**Status**: ✅ Partially Seeded (10 courses)

### Required Data
- **Courses**: Detailed metadata, syllabus, lessons, video URLs, pricing.
- **Instructors**: Profiles, bios, avatars.
- **Enrollments**: Student-course relationships, progress tracking (0-100%).
- **Assessments**: Quizzes, assignments, grading criteria.
- **Reviews**: Student ratings and feedback.

### Action Items
- [ ] Expand course catalog to 50+ courses across all categories.
- [ ] Add lesson content (text/markdown) for at least 5 courses.
- [ ] Create 100+ dummy student enrollments with varying progress.

---

## 🔐 Authentication & Users (`azora-auth`)

**Status**: ⚠️ Minimal (Default admin only)

### Required Data
- **Users**: diverse set of users (students, instructors, admins, developers).
- **Roles**: RBAC definitions (Admin, Student, Instructor, Developer, Enterprise).
- **Profiles**: Extended profile data (skills, bio, social links).
- **API Keys**: For developer access to platform services.

### Action Items
- [ ] Seed 50 users with different roles.
- [ ] Create "Persona" accounts for demoing (e.g., "Jane Student", "Dr. Bob Instructor").

---

## 🛠️ Development Platform (`azora-forge`, `ai-orchestrator`)

**Status**: ❌ Empty

### Required Data
- **Projects**: User-created projects (web apps, mobile apps, AI models).
- **Templates**: Starter kits for new projects (Next.js, React Native, Python).
- **Deployments**: History of builds and deployments.
- **AI Contexts**: Project-specific knowledge bases for AI agents.

### Action Items
- [ ] Create 10 starter templates (e.g., "E-commerce Store", "Blog", "Portfolio").
- [ ] Seed 5 sample user projects with file structures.

---

## 💼 Business & Marketplace (`azora-marketplace`, `azora-careers`)

**Status**: ❌ Empty

### Required Data
- **Products**: Digital assets, plugins, themes, courses.
- **Services**: Freelance services, consulting offers.
- **Jobs**: Job postings from partner companies.
- **Applications**: Candidate applications for jobs.
- **Companies**: Company profiles and branding.

### Action Items
- [ ] Seed 20 marketplace items (plugins, themes).
- [ ] Seed 15 job postings with descriptions and requirements.
- [ ] Create 5 dummy company profiles.

---

## 💰 Financial Platform (`azora-pay`, `azora-mint`)

**Status**: ❌ Empty

### Required Data
- **Wallets**: User balances (Fiat, AZR tokens).
- **Transactions**: History of payments, transfers, and rewards.
- **NFTs**: Minted certificates, badges, and assets.
- **Subscriptions**: Active recurring payments.

### Action Items
- [ ] Create wallets for all seeded users.
- [ ] Generate transaction history (purchases, rewards).
- [ ] Mint sample NFTs for course completions.

---

## 🤝 Community (`azora-community`)

**Status**: ❌ Empty

### Required Data
- **Posts**: User discussions, questions, updates.
- **Comments**: Replies to posts.
- **Groups**: Interest-based communities (e.g., "React Developers", "AI Ethics").
- **Events**: Webinars, meetups, hackathons.

### Action Items
- [ ] Seed 5 active groups.
- [ ] Generate 50 discussion threads with comments.
- [ ] Schedule 3 upcoming events.

---

## 🤖 AI Family (`ai-family-service`)

**Status**: ❌ Empty

### Required Data
- **Agent Memories**: Long-term memory storage for user interactions.
- **Knowledge Bases**: Domain-specific documents (PDFs, codebases).
- **Conversation History**: Chat logs for context.

### Action Items
- [ ] Index documentation for ELARA (Education agent).
- [ ] Index technical docs for NIA (Dev agent).

---

## 📝 Implementation Strategy

For each service, we will create a `seed-data.js` or `seed.ts` script that can be run via:

```bash
npm run db:seed
```

These scripts should:
1. Connect to the service's database.
2. Clear existing non-essential data (optional).
3. Insert the defined seed data.
4. Log results.
