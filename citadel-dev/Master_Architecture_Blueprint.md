# Azora Master Architecture Blueprint

> Level: Citadel (Enterprise) — Master Blueprint for Azora’s AI-native ecosystem

Summary:
- This master blueprint covers the Azora ecosystem: BuildSpaces, AzStudio/Elara, AI Family/Knowledge Ocean, Azora Sapiens/Library, Marketplace/Forge, Mint & Pay, Enterprise Suite, Constitutional AI Core, Identity & Access, Data & Services, Frontend & Docs, Infrastructure & DevOps, Observability & SRE, Security & Compliance.
- This is a textual C4 view (System/Container/Component), with domain models, data architecture, runtime topology, APIs, security considerations, SRE metrics, risk register, and bolt fixes.

Assumptions & Verification
- Everything described will use actual infra and production-grade services (no mocks; see `CONSTITUTION.md`).
- Default cloud provider is AWS/GCP; ensure per-service IaC choices follow `infrastructure/*`.
- Where repo references exist we link them; otherwise, tasks include creating production-grade replacements.

---

## System Overview (High-level)
- Mission: Build a world-class, AI-native, federated platform for learning, development, productivity, and enterprise operations.
- System boundaries: User-facing apps (web/mobile), services (AI orchestration, library, classroom, marketplace, minting/finance), infra/infra services (auth, databases, observability), constitutional verification layer, and external integrations (payment processors, model providers, training infra).
- Key non-functional goals: Security-by-design, privacy-first, alignment/truth, observability, SLOs, scalability, cost guardrails.

Major Domains:
- BuildSpaces (Virtual Campus) — Lobby, Room Framework, Code Chamber (Ascend Workbench IDE), Maker Lab, AI Studio, Design Studio, Collaboration Pods.
- AzStudio (Agent Orchestration) — Elara XO, Orchestrator Core, Skills Registry, Agent Lifecycle, Safety Rail systems.
- AI Family & Knowledge Ocean — Conversational AI, RAG pipeline, embedding store, memory/context managers, model registry, training pipelines.
- Azora Sapiens & Library — Curriculum graph, adaptive tutoring, secure exam engine, knowledge ingestion with licensing & provenance.
- Marketplace & Forge — Job/task marketplace, escrow, dispute resolution, NFTs, royalty rules, smart contracts.
- Mint & Pay — Wallet custody, ledgers, KYC/KYB-compliance, payouts, accounting integrations.
- Enterprise Suite — SSO, SCIM, policy-as-code, analytics, ERP integrations.
- Constitutional AI Core — Alignment scoring, No Mock enforcement, truth verification, audit log.
- Identity & Access — AuthN/AuthZ (NextAuth/SSO), RBAC/ABAC, device trust, secrets rotation.
- Data & Services — Databases, schemas, ETL/ELT, backups, data lineage.
- Observability & SRE — Logs/metrics/traces, dashboards, runbooks.

Repository cross references (non exhaustive):
- Orchestrator & Elara: `genome/elara-master-launcher.ts`, `services/ai-orchestrator` and `services/elara-incubator`.
- AI Routing: `packages/shared-api/ai-router.ts`, `services/ai-routing/` (see `package.json` in `services/ai-routing`).
- Azora Sapiens services: `services/azora-sapiens/` (includes `university-core.ts`, `knowledge-ocean.ts`, `ai` modules).
- Azora Library: `services/azora-library/`.
- Mint & Pay: `services/azora-mint/`, `services/azora-pay/` and `apps/azora-mint`, `apps/azora-pay`.
- BuildSpaces/IDE: `vscode-foundation/` and `apps/ascend`.
- Auth & Identity: `services/azora-auth/`, `packages/shared-auth/`.
- Monitoring: `monitoring/` (Prometheus/Grafana/Alertmanager), `monitoring/grafana/`.
- Infrastructure: `infrastructure/`, `infrastructure/aws/`, `infrastructure/azora-pay/`.
- The constitution: `CONSTITUTION.md`.

---

## C4: System Context (textual)
Actors:
- Human Users (developers, learners, students, educators, enterprise admins, buyers/sellers)
- Automated Agents (Elara Agents, marketplace bots)
- External Services (Payment processors, Identity providers, Model-hosting providers, GPU clusters, third-party APIs)

System Context Diagram (text):
- Users -> (Frontend Apps) -> (API Gateways) -> Back-end Services (AI Orchestrator, Library, Sapiens, Marketplace, Mint/Pay) -> Datastores & Observability -> IaC/Cloud Resources

---

## C4: Container View (text) - Per Domain (abridged)

### AzStudio & Orchestrator (Elara)
Containers:
- Orchestrator API (services/ai-orchestrator) — REST/gRPC endpoint for agent orchestration.
- Skills Registry (packages/shared-ai or `services/skills-registry`) — skill catalog and versioning (ebs or db + git).
- Agent Execution Pods (`services/agent-execution`) — Running environment for agents (k8s jobs, autoscaling, ephemeral containers), default fallbacks: in-memory runtime.
- Safety & Verification Pipeline (`services/constitutional-ai`) — constitutional verify microservice that validates agent actions and enforces NO_MOCK protocol.
- Workflow Engine — event-driven and supports durable tasks (e.g. Temporal/Open-Source equivalent).

APIs:
- /orchestrator/manage (POST): create agent run; returns runId. Auth: mutual TLS + JWT.
- /orchestrator/execute (POST): run one task; Enforced preconditions include `BaseAgent.validate`.
- /orchestrator/verify (POST): returns verification result against the constitution.

SLOs: 99.95% for orchestration operations; 100ms p95 exec latency for orchestration routing.

### AI Family & Knowledge Ocean
Containers:
- Model Router & Provider Adapters: packages/shared-api `ai-router.ts` and `services/ai-routing/`.
- Embedding Store: vector DB (pgvector/Milvus/Pinecone) and abstraction layer in `services/knowledge-ocean`.
- Retrieval & RAG Pipelines — `services/knowledge-ocean` plus `services/azora-sapiens/src/knowledge-ocean.ts`.
- Model Registry: container storing model metadata, versions, deployment, and policies.
- Training & GPU Pipeline: `ai-training` jobs + `model-registry` hooks.

Important Paths:
- `packages/shared-api/ai-router.ts` — Multi-Model router and AGENT_PROMPTS.
- `services/ai-routing` — Enterprise routing kit.
- `services/azora-sapiens/src/embeddings.ts` — embeddings implementation.

Security: model access control, API keys management (KMS), credentials scoped to job and TTR.

---

## C4: Component View (selected components)
- `orchestrator/core` -> Responsibilities: lifecycle, scheduling, load balancing, policy checks.
- `orchestrator/agents` -> Agents, per-instance metadata, sandboxed runtime.
- `ai-router/providers` -> Provider adapters, concurrency control, costs monitor.
- `knowledge-ocean/ingestor` -> Ingest, license checks, NLP extractors, metadata hashing, dedupe.
- `library/indexer` -> vector index ingestion job, documents metadata.

---

## Domain Model
- Bounded Contexts:
  - Agent Orchestration Context (orchestrator, agent lifecycle, verification)
  - Knowledge Ocean (ingest, index, retrieval, embeddings)
  - Education (Sapiens, curricula, course artifacts)
  - Marketplace/Payments (orders, escrow, payouts)
  - Governance (constitution rules, court, compliance)

- Aggregates & Entities (excerpt):
  - AgentRun (orchestrator): agentId, runId, state, owner, input, outputs, verificationProof
  - Document (Library): docId, source, license, ingestTime, digest, embeddings[]
  - LearningPath (Sapiens): pathId, nodes, prerequisites, adaptiveWeights
  - Transaction (Mint & Pay): txId, state, amount, onchainData, offchainLedger
  - Skill (Orchestrator): skillId, version, type, schema

- Events:
  - AgentCreated, AgentSucceeded, AgentFailed
  - DocumentIngested, DocumentIndexed
  - PaymentInitiated, PaymentSettled
  - CurriculumUpdated

---

## Runtime Topology
- Environments: Dev/CI, Staging, Prod. Each environment maps to a dedicated cloud account with infra isolation and scaled resources.
- Regions & Failover: Multi-region deployments (primary/secondary), region failover for critical services (Auth, Orchestrator, Library).
- On-Premise/Edge: Local training clusters and developer environments (BuildSpaces running in `vscode-foundation` container images).

---

## Data Architecture
- Primary stores:
  - RDBMS (Postgres) — transactional data, user accounts, roles, curricula, marketplace ledger.
  - Vector DB (pgvector or Milvus) — embeddings & similarity.
  - Object store (S3/GCS) — LFS, course media.
  - Cache (Redis) — sessions, rate-limiting, orchestration states.
  - Audit Logs (immutable store) — append-only with tamper-evident hashing.

- Schemas & Migrations: Use Prisma (look for `prisma/` and `prisma/schema.prisma`) across services (e.g. `services/azora-sapiens/prisma/schema.prisma` exists).
- Data Retention & Privacy: retention policies per-data-class; PII redaction pipelines; DLP checks prior to training (Constitutional gate).
- Backups & Recovery: daily snapshots for DB, multi-region replication; S3 versioning & lifecycle rules.
- Data Lineage: integrate with metadata service (OpenLineage) so all ingest & transform steps are captured.

---

## API & Contracts
- Use OpenAPI & gRPC IDL for public internal contracts.
- Auth: JWTs + OAuth2; mTLS for service-to-service.
- Rate-limits: per tenant with burst capacity; enforce in API Gateway.
- Error models: RFC7807 problem+json for errors. Each endpoint defines a standard HTTP5xx/4xx + error code catalog.

Examples:
- /api/v1/library/search?query=&embedding= (GET) -> 200: {hits[], meta}; supports cursor pagination, p95 under 250ms.
- /api/v1/orchestrator/execute -> 202 Accepted with a runId, asynchronous event webhook when done.

---

## Agent Orchestration & Elara
- Orchestration roles: Elara Master Launcher (`genome/elara-master-launcher.ts`) starts orchestration pods.
- Agent lifecycle: recognizePatterns -> reason -> validate (Constitutional) -> act (via `BaseAgent.validate` pipeline), documented in `packages/shared-ai` (see `DIVINE_LAW_PRINCIPLES`).
- Coordination Protocols: use event-based architecture (Kafka/Redis Streams/Temporal) to schedule and resume tasks.
- Safety rails: Constitutional verification step; proactive safety checks; step backups (opting to not mutate persistent state unless validated).

---

## Security Architecture
- Threat model: STRIDE-based for each domain.
- Identity: SSO & NextAuth in `services/azora-auth`, OAuth support, SCIM endpoints for enterprise.
- Secrets: KMS (AWS KMS/GCP KMS), secrets storage, automated rotation, policy enforcement using shared-infrastructure helpers.
- Storage encryption at rest for PII; TLS (1.3) in transit; mTLS for inter-service comms.
- Audit trails: immutable logs + signed hashes; append-only store for key events (mint, payouts, agent actions).
- Incident response: playbooks per service; runbooks in SRE; golden signals & alert thresholds.

---

## Compliance & Governance
- Constitutional hooks: every policy and agent action must capture a reasoned verification claim and validation score via Constitutional AI. The pipeline ensures any content that may have phrasings flagged as mock or misleading is escaped.
- Reporting: SLO dashboards, compliance dashboards, privacy/data export features (GDPR), DLP detections.
- Court integration: arbitration flow for disputes (marketplace), append-only logs for audit, signed evidence.

---

## Observability & SRE
- Core stack: Prometheus, Grafana, Loki, OpenTelemetry (tracing), Jaeger/Tempo.
- Dashboards: SLO dashboards for critical flows (orchestrator, auth, payments, library search).
- Alerts: On-call rotations, alert escalation, runbooks.
- SLOs & Error Budgets: define p99/p95 latencies + error budgets per key services.

---

## Developer Experience & CI/CD
- Repo layout: monorepo with `apps/`, `services/`, `packages/` (shared libs) and `infrastructure/` for IaC.
- Scaffolding: templates for new service, standard `Dockerfile`, `package.json`, GitHub Actions; Monorepo Linting/Conventional commits.
- CI gates: tests, lint, security scans, constitutional-gate (Constitutional AI check must pass on PRs that touch policy or agent decision code).
- Local Dev: `genome/elara-master-launcher.ts` for local launching of orchestrator.

---

## Dependencies & Risks
- Internal deps: `packages/shared-*` abstractions, `services/ai-routing`, `services/azora-cloud`.
- External deps: vector DB provider, cloud provider, OpenAI or other model providers, payment processors (Stripe, Coinbase), KMS providers.
- Replacement plans: open-source alternatives (Milvus for vector DB, local GPUs for model hosting) are recommended.

---

## Bolt Register (Known Issues & Mitigations)
- Bolt 1: Relying on third-party model provider (OpenAI) can cause cost spikes and hallucination. Mitigation: add multi-provider router and cost control, include truth verification steps.
- Bolt 2: Agent action permissions for sensitive DB writes. Mitigation: Require `Constitutional` validation and circuit-breakers, audit logs.
- Bolt 3: PII in embeddings. Mitigation: DLP filter and no-training-without-consent gate.

---

## Appendix: Sourcing & Links
- Repo entry points: `packages/shared-api/ai-router.ts`, `services/azora-sapiens/`, `services/azora-library/`, `services/azora-pay/`, `services/ai-routing/`, `genome/elara-master-launcher.ts`.
- Monitoring config: `monitoring/`, Grafana/Prometheus config.
- Constitution: `CONSTITUTION.md`.

Related Architecture Files (in `citadel-dev/architecture/`):
 - `C4_AzStudio.md`
 - `C4_Knowledge_Ocean.md`
 - `C4_Marketplace_Mint_Pay.md`
 - `C4_Azora_Sapiens.md`
 - `C4_Constitutional_AI.md`

Implementation Task Lists (in `citadel-dev/tasks/`):
 - `Master_Implementation_Task_List.md`
 - Per-domain tasks to be added as `tasks/*.md` as work progresses.

---

## Next Steps (High priority)
1. Review with stakeholders (product & SRE) and validate environment & compliance decisions.
2. Create the master implementation task list (in `citadel-dev/tasks`) linking each task to architecture and repo paths.
3. Add a programmatic checklist for constitutional gate and No Mock enforcement.

---

End of Master Architecture Blueprint (draft). Please review before we proceed to the detailed Implementation Task List.
