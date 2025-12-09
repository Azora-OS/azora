# AI Family & Knowledge Ocean – Domain Blueprint (Deep Dive)

> Status: Draft v0.1  
> Linked master docs:  
> - `citadel-dev/MASTER-ARCHITECTURE-BLUEPRINT.md` (AI Family, Knowledge Ocean)  
> - `citadel-dev/MASTER-IMPLEMENTATION-TASKLIST.md` (AI-*, CAI-*, DATA-*, OBS-*)

This blueprint covers the **AI Family** (personas like Elara and siblings) and the **Knowledge Ocean** (RAG substrate), which together power reasoning, tutoring, coding, research assistance, and orchestration across Azora.

---

## 1. Mission & Benchmarks

**Mission**: Provide an AI substrate where:

- Multiple personas (Elara XO, tutors, librarians, researchers, coaches) collaborate to help users learn, build, and discover.  
- All AI is **grounded** on trustworthy data (Library, LMS, code, telemetry).  
- Safety, truthfulness, and recourse are first‑class via Constitutional AI.

**Benchmarks**:

- User experience at least as capable as leading general assistants + code copilots + tutoring systems, but:  
  - Domain‑specialized to Azora’s stack and knowledge.  
  - Bound by strict constitutional rules (No Mock, Truth over Comfort, safety policies).  
- RAG quality on par with or better than best‑in‑class RAG stacks.

> Assumption AIF‑A1: We will use a mix of frontier LLMs and local/OSS models, chosen dynamically by AzStudio, but the Knowledge Ocean and policy‑as‑code layer are model‑agnostic.

---

## 2. C4 Views

### 2.1 System Context

**Actors**:

- **Learner, Educator, Builder, Researcher** – interact via Sapiens, Ascend, BuildSpaces, Library, Marketplace.  
- **Enterprise Admin & Citadel Teams** – configure policies, monitor usage, and analyze impact.  
- **External Model Providers** – OpenAI/Anthropic/OSS clusters; embedding providers.

**Systems**:

- **AI Family API** – multi‑persona chat & tools.  
- **Knowledge Ocean** – ingestion, chunking, embeddings, indexes, retriever.  
- **Constitutional Core** – Ethics Monitor + policy‑as‑code + governance.  
- **AzStudio Orchestrator** – task planning and tool routing using AI Family & Knowledge Ocean.  
- **Callers** – Sapiens, Ascend, BuildSpaces, Library, Marketplace, Mint & Pay, Research Center.

### 2.2 Container View

Key containers:

- **AI Family Service** (`services/ai-family-api/` – planned)
  - Hosts multi‑persona chat (`AIPersonality`, `ChatSession`, `ChatMessage` models).  
  - Handles persona selection, memory scoping, and session policies.

- **Knowledge Ocean Service** (`services/knowledge-ocean/` – planned)
  - Ingestion → normalization → chunking → embeddings → indexing.  
  - Hybrid retriever (semantic + lexical + graph) with Library hooks.

- **Eval & Evolution** (`services/ai-evolution-engine/` – existing)
  - Runs evaluation suites, A/B/C tests, and model routing experiments.  
  - Works closely with Knowledge Ocean and Ethics Monitor.

- **Ethics & Policy Engine** (`services/ai-ethics-monitor/` + policy layer)
  - Scoring for alignment, safety, fairness, and truthfulness.  
  - Enforces policy‑as‑code for AI behaviors.

---

## 3. Domain Model

### 3.1 Personas, Sessions, Memory

From Prisma `AIPersonality`, `ChatSession`, `ChatMessage` plus extensions:

- `AIPersonality` – persona metadata (name, role, traits, relationships, default tools).  
- `ChatSession` – conversation scope (user, persona, context, room/project links).  
- `ChatMessage` – message history with metadata (source, grounding metadata, evaluation results).

Potential extensions:

- `SessionMemory` – structured memory (facts, preferences, goals) with TTL and privacy flags.  
- `LongTermMemory` – cross‑session memory with explicit **opt‑in** and redaction capabilities.

### 3.2 Knowledge Items & Chunks

Knowledge Ocean builds on Library and domain data, but introduces chunk and index entities:

- `KnowledgeDocument` – normalized reference to content from Library, LMS, code repos, docs, telemetry.  
- `KnowledgeChunk` – minimal RAG unit with text, embedding vector ID, and metadata (source, section, license, tags).  
- `RetrieverConfig` – configuration for retrieval (weights, filters, ranking strategies).

Domain events examples:

- `PersonaUpdated`, `SessionStarted`, `SessionEnded`, `MemoryWritten`, `MemoryPurged`.  
- `KnowledgeDocumentIngested`, `KnowledgeChunksIndexed`, `RetrievalServed`.  
- `EvalRun`, `AlignmentScoreComputed`, `PolicyViolationDetected`.

---

## 4. Runtime Topology & Scaling

- **API layer**:  
  - AI Family and Knowledge Ocean run as horizontally scalable microservices with their own DBs and caches.  
  - All external model calls go through vetted routing modules.

- **Storage & Indexes**:  
  - Vector DB cluster (pgvector/Qdrant/Weaviate) for Knowledge Ocean.  
  - Search index (ES/OpenSearch) reused with Library for lexical retrieval.  
  - Separate stores for session history vs long‑term memory vs eval logs.

- **Isolation & tenancy**:  
  - Tenant‑aware indexes/indices where needed (e.g., enterprise‑scoped content).  
  - Strong logical separation between user segments.

---

## 5. Data, Privacy, and Consent

- **Data sources**:  
  - Library content, LMS, codebases, docs, monitoring data, limited personal preferences.  
  - Some data (e.g., chat logs, research data) is too sensitive for training/fine‑tuning and may be restricted to retrieval only.

- **Consent & control**:  
  - Users must have clear control over what is used for personalization vs global improvements.  
  - Organization admins control org‑level defaults and overrides.

- **Data minimization**:  
  - Only store what is needed for function and learning objectives.  
  - Summarize/aggregate when raw logs are no longer necessary.

---

## 6. AI Flows & Orchestration Patterns

- **Direct persona chat**:  
  - Caller (Sapiens, Ascend, BuildSpaces) hits AI Family with persona id, session id, and context; AI Family queries Knowledge Ocean where needed; Ethics Monitor scores; response returned with citations and reasoning traces where appropriate.

- **Tool‑augmented flows** (via AzStudio):  
  - AI Family personas act as planners and callers of tools (code runners, search, library lookups, data queries).  
  - Orchestrator enforces pre/post‑conditions and logs all tool uses.

- **Multi‑agent collaboration**:  
  - Certain tasks call multiple personas (e.g., tutor + researcher + security analyst) coordinated by AzStudio.

---

## 7. Safety, Ethics, and Governance

- **Ethics Monitor integration**:  
  - Every high‑impact or user‑visible AI call passes through `services/ai-ethics-monitor/` for classification and scoring.  
  - Risky outputs (self‑harm, extremism, harassment, disallowed advice) are blocked or escalated.

- **Truthfulness & No Mock**:  
  - Responses must be grounded in data; when not, they should explicitly indicate uncertainty.  
  - Fabricated citations or verifiable false statements are policy violations.

- **Governance hooks**:  
  - Aggregate metrics (alignment, fairness, incident counts) surfaced to governance dashboards.  
  - Major changes in model configurations, prompts, or policies go through governance workflows (UbuntuGovernance).

---

## 8. Observability & Evaluation

- **Metrics**:  
  - Latency, error rates, token usage, retrieval quality, hit/miss rates.  
  - Alignment/ethics scores over time and by domain.

- **Evaluation**:  
  - Golden tasks and datasets for Sapiens, Library, Marketplace, Mint & Pay.  
  - Continuous evaluation pipelines in `services/ai-evolution-engine/` for new models and prompts.

- **Tracing**:  
  - Full tracing from frontend → AzStudio → AI Family → Knowledge Ocean → external models → Ethics Monitor.

---

## 9. Bolt Register & Unknowns (AI Family & Knowledge Ocean)

- **AF‑B1**: Exact choice of vector DB and search tech not finalized; may have large impact on cost and quality.  
- **AF‑B2**: Persona taxonomy and governance process for new personas not fully defined.  
- **AF‑B3**: Memory policies (retention, redaction, cross‑session usage) must be aligned with legal and ethics but are not yet codified.  
- **AF‑B4**: Evaluation coverage may be uneven across languages, domains, and demographics.  
- **AF‑B5**: Model provider mix and fallback strategies not fully pinned down.

These are addressed via AI‑*, CAI‑*, DATA‑*, and OBS‑* tasks in `AI-FAMILY-TASKLIST.md` and the master task list.
