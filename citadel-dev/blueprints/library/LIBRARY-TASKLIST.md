# Azora Library – Domain Implementation Task List

> Status: Draft v0.1 (deep dive)
> Linked master task list: `citadel-dev/MASTER-IMPLEMENTATION-TASKLIST.md` (LIB-*, AI-*, DATA-*)

This list fans out LIB-* tasks from the master list and adds Research Center–specific work.

---

## 1. Ingestion, Licensing, and Provenance

- [ ] **LIB-1.1: Library Core Schema & Prisma Models (Bolt L‑B3)**  
  **Objective**: Establish canonical Prisma models for Library entities (Work, Edition, Resource, License, Source, CitationEdge, Collection).  
  **Parent**: LIB-1, DATA-1.  
  **Dependencies**: `prisma/schema.prisma`; Sapiens & Knowledge Ocean schemas.  
  **Steps**:  
  - Design entity relationships per Library blueprint §3.1.  
  - Add Prisma models and migrations; align naming with existing `Skill`/`LearningPath` where needed.  
  - Document model for use by ingestion and search services.  
  **Acceptance criteria**:  
  - Can represent at least 3 external sources and internal course packs in the schema.  
  - No conflicting or overloaded metadata fields.  
  **Verification**:  
  - Unit tests for schema-level invariants; migration tests.  
  **Artifacts**: Prisma models, schema docs.  
  **Ownership**: Library + Data Platform squads.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `prisma/schema.prisma`, `services/library-core/`.

- [ ] **LIB-1.2: License Engine v1 (Bolt L‑B2)**  
  **Objective**: Implement a machine‑readable licensing model and enforcement engine for Library resources.  
  **Parent**: LIB-1, CAI-2, SEC-2.  
  **Dependencies**: Legal input; policy‑as‑code engine; Library Core models.  
  **Steps**:  
  - Define a minimal set of license types and constraints (`can_view_fulltext`, `can_summarize`, `can_embed_in_ai`, `can_export_bulk`, `regions`).  
  - Implement license evaluation library used by Library Core and AI orchestration.  
  - Integrate with policy-as-code engine for complex cases.  
  **Acceptance criteria**:  
  - Every Resource has an associated License; APIs consistently enforce rights.  
  - AI services respect `can_embed_in_ai` and related flags.  
  **Verification**:  
  - Tests for license rules; simulated requests for constrained and unconstrained resources.  
  **Artifacts**: License schemas, enforcement library, policy docs.  
  **Ownership**: Library + Constitutional AI + Security squads.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `services/library-core/`, `services/ai-ethics-monitor/`, `SECURITY/`.

- [ ] **LIB-1.3: Ingestion Pipeline & Connectors**  
  **Objective**: Build robust ingestion pipeline with connectors for at least 2–3 key sources (e.g., arXiv‑like, internal Sapiens content, Git repos).  
  **Parent**: LIB-1.  
  **Dependencies**: Library Core schema; License Engine; Knowledge Ocean ingestion; ETL/ELT infra.  
  **Steps**:  
  - Scaffold `services/library-core/` ingestion workers.  
  - Implement connectors for prioritized sources, with metadata and license capture.  
  - Add normalization, deduplication, and error handling; write failures to dead‑letter queue.  
  **Acceptance criteria**:  
  - Ingestion of at least 10k works with <1% hard failures.  
  - All ingested resources have non‑null license and provenance.  
  **Verification**:  
  - Integration tests per connector; sample manual audits.  
  **Artifacts**: Workers, connector configs, runbooks.  
  **Ownership**: Library + Data Platform squads.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `services/library-core/`, `scripts/`, `monitoring/`.

---

## 2. Indexing, Search, and Retrieval

- [ ] **LIB-2.1: Search Index Writer & Hybrid Query Planner**  
  **Objective**: Implement indexing and query planning for combined lexical + semantic + graph search.  
  **Parent**: LIB-2, AI-2.  
  **Dependencies**: Search stack (Elasticsearch/OpenSearch); Knowledge Ocean; citation graph models.  
  **Steps**:  
  - Implement `IndexWriter` to push normalized docs and chunks into search + vector stores.  
  - Build `QueryPlanner` that decides between lexical/semantic/hybrid modes based on query features.  
  - Integrate citation graph for “related work” suggestions.  
  **Acceptance criteria**:  
  - P95 query latency < 300ms for typical searches; full hybrid queries < 600ms.  
  - Qualitative relevance validated against curated test queries.  
  **Verification**:  
  - Unit tests for planner; search evaluation harness; SLO dashboards.  
  **Artifacts**: Search service code, eval scripts, dashboards.  
  **Ownership**: Library + AI Platform squads.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `services/search-api/`, `services/knowledge-ocean/`, `monitoring/`.

- [ ] **LIB-2.2: Library UX for Search & Reader**  
  **Objective**: Provide first‑class UI for library search, filtering, and reading in BuildSpaces and Sapiens.  
  **Parent**: LIB-2.  
  **Dependencies**: Design system; BuildSpaces frontend; Sapiens integration.  
  **Steps**:  
  - Build search interface with filters and result previews.  
  - Implement Reader View with metadata, license info, and citation export.  
  - Hook into Sapiens (course reading lists) and Ascend (inline docs) as entry points.  
  **Acceptance criteria**:  
  - Learners can discover and consume library works with clear licensing and citation info.  
  - Sapiens can attach library works to lessons and assessments.  
  **Verification**:  
  - UX tests with learners/educators; a11y checks.  
  **Artifacts**: React components, navigation structure, docs.  
  **Ownership**: Library + Sapiens + Frontend squads.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `apps/azora-buildspaces/`, `packages/azora-ui/`.

---

## 3. Knowledge Ocean & RAG Integration

- [ ] **LIB-3.1: Library → Knowledge Ocean Ingestion Bridge**  
  **Objective**: Ensure all eligible Library content is chunked and embedded into Knowledge Ocean with correct metadata and licensing flags.  
  **Parent**: AI-2, LIB-1.  
  **Dependencies**: Knowledge Ocean service; License Engine; Library ingestion.  
  **Steps**:  
  - Implement a bridge that subscribes to `WorkIngested` events and triggers chunk/embedding jobs.  
  - Encode license constraints in embeddings metadata (e.g., `can_embed_in_ai`).  
  - Validate that restricted works are not used outside allowed contexts.  
  **Acceptance criteria**:  
  - 95%+ of non‑restricted works are present in vector store within defined freshness SLO.  
  - No policy violations in AI usage of restricted content.  
  **Verification**:  
  - Cross‑checks between Library DB and vector index; policy audits.  
  **Artifacts**: Bridge workers, metrics, compliance reports.  
  **Ownership**: Library + AI Platform + Constitutional AI squads.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `services/knowledge-ocean/`, `services/library-core/`.

- [ ] **LIB-3.2: Citation‑Aware RAG Responses**  
  **Objective**: Guarantee that AI answers which use Library content return correct citations and allow verification.  
  **Parent**: AI-2, CAI-1.  
  **Dependencies**: Ethics Monitor; Library search APIs; RAG pipeline.  
  **Steps**:  
  - Extend retriever to surface canonical `Work` IDs and sections in results.  
  - Implement answer composition templates that inject citations and reference lists.  
  - Add ethics checks for citation fabrication or inconsistency.  
  **Acceptance criteria**:  
  - RAG outputs always include citation list when library content is used.  
  - Automated audits detect and flag fabricated or broken citations.  
  **Verification**:  
  - Test harness that compares cited works vs actually retrieved contexts.  
  - Ethics Monitor metrics for citation integrity.  
  **Artifacts**: RAG templates, tests, dashboards.  
  **Ownership**: AI Platform + Library + Constitutional AI squads.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `services/knowledge-ocean/`, `services/ai-ethics-monitor/`.

---

## 4. Azora Research Center

- [ ] **ARC-1: Research Project & Dataset Models**  
  **Objective**: Implement `ResearchProject` and `Dataset` models and APIs as defined in Library blueprint §3.2.  
  **Dependencies**: Library Core; Sapiens `ResearchProject` design; data catalog.  
  **Steps**:  
  - Add Prisma models for research entities, including links to Library works and datasets.  
  - Implement CRUD APIs for projects and datasets with license and PII flags.  
  - Integrate with data catalog and policy engine for governance.  
  **Acceptance criteria**:  
  - Researchers can register projects and datasets with clear policies.  
  - Data access can be audited at project and dataset level.  
  **Verification**:  
  - API tests; governance checks.  
  **Artifacts**: Models, APIs, governance docs.  
  **Ownership**: Library + Sapiens + Data Platform squads.  
  **Effort**: L  
  **Priority**: P2  
  **Repo paths**: `services/research-center/`, `prisma/schema.prisma`.

- [ ] **ARC-2: Research Workspace Integration with BuildSpaces**  
  **Objective**: Provide BuildSpaces rooms and Ascend integrations for research projects (notebooks, code, datasets).  
  **Dependencies**: BS-4 (AI Studio), SAP-6.1, Ascend IDE.  
  **Steps**:  
  - Create Research Center views in BuildSpaces (project list, experiment dashboard).  
  - Link research projects to AI Studio rooms and Ascend workspaces.  
  - Expose dataset and library references inside IDE and notebooks.  
  **Acceptance criteria**:  
  - Researchers can open a project and immediately access datasets, code, and literature.  
  - Experiments are clearly linked back to project and library context.  
  **Verification**:  
  - E2E scenario tests (set up project → run experiment → log results).  
  **Artifacts**: UI components, integration glue, runbooks.  
  **Ownership**: Library + BuildSpaces + Ascend squads.  
  **Effort**: L  
  **Priority**: P2  
  **Repo paths**: `apps/azora-buildspaces/`, `apps/ascend/`, `services/research-center/`.

---

## 5. Governance, IP, and Compliance

- [ ] **LIB-5.1: IP & Licensing Policy-as-Code for Library**  
  **Objective**: Formalize IP/licensing rules and encode them in the policy engine for all Library and Research Center access paths.  
  **Parent**: CAI-2, SEC-2, LIB-1.2.  
  **Dependencies**: Policy engine; legal guidance; License Engine.  
  **Steps**:  
  - Draft and codify policies for open access vs restricted vs institutional content.  
  - Integrate policies into Library, Research Center, and AI usage checks.  
  - Provide governance UI and logs for policy decisions.  
  **Acceptance criteria**:  
  - Policy violations (e.g., disallowed export) are blocked and logged.  
  - Governance reports show compliance posture per collection/source.  
  **Verification**:  
  - Policy test suite; simulated access attempts.  
  **Artifacts**: Policy files, test cases, governance dashboards.  
  **Ownership**: Library + Constitutional AI + Security squads.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `services/ai-ethics-monitor/`, `services/library-core/`, `SECURITY/`.

---

## 6. Observability & Quality

- [ ] **LIB-6.1: Library Ingestion & Search Observability Pack**  
  **Objective**: Build observability around ingestion pipelines and search quality.  
  **Parent**: OBS-1, OBS-2, LIB-1.3, LIB-2.1.  
  **Dependencies**: Otel baseline; monitoring stack.  
  **Steps**:  
  - Instrument ingestion jobs with metrics (throughput, errors, backlog).  
  - Instrument search endpoints (latency, error rate, top queries).
  - Create dashboards for ingest health, index freshness, and query performance.  
  **Acceptance criteria**:  
  - On‑call staff can quickly diagnose ingestion or search issues.  
  - SLOs for Library search and ingestion are visible and alerting correctly.  
  **Verification**:  
  - Synthetic failures and latency injection; verify alerts and dashboards.  
  **Artifacts**: Dashboards, alert rules, runbooks.  
  **Ownership**: Library + SRE squads.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `monitoring/`, `services/library-core/`, `services/search-api/`.

---

## 7. PoV & Contribution Mechanics

- [ ] **LIB-7.1: Library Contribution → PoV Mapping**  
  **Objective**: Define and implement how curation, tagging, reviews, and dataset contributions translate into PoV events.  
  **Parent**: PAY-2, CAI-2, DATA-1.  
  **Dependencies**: PoV processor; Mint & Pay; Library contribution models.  
  **Steps**:  
  - Enumerate contribution types and impact weights (curation, review, tagging, reproducibility).  
  - Implement event emission from Library & Research Center for these contributions.  
  - Wire PoV processor to record contributions and trigger rewards.  
  **Acceptance criteria**:  
  - Contributors can see how their Library actions impact PoV and rewards.  
  - Minting logic is auditable and resistant to gaming.  
  **Verification**:  
  - Simulation of contribution patterns; gaming and abuse tests.  
  **Artifacts**: Contribution taxonomy, PoV rules, metrics dashboards.  
  **Ownership**: Library + Mint + Governance squads.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `services/library-core/`, `services/research-center/`, `services/pov-processor/`.

---

## 8. Activation Roadmap – Library & Research Center

- **Phase 1**: Schema + ingestion + basic search – LIB-1.1, LIB-1.3, LIB-2.1.  
- **Phase 2**: UX + Sapiens/Ascend integration – LIB-2.2, LIB-3.1.  
- **Phase 3**: RAG & citation integrity – LIB-3.2, AI-2, CAI-1.  
- **Phase 4**: Research Center core – ARC-1, ARC-2.  
- **Phase 5**: Governance, PoV, and observability – LIB-1.2, LIB-5.1, LIB-6.1, LIB-7.1.

Progress should be reflected in `citadel-dev` status docs and linked to Azora’s overall PoV and governance dashboards.
