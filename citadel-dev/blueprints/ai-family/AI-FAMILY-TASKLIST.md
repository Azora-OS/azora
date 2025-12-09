# AI Family & Knowledge Ocean – Domain Implementation Task List

> Status: Draft v0.1 (deep dive)  
> Linked master task list: `citadel-dev/MASTER-IMPLEMENTATION-TASKLIST.md` (AI-*, CAI-*, DATA-*, OBS-*)

This expands AI-* and CAI-* tasks into concrete work for personas, Knowledge Ocean, evaluation, and safety.

---

## 1. AI Family Service (Personas & Sessions)

- [ ] **AI-1.1: AI Family API Skeleton & Persona CRUD**  
  **Objective**: Scaffold `services/ai-family-api/` with health checks, CI, and basic persona/session APIs.  
  **Parent**: AI-1.  
  **Dependencies**: `AIPersonality`, `ChatSession`, `ChatMessage` models in Prisma; Auth Core.  
  **Steps**:  
  - Create service skeleton and wiring to Prisma.  
  - Implement CRUD for `AIPersonality` and basic chat session create/list/end APIs.  
  - Add multi‑tenant hooks for future enterprise scoping.  
  **Acceptance criteria**:  
  - Can register and update personas; can start and end sessions.  
  - All operations authenticated and logged.  
  **Verification**:  
  - Unit/integration tests; CI green.  
  **Artifacts**: Service code, API docs, tests.  
  **Ownership**: AI Platform squad.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `services/ai-family-api/`, `prisma/schema.prisma`.

- [ ] **AI-1.2: Session Memory & Privacy Controls (Bolt AF‑B3)**  
  **Objective**: Implement session and long‑term memory with clear privacy/consent semantics.  
  **Dependencies**: Policy engine; data catalog; Sapiens & Enterprise requirements.  
  **Steps**:  
  - Design `SessionMemory` and `LongTermMemory` schemas with TTLs and privacy flags.  
  - Implement APIs to read/write/delete memory; add user/org‑level controls.  
  - Ensure data catalog tags memory tables with sensitivity.  
  **Acceptance criteria**:  
  - Users can request memory reset/export; orgs can configure retention.  
  - Memory is not silently used for training beyond allowed scopes.  
  **Verification**:  
  - Tests for retention logic; simulated export/deletion requests.  
  **Artifacts**: Schemas, APIs, policy docs.  
  **Ownership**: AI Platform + Data + Security squads.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `services/ai-family-api/`, `services/data-catalog/`, `SECURITY/`.

---

## 2. Knowledge Ocean – Ingestion & Retrieval

- [ ] **AI-2.1: Knowledge Ocean Ingestion Pipeline**  
  **Objective**: Implement ingestion workers to normalize and chunk content from Library, Sapiens, code, and docs.  
  **Parent**: AI-2, LIB-1.3, SAP-1.  
  **Dependencies**: Library Core; LMS; docs; embedding provider.  
  **Steps**:  
  - Define `KnowledgeDocument` and `KnowledgeChunk` schemas.  
  - Implement connectors for Library, LMS, and repo/docs sources.  
  - Apply DLP and license checks before indexing.  
  **Acceptance criteria**:  
  - Ingests a critical mass of Azora docs, LMS content, and selected codebases.  
  - All chunks carry source and license metadata.  
  **Verification**:  
  - Integration tests per connector; coverage and freshness metrics.  
  **Artifacts**: Workers, configs, dashboards.  
  **Ownership**: AI Platform + Library + Sapiens squads.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `services/knowledge-ocean/`, `services/library-core/`, `services/sapiens-tutor/`.

- [ ] **AI-2.2: Hybrid Retriever & API**  
  **Objective**: Provide a hybrid (semantic + lexical + graph) retriever API optimized for Azora workloads.  
  **Parent**: AI-2, LIB-2.1.  
  **Dependencies**: Search index; vector DB; Library citation graph.  
  **Steps**:  
  - Implement retriever engine that queries both lexical and vector stores and merges results.  
  - Provide APIs for general queries and specialized tasks (tutoring, coding, research).  
  - Support per‑caller configs (Sapiens, Ascend, Library, Marketplace).  
  **Acceptance criteria**:  
  - RAG performance meets initial quality thresholds on golden tasks.  
  - Latency within SLOs for interactive usage.  
  **Verification**:  
  - Evaluation harness with metrics; latency tests.  
  **Artifacts**: Retriever code, configs, eval scripts.  
  **Ownership**: AI Platform + Library squads.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `services/knowledge-ocean/`, `services/search-api/`.

---

## 3. Safety & Policy (Constitutional AI Core)

- [ ] **CAI-1.1: AI Ethics Client Library & Middleware**  
  **Objective**: Provide a shared client for `services/ai-ethics-monitor/` and middleware patterns for all AI calls.  
  **Parent**: CAI-1.  
  **Dependencies**: Ethics Monitor; AI Family; AzStudio Orchestrator.  
  **Steps**:  
  - Implement a client SDK for registering AI calls and fetching alignment scores.  
  - Add middleware in AI Family & Knowledge Ocean services to call it on each response.  
  - Standardize error/violation handling hooks.  
  **Acceptance criteria**:  
  - 100% of AI Family & Knowledge Ocean responses are logged to Ethics Monitor.  
  - Downstream services can act on scores (block, retry, escalate).  
  **Verification**:  
  - Static analysis to check coverage; metrics comparing total AI calls vs monitored.  
  **Artifacts**: Client SDK, middleware, docs.  
  **Ownership**: Constitutional AI + AI Platform squads.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `services/ai-ethics-monitor/`, `services/ai-family-api/`, `services/knowledge-ocean/`.

- [ ] **CAI-2.1: Policy-as-Code for Personas & Memory (Bolt AF‑B2/B3)**  
  **Objective**: Encode policies governing persona behavior, allowed tools, and memory usage.  
  **Parent**: CAI-2.  
  **Dependencies**: Policy engine; persona taxonomy; legal/ethics input.  
  **Steps**:  
  - Define policy schema for personas (age restrictions, role, allowed assistance types).  
  - Encode memory usage rules (what can be persisted, for how long, and for what purpose).  
  - Integrate policy evaluation into AI Family startup and request handling.  
  **Acceptance criteria**:  
  - Personas cannot violate policy (e.g., tutor persona respects age‑based rules).  
  - Memory access and retention follow policy; violations logged.  
  **Verification**:  
  - Policy tests; simulated persona misbehavior scenarios.  
  **Artifacts**: Policy files, test cases, docs.  
  **Ownership**: Constitutional AI + AI Platform squads.  
  **Effort**: L  
  **Priority**: P2  
  **Repo paths**: `services/ai-ethics-monitor/`, `services/ai-family-api/`, `SECURITY/`.

---

## 4. Evaluation & Evolution

- [ ] **AI-4.1: Cross-Domain Evaluation Harness**  
  **Objective**: Build an evaluation framework in `services/ai-evolution-engine/` for Sapiens, Library, Marketplace, Mint & Pay tasks.  
  **Dependencies**: Evaluation datasets; domain owners; Ethics Monitor.  
  **Steps**:  
  - Collect and curate golden tasks per domain.  
  - Implement metrics (accuracy, faithfulness, fairness, alignment).  
  - Integrate with CI to run evals on model/prompt changes.  
  **Acceptance criteria**:  
  - Model/prompt changes cannot be deployed without passing eval gates.  
  - Dashboards show progress over time per domain.  
  **Verification**:  
  - Run evals on baseline models; validate metrics with domain experts.  
  **Artifacts**: Eval harness, datasets, dashboards.  
  **Ownership**: AI Platform + domain squads.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `services/ai-evolution-engine/`, `services/ai-family-api/`, `services/knowledge-ocean/`.

---

## 5. Observability

- [ ] **OBS-AI-5.1: AI Family & Knowledge Ocean Observability Pack**  
  **Objective**: Provide dashboards and alerts for AI Family & Knowledge Ocean health and quality.  
  **Parent**: OBS-1, OBS-2.  
  **Dependencies**: Otel instrumentation; metrics from AI services.  
  **Steps**:  
  - Instrument request/response metrics, model selection, retrieval metrics.  
  - Build dashboards for latency, error rates, token usage, retrieval hit rates, ethics scores.  
  - Define SLOs for latency and error budgets for core flows.  
  **Acceptance criteria**:  
  - On‑call can see AI substrate health and hotspots at a glance.  
  - Alerts on major regressions in alignment or retrieval quality.  
  **Verification**:  
  - Synthetic failures and regression tests; incident drills.  
  **Artifacts**: Dashboards, alerts, runbooks.  
  **Ownership**: AI Platform + SRE squads.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `monitoring/`, `services/ai-family-api/`, `services/knowledge-ocean/`.

---

## 6. Activation Roadmap – AI Family & Knowledge Ocean

- **Phase 1**: Baseline AI Family API & core personas – AI-1.1, AI-1.2.  
- **Phase 2**: Knowledge Ocean ingestion & retriever – AI-2.1, AI-2.2.  
- **Phase 3**: Constitutional integration – CAI-1.1, CAI-2.1.  
- **Phase 4**: Evaluation & CI gates – AI-4.1.  
- **Phase 5**: Full observability – OBS-AI-5.1.
