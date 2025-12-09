# Azora Citadel – Master Implementation Task List (v0.1)

> Linked architecture: `citadel-dev/MASTER-ARCHITECTURE-BLUEPRINT.md` (v0.1)
> Repo: `azora/`
> Note: `P1` = highest priority, `S/M/L` = effort T‑shirt size.

Each task block includes: Objective, Dependencies, Steps, Acceptance criteria, Verification, Artifacts, Ownership, Effort, Priority, Repo paths.

---

## Legend & Global Conventions

- **No Mock Protocol**: Any use of stubs/fakes for external services is allowed only in test/dev and must be:
  - Guarded by config/feature flags.
  - Tracked by metrics.
  - Blocked from prod builds by CI rules.
- **Constitutional Checks**: New AI endpoints must integrate with `services/ai-ethics-monitor/` and CI gates.
- **Repo-path shorthand**:
  - `apps/*` for frontends, `services/*` for backends, `packages/*` for shared libs.

---

## 1. BuildSpaces (Virtual Campus)

### 1.1 Lobby & Room Framework

- [ ] **BS-1: BuildSpaces Lobby MVP**  
  **Objective**: Implement a production-ready Lobby that lists rooms, occupancy, and recommendations (Blueprint §2.1, §3.1).  
  **Dependencies**: Next.js app base; auth; WebSocket infra; `docs/architecture/VIRTUAL-CITADEL-ARCHITECTURE.md`.  
  **Steps**:
  - Scaffold `apps/azora-buildspaces/` with Next.js App Router, Tailwind.
  - Implement Lobby page with room catalogue, per-room status from API.
  - Integrate auth (JWT/NextAuth) and user profile data.
  - Wire to BuildSpaces Orchestrator API (`/api/buildspaces/available`, `/status`).
  - Add Elara greeting banner and recommended room logic (simple heuristic v1).
  **Acceptance criteria**:
  - User can log in, see all rooms and current occupancy, and enter a room.
  - Lobby loads < 2s on P95; error states handled gracefully.
  **Verification**:
  - Unit tests for lobby components.
  - E2E tests: login → Lobby → room entry.
  - Monitoring: page load metric + Lobby error rate in Grafana.
  **Artifacts**: React components, API client, tests, basic Lobby runbook.  
  **Ownership**: Lobby (BuildSpaces) / Frontend squad / Elara XO (guidance).  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `apps/azora-buildspaces/`, `services/buildspaces-orchestrator/` (planned).

- [ ] **BS-2: BuildSpaces Orchestrator Service**  
  **Objective**: Create a backend service managing rooms, sessions, and occupancy.  
  **Dependencies**: Postgres via Prisma; Kafka; Auth; Blueprint §2.1, §5.  
  **Steps**:
  - Scaffold `services/buildspaces-orchestrator/` using existing service templates.
  - Define Prisma models for `BuildSpaceRoom`, `BuildSpaceSession` (in `prisma/schema.prisma`).
  - Implement REST endpoints: enter/exit room, list rooms, room status.
  - Publish room events to Kafka (`room:join`, `room:leave`).
  - Add RBAC checks (student/educator/admin) on room types.
  **Acceptance criteria**:
  - Orchestrator passes health-check; handles 1000 concurrent sessions in load test.
  - Room state remains consistent across refreshes and reconnects.
  **Verification**:
  - Unit tests for handlers.
  - Integration tests with DB and Kafka.
  - Dashboard: room counts, active sessions, errors.  
  **Artifacts**: Service code, Prisma migrations, Helm/K8s manifests.  
  **Ownership**: Lobby & Rooms / Platform squad.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `services/buildspaces-orchestrator/`, `prisma/schema.prisma`, `monitoring/grafana/`.

### 1.2 Rooms (Code Chamber, Maker Lab, AI Studio, etc.)

- [ ] **BS-3: Code Chamber Integration with Ascend**  
  **Objective**: Wire Code Chamber room type to Ascend IDE (Blueprint §2.2, Virtual Citadel doc).  
  **Dependencies**: `apps/ascend/`, `services/agent-execution/`, BuildSpaces Orchestrator.  
  **Steps**:
  - Define `roomType = CODE_CHAMBER` semantics in orchestrator.
  - Embed Ascend Web (or remote session) in Code Chamber UI.
  - Route Elara inline chat to AzStudio Orchestrator.
  - Persist project/session mapping to BuildSpaceSession.
  **Acceptance criteria**:
  - User can open Code Chamber from Lobby and see fully functional editor+terminal+preview.
  - Session resumes previous project state on re-entry.
  **Verification**:
  - E2E: Lobby → Code Chamber → run tests → deploy.
  - Monitoring: Code Chamber session duration & error rates.  
  **Artifacts**: Room component, integration docs, E2E tests.  
  **Ownership**: Code Chamber / Ascend squad.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `apps/azora-buildspaces/rooms/code-chamber/*`, `apps/ascend/`, `services/buildspaces-orchestrator/`.

- [ ] **BS-4: AI Studio + GPU Backend MVP**  
  **Objective**: Provide notebook-like AI Studio room connected to a secured GPU runtime.  
  **Dependencies**: Container runtime; `services/agent-execution/` or new `services/ai-notebooks/`*; AuthZ.  
  **Steps**:
  - Define AI Studio room UX (simple notebook cells, dataset browser).
  - Provision GPU-enabled K8s nodes or external GPU service.
  - Implement notebook execution API with resource limits and sandboxing.
  - Add identity-based quota and cost controls.
  **Acceptance criteria**:
  - Users can execute basic Python/ML cells with bounded runtime.
  - Resource usage is visible in metrics; no cross-tenant leakage.  
  **Verification**:
  - Security review for sandbox.
  - Load tests for multi-tenant isolation.
  - Ethics Monitor integration for generated model artifacts.  
  **Artifacts**: Room UI, notebook backend, GPU infra docs.  
  **Ownership**: AI Studio / AI Platform squad.  
  **Effort**: L  
  **Priority**: P2  
  **Repo paths**: `apps/azora-buildspaces/rooms/ai-studio/*`, `services/ai-notebooks/`*, `infrastructure/`.

(Additional room-specific tasks can be extended from this pattern: Maker Lab, Design Studio, Collaboration Pod, Deep Focus, Innovation Theater.)

---

## 2. Ascend Workbench (IDE)

### 2.1 Core IDE & Virtual FS

- [ ] **ASC-1: Ascend IDE Hardening & VFS**  
  **Objective**: Ensure Ascend IDE is stable with virtual filesystem and multi-tab editing for BuildSpaces and standalone use.  
  **Dependencies**: `apps/ascend/`, file watchers, existing Monaco integration.  
  **Steps**:
  - Audit current Ascend implementation under `apps/ascend/`.
  - Implement VFS abstraction (local, remote, project-scoped) with clear API.
  - Add tests for concurrent edits, tab restore, and conflict resolution.
  **Acceptance criteria**:
  - IDE handles >20 open files without degradation.
  - VFS supports remote projects from BuildSpaces without race conditions.  
  **Verification**:
  - Jest tests for VFS; Playwright tests for editor flows.
  - Observability: IDE error logs & latency metrics.  
  **Artifacts**: VFS module, tests, IDE runbook.  
  **Ownership**: Code Chamber / Ascend squad.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `apps/ascend/src/*`, `tests/__tests__/ascend-*.test.ts`.

### 2.2 Git, Debugger, Extensions

- [ ] **ASC-2: Git Workflows Integration**  
  **Objective**: Provide commit, branch, and PR workflows inside Ascend and Code Chamber.  
  **Dependencies**: Git CLI; GitHub/GitLab APIs; `scripts/` helpers.  
  **Steps**:
  - Implement Git status/diff/commit/push UIs.
  - Integrate with GitHub PR APIs for branch and PR creation.
  - Add safeguards for large or secret-bearing diffs (DLP hooks).
  **Acceptance criteria**:
  - User can commit and open PR from Ascend; DLP rejects secrets.  
  **Verification**:
  - Integration tests with mock Git providers.
  - Log-based verification for DLP hits.  
  **Artifacts**: Git panel, provider adapters, docs.  
  **Ownership**: Ascend squad.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `apps/ascend/src/git/*`, `scripts/`.

- [ ] **ASC-3: Debugger & Live Preview**  
  **Objective**: Enable step-debugging and live preview integration (Blueprint §2.2).  
  **Dependencies**: Node debug protocol; preview server; `apps/ascend-demo/`.  
  **Steps**:
  - Integrate Node debug adapters.
  - Implement preview iframe/server for Next.js and Node apps.
  - Surface breakpoints, stack, variables in UI.  
  **Acceptance criteria**:
  - Can debug Next.js app end-to-end from Ascend.
  - Preview reload latency P95 < 1s after save.  
  **Verification**:
  - E2E test: set breakpoint → step → verify output.
  - Metrics: preview HMR latency.  
  **Artifacts**: Debugger module, preview runner, docs.  
  **Ownership**: Ascend squad.  
  **Effort**: L  
  **Priority**: P2  
  **Repo paths**: `apps/ascend/`, `apps/ascend-demo/`.

---

## 3. AzStudio (Agent Orchestration)

### 3.1 AIOrchestrator & Skills

- [ ] **AZST-1 (Bolt B-1): AIOrchestrator Refactor**  
  **Objective**: Repair and harden `AIOrchestrator` implementation with explicit interfaces and tests (Blueprint Bolt B‑1).  
  **Dependencies**: `azstudio-archive/`, current `AIOrchestrator.ts`, LLM providers, Ethics Monitor.  
  **Steps**:
  - Extract orchestration interfaces from `azstudio-archive/docs/AZSTUDIO-ARCHITECTURE-PLAN.md`.
  - Rewrite `AIOrchestrator.ts` with clear model selection, prompt building, and routing.
  - Add safety hooks: pre/post Ethics Monitor calls, No Mock enforcement.
  - Cover core flows with unit and integration tests.
  **Acceptance criteria**:
  - `npm run build` passes for AzStudio; zero TypeScript structural errors.
  - 90%+ test coverage on orchestration logic.
  **Verification**:
  - CI passes type-check, tests, lint.
  - AI Ethics Monitor is called on all orchestrated generations (verified via logs/metrics).  
  **Artifacts**: Updated orchestrator, tests, architecture notes.  
  **Ownership**: AzStudio / Agent Orchestration squad.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `azstudio-archive/`, `apps/ascend-vscode/`, `services/azstudio-orchestrator/`*.

- [ ] **AZST-2: Skills Registry & Tooling Contracts**  
  **Objective**: Implement central skills registry and standard tool interfaces.  
  **Dependencies**: AzStudio docs; existing agent extension scaffolding.  
  **Steps**:
  - Define `Skill` schema (id, description, inputs/outputs, safety level, owner).
  - Implement registry service/API for skills discovery and updates.
  - Integrate with Elara and Ascend command palette.  
  **Acceptance criteria**:
  - All agent tools used by Elara registered in the registry.
  - New skills can be discovered and invoked via AzStudio planning.  
  **Verification**:
  - Tests for registry CRUD and discovery.
  - Metrics: skill usage, failure rates.  
  **Artifacts**: Registry service, types, docs.  
  **Ownership**: AzStudio squad.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `services/azstudio-orchestrator/`, `prisma/schema.prisma` (if persisted).

### 3.2 Verification Pipeline

- [ ] **AZST-3 (Bolt B-2/B-5): No Mock & Constitutional CI Gates**  
  **Objective**: Enforce No Mock & constitutional checks in CI for all AI-related services.  
  **Dependencies**: GitHub Actions; `services/ai-ethics-monitor/`; AzStudio verification docs.  
  **Steps**:
  - Implement static checks that fail CI if stub providers are used in prod builds.
  - Add required Ethics Monitor calls for AI endpoints (lint rules + tests).
  - Define min alignment/truth scores that block deployments.  
  **Acceptance criteria**:
  - Any PR introducing prod mocks fails CI.
  - AI endpoints without Ethics Monitor coverage are blocked.  
  **Verification**:
  - CI jobs executed on sample PRs; manual negative tests.
  - Dashboards for blocked builds and reasons.  
  **Artifacts**: CI configs, lint rules, policy docs.  
  **Ownership**: AzStudio + DevEx squads.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `.github/workflows/`, `services/ai-ethics-monitor/`, `scripts/`.

---

## 4. AI Family & Knowledge Ocean

- [ ] **AI-1: AI Family Multi-Persona Service**  
  **Objective**: Create a central AI Family API using `ChatSession`, `ChatMessage`, `AIPersonality`.  
  **Dependencies**: `prisma/schema.prisma`; LLM providers; Ethics Monitor.  
  **Steps**:
  - Scaffold `services/ai-family-api/` with REST/gRPC endpoints.
  - Use Prisma models for sessions and personalities.
  - Integrate with Ethics Monitor for each response.
  **Acceptance criteria**:
  - Elara and at least one other persona accessible via this service.
  - Conversation history persisted and retrievable.  
  **Verification**:
  - Unit tests for persona routing; E2E chat tests.
  - Metrics: response latency, error rate, alignment score distribution.  
  **Artifacts**: Service code, openAPI spec, dashboards.  
  **Ownership**: AI Platform squad.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `services/ai-family-api/`, `prisma/schema.prisma`.

- [ ] **AI-2: Knowledge Ocean RAG Spine**  
  **Objective**: Implement ingestion→embedding→index→retrieval pipeline powering Sapiens, Library, and Ascend.  
  **Dependencies**: `data/knowledgeIndex.json`; vector DB; search infra.  
  **Steps**:
  - Scaffold `services/knowledge-ocean/` with ingestion workers.
  - Integrate with S3/R2, web/PDF connectors, and existing course content.
  - Implement hybrid retrieval API (semantic + lexical).
  **Acceptance criteria**:
  - Sapiens & Ascend can request grounded answers for Azora docs and courses.
  - Retrieval quality evaluated via a small golden set.  
  **Verification**:
  - Unit tests for chunking/embedding.
  - Evaluation harness with accuracy/recall metrics.
  - Ethics Monitor integration for hallucination detection.  
  **Artifacts**: Workers, retrieval API, eval scripts, dashboards.  
  **Ownership**: AI Platform squad.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `services/knowledge-ocean/`, `data/`, `monitoring/`.

---

## 5. Azora Sapiens (University)

- [ ] **SAP-1: Unified LMS Backing Prisma**  
  **Objective**: Align Prisma LMS models with legacy `database/education-schema.sql` and migrate.  
  **Dependencies**: `prisma/schema.prisma`, `database/education-schema.sql`, Education service.  
  **Steps**:
  - Compare existing SQL schema to Prisma models for courses, modules, enrollments.
  - Define Prisma-first canonical model; write migrations to reconcile.
  - Implement data migration scripts & dry-runs.
  **Acceptance criteria**:
  - Single source of truth for LMS; zero runtime schema drift.
  - Existing data preserved & validated.  
  **Verification**:
  - DB migration tests; data integrity checks.
  - Observability: migration logs, discrepancy metrics.  
  **Artifacts**: Prisma updates, SQL migrations, runbook.  
  **Ownership**: Sapiens / Data squads.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `prisma/schema.prisma`, `database/education-schema.sql`, `scripts/`.

- [ ] **SAP-2: Adaptive Tutoring Engine**  
  **Objective**: Build `services/sapiens-tutor/` providing personalized learning journeys.  
  **Dependencies**: Knowledge Ocean; AI Family; LMS models; Ethics Monitor.  
  **Steps**:
  - Implement student profile aggregation (courses, assessments, AI interactions).
  - Design API for next-lesson recommendations and tutoring prompts.
  - Integrate exam integrity features (restricted tools, monitoring hooks).
  **Acceptance criteria**:
  - Sapiens UI can request next steps and tutoring help per learner.
  - Exam mode enforces stricter policies and logs anomalies.  
  **Verification**:
  - Scenario tests for different learner progress states.
  - Ethics Monitor checks on tutoring content (fairness, bias).  
  **Artifacts**: Tutoring service, tests, integrity docs.  
  **Ownership**: Sapiens squad.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `services/sapiens-tutor/`, `apps/azora-buildspaces/` (Sapiens views).

- [ ] **SAP-3: Credentialing & Proof-of-Learning**  
  **Objective**: Issue verifiable digital credentials and map them to PoV.  
  **Dependencies**: Mint & Pay, AZRToken, UbuntuGovernance, LMS.  
  **Steps**:
  - Scaffold `services/credentialing/` with credential schemas.
  - Integrate with Mint & Pay to award tokens on key milestones.
  - Optionally anchor credentials or PoV hashes on-chain.  
  **Acceptance criteria**:
  - Learners receive cryptographically verifiable credentials for major achievements.
  - PoV and token balances updated reliably.  
  **Verification**:
  - Unit tests for credential format; integration with Mint & Pay.
  - Reconciliation jobs between DB and chain.  
  **Artifacts**: Credential schemas, APIs, PoV hooks.  
  **Ownership**: Sapiens + Mint squads.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `services/credentialing/`, `services/mint-pay/`, `blockchain/`.

---

## 6. Azora Library (World-class)

- [ ] **LIB-1: Library Core Service**  
  **Objective**: Implement `services/library-core/` for catalog, licensing, provenance, and deduplication.  
  **Dependencies**: Knowledge Ocean; storage (S3/R2); legal/licensing input.  
  **Steps**:
  - Define data model for works, editions, licenses, and sources.
  - Implement ingestion pipeline from approved sources with license checks.
  - Track provenance and dedupe content before indexing into Knowledge Ocean.
  **Acceptance criteria**:
  - Library can ingest and catalog books/papers with correct licensing metadata.
  - No duplicate entries for same work across sources.  
  **Verification**:
  - Tests for dedup logic & licensing rules.
  - Periodic audits on sample sources.  
  **Artifacts**: Library core code, schemas, ingestion docs.  
  **Ownership**: Library / Knowledge squads.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `services/library-core/`, `data/`.

- [ ] **LIB-2: Research & Citation Tools**  
  **Objective**: Provide in-IDE and in-Sapiens research views with citation graph and export APIs.  
  **Dependencies**: Library Core; Knowledge Ocean; frontends.  
  **Steps**:
  - Build citation graph store and APIs.
  - Integrate library search into Ascend and Sapiens UIs.
  - Support export formats (BibTeX, JSON, PDFs) with provenance.  
  **Acceptance criteria**:
  - Learner can search, bookmark, and cite works with correct references.
  - Citation graph visible and navigable.  
  **Verification**:
  - Tests for citation generation; sample exports.
  - UX validation sessions with power users.  
  **Artifacts**: APIs, UIs, docs.  
  **Ownership**: Library squad.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `services/library-core/`, `apps/azora-buildspaces/`, `apps/ascend/`.

---

## 7. Marketplace & Forge

- [ ] **MP-1: Marketplace Core Service**  
  **Objective**: Build `services/marketplace-core/` on top of Prisma Job/Skill models for jobs, tasks, and matching.  
  **Dependencies**: `prisma/schema.prisma` (Job, JobApplication, Skill, UserSkill); Mint & Pay.  
  **Steps**:
  - Implement CRUD for jobs and applications; search & filter endpoints.
  - Add matching endpoint using skills & PoV/credentials.
  - Expose events for PoV and Mint & Pay on completed work.  
  **Acceptance criteria**:
  - Talent can browse/apply; clients can post and manage jobs.
  - Basic matching algorithm returns relevant candidates.  
  **Verification**:
  - Unit & integration tests; E2E for post→apply→complete flow.
  - Metrics on application flow & conversion.  
  **Artifacts**: Service code, API docs, dashboards.  
  **Ownership**: Marketplace squad.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `services/marketplace-core/`, `prisma/schema.prisma`.

- [ ] **MP-2: Escrow & Dispute Resolution (Bolt B-8)**  
  **Objective**: Implement escrow & dispute mechanics integrated with Mint & Pay.  
  **Dependencies**: Mint & Pay, legal/compliance guidance.  
  **Steps**:
  - Design escrow flows and states; extend schema with escrow contracts.
  - Implement hold/release of funds and dispute workflows.
  - Log all actions for audits and potential governance escalation.  
  **Acceptance criteria**:
  - Funds safely held and released only under agreed rules.
  - Dispute workflows complete deterministically.  
  **Verification**:
  - Simulated disputes and multi-party tests.
  - Reconciliation with Mint & Pay ledger.  
  **Artifacts**: Escrow service or module, docs, runbooks.  
  **Ownership**: Marketplace + Mint squads.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `services/marketplace-core/`, `services/mint-pay/`, `prisma/schema.prisma`.

---

## 8. Mint & Pay

- [ ] **PAY-1: Mint & Pay Ledger Service (Bolt B-4)**  
  **Objective**: Implement `services/mint-pay/` as canonical ledger for wallets & transactions.  
  **Dependencies**: Prisma Wallet/Transaction/TokenBalance; AZRToken; payment providers (Stripe).  
  **Steps**:
  - Implement REST/gRPC APIs for wallet create, balance, transfer, payouts.
  - Integrate with Stripe/fiat for on/off-ramp.
  - Define clear mapping between Prisma ledger and on-chain AZR balances.  
  **Acceptance criteria**:
  - Any wallet action fully traceable in ledger and logs.
  - Reconciliation job detects any chain/DB mismatches.  
  **Verification**:
  - Unit tests for ledger transforms; reconciliation integration tests.
  - Compliance metrics and reports.  
  **Artifacts**: Service, schemas, reconciliation scripts.  
  **Ownership**: Mint squad.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `services/mint-pay/`, `prisma/schema.prisma`, `blockchain/`.

- [ ] **PAY-2: PoV Minting Hooks (Cross-domain)**  
  **Objective**: Wire events from Sapiens, BuildSpaces, and Marketplace into PoV → AZR minting.  
  **Dependencies**: SAP-3, MP-1, BuildSpaces Orchestrator, AZRToken, ProofOfValue models.  
  **Steps**:
  - Define PoV event taxonomy (learning, contributions, work, governance).
  - Implement `services/pov-processor/`* that consumes Kafka events and issues PoV records + Mint & Pay instructions.
  - Integrate with AZRToken Ubuntu mining functions where appropriate.  
  **Acceptance criteria**:
  - PoV events reliably result in TokenTransaction and/or on-chain transfers.
  - No double-mint; clear audit trail and revocation mechanisms.  
  **Verification**:
  - Simulation of large PoV event streams.
  - Cross-checks between PoV records, TokenBalance, and AZR chain supply.  
  **Artifacts**: PoV processor service, schemas, dashboards.  
  **Ownership**: Mint + Sapiens + Marketplace squads.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `services/pov-processor/`*, `services/mint-pay/`, `blockchain/AZRToken.sol`.

---

## 9. Enterprise Suite

- [ ] **ENT-1: Enterprise Gateway & SSO/SCIM**  
  **Objective**: Provide SSO/SCIM integration for enterprises using `EnterpriseLicense` and related models.  
  **Dependencies**: IdP providers (Okta, Azure AD, Google); Prisma Enterprise* models.  
  **Steps**:
  - Scaffold `services/enterprise-gw/` for org onboarding, SSO, and SCIM.
  - Map SCIM groups/roles to Azora roles and RBAC policies.
  - Provide admin UI for license and org config.  
  **Acceptance criteria**:
  - Enterprise can onboard and manage users via SSO/SCIM.
  - License limits enforced (max users, courses, API calls).  
  **Verification**:
  - Integration tests with test IdPs.
  - Metrics on login success/fail, license usage.  
  **Artifacts**: Gateway service, admin UI, docs.  
  **Ownership**: Enterprise squad.  
  **Effort**: L  
  **Priority**: P2  
  **Repo paths**: `services/enterprise-gw/`, `apps/admin-dashboard/`, `prisma/schema.prisma`.

---

## 10. Constitutional AI Core

- [ ] **CAI-1: Ethics Monitor Integration Baseline (Bolt B-2)**  
  **Objective**: Ensure all AI calls route through `services/ai-ethics-monitor/` for scoring and logging.  
  **Dependencies**: AI-1, AI-2, AZST-1/3, existing Ethics Monitor API.  
  **Steps**:
  - Implement shared client library for Ethics Monitor.
  - Update all AI services to call Ethics Monitor pre/post model response.
  - Add per-route config for required thresholds and actions on failure.  
  **Acceptance criteria**:
  - 100% of production AI routes emit ethics/compliance traces.
  - Low alignment scores trigger retries or escalations.  
  **Verification**:
  - Static analysis to detect AI calls without monitor usage.
  - Metrics: number of monitored vs unmonitored calls.  
  **Artifacts**: Client lib, config, dashboards, runbook.  
  **Ownership**: Constitutional AI squad.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `services/ai-ethics-monitor/`, `packages/@azora/core/ai-ethics-client`*.

- [ ] **CAI-2: Policy-as-Code Engine**  
  **Objective**: Implement a policy engine governing AI behavior, data handling, and No Mock rules.  
  **Dependencies**: CAI-1, AZST-3, Security stack.  
  **Steps**:
  - Define policy schema (YAML/JSON) for AI & data rules.
  - Implement engine that evaluates policies in Ethics Monitor and AzStudio.
  - Expose governance APIs to adjust policies via UbuntuGovernance proposals.  
  **Acceptance criteria**:
  - Policies drive runtime decisions and CI gates, not hard-coded logic.
  - Governance proposals can update policies after approval.  
  **Verification**:
  - Policy unit tests; regression suite for critical scenarios.
  - Trace logs showing policy decisions.  
  **Artifacts**: Policy engine, policy repo, docs.  
  **Ownership**: Constitutional AI + Governance squads.  
  **Effort**: L  
  **Priority**: P2  
  **Repo paths**: `services/ai-ethics-monitor/`, `SECURITY/`, `blockchain/UbuntuGovernance.sol`.

---

## 11. Identity & Access

- [ ] **ID-1: Auth Core Service**  
  **Objective**: Centralize authentication (NextAuth/OIDC/JWT) with MFA and device/session controls.  
  **Dependencies**: Existing Auth Service; Prisma User/Token models; Enterprise GW.  
  **Steps**:
  - Scaffold `services/auth-core/` if not present; consolidate existing auth logic.
  - Implement login, refresh, logout, MFA, device fingerprinting.
  - Provide SDKs for web and desktop clients.  
  **Acceptance criteria**:
  - All apps (BuildSpaces, Ascend, Sapiens) use Auth Core tokens.
  - Security tests confirm token & session robustness.  
  **Verification**:
  - Unit/integration tests; pen-test for auth endpoints.
  - Metrics on login failures, suspicious patterns.  
  **Artifacts**: Auth service, SDKs, docs.  
  **Ownership**: Security & Identity squad.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `services/auth-core/`, `apps/*`.

---

## 12. Data & Services

- [ ] **DATA-1 (Bolt B-3): Schema Governance & Lineage**  
  **Objective**: Establish Prisma as canonical model with data lineage and governance.  
  **Dependencies**: SAP-1; analytics stack.  
  **Steps**:
  - Define modeling and migration standards for Prisma.
  - Introduce `services/data-catalog/`* with dataset metadata and lineage.
  - Integrate lineage into ETL/ELT jobs.  
  **Acceptance criteria**:
  - All data flows traceable back to sources.
  - Schema changes go through review & migration pipeline.  
  **Verification**:
  - Data catalog completeness metrics.
  - Random lineage audits.  
  **Artifacts**: Data catalog service, standards docs.  
  **Ownership**: Data Platform squad.  
  **Effort**: L  
  **Priority**: P2  
  **Repo paths**: `services/data-catalog/`, `prisma/schema.prisma`, `docs/`.

---

## 13. Frontend & Docs

- [ ] **FE-1: Unified Design System Rollout**  
  **Objective**: Use `packages/azora-ui/` across BuildSpaces, Sapiens, Library, and Marketplace.  
  **Dependencies**: Design team; existing UI package; Tailwind config.  
  **Steps**:
  - Audit all frontends for duplicated UI.
  - Refactor shared components into `packages/azora-ui/`.
  - Update apps to use shared components and theme tokens.  
  **Acceptance criteria**:
  - Core flows (Lobby, course pages, marketplace) use shared components.
  - Theming and accessibility consistent.  
  **Verification**:
  - Visual regression tests; a11y checks.
  - Component usage metrics (optional).  
  **Artifacts**: Design system docs, Storybook (if used).  
  **Ownership**: UX/Frontend squad.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `packages/azora-ui/`, `apps/*`.

- [ ] **FE-2: Developer & Sapiens Docs System**  
  **Objective**: Build documentation UX for developers and learners over `docs/` + Library.  
  **Dependencies**: Library & Knowledge Ocean; `docs/`.  
  **Steps**:
  - Create docs site app (`apps/azora-docs/`*).
  - Index docs into Library & Knowledge Ocean.
  - Provide search, filters, and contextual docs from Ascend & Sapiens.  
  **Acceptance criteria**:
  - Docs searchable with semantic and lexical search.
  - In-context help visible in IDE and Sapiens flows.  
  **Verification**:
  - Search evals; usability tests.  
  **Artifacts**: Docs app, search integration, guides.  
  **Ownership**: Docs/UX squad.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `apps/azora-docs/`, `docs/`, `services/library-core/`.

---

## 14. Infra & DevOps

- [ ] **INF-1: Environment & Namespace Standardization**  
  **Objective**: Standardize K8s namespaces and environment configuration across all services.  
  **Dependencies**: current `docker-compose*.yml`, `infrastructure/`, monitoring configs.  
  **Steps**:
  - Define namespaces by domain (education, finance, ai, infra).
  - Template deployment configs and secrets loading.
  - Document environment promotion (dev→stage→prod).  
  **Acceptance criteria**:
  - All services deployable consistently across envs.
  - No hard-coded env-specific values.  
  **Verification**:
  - Test deployments in dev/stage; smoke tests.
  - Infra dashboards showing per-namespace health.  
  **Artifacts**: Helm charts/manifests, env docs.  
  **Ownership**: DevOps/SRE squad.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `infrastructure/`, `.github/workflows/`, `monitoring/`.

- [ ] **INF-2: CI/CD Pipeline Hardening**  
  **Objective**: Enforce lint, tests, security scans, constitutional gates on every PR.  
  **Dependencies**: AZST-3, CAI-2, Security tooling.  
  **Steps**:
  - Ensure unified CI templates per service type.
  - Integrate SAST/DAST, dependency scanning, container scanning.
  - Add rollout strategies (blue/green, canary) with quick rollback.  
  **Acceptance criteria**:
  - All services share minimal CI requirements.
  - Failed gates block merges and deployments.  
  **Verification**:
  - CI runs on all repos/paths; coverage metrics.
  - Incident review of any gate bypass.  
  **Artifacts**: CI templates, policy docs.  
  **Ownership**: DevEx/DevOps squad.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `.github/workflows/`, `scripts/`.

---

## 15. Observability & SRE

- [ ] **OBS-1 (Bolt B-6): Otel Instrumentation Baseline**  
  **Objective**: Instrument all HTTP/AI calls with OpenTelemetry and standard metrics.  
  **Dependencies**: `monitoring/`, CAI-1, AI-1/2, existing logging.  
  **Steps**:
  - Add Otel SDK to service templates.
  - Instrument API Gateway, AI Family, Sapiens, Mint & Pay.
  - Export traces to Jaeger or compatible backend.  
  **Acceptance criteria**:
  - Traces end-to-end for key flows (learn, build, pay, govern).
  - Latency & error rates visible per service and route.  
  **Verification**:
  - Chaos/latency tests; trace inspection.
  - SLO dashboards showing data from Otel.  
  **Artifacts**: Otel configs, dashboards, runbooks.  
  **Ownership**: SRE squad.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `monitoring/`, `services/*`, `apps/*`.

- [ ] **OBS-2: SLOs & Error Budgets**  
  **Objective**: Define and enforce SLOs & error budgets per domain.  
  **Dependencies**: OBS-1; metrics.  
  **Steps**:
  - Define SLOs for education, AI, payments, marketplace, governance.
  - Implement error budget alerts and incident workflows.
  - Align team KPIs to SLOs.  
  **Acceptance criteria**:
  - SLOs published and tracked; alerts connected to on-call.
  - Postmortems reference error budgets.  
  **Verification**:
  - Test alert firing via synthetic failures.
  - Quarterly SLO reviews.  
  **Artifacts**: SLO docs, alert rules, runbooks.  
  **Ownership**: SRE + Domain squads.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `monitoring/`, `docs/`.

---

## 16. Security & Compliance

- [ ] **SEC-1 (Bolt B-7): Secrets & Key Rotation**  
  **Objective**: Centralize secrets in Vault/KMS and enforce rotation.  
  **Dependencies**: `infrastructure/aws/secrets-loader.ts`, CI/CD, all services.  
  **Steps**:
  - Audit repo for inline secrets (DLP/static scanning).
  - Migrate secrets into central store; update services to load at runtime.
  - Define and implement rotation schedules and procedures.  
  **Acceptance criteria**:
  - Zero secrets in repo; all services read from central store.
  - Rotation tested and documented.  
  **Verification**:
  - Regular scans; rotation fire-drills.
  - Audit logs of secret access.  
  **Artifacts**: Secret loading libraries, rotation runbooks.  
  **Ownership**: Security squad.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `infrastructure/aws/`, `.github/workflows/`, `SECURITY/`.

- [ ] **SEC-2: STRIDE Threat Models & DLP**  
  **Objective**: Complete STRIDE threat models per major domain and implement DLP filters.  
  **Dependencies**: Domain leads; Library ingestion; Mint & Pay; Marketplace.  
  **Steps**:
  - Document threat models and mitigations per domain.
  - Implement DLP filters on outbound content and Git operations.
  - Integrate DLP logs with Ethics Monitor and observability stack.  
  **Acceptance criteria**:
  - Threat models up-to-date and reviewed.
  - DLP blocks or redacts unsafe data flows.  
  **Verification**:
  - Red-team exercises; simulated data exfil attempts.
  - DLP incident metrics.  
  **Artifacts**: Threat model docs, DLP configs, incident runbooks.  
  **Ownership**: Security squad + domain teams.  
  **Effort**: L  
  **Priority**: P2  
  **Repo paths**: `SECURITY/`, `services/*`, `apps/*`.

---

## 17. Global Risks & Unknowns (Implementation View)

- **R-1**: Model provider mix and jurisdictional constraints – requires AetherForge/legal decisions → tasks CAI-2, AI-2.
- **R-2**: Data residency and regulatory frameworks (GDPR/POPIA/FERPA) – update data handling policy → DATA-1, SEC-2.
- **R-3**: Scope of on-chain vs off-chain governance and PoV – finalize via governance process → CAI-2, PAY-2.
- **R-4**: External enterprise integrations (ERPs/CRMs) – prioritize targets → ENT-1 and follow-on tasks.

Each risk must have explicit decision owners and deadlines recorded in `docs/` and surfaced in governance dashboards.

---

## 18. First 30 Days Implementation Plan (Aligned to Blueprint §15)

**Week 1**  
- Execute: AZST-1, CAI-1, AZST-3, OBS-1, INF-1 (core spine).  

**Week 2**  
- Execute: BS-1, BS-2, SAP-1, AI-1 (learning+orchestration baseline).  

**Week 3**  
- Execute: PAY-1, PAY-2, MP-1, MP-2 (value & work spine).  

**Week 4**  
- Execute: LIB-1, AI-2, SAP-2, CAI-2, SEC-1 (knowledge, tutoring, and security spine).  

Progress and deviations from this plan should be recorded in `citadel-dev/` status logs or equivalent tracking tools.
