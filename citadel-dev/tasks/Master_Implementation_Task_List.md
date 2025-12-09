# Azora Master Implementation Task List (Master)

This is the master task list, production-grade, exhaustive, deduplicated, and cross-linked to architecture sections and repo paths. Tasks are grouped by domain and include: Objective, Dependencies, Steps, Acceptance Criteria, Verification, Artifacts (repo paths), Ownership (BuildSpaces room), Effort, Priority.

Table of Contents
- BuildSpaces (Virtual Campus)
- Ascend Workbench (IDE)
- AzStudio (Orchestration)
- AI Family & Knowledge Ocean
- Azora Sapiens (University)
- Azora Library (World-class)
- Marketplace & Forge
- Mint & Pay
- Enterprise Suite
- Constitutional AI Core
- Identity & Access
- Data & Services
- Frontend & Docs
- Infra & DevOps
- Observability & SRE
- Security & Compliance
- Cross-cutting Tasks

---

## How to read a task
- Objective: One-line goal + rationale
- Dependencies: internal/external
- Steps: ordered checklist of implementation steps
- Acceptance criteria: testable metrics, SLOs, security thresholds
- Verification: unit/integration/e2e/constitution checks
- Artifacts: repository paths, configs
- Ownership: BuildSpaces room & team/agent
- Effort: S/M/L and Priority P1–P4

---

## BuildSpaces (Virtual Campus)

### Task: Lobby (Unified entry & identity-first UX)
- Objective: Implement a unified landing portal for Azora's campus with role-aware onboarding, SSO, and identity-driven content.
- Rationale: Provides the single entry point; shows identity and access right away.
- Dependencies: `services/azora-auth`, `apps/app/` (public platform), `infrastructure/` (identity provider configs), CSS/UI design tokens.
- Steps:
  1. Implement lobby UI at `apps/app/pages/index.tsx` that queries `services/azora-auth` for user role.
  2. SSO integration (NextAuth + enterprise providers) — add configuration in `services/azora-auth/`.
  3. Add role-aware navigation that exposes BuildSpaces rooms.
  4. Add onboarding flow with user telemetry collection (consent-first).
  5. Add acceptance test and e2e using Playwright.
- Acceptance criteria:
  - SSO login works with NextAuth + Okta test tenant.
  - Role-based routing correctly restricts/permits room access.
  - Page loads p95 <= 600ms on staging.
- Verification:
  - Unit tests for lobby components.
  - Playwright e2e for SSO.
  - SLO dashboard track.
- Artifacts: `apps/app`, `services/azora-auth`, `infrastructure/*`.
- Ownership: Lobby Room (BuildSpaces Lobby) — Product/Platform
- Effort: M — Priority: P1

### Task: Room Framework (Create & Manage Rooms)
- Objective: Create a reusable Room API & UI components for BuildSpaces with role-based access, occupancy, presence, and chat.
- Dependencies: `apps/app`, `services/azora-sapiens` (presence), `services/azora-auth`.
- Steps:
  1. Create `packages/shared-room` library for room APIs (create/update/delete/seat).
  2. Integrate real-time presence using Redis Pub/Sub or WebSocket service in `services/real-time`.
  3. Build UI components (React) in `apps/ascend` and `apps/app`.
  4. Add a system for room templates (classroom, lab, code chamber).
  5. Hook into Billing and Resource allocation (e.g. GPU seat metrics for labs).
- Acceptance criteria:
  - Rooms can be created/deleted and provide presence updates.
  - Template-based instantiation.
- Verification: End-to-end integration tests.
- Artifacts: `packages/shared-room`, `apps/ascend`, `apps/app`.
- Ownership: Room Framework — BuildSpaces Room Platform
- Effort: L — Priority: P1

... (Remaining BuildSpaces tasks continue: Code Chamber, Maker Lab, AI Studio, Design Studio, Collaboration Pod, Deep Focus, Innovation Theater)

---

## Ascend Workbench (IDE)

### Task: Monaco Editor Integration with Live Preview & Virtual FS
- Objective: Implement Monaco-based IDE integrated with virtual FS, live preview, and git features.
- Dependencies: `vscode-foundation/`, `apps/ascend`, `services/codespaces`.
- Steps:
  1. Use `vscode-foundation` to scaffold an App and create Monaco bindings.
  2. Implement virtual FS backed by S3/Blob storage and code sync via `services/codespaces`.
  3. Add terminal emulator and git integration.
  4. UX: file tree, command palette, debugger extension.
  5. Add collaborative features (CRDT or Yjs) for pair programming.
- Acceptance criteria:
  - Monaco editor loads and edits files and persists to storage.
  - Remote terminal executes commands in a sandbox.
  - Live preview reloads on save with p95 latency < 200ms.
- Verification: Integration tests and manual QA with performance tests.
- Artifacts: `vscode-foundation/`, `apps/ascend`.
- Ownership: Code Chamber (Ascend Workbench) — Engineering
- Effort: L — Priority: P1

---

## AzStudio (Orchestration) — Elara

### Task: Elara Orchestrator Core (Agent lifecycle & policies)
- Objective: Implement a robust orchestrator for agent lifecycles including scheduling, verification gating, and skill registry.
- Dependencies: `genome/elara-master-launcher.ts`, `services/agent-execution/`, `packages/shared-ai/`.
- Steps:
  1. Consolidate orchestrator API in `services/ai-orchestrator/`.
  2. Implement agent lifecycle states and store in RDBMS with audit fields.
  3. Add skill registry with versioning and schema validation.
  4. Implement constitutional verification pipeline callouts to `services/constitutional-ai/`.
  5. Add observability hooks for agent runs (traces, logs).
- Acceptance criteria:
  - Orchestrator supports starting/stopping agent runs.
  - Constitutional verification triggers pre/post state changes.
  - Auditable records exist for all agent actions.
- Verification:
  - Unit & integration tests + simulated agent runs.
  - Property-based tests for policy gating.
- Artifacts: `services/ai-orchestrator/`, `genome/elara-master-launcher.ts`, `packages/shared-ai/`.
- Ownership: AzStudio Orchestrator Room — Platform & Security
- Effort: L — Priority: P1

### Task: Skills Registry & Skill Packaging
- Objective: Create a stable registry for skills used by Elara agents with manifests and contract definitions.
- Dependencies: `packages/shared-ai/`, `services/ai-orchestrator`.
- Steps:
  1. Define a canonical skill manifest JSON/YAML schema (skillId, entrypoint, versions, inputs/outputs, policies).
  2. Implement CRUD APIs for skills.
  3. Add a CLI/tooling for publishing skills.
  4. Implement runtime validation & whitelisting.
- Acceptance criteria: skills registry stores and validates skill manifests and supports pledge + verification.
- Verification: Implement `skills-registry` unit tests + contract tests.
- Artifacts: `packages/shared-ai/`, `services/ai-orchestrator/`.
- Ownership: Skills Registry Team — AzStudio
- Effort: M — Priority: P1

... (Remaining AzStudio tasks: Agent sandboxing, CI for skill policies, skills marketplace integration)

---

## AI Family & Knowledge Ocean

### Task: Model Router and Provider Abstraction
- Objective: Implement a provider-agnostic router for model providers with cost-tracking and identity isolation.
- Dependencies: `packages/shared-api/ai-router.ts`, `services/ai-routing/`.
- Steps:
  1. Refactor `ai-router.ts` to include provider adapters (OpenAI, local LLM/LLM-ops).
  2. Add QPS & cost monitoring & per-tenant rate limits.
  3. Add automatic fallback provider config and verify:
    - If primary is unavailable or cost spikes, route to local cheaper provider.
- Acceptance criteria:
  - Providers are configurable via env & infra.
  - Router exposes telemetry & cost dashboards.
- Verification: E2E tests with simulated provider outages and cost spikes.
- Artifacts: `packages/shared-api/ai-router.ts`, `services/ai-routing/`.
- Ownership: AI Core — Platform
- Effort: M — Priority: P1

### Task: Embedding Store & RAG Kernel
- Objective: Implement a scalable embedding store, retriever & RAG pipeline (ingest -> embedding -> index -> retrieval).
- Dependencies: `services/azora-sapiens/src/embeddings.ts`, `vector DB provider`.
- Steps:
  1. Build ingestion pipeline for PDF/HTML/feeds in `services/azora-sapiens`.
  2. Tokenize and do DLP and license checks before ingestion.
  3. Design schema & storage layout for vector DB and metadata store.
  4. Implement RAG pipeline with caching and retrieval scoring.
- Acceptance criteria: Document ingestion completes with metadata & embeddings; retrieval quality > baseline (human eval).
- Verification: Integration tests + human eval + SLO.
- Artifacts: `services/azora-sapiens/src/`, `services/azora-library/`.
- Ownership: Knowledge Ocean Team
- Effort: L — Priority: P1

... (Remaining AI Family tasks: model registry, training pipelines, evaluation harness, memory/context manager)

---

## Azora Sapiens (University)

### Task: Curriculum Graph & Adaptive Tutoring Engine
- Objective: Implement a canonical curriculum graph representation, adaptive tutoring engine, and progress tracking.
- Dependencies: `services/azora-sapiens` (engines/learning-paths, assessment engine), `services/azora-library`.
- Steps:
  1. Design curriculum graph schema (nodes, prerequisites, outcomes) and persist with Prisma.
  2. Implement Learning Path Engine using `services/azora-sapiens/src/engines/LearningPathEngine.ts`.
  3. Build AssessmentEngine & integrity checks (`services/azora-sapiens/src/engines/AssessmentEngine.ts`).
  4. Add credentialing and verifiable credential exports.
- Acceptance criteria:
  - Learning paths adapt to student progress and suggests nodes.
  - Assessment system can detect suspicious behavior and flag for review.
- Verification: QA with A/B tests on personalized learning outcomes.
- Artifacts: `services/azora-sapiens/`.
- Ownership: Education Team — Sapiens Room
- Effort: L — Priority: P1

... (Remaining Sapiens tasks: Exam integrity, plagiarism detection, research tools, classroom features)

---

## Azora Library (World-class)

### Task: Secure Ingestion & Provenance
- Objective: Build production-grade ingestion pipeline with license & provenance metadata.
- Dependencies: `services/azora-library`, `services/azora-sapiens` ingest modules.
- Steps:
  1. Create ingestion adapters (html, pdf, s3, blob, enterprise connectors).
  2. Validate licensing & provenance: store original citations, license text, and hash.
  3. Dedup: use document-level hashing + embeddings-based dedupe.
  4. Provide metadata exports & log for audit.
- Acceptance criteria: 100% provenance capture for ingested items; dedupe success for duplicates > 90% in test set.
- Verification: Integration tests, manual sample audits.
- Artifacts: `services/azora-library/`, `services/azora-sapiens/`.
- Ownership: Library Team — Library Room
- Effort: L — Priority: P1

... (Remaining Library tasks: indexing, summarization, personalization, citation graph & research API)

---

## Marketplace & Forge

### Task: Job/Task Matching & Escrow
- Objective: Implement the backend for Marketplace job posting, matching, escrow payments, and dispute resolution.
- Dependencies: `services/azora-marketplace`, `services/azora-pay`, `services/azora-mint`.
- Steps:
  1. Implement job posting API & matching algorithms (ML-based matchers). Store matching history.
  2. Implement escrow service (holds buyer funds) and payout logic.
  3. Add dispute resolution flow with evidence capture and court integration.
  4. Add reputation system with verifiable transactions.
- Acceptance criteria: Completed escrow + payout flows with testnet settlement and dispute lifecycle.
- Verification: Integration tests + legal review + contract audits.
- Artifacts: `services/azora-marketplace/`, `services/azora-pay/`, `services/azora-mint/`.
- Ownership: Marketplace Room
- Effort: L — Priority: P1

... (Remaining Marketplace tasks: reputation, NFT marketplace, forging flows)

---

## Mint & Pay

### Task: Wallets, Ledgers & Payout Engine
- Objective: Implement wallets (custodial/non-custodial), transaction ledger, auditability and payouts.
- Dependencies: `services/azora-pay`, `services/azora-mint`, `infrastructure/`.
- Steps:
  1. Implement a secure ledger with double-entry accounting for all funds.
  2. Integrate KYC/KYB for custodial wallets and build compliance reporting pipelines.
  3. Implement pay-in/pay-out flows; build test framework for settlements (testnet integrations).
- Acceptance criteria: Atomic transactions; full reconciliation reports; testnet settlement passes.
- Verification: Financial reconciliation tests + auditing.
- Artifacts: `services/azora-pay/`, `services/azora-mint/`, `infrastructure/azora-pay`.
- Ownership: Finance Room — Mint
- Effort: L — Priority: P1

---

## Enterprise Suite

### Task: SSO/SCIM & Policy-as-Code
- Objective: Implement enterprise SSO, SCIM provisioning, policies (OPA/Casbin) and governance APIs.
- Dependencies: `services/azora-auth/`, `packages/shared-auth/`, `infrastructure/`.
- Steps:
  1. Add SCIM endpoints in `services/azora-auth` and test with Okta/OneLogin test tenants.
  2. Implement policy-as-code using OPA/Casbin and integrate into enforcement middlewares for services.
  3. Create enterprise admin console in `apps/azora-enterprise-suite`.
- Acceptance criteria: SCIM provisioning with Okta, policy enforcement in API gateway.
- Verification: Integration tests + SCIM conformance tests.
- Artifacts: `services/azora-auth/`, `apps/azora-enterprise-suite/`.
- Ownership: Enterprise Room
- Effort: M — Priority: P1

---

## Constitutional AI Core

### Task: No Mock Enforcement & Constitutional Verification
- Objective: Implement constitutional checks and enforcement for agent-generated outputs and actions.
- Dependencies: `CONSTITUTION.md`, `services/constitutional-ai/`, `packages/shared-ai/`, `services/ai-orchestrator/`.
- Steps:
  1. Implement `services/constitutional-ai` microservice that evaluates action proofs against constitutional rules.
  2. Add an async verification pipeline that runs for every agent action touching persistent state.
  3. Add gates to Orchestrator that require a verify approval before action is permitted.
  4. Integrate into PR gates and CI checks (Constitutional CI gate).
- Acceptance criteria: 100% verification for stateful actions; PRs touching agent policies trigger a constitution check.
- Verification: Unit tests + simulated agent runs with invalid actions flagged.
- Artifacts: `services/constitutional-ai/`, CI workflow (PR gating).
- Ownership: Constitutional Room — Ops + Legal
- Effort: L — Priority: P1

Notes:
- The repo contains a No Mock Protocol Validator at `infrastructure/no-mock-validator.js`. It is executed in CI as part of the `deployment-ready` job.
- The validator ignores test files by default (common `__tests__`, `*.test.*`, `*.spec.*`) to avoid false positives for test mocks.
- To enable scanning of test files (in exceptional audits), set `ALLOW_MOCKS_IN_TESTS=1` in the CI environment or run locally with the env var set.
- For production code exceptions, prefer to add to `ALLOWED_MOCK_PATTERNS` with a clear justification and code review signoff. For temporary per-line exceptions, use `// NO_MOCK_EXCEPTION` on the line.

---

## Identity & Access

### Task: Roles & ABAC Implementation
- Objective: Implement RBAC/ABAC across services with audit trails and delegated admin flows.
- Dependencies: `services/azora-auth`, `packages/shared-auth`, `policy-as-code` infra.
- Steps:
  1. Standardize role schemas and save into main Postgres (Prisma-based).
  2. Add ABAC middleware to every service’s HTTP gateway.
  3. Add device trust & token revocation flows.
- Acceptance criteria: Successful ABAC enforcement and audit logging for policy changes.
- Verification: Integration tests and policy test harness.
- Artifacts: `services/azora-auth/`, `packages/shared-auth/`.
- Ownership: Identity & Access Team
- Effort: M — Priority: P1

---

## Data & Services

### Task: Schema & Migration Standardization (Prisma)
- Objective: Standardize and centralize schema migrations across services using Prisma and migration policies.
- Dependencies: `prisma/` folder and service-level `schema.prisma` files.
- Steps:
  1. Create a shared migration runner `scripts/db:migrate`.
  2. Add migration checks to CI and rollback strategies.
  3. Add versioned backup & restore runbooks for DBs.
- Acceptance criteria: Migrations always include safety checks, downtime windows, and tests.
- Verification: CI integration and war-room test migrations on staging.
- Artifacts: `prisma/`, `services/*/prisma/`.
- Ownership: Data & Services Room
- Effort: M — Priority: P1

---

## Frontend & Docs

### Task: Developer Docs & Onboarding
- Objective: Create a developer onboarding flow and docs that explain repo layout, running locally, and contributing rules.
- Dependencies: Root `README.md`, `packages/shared-*`, `apps/*`.
- Steps:
  1. Create `developer-onboarding.md` and `citadel-dev` docs inside a `docs/` folder.
  2. Add quickstart `scripts` for local dev (e.g., `npm run dev` for monorepo) and IaC steps.
  3. Add PR template with constitutional gates & testing checklist.
- Acceptance criteria: New dev can get running from fresh machine within one hour.
- Verification: Have a new engineer run the setup; adjust docs.
- Artifacts: `README.md`, `docs/developer-onboarding.md`.
- Ownership: DevX Room — BuildSpaces
- Effort: S — Priority: P1

---

## Infra & DevOps

### Task: CI/CD, IaC, and Environments
- Objective: Implement reproducible CI/CD (github actions), IaC definitions (terraform), and environment isolation (dev/stage/prod) with cost guardrails.
- Dependencies: `infrastructure/`, `monitoring/`, `deployments/`.
- Steps:
  1. Implement IaC modules in `infrastructure/` for core services.
  2. Add CICD workflows for multi-env deployment with `environments` settings and secrets.
  3. Setup cost thresholds & enforcement in CI.
- Acceptance criteria:
  - Environments deployable via IaC and GitHub workflows.
  - Rollback and blue/green deploy supported.
- Verification: CI run and test redeploys; disaster recovery drills.
- Artifacts: `infrastructure/`, `.github/workflows/`.
- Ownership: EOps Room — Infra & DevOps
- Effort: L — Priority: P1

---

## Observability & SRE

### Task: Dashboards & SLOs
- Objective: Define SLOs and create dashboards, alerts and runbooks for core SLA services.
- Dependencies: `monitoring/`, `services/*`.
- Steps:
  1. Define SLIs for orchestrator, library search, auth, payments.
  2. Implement Prometheus metrics, traces and central Grafana dashboards.
  3. Create runbooks and implement alerting flows.
- Acceptance criteria: SLO dashboards are visible, and runbooks exist; alert rules trigger correctly.
- Verification: Induce error rates and evaluate alerts.
- Artifacts: `monitoring/` and per-service metrics contributions.
- Ownership: SRE Room
- Effort: M — Priority: P1

---

## Security & Compliance

### Task: STRIDE Threat Modeling, DLP, and Incident Response
- Objective: Implement STRIDE threat modeling for each domain, integrate DLP, and build IR playbooks.
- Dependencies: `CONSTITUTION.md`, `packges/shared-infrastructure`, `monitoring/`.
- Steps:
  1. For each major domain create threat model documents.
  2. Implement DLP checks in ingestion pipelines and add alerts.
  3. Implement IR playbooks and test via tabletop exercises.
- Acceptance criteria: Threat models signed off; DLP policy blocks PII leakage and flags noncompliant cases.
- Verification: Tabletop exercises and DLP inclusion tests.
- Artifacts: `SECURITY/`, `CONSTITUTION.md`, `monitoring/`.
- Ownership: Security Room
- Effort: L — Priority: P1

---

## Cross-cutting Tasks

### Task: Constitutional CI Gates & No Mock Protocol Checks
- Objective: Implement gates for PRs that check for alignment, truth exposure, and ensure no fake services or placeholders are in production.
- Steps:
  1. Implement a GitHub Action `ci/constitutional-check` that runs `services/constitutional-ai` test harness.
  2. Enforce that any test with mocked upstreams is only allowed in specific test branches with a `MOCK` tag and audit annotation.
- Acceptance criteria: PRs with agent decision logic failing constitution checks are blocked.
- Artifacts: `.github/workflows/*` and `services/constitutional-ai/`.
- Ownership: Platform & Legal
- Effort: M — Priority: P1

---

### Task: Bolt Register (Identify and Fix)
- Objective: Catalog all "bolts" (known weak points), create mitigation tasks with root-cause analysis and validation steps.
- Dependencies: `monitoring/`, `services/*`, `CONSTITUTION.md`.
- Steps:
  1. Perform a bolt discovery sweep: audit services for risky assumptions (external provider locks, lack of verification, host LLM reliance, PII in embeddings).
  2. Create actionable mitigation tasks per bolt (e.g., multi-provider router, DLP enforcement, constitutional gates).
  3. Add CI checks to prevent bolt regressions.
- Acceptance criteria: Each bolt has a mitigation task in the main tracker with owner and validation tests.
- Verification: Bolt visible in SRE dashboards and PRs reference bolt fixes with automated tests.
- Artifacts: `monitoring/`, `SECURITY/`, `CONSTITUTION.md`.
- Ownership: Platform Security — All Rooms
- Effort: M — Priority: P1
  
#### Bolt Fix: Multi-Provider Model Router
- Objective: Replace single-provider reliance with a multi-provider router and provider cost control.
- Dependencies: `services/ai-routing`, `packages/shared-api/ai-router.ts`.
- Steps:
  1. Add provider abstraction and adapters for OpenAI, Azure OpenAI, and local model endpoints.
  2. Implement cost-aware routing & TTL for provider keys.
  3. Implement automatic failover and degrade-to-embedding approach for cost spikes.
  4. Add tests and observability for cost events.
- Acceptance criteria:
  - No single provider has an SLA that can block service.
  - Router supports failover in 10s.
- Verification: Simulate provider outage and cost spike in tests.
- Artifacts: `packages/shared-api/ai-router.ts`, `services/ai-routing/`.
- Ownership: AI Core — Platform
- Effort: M — Priority: P1

#### Bolt Fix: Agent Action Verification for Stateful Writes
- Objective: Prevent unauthorized or unverified agent writes to persistent stores.
- Dependencies: `services/ai-orchestrator`, `services/constitutional-ai`, `packages/shared-ai/`.
- Steps:
  1. Implement explicit `Action` objects for stateful operations with required metadata.
  2. Require a `VerificationProof` from `services/constitutional-ai` for any action that mutates persistent state.
  3. Add circuit-breaker patterns to block successive failing actions.
  4. Integrate action verification into `services/agent-execution` sandbox enforcement.
- Acceptance criteria:
  - 100% of persistent state mutations are associated with a verification proof.
  - Mutations without verification are blocked in staging and logged.
- Verification: E2E tests for typical agent flows and deliberate invalid state changes.
- Artifacts: `services/ai-orchestrator/`, `services/agent-execution/`, `services/constitutional-ai/`.
- Ownership: Orchestrator & Security Teams
- Effort: M — Priority: P1

#### Bolt Fix: PII in Embeddings / DLP Pipeline
- Objective: Prevent storing PII in embeddings and block the training pipeline until proper anonymization/consent is confirmed.
- Dependencies: `services/azora-sapiens/src/embeddings.ts`, `services/azora-library/`.
- Steps:
  1. Add DLP filter to ingestion pipeline that flags PII and removes or masks sensitive content.
  2. Add a consent management UI for users to allow PII to be used in embeddings (with explicit audit logs).
  3. Add training gates that require signed consent and constitutional checks prior to using dataset for training/fine-tuning.
  4. Add an automated test that simulates PII detection & blocking.
- Acceptance criteria:
  - No PII tokens recorded in embeddings without explicit consent.
  - Training pipelines must include a consent verification step.
- Verification: Scripted ingestion of sample PII documents should not add embeddings to the store.
- Artifacts: `services/azora-sapiens/`, `services/azora-library/`.
- Ownership: Knowledge Ocean & Security
- Effort: M — Priority: P1

---

### Task: PoV Minting Hooks & Contribution Rewards
- Objective: Implement proof-of-value hooks to mint contributions and trigger payouts with constitutional checks and reputational scoring.
- Dependencies: `services/azora-mint`, `services/azora-pay`, `services/azora-marketplace`, `services/azora-sapiens` (for academic contributions).
- Steps:
  1. Define PoV scoring criteria (impact, truth score, verifiability) and a schema for contribution events.
  2. Implement PoV scoring microservice that aggregates metrics and flags for minting eligibility.
  3. Build minting automation in `services/azora-mint` with testnet flows and verification via Constitutional AI.
  4. Implement payout engine and escrow release tied to minted events and dispute windows.
- Acceptance criteria: PoV events reliably produce mint candidates, minted tokens reflect verifiable contribution metrics, testnet flows completed.
- Verification: Financial audit logs, minted token metadata, community audit review.
- Artifacts: `services/azora-mint/`, `services/azora-pay/`, `services/azora-marketplace/`.
- Ownership: Marketplace + Finance Team — Forge Room
- Effort: L — Priority: P1

---

### Task: First 30 Days Plan — Implementation MIlestones (detailed)
- Week 1: Stabilize Orchestrator & Constitutional pipeline
  - Owner: AzStudio Orchestrator Room
  - Deliverables: `services/ai-orchestrator`, `services/constitutional-ai` basic gate
- Week 2: Identity (SSO/SCIM) & Lobby UX
  - Owner: Identity & BuildSpaces Rooms
  - Deliverables: `services/azora-auth`, `apps/app`, basic SSO integration & lobby
- Week 3: Library ingestion & RAG pipeline (core knowledge ocean)
  - Owner: Knowledge Ocean + Sapiens Room
  - Deliverables: `services/azora-library`, `services/azora-sapiens` ingestion + embedding
- Week 4: Marketplace + Mint basic flows (job posting and escrow)
  - Owner: Marketplace & Finance Rooms
  - Deliverables: `services/azora-marketplace`, `services/azora-pay`, `services/azora-mint`

---

### Risks & Unknowns
- Model Hosting & Cost: the cost of inference on 3rd party LLMs can be substantial; mitigation: multi-provider, caching, fallbacks.
- Legal/Regulatory for Minting: jurisdictional compliance is required, may need legal counsel per region.
- Data Privacy & PII in Embeddings: add DLP, PII filters and constitution checks; a strict No-Train-on-PII default should be enforced.

---

### Acceptance & Verification Strategy
- Continuous verification: Unit + Integration + e2e tests for critical flows; Constitutional CI gate for policy/agent changes.
- Observability: SLO dashboards and automated smoke tests per deployment.
- Governance: Community oversight + legal oversight for marketplace and mint.

---

### Delivery Handoff & Ownership Table
- A cross-room table will be maintained with owners for every domain (Room -> Team -> Owner). Use `citadel-dev/OWNERS.md` to keep the single source of truth.

---

End of Master Implementation Task List (expanded). Next steps: split each bold domain into a more granular ticket backlog with sub-tasks in a project management system (Jira/Notion/GitHub Projects), or export to `tasks/*.md` per domain.

---

## First 30 Days Plan (High Level)
- Week 1: Stabilize Orchestrator (Elara Core), `CONSTITUTION.md` checks on a sample agent; configure `monitoring/` for basic metrics.
- Week 2: Build the lobby and SSO integration (`services/azora-auth`) and align platform with RBAC.
- Week 3: Build Embeddings store & RAG pipeline; start ingestion for library with provenance checks.
- Week 4: Launch marketplace escrow + pay flow in staging; begin testnet minting process; configure runbooks & dashboards.

---

## Risks & Unknowns
- Complexity of building a world-class knowledge ocean and training pipelines; may require proprietary training resources and GPUs.
- External dependencies like model providers and payment processors may impose limits or costs.
- Legal and compliance needs across minting and marketplace may be jurisdiction specific.

---

End of Implementation Task List (draft). This list is intentionally comprehensive but can be expanded with more granular tasks and sub-tasks for each domain as needed.