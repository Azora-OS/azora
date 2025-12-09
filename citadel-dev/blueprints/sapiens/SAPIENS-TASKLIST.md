# Azora Sapiens – Domain Implementation Task List

> Status: Draft v0.1 (deep dive)
> Linked master task list: `citadel-dev/MASTER-IMPLEMENTATION-TASKLIST.md` (SAP-* tasks)

Each task block follows the master pattern (Objective, Dependencies, Steps, Acceptance, Verification, Artifacts, Ownership, Effort, Priority, Repo paths) but scoped to Sapiens.

---

## 1. Curriculum Graph & Content Tooling

### 1.1 Canonical Curriculum Graph Model

- [ ] **SAP-1.1: Curriculum Graph Schema & Storage (Bolt S‑B2)**  
  **Objective**: Design and implement a canonical data model for curriculum graphs (skills, modules, prerequisites) aligned with Prisma and Sapiens blueprint §3.  
  **Parent**: SAP-1, DATA-1 (master).  
  **Dependencies**: `prisma/schema.prisma` (Course, CourseModule, LearningPath); Sapiens blueprint §3.1; Library models for skills.  
  **Steps**:  
  - Extend Prisma with `Skill`, `LearningObjective`, `CurriculumEdge` (prerequisite, recommendation, equivalence).  
  - Define versioning strategy for curriculum graphs (draft vs published).  
  - Migrate any existing implicit relationships (e.g., in JSON fields) into structured models.  
  **Acceptance criteria**:  
  - Can represent at least 3 programs end‑to‑end (e.g., Web Dev, AI Foundations, Financial Literacy) as graphs.  
  - Graph queries (prereqs, recommended next nodes) are performant and type‑safe.  
  **Verification**:  
  - Unit tests for graph queries and integrity constraints.  
  - Data migration tests from legacy representations.  
  **Artifacts**: Prisma migration, schema docs, example graph definitions.  
  **Ownership**: Sapiens + Data Platform squads.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `prisma/schema.prisma`, `services/sapiens-analytics/` (graph queries), `docs/`.

### 1.2 Curriculum Authoring Tools

- [ ] **SAP-1.2: Curriculum Graph Editor UI**  
  **Objective**: Provide an in‑browser graph editor for educators to design and maintain curricula.  
  **Dependencies**: SAP-1.1; Sapiens Frontend in BuildSpaces; design system (`packages/azora-ui/`).  
  **Steps**:  
  - Build `CurriculumGraphEditor` component with drag‑and‑drop nodes and edges.  
  - Support tagging of nodes with skills, difficulty, duration, and content links.  
  - Integrate with Library to attach reading/video/problem resources.  
  **Acceptance criteria**:  
  - Educator can create, edit, and publish a learning path with >50 nodes.  
  - Graph validation errors (cycles, missing prerequisites) surfaced clearly.  
  **Verification**:  
  - UI tests for common editing flows.  
  - Snapshot tests for graph JSON payloads.  
  **Artifacts**: Frontend components, API contracts, educator documentation.  
  **Ownership**: Sapiens UX + Library squads.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `apps/azora-buildspaces/`, `packages/azora-ui/`, `services/sapiens-analytics/`.

---

## 2. Adaptive Tutoring Engine

### 2.1 Learner Profile & Signals

- [ ] **SAP-2.1: Unified Learner Profile Aggregator**  
  **Objective**: Implement a profile aggregator that combines LMS data, AI interactions, and PoV into a single learner state used by tutors.  
  **Parent**: SAP-2, AI-1, AI-2.  
  **Dependencies**: LMS models, `ChatSession`, `AIFamilyInteraction`, PoV events.  
  **Steps**:  
  - Define profile schema (skills, mastery estimates, pace, preferences, risk indicators).  
  - Implement service `ProfileAggregator` within `services/sapiens-tutor/` or as a shared module.  
  - Expose profile via internal API for AI tutors and analytics.  
  **Acceptance criteria**:  
  - Tutor engine can retrieve profiles for 10k+ learners with P95 latency < 150ms.  
  - Profiles update within minutes of significant events (assessment, AI session).  
  **Verification**:  
  - Unit tests for profile computation.  
  - Load tests for profile reads/writes.  
  **Artifacts**: Profile schema, API docs, metrics dashboards.  
  **Ownership**: Sapiens + AI Platform squads.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `services/sapiens-tutor/`, `services/ai-family-api/`, `services/knowledge-ocean/`.

### 2.2 Tutor Flow Orchestration

- [ ] **SAP-2.2: Tutor Session Orchestration API**  
  **Objective**: Provide a robust API for starting, continuing, and summarizing tutoring sessions powered by AI Family + Knowledge Ocean.  
  **Dependencies**: AI-1, AI-2, CAI-1, Sapiens blueprint §6.  
  **Steps**:  
  - Define session lifecycle (start, update, close, escalate to human).  
  - Integrate with AI Family multi‑persona service with tutor personas.  
  - Enforce grounding policies and Ethics Monitor checks on all responses.  
  **Acceptance criteria**:  
  - Learners can engage in multi‑turn tutoring sessions across different lessons.  
  - All responses are logged with provenance and alignment scores.  
  **Verification**:  
  - E2E tests for typical tutoring journeys.  
  - Alignment scoring dashboards and alert thresholds.  
  **Artifacts**: Tutor APIs, flows, test scenarios.  
  **Ownership**: Sapiens + Constitutional AI squads.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `services/sapiens-tutor/`, `services/ai-family-api/`, `services/ai-ethics-monitor/`.

---

## 3. Assessment & Exam Integrity

### 3.1 Assessment Modeling & Bank

- [ ] **SAP-3.1: Assessment Bank & Attempt Models**  
  **Objective**: Extend existing `Assessment` support with item bank, randomized variants, and attempt tracking.  
  **Parent**: SAP-1, SAP-2.  
  **Dependencies**: `Assessment` model; tutoring engine; Knowledge Ocean.  
  **Steps**:  
  - Introduce `AssessmentItem`, `AssessmentAttempt` models in Prisma.  
  - Support item tagging (difficulty, skill, Bloom level, format).  
  - Implement CRUD endpoints for banks and attempts.  
  **Acceptance criteria**:  
  - Can generate randomized but equivalent quiz variants.  
  - Attempts tracked with clear history and scoring.  
  **Verification**:  
  - Unit tests for scoring and randomization; migration tests.  
  **Artifacts**: DB migrations, API docs, educator docs.  
  **Ownership**: Sapiens squad.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `prisma/schema.prisma`, `services/sapiens-tutor/`, `services/sapiens-cohorts/`.

### 3.2 Exam Mode & Integrity Signals

- [ ] **SAP-3.2: Exam Mode UI & Lockdown**  
  **Objective**: Implement locked‑down exam mode in Sapiens Frontend with clear UX and technical controls.  
  **Dependencies**: BuildSpaces rooms; browser APIs; Auth Core.  
  **Steps**:  
  - Build `ExamModeView` with restricted navigation and visible status indicators.  
  - Hook into browser APIs (where allowed) for focus and tab‑change detection.  
  - Log integrity events for downstream anomaly analysis.  
  **Acceptance criteria**:  
  - Exams can be configured as “high integrity”; exam UI enforces rules.  
  - Integrity logs captured for 100% of high‑stakes attempts.  
  **Verification**:  
  - E2E exams tests; manual adversarial attempts.  
  - Integrity dashboard verifies signal rates.  
  **Artifacts**: UI components, logs schema, runbooks.  
  **Ownership**: Sapiens + Security squads.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `apps/azora-buildspaces/`, `services/sapiens-tutor/`, `monitoring/`.

---

## 4. Credentialing & Proof-of-Learning

- [ ] **SAP-4.1: Credential Schemas & Issuance API**  
  **Objective**: Design credential formats and APIs for issuing, verifying, and revoking educational credentials.  
  **Parent**: SAP-3, PAY-2.  
  **Dependencies**: Credentialing Service; blockchain contracts; LMS data.  
  **Steps**:  
  - Define credential types (course completion, program, specialization, teaching awards).  
  - Implement issuance workflows tied to LMS/assessment events.  
  - Add optional on‑chain anchoring via PoV processor and AZR token.  
  **Acceptance criteria**:  
  - Credentials can be verified by external parties via API.  
  - Revocation paths are clearly defined and implemented.  
  **Verification**:  
  - API tests; cryptographic verification tests where applicable.  
  **Artifacts**: Schemas, OpenAPI specs, verification docs.  
  **Ownership**: Sapiens + Mint squads.  
  **Effort**: L  
  **Priority**: P2  
  **Repo paths**: `services/credentialing/`, `services/mint-pay/`, `blockchain/`.

---

## 5. Classrooms, Cohorts, and Collaboration

- [ ] **SAP-5.1: Cohort & ClassSession Services**  
  **Objective**: Implement cohort and class session management to support live and async classrooms.  
  **Parent**: SAP-1, BS-2.  
  **Dependencies**: BuildSpaces; Prisma; Sapiens blueprint §3.1.  
  **Steps**:  
  - Add `Cohort` and `ClassSession` models.  
  - Implement cohort CRUD and enrollment flows (self‑join, invite, enterprise‑provisioned).  
  - Integrate class sessions with BuildSpaces rooms and schedules.  
  **Acceptance criteria**:  
  - Educator can create a cohort, schedule sessions, and see attendance.  
  - Learners see upcoming classes in dashboard.  
  **Verification**:  
  - Integration tests for cohort and session APIs.  
  - UI tests for creating and joining cohorts.  
  **Artifacts**: Service code, schemas, UI flows, runbooks.  
  **Ownership**: Sapiens + BuildSpaces squads.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `services/sapiens-cohorts/`, `prisma/schema.prisma`, `apps/azora-buildspaces/`.

---

## 6. Research Tools & AI Assistants

- [ ] **SAP-6.1: Research Project Model & Workspace**  
  **Objective**: Provide a structured way for learners and educators to run research projects with proper governance.  
  **Dependencies**: Library; Knowledge Ocean; AI assistants; Sapiens blueprint §3.1.  
  **Steps**:  
  - Add `ResearchProject` model with owners, datasets, objectives, compliance flags.  
  - Create project workspaces mapped to BuildSpaces AI Studio and Design Studio.  
  - Integrate with Library for citation management and dataset access.  
  **Acceptance criteria**:  
  - At least 3 pilot research projects can be fully tracked in Sapiens.  
  - Data access is logged and governed by project policies.  
  **Verification**:  
  - Unit tests for project lifecycle; data access tests.  
  **Artifacts**: Models, APIs, UX flows, governance docs.  
  **Ownership**: Sapiens + Library + AI Platform squads.  
  **Effort**: L  
  **Priority**: P2  
  **Repo paths**: `services/sapiens-analytics/`, `services/library-core/`, `services/knowledge-ocean/`.

---

## 7. Educator Studio & Dashboards

- [ ] **SAP-7.1: Educator Studio Shell**  
  **Objective**: Create an Educator Studio experience consolidating authoring, grading, and analytics.  
  **Dependencies**: Curriculum editor, LMS APIs, analytics service.  
  **Steps**:  
  - Build `EducatorStudio` layout in Sapiens Frontend.  
  - Integrate curriculum graph editor, assignment tools, and grading UI.  
  - Expose key analytics (engagement, risk, mastery) per cohort and learner.  
  **Acceptance criteria**:  
  - Educators can run an entire course from Sapiens (author, run, grade, review).  
  - Risk signals are visible and actionable (e.g., suggest interventions).  
  **Verification**:  
  - UX tests with pilot educators.  
  - Data correctness checks for analytics.  
  **Artifacts**: Studio UI, docs, training materials.  
  **Ownership**: Sapiens + Analytics squads.  
  **Effort**: L  
  **Priority**: P2  
  **Repo paths**: `apps/azora-buildspaces/`, `services/sapiens-analytics/`.

---

## 8. Sapiens-Specific Security, Compliance, Observability

- [ ] **SAP-8.1: Educational Records Policy-as-Code**  
  **Objective**: Encode Sapiens‑specific privacy and retention policies for educational records as code.  
  **Parent**: CAI-2, SEC-2.  
  **Dependencies**: Legal input; policy engine; data catalog.  
  **Steps**:  
  - Define policy templates for FERPA/GDPR/POPIA‑like constraints.  
  - Tag Sapiens data sets in the data catalog and tie them to policies.  
  - Enforce policies in LMS APIs and analytics exports.  
  **Acceptance criteria**:  
  - Sensitive Sapiens data cannot be exported or used in AI training outside policy constraints.  
  - Policy changes logged and testable.  
  **Verification**:  
  - Policy unit tests; simulated data access attempts.  
  **Artifacts**: Policy files, enforcement code, compliance docs.  
  **Ownership**: Sapiens + Constitutional AI + Security squads.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `services/ai-ethics-monitor/`, `services/data-catalog/`, `SECURITY/`.

- [ ] **SAP-8.2: Sapiens Observability Pack**  
  **Objective**: Deliver Sapiens‑specific dashboards, alerts, and runbooks aligned to blueprint §8.  
  **Parent**: OBS-1, OBS-2.  
  **Dependencies**: Otel baseline; metrics events from Sapiens services.  
  **Steps**:  
  - Define key metrics (learning outcomes, risk, tutor efficacy, exam reliability).  
  - Build Grafana dashboards and Alertmanager rules scoped to Sapiens services.  
  - Write runbooks for top Sapiens incidents (exam outage, tutor degradation, analytics lag).  
  **Acceptance criteria**:  
  - On‑call teams can diagnose Sapiens issues within minutes using dashboards.  
  - Alerts tied to clear SLOs for learning and exam flows.  
  **Verification**:  
  - Fire‑drill exercises; postmortem templates referencing SLOs.  
  **Artifacts**: Dashboards, alert configs, runbooks.  
  **Ownership**: SRE + Sapiens squads.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `monitoring/grafana/`, `monitoring/alertmanager/`, `docs/`.

---

## 9. Sapiens Activation Roadmap (Domain View)

Suggested sequence (aligned with master §18 but Sapiens‑specific):

- **Phase 1**: Curriculum spine – SAP-1.1, SAP-1.2, SAP-5.1.  
- **Phase 2**: Tutoring spine – SAP-2.1, SAP-2.2, AI-1, AI-2 integration for core courses.  
- **Phase 3**: Assessment & exam integrity – SAP-3.1, SAP-3.2 plus CAI/SEC checks.  
- **Phase 4**: Credentials & PoV – SAP-4.1, PAY-2, CAI-2.  
- **Phase 5**: Educator Studio & research tools – SAP-6.1, SAP-7.1.  
- **Phase 6**: Full observability & compliance – SAP-8.1, SAP-8.2 + DATA-1.

Progress for each phase should be tracked in project tooling and summarized in `citadel-dev` status docs.
