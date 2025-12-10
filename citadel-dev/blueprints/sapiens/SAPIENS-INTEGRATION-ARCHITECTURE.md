# Azora Sapiens – Integration Architecture & Roadmap

> **Status**: Integration Plan v1.0  
> **Date**: 2025-12-10  
> **Scope**: Complete migration of `sapiens.md` Base44 app into Azora OS  
> **References**: `citadel-dev/MASTER-ARCHITECTURE-BLUEPRINT.md`, `citadel-dev/blueprints/sapiens/SAPIENS-BLUEPRINT.md`  

---

## Executive Summary

The `sapiens.md` codebase is a **feature-complete, production-ready education platform** that implements:
- 9 full-stack pages (Home, Courses, CourseDetails, Learn, MyCourses, Achievements, Wallet, Certificate, Layout)
- 7 component libraries with ~30 reusable UI components
- 8 entity models (Course, Lesson, Enrollment, Achievement, TokenTransaction, LearningPath, Cohort, ClassSession)
- Full token economy and credentials

**Integration Strategy**: 
1. **Replace base44 client** with Azora's real APIs (ai-router, shared-ai, mint-pay, constitutional-ai)
2. **Adopt BaseAgent lifecycle** (recognizePatterns → reason → validate → act) for all tutoring/coaching flows
3. **Inject constitutional validation** into every meaningful action (enrollment, assessment, credential issuance, PoV awards)
4. **Wire to Azora's core services**: Education service, Knowledge Ocean, AI Family, Mint & Pay, Credentialing
5. **Map to citadel-dev task list** (SAP-1 through SAP-8) and execute in phases

---

## 1. Integration Points & Service Dependencies

### 1.1 Current State (Base44 Client)

The `sapiens.md` app uses a mock `base44Client` abstraction:

```typescript
// Current mock abstractions
base44.auth.me()                             // ← Replace with Auth Core (services/azora-auth/)
base44.auth.redirectToLogin()               // ← Replace with Auth Core
base44.entities.Course.list()               // ← Replace with Education service (Prisma)
base44.entities.Lesson.filter()             // ← Replace with Education service
base44.entities.Enrollment.create()         // ← Replace with Education service
base44.entities.Achievement.filter()        // ← Replace with Education service / Mint
base44.entities.TokenTransaction.filter()   // ← Replace with Mint & Pay service
base44.integrations.Core.InvokeLLM()        // ← Replace with AI router + BaseAgent
```

### 1.2 Azora Integration Map

| Function | Base44 Mock | Azora Service | Location |
|----------|-------------|---------------|----------|
| Auth | `base44.auth` | Auth Core / NextAuth | `services/azora-auth/` |
| Course CRUD | `base44.entities.Course` | Education Service | `services/education-lms/` (Prisma models) |
| Lesson CRUD | `base44.entities.Lesson` | Education Service | `services/education-lms/` |
| Enrollment CRUD | `base44.entities.Enrollment` | Education Service | `services/education-lms/` |
| Achievement CRUD | `base44.entities.Achievement` | Education Service + Mint | `services/education-lms/` + `services/azora-mint/` |
| Token Transactions | `base44.entities.TokenTransaction` | Mint & Pay | `services/azora-mint/` + `services/azora-pay/` |
| AI Tutoring | `base44.integrations.Core.InvokeLLM()` | AI Router + Elara Agent | `packages/shared-api/ai-router.ts` + `packages/shared-ai/agents/` |
| Constitutional Check | *(implicit)* | Constitutional Engine | `services/constitutional-ai/` |
| Cohorts/Sessions | *(missing)* | Cohort Service | `services/sapiens-cohorts/` (new) |
| Credentialing | *(missing)* | Credentialing Service | `services/credentialing/` (new) |

### 1.3 Data Flow Example (Old vs New)

**Old (Base44)**:
```
UI → base44.entities.Course.list() 
  → mock backend 
  → hardcoded courses 
  → return to UI
```

**New (Azora)**:
```
UI → ApiClient.getCourses() 
  → API Gateway 
  → Education Service (Prisma)
  → PostgreSQL
  → Sapiens Analytics (dashboards)
  → return to UI
```

**With Constitutional Audit**:
```
Educator enrolls learner
  → Education Service validates via Constitutional Engine
  → Creates Enrollment record + ConstitutionalAuditLog entry
  → Emits "EnrollmentCreated" event → Kafka
  → PoV Processor consumes event, calculates rewards
  → Mint service records TokenTransaction
  → Learner gets notification + balance update
  → All steps logged and queryable for audits
```

---

## 2. Implementation Phases (SAP Tasks Mapping)

### Phase 1: API & Data Layer (Weeks 1-2)
**Goal**: Replace base44 with real Azora APIs; establish data models.

**Tasks**:
- **SAP-1.1**: Curriculum graph schema extension (Prisma migrations)
- **SAP-2.1**: Learner profile aggregator service
- **SAP-3.1**: Assessment bank & attempt models
- **SAP-5.1**: Cohort & ClassSession models

**Deliverables**:
- Updated `prisma/schema.prisma` with Skill, CurriculumEdge, AssessmentAttempt, Cohort, ClassSession
- Prisma migrations & seed scripts
- `packages/sapiens-api-client/` (replaces base44)
- Updated `apps/azora-sapiens/src/config.ts` with real API endpoints

### Phase 2: Core Agents & Tutoring (Weeks 3-4)
**Goal**: Wire BaseAgent lifecycle into tutoring flows; implement Elara tutor for Sapiens.

**Tasks**:
- **SAP-2.2**: Tutor session orchestration API
- Create `services/sapiens-tutor/` with tutoring engine
- Implement ElaraTutor integration with `@azora/shared-ai` BaseAgent
- Add constitutional validation to all tutor responses

**Deliverables**:
- `services/sapiens-tutor/` with core tutoring logic
- Updated `ElaraTutor` component using real Elara agent from `@azora/shared-ai`
- Tutoring endpoint: `/api/sapiens/tutor/session`
- Constitutional audit logs for all tutoring interactions

### Phase 3: Assessment & Integrity (Weeks 5-6)
**Goal**: Implement robust exam mode, integrity checks, plagiarism detection.

**Tasks**:
- **SAP-3.2**: Exam mode UI & lockdown
- Implement proctoring hooks (focus detection, tab changes, suspicious behaviors)
- Plagiarism detection integration with Knowledge Ocean
- Assessment attempt endpoint with integrity signals

**Deliverables**:
- Locked-down exam mode UI with integrity indicators
- Integrity signals logged and queryable
- Plagiarism detection middleware
- Exam analytics dashboard

### Phase 4: Credentials & PoV (Weeks 7-8)
**Goal**: Issue verifiable credentials; hook up Mint & Pay for PoV rewards.

**Tasks**:
- **SAP-4.1**: Credential schemas & issuance API
- Create `services/credentialing/` (or extend Mint service)
- Implement PoV processor hooks for: course completion, high-quality projects, teaching
- Optional blockchain anchoring via `AZRToken.sol`

**Deliverables**:
- Credential issuance APIs & schemas (JSON-LD / VC format)
- PoV event processor for education domain
- Certificate UI page fully wired
- On-chain credential anchoring (if enabled)

### Phase 5: Educator Studio & Collaboration (Weeks 9-10)
**Goal**: Curriculum authoring, cohorts, live classroom support.

**Tasks**:
- **SAP-1.2**: Curriculum graph editor UI
- **SAP-5.1** (continued): Classroom & cohort features
- Build live session scheduling & attendance tracking
- Educator analytics dashboard

**Deliverables**:
- Curriculum graph editor React component
- Cohort enrollment & classroom management UI
- Live class session endpoints with BuildSpaces integration
- Educator analytics dashboard in Grafana

### Phase 6: Research Tools & Advanced Features (Weeks 11-12)
**Goal**: Research project workspaces, AI research assistants, library integration.

**Tasks**:
- **SAP-6.1**: Research project model & workspace
- Integrate with Knowledge Ocean for citation management
- Research assistant (specialized AI persona)
- Dataset governance & access controls

**Deliverables**:
- Research project CRUD endpoints
- Dataset governance policies
- Research assistant AI persona
- Research workspace in BuildSpaces (AI Studio)

### Phase 7: Compliance & Observability (Weeks 13-14)
**Goal**: Policy-as-code for FERPA/GDPR/POPIA, observability pack.

**Tasks**:
- **SAP-8.1**: Educational records policy-as-code
- **SAP-8.2**: Sapiens observability pack (dashboards, alerts, runbooks)
- Data retention & privacy controls
- Audit log dashboards

**Deliverables**:
- Policy-as-code files in `SECURITY/` and service configs
- Grafana dashboards for learning outcomes, risk, tutor efficacy
- Alertmanager rules for SLOs
- Runbooks for common incidents
- Privacy control UI in settings

### Phase 8: Launch & Hardening (Weeks 15-16)
**Goal**: Testing, security audit, documentation, go-live.

**Tasks**:
- Full e2e test suite (Playwright)
- Security audit (penetration testing, constitutional alignment audit)
- Load testing (10k+ concurrent learners)
- Documentation (runbooks, API docs, educator guides)
- Phased rollout (beta → production)

**Deliverables**:
- Test suite (unit, integration, e2e, constitutional)
- Security audit report & remediation
- Performance tuning & capacity planning
- Public API documentation
- Launch playbook

---

## 3. Service Architecture (New & Updated)

### 3.1 New Services

**`services/sapiens-tutor/`** (Tutoring Engine)
- Express.js + Prisma
- Endpoints:
  - `POST /tutor/session/start` — Create tutoring session
  - `POST /tutor/session/{id}/message` — Send user message, get AI response
  - `POST /tutor/session/{id}/complete` — Close session, award tokens
- Dependencies: AI router, Knowledge Ocean, Constitutional engine
- Responsible for: grounding responses in course content, tracking tutor efficacy, logging all interactions with alignment scores

**`services/sapiens-cohorts/`** (Cohort & Classroom Management)
- Express.js + Prisma
- Endpoints:
  - `POST /cohorts` — Create cohort
  - `GET /cohorts/{id}` — Get cohort details
  - `POST /cohorts/{id}/enroll` — Add learner
  - `POST /sessions` — Schedule class session
  - `GET /sessions/{id}/attendance` — Get attendance
- Dependencies: Education service, BuildSpaces orchestrator
- Responsible for: cohort lifecycle, class scheduling, attendance tracking, integration with live classrooms

**`services/credentialing/`** (Credential Issuance & Verification)
- Express.js + Prisma
- Endpoints:
  - `POST /credentials/issue` — Issue credential
  - `GET /credentials/{id}/verify` — Verify credential (public endpoint)
  - `POST /credentials/{id}/revoke` — Revoke credential
  - `POST /credentials/{id}/anchor-onchain` — Anchor to blockchain
- Dependencies: Mint & Pay, blockchain bridge, Education service
- Responsible for: credential lifecycle, verification, optional on-chain anchoring

### 3.2 Updated Services

**`services/education-lms/`** (renamed from Education Service)
- Add Prisma migrations for: Skill, CurriculumEdge, AssessmentAttempt, Cohort, ClassSession
- Add endpoints for curriculum graph queries
- Add assessment attempt recording & integrity signal logging
- Integrate with Constitutional engine for sensitive actions (high-stakes exams, grade changes)

**`services/sapiens-analytics/`** (Analytics & Dashboards)
- Consume LMS & tutor events from Kafka
- Calculate: mastery per objective, at-risk learner scores, tutor efficacy, drop-off rates
- Expose dashboards for: learners (progress), educators (cohort analytics), admins (institution KPIs)
- Integrate with Prometheus/Grafana

**`services/azora-mint/`** (Mint & Pay Extension)
- Add PoV event processor for education domain
- Rules: course completion → X PoV, teaching → Y PoV, peer feedback → Z PoV
- Emit TokenTransaction events tied to education events
- Trigger AZR minting for high-value achievements

### 3.3 Unchanged Services (Integration Points)

- **`packages/shared-ai/`** – Elara & other agents already have BaseAgent lifecycle; Sapiens will use directly
- **`services/knowledge-ocean/`** – RAG for grounding tutor responses & research assistant
- **`services/ai-ethics-monitor/`** – Constitutional checks for all AI-mediated content
- **`services/constitutional-ai/`** – Core validation engine
- **`apps/azora-buildspaces/`** – Host Sapiens views & integration with classroom/research rooms

---

## 4. Data Model Evolution

### 4.1 New Prisma Models

```prisma
// Curriculum Graph
model Skill {
  id String @id @default(cuid())
  name String
  description String?
  domain String // e.g., "mathematics", "technology"
  difficultyLevel Int // 1-10
  prerequisites Skill[] @relation("SkillPrerequisites")
  requiredBy Skill[] @relation("SkillPrerequisites")
  courses Course[]
  createdAt DateTime @default(now())
}

model CurriculumEdge {
  id String @id @default(cuid())
  fromSkillId String
  fromSkill Skill @relation("EdgeFrom", fields: [fromSkillId], references: [id])
  toSkillId String
  toSkill Skill @relation("EdgeTo", fields: [toSkillId], references: [id])
  relationshipType String // "prerequisite", "recommendation", "equivalence"
  weight Float @default(1.0)
}

// Assessments
model AssessmentAttempt {
  id String @id @default(cuid())
  userId String
  user User @relation(fields: [userId], references: [id])
  assessmentId String
  assessment Assessment @relation(fields: [assessmentId], references: [id])
  responses Json // question_id -> selected_answer
  score Float
  maxScore Float
  startedAt DateTime
  submittedAt DateTime?
  graderEmail String? // 'AI' or human email
  gradedAt DateTime?
  integritySignals Json // focus_lost_count, ip_changes, etc.
  plagiarismScore Float? // 0-100, higher = more suspicious
  status String @default("in_progress") // "in_progress", "submitted", "graded", "needs_review"
  createdAt DateTime @default(now())
}

// Cohorts & Sessions
model Cohort {
  id String @id @default(cuid())
  courseId String
  course Course @relation(fields: [courseId], references: [id])
  name String
  instructorEmail String
  taEmails String[] // CSV of TA emails
  learnerEmails String[] // CSV of learner emails
  startDate DateTime
  endDate DateTime
  schedule Json? // timezone, recurring_sessions[]
  status String @default("forming") // "forming", "active", "completed"
  maxLearners Int @default(30)
  mode String @default("hybrid") // "synchronous", "asynchronous", "hybrid"
  sessions ClassSession[]
  createdAt DateTime @default(now())
}

model ClassSession {
  id String @id @default(cuid())
  cohortId String
  cohort Cohort @relation(fields: [cohortId], references: [id])
  sessionType String // "lecture", "lab", "discussion", "review", "exam", "office_hours"
  title String
  description String?
  scheduledStart DateTime
  scheduledEnd DateTime
  actualStart DateTime?
  actualEnd DateTime?
  buildspacesRoomUrl String? // Link to BuildSpaces room
  recordingUrl String?
  attendance Json[] // { user_email, attended, duration_minutes, participation_score }
  materials Json[] // { title, url, type }
  status String @default("scheduled") // "scheduled", "in_progress", "completed", "cancelled"
  createdAt DateTime @default(now())
}

// Credentials
model Credential {
  id String @id @default(cuid())
  userId String
  user User @relation(fields: [userId], references: [id])
  type String // "course_completion", "program_completion", "skill_badge", "degree", "certificate"
  title String
  description String?
  issuerName String @default("Azora Sapiens")
  issuerUrl String?
  issuedDate DateTime
  expiryDate DateTime?
  courseId String?
  course Course? @relation(fields: [courseId], references: [id])
  programId String?
  program LearningPath? @relation(fields: [programId], references: [id])
  evidence Json // { final_score, hours_invested, projects_completed[] }
  skillsDemonstrated String[]
  credentialId String @unique // Unique verifiable ID
  verificationUrl String? // Public verification URL
  blockchainAnchor Json? // { enabled, transaction_hash, network }
  status String @default("active") // "active", "revoked", "expired"
  revocationReason String?
  metadata Json? // Custom metadata
  createdAt DateTime @default(now())
}

// Research Projects
model ResearchProject {
  id String @id @default(cuid())
  title String
  description String?
  principalInvestigator String // email
  teamMembers Json[] // { user_email, role }
  status String @default("proposal") // states listed in blueprint
  startDate DateTime?
  endDate DateTime?
  datasets Json[]
  outputs Json[]
  ethicsApproval Json? // { required, approved, approval_date, irb_reference }
  funding Json?
  visibility String @default("private") // "private", "institution", "public"
  createdAt DateTime @default(now())
}

// Audit Logs
model ConstitutionalAuditLog {
  id String @id @default(cuid())
  eventType String // "ai_interaction", "credential_issued", etc.
  userEmail String?
  aiAgent String?
  actionDescription String
  constitutionalPrinciples String[]
  alignmentScore Float? // 0-100
  truthScore Float? // 0-100
  ubuntuScore Float? // 0-100
  context Json? // course_id, lesson_id, cohort_id, session_id
  inputData String? // User input or query
  outputData String? // AI response
  flagged Boolean @default(false)
  flagReason String?
  reviewedBy String?
  reviewOutcome String? // "approved", "rejected", "corrected", "escalated"
  metadata Json? // ip_address, user_agent, session_id
  createdAt DateTime @default(now())
}
```

### 4.2 Existing Models (Extensions)

- **Course**: Add `skillIds[]`, `prerequisites[]`
- **Lesson**: Add `blooms_level`, `aligned_skills[]`
- **Enrollment**: Add `integrityFlags`, `tutorInteractions[]`, `lastEngagement DateTime`
- **Assessment**: Add `itemBank`, `proctoring_config`
- **Achievement**: Standardize and tie to PoV events

---

## 5. API Contract Examples

### 5.1 Tutoring API

```typescript
// POST /api/sapiens/tutor/session
{
  "courseId": "course-123",
  "lessonId": "lesson-456",
  "learnerContext": {
    "recentSessions": [...],
    "masteredSkills": [...],
    "strugglingWith": "calculus-derivatives"
  }
}

// Response
{
  "sessionId": "session-789",
  "tutorMessage": "I noticed you've been working on derivatives. Let's explore the power rule together...",
  "sourceReferences": [
    { "lessonId": "lesson-100", "title": "Power Rule Basics", "url": "..." }
  ],
  "alignmentScore": 0.95,
  "trustworthiness": "grounded",
  "auditLogId": "audit-xyz"
}

// POST /api/sapiens/tutor/session/{id}/message
{
  "userMessage": "Can you explain the chain rule?",
  "context": { ... }
}

// Response
{
  "aiResponse": "Great question! The chain rule tells us...",
  "sourceReferences": [...],
  "suggestedNextSteps": [
    { "type": "practice", "lessonId": "lesson-101" }
  ],
  "alignmentScore": 0.93,
  "auditLogId": "audit-xyz2"
}
```

### 5.2 Assessment API

```typescript
// POST /api/sapiens/assessment/attempt
{
  "assessmentId": "assessment-123",
  "learnerEmail": "student@azora.edu",
  "integrityLevel": "high" // "low", "medium", "high"
}

// Response
{
  "attemptId": "attempt-456",
  "questions": [
    { "id": "q1", "text": "...", "type": "multiple_choice", "options": [...] }
  ],
  "timeLimit": 3600,
  "allowedTools": ["calculator", "notes"],
  "proctorToken": "token-xyz" // For video proctoring
}

// POST /api/sapiens/assessment/attempt/{id}/submit
{
  "responses": { "q1": 2, "q2": "answer text" },
  "integritySignals": {
    "focusLostCount": 0,
    "ipChanges": 0,
    "suspiciousBehaviors": []
  }
}

// Response
{
  "score": 85,
  "maxScore": 100,
  "passed": true,
  "feedback": "Great job! You demonstrated mastery of...",
  "integrityReview": { "flagged": false },
  "tokensEarned": 50,
  "auditLogId": "audit-xyz3"
}
```

### 5.3 Credential API

```typescript
// POST /api/sapiens/credentials/issue
{
  "userId": "user-123",
  "type": "course_completion",
  "courseId": "course-123",
  "evidence": {
    "finalScore": 92,
    "hoursInvested": 45,
    "projectsCompleted": ["project-1", "project-2"]
  }
}

// Response
{
  "credentialId": "cred-789",
  "verificationUrl": "https://sapiens.azora.edu/verify/cred-789",
  "credentialJson": {
    "@context": "https://www.w3.org/2018/credentials/v1",
    "type": ["VerifiableCredential"],
    "issuer": "https://sapiens.azora.edu",
    "issuanceDate": "2025-12-10",
    "credentialSubject": { ... }
  },
  "blockchainAnchored": false, // Can be enabled
  "blockchainHash": null
}

// GET /api/sapiens/credentials/{id}/verify (public endpoint)
// Response: credential + verification status
```

### 5.4 Cohort API

```typescript
// POST /api/sapiens/cohorts
{
  "courseId": "course-123",
  "name": "Web Dev Bootcamp - Cohort A",
  "instructorEmail": "prof@azora.edu",
  "taEmails": ["ta1@azora.edu"],
  "startDate": "2025-01-15",
  "endDate": "2025-03-30",
  "maxLearners": 40
}

// Response
{
  "cohortId": "cohort-123",
  "name": "Web Dev Bootcamp - Cohort A",
  "status": "forming",
  "enrollmentUrl": "https://sapiens.azora.edu/cohorts/cohort-123/enroll"
}

// POST /api/sapiens/cohorts/{id}/sessions
{
  "sessionType": "lecture",
  "title": "HTML & CSS Fundamentals",
  "scheduledStart": "2025-01-15T10:00:00Z",
  "scheduledEnd": "2025-01-15T12:00:00Z"
}

// Response
{
  "sessionId": "session-456",
  "buildspacesRoomUrl": "https://buildspaces.azora.edu/rooms/classroom-xyz"
}
```

---

## 6. Constitutional Integration Points

Every significant action in Sapiens goes through constitutional validation:

### 6.1 Pre-Checks (Before action)

**Assessment starting**:
1. Verify learner is enrolled and eligible for attempt
2. Check integrity level matches assessment requirements
3. Validate against policy-as-code (FERPA, accessibility, security)

**AI tutor response**:
1. Validate response is grounded in course materials (Knowledge Ocean)
2. Check for fabricated citations, uncertainties disclosed
3. Score for truthfulness, fairness, and constitutional alignment
4. Log full interaction with context

**Credential issuance**:
1. Verify learner earned the credential (assessment passed, requirements met)
2. Validate issuer authority and credential type
3. Check data privacy (no sensitive student info exposed)
4. Log issuance with signature and timestamp

### 6.2 Post-Checks (After action)

**After assessment grading**:
1. Log grades change in audit log (who, what, when, why)
2. Detect grade anomalies (suspiciously high/low)
3. Trigger PoV processor if passed

**After tutoring session**:
1. Score tutor response for alignment
2. Log metrics: latency, relevance, user satisfaction
3. Aggregate for tutor efficacy dashboards

**After credential issuance**:
1. Record issuance in immutable audit log
2. Optional: anchor to blockchain
3. Notify learner and update transcript

### 6.3 Audit Trail Example

```json
{
  "eventId": "event-xyz",
  "eventType": "assessment_submitted",
  "timestamp": "2025-12-10T14:32:01Z",
  "userId": "user-123",
  "courseId": "course-123",
  "assessmentId": "assessment-456",
  "action": "Learner submitted exam attempt with score 92%",
  "constitutionalPrinciples": [
    "Integrity & No Mock",
    "Truth is Currency",
    "Ubuntu: Community Learning"
  ],
  "integritySignals": {
    "proctorVerified": true,
    "focusLostCount": 0,
    "plagiarismScore": 5,
    "suspicious": false
  },
  "alignmentScore": 0.98,
  "truthScore": 1.0,
  "ubuntuScore": 0.85,
  "reviewedBy": null, // Auto-approved
  "reviewOutcome": "approved",
  "auditLogUrl": "https://sapiens.azora.edu/audit/event-xyz",
  "metadata": {
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "sessionId": "session-123"
  }
}
```

---

## 7. Component Integration Checklist

- [ ] **Config & API Client**
  - [ ] Create `packages/sapiens-api-client/` replacing base44
  - [ ] Update `apps/azora-sapiens/src/config.ts` with real endpoints
  - [ ] Implement Auth Core integration (NextAuth)

- [ ] **Elara Tutor Integration**
  - [ ] Import `ElaraAgent` from `@azora/shared-ai`
  - [ ] Update `ElaraTutor` component to use real agent lifecycle
  - [ ] Add constitutional validation hooks to tutor responses
  - [ ] Log all interactions with alignment scores

- [ ] **Enrollment & Course Services**
  - [ ] Hook enrollment creation to ConstitutionalEngine
  - [ ] Integrate course listing with Education service
  - [ ] Add curriculum graph queries

- [ ] **Assessment & Exam Mode**
  - [ ] Wire exam integrity signals to assessment API
  - [ ] Add proctoring token generation
  - [ ] Implement plagiarism detection middleware
  - [ ] Log integrity signals to ConstitutionalAuditLog

- [ ] **Credentials & PoV**
  - [ ] Implement credential issuance on course completion
  - [ ] Wire PoV processor for education events
  - [ ] Optional: blockchain anchoring
  - [ ] Add verification endpoint

- [ ] **Cohorts & Collaboration**
  - [ ] Implement cohort CRUD endpoints
  - [ ] Integrate with BuildSpaces for classroom rooms
  - [ ] Add attendance tracking
  - [ ] Wire class session scheduling

- [ ] **Observability & Dashboards**
  - [ ] Add Prometheus metrics for Sapiens services
  - [ ] Create Grafana dashboards (learning outcomes, risk, tutor efficacy)
  - [ ] Implement alertmanager rules for SLOs
  - [ ] Write runbooks for incidents

- [ ] **Compliance & Privacy**
  - [ ] Implement policy-as-code for FERPA/GDPR/POPIA
  - [ ] Add data retention & anonymization policies
  - [ ] Create privacy control UI
  - [ ] Test with OWASP checklist

---

## 8. Citadel-Dev Mapping

This integration directly executes the following citadel-dev tasks:

**From `citadel-dev/blueprints/sapiens/SAPIENS-TASKLIST.md`**:
- SAP-1.1: Curriculum Graph Schema & Storage
- SAP-1.2: Curriculum Graph Editor UI
- SAP-2.1: Unified Learner Profile Aggregator
- SAP-2.2: Tutor Session Orchestration API
- SAP-3.1: Assessment Bank & Attempt Models
- SAP-3.2: Exam Mode UI & Lockdown
- SAP-4.1: Credential Schemas & Issuance API
- SAP-5.1: Cohort & ClassSession Services
- SAP-6.1: Research Project Model & Workspace
- SAP-7.1: Educator Studio Shell
- SAP-8.1: Educational Records Policy-as-Code
- SAP-8.2: Sapiens Observability Pack

**From `citadel-dev/MASTER-IMPLEMENTATION-TASKLIST.md`** (cross-domain):
- AI-1: Model Router & Provider Abstraction
- AI-2: Embedding Store & RAG Kernel
- CAI-1: Constitutional Validation Framework
- DATA-1: Unified Data Schema & Migrations
- OBS-1: Observability Baseline
- SEC-2: Education Privacy & Compliance

---

## 9. Success Metrics (Definition of Done)

### Functional

- [ ] All 9 pages render with real data from Azora services
- [ ] Enrollment flow works end-to-end: user enrolls → LMS records it → PoV processor awards tokens
- [ ] Tutoring sessions logged with constitutional alignment scores (≥0.90 average)
- [ ] Exams completed with integrity signals captured and validated
- [ ] Credentials issued and verifiable via public API
- [ ] Cohorts created, sessions scheduled, attendance tracked

### Non-Functional

- [ ] API latency: p95 ≤ 200ms for read operations, ≤ 500ms for writes
- [ ] Availability: 99.9% SLO for core flows (enrollment, learning, assessment)
- [ ] Data consistency: 100% audit trail coverage for sensitive actions
- [ ] Constitutional alignment: 100% of AI tutor responses logged & validated
- [ ] Security: passes OWASP top 10, zero critical vulnerabilities
- [ ] Compliance: FERPA/GDPR/POPIA checks enforced in policy-as-code

### Observability

- [ ] Grafana dashboards show: learning outcomes, at-risk learners, tutor efficacy, system health
- [ ] Alerts fire for: assessment outages, tutor degradation, data anomalies
- [ ] Runbooks exist for: top 5 incident types with clear remediation steps

---

## 10. Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Data model mismatch between old DB and Prisma | High | High | Comprehensive schema audit upfront; migration scripts with validation |
| AI tutor responses not properly grounded | Medium | High | Mandatory Knowledge Ocean integration; validation tests; human review initially |
| Integrity signals missing in production exams | Medium | High | Logging at application level; fallback to manual review; audit trail immutable |
| PoV rules create perverse incentives | Low | High | Clear policy documentation; audits for abuse patterns; learner feedback loops |
| Regional compliance issues (GDPR/POPIA) | Medium | Medium | Policy-as-code templates; legal review; regional configuration flags |
| Performance degradation with scale (10k+ concurrent) | Low | High | Load testing early; caching strategy (Redis); database indexes; read replicas |
| Educator adoption low | Medium | Low | UX research; trainer program; onboarding cohorts; feedback channels |

---

## 11. Success Timeline

| Phase | Weeks | Deliverables | Go-Live % |
|-------|-------|-------------|----------|
| 1. API & Data | 1-2 | Core APIs, Prisma models | 0% (internal) |
| 2. Agents & Tutoring | 3-4 | Elara tutor, constitutional logging | 10% (beta) |
| 3. Assessment & Integrity | 5-6 | Exam mode, proctoring, plagiarism | 25% (beta) |
| 4. Credentials & PoV | 7-8 | Credential issuance, PoV processor | 50% (beta) |
| 5. Educator & Collaboration | 9-10 | Studio, cohorts, live classes | 75% (beta) |
| 6. Research & Advanced | 11-12 | Research projects, advanced AI | 90% (beta) |
| 7. Compliance & Observability | 13-14 | Policies, dashboards, runbooks | 95% (pre-prod) |
| 8. Launch & Hardening | 15-16 | Testing, audit, go-live | 100% (production) |

---

## Appendix: File Structure (New & Modified)

```
/workspaces/azora/
├── apps/azora-sapiens/
│   ├── src/
│   │   ├── services/
│   │   │   ├── api-client.ts (NEW - replaces base44)
│   │   │   ├── elara-agent.ts (UPDATED - real agent)
│   │   │   ├── tutoring-service.ts (NEW)
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── ElaraTutor.tsx (UPDATED)
│   │   │   ├── ExamModeView.tsx (NEW)
│   │   │   ├── EducatorStudio.tsx (NEW)
│   │   │   └── ...
│   │   └── config.ts (UPDATED)
│   └── package.json (UPDATED - add real dependencies)
│
├── services/
│   ├── sapiens-tutor/ (NEW)
│   │   ├── src/
│   │   │   ├── tutoring-engine.ts
│   │   │   ├── routes/tutor.ts
│   │   │   └── ...
│   │   ├── prisma/schema.prisma
│   │   └── package.json
│   │
│   ├── sapiens-cohorts/ (NEW)
│   │   ├── src/
│   │   │   ├── cohort-service.ts
│   │   │   ├── routes/cohorts.ts
│   │   │   └── ...
│   │   ├── prisma/schema.prisma
│   │   └── package.json
│   │
│   ├── credentialing/ (NEW)
│   │   ├── src/
│   │   │   ├── credential-issuer.ts
│   │   │   ├── routes/credentials.ts
│   │   │   └── ...
│   │   ├── prisma/schema.prisma
│   │   └── package.json
│   │
│   ├── education-lms/ (RENAMED from Education Service, UPDATED)
│   │   └── ... (add SAP models, curriculum endpoints)
│   │
│   ├── sapiens-analytics/ (NEW)
│   │   ├── src/
│   │   │   ├── analytics-engine.ts
│   │   │   └── ...
│   │   └── package.json
│   │
│   └── azora-mint/ (UPDATED - add education PoV rules)
│
├── packages/
│   ├── sapiens-api-client/ (NEW)
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── types.ts
│   │   │   └── ...
│   │   └── package.json
│   │
│   ├── shared-ai/ (UPDATED - ensure ElaraAgent exported)
│   │   └── agents/elara.ts (VERIFIED)
│   │
│   └── azora-ui/ (UPDATED - add Sapiens-specific components)
│
├── prisma/
│   ├── schema.prisma (UPDATED - add SAP models)
│   └── migrations/
│       ├── 20251210_add_curriculum_graph/
│       ├── 20251210_add_assessment_attempts/
│       ├── 20251210_add_cohorts/
│       ├── 20251210_add_credentials/
│       ├── 20251210_add_research_projects/
│       └── 20251210_add_audit_logs/
│
├── monitoring/
│   ├── grafana/
│   │   ├── dashboards/
│   │   │   ├── sapiens-learning-outcomes.json (NEW)
│   │   │   ├── sapiens-risk-dashboard.json (NEW)
│   │   │   ├── sapiens-tutor-efficacy.json (NEW)
│   │   │   └── ...
│   │   └── provisioning/
│   │
│   └── alertmanager/
│       └── sapiens-alerts.yml (NEW)
│
├── citadel-dev/
│   ├── blueprints/sapiens/
│   │   ├── SAPIENS-BLUEPRINT.md (EXISTING)
│   │   ├── SAPIENS-TASKLIST.md (EXISTING)
│   │   └── SAPIENS-INTEGRATION-ARCHITECTURE.md (THIS FILE)
│   │
│   └── tasks/ (UPDATE with Sapiens progress)
│
└── docs/
    ├── sapiens-api.md (NEW)
    ├── sapiens-educator-guide.md (NEW)
    └── sapiens-runbooks.md (NEW)
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-10 | AI Integration | Initial architecture & roadmap |

