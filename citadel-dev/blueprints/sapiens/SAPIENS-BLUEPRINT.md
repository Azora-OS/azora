# Azora Sapiens – Domain Blueprint (Deep Dive)

> Status: Skeleton v0.1
> Linked master docs:
> - `citadel-dev/MASTER-ARCHITECTURE-BLUEPRINT.md`
> - `citadel-dev/MASTER-IMPLEMENTATION-TASKLIST.md` (SAP-* tasks)

This document will provide a full C4 view, domain model, runtime and data architecture, AI orchestration flows, security/compliance posture, observability, and PoV hooks for the Sapiens (AI-first school+university) domain.

Planned sections:
- 1. Mission & World-Class Benchmarks (comparison to leading online universities)
- 2. C4 Views (System, Container, Component) specific to Sapiens
- 3. Domain Model (curriculum graph, cohorts, classrooms, exams, research, credentials)
- 4. Runtime Topology & Scaling (cohorts, live classes, global regions)
- 5. Data Architecture & Privacy (student records, assessments, research data)
- 6. AI Orchestration (tutoring, exam integrity, research assistants)
- 7. Security, Compliance, and Ethics (FERPA/GDPR/POPIA framing)
- 8. Observability & Educational Metrics
- 9. PoV & Minting Hooks for Learning and Teaching
- 10. Risks, Unknowns, and Bolt Register (Sapiens-specific)

## 1. Mission & World‑Class Benchmarks

**Mission**: Build an AI‑first school + university that:

- Delivers personalized, mastery‑based learning from foundational skills to advanced research.
- Uses AI to augment (not replace) educators, with full transparency and recourse.
- Embeds economic value (PoV + AZR) into learning, teaching, and contribution.
- Meets or exceeds the UX, reliability, and outcomes of leading platforms (Coursera, edX, Minerva‑style active learning, Khan Academy, O’Reilly Learning) while adding Azora’s AI and PoV layers.

**World‑class benchmark dimensions**:

- **Curriculum graph**: Explicit learning paths; prerequisites; skills taxonomy; cross‑domain connections.
- **Cohorts & classrooms**: Live & async modes, group projects, peer review, mentoring.
- **Assessment & integrity**: High‑stakes exams with robust identity, proctoring, anomaly detection.
- **Educator tooling**: Course authoring, analytics, A/B testing of materials, at‑risk learner detection.
- **Research & labs**: Data access, tools, and governance for student and faculty research projects.
- **Credentials & pathways**: Micro‑credentials, degrees, professional pathways, stackable proofs.
- **AI integration**: Tutors, explainers, research assistants, coaches, and career agents.

Sapiens must match these, and add:

- Explicit **constitutional AI** constraints and logging on all AI‑mediated decisions.
- **PoV‑driven incentives**: measurable value from learning, teaching, and mentoring.

> Assumption S‑A1: We target global learners 16+ initially (high school senior to adult), with optional younger learners later. FERPA‑style student protections and GDPR/POPIA constraints apply.

---

## 2. C4 Views for Sapiens

### 2.1 System Context

**Primary actors**:

- **Learner**: individual student; interacts via BuildSpaces Sapiens views and public portal.
- **Educator**: instructor, TA, mentor; creates/curates content; manages cohorts.
- **Institution Admin**: configures programs, policies, and reporting; often via Enterprise Suite.
- **AI Tutors & Assistants**: Elara + specialized agents (tutor, explainer, coach, researcher).
- **External Systems**: IdPs (SSO), payment providers, accreditation bodies, employers.

**Sapiens system** sits within Azora OS and connects to:

- **Virtual Citadel / BuildSpaces** (`apps/azora-buildspaces/`): Sapiens learning rooms and flows.
- **Education/LMS microservice** (Education Service, `prisma` LMS models).
- **AI Family & Knowledge Ocean** (RAG, personas, AI tutors).
- **Library** (content ingestion, research materials, licensing, provenance).
- **Marketplace & Mint & Pay** (jobs, internships, payments, PoV rewards).
- **Enterprise Suite** (org contracts, SSO/SCIM, analytics exports).

High‑level example flow:

1. Learner logs in (Auth Core) → enters Sapiens home via BuildSpaces.
2. Sapiens recommends a learning path and room (e.g., “Foundations”, “Project Lab”).
3. Learner consumes content, interacts with AI tutor, attends live sessions.
4. LMS records progress; assessments update mastery; PoV processor awards value.
5. Data flows into analytics, Enterprise dashboards, and PoV/Mint & Pay streams.

### 2.2 Container View

Key Sapiens‑related containers (logical):

- **Sapiens Frontend** (within `apps/azora-buildspaces/`):
  - Pages for: home/dashboard, curriculum explorer, classroom, exam mode, educator studio.
  - Integrates with BuildSpaces Lobby and rooms (Classroom Room, Exam Room, Lab Room).

- **LMS Service** (Education Service; Prisma models under `prisma/schema.prisma`):
  - Manages **Course**, **CourseModule**, **Enrollment**, **Assessment**, **LearningPath**, progress, grades.
  - Exposes REST/gRPC APIs for CRUD and reporting.

- **Tutoring & Assessment Engine** (`services/sapiens-tutor/` – planned):
  - Orchestrates AI tutors, hints, and explanations.
  - Generates and evaluates questions; runs adaptive quizzes and exams.
  - Coordinates with AI Ethics Monitor for content safety and fairness.

- **Classroom & Cohort Service** (`services/sapiens-cohorts/` – planned):
  - Manages cohorts, class sessions, schedules, group membership, and attendance.
  - Integrates with BuildSpaces Collaboration Pod and Innovation Theater for live sessions.

- **Credentialing Service** (`services/credentialing/` – planned):
  - Issues verifiable credentials and proofs of learning.
  - Integrates with Mint & Pay and PoV processor.

- **Sapiens Analytics Service** (`services/sapiens-analytics/` – planned):
  - Aggregates learning metrics and risk signals.
  - Exposes dashboards and exports to Enterprise Suite.

All these depend on **AI Family & Knowledge Ocean**, **Library**, **Mint & Pay**, and **Constitutional AI Core** containers described in the master blueprint.

### 2.3 Component View (Selected)

**Sapiens Frontend** components:

- `SapiensHome`: learner overview, recommendations, current courses, PoV summary.
- `CurriculumGraphView`: visual map of skills, modules, prerequisites.
- `ClassroomView`: room shell for lessons; supports content, chat, AI tutor panel, and collaboration.
- `ExamModeView`: locked‑down UI for assessments, with proctoring indicators.
- `EducatorStudio`: course authoring, content upload, grading and feedback tools.

**Tutoring & Assessment Engine** components:

- `ProfileAggregator`: builds learner state (courses, performance, interests, AI interactions) from LMS + AI Family.
- `RecommendationEngine`: chooses next lessons, practice tasks, or projects.
- `QuestionGenerator`: uses AI + item bank to generate questions aligned to objectives.
- `ExamController`: configures exam sessions, time limits, allowed tools, and proctoring.
- `FeedbackGenerator`: crafts explanations, hints, summaries grounded in Knowledge Ocean.

**Classroom & Cohort Service**:

- `CohortManager`: maintains membership, roles, and state of cohorts.
- `SessionScheduler`: handles timeslots, recurrent classes, time zones.
- `AttendanceTracker`: logs presence and participation, integrates with BuildSpaces events.

**Credentialing Service**:

- `CredentialIssuer`: binds achievements to credential artifacts (JSON‑LD/VC‑style, plus on‑chain anchors as needed).
- `VerificationAPI`: lets external verifiers check credential authenticity.

---

## 3. Domain Model

Sapiens builds on `prisma/schema.prisma` and extends it.

### 3.1 Key Aggregates

- **Learner** (User):
  - Identified by `User` with role STUDENT.
  - Has enrollments, assessments, token balances, AI interactions, PoV records.

- **Course**:
  - `Course`, `CourseModule` (and future `Lesson` model) define structure.
  - Linked to skills and objectives; part of learning paths.

- **Learning Path / Program**:
  - `LearningPath` (existing model) extended to represent multi‑course programs.
  - Encodes prerequisites, target skills, estimated effort.

- **Cohort & ClassSession** (new models):
  - `Cohort`: learners + educators grouped by course/program.
  - `ClassSession`: scheduled events (lectures, labs, reviews) mapped to BuildSpaces rooms.

- **Assessment & Attempt**:
  - `Assessment` (existing model) + planned `AssessmentAttempt` entity.
  - Stores question sets, responses, scoring, proctoring artifacts.

- **Credential**:
  - New `Credential` and `CredentialIssueEvent` models.
  - Linked to courses/programs, assessments, and PoV.

- **ResearchProject**:
  - New model connecting learners/educators to datasets, outputs, and constraints.

### 3.2 Domain Events (examples)

- `LearnerEnrolled`, `LessonCompleted`, `AssessmentSubmitted`, `AssessmentGraded`, `CourseCompleted`, `ProgramCompleted`.
- `LiveSessionScheduled`, `LiveSessionAttended`, `CohortFormed`, `CohortDissolved`.
- `CredentialIssued`, `CredentialRevoked`.
- `TutorIntervention`, `AtRiskLearnerDetected`.

These flow via Kafka to Sapiens Analytics, PoV Processor, Enterprise Suite, and Governance.

---

## 4. Runtime Topology & Scaling

- **Multi‑region deployment** for learners near Africa, Europe, and global nodes.
- **Classroom scaling**:
  - Live sessions use BuildSpaces Collaboration Pods and Innovation Theater rooms.
  - WebRTC/media servers scale independently of core LMS APIs.
- **Cohort‑aware caching**:
  - Read‑heavy patterns (course metadata, assignments) cached by cohort and region.
- **Exam scaling & resilience**:
  - Exams served from dedicated endpoints with stricter SLIs.
  - State replicated and backed up more aggressively around exam windows.

---

## 5. Data Architecture & Privacy

**PII & Educational Records**:

- Student identity, contact, enrollment, assessments, accommodations, and PoV‑relevant learning data are high‑sensitivity.
- Configurable retention by region and program (e.g., min 5–7 years; anonymization after expiry).

**Storage layout**:

- Operational DB: Prisma Postgres for LMS entities, cohorts, credentials.
- Object storage: S3/R2 for lecture recordings, assignments, research artifacts.
- Analytics: separate warehouse (e.g., Redshift/BigQuery/Snowflake) populated by ETL/ELT.

**Privacy by design**:

- Role‑based, least‑privilege access to educational records.
- Pseudonymization in analytics; opt‑out and data export controls for learners.
- Region‑based data residency constraints; program‑level settings.

> Assumption S‑A2: Azora will adopt FERPA‑like protections and map GDPR/POPIA requirements into standard templates. This will be confirmed with legal and recorded in policy‑as‑code.

---

## 6. AI Orchestration in Sapiens

**Tutoring flows**:

- Sapiens Frontend passes learner context (recent lessons, difficulties, preferences) to `services/sapiens-tutor/`.
- Tutor engine uses AI Family (Elara + specialist tutor personas) with Knowledge Ocean grounding.
- All tutoring content must be:
  - Grounded in approved materials (Library + course content).
  - Labeled with uncertainty when data is missing.
  - Logged with context for auditing.

**Exam integrity**:

- Exam Mode enforces:
  - Restricted tools (no general chat agents, only specific allowed helpers or none).
  - Environmental checks (browser focus, suspicious behaviors) and optional proctoring.
- AI is used for anomaly detection and plagiarism similarity checks.
- Constitutional pipeline ensures no AI agent leaks answers or undermines fairness.

**Research assistants**:

- Sapiens integrates AI research agents that:
  - Help design experiments, literature reviews, and data analysis.
  - Operate under stricter citation and provenance requirements.
  - Must never fabricate citations; library integration enforces real sources.

---

## 7. Security, Compliance, and Ethics

- **Regimes**: GDPR, POPIA, FERPA‑like educational record rules, and any regional schooling laws.
- **Security**:
  - Strong auth (MFA where appropriate); device and session checks for exams.
  - Encryption at rest and in transit; field‑level encryption for particularly sensitive data.
- **Ethics**:
  - AI tutors must disclose they are AI and allow escalation to human educators.
  - Ethically sensitive scenarios (mental health, discrimination, safety) routed to specialized flows or humans.
- **Auditability**:
  - All AI interventions tagged, stored, and queryable for disputes.
  - Credential issuance logs can be audited by internal and external bodies.

---

## 8. Observability & Educational Metrics

**Core Sapiens metrics**:

- Learning outcomes: mastery per objective, pass rates, time‑to‑mastery, drop‑off rates.
- Engagement: session duration, active days/week, participation in cohorts.
- Risk: at‑risk learner score based on inactivity, low performance, sentiment.
- Tutor efficacy: comparisons between AI vs human vs hybrid interventions.

**SRE metrics**:

- Availability and latency for LMS APIs, exam endpoints, and tutoring engine.
- Error rates for content delivery, AI calls, and credential issuance.

Dashboards and alerts for Sapiens will live in `monitoring/grafana/` and be owned jointly by Sapiens and SRE squads.

---

## 9. PoV & Minting Hooks for Learning and Teaching

Sapiens maps educational value to PoV and AZR via:

- **Learner achievements**: course and program completions, high‑quality projects, peer recognition.
- **Teaching contributions**: new courses, high learner ratings, mentoring hours, content improvements.
- **Community contributions**: peer answers, collaborative projects, reviewer roles.

Mechanics:

1. LMS and Sapiens services emit events (`CourseCompleted`, `CredentialIssued`, `TutorInterventionRated`, etc.).
2. `services/pov-processor/` consumes these events and applies program‑specific rules.
3. Validated PoV triggers TokenTransaction updates and, when appropriate, AZR minting via `AZRToken`.
4. All PoV events are traceable back to underlying learning data and policies.

---

## 10. Sapiens‑Specific Bolt Register and Unknowns

**Bolts (loose points)**:

- **S‑B1**: LMS schema duplication (Prisma vs legacy SQL) – see global Bolt B‑3.
- **S‑B2**: No standard way yet to represent curriculum graphs and prerequisites in the DB.
- **S‑B3**: Exam integrity tooling not yet implemented; risk of under‑specifying proctoring and anomaly detection.
- **S‑B4**: AI tutor behavior policies (age ranges, escalation rules) not fully defined across regions.
- **S‑B5**: PoV rules for education may create perverse incentives if not carefully tuned (e.g., over‑optimization for token earning instead of learning).

**Unknowns & decisions (examples)**:

- Age ranges and regulatory boundaries to support in v1 vs later phases.
- Accreditation partnerships and how deep to go on degree‑level programs in early phases.
- Target mix of synchronous vs asynchronous learning in key programs.

Each bolt and unknown is mapped to concrete SAP‑* and CAI‑*/DATA‑* tasks in SAPIENS-TASKLIST and the master task list.
