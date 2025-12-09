# Azora Citadel – Master Architecture Blueprint (v0.1)

> Status: Draft v0.1
> Repo: `azora/`
> Purpose: Single source-of-truth architecture for the Azora OS & Citadel ecosystem.

---

## 0. Principles, Constraints, Baseline

- **World-class standard**: Every domain (IDE, library, university, marketplace, payments, governance) must be competitive with best public analogues.
- **Constitutional guardrails**: AI_DEV_LAWS, Azora Constitution, Truth over Comfort, No Mock Protocol, Bolt Principle.
- **No Mock in prod**: Stubs allowed only in test/dev with explicit feature flags and CI enforcement.

### 0.1 Existing Technical Baseline (from repo)

- `docs/architecture/system-architecture.md` – core microservices stack:
  - API Gateway, Auth, Education, Finance; Node.js/TS, PostgreSQL, Redis, Kafka, Kubernetes, Istio, Prometheus, Grafana, ELK, Jaeger.
- `docs/architecture/VIRTUAL-CITADEL-ARCHITECTURE.md` – Virtual Citadel & BuildSpaces concept.
- `prisma/schema.prisma` – rich models for education, marketplace, finance, tokens, enterprise, AI family.
- `database/education-schema.sql` – legacy LMS schema.
- `blockchain/contracts/` – `AZRToken.sol`, `UbuntuGovernance.sol`.
- `services/ai-ethics-monitor/`, `services/ai-evolution-engine/` – Constitutional AI services.
- `monitoring/` – Prometheus, Grafana, Alertmanager config.
- `azstudio-archive/` – AzStudio architecture, verification gates, CI/CD.

> **Assumption A-1**: Some planned services (e.g., marketplace core, library core, mint-pay, azstudio-orchestrator) are not yet implemented; this blueprint defines their intended shape and repo locations under `services/`.

---

## 1. Domain Map & Bounded Contexts

| Domain                       | Description                                                | Primary / Planned Paths                                             |
|------------------------------|------------------------------------------------------------|----------------------------------------------------------------------|
| BuildSpaces (Virtual Campus) | Lobby + Rooms over all capabilities                       | `apps/azora-buildspaces/`, `services/buildspaces-orchestrator/`*    |
| Ascend Workbench (IDE)      | Codespaces-class IDE & Code Chamber                       | `apps/ascend/`, `apps/ascend-demo/`, `apps/ascend-vscode/`          |
| AzStudio (Orchestration)    | Elara XO, skills registry, agent orchestration             | `azstudio-archive/`, `services/azstudio-orchestrator/`*             |
| AI Family & Knowledge Ocean | Personas, RAG, memory, evals                              | `services/ai-ethics-monitor/`, `services/ai-evolution-engine/`, `services/knowledge-ocean/`* |
| Azora Sapiens (University)  | AI-run school/university                                   | `prisma/`, `database/`, `apps/azora-buildspaces/` (Sapiens views)   |
| Azora Library               | AI-native library & research stack                         | `data/knowledgeIndex.json`, `services/library-core/`*, `services/search-api/`* |
| Marketplace & Forge         | Talent & work marketplace                                 | `prisma/` (Job, Skill, JobApplication), `services/marketplace-core/`* |
| Mint & Pay                  | Wallets, ledgers, token economics                         | `prisma/` (Wallet, Transaction, Token*), `blockchain/`, `services/mint-pay/`* |
| Enterprise Suite            | SSO/SCIM, policy, analytics, integrations                 | `prisma/` (Enterprise*), `services/admin-dashboard/`, `services/enterprise-gw/`* |
| Constitutional AI Core      | Alignment, truth, No Mock enforcement                     | `services/ai-ethics-monitor/`, `blockchain/UbuntuGovernance.sol`    |
| Identity & Access           | AuthN/Z, secrets, device trust                            | Auth service (planned `services/auth-core/`*), `infrastructure/aws/` |
| Data & Services             | Schemas, storage, ETL/ELT, analytics                      | `prisma/`, `database/`, `data/`, `services/data-pipelines/`*        |
| Frontend & Docs             | Public sites, BuildSpaces UI, docs, design system         | `apps/*`, `packages/azora-ui/`, `docs/`, `citadel-dev/`             |
| Infra & DevOps              | CI/CD, environments, IaC, runtime config                  | `infrastructure/`, `.github/workflows/`, `scripts/`, `docker-compose*.yml` |
| Observability & SRE         | Logs, metrics, traces, alerts, runbooks                   | `monitoring/`, service logging, `docs/`                             |
| Security & Compliance       | Threat models, DLP, audits, policy-as-code                | `SECURITY/`, `services/ai-ethics-monitor/`, `infrastructure/aws/`   |

`*` = to be created. Implementation tasks reference these paths explicitly.

---

## 2. C4 System View (Top Level)

**Actors**: Learner/Builder, Educator, Enterprise Admin, Creator, Citadel Governance, External Systems (payment providers, ERPs, IdPs).

**Core systems**:

- **Virtual Citadel Web App** (`apps/azora-buildspaces/`): single entry point; hosts Lobby, Rooms, Sapiens & Library & Marketplace views.
- **Ascend & AzStudio** (`apps/ascend/`, `apps/ascend-vscode/`, `azstudio-archive/`): IDE + agent orchestration UX.
- **Azora Microservices Cluster** (Kubernetes, see `docs/architecture/system-architecture.md`): education, finance, marketplace, library, AI, enterprise.
- **Blockchain Layer** (`blockchain/`): AZRToken + UbuntuGovernance for PoV & governance.
- **Observability Stack** (`monitoring/`): Prometheus, Grafana, Alertmanager; log aggregation; tracing.

**High-level flows** (examples):

1. Learner enters Virtual Citadel → Auth → Lobby → Elara recommends a BuildSpace (e.g., Code Chamber, Sapiens Classroom).
2. Actions (enroll, learn, build, deploy, apply for jobs, transact) go through API Gateway → domain services.
3. AI interactions go through AzStudio Orchestrator → AI Family & Knowledge Ocean → Constitutional pipeline → back to user.
4. Key events emit domain and PoV events → Mint & Pay, Governance, Analytics.

---

## 3. Key Container Views (Summarised)

### 3.1 BuildSpaces & Sapiens

- **Frontend**: `apps/azora-buildspaces/` (Next.js, React, Tailwind, WebSockets).
- **BuildSpaces Orchestrator Service**: `services/buildspaces-orchestrator/` (room lifecycle, sessions, capabilities).
- **Education/LMS Service**: existing Education service described in `system-architecture.md` + `prisma` models.
- **Tutoring Engine**: `services/sapiens-tutor/`* (adaptive tutoring, exam modes, integrity checks).

### 3.2 Ascend Workbench & AzStudio

- **Ascend IDE**: `apps/ascend/`, `apps/ascend-demo/` (Monaco editor, terminal, live preview, VFS, Git).
- **VS Code Extension**: `apps/ascend-vscode/` (Elara and AzStudio integration for external IDE users).
- **Agent Execution Service**: `services/agent-execution/` (already present; runs commands, automations).
- **AzStudio Orchestrator**: `services/azstudio-orchestrator/`* (AIOrchestrator, skills registry, verification hooks).

### 3.3 AI Family & Knowledge Ocean

- **AI Family API**: `services/ai-family-api/`* (multi-persona chat, `AIPersonality`, `ChatSession` models).
- **Knowledge Ocean / RAG**: `services/knowledge-ocean/`* (ingestion, embeddings, retrieval, grounded answers).
- **Ethics Monitor**: `services/ai-ethics-monitor/` (alignment & constitutional scoring).
- **Evolution Engine**: `services/ai-evolution-engine/` (continuous eval & fine-tuning orchestration).

### 3.4 Marketplace & Mint & Pay

- **Marketplace Core**: `services/marketplace-core/`* (jobs, skills, applications using Prisma models).
- **Mint & Pay**: `services/mint-pay/`* (wallets, ledger, payouts, compliance reporting).
- **On-chain Bridge**: `services/onchain-bridge/`* (syncs critical PoV & rewards with `AZRToken.sol`, `UbuntuGovernance.sol`).

### 3.5 Enterprise, Identity, Security

- **Enterprise Gateway**: `services/enterprise-gw/`* (SSO/SCIM, org config from `Enterprise*` models).
- **Auth Core**: `services/auth-core/`* (NextAuth/OAuth, JWT, MFA, RBAC/ABAC).
- **Secrets & Policy Engine**: `infrastructure/aws/secrets-loader.ts`, Vault/KMS integration, policy-as-code for AI & data.

---

## 4. Data, APIs, and Runtime Topology (Summary)

- **Data**:
  - Primary: PostgreSQL via Prisma (`prisma/schema.prisma`).
  - Caching: Redis cluster.
  - Messaging: Kafka for domain & PoV events.
  - Search: Elasticsearch/OpenSearch.
  - Vector: pgvector/Weaviate/Qdrant (for Knowledge Ocean & Library).
  - Object storage: S3/R2 for content and artifacts.
- **APIs**:
  - REST at API Gateway for external; gRPC or internal REST between services.
  - WebSockets/WebRTC for collaboration and BuildSpaces presence.
  - Consistent auth (JWT/OAuth2), pagination, error envelope (`code`, `message`, `details`).
- **Runtime**:
  - Kubernetes with namespaces per domain; Istio service mesh; mTLS; HPA.
  - Multi-environment: dev, stage, prod; at least 2 regions for prod; automated failover.

---

## 5. Agent Orchestration & Constitutional Pipeline (Summary)

- **Elara XO** lives in AzStudio Orchestrator, reachable from BuildSpaces, Ascend, Sapiens, Library, Marketplace.
- **Flow**:
  1. Frontend → AzStudio Orchestrator with rich context (user, room, project, data sources).
  2. Orchestrator chooses skills & tools → model router (OpenAI, Anthropic, local models).
  3. **Pre-checks**: policy-as-code (No Mock, privacy, safety categories).
  4. Model call(s) → responses.
  5. **Post-checks**: AI Ethics Monitor, Knowledge Ocean grounding, truthfulness scoring.
  6. If approved: execute actions (code, mutations, messages); else: fix/escalate or ask clarifying questions.
  7. Log full decision trail for audit & PoV.

---

## 6. Security, Compliance, Observability (Summary)

- **Security**:
  - Central Auth, RBAC/ABAC; device & session security.
  - Secret management via Vault/KMS; no secrets in repo.
  - STRIDE threat models per domain; SAST/DAST in CI; dependency scanning.
- **Compliance & Governance**:
  - On-chain proposals for major policy & protocol changes via `UbuntuGovernance.sol`.
  - Policy-as-code for AI behavior, data residency, DLP.
  - Compliance reports from Mint & Pay, Enterprise Suite, and Ethics Monitor.
- **Observability & SRE**:
  - Logs: structured JSON, central log store.
  - Metrics: Prometheus; SLOs per domain (education, AI, payments, marketplace, governance).
  - Traces: OpenTelemetry across gateway, services, AI calls.
  - Dashboards & Alerts: Grafana + Alertmanager; documented runbooks in `docs/` and `citadel-dev/`.

---

## 7. Bolt Register (Loose Bolts, High-Level)

- **B-1 – AIOrchestrator Structural Debt**: existing `AIOrchestrator.ts` is known-broken; requires full refactor with tests and safety rails.
- **B-2 – Ethics Coverage Gaps**: AI Ethics Monitor not wired into all AI paths; must become mandatory middleware.
- **B-3 – Schema Duplication**: Prisma vs `database/education-schema.sql` divergence risk.
- **B-4 – Ledger Split**: On-chain vs off-chain ledgers for AZR & PoV; reconciliation not formalized.
- **B-5 – Stub/Mock Creep**: Historical use of stubs in AzStudio/agents; No Mock enforcement not encoded in CI.
- **B-6 – Incomplete Observability**: Not all services instrumented; no uniform Otel baseline.

Each bolt is mapped to specific tasks in `citadel-dev/MASTER-IMPLEMENTATION-TASKLIST.md`.

---

## 8. First 30-Day Architecture Goals (Summary)

1. **Stabilize Core**: Fix AIOrchestrator, wire ethics middleware to all AI calls, ensure basic SLOs & dashboards.
2. **Sapiens Spine**: End-to-end path from enrollment → adaptive tutoring → assessment → credentialing (MVP).
3. **Mint & PoV Spine**: Events from Sapiens/BuildSpaces/Marketplace → Mint & Pay → optional on-chain AZR/PoV.
4. **Library & Knowledge Ocean Spine**: Ingestion → indexing → RAG-backed answers in Sapiens & Ascend.

Implementation details live in the Master Implementation Task List; this blueprint defines the structural frame.
