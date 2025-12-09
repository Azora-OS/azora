# C4 - Knowledge Ocean (Ingest, Embeddings, RAG, Memory)

## System View
- Purpose: Provide a scalable, privacy-aware, and auditable knowledge fabric for Azora: ingestion, licensing, indexing, vector store, retrieval, personalization & summarization.

## Containers
- Ingestor Pipelines (`services/azora-sapiens/src/sources/`)
  - Sources: Research, News, Market Feeds, Uploaded artifacts.
  - Preprocessing: image->text (OCR), enrich with metadata, license and provenance checks.
- Embedding Service
  - `services/azora-sapiens/src/embeddings.ts` handles embeddings creation and vector indexing.
  - Uses vector DB (pgvector/Milvus/Pinecone) for storage.
- Indexer & Dedup Service
  - Document hashing & dedup; chunking and metadata mapping.
- Retriever & RAG Kernel
  - Retrieval logic and prompt construction with context windows.
- Memory/Context Manager
  - Personalization: session-level & persistent memory per-user with TTL and privacy controls.
- Model Router & Provider Adapter
  - Location: `packages/shared-api/ai-router.ts`, `services/ai-routing/`.

## Component View
- Ingest Adapter
  - Converts document to canonical schema and stores the original asset in object storage.
- License Checker
  - Extracts license terms and flags noncompliant content.
- DLP Filter
  - Performs PII redaction and DLP checks before embedding.
- Vector Pipeline
  - Embeds, persists to vector db, and updates metadata store.
- Retriever
  - Query planning and retrieval scoring.
- RAG Composition
  - Prompt design, hallucination guard via verification pipeline.
- Index & Search API
  - Standardized API for `search`, `semanticSearch`, `similaritySearch`, and `getProvenance`.

## Data Model
- Document: {docId, source, ingestTime, license, digest, metadata, embeddingId}
- Chunk: {chunkId, docId, text, tokens, embeddingIds}
- Embedding: {embeddingId, vector, createdAt}

## Performance & Scale
- Snapshot & sharding strategy for vector DB; auto-scaling for ingestion pipelines.
- Batch vs streaming model for embeddings; maintain latency SLO of p95 < 300ms for small collections.

## Security & Privacy
- Never train or fine-tune on PII without explicit consent audit and legal approval.
- DLP checks on ingest.
- Use signed provenance chain for each ingested artifact.

## Observability
- Metrics:
  - ingestion_total, ingestion_failures, embedding_latency_seconds, retrieval_latency_seconds.
- Alerts on DSL failure rate > 1% or ingestion queue backlog > threshold.

## Implementation & Repo Cross-References
- `services/azora-sapiens/src/embeddings.ts` — embedding handlers.
- `services/azora-sapiens/src/knowledge-ocean.ts` — retrieval logic.
- `services/azora-library/` — ingestion & library public APIs.

## Acceptance Criteria
- End-to-end ingestion to retrieval pipeline validates license and DLP.
- RAG results have provenance with summarization quality measured against human baselines.

## Next Steps
- Design comprehensive test harnesses for ingestion formats.
- Add tool to compute `truthScore` for each retrieval relevant to constitutional gate.
