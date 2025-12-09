# Azora Library – Domain Blueprint (Deep Dive)

> Status: Draft v0.1
> Linked master docs:
> - `citadel-dev/MASTER-ARCHITECTURE-BLUEPRINT.md` (Library, AI Family & Knowledge Ocean)
> - `citadel-dev/MASTER-IMPLEMENTATION-TASKLIST.md` (LIB-*, AI-*, DATA-*, CAI-*)

This blueprint defines the world‑class Azora Library and its extension as the **Azora Research Center**, built on top of Library + Knowledge Ocean + Sapiens.

---

## 1. Mission & World‑Class Benchmarks

**Mission**: Build an AI‑native, civilization‑grade library and research fabric that:

- Aggregates and curates multi‑modal knowledge (text, code, audio, video, datasets) from trusted and community sources.
- Preserves **licensing, provenance, and IP constraints** end‑to‑end.
- Powers **RAG‑backed reasoning, summarization, and tutoring** for Sapiens, Ascend, and AzStudio.
- Serves as the core content substrate for the **Azora Research Center** – enabling reproducible, ethical research.

**Benchmarks**:

- Retrieval and discovery on par with or exceeding **Google Scholar, Semantic Scholar, arXiv, JSTOR, PubMed, O’Reilly**, etc.
- Research UX matching modern tools (e.g., ResearchRabbit/Connected Papers for graphing, Elicit/Scite for AI‑assisted reading), but under Azora’s constitutional AI rules.
- Library must be **RAG‑ready by design**: every ingested asset is chunked, embedded, and linked into Knowledge Ocean with rich metadata.

> Assumption L‑A1: We initially focus on STEM + entrepreneurship/finance + AI/CS domains, then broaden; licensing strategies will differ by domain and publisher.

---

## 2. C4 Views – Library & Research Center

### 2.1 System Context

**Actors**:

- **Learner** (via Sapiens & BuildSpaces) – searches, reads, watches, bookmarks, and cites materials.
- **Educator/Author** – curates collections, uploads resources, writes notes and problem sets.
- **Researcher** – conducts literature reviews, manages datasets, runs analyses in the Research Center.
- **Librarian/Curator** – manages ingestion pipelines, licensing, metadata quality.
- **External Systems** – publishers, repositories (arXiv, DOIs, code hosts), citation indexes.

**Systems**:

- **Azora Library Core** – catalog, licensing, provenance, deduplication.
- **Search & Retrieval Service** – semantic + lexical + graph search.
- **Knowledge Ocean / RAG** – embeddings, chunk storage, retriever APIs.
- **Azora Research Center** – research projects, experiment tracking, dataset access, integrated with BuildSpaces AI Studio.
- **Sapiens & Ascend** – consume Library & Knowledge Ocean for learning, IDE assistance, and research workflows.

### 2.2 Container View

Key containers:

- **Library Core Service** (`services/library-core/` – planned)
  - Manages `Work`, `Edition`, `Resource`, `Author`, `Collection`, `License`, `Source`, `CitationEdge` entities.
  - Exposes ingestion, catalog browse, metadata, and licensing APIs.

- **Search & Retrieval Service** (`services/search-api/` – planned)
  - Provides **lexical search** (via Elasticsearch/OpenSearch) and **semantic search** (via Knowledge Ocean).
  - Supports filters (topic, date, license, difficulty, modality) and ranking.

- **Knowledge Ocean / RAG** (`services/knowledge-ocean/` – planned)
  - Chunking, embeddings, hybrid retriever, RAG APIs.
  - Shares vector index between Library, Sapiens, Ascend.

- **Research Center Service** (`services/research-center/` – planned)
  - Manages research projects, datasets, experiment definitions, and access controls.
  - Ties into BuildSpaces AI Studio rooms and Ascend Workbench.

- **Frontend surfaces**:
  - **Library Portal & Research Center UI** – pages/views in `apps/azora-buildspaces/` for:
    - Library search & browse.
    - Reader view (PDFs, HTML, code, data summaries).
    - Citation graph explorer.
    - Research project dashboards and experiment notebooks.
  - **Ascend integration** – in‑IDE library search, code/documentation retrieval, citations in comments.
  - **Sapiens integration** – reading lists, inline citations, and RAG‑powered classroom tools.

### 2.3 Component View (Selected)

**Library Core**:

- `IngestionManager` – orchestrates ingestion jobs from sources with connectors.
- `LicenseEngine` – interprets and enforces licensing restrictions (open, educational, commercial, embargoed).
- `ProvenanceTracker` – maintains the chain of custody from source to edition/work.
- `DedupCanonicalizer` – merges duplicates across sources into canonical `Work` entities.

**Search & Retrieval**:

- `IndexWriter` – pushes normalized documents to search and vector indexes.
- `QueryPlanner` – decides mix of lexical/semantic/graph search based on user intent.
- `ResultReranker` – uses click and citation signals to rerank results.

**Research Center**:

- `ResearchProjectManager` – creates projects, attaches datasets and literature bundles.
- `ExperimentRegistry` – stores experiment configurations and results metadata.
- `AccessPolicyValidator` – checks IP/privacy policies (e.g., dataset licensing, IRB/ethics flags).

---

## 3. Domain Model

### 3.1 Library Entities

Proposed high‑level entities (Library adds to or complements Prisma):

- `Work` – abstract intellectual work (e.g., a paper, book, report, dataset).
- `Edition` – specific manifestation (publisher, year, format, language).
- `Resource` – concrete file or asset (PDF, HTML, code repo link, video file, dataset object path).
- `Author` – person or organization responsible for works.
- `Collection` – curated groupings (course pack, syllabus, theme, research bundle).
- `License` – rights and usage constraints (e.g., CC‑BY‑SA, proprietary, institutional, Azora‑owned).
- `Source` – ingestion origin (arXiv, publisher feed, GitHub repo, internal Sapiens content).
- `CitationEdge` – citation relationships between works (directed graph).
- `Tag` / `Topic` – classification and subject headings.

### 3.2 Research Center Entities

- `ResearchProject` – links to `Work`/`Dataset` references, Sapiens learners/educators, and experiments.
- `Dataset` – describes data assets, source, license, PII risk, and storage location.
- `Experiment` – run configuration, code reference, environment, metrics.
- `AccessPolicy` – restrictions and conditions for using datasets/content.

### 3.3 Relationships & Events

- One `Work` has many `Editions`, each with many `Resources`.
- `Collection` aggregates `Work` and `Dataset` references.
- `ResearchProject` references `Collection`, `Dataset`, `Experiment`.

Important events:

- `WorkIngested`, `WorkUpdated`, `EditionAdded`, `ResourceRemoved`.
- `LicenseChanged`, `PolicyViolationDetected`.
- `ResearchProjectCreated`, `ExperimentRun`, `DatasetAccessed`.

---

## 4. Runtime Topology & Scaling

- **Ingestion**:
  - Batch and streaming ingestion pipelines with queues (Kafka/Bull). 
  - Connectors for public sources (e.g., arXiv‑like, publisher APIs, Git repos) and internal Sapiens content.
- **Indexing**:
  - Search index cluster (Elasticsearch/OpenSearch) scaled by topic/tenant.
  - Vector store (pgvector/Qdrant/Weaviate) for Library + Knowledge Ocean.
- **Query**:
  - Stateless API layer scaling horizontally.
  - Caching of popular queries, collections, and reading lists.
- **Research workloads**:
  - Separate compute pools for heavy research jobs (notebooks, data processing) to protect core Library SLAs.

---

## 5. Data Architecture, Licensing, and Privacy

**Ingestion pipeline**:

1. **Acquire**: content fetched by connectors with metadata and license info.
2. **Normalize**: parse formats, extract text, structure, references, and identifiers (DOIs, ISBNs, repo URLs).
3. **Deduplicate**: cluster by title/authors/identifiers; merge into canonical `Work`.
4. **Classify & tag**: topics, difficulty, intended audience.
5. **Chunk & embed**: break into RAG‑ready chunks; compute embeddings.
6. **Index**: push to lexical and vector search, plus Knowledge Ocean.

**Licensing & IP**:

- Licenses stored as first‑class entities with machine‑readable constraints (e.g., `can_summarize`, `can_finetune`, `can_show_fulltext`, `region_restrictions`).
- Access checks enforced:
  - In API layer (e.g., excerpt vs full text).
  - In AI orchestration (e.g., no finetuning on restricted content, summarization limited to allowed contexts).

**Privacy**:

- For datasets and certain works (e.g., containing personal data), library must enforce data classification and access restrictions, integrated with the data catalog and policy engine.

> Assumption L‑A2: Some content will have explicit “no AI training” or “education‑only” clauses; these must be honored and represented in policy‑as‑code.

---

## 6. AI Orchestration & RAG

The Library is the primary **grounding source** for Azora’s RAG and research assistance.

- **RAG flows**:
  - Sapiens and Ascend call Knowledge Ocean with queries referencing Library works.
  - Retriever uses Library metadata to filter and prioritize authoritative sources.
  - Answers must include **citations and links** back to Library entries; no free‑floating text.

- **Summarization & multi‑modal UX**:
  - Summaries, highlight extraction, comparison tables, and concept maps built over Library content.
  - For videos and audio, transcripts produced and aligned with Library entries.

- **Personalization**:
  - Query and click logs (with privacy protections) used to improve ranking and suggestions.
  - Sapiens learner profiles integrated: recommendations tuned to current learning paths.

- **No Mock & Truth over Comfort**:
  - AI agents must either cite Library (or other approved sources) or declare uncertainty.
  - Fabricated citations are treated as critical violations and surfaced to Ethics Monitor.

---

## 7. Security, Compliance, and Ethics

- **IP compliance**:
  - Clear mapping between each `Resource` and its license.
  - DLP filters prevent downloading or exporting content beyond rights (e.g., whole‑corpus dumps where disallowed).
- **Access control**:
  - Role‑ and institution‑aware access rules (e.g., some collections only for partner universities or enterprises).
  - Rate limits per user, org, and API key; special safeguards for bulk access.
- **Research ethics**:
  - Research Center ensures datasets and tools used in projects are approved (e.g., for PII, medical data).
  - Integration with Constitutional AI policies for high‑risk domains (health, finance, political data).

---

## 8. Observability & Quality Metrics

- **Operational metrics**:
  - Ingestion throughput, error rates, backlog size.
  - Index freshness (time from source change to queryable state).
  - Query latency and success/error rates.

- **Quality metrics**:
  - Clickthrough and dwell time for top queries.
  - Citation usage in Sapiens and Ascend outputs.
  - Feedback on search results (relevance voting, “find similar” behavior).

Dashboards and alerts: part of `monitoring/grafana/` and owned by Library + SRE squads.

---

## 9. PoV & Minting Hooks – Library & Research Center

- **PoV sources**:
  - Curating high‑quality collections, tagging, and reviews.
  - Contributing open educational resources and research datasets.
  - Peer review activities and reproducibility checks in Research Center.

- **Mechanics**:
  1. Library and Research Center emit events for contributions and impact (e.g., `WorkCurated`, `ReviewAccepted`, `DatasetCited`).
  2. `services/pov-processor/` aggregates and scores contributions.
  3. Validated contributions award PoV and potentially AZR via Mint & Pay and AZRToken.

Governance: PoV rules for library contributions defined via policy‑as‑code and UbuntuGovernance.

---

## 10. Library & Research Center Bolt Register & Unknowns

- **L‑B1**: Source coverage strategy unclear (which publishers/repos and in what order) – requires product & legal prioritization.
- **L‑B2**: Licensing machine‑readable standards and enforcement engine not yet implemented.
- **L‑B3**: No current schema for Library entities; risk of ad‑hoc metadata in JSON blobs.
- **L‑B4**: Research data governance policies (especially PII) under‑specified; ties to data catalog and policy engine.
- **L‑B5**: RAG quality measurement (truthfulness, citation correctness) not yet formalized.

Unknowns to resolve via tasks and governance:

- Which external repositories and publishers to integrate first.
- Level of on‑chain representation for works, citations, and research outputs (if any).
- Tiering model for free vs paid vs institutional access.
