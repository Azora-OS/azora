-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add vector column for embeddings
ALTER TABLE "knowledge_nodes" ADD COLUMN "embedding_vector" vector(1536);

-- Create index for vector similarity search
CREATE INDEX ON "knowledge_nodes" USING ivfflat (embedding_vector vector_cosine_ops) WITH (lists = 100);
